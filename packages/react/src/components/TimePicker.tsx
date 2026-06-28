import React from 'react'
import {
  timePickerInputWrapperClasses,
  timePickerClearButtonClasses,
  timePickerPanelClasses,
  timePickerRangeHeaderClasses,
  getTimePickerRangeTabButtonClasses,
  timePickerFooterClasses,
  timePickerFooterButtonClasses,
  clockSolidIcon20PathD,
  closeSolidIcon20PathD
} from '@expcat/tigercat-core'
import { useTimePickerState } from './TimePicker/state'
import { renderTimePickerMobile } from './TimePicker/render-mobile'
import { renderTimePickerDesktop } from './TimePicker/render-desktop'
import { Icon } from './TimePicker/icons'
import type { TimePickerProps } from './TimePicker/types'

export type { TimePickerProps, TimePickerRangeValue } from './TimePicker/types'

export const TimePicker: React.FC<TimePickerProps> = (allProps) => {
  const ctx = useTimePickerState(allProps)

  return (
    <div className={ctx.containerClasses} {...ctx.divProps}>
      {/* Input wrapper */}
      <div ref={ctx.inputWrapperRef} className={timePickerInputWrapperClasses}>
        {/* Input field for time display */}
        <input
          ref={ctx.inputRef}
          type="text"
          className={ctx.inputClasses}
          value={ctx.displayValue}
          placeholder={ctx.placeholder}
          disabled={ctx.disabled}
          readOnly={true}
          required={ctx.required}
          name={ctx.name}
          id={ctx.id}
          onClick={ctx.handleInputClick}
          aria-label={ctx.placeholder || ctx.labels.selectTime}
        />

        {/* Clear button */}
        {ctx.showClearButton && (
          <button
            type="button"
            className={timePickerClearButtonClasses}
            onClick={ctx.clearTime}
            aria-label={ctx.labels.clear}>
            <Icon path={closeSolidIcon20PathD} className="w-4 h-4" />
          </button>
        )}

        {/* Clock icon button */}
        <button
          type="button"
          className={ctx.iconButtonClasses}
          disabled={ctx.disabled || ctx.readonly}
          onClick={ctx.togglePanel}
          aria-label={ctx.labels.toggle}>
          <Icon path={clockSolidIcon20PathD} className="w-5 h-5" />
        </button>
      </div>

      {/* Time picker panel */}
      {ctx.isOpen && (
        <div
          ref={ctx.panelRef}
          className={timePickerPanelClasses}
          role="dialog"
          aria-label={ctx.labels.dialog}
          onKeyDown={ctx.handlePanelKeyDown}>
          {ctx.isRangeMode && (
            <div className={timePickerRangeHeaderClasses}>
              <button
                type="button"
                className={getTimePickerRangeTabButtonClasses(ctx.activePart === 'start')}
                onClick={() => ctx.setActivePart('start')}
                aria-label={ctx.labels.start}
                aria-selected={ctx.activePart === 'start'}>
                {ctx.labels.start}
              </button>
              <button
                type="button"
                className={getTimePickerRangeTabButtonClasses(ctx.activePart === 'end')}
                onClick={() => ctx.setActivePart('end')}
                aria-label={ctx.labels.end}
                aria-selected={ctx.activePart === 'end'}>
                {ctx.labels.end}
              </button>
            </div>
          )}

          {renderTimePickerMobile(ctx)}

          {/* Columns container */}
          {renderTimePickerDesktop(ctx)}

          {/* Footer */}
          <div className={timePickerFooterClasses}>
            <button type="button" className={timePickerFooterButtonClasses} onClick={ctx.setNow}>
              {ctx.labels.now}
            </button>
            <button
              type="button"
              className={timePickerFooterButtonClasses}
              onClick={ctx.closePanel}>
              {ctx.labels.ok}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
