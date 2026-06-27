import React from 'react'
import {
  formatMonthYear,
  getDatePickerCalendarCellState,
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
        return (
          <div
            className={datePickerCalendarGridClasses}
            role="grid"
            aria-rowcount={6}
            aria-colcount={7}>
            {ctx.calendarDays.map((date, index) => {
              if (!date) return null

              const cell = getDatePickerCalendarCellState({
                date,
                selectedDate: ctx.selectedDate,
                selectedRange: ctx.selectedRange,
                isRangeMode: ctx.isRangeMode,
                isCurrentMonth: ctx.isCurrentMonth,
                isDateDisabled: ctx.isDateDisabled
              })

              return (
                <button
                  key={index}
                  type="button"
                  className={getDatePickerDayCellClasses(
                    cell.isCurrentMonthDay,
                    cell.isSelected,
                    cell.isTodayDay,
                    cell.isDisabled,
                    cell.isInRange,
                    cell.isRangeStart,
                    cell.isRangeEnd
                  )}
                  disabled={cell.isDisabled}
                  onClick={() => ctx.selectDate(date)}
                  role="gridcell"
                  data-date={cell.iso}
                  onFocus={() => ctx.setActiveDateIso(cell.iso)}
                  tabIndex={ctx.activeDateIso === cell.iso && !cell.isDisabled ? 0 : -1}
                  aria-label={cell.iso}
                  aria-selected={cell.isSelected}
                  aria-current={cell.isTodayDay ? 'date' : undefined}>
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
