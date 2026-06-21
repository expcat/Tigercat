import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  classNames,
  parseTime,
  formatTime,
  formatTimeDisplayWithLocale,
  getTimePeriodLabels,
  getTimePickerLabels,
  to12HourFormat,
  to24HourFormat,
  isTimeInRange,
  generateHours,
  generateMinutes,
  generateSeconds,
  getCurrentTime,
  timePickerBaseClasses,
  getTimePickerInputClasses,
  getTimePickerIconButtonClasses,
  focusTimePickerOption,
  type TimePickerSingleValue
} from '@expcat/tigercat-core'
import { useControlledState } from '../../hooks/useControlledState'
import type { TimePickerContext, TimePickerProps, TimePickerRangeValue } from './types'

export function useTimePickerState(allProps: TimePickerProps): TimePickerContext {
  const {
    size = 'md',
    format = '24',
    showSeconds = false,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
    disabled = false,
    readonly = false,
    required = false,
    minTime,
    maxTime,
    clearable = true,
    name,
    id,
    className,
    onClear,
    locale,
    labels: labelsOverrides,
    value,
    defaultValue,
    range,
    ...restProps
  } = allProps

  const divProps = (({ onChange: _omitOnChange, ...rest }) => rest)(restProps)

  const isRangeMode = range === true

  const [isOpen, setIsOpen] = useState(false)

  // Controlled/uncontrolled value handled by useControlledState. The stored
  // value space (`string | null` / range tuple) already matches the `onChange`
  // value space (the C-4 "aligned" case, no parse transform), so the setter
  // can own both internal state and onChange, replacing the previous manual
  // `isControlled` branches.
  const normalizeRangeValue = (
    input: TimePickerProps['value'] | null | undefined
  ): TimePickerRangeValue => {
    if (Array.isArray(input)) return [input[0] ?? null, input[1] ?? null]
    return [null, null]
  }

  const singleControlled: string | null | undefined =
    !isRangeMode && value !== undefined && (typeof value === 'string' || value === null)
      ? value
      : undefined

  const singleDefault: string | null = (() => {
    const dv = defaultValue
    if (typeof dv === 'string' || dv === null || dv === undefined) return dv ?? null
    return null
  })()

  const [singleValue, setSingleValue] = useControlledState<string | null>(
    singleControlled,
    singleDefault,
    allProps.onChange as ((time: TimePickerSingleValue) => void) | undefined
  )

  const [rangeValue, setRangeValue] = useControlledState<TimePickerRangeValue>(
    isRangeMode && value !== undefined ? normalizeRangeValue(value) : undefined,
    normalizeRangeValue(defaultValue),
    allProps.onChange as ((time: TimePickerRangeValue) => void) | undefined
  )

  const [activePart, setActivePart] = useState<'start' | 'end'>('start')

  const panelRef = useRef<HTMLDivElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentSingleValue: string | null = isRangeMode ? null : singleValue
  const currentRangeValue: TimePickerRangeValue = isRangeMode ? rangeValue : [null, null]

  const activeValue: string | null = isRangeMode
    ? currentRangeValue[activePart === 'start' ? 0 : 1]
    : currentSingleValue

  const parsedTime = parseTime(activeValue)

  // Internal state for time selection
  const [selectedHours, setSelectedHours] = useState<number>(parsedTime?.hours ?? 0)
  const [selectedMinutes, setSelectedMinutes] = useState<number>(parsedTime?.minutes ?? 0)
  const [selectedSeconds, setSelectedSeconds] = useState<number>(parsedTime?.seconds ?? 0)
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM')

  // Update internal state when value changes (or active part changes in range mode)
  const syncFromActiveValue = useCallback(() => {
    const parsed = parseTime(activeValue)
    if (!parsed) return

    setSelectedHours(parsed.hours)
    setSelectedMinutes(parsed.minutes)
    setSelectedSeconds(parsed.seconds)

    if (format === '12') {
      const { period } = to12HourFormat(parsed.hours)
      setSelectedPeriod(period)
    }
  }, [activeValue, format])

  useEffect(() => {
    syncFromActiveValue()
  }, [syncFromActiveValue])

  const labels = useMemo(
    () => getTimePickerLabels(locale, labelsOverrides),
    [locale, labelsOverrides]
  )

  const placeholder =
    allProps.placeholder ?? (isRangeMode ? labels.selectTimeRange : labels.selectTime)

  const periodLabels = useMemo(() => getTimePeriodLabels(locale), [locale])

  const displayValue = (() => {
    if (!isRangeMode) {
      return parsedTime
        ? formatTimeDisplayWithLocale(
            parsedTime.hours,
            parsedTime.minutes,
            parsedTime.seconds,
            format,
            showSeconds,
            locale
          )
        : ''
    }

    const toDisplay = (timeStr: string | null): string => {
      const parsed = parseTime(timeStr)
      if (!parsed) return ''
      return formatTimeDisplayWithLocale(
        parsed.hours,
        parsed.minutes,
        parsed.seconds,
        format,
        showSeconds,
        locale
      )
    }

    const start = toDisplay(currentRangeValue[0])
    const end = toDisplay(currentRangeValue[1])
    if (!start && !end) return ''
    return `${start} - ${end}`
  })()

  const showClearButton = (() => {
    if (!clearable || disabled || readonly) return false
    if (!isRangeMode) return currentSingleValue !== null
    return currentRangeValue[0] !== null || currentRangeValue[1] !== null
  })()

  const hoursList = useMemo(() => generateHours(hourStep, format), [hourStep, format])
  const minutesList = useMemo(() => generateMinutes(minuteStep), [minuteStep])
  const secondsList = useMemo(() => generateSeconds(secondStep), [secondStep])

  const togglePanel = () => {
    if (!disabled && !readonly) {
      if (isOpen) {
        closePanel()
        return
      }

      setIsOpen(true)
      syncFromActiveValue()
    }
  }

  const closePanel = () => {
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const focusOptionInUnit = (
    unit: 'hour' | 'minute' | 'second' | 'period',
    action: 'prev' | 'next' | 'first' | 'last'
  ) => {
    focusTimePickerOption(panelRef.current, unit, action)
  }

  const handlePanelKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closePanel()
      return
    }

    const active = document.activeElement as HTMLElement | null
    const unit = active?.getAttribute('data-tiger-timepicker-unit') as
      | 'hour'
      | 'minute'
      | 'second'
      | 'period'
      | null

    if (!unit) return

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusOptionInUnit(unit, 'prev')
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusOptionInUnit(unit, 'next')
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusOptionInUnit(unit, 'first')
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusOptionInUnit(unit, 'last')
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      const el = document.activeElement as HTMLButtonElement | null
      if (el && el.tagName === 'BUTTON' && !el.disabled) {
        event.preventDefault()
        el.click()
      }
    }
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

    let timeString = formatTime(hours, minutes, seconds, showSeconds)

    if (!isRangeMode) {
      setSingleValue(timeString)
      return
    }

    const index = activePart === 'start' ? 0 : 1

    const parsedStart = parseTime(currentRangeValue[0])
    const parsedEnd = parseTime(currentRangeValue[1])
    const candidateSeconds = hours * 3600 + minutes * 60 + seconds
    const startSeconds = parsedStart
      ? parsedStart.hours * 3600 + parsedStart.minutes * 60 + parsedStart.seconds
      : null
    const endSeconds = parsedEnd
      ? parsedEnd.hours * 3600 + parsedEnd.minutes * 60 + parsedEnd.seconds
      : null

    // Keep range ordered: end should never be earlier than start.
    // If user selects an out-of-order time, clamp the opposite side to match.
    if (activePart === 'end' && parsedStart && startSeconds !== null) {
      if (candidateSeconds < startSeconds) {
        timeString = formatTime(
          parsedStart.hours,
          parsedStart.minutes,
          parsedStart.seconds,
          showSeconds
        )
        setSelectedHours(parsedStart.hours)
        setSelectedMinutes(parsedStart.minutes)
        setSelectedSeconds(parsedStart.seconds)
        if (format === '12') {
          const { period } = to12HourFormat(parsedStart.hours)
          setSelectedPeriod(period)
        }
      }
    }
    const nextRange: TimePickerRangeValue = [currentRangeValue[0], currentRangeValue[1]]
    nextRange[index] = timeString

    if (activePart === 'start' && endSeconds !== null && candidateSeconds > endSeconds) {
      nextRange[1] = timeString
    }

    setRangeValue(nextRange)

    if (activePart === 'start' && nextRange[1] === null) {
      setActivePart('end')
    }
  }

  const clearTime = (event: React.MouseEvent) => {
    event.stopPropagation()

    if (!isRangeMode) {
      setSingleValue(null)
      onClear?.()
      return
    }

    setRangeValue([null, null])
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

  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    if (!panel) return

    const focusTimer = window.setTimeout(() => {
      const selectedHour = panel.querySelector<HTMLButtonElement>(
        'button[data-tiger-timepicker-unit="hour"][aria-selected="true"]:not([disabled])'
      )
      if (selectedHour) {
        selectedHour.focus()
        return
      }

      const firstHour = panel.querySelector<HTMLButtonElement>(
        'button[data-tiger-timepicker-unit="hour"]:not([disabled])'
      )
      firstHour?.focus()
    }, 0)

    return () => window.clearTimeout(focusTimer)
  }, [isOpen, activePart])

  const inputClasses = getTimePickerInputClasses(size, disabled || readonly)
  const iconButtonClasses = getTimePickerIconButtonClasses(size)

  return {
    panelRef,
    inputWrapperRef,
    inputRef,
    isOpen,
    activePart,
    setActivePart,
    isRangeMode,
    placeholder,
    disabled,
    readonly,
    required,
    name,
    id,
    format,
    showSeconds,
    locale,
    labelsOverrides,
    containerClasses: classNames(timePickerBaseClasses, className),
    divProps,
    displayValue,
    showClearButton,
    inputClasses,
    iconButtonClasses,
    labels,
    periodLabels,
    hoursList,
    minutesList,
    secondsList,
    selectedHours,
    selectedMinutes,
    selectedSeconds,
    selectedPeriod,
    togglePanel,
    closePanel,
    handleInputClick,
    clearTime,
    setNow,
    handlePanelKeyDown,
    selectHour,
    selectMinute,
    selectSecond,
    selectPeriod,
    isHourDisabled,
    isMinuteDisabled
  }
}
