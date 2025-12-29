/**
 * Date utility functions for DatePicker
 */

import type { DateFormat } from '../types/datepicker'

/**
 * Parse a date string or Date object to a Date instance
 */
export function parseDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Format a date according to the specified format
 */
export function formatDate(date: Date | null, format: DateFormat = 'yyyy-MM-dd'): string {
  if (!date) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
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
 * Check if a date is within a range
 */
export function isDateInRange(
  date: Date,
  minDate: Date | null | undefined,
  maxDate: Date | null | undefined
): boolean {
  if (minDate && date < minDate) return false
  if (maxDate && date > maxDate) return false
  return true
}

/**
 * Get the days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Get the first day of the month (0 = Sunday, 6 = Saturday)
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

/**
 * Get month names
 */
export function getMonthNames(): string[] {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
}

/**
 * Get short month names
 */
export function getShortMonthNames(): string[] {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}

/**
 * Get day names
 */
export function getDayNames(): string[] {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
}

/**
 * Get short day names
 */
export function getShortDayNames(): string[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return isSameDay(date, today)
}

/**
 * Normalize a date to midnight (00:00:00.000)
 */
export function normalizeDate(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}
