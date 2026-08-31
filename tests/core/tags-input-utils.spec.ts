import { describe, expect, it } from 'vitest'
import {
  addTags,
  commitTagCandidates,
  extractTagCandidates,
  formatRemoveTagLabel,
  getTagsArrowDelta,
  removeTagAt,
  resolveTagsPasteCandidates,
  splitTagInput
} from '@expcat/tigercat-core'

describe('tags-input-utils', () => {
  describe('extractTagCandidates', () => {
    it('splits completed segments and keeps the remainder pending', () => {
      expect(extractTagCandidates('foo,bar', [','])).toEqual({
        candidates: ['foo'],
        pending: 'bar'
      })
      expect(extractTagCandidates('foo,', [','])).toEqual({ candidates: ['foo'], pending: '' })
      expect(extractTagCandidates('foo', [','])).toEqual({ candidates: [], pending: 'foo' })
    })

    it('trims segments and drops empty ones', () => {
      expect(extractTagCandidates(' a , ,b,', [','])).toEqual({
        candidates: ['a', 'b'],
        pending: ''
      })
    })

    it('supports multiple and multi-character delimiters', () => {
      expect(extractTagCandidates('a;b,c', [',', ';'])).toEqual({
        candidates: ['a', 'b'],
        pending: 'c'
      })
      expect(extractTagCandidates('a::b::c', ['::'])).toEqual({
        candidates: ['a', 'b'],
        pending: 'c'
      })
    })

    it('returns everything as pending when delimiters are disabled', () => {
      expect(extractTagCandidates('a,b', [])).toEqual({ candidates: [], pending: 'a,b' })
    })
  })

  describe('splitTagInput', () => {
    it('splits pasted text on delimiters and newlines including the last segment', () => {
      expect(splitTagInput('a, b, c\nd', [','])).toEqual(['a', 'b', 'c', 'd'])
      expect(splitTagInput('a\r\nb', [','])).toEqual(['a', 'b'])
      expect(splitTagInput('  solo  ', [','])).toEqual(['solo'])
      expect(splitTagInput(' , , ', [','])).toEqual([])
    })
  })

  describe('addTags', () => {
    it('appends candidates and reports added ones', () => {
      expect(addTags(['a'], ['b', 'c'])).toEqual({
        tags: ['a', 'b', 'c'],
        added: ['b', 'c'],
        rejected: []
      })
    })

    it('rejects duplicates by default and allows them when configured', () => {
      expect(addTags(['a'], ['a', 'b'])).toEqual({
        tags: ['a', 'b'],
        added: ['b'],
        rejected: ['a']
      })
      expect(addTags(['a'], ['a'], { allowDuplicates: true })).toEqual({
        tags: ['a', 'a'],
        added: ['a'],
        rejected: []
      })
    })

    it('enforces the max limit with partial success', () => {
      expect(addTags(['a'], ['b', 'c'], { max: 2 })).toEqual({
        tags: ['a', 'b'],
        added: ['b'],
        rejected: ['c']
      })
      expect(addTags(['a', 'b'], ['c'], { max: 2 })).toEqual({
        tags: ['a', 'b'],
        added: [],
        rejected: ['c']
      })
    })

    it('trims candidates and drops empty ones silently', () => {
      expect(addTags([], [' a ', '  ', ''])).toEqual({ tags: ['a'], added: ['a'], rejected: [] })
    })
  })

  describe('removeTagAt', () => {
    it('removes by index and ignores out-of-range indices', () => {
      expect(removeTagAt(['a', 'b', 'c'], 1)).toEqual(['a', 'c'])
      expect(removeTagAt(['a'], 5)).toEqual(['a'])
      expect(removeTagAt(['a'], -1)).toEqual(['a'])
    })
  })

  it('formats remove-tag labels', () => {
    expect(formatRemoveTagLabel('Remove {tag}', 'vue')).toBe('Remove vue')
  })

  describe('commitTagCandidates', () => {
    it('keeps pending text when a duplicate is rejected', () => {
      expect(commitTagCandidates(['dup'], ['dup'], { pendingFallback: 'dup' })).toEqual({
        tags: ['dup'],
        added: [],
        rejected: ['dup'],
        pending: 'dup'
      })
    })

    it('trims beforeAdd true-path candidates', () => {
      const result = commitTagCandidates([], ['  hello  '], { beforeAdd: () => true })
      expect(result.tags).toEqual(['hello'])
      expect(result.added).toEqual(['hello'])
    })
  })

  describe('paste and arrows', () => {
    it('prepends current pending text to a multi-value paste', () => {
      expect(resolveTagsPasteCandidates('hello', 'a,b', [','])).toEqual(['hello', 'a', 'b'])
    })

    it('mirrors arrow keys in RTL', () => {
      expect(getTagsArrowDelta('ArrowLeft', 'ltr')).toBe(-1)
      expect(getTagsArrowDelta('ArrowLeft', 'rtl')).toBe(1)
    })
  })
})
