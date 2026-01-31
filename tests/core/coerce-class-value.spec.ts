import { describe, expect, it } from 'vitest'
import { coerceClassValue } from '@expcat/tigercat-core'

describe('coerceClassValue', () => {
  describe('passthrough values', () => {
    it('passes through null', () => {
      expect(coerceClassValue(null)).toBe(null)
    })

    it('passes through undefined', () => {
      expect(coerceClassValue(undefined)).toBe(undefined)
    })

    it('passes through false', () => {
      expect(coerceClassValue(false)).toBe(false)
    })

    it('passes through strings', () => {
      expect(coerceClassValue('my-class')).toBe('my-class')
    })

    it('passes through numbers', () => {
      expect(coerceClassValue(42)).toBe(42)
    })
  })

  describe('array input', () => {
    it('joins array of strings', () => {
      expect(coerceClassValue(['a', 'b', 'c'])).toBe('a b c')
    })

    it('filters falsy values in array', () => {
      expect(coerceClassValue(['a', null, 'b', undefined, 'c'])).toBe('a b c')
    })

    it('handles empty array', () => {
      expect(coerceClassValue([])).toBe(undefined)
    })

    it('handles nested arrays', () => {
      expect(coerceClassValue(['a', ['b', 'c'], 'd'])).toBe('a b c d')
    })

    it('handles array with object entries', () => {
      expect(coerceClassValue(['a', { b: true, c: false }])).toBe('a b')
    })
  })

  describe('object input (Vue class binding style)', () => {
    it('includes keys with truthy values', () => {
      expect(coerceClassValue({ active: true, disabled: false })).toBe('active')
    })

    it('handles all truthy values', () => {
      expect(coerceClassValue({ a: true, b: 1, c: 'yes' })).toBe('a b c')
    })

    it('handles all falsy values', () => {
      expect(coerceClassValue({ a: false, b: 0, c: null, d: undefined, e: '' })).toBe(undefined)
    })

    it('handles empty object', () => {
      expect(coerceClassValue({})).toBe(undefined)
    })

    it('preserves key order', () => {
      const result = coerceClassValue({ z: true, a: true, m: true })
      expect(result).toBe('z a m')
    })
  })

  describe('mixed nested structures', () => {
    it('handles complex Vue class binding', () => {
      const result = coerceClassValue([
        'base-class',
        { active: true, disabled: false },
        ['extra', 'classes'],
        null
      ])
      expect(result).toBe('base-class active extra classes')
    })

    it('handles deeply nested arrays', () => {
      expect(coerceClassValue([['a', ['b', ['c']]]])).toBe('a b c')
    })
  })

  describe('edge cases', () => {
    it('converts number in array to string', () => {
      expect(coerceClassValue([42, 'class'])).toBe('42 class')
    })

    it('handles boolean true (not a valid class)', () => {
      // true as standalone is not a valid class value
      expect(coerceClassValue(true as unknown)).toBe(undefined)
    })

    it('handles array with only falsy values', () => {
      expect(coerceClassValue([null, undefined, false, ''])).toBe(undefined)
    })

    it('handles object with all false values', () => {
      expect(coerceClassValue({ a: false, b: false })).toBe(undefined)
    })
  })

  describe('real-world Vue attrs.class scenarios', () => {
    it('handles string class from template', () => {
      // <Component class="my-class" />
      expect(coerceClassValue('my-class')).toBe('my-class')
    })

    it('handles array class from template', () => {
      // <Component :class="['a', 'b']" />
      expect(coerceClassValue(['a', 'b'])).toBe('a b')
    })

    it('handles object class from template', () => {
      // <Component :class="{ active: isActive }" />
      expect(coerceClassValue({ active: true })).toBe('active')
    })

    it('handles combined class binding', () => {
      // <Component class="static" :class="['dynamic', { conditional: true }]" />
      // Vue merges these before passing to component
      expect(coerceClassValue(['static', 'dynamic', { conditional: true }])).toBe(
        'static dynamic conditional'
      )
    })
  })
})
