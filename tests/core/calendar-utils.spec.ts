/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { isCalendarMonthDisabled } from '@expcat/tigercat-core'

describe('isCalendarMonthDisabled', () => {
  it('returns false when no predicate is provided', () => {
    expect(isCalendarMonthDisabled(2024, 2)).toBe(false)
    expect(isCalendarMonthDisabled(2024, 2, undefined)).toBe(false)
  })

  it('does not disable February 2024 when only weekends are disabled', () => {
    const weekends = (d: Date) => d.getDay() === 0 || d.getDay() === 6
    expect(isCalendarMonthDisabled(2024, 1, weekends)).toBe(false)
  })

  it('disables March 2024 when the predicate is always true', () => {
    expect(isCalendarMonthDisabled(2024, 2, () => true)).toBe(true)
  })

  it('treats March 2024 as disabled and June 2024 as enabled for a March-only predicate', () => {
    const marchOnly = (d: Date) => d.getMonth() === 2
    expect(isCalendarMonthDisabled(2024, 2, marchOnly)).toBe(true)
    expect(isCalendarMonthDisabled(2024, 5, marchOnly)).toBe(false)
  })
})
