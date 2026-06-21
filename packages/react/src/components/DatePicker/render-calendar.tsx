import React from 'react'
import {
  formatDate,
  formatMonthYear,
  isSameDay,
  isToday as isTodayUtil,
  normalizeDate,
  datePickerCalendarClasses,
  datePickerCalendarHeaderClasses,
  datePickerNavButtonClasses,
  datePickerMonthYearClasses,
  datePickerCalendarGridClasses,
  datePickerDayNameClasses,
  getDatePickerDayCellClasses,
  datePickerFooterClasses,
  datePickerFooterButtonClasses,
  ChevronLeftIconPath,
  ChevronRightIconPath
} from '@expcat/tigercat-core'
import { Icon } from './icons'
import type { DatePickerContext } from './types'

export function renderDatePickerCalendar(ctx: DatePickerContext): React.ReactNode {
  return (
    <div
      ref={ctx.calendarRef}
      className={datePickerCalendarClasses}
      role="dialog"
      aria-modal="true"
      aria-label={ctx.labels.calendar}
      onKeyDown={ctx.handleCalendarKeyDown}>
      {/* Calendar header */}
      <div className={datePickerCalendarHeaderClasses}>
        <button
          type="button"
          className={datePickerNavButtonClasses}
          onClick={ctx.previousMonth}
          aria-label={ctx.labels.previousMonth}>
          <Icon path={ctx.isRtl ? ChevronRightIconPath : ChevronLeftIconPath} className="w-5 h-5" />
        </button>
        <div className={datePickerMonthYearClasses}>
          {formatMonthYear(ctx.viewingYear, ctx.viewingMonth, ctx.localeCode)}
        </div>
        <button
          type="button"
          className={datePickerNavButtonClasses}
          onClick={ctx.nextMonth}
          aria-label={ctx.labels.nextMonth}>
          <Icon path={ctx.isRtl ? ChevronLeftIconPath : ChevronRightIconPath} className="w-5 h-5" />
        </button>
      </div>

      {/* Day names header */}
      <div className={datePickerCalendarGridClasses} role="row">
        {ctx.dayNames.map((day) => (
          <div key={day} className={datePickerDayNameClasses} role="columnheader">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {(() => {
        // Pre-compute range values once instead of per-cell
        const [rangeStart, rangeEnd] = ctx.selectedRange
        const normStart = rangeStart ? normalizeDate(rangeStart) : null
        const normEnd = rangeEnd ? normalizeDate(rangeEnd) : null
        const isSelectingEnd = ctx.isRangeMode && Boolean(rangeStart) && !rangeEnd

        return (
          <div
            className={datePickerCalendarGridClasses}
            role="grid"
            aria-rowcount={6}
            aria-colcount={7}>
            {ctx.calendarDays.map((date, index) => {
              if (!date) return null

              const normDate = normalizeDate(date)

              const isRangeStart =
                ctx.isRangeMode && rangeStart ? isSameDay(date, rangeStart) : false
              const isRangeEnd = ctx.isRangeMode && rangeEnd ? isSameDay(date, rangeEnd) : false
              const isInRange =
                ctx.isRangeMode &&
                normStart &&
                normEnd &&
                normDate >= normStart &&
                normDate <= normEnd

              const isSelected = !ctx.isRangeMode
                ? ctx.selectedDate
                  ? isSameDay(date, ctx.selectedDate)
                  : false
                : isRangeStart || isRangeEnd

              const isCurrentMonthDay = ctx.isCurrentMonth(date)
              const isTodayDay = isTodayUtil(date)
              const isBeforeRangeStart = isSelectingEnd && normStart && normDate < normStart

              const isDisabled = ctx.isDateDisabled(date) || Boolean(isBeforeRangeStart)

              const iso = formatDate(date, 'yyyy-MM-dd')

              return (
                <button
                  key={index}
                  type="button"
                  className={getDatePickerDayCellClasses(
                    isCurrentMonthDay,
                    isSelected,
                    isTodayDay,
                    isDisabled,
                    Boolean(isInRange),
                    Boolean(isRangeStart),
                    Boolean(isRangeEnd)
                  )}
                  disabled={isDisabled}
                  onClick={() => ctx.selectDate(date)}
                  role="gridcell"
                  data-date={iso}
                  onFocus={() => ctx.setActiveDateIso(iso)}
                  tabIndex={ctx.activeDateIso === iso && !isDisabled ? 0 : -1}
                  aria-label={iso}
                  aria-selected={isSelected}
                  aria-current={isTodayDay ? 'date' : undefined}>
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        )
      })()}

      {/* Shortcuts panel */}
      {ctx.shortcuts && ctx.shortcuts.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 py-2 border-t border-[var(--tiger-border,#e5e7eb)]">
          {ctx.shortcuts.map((sc, i) => (
            <button
              key={i}
              type="button"
              className={datePickerFooterButtonClasses}
              onClick={() => ctx.handleShortcut(sc)}>
              {sc.label}
            </button>
          ))}
        </div>
      )}

      {/* Footer (range mode only) */}
      {ctx.isRangeMode && (
        <div className={datePickerFooterClasses}>
          <button type="button" className={datePickerFooterButtonClasses} onClick={ctx.setToday}>
            {ctx.labels.today}
          </button>
          <button
            type="button"
            className={datePickerFooterButtonClasses}
            onClick={ctx.closeCalendar}>
            {ctx.labels.ok}
          </button>
        </div>
      )}
    </div>
  )
}
