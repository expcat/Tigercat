/**
 * Highlight utility functions
 *
 * Keyword/regex matching and class builders shared by the Vue and React
 * Highlight implementations. Helpers are string-only so they stay safe to
 * evaluate during server-side rendering. Matching never uses DOM APIs.
 */

import {
  DEFAULT_HIGHLIGHT_CASE_SENSITIVE,
  DEFAULT_HIGHLIGHT_GLOBAL,
  type HighlightKeywords,
  type HighlightMatchOptions,
  type HighlightRange,
  type HighlightSegment
} from '../types/highlight'
import { classNames } from './class-names'

/**
 * Root span. Stays inline so Highlight can sit inside Text like Kbd/Code.
 */
export const highlightRootClasses = 'tiger-highlight'

/**
 * Semantic mark chrome. Mixes `--tiger-warning` so inherited text stays
 * readable in both color schemes, without Tag border or warning foreground.
 */
export const highlightMarkClasses =
  'tiger-highlight-mark rounded-[var(--tiger-radius-sm,0.375rem)] bg-[var(--tiger-warning,#d97706)]/20 px-0.5 text-inherit box-decoration-clone'

const REGEXP_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g

/**
 * Escape a string keyword so it is matched literally.
 */
export function escapeHighlightKeyword(keyword: string): string {
  return keyword.replace(REGEXP_SPECIAL_CHARS, '\\$&')
}

/**
 * Normalize `keywords` into a list of string/RegExp queries.
 * Non-string, non-RegExp entries are ignored.
 */
export function normalizeHighlightKeywords(
  keywords?: HighlightKeywords | null
): Array<string | RegExp> {
  if (keywords == null) return []

  if (typeof keywords === 'string' || keywords instanceof RegExp) {
    return [keywords]
  }

  if (!Array.isArray(keywords)) return []

  const result: Array<string | RegExp> = []
  for (const item of keywords) {
    if (typeof item === 'string' || item instanceof RegExp) {
      result.push(item)
    }
  }
  return result
}

/**
 * Resolve case matching, falling back to {@link DEFAULT_HIGHLIGHT_CASE_SENSITIVE}.
 */
export function resolveHighlightCaseSensitive(value?: boolean): boolean {
  if (typeof value === 'boolean') return value
  return DEFAULT_HIGHLIGHT_CASE_SENSITIVE
}

/**
 * Resolve global matching, falling back to {@link DEFAULT_HIGHLIGHT_GLOBAL}.
 */
export function resolveHighlightGlobal(value?: boolean): boolean {
  if (typeof value === 'boolean') return value
  return DEFAULT_HIGHLIGHT_GLOBAL
}

/**
 * Resolve the searchable source text. An explicit `text` prop, including an
 * empty string, wins over flattened slot/children fallback.
 */
export function resolveHighlightText(text?: string | null, fallback?: string | null): string {
  if (text != null) return text
  if (fallback != null) return fallback
  return ''
}

function cloneRegExp(source: RegExp, global: boolean): RegExp | null {
  const withoutG = source.flags.replace(/g/g, '')
  const flags = global ? `${withoutG}g` : withoutG
  try {
    return new RegExp(source.source, flags)
  } catch {
    return null
  }
}

function collectRegExpRanges(text: string, pattern: RegExp, global: boolean): HighlightRange[] {
  const ranges: HighlightRange[] = []
  if (!text) return ranges

  try {
    if (!global) {
      const match = pattern.exec(text)
      if (match && match[0].length > 0) {
        ranges.push({ start: match.index, end: match.index + match[0].length })
      }
      return ranges
    }

    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    let steps = 0
    const limit = text.length + 2
    while ((match = pattern.exec(text)) !== null) {
      if (++steps > limit) break
      if (match[0].length === 0) {
        pattern.lastIndex += 1
        if (pattern.lastIndex > text.length) break
        continue
      }
      ranges.push({ start: match.index, end: match.index + match[0].length })
    }
  } catch {
    return []
  }

  return ranges
}

function collectStringRanges(
  text: string,
  keyword: string,
  caseSensitive: boolean,
  global: boolean
): HighlightRange[] {
  if (!keyword) return []
  const flags = `${global ? 'g' : ''}${caseSensitive ? '' : 'i'}`
  let pattern: RegExp
  try {
    pattern = new RegExp(escapeHighlightKeyword(keyword), flags)
  } catch {
    return []
  }
  return collectRegExpRanges(text, pattern, global)
}

function sanitizeRange(range: HighlightRange, length: number): HighlightRange | null {
  const start = Math.max(0, Math.min(range.start, length))
  const end = Math.max(0, Math.min(range.end, length))
  if (end <= start) return null
  return { start, end }
}

