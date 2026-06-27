/**
 * Date utility functions for DatePicker
 */

import type { DateFormat } from '../types/datepicker'

/**
 * Parse a date string or Date object to a Date instance
 * @param value - Date string, Date object, or null/undefined
 * @returns Date instance or null if invalid
 */
export function parseDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed
}

const defaultDateFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}

function getDateFormatParts(format: DateFormat): Array<'year' | 'month' | 'day' | '-' | '/'> {
  switch (format) {
    case 'MM/dd/yyyy':
      return ['month', '/', 'day', '/', 'year']
    case 'dd/MM/yyyy':
      return ['day', '/', 'month', '/', 'year']
    case 'yyyy/MM/dd':
      return ['year', '/', 'month', '/', 'day']
    case 'yyyy-MM-dd':
    default:
      return ['year', '-', 'month', '-', 'day']
  }
}

/**
 * Format a date according to the specified format.
 * Passing a locale uses Intl.DateTimeFormat for localized digits/order.
 * Omitting locale preserves the legacy fixed ASCII output.
 * @param date - Date to format
 * @param format - Date format string
 * @param locale - Optional BCP 47 locale identifier
 * @returns Formatted date string, empty string if date is null
 */
export function formatDate(
  date: Date | null,
  format: DateFormat = 'yyyy-MM-dd',
  locale?: string
): string {
  if (!date || isNaN(date.getTime())) return ''

  if (locale) {
    const localized = safeIntlFormatDateParts(locale, format, date)
    if (localized) return localized
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  // Use switch for better performance (no object allocation per call)
  switch (format) {
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`
    case 'MM/dd/yyyy':
      return `${month}/${day}/${year}`
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`
    case 'yyyy/MM/dd':
      return `${year}/${month}/${day}`
    default:
      return `${year}-${month}-${day}`
  }
}

export function formatDateWithLocale(
  date: Date | null,
  locale?: string,
  options: Intl.DateTimeFormatOptions = defaultDateFormatOptions
): string {
  if (!date || isNaN(date.getTime())) return ''
  if (!locale) return formatDate(date)

  const localized = safeIntlFormat(locale, options, date)
  return localized || formatDate(date)
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Normalize a date to midnight (00:00:00.000)
 * @param date - Date to normalize
 * @returns Normalized date
 */
export function normalizeDate(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

/**
 * Return a new Date offset by the given number of days. Immutable.
 * @param date - Base date
 * @param days - Number of days to add (may be negative)
 * @returns New Date instance
 */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/**
 * Return a new Date offset by the given number of months. Immutable.
 * The day-of-month is clamped to the last valid day of the target month
 * (e.g. Jan 31 + 1 month -> Feb 28/29).
 * @param date - Base date
 * @param months - Number of months to add (may be negative)
 * @returns New Date instance
 */
export function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  const day = next.getDate()
  next.setDate(1)
  next.setMonth(next.getMonth() + months)
  const maxDay = getDaysInMonth(next.getFullYear(), next.getMonth())
  next.setDate(Math.min(day, maxDay))
  return next
}

/**
 * Return a new Date offset by the given number of years. Immutable.
 * Feb 29 is clamped to Feb 28 on non-leap target years.
 * @param date - Base date
 * @param years - Number of years to add (may be negative)
 * @returns New Date instance
 */
export function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12)
}

/**
 * Check if a date is within a range
 * @param date - Date to check
 * @param minDate - Minimum allowed date
 * @param maxDate - Maximum allowed date
 * @returns True if date is within the range (inclusive)
 */
export function isDateInRange(
  date: Date,
  minDate: Date | null | undefined,
  maxDate: Date | null | undefined
): boolean {
  if (isNaN(date.getTime())) return false

  const normalizedDate = normalizeDate(date)

  if (minDate && !isNaN(minDate.getTime())) {
    if (normalizedDate < normalizeDate(minDate)) return false
  }

  if (maxDate && !isNaN(maxDate.getTime())) {
    if (normalizedDate > normalizeDate(maxDate)) return false
  }

  return true
}

