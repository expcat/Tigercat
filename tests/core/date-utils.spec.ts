import { describe, it, expect, beforeEach } from 'vitest'
import {
  clearCalendarMonthDaysCache,
  formatDate,
  formatDateWithLocale,
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

  it('keeps legacy fixed formatting when no locale is provided', () => {
    expect(formatDate(new Date(2024, 0, 5), 'yyyy-MM-dd')).toBe('2024-01-05')
    expect(formatDate(new Date(2024, 0, 5), 'dd/MM/yyyy')).toBe('05/01/2024')
  })

  it('formats dates through Intl when locale is provided', () => {
    const date = new Date(2024, 0, 5)

    expect(formatDate(date, 'yyyy-MM-dd', 'fr-FR')).toBe(
      new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date)
    )
    expect(formatDateWithLocale(date, 'de-DE', { dateStyle: 'medium' })).toBe(
      new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(date)
    )
  })
})
