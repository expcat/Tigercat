import { describe, it, expect, beforeEach } from 'vitest'
import {
  clearCalendarMonthDaysCache,
  getCalendarDays,
  getCalendarMonthDaysCacheSize,
  getMonthDays
} from '@expcat/tigercat-core'

describe('date-utils calendar month cache', () => {
  beforeEach(() => {
    clearCalendarMonthDaysCache()
  })

  it('generates a stable 42-day calendar grid', () => {
    const days = getCalendarDays(2024, 5)

    expect(days).toHaveLength(42)
    expect(days[0]).toEqual(new Date(2024, 4, 26))
    expect(days[20]).toEqual(new Date(2024, 5, 15))
    expect(days[41]).toEqual(new Date(2024, 6, 6))
    expect(getCalendarMonthDaysCacheSize()).toBe(1)
  })

  it('reuses cached month geometry across Calendar and DatePicker helpers', () => {
    getCalendarDays(2024, 5)
    getMonthDays(2024, 5)

    expect(getCalendarMonthDaysCacheSize()).toBe(1)
  })

  it('normalizes overflow months to the same cache entry', () => {
    expect(getCalendarDays(2024, 12)).toEqual(getCalendarDays(2025, 0))
    expect(getCalendarMonthDaysCacheSize()).toBe(1)
  })

  it('returns fresh Date instances from cached values', () => {
    const firstRead = getCalendarDays(2024, 5) as Date[]
    firstRead[0].setFullYear(1999)

    const secondRead = getCalendarDays(2024, 5)

    expect(secondRead[0]).toEqual(new Date(2024, 4, 26))
    expect(getCalendarMonthDaysCacheSize()).toBe(1)
  })

  it('keeps the month cache bounded', () => {
    for (let month = 0; month < 60; month++) {
      getCalendarDays(2024, month)
    }

    expect(getCalendarMonthDaysCacheSize()).toBe(48)
  })
})
