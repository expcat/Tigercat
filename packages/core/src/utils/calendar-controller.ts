/**
 * Calendar panel controller — view month, selection, and keyboard.
 * Vue/React only bind DOM and controlled state.
 */

import type { CalendarMode, WeekStartsOn } from '../types/calendar'
import { isCalendarMonthDisabled } from './calendar-utils'
import { addDays, addMonths, addYears, formatDate, isSameDay, toCalendarDate } from './date-utils'

export interface CalendarPanelView {
  viewYear: number
  viewMonth: number
}

export interface CalendarDayMoveResult extends CalendarPanelView {
  iso: string
}

export function toIsoDate(date: Date): string {
  return formatDate(date, 'yyyy-MM-dd')
}

export function panelDate(view: CalendarPanelView, day = 1): Date {
  return new Date(view.viewYear, view.viewMonth, day)
}

export function getInitialCalendarView(
  selected: Date | null,
  now?: Date | null
): CalendarPanelView {
  const base = selected ?? (now && !Number.isNaN(now.getTime()) ? now : null)
  if (base) {
    return { viewYear: base.getFullYear(), viewMonth: base.getMonth() }
  }
  const fallback = new Date()
  return { viewYear: fallback.getFullYear(), viewMonth: fallback.getMonth() }
}

/**
 * Jump the panel when a new selected Y-M-D is outside the current month.
 * Same-day identity changes (or the user paging around an unchanged value)
 * must not reset the view.
 */
export function followCalendarValue(
  view: CalendarPanelView,
  next: Date | null,
  previousYmd: string | null
): CalendarPanelView | null {
  if (!next) return null
  const ymd = toIsoDate(next)
  if (ymd === previousYmd) return null
  if (next.getFullYear() === view.viewYear && next.getMonth() === view.viewMonth) return null
  return { viewYear: next.getFullYear(), viewMonth: next.getMonth() }
}

export function shiftCalendarMonth(view: CalendarPanelView, delta: number): CalendarPanelView {
  const next = addMonths(panelDate(view), delta)
  return { viewYear: next.getFullYear(), viewMonth: next.getMonth() }
}

export function shiftCalendarYear(view: CalendarPanelView, delta: number): CalendarPanelView {
  return { viewYear: view.viewYear + delta, viewMonth: view.viewMonth }
}

export function isCalendarDateDisabled(
  date: Date,
  disabledDate?: (date: Date) => boolean
): boolean {
  return Boolean(disabledDate?.(date))
}

export function resolveCalendarRovingIso(input: {
  days: readonly Date[]
  selected: Date | null
  today: Date | null
  view: CalendarPanelView
  disabledDate?: (date: Date) => boolean
  activeIso?: string | null
}): string | null {
  const { days, selected, today, view, disabledDate, activeIso } = input
  const enabled = days.filter((date) => !isCalendarDateDisabled(date, disabledDate))
  if (enabled.length === 0) return null

  const pick = (iso: string | null | undefined): Date | undefined =>
    iso ? enabled.find((date) => toIsoDate(date) === iso) : undefined

  const active = pick(activeIso)
  if (active) return toIsoDate(active)

  if (selected) {
    const selectedIso = toIsoDate(selected)
    const match = pick(selectedIso)
    if (match) return selectedIso
  }

  if (today && today.getFullYear() === view.viewYear && today.getMonth() === view.viewMonth) {
    const todayIso = toIsoDate(today)
    const match = pick(todayIso)
    if (match) return todayIso
  }

  const firstOfMonth = enabled.find(
    (date) => date.getFullYear() === view.viewYear && date.getMonth() === view.viewMonth
  )
  return toIsoDate(firstOfMonth ?? enabled[0])
}

export function resolveCalendarRovingMonth(input: {
  viewMonth: number
  viewYear: number
  disabledDate?: (date: Date) => boolean
  activeMonthIdx?: number | null
}): number {
  const { viewMonth, viewYear, disabledDate, activeMonthIdx } = input
  const enabled: number[] = []
  for (let month = 0; month < 12; month++) {
    if (!isCalendarMonthDisabled(viewYear, month, disabledDate)) enabled.push(month)
  }
  if (enabled.length === 0) return viewMonth
  if (activeMonthIdx != null && enabled.includes(activeMonthIdx)) return activeMonthIdx
  if (enabled.includes(viewMonth)) return viewMonth
  const nearest = enabled.reduce((best, month) =>
    Math.abs(month - viewMonth) < Math.abs(best - viewMonth) ? month : best
  )
  return nearest
}

export function selectCalendarDay(
  date: Date,
  disabledDate?: (date: Date) => boolean
): CalendarDayMoveResult | null {
  const selected = toCalendarDate(date)
  if (!selected || isCalendarDateDisabled(selected, disabledDate)) return null
  return {
    iso: toIsoDate(selected),
    viewYear: selected.getFullYear(),
    viewMonth: selected.getMonth()
  }
}

export function selectCalendarMonth(
  viewYear: number,
  monthIdx: number,
  disabledDate?: (date: Date) => boolean
): { date: Date; mode: CalendarMode } | null {
  if (monthIdx < 0 || monthIdx > 11) return null
  if (isCalendarMonthDisabled(viewYear, monthIdx, disabledDate)) return null
  return { date: new Date(viewYear, monthIdx, 1), mode: 'month' }
}

