/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_HIGHLIGHT_CASE_SENSITIVE,
  DEFAULT_HIGHLIGHT_GLOBAL,
  escapeHighlightKeyword,
  findHighlightRanges,
  getHighlightMarkClasses,
  getHighlightRootClasses,
  getHighlightSegments,
  highlightMarkClasses,
  highlightRootClasses,
  mergeHighlightRanges,
  normalizeHighlightKeywords,
  resolveHighlightCaseSensitive,
  resolveHighlightGlobal,
  resolveHighlightText
} from '@expcat/tigercat-core'

describe('highlight-utils', () => {
  describe('escapeHighlightKeyword', () => {
    it('escapes regex special characters so keywords match literally', () => {
      expect(escapeHighlightKeyword('a+b')).toBe('a\\+b')
      expect(escapeHighlightKeyword('(foo)')).toBe('\\(foo\\)')
      expect(escapeHighlightKeyword('file.txt')).toBe('file\\.txt')
    })
  })

  describe('normalizeHighlightKeywords', () => {
    it('returns an empty list for missing input', () => {
      expect(normalizeHighlightKeywords()).toEqual([])
      expect(normalizeHighlightKeywords(null)).toEqual([])
    })

    it('wraps a string or RegExp as a single query', () => {
      expect(normalizeHighlightKeywords('Vue')).toEqual(['Vue'])
      const pattern = /Vue/i
      expect(normalizeHighlightKeywords(pattern)).toEqual([pattern])
    })

    it('keeps string and RegExp array entries and drops the rest', () => {
      const pattern = /\d+/
      expect(
        normalizeHighlightKeywords([
          'Vue',
          pattern,
          '',
          1 as unknown as string,
          null as unknown as string
        ])
      ).toEqual(['Vue', pattern, ''])
    })
  })

  describe('resolve helpers', () => {
    it('resolves case, global, and source text', () => {
      expect(resolveHighlightCaseSensitive()).toBe(DEFAULT_HIGHLIGHT_CASE_SENSITIVE)
      expect(resolveHighlightCaseSensitive(true)).toBe(true)
      expect(resolveHighlightCaseSensitive(false)).toBe(DEFAULT_HIGHLIGHT_CASE_SENSITIVE)
      expect(resolveHighlightGlobal()).toBe(DEFAULT_HIGHLIGHT_GLOBAL)
      expect(resolveHighlightGlobal(true)).toBe(DEFAULT_HIGHLIGHT_GLOBAL)
      expect(resolveHighlightGlobal(false)).toBe(false)
      expect(resolveHighlightText(undefined, 'slot')).toBe('slot')
      expect(resolveHighlightText('', 'slot')).toBe('')
      expect(resolveHighlightText('prop')).toBe('prop')
    })
  })

  describe('findHighlightRanges', () => {
    it('highlights a case-insensitive string keyword globally', () => {
      expect(findHighlightRanges('Vue then vue', 'Vue')).toEqual([
        { start: 0, end: 3 },
        { start: 9, end: 12 }
      ])
    })

    it('honors caseSensitive for string keywords', () => {
      expect(findHighlightRanges('Vue then vue', 'Vue', { caseSensitive: true })).toEqual([
        { start: 0, end: 3 }
      ])
    })

    it('highlights only the first match of each keyword when global is false', () => {
      expect(findHighlightRanges('foo foo foo', 'foo', { global: false })).toEqual([
        { start: 0, end: 3 }
      ])
    })

    it('matches multiple keywords and merges overlapping ranges', () => {
      expect(findHighlightRanges('testing', ['test', 'sting'])).toEqual([{ start: 0, end: 7 }])
    })

    it('escapes string keywords so punctuation is literal', () => {
      expect(findHighlightRanges('a+b and aab', 'a+b')).toEqual([{ start: 0, end: 3 }])
    })

    it('accepts a RegExp and does not mutate its lastIndex', () => {
      const pattern = /#\d+/g
      pattern.lastIndex = 4
      expect(findHighlightRanges('Order #42 and #7', pattern)).toEqual([
        { start: 6, end: 9 },
        { start: 14, end: 16 }
      ])
      expect(pattern.lastIndex).toBe(4)
    })

    it('keeps a RegExp ignoreCase flag even when caseSensitive is true', () => {
      expect(findHighlightRanges('Vue then vue', /Vue/i, { caseSensitive: true })).toEqual([
        { start: 0, end: 3 },
        { start: 9, end: 12 }
      ])
    })

    it('skips empty keywords, empty matches, and empty text', () => {
      expect(findHighlightRanges('', 'a')).toEqual([])
      expect(findHighlightRanges('abc', '')).toEqual([])
      expect(findHighlightRanges('abc', /(?:)/g)).toEqual([])
    })
  })

  describe('mergeHighlightRanges', () => {
    it('merges overlapping and adjacent ranges in start order', () => {
      expect(
        mergeHighlightRanges([
          { start: 2, end: 5 },
          { start: 0, end: 2 },
          { start: 4, end: 6 }
        ])
      ).toEqual([{ start: 0, end: 6 }])
    })
  })

  describe('getHighlightSegments', () => {
    it('splits text into highlighted and plain slices', () => {
      expect(getHighlightSegments('abXcdXef', 'X')).toEqual([
        { text: 'ab', highlighted: false, start: 0, end: 2 },
        { text: 'X', highlighted: true, start: 2, end: 3 },
        { text: 'cd', highlighted: false, start: 3, end: 5 },
        { text: 'X', highlighted: true, start: 5, end: 6 },
        { text: 'ef', highlighted: false, start: 6, end: 8 }
      ])
    })

    it('returns the original text as a single plain segment when nothing matches', () => {
      expect(getHighlightSegments('plain', 'z')).toEqual([
        { text: 'plain', highlighted: false, start: 0, end: 5 }
      ])
    })
  })

  describe('class helpers', () => {
    it('applies root and mark classes with extra names', () => {
      expect(getHighlightRootClasses()).toContain(highlightRootClasses)
      expect(getHighlightRootClasses('extra')).toContain('extra')
      expect(getHighlightMarkClasses()).toContain(highlightMarkClasses)
      expect(getHighlightMarkClasses('mark-extra')).toContain('mark-extra')
    })
  })
})