/**
 * Get the days in a month
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Number of days in the month
 */
export function getDaysInMonth(year: number, month: number): number {
  // month + 1, day 0 gives the last day of the previous month
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Get the first day of the month (0 = Sunday, 6 = Saturday)
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Day of week (0-6)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

const calendarMonthDaysCache = new Map<string, readonly number[]>()
const maxCalendarMonthDaysCacheSize = 48

function getNormalizedMonth(year: number, month: number): { year: number; month: number } {
  const date = new Date(year, month, 1)
  return {
    year: date.getFullYear(),
    month: date.getMonth()
  }
}

function getCalendarMonthDaysCacheKey(year: number, month: number): string {
  return `${year}:${month}`
}

export function clearCalendarMonthDaysCache(): void {
  calendarMonthDaysCache.clear()
}

export function getCalendarMonthDaysCacheSize(): number {
  return calendarMonthDaysCache.size
}

function getCalendarDayTimeValues(year: number, month: number): readonly number[] {
  const normalized = getNormalizedMonth(year, month)
  const cacheKey = getCalendarMonthDaysCacheKey(normalized.year, normalized.month)
  const cachedDays = calendarMonthDaysCache.get(cacheKey)
  if (cachedDays) return cachedDays

  const firstDay = getFirstDayOfMonth(normalized.year, normalized.month)
  const daysInMonth = getDaysInMonth(normalized.year, normalized.month)
  const daysInPrevMonth = getDaysInMonth(normalized.year, normalized.month - 1)

  const days: number[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(normalized.year, normalized.month - 1, daysInPrevMonth - i).getTime())
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(normalized.year, normalized.month, i).getTime())
  }

  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(normalized.year, normalized.month + 1, i).getTime())
  }

  if (calendarMonthDaysCache.size >= maxCalendarMonthDaysCacheSize) {
    const firstKey = calendarMonthDaysCache.keys().next().value
    if (firstKey) {
      calendarMonthDaysCache.delete(firstKey)
    }
  }

  const frozenDays = Object.freeze(days)
  calendarMonthDaysCache.set(cacheKey, frozenDays)
  return frozenDays
}

/**
 * Get calendar days for a given month
 * Returns array of dates including padding days from previous/next months
 */
export function getCalendarDays(year: number, month: number): (Date | null)[] {
  return getCalendarDayTimeValues(year, month).map((time) => new Date(time))
}

const intlCache = new Map<string, Intl.DateTimeFormat>()

function safeIntlFormat(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
  date: Date
): string {
  try {
    const key = `${locale ?? ''}_${JSON.stringify(options)}`
    let fmt = intlCache.get(key)
    if (!fmt) {
      fmt = new Intl.DateTimeFormat(locale, options)
      intlCache.set(key, fmt)
    }
    return fmt.format(date)
  } catch {
    return ''
  }
}

function safeIntlFormatDateParts(locale: string, format: DateFormat, date: Date): string {
  try {
    const key = `${locale}_${JSON.stringify(defaultDateFormatOptions)}_parts`
    let fmt = intlCache.get(key)
    if (!fmt) {
      fmt = new Intl.DateTimeFormat(locale, defaultDateFormatOptions)
      intlCache.set(key, fmt)
    }
    const parts = fmt.formatToParts(date)
    const partMap = new Map(parts.map((part) => [part.type, part.value]))
    const year = partMap.get('year')
    const month = partMap.get('month')
    const day = partMap.get('day')
    if (!year || !month || !day) return ''
    return getDateFormatParts(format)
      .map((part) => {
        if (part === 'year') return year
        if (part === 'month') return month
        if (part === 'day') return day
        return part
      })
      .join('')
  } catch {
    return ''
  }
}

/**
 * Format the calendar header (month + year) using Intl for a given locale.
 * Falls back to English month names when Intl is unavailable.
 */
