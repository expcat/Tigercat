import { describe, expect, it } from 'vitest'
import { classNames } from '@expcat/tigercat-core'

describe('classNames', () => {
  describe('basic functionality', () => {
    it('joins multiple class strings', () => {
      expect(classNames('a', 'b', 'c')).toBe('a b c')
    })

    it('returns empty string for no arguments', () => {
      expect(classNames()).toBe('')
    })

    it('returns single class unchanged', () => {
      expect(classNames('single')).toBe('single')
    })
  })

  describe('falsy value filtering', () => {
    it('handles all falsy values at once', () => {
      expect(classNames('a', undefined, null, false, '', 0, 'b')).toBe('a b')
    })

    it('returns empty string for all falsy values', () => {
      expect(classNames(undefined, null, false, '', 0)).toBe('')
    })
  })

  describe('conditional class application', () => {
    it('supports boolean expressions', () => {
      const isActive = true
      const isDisabled = false
      expect(classNames('btn', isActive && 'active', isDisabled && 'disabled')).toBe('btn active')
    })

    it('supports ternary expressions', () => {
      const variant = 'primary'
      expect(classNames('btn', variant === 'primary' ? 'btn-primary' : 'btn-secondary')).toBe(
        'btn btn-primary'
      )
    })
  })

  describe('number handling', () => {
    it('converts positive numbers to strings', () => {
      expect(classNames('class', 42)).toBe('class 42')
    })

    it('converts negative numbers to strings', () => {
      expect(classNames('class', -1)).toBe('class -1')
    })

    it('filters out 0 (not a valid CSS class)', () => {
      expect(classNames('class', 0)).toBe('class')
    })
  })

  describe('whitespace handling', () => {
    it('preserves internal whitespace in class strings', () => {
      // Note: This tests the actual behavior - internal whitespace IS preserved
      // because the function doesn't trim or split input strings
      expect(classNames('a b', 'c d')).toBe('a b c d')
    })

    it('does not add extra whitespace between classes', () => {
      const result = classNames('a', 'b', 'c')
      expect(result).not.toMatch(/ {2}/)
    })
  })

  describe('edge cases', () => {
    it('handles classes with special characters', () => {
      expect(classNames('w-1/2', 'h-[100px]', '-mt-4', '!important')).toBe(
        'w-1/2 h-[100px] -mt-4 !important'
      )
    })
  })
})
