/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { filterDataAdvanced, type FilterRule } from '@expcat/tigercat-core'

const data = [
  { id: 1, name: 'Alice', age: 25, city: 'New York' },
  { id: 2, name: 'Bob', age: 30, city: 'London' },
  { id: 3, name: 'Charlie', age: 35, city: 'New York' },
  { id: 4, name: 'Diana', age: 40, city: 'Paris' },
  { id: 5, name: 'Eve', age: 28, city: 'London' }
]

describe('filterDataAdvanced', () => {
  it('should return all data when no rules', () => {
    expect(filterDataAdvanced(data, [])).toEqual(data)
  })

  it('should filter with equals operator', () => {
    const rules: FilterRule[] = [{ column: 'city', operator: 'equals', value: 'London' }]
    const result = filterDataAdvanced(data, rules)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Bob')
    expect(result[1].name).toBe('Eve')
  })

  it('should filter with notEquals operator', () => {
    const rules: FilterRule[] = [{ column: 'city', operator: 'notEquals', value: 'London' }]
    const result = filterDataAdvanced(data, rules)
    expect(result).toHaveLength(3)
  })

  it('should filter with contains operator', () => {
    const rules: FilterRule[] = [{ column: 'name', operator: 'contains', value: 'li' }]
    const result = filterDataAdvanced(data, rules)
    expect(result).toHaveLength(2) // Alice, Charlie
  })

  it('should filter with gt operator', () => {
    const rules: FilterRule[] = [{ column: 'age', operator: 'gt', value: 30 }]
    const result = filterDataAdvanced(data, rules)
    expect(result).toHaveLength(2) // Charlie (35), Diana (40)
  })

  it('should filter with lt operator', () => {
    const rules: FilterRule[] = [{ column: 'age', operator: 'lt', value: 30 }]
    const result = filterDataAdvanced(data, rules)
    expect(result).toHaveLength(2) // Alice (25), Eve (28)
  })

  it('should filter with between operator', () => {
    const rules: FilterRule[] = [{ column: 'age', operator: 'between', value: 28, valueTo: 35 }]
    const result = filterDataAdvanced(data, rules)
    expect(result).toHaveLength(3) // Bob (30), Charlie (35), Eve (28)
  })

  it('should combine rules with AND logic (default)', () => {
    const rules: FilterRule[] = [
      { column: 'city', operator: 'equals', value: 'New York' },
      { column: 'age', operator: 'gt', value: 30 }
    ]
    const result = filterDataAdvanced(data, rules)
    expect(result).toHaveLength(1) // Charlie (35, New York)
  })

  it('should combine rules with OR logic', () => {
    const rules: FilterRule[] = [
      { column: 'city', operator: 'equals', value: 'Paris' },
      { column: 'name', operator: 'equals', value: 'Alice', logic: 'or' }
    ]
    const result = filterDataAdvanced(data, rules)
    expect(result).toHaveLength(2) // Diana (Paris), Alice
  })

  it('should be case-insensitive for equals', () => {
    const rules: FilterRule[] = [{ column: 'city', operator: 'equals', value: 'london' }]
    const result = filterDataAdvanced(data, rules)
    expect(result).toHaveLength(2)
  })

  it('should skip rule when value is empty', () => {
    const rules: FilterRule[] = [{ column: 'city', operator: 'equals', value: '' }]
    const result = filterDataAdvanced(data, rules)
    expect(result).toEqual(data)
  })
})
