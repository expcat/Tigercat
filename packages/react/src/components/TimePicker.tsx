import React, { useState, useRef, useEffect } from 'react'
import {
  classNames,
  parseTime,
  formatTime,
  formatTimeDisplay,
  to12HourFormat,
  to24HourFormat,
  isTimeInRange,
  generateHours,
  generateMinutes,
  generateSeconds,
  getCurrentTime,
  timePickerBaseClasses,
  timePickerInputWrapperClasses,
  getTimePickerInputClasses,
  getTimePickerIconButtonClasses,
  timePickerClearButtonClasses,
  timePickerPanelClasses,
  timePickerPanelContentClasses,
  timePickerColumnClasses,
  timePickerColumnHeaderClasses,
  timePickerColumnListClasses,
  getTimePickerItemClasses,
  getTimePickerPeriodButtonClasses,
  timePickerFooterClasses,
  timePickerFooterButtonClasses,
  ClockIconPath,
  TimePickerCloseIconPath,
  type TimePickerProps as CoreTimePickerProps,
} from '@tigercat/core'

// Helper component to render SVG icon
const Icon: React.FC<{ path: string; className: string }> = ({ path, className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
)

export interface TimePickerProps extends CoreTimePickerProps {
  /**
   * Change event handler
   */
  onChange?: (time: string | null) => void

  /**
   * Clear event handler
   */
  onClear?: () => void

  /**
   * Additional CSS classes
   */
  className?: string
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  defaultValue,
  size = 'md',
  format = '24',
  showSeconds = false,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  placeholder = 'Select time',
  disabled = false,
  readonly = false,
  required = false,
  minTime,
  maxTime,
  clearable = true,
  name,
  id,
  onChange,
  onClear,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue ?? null)

  const panelRef = useRef<HTMLDivElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine if the component is controlled
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue
  const parsedTime = parseTime(currentValue)

  // Internal state for time selection
  const [selectedHours, setSelectedHours] = useState<number>(parsedTime?.hours ?? 0)
  const [selectedMinutes, setSelectedMinutes] = useState<number>(parsedTime?.minutes ?? 0)
  const [selectedSeconds, setSelectedSeconds] = useState<number>(parsedTime?.seconds ?? 0)
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM')

  // Update internal state when value changes
  useEffect(() => {
    const parsed = parseTime(currentValue)
    if (parsed) {
      setSelectedHours(parsed.hours)
      setSelectedMinutes(parsed.minutes)
      setSelectedSeconds(parsed.seconds)

      if (format === '12') {
        const { period } = to12HourFormat(parsed.hours)
        setSelectedPeriod(period)
      }
    }
  }, [currentValue, format])

  const displayValue = parsedTime
    ? formatTimeDisplay(
        parsedTime.hours,
        parsedTime.minutes,
        parsedTime.seconds,
        format,
        showSeconds
      )
    : ''

  const showClearButton = clearable && !disabled && !readonly && currentValue !== null

  const hoursList = generateHours(hourStep, format)
  const minutesList = generateMinutes(minuteStep)
  const secondsList = generateSeconds(secondStep)

  const togglePanel = () => {
    if (!disabled && !readonly) {
      setIsOpen(!isOpen)
      if (!isOpen && parsedTime) {
        setSelectedHours(parsedTime.hours)
        setSelectedMinutes(parsedTime.minutes)
        setSelectedSeconds(parsedTime.seconds)

        if (format === '12') {
          const { period } = to12HourFormat(parsedTime.hours)
          setSelectedPeriod(period)
        }
      }
    }
  }

  const closePanel = () => {
    setIsOpen(false)
  }

  const selectHour = (hour: number) => {
    const hours24 = format === '12' ? to24HourFormat(hour, selectedPeriod) : hour
    setSelectedHours(hours24)
    updateTime(hours24, selectedMinutes, selectedSeconds)
  }

  const selectMinute = (minute: number) => {
    setSelectedMinutes(minute)
    updateTime(selectedHours, minute, selectedSeconds)
  }

  const selectSecond = (second: number) => {
    setSelectedSeconds(second)
    updateTime(selectedHours, selectedMinutes, second)
  }

  const selectPeriod = (period: 'AM' | 'PM') => {
    setSelectedPeriod(period)
    // Convert current hour to 12-hour format, then back to 24-hour with new period
    const { hours: hours12 } = to12HourFormat(selectedHours)
    const hours24 = to24HourFormat(hours12, period)
    setSelectedHours(hours24)
    updateTime(hours24, selectedMinutes, selectedSeconds)
  }

  const updateTime = (hours: number, minutes: number, seconds: number) => {
    if (!isTimeInRange(hours, minutes, minTime, maxTime)) {
      return
    }

    const timeString = formatTime(hours, minutes, seconds, showSeconds)

    if (!isControlled) {
      setInternalValue(timeString)
    }

    onChange?.(timeString)
  }

  const clearTime = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (!isControlled) {
      setInternalValue(null)
    }

    onChange?.(null)
    onClear?.()
  }

  const setNow = () => {
    const now = getCurrentTime(showSeconds)
    const parsed = parseTime(now)
    if (parsed) {
      setSelectedHours(parsed.hours)
      setSelectedMinutes(parsed.minutes)
      setSelectedSeconds(parsed.seconds)

      if (format === '12') {
        const { period } = to12HourFormat(parsed.hours)
        setSelectedPeriod(period)
      }

      updateTime(parsed.hours, parsed.minutes, parsed.seconds)
    }
    closePanel()
  }

  const isHourDisabled = (hour: number): boolean => {
    const hours24 = format === '12' ? to24HourFormat(hour, selectedPeriod) : hour
    return !isTimeInRange(hours24, selectedMinutes, minTime, maxTime)
  }

  const isMinuteDisabled = (minute: number): boolean => {
    return !isTimeInRange(selectedHours, minute, minTime, maxTime)
  }

  const handleInputClick = () => {
    togglePanel()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        inputWrapperRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !inputWrapperRef.current.contains(event.target as Node)
      ) {
        closePanel()
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [isOpen])

  const inputClasses = getTimePickerInputClasses(size, disabled || readonly)
  const iconButtonClasses = getTimePickerIconButtonClasses(size)

  return (
    <div className={classNames(timePickerBaseClasses, className)} {...props}>
      {/* Input wrapper */}
      <div ref={inputWrapperRef} className={timePickerInputWrapperClasses}>
        {/* Input field for time display */}
        <input
          ref={inputRef}
          type="text"
          className={inputClasses}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={true}
          required={required}
          name={name}
          id={id}
          onClick={handleInputClick}
          aria-label={placeholder || 'Select time'}
        />

        {/* Clear button */}
        {showClearButton && (
          <button
            type="button"
            className={timePickerClearButtonClasses}
            onClick={clearTime}
            aria-label="Clear time"
          >
            <Icon path={TimePickerCloseIconPath} className="w-4 h-4" />
          </button>
        )}

        {/* Clock icon button */}
        <button
          type="button"
          className={iconButtonClasses}
          disabled={disabled || readonly}
          onClick={togglePanel}
          aria-label="Toggle time picker"
        >
          <Icon path={ClockIconPath} className="w-5 h-5" />
        </button>
      </div>

      {/* Time picker panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className={timePickerPanelClasses}
          role="dialog"
          aria-label="Time picker"
        >
          {/* Columns container */}
          <div className={timePickerPanelContentClasses}>
            {/* Hours column */}
            <div className={timePickerColumnClasses}>
              <div className={timePickerColumnHeaderClasses}>Hour</div>
              <div className={timePickerColumnListClasses}>
                {hoursList.map((hour) => {
                  const displayHour = format === '12' ? hour : hour
                  const hours24 = format === '12' ? to24HourFormat(hour, selectedPeriod) : hour
                  const isSelected = selectedHours === hours24
                  const isDisabled = isHourDisabled(hour)

                  return (
                    <button
                      key={hour}
                      type="button"
                      className={getTimePickerItemClasses(isSelected, isDisabled)}
                      disabled={isDisabled}
                      onClick={() => selectHour(hour)}
                      aria-label={`${displayHour} hours`}
                      aria-selected={isSelected}
                    >
                      {displayHour.toString().padStart(2, '0')}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Minutes column */}
            <div className={timePickerColumnClasses}>
              <div className={timePickerColumnHeaderClasses}>Min</div>
              <div className={timePickerColumnListClasses}>
                {minutesList.map((minute) => {
                  const isSelected = selectedMinutes === minute
                  const isDisabled = isMinuteDisabled(minute)

                  return (
                    <button
                      key={minute}
                      type="button"
                      className={getTimePickerItemClasses(isSelected, isDisabled)}
                      disabled={isDisabled}
                      onClick={() => selectMinute(minute)}
                      aria-label={`${minute} minutes`}
                      aria-selected={isSelected}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Seconds column (if enabled) */}
            {showSeconds && (
              <div className={timePickerColumnClasses}>
                <div className={timePickerColumnHeaderClasses}>Sec</div>
                <div className={timePickerColumnListClasses}>
                  {secondsList.map((second) => {
                    const isSelected = selectedSeconds === second

                    return (
                      <button
                        key={second}
                        type="button"
                        className={getTimePickerItemClasses(isSelected, false)}
                        onClick={() => selectSecond(second)}
                        aria-label={`${second} seconds`}
                        aria-selected={isSelected}
                      >
                        {second.toString().padStart(2, '0')}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* AM/PM column (if 12-hour format) */}
            {format === '12' && (
              <div className={timePickerColumnClasses}>
                <div className={timePickerColumnHeaderClasses}> </div>
                <div className="flex flex-col">
                  <button
                    type="button"
                    className={getTimePickerPeriodButtonClasses(selectedPeriod === 'AM')}
                    onClick={() => selectPeriod('AM')}
                    aria-label="AM"
                    aria-selected={selectedPeriod === 'AM'}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    className={getTimePickerPeriodButtonClasses(selectedPeriod === 'PM')}
                    onClick={() => selectPeriod('PM')}
                    aria-label="PM"
                    aria-selected={selectedPeriod === 'PM'}
                  >
                    PM
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={timePickerFooterClasses}>
            <button type="button" className={timePickerFooterButtonClasses} onClick={setNow}>
              Now
            </button>
            <button type="button" className={timePickerFooterButtonClasses} onClick={closePanel}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
