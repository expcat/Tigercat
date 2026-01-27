import { ref, computed, Ref, watch } from 'vue'
import {
  parseTime,
  formatTime,
  formatTimeDisplayWithLocale,
  to12HourFormat,
  to24HourFormat,
  isTimeInRange,
  generateHours,
  generateMinutes,
  generateSeconds,
  type TimeFormat,
  type TimePickerRangeValue
} from '@expcat/tigercat-core'

export interface UseTimeSelectionOptions {
  /** Current model value */
  modelValue: Ref<string | null | [string | null, string | null]>
  /** Whether range mode is enabled */
  range: Ref<boolean>
  /** Time format (12/24) */
  format: Ref<TimeFormat>
  /** Show seconds */
  showSeconds: Ref<boolean>
  /** Hour step */
  hourStep: Ref<number>
  /** Minute step */
  minuteStep: Ref<number>
  /** Second step */
  secondStep: Ref<number>
  /** Minimum time */
  minTime?: Ref<string | null>
  /** Maximum time */
  maxTime?: Ref<string | null>
  /** Locale for display */
  locale?: Ref<string | undefined>
  /** Emit update:modelValue */
  onUpdate: (value: string | null | [string | null, string | null]) => void
  /** Emit change */
  onChange: (value: string | null | [string | null, string | null]) => void
  /** Emit clear */
  onClear?: () => void
}

export interface UseTimeSelectionReturn {
  /** Active part in range mode */
  activePart: Ref<'start' | 'end'>
  /** Currently selected hours (24h format internally) */
  selectedHours: Ref<number>
  /** Currently selected minutes */
  selectedMinutes: Ref<number>
  /** Currently selected seconds */
  selectedSeconds: Ref<number>
  /** Currently selected period (AM/PM) for 12h format */
  selectedPeriod: Ref<'AM' | 'PM'>
  /** Current single value (non-range) */
  currentSingleValue: Ref<string | null>
  /** Current range value */
  currentRangeValue: Ref<TimePickerRangeValue>
  /** Formatted display value */
  displayValue: Ref<string>
  /** Whether there is a value (for clear button) */
  hasValue: Ref<boolean>
  /** Available hours list */
  hoursList: Ref<number[]>
  /** Available minutes list */
  minutesList: Ref<number[]>
  /** Available seconds list */
  secondsList: Ref<number[]>
  /** Select hour */
  selectHour: (hour: number) => void
  /** Select minute */
  selectMinute: (minute: number) => void
  /** Select second */
  selectSecond: (second: number) => void
  /** Select AM/PM period */
  selectPeriod: (period: 'AM' | 'PM') => void
  /** Clear time selection */
  clearTime: (event: Event) => void
  /** Sync selection state from current value */
  syncSelectionFromValue: () => void
  /** Switch active part (range mode) */
  setActivePart: (part: 'start' | 'end') => void
}

