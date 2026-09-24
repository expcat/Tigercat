/**
 * DatePicker selection / display helpers. Vue/React bind DOM and overlay.
 */

import type { DateFormat, DatePickerShortcut } from '../types/datepicker'
import { devWarn } from './dev-warn'
import { toIsoDate } from './calendar-controller'
import { formatDate, isDateInRange, isSameDay, parseDate, toCalendarDate } from './date-utils'

export type DatePickerRangeTuple = [Date | null, Date | null]

export function coerceDatePickerSingle(raw: unknown): Date | null {
  if (Array.isArray(raw)) {
    devWarn('DatePicker.value', 'range={false} expected a Date or string, not a tuple.')
    return null
  }
  return toCalendarDate(raw as Date | string | null | undefined)
}

export function coerceDatePickerRange(raw: unknown): DatePickerRangeTuple | null {
  if (raw == null) return null
  if (!Array.isArray(raw) || raw.length !== 2) {
    devWarn('DatePicker.range', 'range={true} expects a [start, end] tuple.')
    return null
  }
  const start = toCalendarDate(raw[0] as Date | string | null)
  const end = toCalendarDate(raw[1] as Date | string | null)
  if (start == null && end == null) return null
  return [start, end]
}

export function isDatePickerRangeComplete(value: DatePickerRangeTuple): boolean {
  return value[0] != null && value[1] != null
}

export function isDatePickerValueEmpty(
  range: boolean,
  value: Date | null | DatePickerRangeTuple
): boolean {
  if (range) {
    if (value == null) return true
    const [start, end] = value as DatePickerRangeTuple
    return start == null && end == null
  }
  return value == null
}

export function formatDatePickerDisplay(
  range: boolean,
  value: Date | null | DatePickerRangeTuple,
  format: DateFormat,
  locale?: string
): string {
  if (!range) {
    return value ? formatDate(value as Date, format, locale) : ''
  }
  if (value == null) return ''
  const [start, end] = value as DatePickerRangeTuple
  const startText = start ? formatDate(start, format, locale) : ''
  const endText = end ? formatDate(end, format, locale) : ''
  if (!startText && !endText) return ''
  if (startText && endText) return `${startText} - ${endText}`
  return startText ? `${startText} - ` : ` - ${endText}`
}

export interface DatePickerBounds {
  minDate?: Date | null
  maxDate?: Date | null
  disabledDate?: (date: Date) => boolean
}

export const datePickerInvalidReason = 'Enter a valid date.'
export const datePickerUnavailableReason = 'That date is not available.'
export const datePickerMissingStartReason = 'Choose a start date.'
export const datePickerMissingEndReason = 'Choose an end date.'

export type DatePickerAcceptResult =
  | { ok: true; value: Date | null | DatePickerRangeTuple }
  | { ok: false; reason: string }

export function resolveDatePickerDisabled(
  date: Date,
  options: {
    minDate?: Date | null
    maxDate?: Date | null
    disabledDate?: (date: Date) => boolean
  }
): boolean {
  if (!isDateInRange(date, options.minDate ?? null, options.maxDate ?? null)) return true
  if (options.disabledDate?.(date)) return true
  return false
}

function dateUnavailable(date: Date, bounds: DatePickerBounds): boolean {
  return resolveDatePickerDisabled(date, bounds)
}

export function acceptDatePickerCandidate(
  range: boolean,
  candidate: Date | null | DatePickerRangeTuple,
  bounds: DatePickerBounds = {}
): DatePickerAcceptResult {
  if (!range) {
    if (candidate == null || Array.isArray(candidate)) return { ok: true, value: null }
    const day = toCalendarDate(candidate)
    if (!day) return { ok: false, reason: datePickerInvalidReason }
    if (dateUnavailable(day, bounds)) return { ok: false, reason: datePickerUnavailableReason }
    return { ok: true, value: day }
  }
  if (candidate == null || !Array.isArray(candidate)) return { ok: true, value: null }
  const start = candidate[0] ? toCalendarDate(candidate[0]) : null
  const end = candidate[1] ? toCalendarDate(candidate[1]) : null
  if (candidate[0] && !start) return { ok: false, reason: datePickerInvalidReason }
  if (candidate[1] && !end) return { ok: false, reason: datePickerInvalidReason }
  if (start && dateUnavailable(start, bounds)) {
    return { ok: false, reason: datePickerUnavailableReason }
  }
  if (end && dateUnavailable(end, bounds)) {
    return { ok: false, reason: datePickerUnavailableReason }
  }
  if (!start && !end) return { ok: true, value: null }
  if (start && end && end.getTime() < start.getTime()) return { ok: true, value: [end, start] }
  return { ok: true, value: [start, end] }
}

