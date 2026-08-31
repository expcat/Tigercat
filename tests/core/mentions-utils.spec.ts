import { describe, expect, it } from 'vitest'
import {
  defaultMentionFilter,
  extractMentionQuery,
  filterMentionOptions,
  getInitialMentionsActiveIndex,
  getMentionsActiveIndex,
  getMentionsKeyIntent,
  insertMention,
  parseMentions,
  shouldOpenMentions
} from '@expcat/tigercat-core'

const options = [
  { label: '张三', value: 'zhangsan' },
  { label: 'Alice', value: 'alice' },
  { label: 'Bob', value: 'bob', disabled: true }
]

describe('mentions-utils', () => {
  describe('extractMentionQuery', () => {
    it('extracts the query before the cursor', () => {
      expect(extractMentionQuery('hello @ali', 10, '@')).toEqual({
        query: 'ali',
        startPos: 6,
        prefix: '@'
      })
      expect(extractMentionQuery('email@test', 10, '@')).toBeNull()
    })

    it('matches the last of several prefixes', () => {
      expect(extractMentionQuery('hi @a #b', 8, ['@', '#'])).toEqual({
        query: 'b',
        startPos: 6,
        prefix: '#'
      })
    })
  })

  describe('filterMentionOptions', () => {
    it('matches label and value with the same rule', () => {
      expect(filterMentionOptions(options, '张').map((item) => item.value)).toEqual(['zhangsan'])
      expect(filterMentionOptions(options, 'zhang').map((item) => item.value)).toEqual(['zhangsan'])
    })

    it('keeps disabled options for empty and non-empty queries', () => {
      expect(filterMentionOptions(options, '').map((item) => item.value)).toEqual([
        'zhangsan',
        'alice',
        'bob'
      ])
      expect(filterMentionOptions(options, 'bo').map((item) => item.value)).toEqual(['bob'])
    })

    it('accepts a custom filter and a pass-through', () => {
      expect(
        filterMentionOptions(options, 'a', (query, option) => option.value.startsWith(query)).map(
          (item) => item.value
        )
      ).toEqual(['alice'])
      expect(filterMentionOptions(options, 'zzzz', false)).toHaveLength(3)
      expect(defaultMentionFilter('', options[0])).toBe(true)
    })
  })

  describe('insertMention / parseMentions', () => {
    it('inserts prefix + value + space using the live string', () => {
      expect(
        insertMention({
          text: 'hello @al',
          mentionStart: 6,
          cursor: 9,
          prefix: '@',
          value: 'alice'
        })
      ).toEqual({ value: 'hello @alice ', caret: 13 })
    })

    it('round-trips inserted tokens', () => {
      expect(parseMentions('hello @alice and #frontend ', ['@', '#'])).toEqual([
        { prefix: '@', value: 'alice', start: 6, end: 12 },
        { prefix: '#', value: 'frontend', start: 17, end: 26 }
      ])
    })
  })

  describe('open and keyboard', () => {
    it('opens only when a query exists and there are matches or loading', () => {
      const query = { query: 'z', startPos: 0, prefix: '@' }
      expect(shouldOpenMentions({ query, filteredCount: 0 })).toBe(false)
      expect(shouldOpenMentions({ query, filteredCount: 0, loading: true })).toBe(true)
      expect(shouldOpenMentions({ query, filteredCount: 1 })).toBe(true)
      expect(shouldOpenMentions({ query: null, filteredCount: 3 })).toBe(false)
    })

    it('does not eat keys when the panel is closed', () => {
      expect(getMentionsKeyIntent('Enter', false)).toEqual({ type: 'none' })
      expect(getMentionsKeyIntent('ArrowDown', true)).toEqual({
        type: 'navigate',
        key: 'ArrowDown'
      })
      expect(getMentionsKeyIntent('Enter', true)).toEqual({ type: 'select-active' })
      expect(getMentionsKeyIntent('Escape', true)).toEqual({ type: 'close' })
      expect(getMentionsKeyIntent('Home', true)).toEqual({ type: 'navigate', key: 'Home' })
    })

    it('skips disabled options when navigating', () => {
      expect(getInitialMentionsActiveIndex(options)).toBe(0)
      expect(getMentionsActiveIndex(options, 0, 'ArrowDown')).toBe(1)
      expect(getMentionsActiveIndex(options, 1, 'ArrowDown')).toBe(1)
    })
  })
})
