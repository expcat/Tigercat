import React from 'react'
import {
  datePickerMobileWheelClasses,
  datePickerMobileWheelGridClasses,
  datePickerMobileWheelSelectClasses,
  datePickerFooterButtonClasses
} from '@expcat/tigercat-core'
import type { DatePickerContext } from './types'

export function renderDatePickerMobile(ctx: DatePickerContext): React.ReactNode {
  return (
    <div
      ref={ctx.mobileCalendarRef}
      className={datePickerMobileWheelClasses}
      role="group"
      aria-label={ctx.labels.calendar}>
      {ctx.isRangeMode && (
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            className={datePickerFooterButtonClasses}
            aria-selected={ctx.activeRangePart === 'start'}
            onClick={() => ctx.setActiveRangePart('start')}>
            Start
          </button>
          <button
            type="button"
            className={datePickerFooterButtonClasses}
            aria-selected={ctx.activeRangePart === 'end'}
            onClick={() => ctx.setActiveRangePart('end')}>
            End
          </button>
        </div>
      )}
      <div className={datePickerMobileWheelGridClasses}>
        <select
          className={datePickerMobileWheelSelectClasses}
          value={ctx.mobileDate.getFullYear()}
          aria-label={ctx.labels.year}
          onChange={(event) => ctx.updateMobileDate('year', Number(event.target.value))}>
          {ctx.mobileYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          className={datePickerMobileWheelSelectClasses}
          value={ctx.mobileDate.getMonth()}
          aria-label={ctx.labels.month}
          onChange={(event) => ctx.updateMobileDate('month', Number(event.target.value))}>
          {Array.from({ length: 12 }, (_, month) => (
            <option key={month} value={month}>
              {month + 1}
            </option>
          ))}
        </select>
        <select
          className={datePickerMobileWheelSelectClasses}
          value={ctx.mobileDate.getDate()}
          aria-label={ctx.labels.day}
          onChange={(event) => ctx.updateMobileDate('day', Number(event.target.value))}>
          {ctx.mobileDays.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          className={datePickerFooterButtonClasses}
          aria-label={`Mobile ${ctx.labels.ok}`}
          onClick={ctx.closeCalendar}>
          {ctx.labels.ok}
        </button>
      </div>
    </div>
  )
}