export function commitDatePickerDay(input: {
  range: boolean
  picked: Date
  committed: Date | null | DatePickerRangeTuple
  preview: DatePickerRangeTuple | null
  bounds?: DatePickerBounds
}): {
  nextCommitted: Date | null | DatePickerRangeTuple
  nextPreview: DatePickerRangeTuple | null
  close: boolean
  commit: boolean
  error?: string
} {
  const bounds = input.bounds ?? {}
  const picked = toCalendarDate(input.picked)
  if (!picked) {
    return {
      nextCommitted: input.committed,
      nextPreview: input.preview,
      close: false,
      commit: false,
      error: datePickerInvalidReason
    }
  }
  const dayCheck = acceptDatePickerCandidate(false, picked, bounds)
  if (!dayCheck.ok) {
    return {
      nextCommitted: input.committed,
      nextPreview: input.preview,
      close: false,
      commit: false,
      error: dayCheck.reason
    }
  }
  const day = dayCheck.value as Date

  if (!input.range) {
    return { nextCommitted: day, nextPreview: null, close: true, commit: true }
  }

  const current =
    input.preview ?? (Array.isArray(input.committed) ? input.committed : [null, null])
  const [start, end] = current
  if (!start || end) {
    return {
      nextCommitted: input.committed,
      nextPreview: [day, null],
      close: false,
      commit: false
    }
  }
  const ordered: DatePickerRangeTuple = day.getTime() < start.getTime() ? [day, start] : [start, day]
  const accepted = acceptDatePickerCandidate(true, ordered, bounds)
  if (!accepted.ok) {
    return {
      nextCommitted: input.committed,
      nextPreview: input.preview,
      close: false,
      commit: false,
      error: accepted.reason
    }
  }
  return {
    nextCommitted: accepted.value as DatePickerRangeTuple,
    nextPreview: null,
    close: false,
    commit: true
  }
}

export function confirmDatePicker(input: {
  preview: DatePickerRangeTuple | null
  committed: Date | null | DatePickerRangeTuple
  bounds?: DatePickerBounds
}): {
  close: boolean
  error?: string
  nextCommitted: Date | null | DatePickerRangeTuple
  nextPreview: DatePickerRangeTuple | null
} {
  const preview = input.preview
  const bounds = input.bounds ?? {}
  const missingStart = Boolean(preview && preview[0] == null && preview[1] != null)
  const missingEnd = Boolean(preview && preview[0] != null && preview[1] == null)
  if (missingStart || missingEnd) {
    return {
      close: false,
      error: missingStart ? datePickerMissingStartReason : datePickerMissingEndReason,
      nextCommitted: input.committed,
      nextPreview: preview
    }
  }
  if (preview && preview[0] && preview[1]) {
    const accepted = acceptDatePickerCandidate(true, preview, bounds)
    if (!accepted.ok) {
      return {
        close: false,
        error: accepted.reason,
        nextCommitted: input.committed,
        nextPreview: preview
      }
    }
    return { close: true, nextCommitted: accepted.value, nextPreview: null }
  }
  return { close: true, nextCommitted: input.committed, nextPreview: null }
}

export function commitDatePickerToday(
  range: boolean,
  today: Date,
  bounds: DatePickerBounds = {}
):
  | { nextCommitted: Date | null | DatePickerRangeTuple; close: boolean }
  | { error: string; close: false } {
  const day = toCalendarDate(today)
  if (!day) return { error: datePickerInvalidReason, close: false }
  if (!range) {
    const accepted = acceptDatePickerCandidate(false, day, bounds)
    if (!accepted.ok) return { error: accepted.reason, close: false }
    return { nextCommitted: accepted.value, close: true }
  }
  const accepted = acceptDatePickerCandidate(true, [day, day], bounds)
  if (!accepted.ok) return { error: accepted.reason, close: false }
  return { nextCommitted: accepted.value, close: false }
}

