import React, { useState, useRef, useEffect } from 'react'
import {
  classNames,
  parseDate,
  formatDate,
  isSameDay,
  isDateInRange,
  getCalendarDays,
  getMonthNames,
  getShortDayNames,
  isToday as isTodayUtil,
  normalizeDate,
  datePickerBaseClasses,
  datePickerInputWrapperClasses,
  getDatePickerInputClasses,
  getDatePickerIconButtonClasses,
  datePickerCalendarClasses,
  datePickerCalendarHeaderClasses,
  datePickerNavButtonClasses,
  datePickerMonthYearClasses,
  datePickerCalendarGridClasses,
  datePickerDayNameClasses,
  getDatePickerDayCellClasses,
  datePickerClearButtonClasses,
  CalendarIconPath,
  CloseIconPath,
  ChevronLeftIconPath,
  ChevronRightIconPath,
  type DatePickerProps as CoreDatePickerProps,
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

export interface DatePickerProps extends CoreDatePickerProps {
  /**
   * Change event handler
   */
  onChange?: (date: Date | null) => void

  /**
   * Clear event handler
   */
  onClear?: () => void

  /**
   * Additional CSS classes
   */
  className?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  defaultValue,
  size = 'md',
  format = 'yyyy-MM-dd',
  placeholder = 'Select date',
  disabled = false,
  readonly = false,
  required = false,
  minDate,
  maxDate,
  clearable = true,
  name,
  id,
  onChange,
  onClear,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<Date | null>(
    parseDate(defaultValue ?? null)
  )

  const calendarRef = useRef<HTMLDivElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Determine if the component is controlled
  const isControlled = value !== undefined
  const selectedDate = isControlled ? parseDate(value) : internalValue

  const minDateParsed = parseDate(minDate ?? null)
  const maxDateParsed = parseDate(maxDate ?? null)

  // Current viewing month/year in calendar
  const [viewingMonth, setViewingMonth] = useState(
    selectedDate?.getMonth() ?? new Date().getMonth()
  )
  const [viewingYear, setViewingYear] = useState(
    selectedDate?.getFullYear() ?? new Date().getFullYear()
  )

  const displayValue = selectedDate ? formatDate(selectedDate, format) : ''
  const showClearButton = clearable && !disabled && !readonly && selectedDate !== null

  const calendarDays = getCalendarDays(viewingYear, viewingMonth)
  const monthNames = getMonthNames()
  const dayNames = getShortDayNames()

  const toggleCalendar = () => {
    if (!disabled && !readonly) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        // Reset viewing month to selected date or current month
        if (selectedDate) {
          setViewingMonth(selectedDate.getMonth())
          setViewingYear(selectedDate.getFullYear())
        }
      }
    }
  }

  const closeCalendar = () => {
    setIsOpen(false)
  }

  const selectDate = (date: Date | null) => {
    if (!date) return

    const normalizedDate = normalizeDate(date)

    // Check if date is disabled
    if (!isDateInRange(normalizedDate, minDateParsed, maxDateParsed)) {
      return
    }

    if (!isControlled) {
      setInternalValue(normalizedDate)
    }

    onChange?.(normalizedDate)
    closeCalendar()
  }

  const clearDate = (event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (!isControlled) {
      setInternalValue(null)
    }
    
    onChange?.(null)
    onClear?.()
  }

  const previousMonth = () => {
    if (viewingMonth === 0) {
      setViewingMonth(11)
      setViewingYear(viewingYear - 1)
    } else {
      setViewingMonth(viewingMonth - 1)
    }
  }

  const nextMonth = () => {
    if (viewingMonth === 11) {
      setViewingMonth(0)
      setViewingYear(viewingYear + 1)
    } else {
      setViewingMonth(viewingMonth + 1)
    }
  }

  const isDateDisabled = (date: Date | null): boolean => {
    if (!date) return true
    return !isDateInRange(date, minDateParsed, maxDateParsed)
  }

  const isCurrentMonth = (date: Date | null): boolean => {
    if (!date) return false
    return date.getMonth() === viewingMonth
  }

  const handleInputClick = () => {
    toggleCalendar()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        inputWrapperRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        !inputWrapperRef.current.contains(event.target as Node)
      ) {
        closeCalendar()
      }
    }

    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [isOpen])

  const inputClasses = getDatePickerInputClasses(size, disabled || readonly)
  const iconButtonClasses = getDatePickerIconButtonClasses(size)

  return (
    <div className={classNames(datePickerBaseClasses, className)} {...props}>
      {/* Input wrapper */}
      <div ref={inputWrapperRef} className={datePickerInputWrapperClasses}>
        {/* Input field for date display */}
        <input
          ref={inputRef}
          type="text"
          className={inputClasses}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={true} // Always readonly to prevent manual text input and ensure date selection via calendar only
          required={required}
          name={name}
          id={id}
          onClick={handleInputClick}
          aria-label={placeholder || 'Select date'}
        />

        {/* Clear button */}
        {showClearButton && (
          <button
            type="button"
            className={datePickerClearButtonClasses}
            onClick={clearDate}
            aria-label="Clear date"
          >
            <Icon path={CloseIconPath} className="w-4 h-4" />
          </button>
        )}

        {/* Calendar icon button */}
        <button
          type="button"
          className={iconButtonClasses}
          disabled={disabled || readonly}
          onClick={toggleCalendar}
          aria-label="Toggle calendar"
        >
          <Icon path={CalendarIconPath} className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar dropdown */}
      {isOpen && (
        <div
          ref={calendarRef}
          className={datePickerCalendarClasses}
          role="dialog"
          aria-label="Calendar"
        >
          {/* Calendar header */}
          <div className={datePickerCalendarHeaderClasses}>
            <button
              type="button"
              className={datePickerNavButtonClasses}
              onClick={previousMonth}
              aria-label="Previous month"
            >
              <Icon path={ChevronLeftIconPath} className="w-5 h-5" />
            </button>
            <div className={datePickerMonthYearClasses}>
              {monthNames[viewingMonth]} {viewingYear}
            </div>
            <button
              type="button"
              className={datePickerNavButtonClasses}
              onClick={nextMonth}
              aria-label="Next month"
            >
              <Icon path={ChevronRightIconPath} className="w-5 h-5" />
            </button>
          </div>

          {/* Day names header */}
          <div className={datePickerCalendarGridClasses}>
            {dayNames.map((day) => (
              <div key={day} className={datePickerDayNameClasses}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className={datePickerCalendarGridClasses}>
            {calendarDays.map((date, index) => {
              if (!date) return null

              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDay = isTodayUtil(date)
              const isDisabled = isDateDisabled(date)

              return (
                <button
                  key={index}
                  type="button"
                  className={getDatePickerDayCellClasses(
                    isCurrentMonthDay,
                    isSelected,
                    isTodayDay,
                    isDisabled
                  )}
                  disabled={isDisabled}
                  onClick={() => selectDate(date)}
                  aria-label={formatDate(date, 'yyyy-MM-dd')}
                  aria-selected={isSelected}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
