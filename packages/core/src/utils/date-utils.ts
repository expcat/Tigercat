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

/**
 * Format a date according to the specified format
 * @param date - Date to format
 * @param format - Date format string
 * @returns Formatted date string, empty string if date is null
 */
export function formatDate(date: Date | null, format: DateFormat = 'yyyy-MM-dd'): string {
  if (!date || isNaN(date.getTime())) return ''

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

/**
 * Get calendar days for a given month
 * Returns array of dates including padding days from previous/next months
 */
export function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInMonth = getDaysInMonth(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)

  const days: (Date | null)[] = []

  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, daysInPrevMonth - i))
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  // Next month's days (to fill the grid)
  const remainingDays = 42 - days.length // 6 rows × 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

function safeIntlFormat(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
  date: Date
): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date)
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
