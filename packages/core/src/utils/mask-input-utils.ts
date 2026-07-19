import type { MaskToken } from '../types/mask-input'

export const DEFAULT_MASK_TOKENS: Record<string, MaskToken> = {
  '#': { pattern: /[0-9]/ },
  a: { pattern: /[a-zA-Z]/ },
  '*': { pattern: /[a-zA-Z0-9]/ }
}

export type MaskSpecEntry =
  | { kind: 'token'; token: MaskToken }
  | { kind: 'fixed'; char: string }

/**
 * Parse a mask template into a positional spec. `!` escapes the next
 * character to a fixed literal; unknown characters are fixed literals.
 */
export function parseMask(mask: string, tokens?: Record<string, MaskToken>): MaskSpecEntry[] {
  const tokenMap = { ...DEFAULT_MASK_TOKENS, ...tokens }
  const spec: MaskSpecEntry[] = []
  let escaped = false
  for (const char of mask) {
    if (escaped) {
      spec.push({ kind: 'fixed', char })
      escaped = false
      continue
    }
    if (char === '!') {
      escaped = true
      continue
    }
    const token = tokenMap[char]
    spec.push(token ? { kind: 'token', token } : { kind: 'fixed', char })
  }
  return spec
}

export function countMaskTokens(spec: MaskSpecEntry[]): number {
  let count = 0
  for (const entry of spec) {
    if (entry.kind === 'token') count += 1
  }
  return count
}

export interface MaskFormatResult {
  /** Canonical raw value (invalid characters dropped, overflow truncated) */
  rawValue: string
  /** Formatted value with fixed characters eagerly inserted */
  maskedValue: string
  /** Whether every token slot is filled */
  completed: boolean
}

/**
 * Format a raw value against the spec. Characters that do not match their
 * token slot are dropped, overflow beyond the last token is truncated, and
 * fixed characters immediately following an accepted character are appended
 * eagerly (typing `12` against `##/##` yields `12/`).
 */
export function formatMaskValue(raw: string, spec: MaskSpecEntry[]): MaskFormatResult {
  let maskedValue = ''
  let rawValue = ''
  let fixedBuffer = ''
  let rawPos = 0
  let filled = 0
  const chars = Array.from(raw)

  for (const entry of spec) {
    if (entry.kind === 'fixed') {
      fixedBuffer += entry.char
      continue
    }
    let accepted: string | undefined
    while (rawPos < chars.length) {
      const candidate = chars[rawPos]
      rawPos += 1
      const transformed = entry.token.transform ? entry.token.transform(candidate) : candidate
      if (entry.token.pattern.test(transformed)) {
        accepted = transformed
        break
      }
    }
    if (accepted === undefined) break
    maskedValue += fixedBuffer + accepted
    fixedBuffer = ''
    rawValue += accepted
    filled += 1
  }

  const totalTokens = countMaskTokens(spec)
  // Eager trailing fixed characters, but never render a bare fixed prefix
  if (rawValue.length > 0 && fixedBuffer) {
    maskedValue += fixedBuffer
  }
  return { rawValue, maskedValue, completed: totalTokens > 0 && filled === totalTokens }
}

/**
 * Loosely extract the raw characters from a (possibly dirty) masked string:
 * characters matching the fixed literal at the current spec position are
 * skipped, characters accepted by the next token slot are kept, everything
 * else is dropped. `upTo` limits extraction to the first `upTo` characters
 * (used for caret mapping).
 */
export function extractRawValue(masked: string, spec: MaskSpecEntry[], upTo?: number): string {
  let raw = ''
  let specIdx = 0
  const limit = upTo === undefined ? masked.length : Math.min(upTo, masked.length)

  for (let i = 0; i < limit; i++) {
    const char = masked[i]
    if (specIdx < spec.length) {
      const entry = spec[specIdx]
      if (entry.kind === 'fixed' && entry.char === char) {
        specIdx += 1
        continue
      }
    }
    // Find the next token slot at or after the current position
    let tokenIdx = specIdx
    while (tokenIdx < spec.length && spec[tokenIdx].kind === 'fixed') tokenIdx += 1
    if (tokenIdx >= spec.length) break
    const entry = spec[tokenIdx] as Extract<MaskSpecEntry, { kind: 'token' }>
    const transformed = entry.token.transform ? entry.token.transform(char) : char
    if (entry.token.pattern.test(transformed)) {
      raw += transformed
      specIdx = tokenIdx + 1
    }
    // Non-matching characters are dropped without advancing the spec
  }
  return raw
}

/**
 * Masked-string caret position sitting after the `rawIndex`-th raw character,
 * including eagerly inserted fixed characters that follow it.
 */
export function getMaskCaretPosition(spec: MaskSpecEntry[], rawIndex: number): number {
  if (rawIndex <= 0) return 0
  let pos = 0
  let tokens = 0
  for (let i = 0; i < spec.length; i++) {
    pos += 1
    if (spec[i].kind !== 'token') continue
    tokens += 1
    if (tokens === rawIndex) {
      // Include immediately following fixed characters (eager insertion)
      for (let j = i + 1; j < spec.length && spec[j].kind === 'fixed'; j++) {
        pos += 1
      }
      return pos
    }
  }
  return pos
}

export interface MaskApplyResult {
  rawValue: string
  maskedValue: string
  /** Caret position within `maskedValue` after the edit */
  caret: number
  completed: boolean
}

/**
 * Single entry point for input events: takes the edited DOM value and caret,
 * re-extracts the raw value, reformats, and remaps the caret. When
 * `previousMasked` is provided and the edit was a deletion that removed only
 * fixed characters (reformatting would undo it), the raw character before the
 * caret is deleted as well — this is what makes Backspace over a separator
 * (`12/` → Backspace) delete the `2` instead of bouncing back to `12/`.
 */
export function applyMaskInput(
  inputValue: string,
  caret: number,
  spec: MaskSpecEntry[],
  previousMasked?: string
): MaskApplyResult {
  let raw = extractRawValue(inputValue, spec)
  let rawBeforeCaret = extractRawValue(inputValue, spec, caret).length
  let result = formatMaskValue(raw, spec)

  if (
    previousMasked !== undefined &&
    inputValue.length < previousMasked.length &&
    result.maskedValue === previousMasked &&
    rawBeforeCaret > 0
  ) {
    raw = raw.slice(0, rawBeforeCaret - 1) + raw.slice(rawBeforeCaret)
    rawBeforeCaret -= 1
    result = formatMaskValue(raw, spec)
  }

  const caretPos = Math.min(getMaskCaretPosition(spec, rawBeforeCaret), result.maskedValue.length)
  return {
    rawValue: result.rawValue,
    maskedValue: result.maskedValue,
    caret: caretPos,
    completed: result.completed
  }
}
