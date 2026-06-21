import React from 'react'
import {
  timePickerMobileWheelClasses,
  timePickerMobileWheelSelectClasses,
  to12HourFormat,
  padTwo
} from '@expcat/tigercat-core'
import type { TimePickerContext } from './types'

export function renderTimePickerMobile(ctx: TimePickerContext): React.ReactNode {
  return (
    <div className={timePickerMobileWheelClasses}>
      <select
        className={timePickerMobileWheelSelectClasses}
        value={ctx.format === '12' ? to12HourFormat(ctx.selectedHours).hours : ctx.selectedHours}
        aria-label={ctx.labels.hour}
        onChange={(event) => ctx.selectHour(Number(event.target.value))}>
        {ctx.hoursList.map((hour) => (
          <option key={hour} value={hour} disabled={ctx.isHourDisabled(hour)}>
            {padTwo(hour)}
          </option>
        ))}
      </select>
      <select
        className={timePickerMobileWheelSelectClasses}
        value={ctx.selectedMinutes}
        aria-label={ctx.labels.minute}
        onChange={(event) => ctx.selectMinute(Number(event.target.value))}>
        {ctx.minutesList.map((minute) => (
          <option key={minute} value={minute} disabled={ctx.isMinuteDisabled(minute)}>
            {padTwo(minute)}
          </option>
        ))}
      </select>
      {ctx.showSeconds && (
        <select
          className={timePickerMobileWheelSelectClasses}
          value={ctx.selectedSeconds}
          aria-label={ctx.labels.second}
          onChange={(event) => ctx.selectSecond(Number(event.target.value))}>
          {ctx.secondsList.map((second) => (
            <option key={second} value={second}>
              {padTwo(second)}
            </option>
          ))}
        </select>
      )}
      {ctx.format === '12' && (
        <select
          className={timePickerMobileWheelSelectClasses}
          value={ctx.selectedPeriod}
          aria-label="Period"
          onChange={(event) => ctx.selectPeriod(event.target.value as 'AM' | 'PM')}>
          <option value="AM">{ctx.periodLabels.am}</option>
          <option value="PM">{ctx.periodLabels.pm}</option>
        </select>
      )}
    </div>
  )
}
