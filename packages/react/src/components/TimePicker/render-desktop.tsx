import React from 'react'
import {
  timePickerDesktopPanelContentClasses,
  timePickerColumnClasses,
  timePickerColumnHeaderClasses,
  timePickerColumnListClasses,
  getTimePickerItemClasses,
  getTimePickerPeriodButtonClasses,
  getTimePickerOptionAriaLabel,
  to24HourFormat,
  padTwo
} from '@expcat/tigercat-core'
import type { TimePickerContext } from './types'

export function renderTimePickerDesktop(ctx: TimePickerContext): React.ReactNode {
  return (
    <div className={timePickerDesktopPanelContentClasses}>
      {/* Hours column */}
      <div className={timePickerColumnClasses}>
        <div className={timePickerColumnHeaderClasses}>{ctx.labels.hour}</div>
        <div className={timePickerColumnListClasses}>
          {ctx.hoursList.map((hour) => {
            const hours24 = ctx.format === '12' ? to24HourFormat(hour, ctx.selectedPeriod) : hour
            const isSelected = ctx.selectedHours === hours24
            const isDisabled = ctx.isHourDisabled(hour)

            return (
              <button
                key={hour}
                type="button"
                className={getTimePickerItemClasses(isSelected, isDisabled)}
                disabled={isDisabled}
                onClick={() => ctx.selectHour(hour)}
                data-tiger-timepicker-unit="hour"
                aria-label={getTimePickerOptionAriaLabel(
                  hour,
                  'hour',
                  ctx.locale,
                  ctx.labelsOverrides
                )}
                aria-selected={isSelected}>
                {padTwo(hour)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Minutes column */}
      <div className={timePickerColumnClasses}>
        <div className={timePickerColumnHeaderClasses}>{ctx.labels.minute}</div>
        <div className={timePickerColumnListClasses}>
          {ctx.minutesList.map((minute) => {
            const isSelected = ctx.selectedMinutes === minute
            const isDisabled = ctx.isMinuteDisabled(minute)

            return (
              <button
                key={minute}
                type="button"
                className={getTimePickerItemClasses(isSelected, isDisabled)}
                disabled={isDisabled}
                onClick={() => ctx.selectMinute(minute)}
                data-tiger-timepicker-unit="minute"
                aria-label={getTimePickerOptionAriaLabel(
                  minute,
                  'minute',
                  ctx.locale,
                  ctx.labelsOverrides
                )}
                aria-selected={isSelected}>
                {padTwo(minute)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Seconds column (if enabled) */}
      {ctx.showSeconds && (
        <div className={timePickerColumnClasses}>
          <div className={timePickerColumnHeaderClasses}>{ctx.labels.second}</div>
          <div className={timePickerColumnListClasses}>
            {ctx.secondsList.map((second) => {
              const isSelected = ctx.selectedSeconds === second
              const isDisabled = ctx.isSecondDisabled(second)

              return (
                <button
                  key={second}
                  type="button"
                  className={getTimePickerItemClasses(isSelected, isDisabled)}
                  disabled={isDisabled}
                  onClick={() => ctx.selectSecond(second)}
                  data-tiger-timepicker-unit="second"
                  aria-label={getTimePickerOptionAriaLabel(
                    second,
                    'second',
                    ctx.locale,
                    ctx.labelsOverrides
                  )}
                  aria-selected={isSelected}>
                  {padTwo(second)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* AM/PM column (if 12-hour format) */}
      {ctx.format === '12' && (
        <div className={timePickerColumnClasses}>
          <div className={timePickerColumnHeaderClasses}> </div>
          <div className="flex flex-col">
            <button
              type="button"
              className={getTimePickerPeriodButtonClasses(ctx.selectedPeriod === 'AM')}
              onClick={() => ctx.selectPeriod('AM')}
              data-tiger-timepicker-unit="period"
              aria-label={ctx.periodLabels.am}
              aria-selected={ctx.selectedPeriod === 'AM'}>
              {ctx.periodLabels.am}
            </button>
            <button
              type="button"
              className={getTimePickerPeriodButtonClasses(ctx.selectedPeriod === 'PM')}
              onClick={() => ctx.selectPeriod('PM')}
              data-tiger-timepicker-unit="period"
              aria-label={ctx.periodLabels.pm}
              aria-selected={ctx.selectedPeriod === 'PM'}>
              {ctx.periodLabels.pm}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