/**
 * Merge overlapping or adjacent ranges into a stable, sorted list.
 */
export function mergeHighlightRanges(ranges: readonly HighlightRange[]): HighlightRange[] {
  if (ranges.length === 0) return []

  const sorted = ranges
    .map((range) => ({ start: range.start, end: range.end }))
    .sort((left, right) => left.start - right.start || left.end - right.end)

  const merged: HighlightRange[] = [{ ...sorted[0] }]
  for (let index = 1; index < sorted.length; index++) {
    const current = sorted[index]
    const last = merged[merged.length - 1]
    if (current.start <= last.end) {
      if (current.end > last.end) last.end = current.end
    } else {
      merged.push({ ...current })
    }
  }
  return merged
}

/**
 * Find stable match ranges for `text` against `keywords`.
 *
 * String keywords are escaped and honor `caseSensitive`/`global`.
 * Regular expressions keep their own flags except `g`, which follows `global`.
 * Empty keywords, zero-length matches, and invalid patterns are skipped.
 * The original RegExp `lastIndex` is not mutated.
 */
export function findHighlightRanges(
  text: string,
  keywords?: HighlightKeywords | null,
  options: HighlightMatchOptions = {}
): HighlightRange[] {
  if (!text) return []

  const caseSensitive = resolveHighlightCaseSensitive(options.caseSensitive)
  const global = resolveHighlightGlobal(options.global)
  const queries = normalizeHighlightKeywords(keywords)
  const collected: HighlightRange[] = []

  for (const query of queries) {
    if (typeof query === 'string') {
      collected.push(...collectStringRanges(text, query, caseSensitive, global))
      continue
    }

    const pattern = cloneRegExp(query, global)
    if (!pattern) continue
    collected.push(...collectRegExpRanges(text, pattern, global))
  }

  const sanitized: HighlightRange[] = []
  for (const range of collected) {
    const next = sanitizeRange(range, text.length)
    if (next) sanitized.push(next)
  }

  return mergeHighlightRanges(sanitized)
}

/**
 * Split source text into highlighted and plain segments.
 */
export function getHighlightSegments(
  text: string,
  keywords?: HighlightKeywords | null,
  options: HighlightMatchOptions = {}
): HighlightSegment[] {
  if (!text) return []

  const ranges = findHighlightRanges(text, keywords, options)
  const segments: HighlightSegment[] = []
  let cursor = 0

  for (const range of ranges) {
    if (range.start > cursor) {
      segments.push({
        text: text.slice(cursor, range.start),
        highlighted: false,
        start: cursor,
        end: range.start
      })
    }
    segments.push({
      text: text.slice(range.start, range.end),
      highlighted: true,
      start: range.start,
      end: range.end
    })
    cursor = range.end
  }

  if (cursor < text.length) {
    segments.push({
      text: text.slice(cursor),
      highlighted: false,
      start: cursor,
      end: text.length
    })
  }

  if (segments.length === 0) {
    segments.push({ text, highlighted: false, start: 0, end: text.length })
  }

  return segments
}

/**
 * Classes for the root inline span.
 */
export function getHighlightRootClasses(className?: string): string {
  return classNames(highlightRootClasses, className)
}

/**
 * Classes for each highlighted `mark`.
 */
export function getHighlightMarkClasses(className?: string): string {
  return classNames(highlightMarkClasses, className)
}

/**
 * Split one text node that occupies `[offset, offset+text.length)` by match ranges.
 */
export function sliceTextByHighlightRanges(
  text: string,
  offset: number,
  ranges: readonly HighlightRange[]
): Array<{ text: string; highlighted: boolean; start: number }> {
  if (!text) return []

  const end = offset + text.length
  const overlapping = ranges.filter((range) => range.start < end && range.end > offset)
  if (overlapping.length === 0) {
    return [{ text, highlighted: false, start: offset }]
  }

  const pieces: Array<{ text: string; highlighted: boolean; start: number }> = []
  let cursor = offset
  for (const range of overlapping) {
    const start = Math.max(range.start, offset)
    const stop = Math.min(range.end, end)
    if (start > cursor) {
      pieces.push({
        text: text.slice(cursor - offset, start - offset),
        highlighted: false,
        start: cursor
      })
    }
    if (stop > start) {
      pieces.push({
        text: text.slice(start - offset, stop - offset),
        highlighted: true,
        start
      })
    }
    cursor = Math.max(cursor, stop)
  }
  if (cursor < end) {
    pieces.push({
      text: text.slice(cursor - offset),
      highlighted: false,
      start: cursor
    })
  }
  return pieces
}
