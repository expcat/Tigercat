/**
 * One time formatter for ChatWindow, CommentThread, ActivityFeed, and
 * NotificationCenter. `0` is a legal Unix epoch; `''` / null / Invalid Date
 * are empty; ISO strings are parsed; any other string is already formatted.
 */

import { resolveCallerTimeZone } from './caller-clock'

export type CompositeTimeValue = string | number | Date

export type CompositeTimeLocale = string | { locale?: string } | null | undefined

export type CompositeTimeStyle = 'time' | 'datetime'

const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}(?:[Tt ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:[Zz]|[+-]\d{2}:?\d{2})?)?$/

export function isCompositeTimeEmpty(
  value: CompositeTimeValue | null | undefined
): value is null | undefined | '' {
  return value == null || value === ''
}

export function resolveCompositeTimeLocale(locale?: CompositeTimeLocale): string | undefined {
  if (!locale) return undefined
  if (typeof locale === 'string') return locale || undefined
  return locale.locale || undefined
}

export function parseCompositeTime(value: CompositeTimeValue | null | undefined): Date | null {
  if (isCompositeTimeEmpty(value)) return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  const trimmed = value.trim()
  if (!ISO_DATE_RE.test(trimmed)) return null
  const date = new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date
}

export interface FormatCompositeTimeOptions extends Intl.DateTimeFormatOptions {
  style?: CompositeTimeStyle
}

function formatResolvedDate(
  date: Date,
  localeId: string | undefined,
  style: CompositeTimeStyle,
  timeZone: string,
  intlOptions: Intl.DateTimeFormatOptions | undefined
): string {
  const options = { ...intlOptions, timeZone }
  try {
    return style === 'time'
      ? date.toLocaleTimeString(localeId, options)
      : date.toLocaleString(localeId, options)
  } catch {
    return ''
  }
}

export function formatCompositeTime(
  value?: CompositeTimeValue | null,
  locale?: CompositeTimeLocale,
  options?: FormatCompositeTimeOptions
): string {
  if (isCompositeTimeEmpty(value)) return ''
  const { style = 'datetime', timeZone, ...intlOptions } = options ?? {}
  const zone = resolveCallerTimeZone(timeZone)
  if (typeof value === 'string') {
    const parsed = parseCompositeTime(value)
    if (!parsed) return value
    if (!zone) return ''
    return formatResolvedDate(parsed, resolveCompositeTimeLocale(locale), style, zone, intlOptions)
  }
  if (!zone) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return formatResolvedDate(date, resolveCompositeTimeLocale(locale), style, zone, intlOptions)
}

export const formatChatTime = (
  value?: CompositeTimeValue | null,
  locale?: CompositeTimeLocale,
  options?: Intl.DateTimeFormatOptions
): string => formatCompositeTime(value, locale, { style: 'time', ...options })

export const formatCommentTime = (
  value?: CompositeTimeValue | null,
  locale?: CompositeTimeLocale,
  options?: Intl.DateTimeFormatOptions
): string => formatCompositeTime(value, locale, { style: 'datetime', ...options })

export const formatActivityTime = formatCommentTime