function weekdayOffset(date: Date, weekStartsOn: WeekStartsOn): number {
  return (date.getDay() - weekStartsOn + 7) % 7
}

function findEnabledDate(
  start: Date,
  step: number,
  disabledDate: ((date: Date) => boolean) | undefined,
  maxAttempts: number
): Date | null {
  let candidate = start
  for (let i = 0; i < maxAttempts; i++) {
    if (!isCalendarDateDisabled(candidate, disabledDate)) return candidate
    candidate = addDays(candidate, step)
  }
  return null
}

export function moveCalendarDayFocus(input: {
  currentIso: string
  kind: 'delta' | 'home' | 'end' | 'page-month' | 'page-year'
  delta?: number
  weekStartsOn: WeekStartsOn
  disabledDate?: (date: Date) => boolean
}): CalendarDayMoveResult | null {
  const current = toCalendarDate(input.currentIso)
  if (!current) return null
  const { kind, delta = 0, weekStartsOn, disabledDate } = input

  let target: Date | null = null
  if (kind === 'delta') {
    target = findEnabledDate(addDays(current, delta), Math.sign(delta) || 1, disabledDate, 42)
  } else if (kind === 'home') {
    const start = addDays(current, -weekdayOffset(current, weekStartsOn))
    target = findEnabledDate(start, 1, disabledDate, 7)
  } else if (kind === 'end') {
    const end = addDays(current, 6 - weekdayOffset(current, weekStartsOn))
    target = findEnabledDate(end, -1, disabledDate, 7)
  } else if (kind === 'page-month') {
    const shifted = addMonths(current, delta)
    target = findEnabledDate(shifted, Math.sign(delta) || 1, disabledDate, 42)
  } else {
    const shifted = addYears(current, delta)
    target = findEnabledDate(shifted, Math.sign(delta) || 1, disabledDate, 42)
  }

  if (!target) return null
  return {
    iso: toIsoDate(target),
    viewYear: target.getFullYear(),
    viewMonth: target.getMonth()
  }
}

export function moveCalendarMonthFocus(input: {
  current: number
  kind: 'delta' | 'home' | 'end'
  delta?: number
  viewYear: number
  disabledDate?: (date: Date) => boolean
}): number | null {
  const enabled: number[] = []
  for (let month = 0; month < 12; month++) {
    if (!isCalendarMonthDisabled(input.viewYear, month, input.disabledDate)) {
      enabled.push(month)
    }
  }
  if (enabled.length === 0) return null

  if (input.kind === 'home') return enabled[0]
  if (input.kind === 'end') return enabled[enabled.length - 1]

  const delta = input.delta ?? 0
  const from = enabled.indexOf(input.current)
  const start = from < 0 ? (delta > 0 ? -1 : enabled.length) : from
  const next = start + Math.sign(delta)
  if (next < 0 || next >= enabled.length) return enabled[from < 0 ? 0 : from]
  return enabled[next]
}

export type CalendarDayKeyKind = 'delta' | 'home' | 'end' | 'page-month' | 'page-year' | 'none'

export interface CalendarDayKeyAction {
  kind: CalendarDayKeyKind
  delta?: number
}

export function getCalendarDayKeyAction(
  key: string,
  dir: 'ltr' | 'rtl',
  altKey = false
): CalendarDayKeyAction {
  const inline = dir === 'rtl' ? -1 : 1
  switch (key) {
    case 'ArrowRight':
      return { kind: 'delta', delta: inline }
    case 'ArrowLeft':
      return { kind: 'delta', delta: -inline }
    case 'ArrowUp':
      return { kind: 'delta', delta: -7 }
    case 'ArrowDown':
      return { kind: 'delta', delta: 7 }
    case 'Home':
      return { kind: 'home' }
    case 'End':
      return { kind: 'end' }
    case 'PageUp':
      return altKey ? { kind: 'page-year', delta: -1 } : { kind: 'page-month', delta: -1 }
    case 'PageDown':
      return altKey ? { kind: 'page-year', delta: 1 } : { kind: 'page-month', delta: 1 }
    default:
      return { kind: 'none' }
  }
}

export function getCalendarMonthKeyAction(
  key: string,
  dir: 'ltr' | 'rtl'
): { kind: 'delta' | 'home' | 'end' | 'none'; delta?: number } {
  const inline = dir === 'rtl' ? -1 : 1
  switch (key) {
    case 'ArrowRight':
      return { kind: 'delta', delta: inline }
    case 'ArrowLeft':
      return { kind: 'delta', delta: -inline }
    case 'ArrowDown':
      return { kind: 'delta', delta: 3 }
    case 'ArrowUp':
      return { kind: 'delta', delta: -3 }
    case 'Home':
      return { kind: 'home' }
    case 'End':
      return { kind: 'end' }
    default:
      return { kind: 'none' }
  }
}

export function isSameCalendarDay(a: Date | null, b: Date | null): boolean {
  return isSameDay(a, b)
}

export function chunkDaysIntoWeeks(days: readonly Date[]): Date[][] {
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7) as Date[])
  return weeks
}

export function chunkMonths(monthNames: readonly string[]): string[][] {
  const rows: string[][] = []
  for (let i = 0; i < monthNames.length; i += 3) {
    rows.push(monthNames.slice(i, i + 3) as string[])
  }
  return rows
}
