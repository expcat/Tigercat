/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  coerceArrayFormValue,
  coerceBooleanFormValue,
  coerceChoiceFormValue,
  coerceNumberFormValue,
  coerceSliderFormValue,
  coerceTagsFormValue,
  coerceTextFormValue,
  resolveFormItemSeed
} from '@expcat/tigercat-core'

describe('form-item-value', () => {
  it('prefers the public value over FormItem', () => {
    expect(resolveFormItemSeed(true, 'agree', false, coerceBooleanFormValue)).toBe(true)
    expect(resolveFormItemSeed(undefined, undefined, true, coerceBooleanFormValue)).toBeUndefined()
  })

  it('coerces FormItem empty sentinels without treating them as strings', () => {
    expect(coerceBooleanFormValue('')).toBe(false)
    expect(coerceBooleanFormValue(true)).toBe(true)
    expect(coerceArrayFormValue('')).toEqual([])
    expect(coerceArrayFormValue(['a'])).toEqual(['a'])
    expect(coerceChoiceFormValue('')).toBeUndefined()
    expect(coerceChoiceFormValue('yes')).toBe('yes')
    expect(coerceSliderFormValue('', false)).toBeNull()
    expect(coerceSliderFormValue('12', false)).toBe(12)
    expect(coerceSliderFormValue(12, false)).toBe(12)
    expect(coerceSliderFormValue([1, 8], true)).toEqual([1, 8])
    expect(coerceSliderFormValue(['1', '8'], true)).toEqual([1, 8])
    expect(coerceSliderFormValue(3, true)).toBeNull()
    expect(coerceNumberFormValue('12')).toBe(12)
    expect(coerceNumberFormValue('')).toBeNull()
    expect(coerceTextFormValue(null)).toBe('')
    expect(coerceTagsFormValue('')).toBeNull()
  })
})
