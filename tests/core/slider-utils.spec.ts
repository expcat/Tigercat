import { describe, expect, it } from 'vitest'
import {
  sliderGetKeyboardValue,
  sliderGetPercentage,
  sliderGetValueFromPosition,
  sliderNormalizeValue
} from '@expcat/tigercat-core'

describe('slider-utils', () => {
  it('normalizes invalid domains and steps to finite values', () => {
    expect(sliderNormalizeValue(Number.NaN, 100, 0, 0)).toBe(0)
    expect(sliderNormalizeValue(45, 100, 0, -5)).toBe(45)
    expect(sliderNormalizeValue(47, 0, 100, Number.NaN)).toBe(47)
  })

  it('clamps percentages and positions with reversed or invalid ranges', () => {
    expect(sliderGetPercentage(25, 100, 0)).toBe(25)
    expect(sliderGetPercentage(Number.POSITIVE_INFINITY, 0, 100)).toBe(0)
    expect(sliderGetValueFromPosition(50, 100, 100, 0, 10)).toBe(50)
    expect(sliderGetValueFromPosition(50, 0, 0, 100, 10)).toBe(0)
  })

  it('normalizes keyboard movement steps', () => {
    expect(sliderGetKeyboardValue('ArrowRight', 0, 0, 10, 0)).toBe(1)
    expect(sliderGetKeyboardValue('PageUp', 0, 0, 10, 1, Number.NaN)).toBe(10)
    expect(sliderGetKeyboardValue('Home', 5, 10, 0, 1)).toBe(10)
    expect(sliderGetKeyboardValue('End', 5, 10, 0, 1)).toBe(0)
    expect(sliderGetKeyboardValue('Escape', 5, 0, 10, 1)).toBeNull()
  })
})
