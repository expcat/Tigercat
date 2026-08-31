/**
 * TimePicker selection / display helpers. Vue/React bind DOM and overlay.
 *
 * Column clicks edit a draft. Footer OK commits that draft. Escape / outside
 * dismiss drops it. `Now` and typed blur/Enter commit a complete value.
 * Empty range is `null`; a complete range is `[start, end]`.
 */

import type { TimeFormat, TimePickerLabels, TimePickerRangeTuple } from '../types/timepicker'
import { isBrowser } from './env'
import { devWarn } from './dev-warn'
import {
  formatTime,
  formatTimeDisplayWithLocale,
  generateHours,
  generateMinutes,
  generateSeconds,
  getTimePeriodLabels,
  isTimeInRange,
  padTwo,
  parseTime,
  to12HourFormat,
  to24HourFormat,
  type TimeParts
} from './time-utils'
import type { TimePickerFocusUnit } from './timepicker-utils'

export const TIME_PICKER_DESKTOP_QUERY = '(min-width: 640px)'

export function isTimePickerDesktopLayout(): boolean {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return true
  return window.matchMedia(TIME_PICKER_DESKTOP_QUERY).matches
}

export interface TimePickerConstraints {
  minTime?: string | null
  maxTime?: string | null
  disabledTime?: (time: string) => boolean
  hourStep: number
  minuteStep: number
  secondStep: number
  format: TimeFormat
  showSeconds: boolean
}

export interface TimePickerDraft {
  parts: TimeParts | null
  period: 'AM' | 'PM'
}

export interface TimePickerColumnOption {
  value: number | 'AM' | 'PM'
  label: string
  ariaLabel: string
  disabled: boolean
  selected: boolean
}

export interface TimePickerColumnModel {
  unit: TimePickerFocusUnit
  headerId: string
  listId: string
  label: string
  options: TimePickerColumnOption[]
}

function timeToSeconds(parts: TimeParts): number {
  return parts.hours * 3600 + parts.minutes * 60 + parts.seconds
}

function formatValue(parts: TimeParts, showSeconds: boolean): string {
  return formatTime(parts.hours, parts.minutes, parts.seconds, showSeconds)
}

function is24HourValueString(raw: string): boolean {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(raw.trim())
}

export function parseTimePickerValueString(raw: string): TimeParts | null {
  if (!is24HourValueString(raw)) return null
  return parseTime(raw)
}

export function coerceTimePickerSingle(raw: unknown): string | null {
  if (raw == null) return null
  if (Array.isArray(raw)) {
    devWarn('TimePicker.value', 'range={false} expected a 24-hour time string, not a tuple.')
    return null
  }
  if (typeof raw !== 'string') {
    devWarn('TimePicker.value', 'Expected a 24-hour "HH:mm" or "HH:mm:ss" string.')
    return null
  }
  if (raw === '') {
    devWarn('TimePicker.value', 'Empty string is not a valid time; use null/undefined.')
    return null
  }
  const parsed = parseTimePickerValueString(raw)
  if (!parsed) {
    devWarn('TimePicker.value', `"${raw}" is not a 24-hour "HH:mm" / "HH:mm:ss" string.`)
    return null
  }
  return formatValue(parsed, raw.trim().split(':').length === 3)
}

export function coerceTimePickerRange(raw: unknown): TimePickerRangeTuple | null {
  if (raw == null) return null
  if (!Array.isArray(raw) || raw.length !== 2) {
    devWarn('TimePicker.range', 'range={true} expects a [start, end] tuple or null.')
    return null
  }
  const start =
    raw[0] == null || raw[0] === ''
      ? null
      : typeof raw[0] === 'string'
        ? parseTimePickerValueString(raw[0])
        : null
  const end =
    raw[1] == null || raw[1] === ''
      ? null
      : typeof raw[1] === 'string'
        ? parseTimePickerValueString(raw[1])
        : null
  const startText = start
    ? formatValue(start, typeof raw[0] === 'string' && raw[0].split(':').length === 3)
    : null
  const endText = end
    ? formatValue(end, typeof raw[1] === 'string' && raw[1].split(':').length === 3)
    : null
  if (startText == null && endText == null) return null
  return [startText, endText]
}

