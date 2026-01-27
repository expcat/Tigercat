import { Ref, computed, watch } from 'vue'
import {
  parseDate,
  formatDate,
  isDateInRange,
  normalizeDate,
  type DateFormat
} from '@expcat/tigercat-core'

export interface UseDateSelectionOptions {
  /** Whether range mode is enabled */
  range: Ref<boolean>
  /** Current model value (single date or range) */
  modelValue: Ref<Date | string | null | [Date | string | null, Date | string | null]>
  /** Date format for display */
  format: Ref<DateFormat>
  /** Minimum selectable date */
  minDate?: Ref<Date | null>
  /** Maximum selectable date */
  maxDate?: Ref<Date | null>
  /** Emit update:modelValue */
  onUpdate: (value: Date | null | [Date | null, Date | null]) => void
  /** Emit change */
  onChange: (value: Date | null | [Date | null, Date | null]) => void
  /** Emit clear */
  onClear?: () => void
  /** Close picker after selection */
  onClose?: () => void
}

export interface UseDateSelectionReturn {
  /** Parsed selected date (single mode only) */
  selectedDate: Ref<Date | null>
  /** Parsed selected range [start, end] */
  selectedRange: Ref<[Date | null, Date | null]>
  /** Formatted display value */
  displayValue: Ref<string>
  /** Whether there is a value to show (for clear button) */
  hasValue: Ref<boolean>
  /** Select a date (handles both single and range mode) */
  selectDate: (date: Date | null) => void
  /** Clear the selection */
  clearDate: (event: Event) => void
  /** Set to today's date */
  setToday: () => void
  /** Check if date is selected */
  isSelected: (date: Date) => boolean
  /** Check if date is in selected range */
  isInSelectedRange: (date: Date) => boolean
  /** Check if date is range start */
  isRangeStart: (date: Date) => boolean
  /** Check if date is range end */
  isRangeEnd: (date: Date) => boolean
}

export function useDateSelection(options: UseDateSelectionOptions): UseDateSelectionReturn {
  const { range, modelValue, format, minDate, maxDate, onUpdate, onChange, onClear, onClose } =
    options

  const selectedDate = computed(() => {
    if (range.value) return null
    return parseDate(modelValue.value as Date | string | null)
  })

  const selectedRange = computed<[Date | null, Date | null]>(() => {
    if (!range.value) return [null, null]
    const raw = modelValue.value as [Date | string | null, Date | string | null] | null
    if (!raw || !Array.isArray(raw)) return [null, null]
    return [parseDate(raw[0]), parseDate(raw[1])]
  })

  const displayValue = computed(() => {
    if (!range.value) {
      return selectedDate.value ? formatDate(selectedDate.value, format.value) : ''
    }

    const [start, end] = selectedRange.value
    const startText = start ? formatDate(start, format.value) : ''
    const endText = end ? formatDate(end, format.value) : ''

    if (!startText && !endText) return ''
    if (startText && endText) return `${startText} - ${endText}`
    return startText ? `${startText} - ` : ` - ${endText}`
  })

  const hasValue = computed(() => {
    if (!range.value) return selectedDate.value !== null
    const [start, end] = selectedRange.value
    return start !== null || end !== null
  })

  const selectDate = (date: Date | null) => {
    if (!date) return

    const normalizedDate = normalizeDate(date)

    // Check if date is within allowed range
    if (!isDateInRange(normalizedDate, minDate?.value ?? null, maxDate?.value ?? null)) {
      return
    }

    if (!range.value) {
      onUpdate(normalizedDate)
      onChange(normalizedDate)
      onClose?.()
      return
    }

    const [start, end] = selectedRange.value

    // Range selection logic
    if (!start || (start && end)) {
      // Start new range
      onUpdate([normalizedDate, null])
      onChange([normalizedDate, null])
      return
    }

    // Complete range
    if (normalizedDate < start) {
      // If selected date is before start, clamp to start
      onUpdate([start, start])
      onChange([start, start])
    } else {
      onUpdate([start, normalizedDate])
      onChange([start, normalizedDate])
    }
  }

  const clearDate = (event: Event) => {
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

  const setToday = () => {
    selectDate(new Date())
  }

  const isSelected = (date: Date): boolean => {
    if (!range.value) {
      return (
        selectedDate.value !== null &&
        date.getFullYear() === selectedDate.value.getFullYear() &&
        date.getMonth() === selectedDate.value.getMonth() &&
        date.getDate() === selectedDate.value.getDate()
      )
    }
    const [start, end] = selectedRange.value
    if (start && isSameDay(date, start)) return true
    if (end && isSameDay(date, end)) return true
    return false
  }

  const isInSelectedRange = (date: Date): boolean => {
    if (!range.value) return false
    const [start, end] = selectedRange.value
    if (!start || !end) return false
    return date > start && date < end
  }

  const isRangeStart = (date: Date): boolean => {
    if (!range.value) return false
    const [start] = selectedRange.value
    return start !== null && isSameDay(date, start)
  }

  const isRangeEnd = (date: Date): boolean => {
    if (!range.value) return false
    const [, end] = selectedRange.value
    return end !== null && isSameDay(date, end)
  }

  return {
    selectedDate,
    selectedRange,
    displayValue,
    hasValue,
    selectDate,
    clearDate,
    setToday,
    isSelected,
    isInSelectedRange,
    isRangeStart,
    isRangeEnd
  }
}

// Helper function
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
