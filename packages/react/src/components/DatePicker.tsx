import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
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
  datePickerMobileWheelClasses,
  datePickerMobileWheelGridClasses,
  datePickerMobileWheelSelectClasses,
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
  getDatePickerLocaleCode,
  getDatePickerLabels,
  getLocaleDirection,
  type DatePickerProps as CoreDatePickerProps,
  type DatePickerSingleModelValue,
  type DatePickerRangeModelValue,
  type DatePickerRangeValue,
  type DatePickerShortcut
} from '@expcat/tigercat-core'

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
    shortcuts: _shortcuts,
    ...rest
  }) => rest)(props)

  const [isOpen, setIsOpen] = useState(false)
  const [activeDateIso, setActiveDateIso] = useState<string | null>(null)
  const [activeRangePart, setActiveRangePart] = useState<'start' | 'end'>('start')
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
  const mobileCalendarRef = useRef<HTMLDivElement>(null)
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

  const minDateParsed = useMemo(() => parseDate(props.minDate ?? null), [props.minDate])
  const maxDateParsed = useMemo(() => parseDate(props.maxDate ?? null), [props.maxDate])
  const localeCode = useMemo(() => getDatePickerLocaleCode(props.locale), [props.locale])

  // Current viewing month/year in calendar
  const [viewingMonth, setViewingMonth] = useState(
    (selectedDate ?? selectedRange[0])?.getMonth() ?? new Date().getMonth()
  )
  const [viewingYear, setViewingYear] = useState(
    (selectedDate ?? selectedRange[0])?.getFullYear() ?? new Date().getFullYear()
  )

  const displayValue = (() => {
    if (!isRangeMode) {
      return selectedDate ? formatDate(selectedDate, format, localeCode) : ''
    }

    const [start, end] = selectedRange
    const startText = start ? formatDate(start, format, localeCode) : ''
    const endText = end ? formatDate(end, format, localeCode) : ''

    if (!startText && !endText) return ''
    if (startText && endText) return `${startText} - ${endText}`
    return startText ? `${startText} - ` : ` - ${endText}`
  })()

  const showClearButton = (() => {
    if (!clearable || disabled || readonly) return false
    if (!isRangeMode) return selectedDate !== null
    return selectedRange[0] !== null || selectedRange[1] !== null
  })()

  const calendarDays = useMemo(
    () => getCalendarDays(viewingYear, viewingMonth),
    [viewingYear, viewingMonth]
  )
  const selectedDateRef = useRef<Date | null>(selectedDate)
  const selectedRangeRef = useRef<DatePickerRangeValue>(selectedRange)
  const minDateParsedRef = useRef<Date | null>(minDateParsed)
  const maxDateParsedRef = useRef<Date | null>(maxDateParsed)
  const calendarDaysRef = useRef<Array<Date | null>>(calendarDays)

  selectedDateRef.current = selectedDate
  selectedRangeRef.current = selectedRange
  minDateParsedRef.current = minDateParsed
  maxDateParsedRef.current = maxDateParsed
  calendarDaysRef.current = calendarDays

  const dayNames = useMemo(() => getShortDayNames(localeCode), [localeCode])
  const isRtl = getLocaleDirection(localeCode) === 'rtl'

  const labels = useMemo(
    () => getDatePickerLabels(props.locale, props.labels),
    [props.locale, props.labels]
  )

  const mobileDate = useMemo(() => {
    if (!isRangeMode) return selectedDate ?? normalizeDate(new Date())
    const [start, end] = selectedRange
    return (activeRangePart === 'start' ? start : end) ?? start ?? end ?? normalizeDate(new Date())
  }, [activeRangePart, isRangeMode, selectedDate, selectedRange])

  const mobileYears = useMemo(() => {
    const baseYear = mobileDate.getFullYear()
    return Array.from({ length: 101 }, (_, index) => baseYear - 50 + index)
  }, [mobileDate])

  const mobileDays = useMemo(() => {
    const daysInMonth = new Date(mobileDate.getFullYear(), mobileDate.getMonth() + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, index) => index + 1)
  }, [mobileDate])

  const toggleCalendar = () => {
    if (!disabled && !readonly) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        restoreFocusRef.current = inputRef.current ?? null
        // Reset viewing month to selected date or current month
        const baseDate = selectedDate ?? selectedRange[0]
        if (baseDate) {
          setViewingMonth(baseDate.getMonth())
          setViewingYear(baseDate.getFullYear())
        }
      }
    }
  }

  const closeCalendar = useCallback(() => {
    setIsOpen(false)
  }, [])

  const isDateDisabled = useCallback((date: Date | null): boolean => {
    if (!date) return true
    return !isDateInRange(date, minDateParsedRef.current, maxDateParsedRef.current)
  }, [])

  const getFirstEnabledIsoInView = useCallback((): string | null => {
    for (const date of calendarDaysRef.current) {
      if (!date) continue
      const iso = formatDate(date, 'yyyy-MM-dd')
      const isDisabled = isDateDisabled(date)
      if (!isDisabled) return iso
    }
    return null
  }, [isDateDisabled])

  const getPreferredFocusIso = useCallback((): string | null => {
    const focusDate = isRangeMode
      ? (selectedRangeRef.current[0] ?? selectedRangeRef.current[1])
      : selectedDateRef.current

    if (focusDate) {
      return formatDate(focusDate, 'yyyy-MM-dd')
    }

    const today = normalizeDate(new Date())
    if (isDateInRange(today, minDateParsedRef.current, maxDateParsedRef.current)) {
      return formatDate(today, 'yyyy-MM-dd')
    }

    return getFirstEnabledIsoInView()
  }, [isRangeMode, getFirstEnabledIsoInView])

  const focusDateButtonByIso = useCallback((iso: string): boolean => {
    const button = calendarRef.current?.querySelector(
      `button[data-date="${iso}"]`
    ) as HTMLButtonElement | null

    if (!button || button.disabled) return false
    button.focus()
    setActiveDateIso(iso)
    return true
  }, [])

  const restoreFocus = useCallback(() => {
    const target = restoreFocusRef.current ?? inputRef.current
    if (!target) return
    if (typeof (target as HTMLElement).focus === 'function') {
      ;(target as HTMLElement).focus()
    }
  }, [])

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

    // Range rule: end cannot be earlier than start
    setRangeValue([start, normalizedDate < start ? start : normalizedDate])
  }

  const setToday = () => {
    selectDate(new Date())
  }

  const commitMobileDate = (date: Date) => {
    const normalized = normalizeDate(date)
    if (!isDateInRange(normalized, minDateParsed, maxDateParsed)) return

    setViewingYear(normalized.getFullYear())
    setViewingMonth(normalized.getMonth())

    if (!isRangeMode) {
      if (!isControlled) {
        setInternalValue(normalized)
      }
      ;(props as DatePickerSingleProps).onChange?.(normalized)
      return
    }

    const [start, end] = selectedRange
    if (activeRangePart === 'start') {
      const next: DatePickerRangeValue = [normalized, end && end < normalized ? normalized : end]
      setRangeValue(next)
      setActiveRangePart('end')
      return
    }

    setRangeValue([start ?? normalized, start && normalized < start ? start : normalized])
  }

  const updateMobileDate = (part: 'year' | 'month' | 'day', value: number) => {
    const nextYear = part === 'year' ? value : mobileDate.getFullYear()
    const nextMonth = part === 'month' ? value : mobileDate.getMonth()
    const maxDay = new Date(nextYear, nextMonth + 1, 0).getDate()
    const nextDay = Math.min(part === 'day' ? value : mobileDate.getDate(), maxDay)
    commitMobileDate(new Date(nextYear, nextMonth, nextDay))
  }

  const handleShortcut = (shortcut: DatePickerShortcut) => {
    const val = typeof shortcut.value === 'function' ? shortcut.value() : shortcut.value
    if (!isRangeMode) {
      const date =
        val instanceof Date
          ? normalizeDate(val)
          : val
            ? normalizeDate(parseDate(val as string)!)
            : null
      if (!isControlled) setInternalValue(date)
      ;(props as DatePickerSingleProps).onChange?.(date)
    } else {
      const range = val as DatePickerRangeModelValue | null
      if (range && Array.isArray(range)) {
        const parsed: DatePickerRangeValue = [
          range[0]
            ? normalizeDate(range[0] instanceof Date ? range[0] : parseDate(range[0])!)
            : null,
          range[1]
            ? normalizeDate(range[1] instanceof Date ? range[1] : parseDate(range[1])!)
            : null
        ]
        setRangeValue(parsed)
      }
    }
    closeCalendar()
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

  const isCurrentMonth = (date: Date | null): boolean => {
    if (!date) return false
    return date.getMonth() === viewingMonth
  }

  // Consolidated open/close effect: click-outside listener + focus management
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          calendarRef.current &&
          mobileCalendarRef.current &&
          inputWrapperRef.current &&
          !calendarRef.current.contains(event.target as Node) &&
          !mobileCalendarRef.current.contains(event.target as Node) &&
          !inputWrapperRef.current.contains(event.target as Node)
        ) {
          closeCalendar()
        }
      }

      document.addEventListener('click', handleClickOutside)

      const preferred = pendingFocusIsoRef.current ?? getPreferredFocusIso()
      pendingFocusIsoRef.current = null

      setTimeout(() => {
        if (preferred && focusDateButtonByIso(preferred)) return
        const fallback = getFirstEnabledIsoInView()
        if (fallback) focusDateButtonByIso(fallback)
      }, 0)

      return () => document.removeEventListener('click', handleClickOutside)
    }

    setTimeout(() => restoreFocus(), 0)
  }, [
    isOpen,
    closeCalendar,
    focusDateButtonByIso,
    getFirstEnabledIsoInView,
    getPreferredFocusIso,
    restoreFocus
  ])

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
  }, [isOpen, focusDateButtonByIso, getFirstEnabledIsoInView])

  const inputClasses = useMemo(
    () => getDatePickerInputClasses(size, disabled || readonly),
    [size, disabled, readonly]
  )
  const iconButtonClasses = useMemo(() => getDatePickerIconButtonClasses(size), [size])

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
          onClick={toggleCalendar}
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
          ref={mobileCalendarRef}
          className={datePickerMobileWheelClasses}
          role="group"
          aria-label={labels.calendar}>
          {isRangeMode && (
            <div className="mb-3 flex items-center gap-2">
              <button
                type="button"
                className={datePickerFooterButtonClasses}
                aria-selected={activeRangePart === 'start'}
                onClick={() => setActiveRangePart('start')}>
                Start
              </button>
              <button
                type="button"
                className={datePickerFooterButtonClasses}
                aria-selected={activeRangePart === 'end'}
                onClick={() => setActiveRangePart('end')}>
                End
              </button>
            </div>
          )}
          <div className={datePickerMobileWheelGridClasses}>
            <select
              className={datePickerMobileWheelSelectClasses}
              value={mobileDate.getFullYear()}
              aria-label="Year"
              onChange={(event) => updateMobileDate('year', Number(event.target.value))}>
              {mobileYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              className={datePickerMobileWheelSelectClasses}
              value={mobileDate.getMonth()}
              aria-label="Month"
              onChange={(event) => updateMobileDate('month', Number(event.target.value))}>
              {Array.from({ length: 12 }, (_, month) => (
                <option key={month} value={month}>
                  {month + 1}
                </option>
              ))}
            </select>
            <select
              className={datePickerMobileWheelSelectClasses}
              value={mobileDate.getDate()}
              aria-label="Day"
              onChange={(event) => updateMobileDate('day', Number(event.target.value))}>
              {mobileDays.map((day) => (
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
              aria-label={`Mobile ${labels.ok}`}
              onClick={closeCalendar}>
              {labels.ok}
            </button>
          </div>
        </div>
      )}
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
              <Icon path={isRtl ? ChevronRightIconPath : ChevronLeftIconPath} className="w-5 h-5" />
            </button>
            <div className={datePickerMonthYearClasses}>
              {formatMonthYear(viewingYear, viewingMonth, localeCode)}
            </div>
            <button
              type="button"
              className={datePickerNavButtonClasses}
              onClick={nextMonth}
              aria-label={labels.nextMonth}>
              <Icon path={isRtl ? ChevronLeftIconPath : ChevronRightIconPath} className="w-5 h-5" />
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
          {(() => {
            // Pre-compute range values once instead of per-cell
            const [rangeStart, rangeEnd] = selectedRange
            const normStart = rangeStart ? normalizeDate(rangeStart) : null
            const normEnd = rangeEnd ? normalizeDate(rangeEnd) : null
            const isSelectingEnd = isRangeMode && Boolean(rangeStart) && !rangeEnd

            return (
              <div
                className={datePickerCalendarGridClasses}
                role="grid"
                aria-rowcount={6}
                aria-colcount={7}>
                {calendarDays.map((date, index) => {
                  if (!date) return null

                  const normDate = normalizeDate(date)

                  const isRangeStart =
                    isRangeMode && rangeStart ? isSameDay(date, rangeStart) : false
                  const isRangeEnd = isRangeMode && rangeEnd ? isSameDay(date, rangeEnd) : false
                  const isInRange =
                    isRangeMode &&
                    normStart &&
                    normEnd &&
                    normDate >= normStart &&
                    normDate <= normEnd

                  const isSelected = !isRangeMode
                    ? selectedDate
                      ? isSameDay(date, selectedDate)
                      : false
                    : isRangeStart || isRangeEnd

                  const isCurrentMonthDay = isCurrentMonth(date)
                  const isTodayDay = isTodayUtil(date)
                  const isBeforeRangeStart = isSelectingEnd && normStart && normDate < normStart

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
            )
          })()}

          {/* Shortcuts panel */}
          {props.shortcuts && props.shortcuts.length > 0 && (
            <div className="flex flex-wrap gap-1 px-3 py-2 border-t border-[var(--tiger-border,#e5e7eb)]">
              {props.shortcuts.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  className={datePickerFooterButtonClasses}
                  onClick={() => handleShortcut(sc)}>
                  {sc.label}
                </button>
              ))}
            </div>
          )}

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
