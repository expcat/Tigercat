/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  followCalendarValue,
  getCalendarDayKeyAction,
  getInitialCalendarView,
  getWeekStartsOn,
  moveCalendarDayFocus,
  moveCalendarMonthFocus,
  resolveCalendarRovingIso,
  selectCalendarDay,
  selectCalendarMonth,
  shiftCalendarMonth,
  toIsoDate
} from '@expcat/tigercat-core'

describe('calendar controller', () => {
  it('initializes the panel from the selected date', () => {
    expect(getInitialCalendarView(new Date(2024, 7, 20), new Date(2024, 0, 1))).toEqual({
      viewYear: 2024,
      viewMonth: 7
    })
  })

  it('follows a value into another month and ignores same-day identity changes', () => {
    const view = { viewYear: 2024, viewMonth: 5 }
    const june = new Date(2024, 5, 15)
    expect(followCalendarValue(view, june, '2024-06-15')).toBeNull()
    expect(followCalendarValue(view, new Date(2024, 7, 20), '2024-06-15')).toEqual({
      viewYear: 2024,
      viewMonth: 7
    })
  })

  it('shifts months across year boundaries', () => {
    expect(shiftCalendarMonth({ viewYear: 2024, viewMonth: 11 }, 1)).toEqual({
      viewYear: 2025,
      viewMonth: 0
    })
  })

  it('selects a day and rejects a disabled date', () => {
    const picked = selectCalendarDay(new Date(2024, 5, 20))
    expect(picked?.iso).toBe('2024-06-20')
    expect(selectCalendarDay(new Date(2024, 5, 20), (date) => date.getDate() === 20)).toBeNull()
  })

  it('year-view month pick writes the 1st and switches to month mode', () => {
    expect(selectCalendarMonth(2024, 2)).toEqual({
      date: new Date(2024, 2, 1),
      mode: 'month'
    })
    expect(selectCalendarMonth(2024, 2, (date) => date.getMonth() === 2)).toBeNull()
  })

  it('skips disabled days when moving focus and pages across months', () => {
    const weekends = (date: Date) => date.getDay() === 0 || date.getDay() === 6
    const next = moveCalendarDayFocus({
      currentIso: '2024-06-14',
      kind: 'delta',
      delta: 1,
      weekStartsOn: 0,
      disabledDate: weekends
    })
    expect(next?.iso).toBe('2024-06-17')

    const paged = moveCalendarDayFocus({
      currentIso: '2024-06-15',
      kind: 'page-month',
      delta: 1,
      weekStartsOn: 0
    })
    expect(paged).toEqual({ iso: '2024-07-15', viewYear: 2024, viewMonth: 6 })
  })

  it('Home/End stay inside the week and skip disabled ends', () => {
    const home = moveCalendarDayFocus({
      currentIso: '2024-06-15',
      kind: 'home',
      weekStartsOn: 0
    })
    expect(home?.iso).toBe('2024-06-09')
    const end = moveCalendarDayFocus({
      currentIso: '2024-06-15',
      kind: 'end',
      weekStartsOn: 0
    })
    expect(end?.iso).toBe('2024-06-15')
  })

  it('mirrors inline arrows in RTL', () => {
    expect(getCalendarDayKeyAction('ArrowRight', 'rtl')).toEqual({ kind: 'delta', delta: -1 })
    expect(getCalendarDayKeyAction('ArrowLeft', 'ltr')).toEqual({ kind: 'delta', delta: -1 })
    expect(getCalendarDayKeyAction('PageUp', 'ltr', true)).toEqual({
      kind: 'page-year',
      delta: -1
    })
  })

  it('month-grid focus skips a fully disabled month', () => {
    const next = moveCalendarMonthFocus({
      current: 1,
      kind: 'delta',
      delta: 1,
      viewYear: 2024,
      disabledDate: (date) => date.getMonth() === 2
    })
    expect(next).toBe(3)
  })

  it('picks a tab stop even when selected and today are disabled', () => {
    const days = Array.from({ length: 3 }, (_, i) => new Date(2024, 5, 14 + i))
    const iso = resolveCalendarRovingIso({
      days,
      selected: days[1],
      today: days[1],
      view: { viewYear: 2024, viewMonth: 5 },
      disabledDate: (date) => date.getDate() !== 16
    })
    expect(iso).toBe('2024-06-16')
  })

  it('resolves locale week starts', () => {
    expect(getWeekStartsOn('en-US')).toBe(0)
    expect(getWeekStartsOn('zh-CN')).toBe(1)
    expect(getWeekStartsOn('de-DE')).toBe(1)
    expect(getWeekStartsOn('ar-SA')).toBe(6)
    expect(toIsoDate(new Date(2024, 0, 5))).toBe('2024-01-05')
  })
})
