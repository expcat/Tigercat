/**
 * Date utility functions for DatePicker
 */

import type { WeekStartsOn } from '../types/calendar'
import type { DateFormat } from '../types/datepicker'

/** Date-only ISO (`YYYY-MM-DD`) with optional surrounding whitespace. */
const DATE_ONLY_ISO_RE = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/

const ASCII_DIGIT_RE = /[０-９٠-٩۰-۹]/g

export function toAsciiDigits(value: string): string {
  return value.replace(ASCII_DIGIT_RE, (ch) => {
    const code = ch.charCodeAt(0)
    if (code >= 0xff10 && code <= 0xff19) return String(code - 0xff10)
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660)
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0)
    return ch
  })
}

/**
 * Convert a Date or date-only string to a local-midnight calendar date.
 * UTC-midnight instants (`new Date('2024-01-15')`) use UTC Y-M-D so the
 * same calendar day is shown in every timezone.
 */
export function toCalendarDate(value: Date | string | null | undefined): Date | null {
  if (value == null || value === '') return null
  if (typeof value === 'string') return parseDate(value)
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null
  const isLocalMidnight =
    value.getHours() === 0 &&
    value.getMinutes() === 0 &&
    value.getSeconds() === 0 &&
    value.getMilliseconds() === 0
  const isUtcMidnight =
    value.getUTCHours() === 0 &&
    value.getUTCMinutes() === 0 &&
    value.getUTCSeconds() === 0 &&
    value.getUTCMilliseconds() === 0
  if (isUtcMidnight && !isLocalMidnight) {
    return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  }
  if (isLocalMidnight) return value
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function parseFormattedDate(value: string, format: DateFormat): Date | null {
  const ascii = toAsciiDigits(value).trim()
  const separator = format.includes('/') ? '/' : '-'
  const parts = ascii.split(separator)
  if (parts.length !== 3) return null
  let year: number
  let month: number
  let day: number
  switch (format) {
    case 'MM/dd/yyyy':
      month = Number(parts[0])
      day = Number(parts[1])
      year = Number(parts[2])
      break
    case 'dd/MM/yyyy':
      day = Number(parts[0])
      month = Number(parts[1])
      year = Number(parts[2])
      break
    case 'yyyy/MM/dd':
      year = Number(parts[0])
      month = Number(parts[1])
      day = Number(parts[2])
      break
    case 'yyyy-MM-dd':
    default:
      year = Number(parts[0])
      month = Number(parts[1])
      day = Number(parts[2])
      break
  }
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  const local = new Date(year, month - 1, day)
  if (local.getFullYear() !== year || local.getMonth() !== month - 1 || local.getDate() !== day) {
    return null
  }
  return local
}

/**
 * Parse `YYYY-MM-DD` as local calendar midnight (`Date(year, monthIndex, day)`).
 * Returns `undefined` when the string is not date-only so callers can fall through;
 * returns `null` for an impossible calendar day (Feb 30, month 13, non-leap Feb 29).
 */
function parseDateOnlyLocal(value: string): Date | null | undefined {
  const match = DATE_ONLY_ISO_RE.exec(value)
  if (!match) return undefined
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const local = new Date(year, month - 1, day)
  if (local.getFullYear() !== year || local.getMonth() !== month - 1 || local.getDate() !== day) {
    return null
  }
  return local
}

/**
 * Parse a date string or Date object to a Date instance.
 * Date-only ISO (`YYYY-MM-DD`, optional surrounding whitespace) is local calendar
 * midnight, not UTC midnight — equivalent to `new Date(year, monthIndex, day)`.
 * Impossible calendar dates (e.g. 2024-02-30, 2023-02-29) return null.
 * ISO datetimes with a time or offset still go through `new Date(value)`.
 * @param value - Date string, Date object, or null/undefined
 * @returns Date instance or null if invalid
 */
export function parseDate(
  value: Date | string | null | undefined,
  format?: DateFormat
): Date | null {
  if (value == null || value === '') return null
  if (value instanceof Date) return toCalendarDate(value)
  if (typeof value !== 'string') return null
  const ascii = toAsciiDigits(value)
  if (format) {
    const formatted = parseFormattedDate(ascii, format)
    if (formatted) return formatted
    if (format !== 'yyyy-MM-dd') return null
  }
  const dateOnly = parseDateOnlyLocal(ascii)
  if (dateOnly !== undefined) return dateOnly
  const parsed = new Date(ascii)
  if (Number.isNaN(parsed.getTime())) return null
  return toCalendarDate(parsed)
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

function getCalendarMonthDaysCacheKey(
  year: number,
  month: number,
  weekStartsOn: WeekStartsOn
): string {
  return `${year}:${month}:${weekStartsOn}`
}

export function clearCalendarMonthDaysCache(): void {
  calendarMonthDaysCache.clear()
}

export function getCalendarMonthDaysCacheSize(): number {
  return calendarMonthDaysCache.size
}

function getCalendarDayTimeValues(
  year: number,
  month: number,
  weekStartsOn: WeekStartsOn = 0
): readonly number[] {
  const normalized = getNormalizedMonth(year, month)
  const cacheKey = getCalendarMonthDaysCacheKey(normalized.year, normalized.month, weekStartsOn)
  const cachedDays = calendarMonthDaysCache.get(cacheKey)
  if (cachedDays) return cachedDays

  const firstDay = getFirstDayOfMonth(normalized.year, normalized.month)
  const leading = (firstDay - weekStartsOn + 7) % 7
  const daysInMonth = getDaysInMonth(normalized.year, normalized.month)
  const daysInPrevMonth = getDaysInMonth(normalized.year, normalized.month - 1)

  const days: number[] = []

  for (let i = leading - 1; i >= 0; i--) {
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
 * Get calendar days for a given month.
 * Always returns 42 dates including padding days from previous/next months.
 */
export function getCalendarDays(
  year: number,
  month: number,
  weekStartsOn: WeekStartsOn = 0
): Date[] {
  return getCalendarDayTimeValues(year, month, weekStartsOn).map((time) => new Date(time))
}

/**
 * Locale week start (0 = Sunday). Uses `Intl.Locale` weekInfo when available.
 */
export function getWeekStartsOn(locale?: string): WeekStartsOn {
  if (!locale) return 0
  const language = locale.split('-')[0]?.toLowerCase()
  if (language === 'ar') return 6
  try {
    const intlLocale = new Intl.Locale(locale)
    const weekInfo =
      (intlLocale as { weekInfo?: { firstDay?: number } }).weekInfo ??
      (typeof (intlLocale as { getWeekInfo?: () => { firstDay: number } }).getWeekInfo ===
      'function'
        ? (intlLocale as { getWeekInfo: () => { firstDay: number } }).getWeekInfo()
        : undefined)
    const firstDay = weekInfo?.firstDay
    if (firstDay === 7) return 0
    if (firstDay === 0) return 0
    if (firstDay != null && firstDay >= 1 && firstDay <= 6) return firstDay as WeekStartsOn
  } catch {
    /* ignore invalid locale ids */
  }
  if (language === 'en') return 0
  return 1
}

export function rotateWeekdayNames<T>(names: readonly T[], weekStartsOn: WeekStartsOn): T[] {
  if (weekStartsOn === 0) return names.slice() as T[]
  return names.slice(weekStartsOn).concat(names.slice(0, weekStartsOn)) as T[]
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
export function getDayNames(locale?: string, weekStartsOn: WeekStartsOn = 0): string[] {
  const fallback = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (!locale) return rotateWeekdayNames(fallback, weekStartsOn)

  // 2021-08-01 is a Sunday
  const base = new Date(2021, 7, 1)
  const names = Array.from({ length: 7 }, (_, i) =>
    safeIntlFormat(
      locale,
      { weekday: 'long' },
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    )
  )

  return rotateWeekdayNames(names.every(Boolean) ? names : fallback, weekStartsOn)
}

/**
 * Get short day names
 */
export function getShortDayNames(locale?: string, weekStartsOn: WeekStartsOn = 0): string[] {
  const fallback = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!locale) return rotateWeekdayNames(fallback, weekStartsOn)

  // 2021-08-01 is a Sunday
  const base = new Date(2021, 7, 1)
  const names = Array.from({ length: 7 }, (_, i) =>
    safeIntlFormat(
      locale,
      { weekday: 'short' },
      new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)
    )
  )

  return rotateWeekdayNames(names.every(Boolean) ? names : fallback, weekStartsOn)
}

/**
 * Check if a date is the same calendar day as `now` (defaults to wall clock).
 */
export function isToday(date: Date, now: Date = new Date()): boolean {
  return isSameDay(date, now)
}

export function formatCalendarDayNumber(date: Date, locale?: string): string {
  if (locale) {
    const text = safeIntlFormat(locale, { day: 'numeric' }, date)
    if (text) return text
  }
  return String(date.getDate())
}

export function formatCalendarDayLabel(date: Date, locale?: string): string {
  if (locale) {
    const text = safeIntlFormat(
      locale,
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      date
    )
    if (text) return text
  }
  return formatDate(date, 'yyyy-MM-dd')
}

export interface DatePickerCalendarCellStateInput {
  date: Date
  selectedDate?: Date | null
  selectedRange?: [Date | null, Date | null]
  isRangeMode?: boolean
  isCurrentMonth?: (date: Date) => boolean
  isDateDisabled?: (date: Date) => boolean
  now?: Date | null
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
    isTodayDay: input.now === null ? false : isToday(date, input.now ?? new Date()),
    isDisabled,
    isInRange,
    isRangeStart,
    isRangeEnd
  }
}
