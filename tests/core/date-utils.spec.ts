import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  addDays,
  addMonths,
  addYears,
  clearCalendarMonthDaysCache,
  formatDate,
  formatDateWithLocale,
  getCalendarDays,
  getCalendarMonthDaysCacheSize,
  getDatePickerCalendarCellState,
  getDayNames,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthDays,
  getMonthNames,
  getShortDayNames,
  getShortMonthNames,
  formatMonthYear,
  isDateInRange,
  isSameDay,
  isToday,
  normalizeDate,
  parseDate
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

  it('formats localized date parts while preserving the requested format order', () => {
    const date = new Date(2024, 0, 5)

    expect(formatDate(date, 'yyyy-MM-dd', 'fr-FR')).toBe('2024-01-05')
    expect(formatDate(date, 'dd/MM/yyyy', 'fr-FR')).toBe('05/01/2024')
    expect(formatDate(date, 'yyyy/MM/dd', 'ar-SA')).not.toBe('2024/01/05')
    expect(formatDateWithLocale(date, 'de-DE', { dateStyle: 'medium' })).toBe(
      new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(date)
    )
  })

  it('parses dates and rejects invalid input', () => {
    const date = new Date(2024, 0, 5)

    expect(parseDate(undefined)).toBeNull()
    expect(parseDate(null)).toBeNull()
    expect(parseDate('not-a-date')).toBeNull()
    expect(parseDate(new Date(Number.NaN))).toBeNull()
    expect(parseDate(date)).toBe(date)
    expect(parseDate('2024-01-05')?.getFullYear()).toBe(2024)
  })

  it('formats legacy dates for every supported ASCII pattern', () => {
    const date = new Date(2024, 10, 9)

    expect(formatDate(null)).toBe('')
    expect(formatDate(new Date(Number.NaN))).toBe('')
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-11-09')
    expect(formatDate(date, 'MM/dd/yyyy')).toBe('11/09/2024')
    expect(formatDate(date, 'dd/MM/yyyy')).toBe('09/11/2024')
    expect(formatDate(date, 'yyyy/MM/dd')).toBe('2024/11/09')
  })

  it('falls back to legacy formatting when Intl construction fails', () => {
    const OriginalDateTimeFormat = Intl.DateTimeFormat
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function DateTimeFormatMock() {
      throw new Error('unsupported locale')
    } as unknown as typeof Intl.DateTimeFormat)

    expect(formatDate(new Date(2024, 0, 5), 'yyyy-MM-dd', 'xx-YY')).toBe('2024-01-05')
    expect(formatDateWithLocale(new Date(2024, 0, 5), 'xx-YY')).toBe('2024-01-05')

    vi.mocked(Intl.DateTimeFormat).mockRestore()
    expect(Intl.DateTimeFormat).toBe(OriginalDateTimeFormat)
  })

  it('compares and normalizes date boundaries', () => {
    const date = new Date(2024, 0, 5, 13, 30)

    expect(isSameDay(date, new Date(2024, 0, 5, 1))).toBe(true)
    expect(isSameDay(date, new Date(2024, 0, 6))).toBe(false)
    expect(isSameDay(date, null)).toBe(false)
    expect(normalizeDate(date)).toEqual(new Date(2024, 0, 5))
    expect(isDateInRange(date, new Date(2024, 0, 1), new Date(2024, 0, 31))).toBe(true)
    expect(isDateInRange(date, new Date(2024, 0, 6), undefined)).toBe(false)
    expect(isDateInRange(date, undefined, new Date(2024, 0, 4))).toBe(false)
    expect(isDateInRange(new Date(Number.NaN), undefined, undefined)).toBe(false)
  })

  it('returns month and weekday names with localized and fallback variants', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29)
    expect(getFirstDayOfMonth(2024, 0)).toBe(1)
    expect(formatMonthYear(2024, 0)).toBe('January 2024')
    expect(formatMonthYear(2024, 0, 'en-US')).toContain('2024')
    expect(getMonthNames()).toHaveLength(12)
    expect(getShortMonthNames()[0]).toBe('Jan')
    expect(getDayNames()).toEqual([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ])
    expect(getShortDayNames()[0]).toBe('Sun')
    expect(getMonthNames('fr-FR')[0]).toBeTruthy()
    expect(getShortMonthNames('fr-FR')).toHaveLength(12)
    expect(getDayNames('de-DE')).toHaveLength(7)
    expect(getShortDayNames('de-DE')).toHaveLength(7)
  })

  it('detects today using the current date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 3, 20, 10))

    expect(isToday(new Date(2024, 3, 20, 23))).toBe(true)
    expect(isToday(new Date(2024, 3, 21))).toBe(false)

    vi.useRealTimers()
  })

  it('derives DatePicker calendar cell state without DOM dependencies', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 15, 12))

    const state = getDatePickerCalendarCellState({
      date: new Date(2024, 0, 10),
      isCurrentMonth: (date) => date.getMonth() === 0,
      isDateDisabled: (date) => date < new Date(2024, 0, 9) || date > new Date(2024, 0, 20),
      selectedDate: new Date(2024, 0, 10, 12),
      selectedRange: [new Date(2024, 0, 8), new Date(2024, 0, 12)],
      isRangeMode: true
    })

    expect(state).toMatchObject({
      isCurrentMonthDay: true,
      isSelected: false,
      isInRange: true,
      isDisabled: false,
      isRangeEnd: false
    })

    const disabled = getDatePickerCalendarCellState({
      date: new Date(2024, 0, 8),
      isDateDisabled: (date) => date < new Date(2024, 0, 9)
    })
    expect(disabled.isDisabled).toBe(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })
})

describe('date-utils arithmetic', () => {
  it('adds and subtracts days immutably across month boundaries', () => {
    const base = new Date(2024, 0, 31)

    expect(addDays(base, 1)).toEqual(new Date(2024, 1, 1))
    expect(addDays(base, -31)).toEqual(new Date(2023, 11, 31))
    expect(addDays(base, 0)).toEqual(base)
    // input is not mutated
    expect(base).toEqual(new Date(2024, 0, 31))
  })

  it('adds months and clamps the day to the target month length', () => {
    expect(addMonths(new Date(2024, 0, 31), 1)).toEqual(new Date(2024, 1, 29)) // leap year
    expect(addMonths(new Date(2023, 0, 31), 1)).toEqual(new Date(2023, 1, 28)) // non-leap
    expect(addMonths(new Date(2024, 0, 15), -1)).toEqual(new Date(2023, 11, 15)) // year wrap
    expect(addMonths(new Date(2024, 11, 10), 1)).toEqual(new Date(2025, 0, 10))
  })

  it('adds years and clamps Feb 29 on non-leap targets', () => {
    expect(addYears(new Date(2024, 1, 29), 1)).toEqual(new Date(2025, 1, 28))
    expect(addYears(new Date(2024, 1, 29), 4)).toEqual(new Date(2028, 1, 29))
    expect(addYears(new Date(2024, 5, 15), -2)).toEqual(new Date(2022, 5, 15))
  })
})