export function emptyTimePickerValue(_range: boolean): string | null | TimePickerRangeTuple {
  return null
}

export function isTimePickerRangeComplete(
  value: TimePickerRangeTuple | null
): value is [string, string] {
  return Boolean(value && value[0] && value[1])
}

export function isTimePickerValueEmpty(
  range: boolean,
  value: string | null | TimePickerRangeTuple
): boolean {
  if (range) {
    if (value == null) return true
    const [start, end] = value as TimePickerRangeTuple
    return start == null && end == null
  }
  return value == null || value === ''
}

export function formTimePickerValue(
  range: boolean,
  value: string | null | TimePickerRangeTuple
): string | null | TimePickerRangeTuple {
  if (!range) return (value as string | null) ?? null
  if (!isTimePickerRangeComplete(value as TimePickerRangeTuple | null)) return null
  return value
}

export function formatTimePickerDisplay(
  range: boolean,
  value: string | null | TimePickerRangeTuple,
  format: TimeFormat,
  showSeconds: boolean,
  localeCode?: string
): string {
  const toDisplay = (timeStr: string | null): string => {
    const parsed = timeStr ? parseTime(timeStr) : null
    if (!parsed) return ''
    return formatTimeDisplayWithLocale(
      parsed.hours,
      parsed.minutes,
      parsed.seconds,
      format,
      showSeconds,
      localeCode
    )
  }

  if (!range) return toDisplay(value as string | null)
  if (value == null || !Array.isArray(value)) return ''
  const start = toDisplay(value[0])
  const end = toDisplay(value[1])
  if (!start && !end) return ''
  if (start && end) return `${start} - ${end}`
  return start ? `${start} - ` : ` - ${end}`
}

export function parseTypedTimePickerValue(
  text: string,
  format: TimeFormat,
  showSeconds: boolean,
  range: boolean,
  periodLabels?: { am: string; pm: string }
): string | null | TimePickerRangeTuple {
  const trimmed = text.trim()
  if (!trimmed) return null
  const parseOne = (chunk: string): string | null => {
    const parsed = parseTime(chunk, format === '12' ? { periodLabels } : { periodLabels })
    if (!parsed) return null
    return formatValue(parsed, showSeconds)
  }
  if (!range) return parseOne(trimmed)
  const parts = trimmed.split(/\s+-\s+/)
  if (parts.length === 1) {
    const start = parseOne(parts[0])
    return start ? [start, null] : null
  }
  const start = parseOne(parts[0])
  const end = parseOne(parts[1])
  if (!start && !end) return null
  return clampTimeRange(start, end)
}

export function seedTimePickerDraft(
  value: string | null | undefined,
  format: TimeFormat
): TimePickerDraft {
  const parsed = value ? parseTime(value) : null
  if (!parsed) return { parts: null, period: 'AM' }
  return {
    parts: parsed,
    period: format === '12' ? to12HourFormat(parsed.hours).period : 'AM'
  }
}

export function alignTimeToStep(parts: TimeParts, constraints: TimePickerConstraints): TimeParts {
  const { hourStep, minuteStep, secondStep, format, showSeconds } = constraints
  let hours = parts.hours
  if (format === '12') {
    const { hours: display, period } = to12HourFormat(hours)
    const list = generateHours(hourStep, '12')
    const alignedDisplay = list.includes(display)
      ? display
      : list.reduce((best, item) => (item <= display ? item : best), list[0])
    hours = to24HourFormat(alignedDisplay, period)
  } else {
    const list = generateHours(hourStep, '24')
    hours = list.includes(hours)
      ? hours
      : list.reduce((best, item) => (item <= hours ? item : best), list[0])
  }
  const minutesList = generateMinutes(minuteStep)
  const minutes = minutesList.includes(parts.minutes)
    ? parts.minutes
    : minutesList.reduce((best, item) => (item <= parts.minutes ? item : best), minutesList[0])
  if (!showSeconds) return { hours, minutes, seconds: 0 }
  const secondsList = generateSeconds(secondStep)
  const seconds = secondsList.includes(parts.seconds)
    ? parts.seconds
    : secondsList.reduce((best, item) => (item <= parts.seconds ? item : best), secondsList[0])
  return { hours, minutes, seconds }
}

