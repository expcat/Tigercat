import { describe, expect, it } from 'vitest'
import {
  checkboxGroupIncludes,
  checkboxValuesEqual,
  toggleCheckboxGroupValue
} from '@expcat/tigercat-core'

describe('checkbox group values', () => {
  it('treats 1 and "1" as the same option', () => {
    expect(checkboxValuesEqual(1, '1')).toBe(true)
    expect(checkboxGroupIncludes([1], '1')).toBe(true)
  })

  it('keeps booleans strict', () => {
    expect(checkboxValuesEqual(true, 'true')).toBe(false)
    expect(checkboxValuesEqual(false, 0)).toBe(false)
  })

  it('toggles without duplicating an already-selected value', () => {
    const current = [1, 'b']
    expect(toggleCheckboxGroupValue(current, 1, true)).toBe(current)
    expect(toggleCheckboxGroupValue(current, '1', true)).toBe(current)
    expect(toggleCheckboxGroupValue(current, 'b', false)).toEqual([1])
    expect(toggleCheckboxGroupValue(current, 'c', true)).toEqual([1, 'b', 'c'])
  })
})
