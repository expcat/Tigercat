import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  classNames,
  parseDate,
  formatDate,
  addDays,
  addMonths,
  isDateInRange,
  getCalendarDays,
  getShortDayNames,
  normalizeDate,
  datePickerBaseClasses,
  getDatePickerInputClasses,
  getDatePickerIconButtonClasses,
  getDatePickerLocaleCode,
  getDatePickerLabels,
  getLocaleDirection,
  type DatePickerRangeValue,
  type DatePickerRangeModelValue,
  type DatePickerShortcut
} from '@expcat/tigercat-core'
import { useControlledState } from '../../hooks/useControlledState'
import {
  isRangeDatePicker,
  type DatePickerContext,
  type DatePickerProps,
  type DatePickerSingleProps,
  type DatePickerRangeProps
} from './types'

export function useDatePickerState(props: DatePickerProps): DatePickerContext {
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

  // Controlled/uncontrolled value handled by useControlledState. Values are
  // parsed to the resolved `Date | null` space at the hook boundary so the
  // stored value space and the `onChange` value space align (the C-4 "aligned"
  // case): the setter writes internal state only when uncontrolled and always
  // fires onChange, replacing the previous manual `isControlled` branches.
  const singleProps = props as DatePickerSingleProps
  const rangeProps = props as DatePickerRangeProps

  const parseRangeTuple = (
    tuple: DatePickerRangeModelValue | null | undefined
  ): DatePickerRangeValue => {
    if (!tuple || !Array.isArray(tuple)) return [null, null]
    return [parseDate(tuple[0]), parseDate(tuple[1])]
  }

  const [singleValue, setSingleValue] = useControlledState<Date | null>(
    !isRangeMode && singleProps.value !== undefined
      ? parseDate(singleProps.value ?? null)
      : undefined,
    parseDate(singleProps.defaultValue ?? null),
    singleProps.onChange
  )

  const [rangeValue, setRangeValue] = useControlledState<DatePickerRangeValue>(
    isRangeMode && rangeProps.value !== undefined ? parseRangeTuple(rangeProps.value) : undefined,
    parseRangeTuple(rangeProps.defaultValue),
    rangeProps.onChange
  )

  const calendarRef = useRef<HTMLDivElement>(null)
  const mobileCalendarRef = useRef<HTMLDivElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingFocusIsoRef = useRef<string | null>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  const selectedDate = isRangeMode ? null : singleValue
  const selectedRange: DatePickerRangeValue = useMemo(
    () => (isRangeMode ? rangeValue : [null, null]),
    [isRangeMode, rangeValue]
  )

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

  const selectDate = (date: Date | null) => {
    if (!date) return

    const normalizedDate = normalizeDate(date)

    // Check if date is disabled
    if (!isDateInRange(normalizedDate, minDateParsed, maxDateParsed)) {
      return
    }

    if (!isRangeMode) {
      setSingleValue(normalizedDate)
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
      setSingleValue(normalized)
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
      setSingleValue(date)
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
      setSingleValue(null)
    } else {
      setRangeValue([null, null])
    }

    props.onClear?.()
  }

  const stepViewingMonth = (delta: number) => {
    const next = addMonths(new Date(viewingYear, viewingMonth, 1), delta)
    setViewingYear(next.getFullYear())
    setViewingMonth(next.getMonth())
  }

  const previousMonth = () => stepViewingMonth(-1)

  const nextMonth = () => stepViewingMonth(1)

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

  return {
    inputWrapperRef,
    inputRef,
    calendarRef,
    mobileCalendarRef,
    isOpen,
    activeRangePart,
    setActiveRangePart,
    activeDateIso,
    setActiveDateIso,
    isRangeMode,
    placeholder,
    disabled,
    readonly,
    required,
    name: props.name,
    id: props.id,
    shortcuts: props.shortcuts,
    containerClasses: classNames(datePickerBaseClasses, props.className),
    divProps,
    displayValue,
    showClearButton,
    inputClasses,
    iconButtonClasses,
    labels,
    localeCode,
    isRtl,
    dayNames,
    calendarDays,
    selectedDate,
    selectedRange,
    viewingMonth,
    viewingYear,
    mobileDate,
    mobileYears,
    mobileDays,
    toggleCalendar,
    closeCalendar,
    clearDate,
    selectDate,
    setToday,
    handleShortcut,
    handleCalendarKeyDown,
    previousMonth,
    nextMonth,
    updateMobileDate,
    isCurrentMonth,
    isDateDisabled
  }
}