export function parseDatePickerShortcut(
  shortcut: DatePickerShortcut,
  range: boolean
): Date | null | DatePickerRangeTuple | null {
  const raw = typeof shortcut.value === 'function' ? shortcut.value() : shortcut.value
  if (range) {
    if (!Array.isArray(raw) || raw.length !== 2) {
      devWarn('DatePicker.shortcut', 'Range shortcuts must be a [start, end] tuple.')
      return null
    }
    const start = toCalendarDate(raw[0] as Date | string | null)
    const end = toCalendarDate(raw[1] as Date | string | null)
    if (start == null && end == null) return null
    return [start, end]
  }
  if (raw == null) return null
  if (Array.isArray(raw)) {
    devWarn('DatePicker.shortcut', 'Single-date shortcuts must be a Date or string.')
    return null
  }
  const parsed = toCalendarDate(raw)
  if (!parsed) {
    devWarn('DatePicker.shortcut', 'Shortcut value could not be parsed as a date.')
    return null
  }
  return parsed
}

export function parseTypedDatePickerValue(
  text: string,
  format: DateFormat,
  range: boolean,
  locale?: string
): Date | DatePickerRangeTuple | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  if (!range) return parseDate(trimmed, format, locale)
  const parts = trimmed.split(/\s+-\s+/)
  if (parts.length === 1) return [parseDate(parts[0], format, locale), null]
  return [parseDate(parts[0], format, locale), parseDate(parts[1], format, locale)]
}

export function resolveTypedDatePickerCommit(
  text: string,
  format: DateFormat,
  range: boolean,
  locale: string | undefined,
  bounds: DatePickerBounds = {}
): DatePickerAcceptResult {
  const trimmed = text.trim()
  if (!trimmed) return { ok: true, value: null }
  if (!range) {
    const parsed = parseDate(trimmed, format, locale)
    if (!parsed) return { ok: false, reason: datePickerInvalidReason }
    return acceptDatePickerCandidate(false, parsed, bounds)
  }
  const parts = trimmed.split(/\s+-\s+/)
  if (parts.length < 2 || !parts[1]?.trim()) {
    return { ok: false, reason: datePickerMissingEndReason }
  }
  if (!parts[0]?.trim()) return { ok: false, reason: datePickerMissingStartReason }
  const start = parseDate(parts[0], format, locale)
  const end = parseDate(parts[1], format, locale)
  if (!start || !end) return { ok: false, reason: datePickerInvalidReason }
  return acceptDatePickerCandidate(true, [start, end], bounds)
}

export function serializeDatePickerValue(
  range: boolean,
  value: Date | null | DatePickerRangeTuple
): string {
  if (!range) return value instanceof Date ? toIsoDate(value) : ''
  if (!Array.isArray(value)) return ''
  const [start, end] = value
  if (!start && !end) return ''
  return `${start ? toIsoDate(start) : ''}|${end ? toIsoDate(end) : ''}`
}

export function isSamePickerDate(a: Date | null, b: Date | null): boolean {
  if (a == null || b == null) return a == null && b == null
  return isSameDay(a, b)
}

export function isSameDatePickerValue(
  range: boolean,
  a: Date | null | DatePickerRangeTuple,
  b: Date | null | DatePickerRangeTuple
): boolean {
  if (!range) return isSamePickerDate(a instanceof Date ? a : null, b instanceof Date ? b : null)
  const left = Array.isArray(a) ? a : null
  const right = Array.isArray(b) ? b : null
  const leftEmpty = left == null || (left[0] == null && left[1] == null)
  const rightEmpty = right == null || (right[0] == null && right[1] == null)
  if (leftEmpty || rightEmpty) return leftEmpty && rightEmpty
  return isSamePickerDate(left![0], right![0]) && isSamePickerDate(left![1], right![1])
}

export function emptyDatePickerValue(_range: boolean): Date | null | DatePickerRangeTuple {
  return null
}

export function formDatePickerValue(
  range: boolean,
  value: Date | null | DatePickerRangeTuple
): Date | null | DatePickerRangeTuple {
  if (!range) return (value as Date | null) ?? null
  if (!Array.isArray(value)) return null
  if (value[0] == null && value[1] == null) return null
  return value
}