export function isTimeSlotDisabled(parts: TimeParts, constraints: TimePickerConstraints): boolean {
  if (
    !isTimeInRange(
      parts.hours,
      parts.minutes,
      constraints.minTime,
      constraints.maxTime,
      parts.seconds
    )
  ) {
    return true
  }
  const value = formatValue(parts, constraints.showSeconds)
  if (constraints.disabledTime?.(value)) return true
  const aligned = alignTimeToStep(parts, constraints)
  return (
    aligned.hours !== parts.hours ||
    aligned.minutes !== parts.minutes ||
    aligned.seconds !== parts.seconds
  )
}

function candidateHours24(
  hourOption: number,
  format: TimeFormat,
  period: 'AM' | 'PM' | null
): number[] {
  if (format !== '12') return [hourOption]
  if (period) return [to24HourFormat(hourOption, period)]
  return [to24HourFormat(hourOption, 'AM'), to24HourFormat(hourOption, 'PM')]
}

export function isHourOptionDisabled(
  hourOption: number,
  constraints: TimePickerConstraints,
  period: 'AM' | 'PM' | null
): boolean {
  const hours24 = candidateHours24(hourOption, constraints.format, period)
  const minutes = generateMinutes(constraints.minuteStep)
  const seconds = constraints.showSeconds ? generateSeconds(constraints.secondStep) : [0]
  for (const hours of hours24) {
    for (const mins of minutes) {
      for (const secs of seconds) {
        if (!isTimeSlotDisabled({ hours, minutes: mins, seconds: secs }, constraints)) {
          return false
        }
      }
    }
  }
  return true
}

export function isMinuteOptionDisabled(
  minute: number,
  constraints: TimePickerConstraints,
  draft: TimePickerDraft
): boolean {
  const seconds = constraints.showSeconds ? generateSeconds(constraints.secondStep) : [0]
  const hours24 = draft.parts ? [draft.parts.hours] : generateHours(constraints.hourStep, '24')
  for (const hours of hours24) {
    for (const secs of seconds) {
      if (!isTimeSlotDisabled({ hours, minutes: minute, seconds: secs }, constraints)) {
        return false
      }
    }
  }
  return true
}

export function isSecondOptionDisabled(
  second: number,
  constraints: TimePickerConstraints,
  draft: TimePickerDraft
): boolean {
  if (draft.parts) {
    return isTimeSlotDisabled(
      { hours: draft.parts.hours, minutes: draft.parts.minutes, seconds: second },
      constraints
    )
  }
  const hours24 = generateHours(constraints.hourStep, '24')
  const minutes = generateMinutes(constraints.minuteStep)
  for (const hours of hours24) {
    for (const mins of minutes) {
      if (!isTimeSlotDisabled({ hours, minutes: mins, seconds: second }, constraints)) {
        return false
      }
    }
  }
  return true
}

export function applyTimePickerColumn(
  draft: TimePickerDraft,
  column: TimePickerFocusUnit,
  option: number | 'AM' | 'PM',
  constraints: TimePickerConstraints
): TimePickerDraft {
  const base = draft.parts ?? { hours: 0, minutes: 0, seconds: 0 }
  let { hours, minutes, seconds } = base
  let period = draft.period
  if (!constraints.showSeconds) seconds = 0

  if (column === 'hour') {
    const hourOption = option as number
    hours = constraints.format === '12' ? to24HourFormat(hourOption, period) : hourOption
  } else if (column === 'minute') {
    minutes = option as number
  } else if (column === 'second') {
    seconds = option as number
  } else {
    period = option as 'AM' | 'PM'
    const display = to12HourFormat(hours).hours
    hours = to24HourFormat(display, period)
  }

  return { parts: { hours, minutes, seconds }, period }
}

