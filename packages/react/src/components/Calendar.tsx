import React, { useState, useMemo, useCallback } from 'react'
import { classNames } from '@expcat/tigercat-core'
import type { CalendarMode } from '@expcat/tigercat-core'
import {
  getCalendarContainerClasses,
  calendarHeaderClasses,
  calendarNavButtonClasses,
  calendarTitleClasses,
  calendarWeekdayClasses,
  getCalendarDayClasses,
  getCalendarMonthClasses,
  WEEKDAYS,
  MONTHS,
  isSameDay,
  getMonthDays
} from '@expcat/tigercat-core'

export interface CalendarProps {
  value?: Date
  mode?: CalendarMode
  fullscreen?: boolean
  disabledDate?: (date: Date) => boolean
  onChange?: (date: Date) => void
  onPanelChange?: (date: Date, mode: CalendarMode) => void
  className?: string
}

export const Calendar: React.FC<CalendarProps> = ({
  value,
  mode = 'month',
  fullscreen = false,
  disabledDate,
  onChange,
  onPanelChange,
  className
}) => {
  const today = new Date()
  const [viewYear, setViewYear] = useState(value?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(value?.getMonth() ?? today.getMonth())

  const days = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth])

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

  const containerClass = classNames(getCalendarContainerClasses(fullscreen), className)

  return (
    <div className={containerClass} role="group">
      <div className={calendarHeaderClasses}>
        <button
          type="button"
          className={calendarNavButtonClasses}
          aria-label={mode === 'month' ? 'Previous month' : 'Previous year'}
          onClick={mode === 'month' ? prevMonth : prevYear}>
          {'\u2039'}
        </button>
        <span className={calendarTitleClasses}>
          {mode === 'month' ? `${MONTHS[viewMonth]} ${viewYear}` : `${viewYear}`}
        </span>
        <button
          type="button"
          className={calendarNavButtonClasses}
          aria-label={mode === 'month' ? 'Next month' : 'Next year'}
          onClick={mode === 'month' ? nextMonth : nextYear}>
          {'\u203A'}
        </button>
      </div>

      {mode === 'year' ? (
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((m, i) => (
            <div
              key={i}
              className={getCalendarMonthClasses(viewMonth === i)}
              onClick={() => selectMonth(i)}>
              {m}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className={calendarWeekdayClasses}>
                {wd}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((date, i) => {
              const isCurrentMonth = date.getMonth() === viewMonth
              const isSelected = value ? isSameDay(date, value) : false
              const isTodayDate = isSameDay(date, today)
              const isDisabled = !!disabledDate?.(date)
              return (
                <div key={i} className="flex items-center justify-center py-0.5">
                  <div
                    className={getCalendarDayClasses(
                      isSelected,
                      isTodayDate,
                      isCurrentMonth,
                      isDisabled
                    )}
                    onClick={() => selectDay(date)}>
                    {date.getDate()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