export function formatMonthYear(year: number, month: number, locale?: string): string {
  if (locale) {
    const text = safeIntlFormat(
      locale,
      { year: 'numeric', month: 'long' },
      new Date(year, month, 1)
    )
    if (text) return text
  }

  const monthNames = getMonthNames()
  return `${monthNames[month]} ${year}`
}

/**
 * Get month names
 */
export function getMonthNames(locale?: string): string[] {
  const fallback = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  if (!locale) return fallback

  const names = Array.from({ length: 12 }, (_, i) =>
    safeIntlFormat(locale, { month: 'long' }, new Date(2020, i, 1))
  )

  return names.every(Boolean) ? names : fallback
}

/**
 * Get short month names
 */
export function getShortMonthNames(locale?: string): string[] {
  const fallback = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  if (!locale) return fallback

  const names = Array.from({ length: 12 }, (_, i) =>
    safeIntlFormat(locale, { month: 'short' }, new Date(2020, i, 1))
  )

  return names.every(Boolean) ? names : fallback
}

/**
 * Get day names
 */
export function getDayNames(locale?: string): string[] {
  const fallback = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (!locale) return fallback

  // 2021-08-01 is a Sunday
  const base = new Date(2021, 7, 1)
  const names = Array.from({ length: 7 }, (_, i) =>
    safeIntlFormat(
      locale,
      { weekday: 'long' },
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    )
  )

  return names.every(Boolean) ? names : fallback
}

/**
 * Get short day names
 */
export function getShortDayNames(locale?: string): string[] {
  const fallback = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!locale) return fallback

  // 2021-08-01 is a Sunday
  const base = new Date(2021, 7, 1)
  const names = Array.from({ length: 7 }, (_, i) =>
    safeIntlFormat(
      locale,
      { weekday: 'short' },
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    )
  )

  return names.every(Boolean) ? names : fallback
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return isSameDay(date, today)
}

export interface DatePickerCalendarCellStateInput {
  date: Date
  selectedDate?: Date | null
  selectedRange?: [Date | null, Date | null]
  isRangeMode?: boolean
  isCurrentMonth?: (date: Date) => boolean
  isDateDisabled?: (date: Date) => boolean
}

export interface DatePickerCalendarCellState {
  iso: string
  isCurrentMonthDay: boolean
  isSelected: boolean
  isTodayDay: boolean
  isDisabled: boolean
  isInRange: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
}

export function getDatePickerCalendarCellState(
  input: DatePickerCalendarCellStateInput
): DatePickerCalendarCellState {
  const { date, selectedDate = null, selectedRange = [null, null], isRangeMode = false } = input
  const [rangeStart, rangeEnd] = selectedRange
  const normDate = normalizeDate(date)
  const normStart = rangeStart ? normalizeDate(rangeStart) : null
  const normEnd = rangeEnd ? normalizeDate(rangeEnd) : null
  const isSelectingEnd = isRangeMode && Boolean(rangeStart) && !rangeEnd

  const isRangeStart = isRangeMode && rangeStart ? isSameDay(date, rangeStart) : false
  const isRangeEnd = isRangeMode && rangeEnd ? isSameDay(date, rangeEnd) : false
  const isInRange = Boolean(
    isRangeMode && normStart && normEnd && normDate >= normStart && normDate <= normEnd
  )
  const isSelected = !isRangeMode
    ? selectedDate
      ? isSameDay(date, selectedDate)
      : false
    : isRangeStart || isRangeEnd
  const isBeforeRangeStart = Boolean(isSelectingEnd && normStart && normDate < normStart)
  const isDisabled = Boolean(input.isDateDisabled?.(date)) || isBeforeRangeStart

  return {
    iso: formatDate(date, 'yyyy-MM-dd'),
    isCurrentMonthDay: input.isCurrentMonth?.(date) ?? true,
    isSelected,
    isTodayDay: isToday(date),
    isDisabled,
    isInRange,
    isRangeStart,
    isRangeEnd
  }
}
