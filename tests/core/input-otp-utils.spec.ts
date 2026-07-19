import { describe, expect, it } from 'vitest'
import {
  applyOtpBackspace,
  applyOtpCharInput,
  applyOtpDelete,
  distributeOtpPaste,
  formatOtpSlotLabel,
  getOtpSeparatorIndices,
  isOtpComplete,
  normalizeOtpValue,
  sanitizeOtpInput
} from '@expcat/tigercat-core'

describe('input-otp-utils', () => {
  describe('sanitize / normalize', () => {
    it('filters characters by type', () => {
      expect(sanitizeOtpInput('1a2b3', { type: 'numeric' })).toBe('123')
      expect(sanitizeOtpInput('1a2b3', { type: 'alphanumeric' })).toBe('1a2b3')
      expect(sanitizeOtpInput('a-b c!', { type: 'alphanumeric' })).toBe('abc')
    })

    it('defaults to numeric filtering', () => {
      expect(sanitizeOtpInput('12-34')).toBe('1234')
    })

    it('lets a custom pattern override the type filter', () => {
      expect(sanitizeOtpInput('abc123', { type: 'numeric', pattern: /^[a-c]$/ })).toBe('abc')
    })

    it('handles stateful (global/sticky) patterns deterministically', () => {
      expect(sanitizeOtpInput('1111', { pattern: /\d/g })).toBe('1111')
    })

    it('normalizes external values by filtering and truncating', () => {
      expect(normalizeOtpValue('12x3456789', 6)).toBe('123456')
      expect(normalizeOtpValue('abc', 6)).toBe('')
    })
  })

  describe('distributeOtpPaste', () => {
    it('filters, truncates to length, and targets the slot after the fill', () => {
      expect(distributeOtpPaste('12-34-56', 6)).toEqual({ value: '123456', nextIndex: 5 })
      expect(distributeOtpPaste('123456789', 6)).toEqual({ value: '123456', nextIndex: 5 })
      expect(distributeOtpPaste('123', 6)).toEqual({ value: '123', nextIndex: 3 })
    })

    it('returns null when nothing valid remains', () => {
      expect(distributeOtpPaste('abc', 6)).toBeNull()
      expect(distributeOtpPaste('', 6)).toBeNull()
    })
  })

  describe('applyOtpCharInput', () => {
    it('overwrites the slot and advances', () => {
      expect(applyOtpCharInput('12', 2, '3', 6)).toEqual({ value: '123', nextIndex: 3 })
      expect(applyOtpCharInput('123456', 2, '9', 6)).toEqual({ value: '129456', nextIndex: 3 })
    })

    it('stays on the last slot when it is filled', () => {
      expect(applyOtpCharInput('123456', 5, '9', 6)).toEqual({ value: '123459', nextIndex: 5 })
    })

    it('ignores invalid characters', () => {
      expect(applyOtpCharInput('12', 2, 'x', 6)).toEqual({ value: '12', nextIndex: 2 })
    })

    it('keeps values contiguous when typing past the filled range', () => {
      expect(applyOtpCharInput('12', 4, '3', 6)).toEqual({ value: '123', nextIndex: 3 })
    })

    it('distributes multi-character input (mobile autofill) from slot 0', () => {
      expect(applyOtpCharInput('', 0, '123456', 6)).toEqual({ value: '123456', nextIndex: 5 })
      expect(applyOtpCharInput('99', 1, '123456', 6)).toEqual({ value: '123456', nextIndex: 5 })
    })
  })

  describe('applyOtpBackspace / applyOtpDelete', () => {
    it('clears a filled slot in place and shifts later characters left', () => {
      expect(applyOtpBackspace('123456', 2)).toEqual({ value: '12456', nextIndex: 2 })
    })

    it('moves back and clears the previous slot from an empty slot', () => {
      expect(applyOtpBackspace('123', 3)).toEqual({ value: '12', nextIndex: 2 })
    })

    it('is a no-op on the first empty slot', () => {
      expect(applyOtpBackspace('', 0)).toEqual({ value: '', nextIndex: 0 })
    })

    it('delete clears the current slot without moving', () => {
      expect(applyOtpDelete('123', 1)).toEqual({ value: '13', nextIndex: 1 })
      expect(applyOtpDelete('123', 3)).toEqual({ value: '123', nextIndex: 3 })
    })
  })

  describe('completion and grouping', () => {
    it('detects completion', () => {
      expect(isOtpComplete('123456', 6)).toBe(true)
      expect(isOtpComplete('12345', 6)).toBe(false)
      expect(isOtpComplete('', 0)).toBe(false)
    })

    it('computes separator indices for valid groups', () => {
      expect(getOtpSeparatorIndices(6, [3, 3])).toEqual([2])
      expect(getOtpSeparatorIndices(8, [2, 3, 3])).toEqual([1, 4])
      expect(getOtpSeparatorIndices(6)).toEqual([])
    })

    it('ignores groups that do not sum to length or contain invalid sizes', () => {
      expect(getOtpSeparatorIndices(6, [3, 4])).toEqual([])
      expect(getOtpSeparatorIndices(6, [3, 0, 3])).toEqual([])
      expect(getOtpSeparatorIndices(6, [-3, 9])).toEqual([])
    })

    it('formats slot labels', () => {
      expect(formatOtpSlotLabel('Character {index} of {total}', 2, 6)).toBe('Character 2 of 6')
    })
  })
})