export function clampTimeRange(
  start: string | null,
  end: string | null
): TimePickerRangeTuple | null {
  if (!start && !end) return null
  if (!start || !end) return [start, end]
  const startParts = parseTime(start)
  const endParts = parseTime(end)
  if (!startParts || !endParts) return [start, end]
  if (timeToSeconds(endParts) < timeToSeconds(startParts)) return [start, start]
  return [start, end]
}

export function applyTimePickerRangeColumn(input: {
  draftRange: TimePickerRangeTuple | null
  activePart: 'start' | 'end'
  column: TimePickerFocusUnit
  option: number | 'AM' | 'PM'
  constraints: TimePickerConstraints
}): { nextRange: TimePickerRangeTuple | null; nextActivePart: 'start' | 'end' } {
  const current: TimePickerRangeTuple = input.draftRange ?? [null, null]
  const index = input.activePart === 'start' ? 0 : 1
  const seeded = seedTimePickerDraft(current[index], input.constraints.format)
  const nextDraft = applyTimePickerColumn(seeded, input.column, input.option, input.constraints)
  const nextTime = nextDraft.parts
    ? formatValue(nextDraft.parts, input.constraints.showSeconds)
    : null
  const next: TimePickerRangeTuple = [...current]
  next[index] = nextTime

  if (input.activePart === 'start' && next[1] && nextTime) {
    const clamped = clampTimeRange(nextTime, next[1])
    return { nextRange: clamped, nextActivePart: 'start' }
  }
  if (input.activePart === 'end' && next[0] && nextTime) {
    const clamped = clampTimeRange(next[0], nextTime)
    return { nextRange: clamped, nextActivePart: 'end' }
  }
  if (input.activePart === 'start' && next[1] == null && nextTime) {
    return { nextRange: next, nextActivePart: 'end' }
  }
  return {
    nextRange: next[0] == null && next[1] == null ? null : next,
    nextActivePart: input.activePart
  }
}

export function commitTimePickerOk(input: {
  range: boolean
  draft: TimePickerDraft
  draftRange: TimePickerRangeTuple | null
  constraints: TimePickerConstraints
}): { nextCommitted: string | null | TimePickerRangeTuple; close: boolean } | null {
  if (!input.range) {
    if (!input.draft.parts) return { nextCommitted: null, close: true }
    if (isTimeSlotDisabled(input.draft.parts, input.constraints)) return null
    return {
      nextCommitted: formatValue(input.draft.parts, input.constraints.showSeconds),
      close: true
    }
  }
  const clamped = input.draftRange ? clampTimeRange(input.draftRange[0], input.draftRange[1]) : null
  if (!isTimePickerRangeComplete(clamped)) return null
  const start = parseTime(clamped[0])
  const end = parseTime(clamped[1])
  if (!start || !end) return null
  if (isTimeSlotDisabled(start, input.constraints) || isTimeSlotDisabled(end, input.constraints)) {
    return null
  }
  return { nextCommitted: clamped, close: true }
}

export function commitTimePickerNow(
  range: boolean,
  now: Date,
  constraints: TimePickerConstraints
): { nextCommitted: string | null | TimePickerRangeTuple; close: boolean } {
  const aligned = alignTimeToStep(
    { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() },
    constraints
  )
  const text = formatValue(aligned, constraints.showSeconds)
  if (!range) return { nextCommitted: text, close: true }
  return { nextCommitted: [text, text], close: false }
}

export function visibleTimePickerColumns(
  format: TimeFormat,
  showSeconds: boolean
): TimePickerFocusUnit[] {
  const columns: TimePickerFocusUnit[] = ['hour', 'minute']
  if (showSeconds) columns.push('second')
  if (format === '12') columns.push('period')
  return columns
}

export function adjacentTimePickerColumn(
  current: TimePickerFocusUnit,
  columns: TimePickerFocusUnit[],
  dir: 'ltr' | 'rtl',
  key: 'ArrowLeft' | 'ArrowRight'
): TimePickerFocusUnit | null {
  const index = columns.indexOf(current)
  if (index < 0) return null
  const movingNext =
    (key === 'ArrowRight' && dir !== 'rtl') || (key === 'ArrowLeft' && dir === 'rtl')
  const nextIndex = movingNext ? index + 1 : index - 1
  return columns[nextIndex] ?? null
}

