import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { classNames } from '@expcat/tigercat-core'
import type { CalendarProps as CoreCalendarProps } from '@expcat/tigercat-core'
import {
  getCalendarContainerClasses,
  calendarHeaderClasses,
  calendarNavButtonClasses,
  calendarTitleClasses,
  calendarWeekdayClasses,
  getCalendarDayClasses,
  getCalendarMonthClasses,
  isSameDay,
  getMonthDays,
  getShortDayNames,
  getShortMonthNames,
  formatMonthYear,
  formatDate,
  parseDate,
  addDays,
  getCalendarLabels,
  mergeTigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type CalendarProps = CoreCalendarProps

export const Calendar: React.FC<CalendarProps> = ({
  value,
  mode = 'month',
  fullscreen = false,
  disabledDate,
  locale,
  onChange,
  onPanelChange,
  className
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const localeCode = mergedLocale?.locale
  const labels = useMemo(() => getCalendarLabels(mergedLocale), [mergedLocale])
  const weekdayNames = useMemo(() => getShortDayNames(localeCode), [localeCode])
  const monthNames = useMemo(() => getShortMonthNames(localeCode), [localeCode])
  const today = new Date()
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth())

  const days = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth])
  const weeks = useMemo(() => {
    const out: Date[][] = []
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7))
    return out
  }, [days])
  const monthRows = useMemo(() => {
    const out: string[][] = []
    for (let i = 0; i < monthNames.length; i += 3) out.push(monthNames.slice(i, i + 3))
    return out
  }, [monthNames])

  const navigate = useCallback(
    (newYear: number, newMonth: number) => {
      setViewYear(newYear)
      setViewMonth(newMonth)
      onPanelChange?.(new Date(newYear, newMonth, 1), mode)
    },
    [mode, onPanelChange]
  )

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) navigate(viewYear - 1, 11)
    else navigate(viewYear, viewMonth - 1)
  }, [viewYear, viewMonth, navigate])

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) navigate(viewYear + 1, 0)
    else navigate(viewYear, viewMonth + 1)
  }, [viewYear, viewMonth, navigate])

  const prevYear = useCallback(
    () => navigate(viewYear - 1, viewMonth),
    [viewYear, viewMonth, navigate]
  )
  const nextYear = useCallback(
    () => navigate(viewYear + 1, viewMonth),
    [viewYear, viewMonth, navigate]
  )

  const selectDay = useCallback(
    (date: Date) => {
      if (disabledDate?.(date)) return
      onChange?.(date)
    },
    [disabledDate, onChange]
  )

  const selectMonth = useCallback(
    (monthIdx: number) => {
      setViewMonth(monthIdx)
      onPanelChange?.(new Date(viewYear, monthIdx, 1), mode)
    },
    [viewYear, mode, onPanelChange]
  )

  // ----- Keyboard navigation (roving focus stays in the framework layer) -----
  const dayGridRef = useRef<HTMLDivElement>(null)
  const pendingFocusIsoRef = useRef<string | null>(null)
  const [activeIso, setActiveIso] = useState<string | null>(null)

  const toIso = (d: Date) => formatDate(d, 'yyyy-MM-dd')

  // The single tab-stop in the day grid: the active cell if any, otherwise the
  // selected day, today, or the first of the visible month.
  const defaultDayIso = (() => {
    if (value && value.getFullYear() === viewYear && value.getMonth() === viewMonth)
      return toIso(value)
    if (today.getFullYear() === viewYear && today.getMonth() === viewMonth) return toIso(today)
    return toIso(new Date(viewYear, viewMonth, 1))
  })()
  const rovingDayIso = activeIso ?? defaultDayIso

  const focusDayIso = (iso: string): boolean => {
    const el = dayGridRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${iso}"]`)
    if (el && !el.disabled) {
      el.focus()
      setActiveIso(iso)
      return true
    }
    return false
  }

  const moveDayFocus = (deltaDays: number) => {
    const activeEl = document.activeElement as HTMLElement | null
    const currentIso = activeEl?.getAttribute('data-date') ?? rovingDayIso
    const base = parseDate(currentIso)
    if (!base) return
    let candidate = addDays(base, deltaDays)
    for (let attempts = 0; attempts < 42; attempts++) {
      const iso = toIso(candidate)
      const el = dayGridRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${iso}"]`)
      if (el && !el.disabled) {
        el.focus()
        setActiveIso(iso)
        return
      }
      if (!el) {
        // The candidate is outside the visible month: navigate and focus it
        // once the new month renders.
        pendingFocusIsoRef.current = iso
        setActiveIso(iso)
        navigate(candidate.getFullYear(), candidate.getMonth())
        return
      }
      candidate = addDays(candidate, deltaDays)
    }
  }

  // Focus a pending day after the view changed (e.g. arrowing across months).
  useEffect(() => {
    const iso = pendingFocusIsoRef.current
    if (!iso) return
    const el = dayGridRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${iso}"]`)
    if (el) {
      el.focus()
      pendingFocusIsoRef.current = null
    }
  }, [days])

  const handleDayGridKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        moveDayFocus(-1)
        break
      case 'ArrowRight':
        e.preventDefault()
        moveDayFocus(1)
        break
      case 'ArrowUp':
        e.preventDefault()
        moveDayFocus(-7)
        break
      case 'ArrowDown':
        e.preventDefault()
        moveDayFocus(7)
        break
      case 'Home':
        e.preventDefault()
        focusDayIso(toIso(new Date(viewYear, viewMonth, 1)))
        break
      case 'End':
        e.preventDefault()
        focusDayIso(toIso(new Date(viewYear, viewMonth + 1, 0)))
        break
      case 'Enter':
      case ' ': {
        const activeEl = document.activeElement as HTMLElement | null
        const iso = activeEl?.getAttribute('data-date')
        if (iso) {
          e.preventDefault()
          const d = parseDate(iso)
          if (d) selectDay(d)
        }
        break
      }
      default:
        break
    }
  }

  const [activeMonthIdx, setActiveMonthIdx] = useState<number | null>(null)
  const rovingMonthIdx = activeMonthIdx ?? viewMonth

  const monthGridRef = useRef<HTMLDivElement>(null)
  const focusMonthIdx = (idx: number) => {
    const els = monthGridRef.current?.querySelectorAll<HTMLButtonElement>('button[role="gridcell"]')
    els?.[idx]?.focus()
    setActiveMonthIdx(idx)
  }

  const handleMonthKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let target = idx
    switch (e.key) {
      case 'ArrowRight':
        target = Math.min(11, idx + 1)
        break
      case 'ArrowLeft':
        target = Math.max(0, idx - 1)
        break
      case 'ArrowDown':
        target = Math.min(11, idx + 3)
        break
      case 'ArrowUp':
        target = Math.max(0, idx - 3)
        break
      case 'Home':
        target = 0
        break
      case 'End':
        target = 11
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        selectMonth(idx)
        return
      default:
        return
    }
    e.preventDefault()
    focusMonthIdx(target)
  }

  const containerClass = classNames(getCalendarContainerClasses(fullscreen), className)

  return (
    <div className={containerClass} role="group">
      <div className={calendarHeaderClasses}>
        <button
          type="button"
          className={calendarNavButtonClasses}
          aria-label={mode === 'month' ? labels.previousMonth : labels.previousYear}
          onClick={mode === 'month' ? prevMonth : prevYear}>
          {'\u2039'}
        </button>
        <span className={calendarTitleClasses}>
          {mode === 'month' ? formatMonthYear(viewYear, viewMonth, localeCode) : `${viewYear}`}
        </span>
        <button
          type="button"
          className={calendarNavButtonClasses}
          aria-label={mode === 'month' ? labels.nextMonth : labels.nextYear}
          onClick={mode === 'month' ? nextMonth : nextYear}>
          {'\u203A'}
        </button>
      </div>

      {mode === 'year' ? (
        <div className="grid grid-cols-1 gap-2" role="grid" ref={monthGridRef}>
          {monthRows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-3 gap-2" role="row">
              {row.map((m, ci) => {
                const i = ri * 3 + ci
                return (
                  <button
                    key={i}
                    type="button"
                    role="gridcell"
                    aria-selected={viewMonth === i}
                    tabIndex={rovingMonthIdx === i ? 0 : -1}
                    className={getCalendarMonthClasses(viewMonth === i)}
                    onClick={() => selectMonth(i)}
                    onFocus={() => setActiveMonthIdx(i)}
                    onKeyDown={(e) => handleMonthKeyDown(e, i)}>
                    {m}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      ) : (
        <div role="grid" aria-rowcount={7} aria-colcount={7} ref={dayGridRef}>
          <div className="grid grid-cols-7" role="row">
            {weekdayNames.map((wd) => (
              <div key={wd} className={calendarWeekdayClasses} role="columnheader">
                {wd}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7" role="row" onKeyDown={handleDayGridKeyDown}>
              {week.map((date) => {
                const isCurrentMonth = date.getMonth() === viewMonth
                const isSelected = value ? isSameDay(date, value) : false
                const isTodayDate = isSameDay(date, today)
                const isDisabled = !!disabledDate?.(date)
                const iso = toIso(date)
                return (
                  <button
                    key={iso}
                    type="button"
                    role="gridcell"
                    data-date={iso}
                    aria-label={iso}
                    aria-selected={isSelected}
                    aria-current={isTodayDate ? 'date' : undefined}
                    disabled={isDisabled}
                    tabIndex={rovingDayIso === iso && !isDisabled ? 0 : -1}
                    className={classNames(
                      getCalendarDayClasses(isSelected, isTodayDate, isCurrentMonth, isDisabled),
                      'justify-self-center my-0.5'
                    )}
                    onClick={() => selectDay(date)}
                    onFocus={() => setActiveIso(iso)}>
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Calendar
