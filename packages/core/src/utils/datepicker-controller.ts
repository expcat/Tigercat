/**
 * DatePicker selection / display helpers. Vue/React bind DOM and overlay.
 */

import type { DateFormat, DatePickerModelValue, DatePickerShortcut } from '../types/datepicker'
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

export function coerceDatePickerRange(raw: unknown): DatePickerRangeTuple {
  if (raw == null) return [null, null]
  if (!Array.isArray(raw) || raw.length !== 2) {
    devWarn('DatePicker.range', 'range={true} expects a [start, end] tuple.')
    return [null, null]
  }
  return [
    toCalendarDate(raw[0] as Date | string | null),
    toCalendarDate(raw[1] as Date | string | null)
  ]
}

export function isDatePickerRangeComplete(value: DatePickerRangeTuple): boolean {
  return value[0] != null && value[1] != null
}

export function isDatePickerValueEmpty(
  range: boolean,
  value: Date | null | DatePickerRangeTuple
): boolean {
  if (range) {
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
  const [start, end] = value as DatePickerRangeTuple
  const startText = start ? formatDate(start, format, locale) : ''
  const endText = end ? formatDate(end, format, locale) : ''
  if (!startText && !endText) return ''
  if (startText && endText) return `${startText} - ${endText}`
  return startText ? `${startText} - ` : ` - ${endText}`
}

export function resolveDatePickerDisabled(
  date: Date,
  options: {
    minDate?: Date | null
    maxDate?: Date | null
    disabledDate?: (date: Date) => boolean
    rangeStart?: Date | null
    rangeSelectingEnd?: boolean
  }
): boolean {
  if (!isDateInRange(date, options.minDate ?? null, options.maxDate ?? null)) return true
  if (options.disabledDate?.(date)) return true
  if (options.rangeSelectingEnd && options.rangeStart && date < options.rangeStart) return true
  return false
}

export function commitDatePickerDay(input: {
  range: boolean
  picked: Date
  committed: Date | null | DatePickerRangeTuple
  preview: DatePickerRangeTuple | null
}): {
  nextCommitted: Date | null | DatePickerRangeTuple
  nextPreview: DatePickerRangeTuple | null
  close: boolean
} {
  const picked = toCalendarDate(input.picked)
  if (!picked) {
    return { nextCommitted: input.committed, nextPreview: input.preview, close: false }
  }

  if (!input.range) {
    return { nextCommitted: picked, nextPreview: null, close: true }
  }

  const current = input.preview ?? (input.committed as DatePickerRangeTuple)
  const [start, end] = current
  if (!start || (start && end)) {
    return { nextCommitted: input.committed, nextPreview: [picked, null], close: false }
  }
  const rangeEnd = picked < start ? start : picked
  return { nextCommitted: [start, rangeEnd], nextPreview: null, close: false }
}

export function commitDatePickerToday(
  range: boolean,
  today: Date
): { nextCommitted: Date | null | DatePickerRangeTuple; close: boolean } {
  const day = toCalendarDate(today) ?? today
  if (!range) return { nextCommitted: day, close: true }
  return { nextCommitted: [day, day], close: false }
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
  range: boolean
): Date | DatePickerRangeTuple | null {
  const trimmed = text.trim()
  if (!trimmed) return range ? [null, null] : null
  if (!range) return parseDate(trimmed, format)
  const parts = trimmed.split(/\s+-\s+/)
  if (parts.length === 1) return [parseDate(parts[0], format), null]
  return [parseDate(parts[0], format), parseDate(parts[1], format)]
}

export function serializeDatePickerValue(
  range: boolean,
  value: Date | null | DatePickerRangeTuple
): string {
  if (!range) return value ? toIsoDate(value as Date) : ''
  const [start, end] = value as DatePickerRangeTuple
  return `${start ? toIsoDate(start) : ''}|${end ? toIsoDate(end) : ''}`
}

export function isSamePickerDate(a: Date | null, b: Date | null): boolean {
  return isSameDay(a, b)
}

export function emptyDatePickerValue(range: boolean): Date | null | DatePickerRangeTuple {
  return range ? [null, null] : null
}

export function formDatePickerValue(
  range: boolean,
  value: Date | null | DatePickerRangeTuple,
  preview: DatePickerRangeTuple | null
): Date | null | DatePickerRangeTuple {
  if (!range) return value
  if (preview && !isDatePickerRangeComplete(preview)) return [null, null]
  return value
}
