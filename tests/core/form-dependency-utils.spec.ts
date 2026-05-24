import { describe, expect, it } from 'vitest'
import {
  createFormConditionDependencies,
  evaluateFormCondition,
  evaluateFormConditions,
  getDependentFields,
  getFieldDependencies,
  getValidationOrder,
  resolveConditionalFormRules,
  resolveFormConditionState,
  type FormConditions,
  type FormRules
} from '@expcat/tigercat-core'

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

describe('form conditional DSL', () => {
  const values = {
    accountType: 'company',
    age: 18,
    tags: ['vip'],
    newsletter: true,
    companyName: ''
  }

  it('evaluates comparison, truthy, includes, and numeric operators', () => {
    expect(evaluateFormCondition({ field: 'accountType', value: 'company' }, values)).toBe(true)
    expect(evaluateFormCondition({ field: 'newsletter', operator: 'truthy' }, values)).toBe(true)
    expect(
      evaluateFormCondition({ field: 'tags', operator: 'includes', value: 'vip' }, values)
    ).toBe(true)
    expect(evaluateFormCondition({ field: 'age', operator: 'gte', value: 18 }, values)).toBe(true)
  })

  it('combines multiple conditions with all or any logic', () => {
    const conditions = [
      { field: 'accountType', value: 'personal' },
      { field: 'newsletter', value: true }
    ]

    expect(evaluateFormConditions(conditions, values, 'all')).toBe(false)
    expect(evaluateFormConditions(conditions, values, 'any')).toBe(true)
  })

  it('resolves visible, disabled, and required field state', () => {
    const conditions: FormConditions = {
      companyName: {
        showWhen: { field: 'accountType', value: 'company' },
        disabledWhen: { field: 'age', operator: 'lt', value: 18 },
        requiredWhen: { field: 'newsletter', value: true }
      }
    }

    expect(resolveFormConditionState('companyName', values, conditions)).toEqual({
      shown: true,
      disabled: false,
      required: true
    })
  })

  it('removes hidden fields and adds required rules for requiredWhen', () => {
    const rules: FormRules = {
      companyName: { min: 2 },
      vatId: { required: true }
    }
    const conditions: FormConditions = {
      companyName: { requiredWhen: { field: 'newsletter', value: true } },
      vatId: { showWhen: { field: 'accountType', value: 'enterprise' } }
    }

    expect(resolveConditionalFormRules(values, rules, conditions)).toEqual({
      companyName: [{ required: true }, { min: 2 }]
    })
  })

  it('creates dependency maps from field conditions', () => {
    const dependencies = createFormConditionDependencies({
      companyName: {
        showWhen: { field: 'accountType', value: 'company' },
        requiredWhen: { field: 'newsletter', value: true }
      }
    })

    expect(dependencies.get('companyName')).toEqual(['accountType', 'newsletter'])
  })
})
