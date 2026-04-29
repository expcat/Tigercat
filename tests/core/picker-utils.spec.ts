import { describe, it, expect } from 'vitest'
import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  findNextEnabledIndex
} from '@expcat/tigercat-core'

interface Item {
  value: string
  disabled?: boolean
}

const items: Item[] = [
  { value: 'a', disabled: true },
  { value: 'b' },
  { value: 'c', disabled: true },
  { value: 'd' },
  { value: 'e', disabled: true }
]

describe('picker-utils', () => {
  describe('findFirstEnabledIndex', () => {
    it('returns the first enabled index', () => {
      expect(findFirstEnabledIndex(items)).toBe(1)
    })

    it('returns -1 for empty list', () => {
      expect(findFirstEnabledIndex([])).toBe(-1)
    })

    it('returns -1 when all disabled', () => {
      expect(findFirstEnabledIndex([{ value: 'x', disabled: true }])).toBe(-1)
    })

    it('respects custom predicate', () => {
      const data = [{ v: 1 }, { v: 2 }]
      expect(findFirstEnabledIndex(data, (it) => it.v < 2)).toBe(1)
    })
  })

  describe('findLastEnabledIndex', () => {
    it('returns the last enabled index', () => {
      expect(findLastEnabledIndex(items)).toBe(3)
    })

    it('returns -1 for empty list', () => {
      expect(findLastEnabledIndex([])).toBe(-1)
    })
  })

  describe('findNextEnabledIndex', () => {
    it('moves forward and skips disabled items', () => {
      expect(findNextEnabledIndex(items, 1, 1)).toBe(3)
    })

    it('moves backward and skips disabled items', () => {
      expect(findNextEnabledIndex(items, 3, -1)).toBe(1)
    })

    it('starts from head when current is -1 and direction is +1', () => {
      expect(findNextEnabledIndex(items, -1, 1)).toBe(1)
    })

    it('starts from tail when current is -1 and direction is -1', () => {
      expect(findNextEnabledIndex(items, -1, -1)).toBe(3)
    })

    it('returns current when no enabled item exists in direction', () => {
      expect(findNextEnabledIndex(items, 3, 1)).toBe(3)
      expect(findNextEnabledIndex(items, 1, -1)).toBe(1)
    })

    it('returns -1 for empty list', () => {
      expect(findNextEnabledIndex([], 0, 1)).toBe(-1)
    })
  })
})
