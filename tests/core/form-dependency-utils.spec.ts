import { describe, expect, it } from 'vitest'
import { getDependentFields, getFieldDependencies, getValidationOrder } from '@expcat/tigercat-core'

describe('form-dependency-utils', () => {
  describe('getDependentFields', () => {
    it('returns fields that depend on the given field', () => {
      const deps = new Map<string, string[]>([
        ['confirmPassword', ['password']],
        ['city', ['country']],
        ['zip', ['country']]
      ])
      expect(getDependentFields('country', deps)).toEqual(['city', 'zip'])
    })

    it('returns empty array for field with no dependents', () => {
      const deps = new Map<string, string[]>([['confirmPassword', ['password']]])
      expect(getDependentFields('email', deps)).toEqual([])
    })

    it('returns empty array when dependencies is undefined', () => {
      expect(getDependentFields('email', undefined)).toEqual([])
    })
  })

  describe('getFieldDependencies', () => {
    it('returns fields that the given field depends on', () => {
      const deps = new Map<string, string[]>([
        ['confirmPassword', ['password']],
        ['city', ['country']]
      ])
      expect(getFieldDependencies('confirmPassword', deps)).toEqual(['password'])
    })

    it('returns multiple dependencies', () => {
      const deps = new Map<string, string[]>([['end', ['start', 'min']]])
      expect(getFieldDependencies('end', deps)).toEqual(['start', 'min'])
    })

    it('returns empty array when field has no dependencies', () => {
      const deps = new Map<string, string[]>([['a', ['b']]])
      expect(getFieldDependencies('c', deps)).toEqual([])
    })
  })

  describe('getValidationOrder', () => {
    it('orders fields respecting dependencies', () => {
      const deps = new Map<string, string[]>([['confirmPassword', ['password']]])
      const order = getValidationOrder(['confirmPassword', 'password'], deps)
      expect(order.indexOf('password')).toBeLessThan(order.indexOf('confirmPassword'))
    })

    it('returns all fields even without dependencies', () => {
      const order = getValidationOrder(['a', 'b', 'c'], undefined)
      expect(order).toHaveLength(3)
      expect(order).toContain('a')
      expect(order).toContain('b')
      expect(order).toContain('c')
    })

    it('handles circular dependencies gracefully', () => {
      const deps = new Map<string, string[]>([
        ['a', ['b']],
        ['b', ['a']]
      ])
      const order = getValidationOrder(['a', 'b'], deps)
      expect(order).toHaveLength(2)
    })
  })
})
