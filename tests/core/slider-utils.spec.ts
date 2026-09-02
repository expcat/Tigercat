import { describe, expect, it } from 'vitest'
import {
  getSliderRootClasses,
  sliderGetKeyboardValue,
  sliderGetPercentage,
  sliderGetValueFromPosition,
  sliderNormalizeValue,
  sliderResolveMarks,
  sliderSortRange,
  sliderValuesEqual
} from '@expcat/tigercat-core'

describe('slider-utils', () => {
  it('reserves space above the track when the value tooltip is enabled', () => {
    expect(getSliderRootClasses(false, undefined, true)).toContain('pt-12')
    expect(getSliderRootClasses(false)).not.toContain('pt-12')
    expect(getSliderRootClasses(true, undefined, true)).toContain('opacity-50')
  })
  it('normalizes invalid domains and steps to finite values', () => {
    expect(sliderNormalizeValue(Number.NaN, 100, 0, 0)).toBe(0)
    expect(sliderNormalizeValue(45, 100, 0, -5)).toBe(45)
    expect(sliderNormalizeValue(47, 0, 100, Number.NaN)).toBe(47)
  })

  it('snaps with decimal integer arithmetic', () => {
    expect(sliderNormalizeValue(0.3, 0, 1, 0.1)).toBe(0.3)
    expect(sliderNormalizeValue(0.1 + 0.2, 0, 1, 0.1)).toBe(0.3)
  })

  it('takes the first arrow from an unaligned value to the next step', () => {
    expect(sliderGetKeyboardValue('ArrowRight', 47, 0, 100, 10)).toBe(50)
    expect(sliderGetKeyboardValue('ArrowLeft', 47, 0, 100, 10)).toBe(40)
  })

  it('does not walk past min/max', () => {
    expect(sliderGetKeyboardValue('ArrowRight', 100, 0, 100, 1)).toBe(100)
    expect(sliderGetKeyboardValue('ArrowLeft', 0, 0, 100, 1)).toBe(0)
  })

  it('flips inline arrows in RTL', () => {
    expect(sliderGetKeyboardValue('ArrowRight', 40, 0, 100, 10, undefined, true)).toBe(30)
    expect(sliderGetKeyboardValue('ArrowLeft', 40, 0, 100, 10, undefined, true)).toBe(50)
  })

  it('builds step marks when marks is true', () => {
    expect(sliderResolveMarks(true, 0, 100, 25)).toEqual({
      0: '0',
      25: '25',
      50: '50',
      75: '75',
      100: '100'
    })
  })

  it('sorts inverted range tuples', () => {
    expect(sliderSortRange([60, 40])).toEqual([40, 60])
    expect(sliderValuesEqual([40, 60], [40, 60])).toBe(true)
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
