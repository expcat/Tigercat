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
  'tiger-highlight-mark rounded-[var(--tiger-radius-sm)] bg-[var(--tiger-warning)]/20 px-0.5 text-inherit box-decoration-clone'

/**
 * Kept so callers that previously escaped keywords still compile.
 * Matching itself is a literal scan and does not compile a pattern.
 */
export function escapeHighlightKeyword(keyword: string): string {
  return keyword
}

/**
 * Normalize `keywords` into string queries.
 * Non-strings, including `RegExp`, are dropped and never executed.
 */
export function normalizeHighlightKeywords(keywords?: HighlightKeywords | null): string[] {
  if (keywords == null) return []
  if (typeof keywords === 'string') return [keywords]
  if (!Array.isArray(keywords)) return []

  const result: string[] = []
  for (const item of keywords) {
    if (typeof item === 'string') result.push(item)
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

function collectStringRanges(
  text: string,
  keyword: string,
  caseSensitive: boolean,
  global: boolean
): HighlightRange[] {
  if (!keyword) return []
  const source = caseSensitive ? text : text.toLowerCase()
  const needle = caseSensitive ? keyword : keyword.toLowerCase()
  if (!needle) return []

  const ranges: HighlightRange[] = []
  let from = 0
  while (from <= source.length - needle.length) {
    const index = source.indexOf(needle, from)
    if (index === -1) break
    ranges.push({ start: index, end: index + needle.length })
    if (!global) break
    from = index + needle.length
  }
  return ranges
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
 * Find stable match ranges for `text` against string `keywords`.
 *
 * Matching is a linear scan. Keywords are literal. `RegExp` values are ignored.
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
    collected.push(...collectStringRanges(text, query, caseSensitive, global))
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
