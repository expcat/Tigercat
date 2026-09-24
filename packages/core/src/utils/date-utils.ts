/**
 * Date utility functions for DatePicker
 */

import type { WeekStartsOn } from '../types/calendar'
import type { DateFormat } from '../types/datepicker'

/** Date-only ISO (`YYYY-MM-DD`) with optional surrounding whitespace. */
const DATE_ONLY_ISO_RE = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/

/**
 * Starts of contiguous Unicode Nd blocks of length 10.
 * Offset from the base is the digit 0–9. Do not use `Number(char)` —
 * it is NaN for non-ASCII decimal digits.
 */
const ND_DIGIT_BASES: readonly number[] = [
  0x30, 0x660, 0x6f0, 0x7c0, 0x966, 0x9e6, 0xa66, 0xae6, 0xb66, 0xbe6, 0xc66, 0xce6, 0xd66,
  0xde6, 0xe50, 0xed0, 0xf20, 0x1040, 0x1090, 0x17e0, 0x1810, 0x1946, 0x19d0, 0x1a80, 0x1a90,
  0x1b50, 0x1bb0, 0x1c40, 0x1c50, 0xa620, 0xa8d0, 0xa900, 0xa9d0, 0xa9f0, 0xaa50, 0xabf0, 0xff10,
  0x104a0, 0x10d30, 0x10d40, 0x11066, 0x110f0, 0x11136, 0x111d0, 0x112f0, 0x11450, 0x114d0,
  0x11650, 0x116c0, 0x116d0, 0x116da, 0x11730, 0x118e0, 0x11950, 0x11bf0, 0x11c50, 0x11d50,
  0x11da0, 0x11f50, 0x16130, 0x16a60, 0x16ac0, 0x16b50, 0x16d70, 0x1ccf0, 0x1d7ce, 0x1d7d8,
  0x1d7e2, 0x1d7ec, 0x1d7f6, 0x1e140, 0x1e2f0, 0x1e4f0, 0x1e5f1, 0x1e950, 0x1fbf0
]

function ndDigitToAscii(codePoint: number): string | null {
  let lo = 0
  let hi = ND_DIGIT_BASES.length - 1
  let base = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const candidate = ND_DIGIT_BASES[mid]
    if (candidate <= codePoint) {
      base = candidate
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  if (base < 0) return null
  const offset = codePoint - base
  if (offset > 9) return null
  return String(offset)
}

export function toAsciiDigits(value: string): string {
  let out = ''
  for (const ch of value) {
    const mapped = ndDigitToAscii(ch.codePointAt(0) ?? 0)
    out += mapped ?? ch
  }
  return out
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

function readDatePart(part: string): number {
  const digits = toAsciiDigits(part).replace(/\D/g, '')
  if (!digits) return Number.NaN
  return Number(digits)
}

function localMidnight(year: number, month: number, day: number): Date | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  const local = new Date(year, month - 1, day)
  if (local.getFullYear() !== year || local.getMonth() !== month - 1 || local.getDate() !== day) {
    return null
  }
  return local
}

function resolvedCalendarId(locale: string): string | null {
  try {
    return new Intl.DateTimeFormat(locale).resolvedOptions().calendar || 'gregory'
  } catch {
    return null
  }
}

function isGregorianCalendarLocale(locale: string | undefined): boolean {
  if (!locale) return true
  const calendar = resolvedCalendarId(locale)
  if (!calendar) return true
  return calendar === 'gregory' || calendar === 'iso8601'
}

function seedGregorianYear(calendar: string, year: number): number {
  if (calendar === 'buddhist') return year - 543
  if (calendar.startsWith('persian')) return year + 621
  if (calendar.startsWith('islamic')) return year + 579
  return year
}

interface CalendarYmd {
  year: number
  month: number
  day: number
}

function readLatnYmd(fmt: Intl.DateTimeFormat, date: Date): CalendarYmd | null {
  const parts = fmt.formatToParts(date)
  let year = Number.NaN
  let month = Number.NaN
  let day = Number.NaN
  for (const part of parts) {
    if (part.type === 'year') year = Number(part.value)
    else if (part.type === 'month') month = Number(part.value)
    else if (part.type === 'day') day = Number(part.value)
  }
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  return { year, month, day }
}

function sameCalendarYmd(formatted: CalendarYmd, year: number, month: number, day: number): boolean {
  return formatted.year === year && formatted.month === month && formatted.day === day
}

/**
 * Convert a calendar Y-M-D (the numbers `formatDate` showed for `locale`)
 * into a Gregorian local-midnight Date. Never constructs `new Date(buddhistYear, …)`.
 */
function calendarYmdToGregorian(
  year: number,
  month: number,
  day: number,
  locale: string
): Date | null {
  const calendar = resolvedCalendarId(locale)
  if (!calendar || calendar === 'gregory' || calendar === 'iso8601') {
    return localMidnight(year, month, day)
  }
  let fmt: Intl.DateTimeFormat
  try {
    fmt = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      numberingSystem: 'latn'
    })
  } catch {
    return null
  }

  let cursor = new Date(seedGregorianYear(calendar, year), Math.max(0, month - 1), 1)
  if (Number.isNaN(cursor.getTime())) return null

  for (let i = 0; i < 12; i++) {
    const formatted = readLatnYmd(fmt, cursor)
    if (!formatted) return null
    if (sameCalendarYmd(formatted, year, month, day)) {
      return localMidnight(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate())
    }
    const signature = cursor.getTime()
    if (formatted.year !== year) {
      cursor = new Date(
        cursor.getFullYear() + (year - formatted.year),
        cursor.getMonth(),
        Math.min(cursor.getDate(), 28)
      )
    } else if (formatted.month !== month) {
      cursor = addMonths(cursor, month - formatted.month)
    } else {
      cursor = addDays(cursor, day - formatted.day)
    }
    if (Number.isNaN(cursor.getTime()) || cursor.getTime() === signature) break
  }

  const center = cursor
  for (let offset = 0; offset <= 400; offset++) {
    const deltas = offset === 0 ? [0] : [offset, -offset]
    for (const delta of deltas) {
      const candidate = addDays(center, delta)
      const formatted = readLatnYmd(fmt, candidate)
      if (formatted && sameCalendarYmd(formatted, year, month, day)) {
        return localMidnight(candidate.getFullYear(), candidate.getMonth() + 1, candidate.getDate())
      }
    }
  }
  return null
}

