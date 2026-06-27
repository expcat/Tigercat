import { describe, expect, it } from 'vitest'
import { clampStepperValue } from '@expcat/tigercat-core'

describe('stepper-utils', () => {
  it('clamps values across normal and reversed ranges', () => {
    expect(clampStepperValue(12, 0, 10)).toBe(10)
    expect(clampStepperValue(-2, 10, 0)).toBe(0)
    expect(clampStepperValue(6, 10, 0)).toBe(6)
  })

  it('normalizes non-finite values and precision', () => {
    expect(clampStepperValue(Number.NaN, 0, 10)).toBe(0)
    expect(clampStepperValue(6, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(6)
    expect(clampStepperValue(1.234, 0, 10, 2)).toBe(1.23)
    expect(clampStepperValue(1.234, 0, 10, -1)).toBe(1.234)
    expect(clampStepperValue(1.234, 0, 10, Number.POSITIVE_INFINITY)).toBe(1.234)
  })
})
