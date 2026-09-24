import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { classNames } from '@expcat/tigercat-core'
import type { CalendarMode, CalendarProps as CoreCalendarProps } from '@expcat/tigercat-core'
import {
  appendCalendarEventCountLabel,
  buildCalendarDateCellExtra,
  calendarDateCellDotClasses,
  calendarDateCellExtraClasses,
  calendarGridClasses,
  calendarHeaderClasses,
  calendarNavButtonClasses,
  calendarTitleClasses,
  calendarWeekdayClasses,
  chunkDaysIntoWeeks,
  chunkMonths,
  followCalendarValue,
  formatCalendarDayLabel,
  formatCalendarDayNumber,
  getCalendarEventDotStyle,
  formatMonthYear,
  getCalendarContainerClasses,
  getCalendarDayClasses,
  getCalendarDayKeyAction,
  getCalendarLabels,
  getCalendarMonthClasses,
  getCalendarMonthKeyAction,
  getInitialCalendarView,
  getLocaleDirection,
  getMonthDays,
  getShortDayNames,
  getShortMonthNames,
  getWeekStartsOn,
  isCalendarDateDisabled,
  isCalendarMonthDisabled,
  isSameDay,
  mergeTigerLocale,
  moveCalendarDayFocus,
  moveCalendarMonthFocus,
  panelDate,
  resolveCalendarRovingIso,
  resolveCalendarRovingMonth,
  selectCalendarDay,
  selectCalendarMonth,
  shiftCalendarMonth,
  shiftCalendarYear,
  toCalendarDate,
  toIsoDate
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'

export interface CalendarProps
  extends
    CoreCalendarProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'nonce'> {}

function splitCalendarDomProps(props: CalendarProps) {
  const {
    value: _value,
    defaultValue: _defaultValue,
    mode: _mode,
    defaultMode: _defaultMode,
    fullscreen: _fullscreen,
    disabledDate: _disabledDate,
    weekStartsOn: _weekStartsOn,
    now: _now,
    rangeValue: _rangeValue,
    locale: _locale,
    events: _events,
    dateCellRender: _dateCellRender,
    onChange: _onChange,
    onPanelChange: _onPanelChange,
    className: _className,
    ...rest
  } = props
  return rest
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    value,
    defaultValue,
    mode: modeProp,
    defaultMode = 'month',
    fullscreen = false,
    disabledDate,
    weekStartsOn: weekStartsOnProp,
    now: nowProp,
    rangeValue,
    locale,
    events,
    dateCellRender,
    onChange,
    onPanelChange,
    className
  } = props
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const localeCode = mergedLocale?.locale
  const dir = config.direction === 'rtl' ? 'rtl' : 'ltr'
  const labels = useMemo(() => getCalendarLabels(mergedLocale), [mergedLocale])
  const weekStartsOn = weekStartsOnProp ?? getWeekStartsOn(localeCode)
  const weekdayNames = useMemo(
    () => getShortDayNames(localeCode, weekStartsOn),
    [localeCode, weekStartsOn]
  )
  const monthNames = useMemo(() => getShortMonthNames(localeCode), [localeCode])

  const today = nowProp && !Number.isNaN(nowProp.getTime()) ? nowProp : null

  const selectedIsoFromValue =
    value !== undefined
      ? toCalendarDate(value)
        ? toIsoDate(toCalendarDate(value) as Date)
        : null
      : undefined
  const [selectedIso, setSelectedIso] = useControlledState<string | null>({
    value: selectedIsoFromValue,
    defaultValue: toCalendarDate(defaultValue)
      ? toIsoDate(toCalendarDate(defaultValue) as Date)
      : null,
    onChange: (iso) => {
      const next = iso ? toCalendarDate(iso) : null
      if (next) onChange?.(next)
    }
  })
  const selected = selectedIso ? toCalendarDate(selectedIso) : null

  const [mode, setMode] = useControlledState<CalendarMode>({
    value: modeProp,
    defaultValue: defaultMode
  })

  const [view, setView] = useState(() => getInitialCalendarView(selected, today))
  const [followedYmd, setFollowedYmd] = useState<string | null>(selected ? toIsoDate(selected) : null)
  const selectedYmd = selected ? toIsoDate(selected) : null
  useEffect(() => {
    const nextFollow = view ? followCalendarValue(view, selected, followedYmd) : null
    if (
      nextFollow &&
      (!view || nextFollow.viewYear !== view.viewYear || nextFollow.viewMonth !== view.viewMonth)
    ) {
      setView(nextFollow)
    }
    if (selectedYmd !== followedYmd) setFollowedYmd(selectedYmd)
  }, [followedYmd, selected, selectedYmd, view])

  const days = useMemo(
    () => (view ? getMonthDays(view.viewYear, view.viewMonth, weekStartsOn) : []),
    [view, weekStartsOn]
  )
  const weeks = useMemo(() => chunkDaysIntoWeeks(days), [days])
  const monthRows = useMemo(() => chunkMonths(monthNames), [monthNames])

  const emitPanel = useCallback(
    (nextView: { viewYear: number; viewMonth: number }, nextMode: CalendarMode) => {
      onPanelChange?.(panelDate(nextView), nextMode)
    },
    [onPanelChange]
  )

  const navigate = useCallback(
    (nextView: { viewYear: number; viewMonth: number }) => {
      setView(nextView)
      emitPanel(nextView, mode)
    },
    [emitPanel, mode]
  )

  const selectDay = useCallback(
    (date: Date) => {
      const result = selectCalendarDay(date, disabledDate)
      if (!result) return
      const next = toCalendarDate(result.iso)
      if (!next) return
      setView({ viewYear: result.viewYear, viewMonth: result.viewMonth })
      setSelectedIso(result.iso)
    },
    [disabledDate, setSelectedIso]
  )

  const selectMonth = useCallback(
    (monthIdx: number) => {
      if (!view) return
      const result = selectCalendarMonth(view.viewYear, monthIdx, disabledDate)
      if (!result) return
      setView({ viewYear: view.viewYear, viewMonth: monthIdx })
      setSelectedIso(toIsoDate(result.date))
      if (modeProp === undefined) setMode('month')
      onPanelChange?.(result.date, 'month')
    },
    [disabledDate, modeProp, onPanelChange, setMode, setSelectedIso, view]
  )

  const toggleMode = () => {
    if (!view) return
    const next: CalendarMode = mode === 'month' ? 'year' : 'month'
    if (modeProp === undefined) setMode(next)
    emitPanel(view, next)
  }

  const dayGridRef = useRef<HTMLDivElement>(null)
  const monthGridRef = useRef<HTMLDivElement>(null)
  const pendingFocusIsoRef = useRef<string | null>(null)
  const [activeIso, setActiveIso] = useState<string | null>(null)
  const [activeMonthIdx, setActiveMonthIdx] = useState<number | null>(null)

  const rovingDayIso = view
    ? resolveCalendarRovingIso({
        days,
        selected,
        today,
        view,
        disabledDate,
        activeIso
      })
    : null
  const rovingMonthIdx = view
    ? resolveCalendarRovingMonth({
        viewMonth: view.viewMonth,
        viewYear: view.viewYear,
        disabledDate,
        activeMonthIdx
      })
    : 0

  useEffect(() => {
    const iso = pendingFocusIsoRef.current
    if (!iso) return
    const el = dayGridRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${iso}"]`)
    if (el && !el.disabled) {
      el.focus()
      pendingFocusIsoRef.current = null
    }
  }, [days])

  const handleDayGridKeyDown = (event: React.KeyboardEvent) => {
    const action = getCalendarDayKeyAction(event.key, dir, event.altKey)
    if (action.kind === 'none') return
    event.preventDefault()
    const currentIso = (event.target as HTMLElement).getAttribute('data-date') ?? rovingDayIso
    if (!currentIso) return
    const result = moveCalendarDayFocus({
      currentIso,
      kind: action.kind,
      delta: action.delta,
      weekStartsOn,
      disabledDate
    })
    if (!result) return
    setActiveIso(result.iso)
    if (!view) return
    if (result.viewYear !== view.viewYear || result.viewMonth !== view.viewMonth) {
      pendingFocusIsoRef.current = result.iso
      navigate({ viewYear: result.viewYear, viewMonth: result.viewMonth })
      return
    }
    dayGridRef.current
      ?.querySelector<HTMLButtonElement>(`button[data-date="${result.iso}"]`)
      ?.focus()
  }

  const handleMonthKeyDown = (event: React.KeyboardEvent, idx: number) => {
    const action = getCalendarMonthKeyAction(event.key, dir)
    if (action.kind === 'none') return
    event.preventDefault()
    if (!view) return
    const next = moveCalendarMonthFocus({
      current: idx,
      kind: action.kind,
      delta: action.delta,
      viewYear: view.viewYear,
      disabledDate
    })
    if (next == null) return
    setActiveMonthIdx(next)
    monthGridRef.current
      ?.querySelectorAll<HTMLButtonElement>('button[role="gridcell"]')
      [next]?.focus()
  }

  const titleId = useId()
  const [viewLive, setViewLive] = useState('')
  const viewLiveReady = useRef(false)
  const title = !view
    ? ''
    : mode === 'month'
      ? formatMonthYear(view.viewYear, view.viewMonth, localeCode)
      : `${view.viewYear}`
  useEffect(() => {
    if (!view) return
    if (!viewLiveReady.current) {
      viewLiveReady.current = true
      return
    }
    setViewLive(title)
  }, [mode, title, view])
  const prevLabel = mode === 'month' ? labels.previousMonth : labels.previousYear
  const nextLabel = mode === 'month' ? labels.nextMonth : labels.nextYear
  const prevChar = dir === 'rtl' ? '\u203A' : '\u2039'
  const nextChar = dir === 'rtl' ? '\u2039' : '\u203A'

  if (!view) {
    return (
      <div
        className={classNames(calendarRootClasses, className)}
        data-tiger-calendar=""
        aria-label={labels.today}>
      </div>
    )
  }

  const rangeStart = rangeValue?.[0] ?? null
  const rangeEnd = rangeValue?.[1] ?? null

  return (
    <div
      {...splitCalendarDomProps(props)}
      ref={ref}
      className={classNames(getCalendarContainerClasses(fullscreen), className)}
      data-tiger="calendar">
      <div role="status" aria-live="polite" className="sr-only">
        {viewLive}
      </div>
      <div className={calendarHeaderClasses}>
        <button
          type="button"
          className={calendarNavButtonClasses}
          aria-label={prevLabel}
          onClick={() =>
            navigate(mode === 'month' ? shiftCalendarMonth(view, -1) : shiftCalendarYear(view, -1))
          }>
          {prevChar}
        </button>
        <button
          type="button"
          id={titleId}
          className={calendarTitleClasses}
          aria-label={
            mode === 'month'
              ? `${title}, ${labels.switchToYear}`
              : `${title}, ${labels.switchToMonth}`
          }
          onClick={toggleMode}>
          {title}
        </button>
        <button
          type="button"
          className={calendarNavButtonClasses}
          aria-label={nextLabel}
          onClick={() =>
            navigate(mode === 'month' ? shiftCalendarMonth(view, 1) : shiftCalendarYear(view, 1))
          }>
          {nextChar}
        </button>
      </div>

      {mode === 'year' ? (
        <div
          className="grid grid-cols-1 gap-2"
          role="grid"
          aria-colcount={3}
          aria-labelledby={titleId}
          ref={monthGridRef}>
          {monthRows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-3 gap-2" role="row">
              {row.map((name, ci) => {
                const i = ri * 3 + ci
                const isDisabled = isCalendarMonthDisabled(view.viewYear, i, disabledDate)
                return (
                  <button
                    key={i}
                    type="button"
                    role="gridcell"
                    aria-selected={view.viewMonth === i}
                    disabled={isDisabled}
                    tabIndex={rovingMonthIdx === i && !isDisabled ? 0 : -1}
                    className={getCalendarMonthClasses({
                      isSelected: view.viewMonth === i,
                      isDisabled,
                      isActive: activeMonthIdx === i
                    })}
                    onClick={() => selectMonth(i)}
                    onFocus={() => setActiveMonthIdx(i)}
                    onKeyDown={(event) => handleMonthKeyDown(event, i)}>
                    {name}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      ) : (
        <div
          role="grid"
          aria-rowcount={7}
          aria-colcount={7}
          aria-labelledby={titleId}
          ref={dayGridRef}
          onKeyDown={handleDayGridKeyDown}>
          <div className={calendarGridClasses} role="row">
            {weekdayNames.map((wd) => (
              <div key={wd} className={calendarWeekdayClasses} role="columnheader">
                {wd}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className={calendarGridClasses} role="row">
              {week.map((date) => {
                const iso = toIsoDate(date)
                const isCurrentMonth = date.getMonth() === view.viewMonth
                const isSelected = selected ? isSameDay(date, selected) : false
                const isRangeStart = rangeStart ? isSameDay(date, rangeStart) : false
                const isRangeEnd = rangeEnd ? isSameDay(date, rangeEnd) : false
                const isInRange = Boolean(
                  rangeStart &&
                  rangeEnd &&
                  date >= rangeStart &&
                  date <= rangeEnd &&
                  !isRangeStart &&
                  !isRangeEnd
                )
                const isTodayDate = today ? isSameDay(date, today) : false
                const isDisabled = isCalendarDateDisabled(date, disabledDate)
                const extra = buildCalendarDateCellExtra({
                  date,
                  events,
                  inCurrentMonth: isCurrentMonth,
                  today: isTodayDate,
                  selected: isSelected,
                  disabled: isDisabled
                })
                const customCell = dateCellRender?.(date, extra)
                const hasExtra = Boolean(customCell) || extra.events.length > 0
                const eventTitles = extra.events
                  .map((event) => event.title)
                  .filter((title): title is string => Boolean(title))
                const dayLabel = appendCalendarEventCountLabel(
                  formatCalendarDayLabel(date, localeCode),
                  extra.events.length,
                  labels.eventCountText
                )
                return (
                  <div key={iso} className="flex min-w-0 flex-col items-stretch">
                  <button
                    type="button"
                    role="gridcell"
                    data-date={iso}
                    aria-label={
                      eventTitles.length > 0 ? `${dayLabel}. ${eventTitles.join(', ')}` : dayLabel
                    }
                    aria-selected={isSelected || isRangeStart || isRangeEnd}
                    aria-current={isTodayDate ? 'date' : undefined}
                    disabled={isDisabled}
                    tabIndex={rovingDayIso === iso && !isDisabled ? 0 : -1}
                    className={getCalendarDayClasses({
                      isSelected,
                      isToday: isTodayDate,
                      isCurrentMonth,
                      isDisabled,
                      isActive: activeIso === iso,
                      isInRange,
                      isRangeStart,
                      isRangeEnd,
                      hasExtra
                    })}
                    onClick={() => selectDay(date)}
                    onFocus={() => setActiveIso(iso)}>
                    {formatCalendarDayNumber(date, localeCode)}
                    {!customCell && extra.events.length > 0 ? (
                      <span className={calendarDateCellExtraClasses} aria-hidden="true">
                        {extra.events.map((event, index) => (
                          <span
                            key={event.key ?? `${extra.iso}-${index}`}
                            className={calendarDateCellDotClasses}
                            style={getCalendarEventDotStyle(event.color)}
                          />
                        ))}
                      </span>
                    ) : null}
                  </button>
                  {customCell ? <div>{customCell as React.ReactNode}</div> : null}
                  {eventTitles.length > 0 ? (
                    <ul className="m-0 list-none p-0 text-[10px] leading-tight text-[var(--tiger-text)]">
                      {extra.events.map((event, index) =>
                        event.title ? (
                          <li key={event.key ?? `${extra.iso}-title-${index}`}>{event.title}</li>
                        ) : null
                      )}
                    </ul>
                  ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

Calendar.displayName = 'Calendar'

export default Calendar