export function useTimeSelection(options: UseTimeSelectionOptions): UseTimeSelectionReturn {
  const {
    modelValue,
    range,
    format,
    showSeconds,
    hourStep,
    minuteStep,
    secondStep,
    minTime,
    maxTime,
    locale,
    onUpdate,
    onChange,
    onClear
  } = options

  const activePart = ref<'start' | 'end'>('start')
  const selectedHours = ref(0)
  const selectedMinutes = ref(0)
  const selectedSeconds = ref(0)
  const selectedPeriod = ref<'AM' | 'PM'>('AM')

  const normalizeRangeValue = (value: unknown): TimePickerRangeValue => {
    if (Array.isArray(value)) return [value[0] ?? null, value[1] ?? null]
    return [null, null]
  }

  const currentRangeValue = computed<TimePickerRangeValue>(() => {
    if (!range.value) return [null, null]
    return normalizeRangeValue(modelValue.value)
  })

  const currentSingleValue = computed<string | null>(() => {
    if (range.value) return null
    return typeof modelValue.value === 'string' || modelValue.value === null
      ? modelValue.value
      : null
  })

  const activeValue = computed<string | null>(() => {
    if (!range.value) return currentSingleValue.value
    return currentRangeValue.value[activePart.value === 'start' ? 0 : 1]
  })

  const parsedTime = computed(() => parseTime(activeValue.value))

  const syncSelectionFromValue = () => {
    const parsed = parseTime(activeValue.value)
    if (!parsed) return

    selectedHours.value = parsed.hours
    selectedMinutes.value = parsed.minutes
    selectedSeconds.value = parsed.seconds

    if (format.value === '12') {
      const { period } = to12HourFormat(parsed.hours)
      selectedPeriod.value = period
    }
  }

  // Auto-sync when value changes
  watch(() => [activeValue.value, format.value] as const, syncSelectionFromValue, {
    immediate: true
  })

  const displayValue = computed(() => {
    if (!range.value) {
      if (!parsedTime.value) return ''
      return formatTimeDisplayWithLocale(
        parsedTime.value.hours,
        parsedTime.value.minutes,
        parsedTime.value.seconds,
        format.value,
        showSeconds.value,
        locale?.value
      )
    }

    const toDisplay = (timeStr: string | null): string => {
      const parsed = parseTime(timeStr)
      if (!parsed) return ''
      return formatTimeDisplayWithLocale(
        parsed.hours,
        parsed.minutes,
        parsed.seconds,
        format.value,
        showSeconds.value,
        locale?.value
      )
    }

    const start = toDisplay(currentRangeValue.value[0])
    const end = toDisplay(currentRangeValue.value[1])
    if (!start && !end) return ''
    return `${start} - ${end}`
  })

  const hasValue = computed(() => {
    if (!range.value) return currentSingleValue.value !== null
    return currentRangeValue.value[0] !== null || currentRangeValue.value[1] !== null
  })

  const hoursList = computed(() => generateHours(hourStep.value, format.value))
  const minutesList = computed(() => generateMinutes(minuteStep.value))
  const secondsList = computed(() => generateSeconds(secondStep.value))

  const updateTime = () => {
    if (
      !isTimeInRange(
        selectedHours.value,
        selectedMinutes.value,
        minTime?.value ?? null,
        maxTime?.value ?? null
      )
    ) {
      return
    }

    let timeString = formatTime(
      selectedHours.value,
      selectedMinutes.value,
      selectedSeconds.value,
      showSeconds.value
    )

    if (!range.value) {
      onUpdate(timeString)
      onChange(timeString)
      return
    }

    const nextRange: [string | null, string | null] = [...currentRangeValue.value]
    const index = activePart.value === 'start' ? 0 : 1

    const parsedStart = parseTime(currentRangeValue.value[0])
    const parsedEnd = parseTime(currentRangeValue.value[1])
    const candidateSeconds =
      selectedHours.value * 3600 + selectedMinutes.value * 60 + selectedSeconds.value
    const startSeconds = parsedStart
      ? parsedStart.hours * 3600 + parsedStart.minutes * 60 + parsedStart.seconds
      : null
    const endSeconds = parsedEnd
      ? parsedEnd.hours * 3600 + parsedEnd.minutes * 60 + parsedEnd.seconds
      : null

    // Keep range ordered
    if (activePart.value === 'end' && parsedStart && startSeconds !== null) {
      if (candidateSeconds < startSeconds) {
        timeString = formatTime(
          parsedStart.hours,
          parsedStart.minutes,
          parsedStart.seconds,
          showSeconds.value
        )
        selectedHours.value = parsedStart.hours
        selectedMinutes.value = parsedStart.minutes
        selectedSeconds.value = parsedStart.seconds

        if (format.value === '12') {
          const { period } = to12HourFormat(parsedStart.hours)
          selectedPeriod.value = period
        }
      }
    }

    nextRange[index] = timeString

    if (activePart.value === 'start' && endSeconds !== null && candidateSeconds > endSeconds) {
      nextRange[1] = timeString
    }

    onUpdate(nextRange)
    onChange(nextRange)

    if (activePart.value === 'start' && nextRange[1] === null) {
      activePart.value = 'end'
    }
  }

  const selectHour = (hour: number) => {
    if (format.value === '12') {
      selectedHours.value = to24HourFormat(hour, selectedPeriod.value)
    } else {
      selectedHours.value = hour
    }
    updateTime()
  }

  const selectMinute = (minute: number) => {
    selectedMinutes.value = minute
    updateTime()
  }

  const selectSecond = (second: number) => {
    selectedSeconds.value = second
    updateTime()
  }

  const selectPeriod = (period: 'AM' | 'PM') => {
    selectedPeriod.value = period
    const { hours: hours12 } = to12HourFormat(selectedHours.value)
    selectedHours.value = to24HourFormat(hours12, period)
    updateTime()
  }

  const clearTime = (event: Event) => {
    event.stopPropagation()

    if (!range.value) {
      onUpdate(null)
      onChange(null)
    } else {
      onUpdate([null, null])
      onChange([null, null])
    }

    onClear?.()
  }

  const setActivePart = (part: 'start' | 'end') => {
    activePart.value = part
    syncSelectionFromValue()
  }

  return {
    activePart,
    selectedHours,
    selectedMinutes,
    selectedSeconds,
    selectedPeriod,
    currentSingleValue,
    currentRangeValue,
    displayValue,
    hasValue,
    hoursList,
    minutesList,
    secondsList,
    selectHour,
    selectMinute,
    selectSecond,
    selectPeriod,
    clearTime,
    syncSelectionFromValue,
    setActivePart
  }
}