function parseFormattedDate(value: string, format: DateFormat, locale?: string): Date | null {
  const ascii = toAsciiDigits(value).trim()
  const separator = format.includes('/') ? '/' : '-'
  const parts = ascii.split(separator)
  if (parts.length !== 3) return null
  let year: number
  let month: number
  let day: number
  switch (format) {
    case 'MM/dd/yyyy':
      month = readDatePart(parts[0])
      day = readDatePart(parts[1])
      year = readDatePart(parts[2])
      break
    case 'dd/MM/yyyy':
      day = readDatePart(parts[0])
      month = readDatePart(parts[1])
      year = readDatePart(parts[2])
      break
    case 'yyyy/MM/dd':
      year = readDatePart(parts[0])
      month = readDatePart(parts[1])
      day = readDatePart(parts[2])
      break
    case 'yyyy-MM-dd':
    default:
      year = readDatePart(parts[0])
      month = readDatePart(parts[1])
      day = readDatePart(parts[2])
      break
  }
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
  if (!locale || isGregorianCalendarLocale(locale)) return localMidnight(year, month, day)
  return calendarYmdToGregorian(year, month, day, locale)
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
  format?: DateFormat,
  locale?: string
): Date | null {
  if (value == null || value === '') return null
  if (value instanceof Date) return toCalendarDate(value)
  if (typeof value !== 'string') return null
  const ascii = toAsciiDigits(value)
  if (format) {
    const formatted = parseFormattedDate(ascii, format, locale)
    if (formatted) return formatted
    if (locale && !isGregorianCalendarLocale(locale)) return null
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

interface LocaleWeekInfo {
  firstDay?: number
}

function readLocaleWeekInfo(locale: Intl.Locale): LocaleWeekInfo | undefined {
  const candidate = locale as Intl.Locale & {
    weekInfo?: LocaleWeekInfo
    getWeekInfo?: () => LocaleWeekInfo
  }
  if (candidate.weekInfo) return candidate.weekInfo
  if (typeof candidate.getWeekInfo === 'function') return candidate.getWeekInfo()
  return undefined
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
    const weekInfo = readLocaleWeekInfo(intlLocale)
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
      if (intlCache.size >= 64) {
        const oldest = intlCache.keys().next().value
        if (oldest !== undefined) intlCache.delete(oldest)
      }
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
      if (intlCache.size >= 64) {
        const oldest = intlCache.keys().next().value
        if (oldest !== undefined) intlCache.delete(oldest)
      }
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
  const isDisabled = Boolean(input.isDateDisabled?.(date))

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

export type CalendarUnit = 'date' | 'week' | 'month' | 'quarter' | 'year' | 'datetime'

const UNIT_PATTERNS: Record<CalendarUnit, RegExp> = {
  date: /^\d{4}-\d{2}-\d{2}$/,
  week: /^\d{4}-W\d{2}$/,
  month: /^\d{4}-\d{2}$/,
  quarter: /^\d{4}-Q[1-4]$/,
  year: /^\d{4}$/,
  datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?$/
}

export function isCalendarUnitValue(value: string, unit: CalendarUnit): boolean {
  return UNIT_PATTERNS[unit].test(value)
}

function isoWeekParts(date: Date): { year: number; week: number } {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { year: utc.getUTCFullYear(), week }
}

function dateFromIsoWeek(year: number, week: number): Date {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7))
  const day = simple.getUTCDay() || 7
  if (day <= 4) simple.setUTCDate(simple.getUTCDate() - day + 1)
  else simple.setUTCDate(simple.getUTCDate() + 8 - day)
  return new Date(simple.getUTCFullYear(), simple.getUTCMonth(), simple.getUTCDate())
}

/** Store one explicit calendar unit. `date` is `YYYY-MM-DD`; datetime may carry an offset. */
export function formatCalendarUnit(
  date: Date,
  unit: CalendarUnit,
  timeZone?: string
): string {
  const zoned = timeZone ? dateInTimeZone(date, timeZone) : date
  const y = zoned.getFullYear()
  const m = String(zoned.getMonth() + 1).padStart(2, '0')
  const d = String(zoned.getDate()).padStart(2, '0')
  if (unit === 'year') return String(y)
  if (unit === 'month') return `${y}-${m}`
  if (unit === 'quarter') return `${y}-Q${Math.floor(zoned.getMonth() / 3) + 1}`
  if (unit === 'week') {
    const iso = isoWeekParts(zoned)
    return `${iso.year}-W${String(iso.week).padStart(2, '0')}`
  }
  if (unit === 'datetime') {
    const hh = String(zoned.getHours()).padStart(2, '0')
    const mm = String(zoned.getMinutes()).padStart(2, '0')
    const wall = `${y}-${m}-${d}T${hh}:${mm}`
    if (!timeZone) return wall
    const offset = timeZoneOffset(date, timeZone)
    return `${wall}${offset}`
  }
  return `${y}-${m}-${d}`
}

export function parseCalendarUnit(value: string, unit: CalendarUnit): Date | null {
  if (!isCalendarUnitValue(value, unit)) return null
  if (unit === 'year') return new Date(Number(value), 0, 1)
  if (unit === 'month') {
    const [year, month] = value.split('-').map(Number)
    return new Date(year, month - 1, 1)
  }
  if (unit === 'quarter') {
    const [yearText, quarterText] = value.split('-Q')
    return new Date(Number(yearText), (Number(quarterText) - 1) * 3, 1)
  }
  if (unit === 'week') {
    const [yearText, weekText] = value.split('-W')
    return dateFromIsoWeek(Number(yearText), Number(weekText))
  }
  if (unit === 'datetime') {
    const parsed = new Date(value.length === 16 ? `${value}:00` : value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return toCalendarDate(value)
}

export function dateInTimeZone(date: Date, timeZone: string): Date {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date)
    const pick = (type: Intl.DateTimeFormatPartTypes): number =>
      Number(parts.find((part) => part.type === type)?.value ?? '0')
    return new Date(
      pick('year'),
      pick('month') - 1,
      pick('day'),
      pick('hour'),
      pick('minute'),
      pick('second')
    )
  } catch {
    return date
  }
}

function timeZoneOffset(date: Date, timeZone: string): string {
  const zoned = dateInTimeZone(date, timeZone)
  const utc = new Date(date.getTime())
  const diffMinutes = Math.round((zoned.getTime() - Date.UTC(
    utc.getUTCFullYear(),
    utc.getUTCMonth(),
    utc.getUTCDate(),
    utc.getUTCHours(),
    utc.getUTCMinutes(),
    utc.getUTCSeconds()
  )) / 60000)
  // Compare wall clock in zone against the instant's UTC fields via format offset.
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
      hour: '2-digit'
    }).format(date)
    const match = formatted.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/)
    if (!match) return 'Z'
    const hours = String(Math.abs(Number(match[1]))).padStart(2, '0')
    const minutes = match[2] ?? '00'
    const sign = match[1].startsWith('-') ? '-' : '+'
    if (hours === '00' && minutes === '00') return 'Z'
    return `${sign}${hours}:${minutes}`
  } catch {
    const sign = diffMinutes >= 0 ? '+' : '-'
    const abs = Math.abs(diffMinutes)
    return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
  }
}

export interface CalendarSegments {
  year: string
  month: string
  day: string
  hour: string
  minute: string
}

export function calendarUnitSegments(value: string, unit: CalendarUnit): CalendarSegments {
  const date = parseCalendarUnit(value, unit)
  if (!date) return { year: '', month: '', day: '', hour: '', minute: '' }
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
    hour: String(date.getHours()).padStart(2, '0'),
    minute: String(date.getMinutes()).padStart(2, '0')
  }
}

export function calendarUnitFromSegments(
  segments: Partial<CalendarSegments>,
  unit: CalendarUnit
): string | null {
  const year = Number(segments.year)
  const month = Number(segments.month || '1')
  const day = Number(segments.day || '1')
  const hour = Number(segments.hour || '0')
  const minute = Number(segments.minute || '0')
  if (!Number.isInteger(year) || year < 1) return null
  const date = new Date(year, (month || 1) - 1, day || 1, hour, minute)
  if (Number.isNaN(date.getTime())) return null
  return formatCalendarUnit(date, unit)
}

export function toggleCalendarUnitValue(values: readonly string[], next: string): string[] {
  return values.includes(next) ? values.filter((item) => item !== next) : [...values, next]
}

export function shiftCalendarMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}
