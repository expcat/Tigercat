import React from 'react'
import {
  datePickerInputWrapperClasses,
  datePickerClearButtonClasses,
  CalendarIconPath,
  CloseIconPath
} from '@expcat/tigercat-core'
import { useDatePickerState } from './DatePicker/state'
import { renderDatePickerMobile } from './DatePicker/render-mobile'
import { renderDatePickerCalendar } from './DatePicker/render-calendar'
import { Icon } from './DatePicker/icons'
import type { DatePickerProps } from './DatePicker/types'

export type {
  DatePickerBaseProps,
  DatePickerSingleProps,
  DatePickerRangeProps,
  DatePickerProps
} from './DatePicker/types'

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  const ctx = useDatePickerState(props)

  return (
    <div className={ctx.containerClasses} {...ctx.divProps}>
      {/* Input wrapper */}
      <div ref={ctx.inputWrapperRef} className={datePickerInputWrapperClasses}>
        {/* Input field for date display */}
        <input
          ref={ctx.inputRef}
          type="text"
          className={ctx.inputClasses}
          value={ctx.displayValue}
          placeholder={ctx.placeholder}
          disabled={ctx.disabled}
          readOnly={true} // Always readonly to prevent manual text input and ensure date selection via calendar only
          required={ctx.required}
          name={ctx.name}
          id={ctx.id}
          onClick={ctx.toggleCalendar}
          aria-label={ctx.placeholder || 'Select date'}
        />

        {/* Clear button */}
        {ctx.showClearButton && (
          <button
            type="button"
            className={datePickerClearButtonClasses}
            onClick={ctx.clearDate}
            aria-label={ctx.labels.clearDate}>
            <Icon path={CloseIconPath} className="w-4 h-4" />
          </button>
        )}

        {/* Calendar icon button */}
        <button
          type="button"
          className={ctx.iconButtonClasses}
          disabled={ctx.disabled || ctx.readonly}
          onClick={ctx.toggleCalendar}
          aria-label={ctx.labels.toggleCalendar}>
          <Icon path={CalendarIconPath} className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar dropdown */}
      {ctx.isOpen && renderDatePickerMobile(ctx)}
      {ctx.isOpen && renderDatePickerCalendar(ctx)}
    </div>
  )
}