export function mobileSelectColumnCount(format: TimeFormat, showSeconds: boolean): 2 | 3 | 4 {
  return visibleTimePickerColumns(format, showSeconds).length as 2 | 3 | 4
}

export function buildTimePickerColumns(input: {
  instanceId: string
  draft: TimePickerDraft
  constraints: TimePickerConstraints
  labels: TimePickerLabels
  periodLabels: { am: string; pm: string }
}): TimePickerColumnModel[] {
  const { draft, constraints, labels, periodLabels, instanceId } = input
  const selected = draft.parts
  const periodForHours = selected ? draft.period : null
  const columns: TimePickerColumnModel[] = []

  const hourOptions = generateHours(constraints.hourStep, constraints.format).map((hour) => {
    const selectedHour = selected
      ? constraints.format === '12'
        ? to12HourFormat(selected.hours).hours === hour &&
          draft.period === to12HourFormat(selected.hours).period
        : selected.hours === hour
      : false
    return {
      value: hour,
      label: padTwo(hour),
      ariaLabel: `${padTwo(hour)} ${labels.hour}`,
      disabled: isHourOptionDisabled(hour, constraints, periodForHours),
      selected: Boolean(selectedHour)
    }
  })
  columns.push({
    unit: 'hour',
    headerId: `${instanceId}-hour-label`,
    listId: `${instanceId}-hour-list`,
    label: labels.hour,
    options: hourOptions
  })

  const minuteOptions = generateMinutes(constraints.minuteStep).map((minute) => ({
    value: minute,
    label: padTwo(minute),
    ariaLabel: `${padTwo(minute)} ${labels.minute}`,
    disabled: isMinuteOptionDisabled(minute, constraints, draft),
    selected: Boolean(selected && selected.minutes === minute)
  }))
  columns.push({
    unit: 'minute',
    headerId: `${instanceId}-minute-label`,
    listId: `${instanceId}-minute-list`,
    label: labels.minute,
    options: minuteOptions
  })

  if (constraints.showSeconds) {
    const secondOptions = generateSeconds(constraints.secondStep).map((second) => ({
      value: second,
      label: padTwo(second),
      ariaLabel: `${padTwo(second)} ${labels.second}`,
      disabled: isSecondOptionDisabled(second, constraints, draft),
      selected: Boolean(selected && selected.seconds === second)
    }))
    columns.push({
      unit: 'second',
      headerId: `${instanceId}-second-label`,
      listId: `${instanceId}-second-list`,
      label: labels.second,
      options: secondOptions
    })
  }

  if (constraints.format === '12') {
    columns.push({
      unit: 'period',
      headerId: `${instanceId}-period-label`,
      listId: `${instanceId}-period-list`,
      label: labels.period,
      options: [
        {
          value: 'AM',
          label: periodLabels.am,
          ariaLabel: periodLabels.am,
          disabled: false,
          selected: Boolean(selected && draft.period === 'AM')
        },
        {
          value: 'PM',
          label: periodLabels.pm,
          ariaLabel: periodLabels.pm,
          disabled: false,
          selected: Boolean(selected && draft.period === 'PM')
        }
      ]
    })
  }

  return columns
}

export function resolveTimePickerNow(
  now: Date | undefined,
  constraints: TimePickerConstraints
): { text: string; parts: TimeParts; aligned: boolean } {
  const clock = now ?? new Date()
  const parts = {
    hours: clock.getHours(),
    minutes: clock.getMinutes(),
    seconds: clock.getSeconds()
  }
  const aligned = alignTimeToStep(parts, constraints)
  const wasAligned =
    aligned.hours === parts.hours &&
    aligned.minutes === parts.minutes &&
    aligned.seconds === parts.seconds
  if (!wasAligned) {
    devWarn(
      'TimePicker.now',
      `Clock time ${formatValue(parts, constraints.showSeconds)} is not on the configured step; using ${formatValue(aligned, constraints.showSeconds)}.`
    )
  }
  return {
    text: formatValue(aligned, constraints.showSeconds),
    parts: aligned,
    aligned: wasAligned
  }
}

export { getTimePeriodLabels }
