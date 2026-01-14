import React, { useState, useRef, useEffect } from 'react'
import {
  classNames,
  icon20ViewBox,
  parseDate,
  formatDate,
  formatMonthYear,
  isSameDay,
  isDateInRange,
  getCalendarDays,
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
  datePickerFooterClasses,
  datePickerFooterButtonClasses,
  CalendarIconPath,
  CloseIconPath,
  ChevronLeftIconPath,
  ChevronRightIconPath,
  getDatePickerLabels,
  type DatePickerProps as CoreDatePickerProps,
  type DatePickerSingleModelValue,
  type DatePickerRangeModelValue,
  type DatePickerRangeValue
} from '@tigercat/core'

const Icon: React.FC<{ path: string; className: string }> = ({ path, className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox={icon20ViewBox}
    fill="currentColor">
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
)

type DatePickerDivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'value' | 'onChange'
>

export interface DatePickerBaseProps
  extends Omit<CoreDatePickerProps, 'value' | 'defaultValue' | 'range'>, DatePickerDivProps {
  className?: string

  onClear?: () => void
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
  range?: false
  value?: DatePickerSingleModelValue
  defaultValue?: DatePickerSingleModelValue
  onChange?: (date: Date | null) => void
}

export interface DatePickerRangeProps extends DatePickerBaseProps {
  range: true
  value?: DatePickerRangeModelValue | null
  defaultValue?: DatePickerRangeModelValue | null
  onChange?: (range: DatePickerRangeValue) => void
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps

const isRangeDatePicker = (props: DatePickerProps): props is DatePickerRangeProps =>
  props.range === true

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  const {
    size = 'md',
    disabled = false,
    readonly = false,
    required = false,
    clearable = true,
    format = 'yyyy-MM-dd'
  } = props

  const isRangeMode = isRangeDatePicker(props)
  const placeholder = props.placeholder ?? (isRangeMode ? 'Select date range' : 'Select date')

  const divProps = (({
    value: _value,
    defaultValue: _defaultValue,
    range: _range,
    locale: _locale,
    labels: _labels,
    size: _size,
    format: _format,
    placeholder: _placeholder,
    disabled: _disabled,
    readonly: _readonly,
    required: _required,
    minDate: _minDate,
    maxDate: _maxDate,
    clearable: _clearable,
    name: _name,
    id: _id,
    onChange: _onChange,
    onClear: _onClear,
    className: _className,
    ...rest
  }) => rest)(props)

  const [isOpen, setIsOpen] = useState(false)
  const [activeDateIso, setActiveDateIso] = useState<string | null>(null)
  const [internalValue, setInternalValue] = useState<Date | null>(() => {
    if (isRangeMode) return null
    return parseDate((props as DatePickerSingleProps).defaultValue ?? null)
  })
  const [internalRangeValue, setInternalRangeValue] = useState<DatePickerRangeValue>(() => {
    if (!isRangeMode) return [null, null]
    const tuple = (props as DatePickerRangeProps).defaultValue ?? null
    if (!tuple) return [null, null]
    const start = Array.isArray(tuple) ? parseDate(tuple[0]) : null
    const end = Array.isArray(tuple) ? parseDate(tuple[1]) : null
    return [start, end]
  })

  const calendarRef = useRef<HTMLDivElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingFocusIsoRef = useRef<string | null>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  // Determine if the component is controlled
  const isControlled = props.value !== undefined

  const selectedDate = (() => {
    if (isRangeMode) return null
    const current = isControlled ? (props as DatePickerSingleProps).value : internalValue
    return parseDate(current ?? null)
  })()

  const selectedRange: DatePickerRangeValue = (() => {
    if (!isRangeMode) return [null, null]
    const tuple = isControlled ? (props as DatePickerRangeProps).value : internalRangeValue
    if (!tuple) return [null, null]
    const start = Array.isArray(tuple) ? parseDate(tuple[0]) : null
    const end = Array.isArray(tuple) ? parseDate(tuple[1]) : null
    return [start, end]
  })()

  const minDateParsed = parseDate(props.minDate ?? null)
  const maxDateParsed = parseDate(props.maxDate ?? null)

  // Current viewing month/year in calendar
  const [viewingMonth, setViewingMonth] = useState(
    (selectedDate ?? selectedRange[0])?.getMonth() ?? new Date().getMonth()
  )
  const [viewingYear, setViewingYear] = useState(
    (selectedDate ?? selectedRange[0])?.getFullYear() ?? new Date().getFullYear()
  )

  const displayValue = (() => {
    if (!isRangeMode) {
      return selectedDate ? formatDate(selectedDate, format) : ''
    }

    const [start, end] = selectedRange
    const startText = start ? formatDate(start, format) : ''
    const endText = end ? formatDate(end, format) : ''

    if (!startText && !endText) return ''
    if (startText && endText) return `${startText} - ${endText}`
    return startText ? `${startText} - ` : ` - ${endText}`
  })()

  const showClearButton = (() => {
    if (!clearable || disabled || readonly) return false
    if (!isRangeMode) return selectedDate !== null
    return selectedRange[0] !== null || selectedRange[1] !== null
  })()

  const calendarDays = getCalendarDays(viewingYear, viewingMonth)
  const dayNames = getShortDayNames(props.locale)

  const labels = getDatePickerLabels(props.locale, props.labels)

  const toggleCalendar = () => {
    if (!disabled && !readonly) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null
        // Reset viewing month to selected date or current month
        const baseDate = selectedDate ?? selectedRange[0]
        if (baseDate) {
          setViewingMonth(baseDate.getMonth())
          setViewingYear(baseDate.getFullYear())
        }
      }
    }
  }

  const closeCalendar = () => {
    setIsOpen(false)
  }

  const getFirstEnabledIsoInView = (): string | null => {
    for (const date of calendarDays) {
      if (!date) continue
      const iso = formatDate(date, 'yyyy-MM-dd')
      const isDisabled = isDateDisabled(date)
      if (!isDisabled) return iso
    }
    return null
  }

  const getPreferredFocusIso = (): string | null => {
    const focusDate = isRangeMode ? (selectedRange[0] ?? selectedRange[1]) : selectedDate

    if (focusDate) {
      return formatDate(focusDate, 'yyyy-MM-dd')
    }

    const today = normalizeDate(new Date())
    if (isDateInRange(today, minDateParsed, maxDateParsed)) {
      return formatDate(today, 'yyyy-MM-dd')
    }

    return getFirstEnabledIsoInView()
  }

  const focusDateButtonByIso = (iso: string): boolean => {
    const button = calendarRef.current?.querySelector(
      `button[data-date="${iso}"]`
    ) as HTMLButtonElement | null

    if (!button || button.disabled) return false
    button.focus()
    setActiveDateIso(iso)
    return true
  }

  const restoreFocus = () => {
    const target = restoreFocusRef.current ?? inputRef.current
    if (!target) return
    if (typeof (target as HTMLElement).focus === 'function') {
      ;(target as HTMLElement).focus()
    }
  }

  const addDays = (date: Date, days: number): Date => {
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    return next
  }

  const moveFocus = (deltaDays: number) => {
    const activeEl = document.activeElement as HTMLElement | null
    const currentIso = activeEl?.getAttribute('data-date') ?? activeDateIso ?? null

    const baseIso = currentIso ?? getPreferredFocusIso()
    if (!baseIso) return

    const baseDate = parseDate(baseIso)
    if (!baseDate) return

    let candidate = addDays(baseDate, deltaDays)
    for (let attempts = 0; attempts < 42; attempts++) {
      const iso = formatDate(candidate, 'yyyy-MM-dd')

      const el = calendarRef.current?.querySelector(
        `button[data-date="${iso}"]`
      ) as HTMLButtonElement | null

      if (el && !el.disabled) {
        el.focus()
        setActiveDateIso(iso)
        return
      }

      if (!el) {
        pendingFocusIsoRef.current = iso
        setViewingYear(candidate.getFullYear())
        setViewingMonth(candidate.getMonth())
        setActiveDateIso(iso)
        return
      }

      candidate = addDays(candidate, deltaDays)
    }
  }

  const handleCalendarKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (event.key) {
      case 'Escape': {
        event.preventDefault()
        closeCalendar()
        return
      }
      case 'ArrowRight': {
        event.preventDefault()
        moveFocus(1)
        return
      }
      case 'ArrowLeft': {
        event.preventDefault()
        moveFocus(-1)
        return
      }
      case 'ArrowDown': {
        event.preventDefault()
        moveFocus(7)
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        moveFocus(-7)
        return
      }
      case 'Enter':
      case ' ': {
        const activeEl = document.activeElement as HTMLButtonElement | null
        if (activeEl?.tagName === 'BUTTON' && activeEl.dataset.date) {
          event.preventDefault()
          if (!activeEl.disabled) activeEl.click()
        }
        return
      }
    }
  }

  const setRangeValue = (next: DatePickerRangeValue) => {
    if (!isControlled) {
      setInternalRangeValue(next)
    }
    ;(props as DatePickerRangeProps).onChange?.(next)
  }

  const selectDate = (date: Date | null) => {
    if (!date) return

    const normalizedDate = normalizeDate(date)

    // Check if date is disabled
    if (!isDateInRange(normalizedDate, minDateParsed, maxDateParsed)) {
      return
    }

    if (!isRangeMode) {
      if (!isControlled) {
        setInternalValue(normalizedDate)
      }

      ;(props as DatePickerSingleProps).onChange?.(normalizedDate)
      closeCalendar()
      return
    }

    const [start, end] = selectedRange

    if (!start || (start && end)) {
      setRangeValue([normalizedDate, null])
      return
    }

    if (normalizedDate < start) {
      // Range rule (same as TimePicker): end cannot be earlier than start
      setRangeValue([start, start])
    } else {
      setRangeValue([start, normalizedDate])
    }
  }

  const setToday = () => {
    selectDate(new Date())
  }

  const clearDate = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (!isRangeMode) {
      if (!isControlled) {
        setInternalValue(null)
      }

      ;(props as DatePickerSingleProps).onChange?.(null)
    } else {
      setRangeValue([null, null])
    }

    props.onClear?.()
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

  useEffect(() => {
    if (isOpen) {
      restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null
      const preferred = pendingFocusIsoRef.current ?? getPreferredFocusIso()
      pendingFocusIsoRef.current = null

      setTimeout(() => {
        if (preferred && focusDateButtonByIso(preferred)) return
        const fallback = getFirstEnabledIsoInView()
        if (fallback) focusDateButtonByIso(fallback)
      }, 0)

      return
    }

    setTimeout(() => {
      restoreFocus()
    }, 0)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const pending = pendingFocusIsoRef.current
    if (!pending) return
    pendingFocusIsoRef.current = null

    setTimeout(() => {
      if (focusDateButtonByIso(pending)) return
      const fallback = getFirstEnabledIsoInView()
      if (fallback) focusDateButtonByIso(fallback)
    }, 0)
  }, [isOpen, viewingMonth, viewingYear])

  const inputClasses = getDatePickerInputClasses(size, disabled || readonly)
  const iconButtonClasses = getDatePickerIconButtonClasses(size)

  return (
    <div className={classNames(datePickerBaseClasses, props.className)} {...divProps}>
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
          name={props.name}
          id={props.id}
          onClick={handleInputClick}
          aria-label={placeholder || 'Select date'}
        />

        {/* Clear button */}
        {showClearButton && (
          <button
            type="button"
            className={datePickerClearButtonClasses}
            onClick={clearDate}
            aria-label={labels.clearDate}>
            <Icon path={CloseIconPath} className="w-4 h-4" />
          </button>
        )}

        {/* Calendar icon button */}
        <button
          type="button"
          className={iconButtonClasses}
          disabled={disabled || readonly}
          onClick={toggleCalendar}
          aria-label={labels.toggleCalendar}>
          <Icon path={CalendarIconPath} className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar dropdown */}
      {isOpen && (
        <div
          ref={calendarRef}
          className={datePickerCalendarClasses}
          role="dialog"
          aria-modal="true"
          aria-label={labels.calendar}
          onKeyDown={handleCalendarKeyDown}>
          {/* Calendar header */}
          <div className={datePickerCalendarHeaderClasses}>
            <button
              type="button"
              className={datePickerNavButtonClasses}
              onClick={previousMonth}
              aria-label={labels.previousMonth}>
              <Icon path={ChevronLeftIconPath} className="w-5 h-5" />
            </button>
            <div className={datePickerMonthYearClasses}>
              {formatMonthYear(viewingYear, viewingMonth, props.locale)}
            </div>
            <button
              type="button"
              className={datePickerNavButtonClasses}
              onClick={nextMonth}
              aria-label={labels.nextMonth}>
              <Icon path={ChevronRightIconPath} className="w-5 h-5" />
            </button>
          </div>

          {/* Day names header */}
          <div className={datePickerCalendarGridClasses} role="row">
            {dayNames.map((day) => (
              <div key={day} className={datePickerDayNameClasses} role="columnheader">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div
            className={datePickerCalendarGridClasses}
            role="grid"
            aria-rowcount={6}
            aria-colcount={7}>
            {calendarDays.map((date, index) => {
              if (!date) return null

              const [rangeStart, rangeEnd] = selectedRange

              const isRangeStart = isRangeMode && rangeStart ? isSameDay(date, rangeStart) : false
              const isRangeEnd = isRangeMode && rangeEnd ? isSameDay(date, rangeEnd) : false
              const isInRange =
                isRangeMode &&
                rangeStart &&
                rangeEnd &&
                normalizeDate(date) >= normalizeDate(rangeStart) &&
                normalizeDate(date) <= normalizeDate(rangeEnd)

              const isSelected = !isRangeMode
                ? selectedDate
                  ? isSameDay(date, selectedDate)
                  : false
                : isRangeStart || isRangeEnd

              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDay = isTodayUtil(date)
              const isSelectingRangeEnd = isRangeMode && Boolean(rangeStart) && !rangeEnd
              const isBeforeRangeStart =
                isSelectingRangeEnd && rangeStart && normalizeDate(date) < normalizeDate(rangeStart)

              const isDisabled = isDateDisabled(date) || Boolean(isBeforeRangeStart)

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
                  onClick={() => selectDate(date)}
                  role="gridcell"
                  data-date={iso}
                  onFocus={() => setActiveDateIso(iso)}
                  tabIndex={activeDateIso === iso && !isDisabled ? 0 : -1}
                  aria-label={iso}
                  aria-selected={isSelected}
                  aria-current={isTodayDay ? 'date' : undefined}>
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          {/* Footer (range mode only) */}
          {isRangeMode && (
            <div className={datePickerFooterClasses}>
              <button type="button" className={datePickerFooterButtonClasses} onClick={setToday}>
                {labels.today}
              </button>
              <button
                type="button"
                className={datePickerFooterButtonClasses}
                onClick={closeCalendar}>
                {labels.ok}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
