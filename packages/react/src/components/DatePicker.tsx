import React from 'react'
import {
  datePickerInputWrapperClasses,
  datePickerClearButtonClasses,
  calendarSolidIcon20PathD,
  closeSolidIcon20PathD
} from '@expcat/tigercat-core'
import { useDatePickerState } from './DatePicker/state'
import { renderDatePickerMobile } from './DatePicker/render-mobile'
import { renderDatePickerCalendar } from './DatePicker/render-calendar'
import { Icon } from './DatePicker/icons'
import type { DatePickerProps } from './DatePicker/types'
import { renderOverlayPortal, useAnchoredOverlay } from '../utils/overlay'

export type {
  DatePickerBaseProps,
  DatePickerSingleProps,
  DatePickerRangeProps,
  DatePickerProps
} from './DatePicker/types'

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  const ctx = useDatePickerState(props)
  const overlay = useAnchoredOverlay({
    enabled: ctx.isOpen,
    referenceRef: ctx.inputWrapperRef,
    floatingRef: ctx.panelRef,
    placement: 'bottom-start',
    offset: 4,
    layout: 'bottom-sheet-sm',
    dismissOnOutside: true,
    dismissOnEscape: true,
    onDismiss: ctx.closeCalendar
  })

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
            <Icon path={closeSolidIcon20PathD} className="w-4 h-4" />
          </button>
        )}

        {/* Calendar icon button */}
        <button
          type="button"
          className={ctx.iconButtonClasses}
          disabled={ctx.disabled || ctx.readonly}
          onClick={ctx.toggleCalendar}
          aria-label={ctx.labels.toggleCalendar}>
          <Icon path={calendarSolidIcon20PathD} className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar dropdown */}
      {renderOverlayPortal(
        ctx.isOpen ? (
          <div
            ref={ctx.panelRef}
            className={overlay.floatingClasses}
            style={overlay.floatingStyles}
            data-positioned={overlay.positioned}>
            {renderDatePickerMobile(ctx)}
            {renderDatePickerCalendar(ctx)}
          </div>
        ) : null,
        overlay.target
      )}
    </div>
  )
}
