import { defineComponent, computed, ref, nextTick, h, PropType, watch, onBeforeUnmount } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
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
  type DatePickerSize,
  type DateFormat,
  type DatePickerModelValue,
  type DatePickerLabels
} from '@tigercat/core'

// Helper function to create SVG icon
const createIcon = (path: string, className: string) => {
  return h(
    'svg',
    {
      class: className,
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: icon20ViewBox,
      fill: 'currentColor'
    },
    [
      h('path', {
        'fill-rule': 'evenodd',
        d: path,
        'clip-rule': 'evenodd'
      })
    ]
  )
}

// Icons
const CalendarIcon = createIcon(CalendarIconPath, 'w-5 h-5')
const CloseIcon = createIcon(CloseIconPath, 'w-4 h-4')
const ChevronLeftIcon = createIcon(ChevronLeftIconPath, 'w-5 h-5')
const ChevronRightIcon = createIcon(ChevronRightIconPath, 'w-5 h-5')

export type VueDatePickerModelValue = DatePickerModelValue

export interface VueDatePickerProps {
  range?: boolean
  locale?: string
  labels?: Partial<DatePickerLabels>
  modelValue?: VueDatePickerModelValue
  size?: DatePickerSize
  format?: DateFormat
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  minDate?: Date | string | null
  maxDate?: Date | string | null
  clearable?: boolean
  name?: string
  id?: string
  className?: string
  style?: Record<string, unknown>
}

const isDateLike = (value: unknown): boolean =>
  value === null || value instanceof Date || typeof value === 'string'

const isModelValue = (value: unknown): boolean => {
  if (isDateLike(value)) return true
  if (Array.isArray(value) && value.length === 2) {
    return isDateLike(value[0]) && isDateLike(value[1])
  }
  return false
}

export const DatePicker = defineComponent({
  name: 'TigerDatePicker',
  inheritAttrs: false,
  props: {
    /**
     * Enable range selection (start/end).
     * When true, v-model uses a tuple: [start, end].
     * @default false
     */
    range: {
      type: Boolean,
      default: false
    },
    /**
     * Locale used for month/day names in the calendar UI.
     * Example: 'zh-CN', 'en-US'
     */
    locale: {
      type: String
    },
    /**
     * UI labels for i18n.
     */
    labels: {
      type: Object as PropType<Partial<DatePickerLabels>>,
      default: undefined
    },
    /**
     * Selected date value (for v-model)
     */
    modelValue: {
      type: [Date, String, Array, null] as PropType<
        Date | string | null | [Date | string | null, Date | string | null]
      >,
      default: null
    },
    /**
     * Date picker size
     * @default 'md'
     */
    size: {
      type: String as PropType<DatePickerSize>,
      default: 'md' as DatePickerSize
    },
    /**
     * Date format string
     * @default 'yyyy-MM-dd'
     */
    format: {
      type: String as PropType<DateFormat>,
      default: 'yyyy-MM-dd' as DateFormat
    },
    /**
     * Placeholder text
     */
    placeholder: {
      type: String,
      default: undefined
    },
    /**
     * Whether the date picker is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the date picker is readonly
     * @default false
     */
    readonly: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the date picker is required
     * @default false
     */
    required: {
      type: Boolean,
      default: false
    },
    /**
     * Minimum selectable date
     */
    minDate: {
      type: [Date, String, null] as PropType<Date | string | null>,
      default: null
    },
    /**
     * Maximum selectable date
     */
    maxDate: {
      type: [Date, String, null] as PropType<Date | string | null>,
      default: null
    },
    /**
     * Show clear button
     * @default true
     */
    clearable: {
      type: Boolean,
      default: true
    },
    /**
     * Input name attribute
     */
    name: {
      type: String
    },
    /**
     * Input id attribute
     */
    id: {
      type: String
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: ''
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: {
    /**
     * Emitted when date changes (for v-model)
     */
    'update:modelValue': (value: unknown) => {
      return isModelValue(value)
    },
    /**
     * Emitted when date changes
     */
    change: (value: unknown) => {
      return isModelValue(value)
    },
    /**
     * Emitted when clear button is clicked
     */
    clear: () => true
  },
  setup(props, { emit, attrs }) {
    const isOpen = ref(false)
    const calendarRef = ref<HTMLElement | null>(null)
    const inputWrapperRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)

    const activeDateIso = ref<string | null>(null)
    const pendingFocusIso = ref<string | null>(null)
    const restoreFocusEl = ref<HTMLElement | null>(null)

    const isRangeMode = computed(() => props.range)

    const selectedDate = computed(() => {
      if (isRangeMode.value) return null
      return parseDate(props.modelValue as Date | string | null)
    })

    const selectedRange = computed<[Date | null, Date | null]>(() => {
      if (!isRangeMode.value) return [null, null]
      const raw = props.modelValue as [Date | string | null, Date | string | null] | null
      if (!raw || !Array.isArray(raw)) return [null, null]
      return [parseDate(raw[0]), parseDate(raw[1])]
    })
    const minDateParsed = computed(() => parseDate(props.minDate))
    const maxDateParsed = computed(() => parseDate(props.maxDate))

    // Current viewing month/year in calendar
    const viewingMonth = ref(
      (selectedDate.value ?? selectedRange.value[0])?.getMonth() ?? new Date().getMonth()
    )
    const viewingYear = ref(
      (selectedDate.value ?? selectedRange.value[0])?.getFullYear() ?? new Date().getFullYear()
    )

    const displayValue = computed(() => {
      if (!isRangeMode.value) {
        return selectedDate.value ? formatDate(selectedDate.value, props.format) : ''
      }

      const [start, end] = selectedRange.value
      const startText = start ? formatDate(start, props.format) : ''
      const endText = end ? formatDate(end, props.format) : ''

      if (!startText && !endText) return ''
      if (startText && endText) return `${startText} - ${endText}`
      return startText ? `${startText} - ` : ` - ${endText}`
    })

    const placeholderText = computed(
      () => props.placeholder ?? (props.range ? 'Select date range' : 'Select date')
    )

    const showClearButton = computed(() => {
      if (!props.clearable || props.disabled || props.readonly) return false
      if (!isRangeMode.value) return selectedDate.value !== null
      const [start, end] = selectedRange.value
      return start !== null || end !== null
    })

    const calendarDays = computed(() => {
      return getCalendarDays(viewingYear.value, viewingMonth.value)
    })

    const dayNames = computed(() => getShortDayNames(props.locale))

    const labels = computed(() => getDatePickerLabels(props.locale, props.labels))

    const addDays = (date: Date, days: number): Date => {
      const next = new Date(date)
      next.setDate(next.getDate() + days)
      return next
    }

    const focusDateButtonByIso = (iso: string): boolean => {
      const button = calendarRef.value?.querySelector(
        `button[data-date="${iso}"]`
      ) as HTMLButtonElement | null

      if (!button || button.disabled) return false
      button.focus()
      activeDateIso.value = iso
      return true
    }

    const getFirstEnabledIsoInView = (): string | null => {
      for (const date of calendarDays.value) {
        if (!date) continue
        const iso = formatDate(date, 'yyyy-MM-dd')
        if (!isDateDisabled(date)) return iso
      }
      return null
    }

    const getPreferredFocusIso = (): string | null => {
      const focusDate = isRangeMode.value
        ? (selectedRange.value[0] ?? selectedRange.value[1])
        : selectedDate.value

      if (focusDate) return formatDate(focusDate, 'yyyy-MM-dd')

      const today = normalizeDate(new Date())
      if (isDateInRange(today, minDateParsed.value, maxDateParsed.value)) {
        return formatDate(today, 'yyyy-MM-dd')
      }

      return getFirstEnabledIsoInView()
    }

    const restoreFocus = () => {
      const target = restoreFocusEl.value ?? inputRef.value
      if (!target) return
      if (typeof (target as HTMLElement).focus === 'function') {
        ;(target as HTMLElement).focus()
      }
    }

    const moveFocus = async (deltaDays: number) => {
      const activeEl = document.activeElement as HTMLElement | null
      const currentIso = activeEl?.getAttribute('data-date') ?? activeDateIso.value ?? null

      const baseIso = currentIso ?? getPreferredFocusIso()
      if (!baseIso) return

      const baseDate = parseDate(baseIso)
      if (!baseDate) return

      let candidate = addDays(baseDate, deltaDays)
      for (let attempts = 0; attempts < 42; attempts++) {
        const iso = formatDate(candidate, 'yyyy-MM-dd')
        const el = calendarRef.value?.querySelector(
          `button[data-date="${iso}"]`
        ) as HTMLButtonElement | null

        if (el && !el.disabled) {
          el.focus()
          activeDateIso.value = iso
          return
        }

        if (!el) {
          pendingFocusIso.value = iso
          viewingYear.value = candidate.getFullYear()
          viewingMonth.value = candidate.getMonth()
          activeDateIso.value = iso
          await nextTick()
          if (pendingFocusIso.value) {
            const nextIso = pendingFocusIso.value
            pendingFocusIso.value = null
            if (focusDateButtonByIso(nextIso)) return
          }
          const fallback = getFirstEnabledIsoInView()
          if (fallback) focusDateButtonByIso(fallback)
          return
        }

        candidate = addDays(candidate, deltaDays)
      }
    }

    const handleCalendarKeyDown = async (event: KeyboardEvent) => {
      if (!isOpen.value) return

      switch (event.key) {
        case 'Escape': {
          event.preventDefault()
          closeCalendar()
          return
        }
        case 'ArrowRight': {
          event.preventDefault()
          await moveFocus(1)
          return
        }
        case 'ArrowLeft': {
          event.preventDefault()
          await moveFocus(-1)
          return
        }
        case 'ArrowDown': {
          event.preventDefault()
          await moveFocus(7)
          return
        }
        case 'ArrowUp': {
          event.preventDefault()
          await moveFocus(-7)
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

    function toggleCalendar() {
      if (!props.disabled && !props.readonly) {
        isOpen.value = !isOpen.value
        if (isOpen.value) {
          restoreFocusEl.value =
            restoreFocusEl.value ??
            (document.activeElement as HTMLElement) ??
            inputRef.value ??
            null
          // Reset viewing month to selected date or current month
          const baseDate = selectedDate.value ?? selectedRange.value[0]
          if (baseDate) {
            viewingMonth.value = baseDate.getMonth()
            viewingYear.value = baseDate.getFullYear()
          }
        }
      }
    }

    function closeCalendar() {
      isOpen.value = false
    }

    function setToday() {
      selectDate(new Date())
    }

    function selectDate(date: Date | null) {
      if (!date) return

      const normalizedDate = normalizeDate(date)

      // Check if date is disabled
      if (!isDateInRange(normalizedDate, minDateParsed.value, maxDateParsed.value)) {
        return
      }

      if (!isRangeMode.value) {
        emit('update:modelValue', normalizedDate)
        emit('change', normalizedDate)
        closeCalendar()
        return
      }

      const [start, end] = selectedRange.value

      if (!start || (start && end)) {
        emit('update:modelValue', [normalizedDate, null])
        emit('change', [normalizedDate, null])
        return
      }

      if (normalizedDate < start) {
        // Range rule (same as TimePicker): end cannot be earlier than start
        emit('update:modelValue', [start, start])
        emit('change', [start, start])
      } else {
        emit('update:modelValue', [start, normalizedDate])
        emit('change', [start, normalizedDate])
      }
    }

    function clearDate(event: Event) {
      event.stopPropagation()

      if (!isRangeMode.value) {
        emit('update:modelValue', null)
        emit('change', null)
      } else {
        emit('update:modelValue', [null, null])
        emit('change', [null, null])
      }

      emit('clear')
    }

    function previousMonth() {
      if (viewingMonth.value === 0) {
        viewingMonth.value = 11
        viewingYear.value--
      } else {
        viewingMonth.value--
      }
    }

    function nextMonth() {
      if (viewingMonth.value === 11) {
        viewingMonth.value = 0
        viewingYear.value++
      } else {
        viewingMonth.value++
      }
    }

    function isDateDisabled(date: Date | null): boolean {
      if (!date) return true
      return !isDateInRange(date, minDateParsed.value, maxDateParsed.value)
    }

    function isCurrentMonth(date: Date | null): boolean {
      if (!date) return false
      return date.getMonth() === viewingMonth.value
    }

    function handleClickOutside(event: Event) {
      if (
        calendarRef.value &&
        inputWrapperRef.value &&
        !calendarRef.value.contains(event.target as Node) &&
        !inputWrapperRef.value.contains(event.target as Node)
      ) {
        closeCalendar()
      }
    }

    function handleInputClick() {
      inputRef.value?.focus()
      toggleCalendar()
    }

    watch(isOpen, (newValue) => {
      if (newValue) {
        document.addEventListener('click', handleClickOutside)

        restoreFocusEl.value =
          restoreFocusEl.value ?? (document.activeElement as HTMLElement) ?? inputRef.value ?? null
        const preferred = pendingFocusIso.value ?? getPreferredFocusIso()
        pendingFocusIso.value = null

        nextTick().then(() => {
          if (preferred && focusDateButtonByIso(preferred)) return
          const fallback = getFirstEnabledIsoInView()
          if (fallback) focusDateButtonByIso(fallback)
        })
      } else {
        document.removeEventListener('click', handleClickOutside)
        nextTick().then(() => {
          restoreFocus()
        })
      }
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    const rootClass = computed(() =>
      classNames(datePickerBaseClasses, props.className, coerceClassValue(attrs.class))
    )

    const rootStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const forwardedAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = (attrs as Record<string, unknown>) ?? {}
      return rest
    })

    return () => {
      const inputClasses = getDatePickerInputClasses(props.size, props.disabled || props.readonly)
      const iconButtonClasses = getDatePickerIconButtonClasses(props.size)

      return h(
        'div',
        {
          ...forwardedAttrs.value,
          class: rootClass.value,
          style: rootStyle.value
        },
        [
          // Input wrapper
          h(
            'div',
            {
              ref: inputWrapperRef,
              class: datePickerInputWrapperClasses
            },
            [
              // Input field for date display
              h('input', {
                ref: inputRef,
                type: 'text',
                class: inputClasses,
                value: displayValue.value,
                placeholder: placeholderText.value,
                disabled: props.disabled,
                readonly: true, // Always readonly to prevent manual text input and ensure date selection via calendar only
                required: props.required,
                name: props.name,
                id: props.id,
                onClick: handleInputClick,
                'aria-label': placeholderText.value
              }),
              // Clear button
              showClearButton.value &&
                h(
                  'button',
                  {
                    type: 'button',
                    class: datePickerClearButtonClasses,
                    onClick: clearDate,
                    'aria-label': labels.value.clearDate
                  },
                  CloseIcon
                ),
              // Calendar icon button
              h(
                'button',
                {
                  type: 'button',
                  class: iconButtonClasses,
                  disabled: props.disabled || props.readonly,
                  onClick: toggleCalendar,
                  'aria-label': labels.value.toggleCalendar
                },
                CalendarIcon
              )
            ]
          ),
          // Calendar dropdown
          isOpen.value &&
            h(
              'div',
              {
                ref: calendarRef,
                class: datePickerCalendarClasses,
                role: 'dialog',
                'aria-modal': 'true',
                'aria-label': labels.value.calendar,
                onKeydown: handleCalendarKeyDown
              },
              [
                // Calendar header
                h('div', { class: datePickerCalendarHeaderClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: datePickerNavButtonClasses,
                      onClick: previousMonth,
                      'aria-label': labels.value.previousMonth
                    },
                    ChevronLeftIcon
                  ),
                  h(
                    'div',
                    { class: datePickerMonthYearClasses },
                    formatMonthYear(viewingYear.value, viewingMonth.value, props.locale)
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: datePickerNavButtonClasses,
                      onClick: nextMonth,
                      'aria-label': labels.value.nextMonth
                    },
                    ChevronRightIcon
                  )
                ]),
                // Day names header
                h('div', { class: datePickerCalendarGridClasses, role: 'row' }, [
                  ...dayNames.value.map((day) =>
                    h(
                      'div',
                      {
                        class: datePickerDayNameClasses,
                        key: day,
                        role: 'columnheader'
                      },
                      day
                    )
                  )
                ]),
                // Calendar grid
                h(
                  'div',
                  {
                    class: datePickerCalendarGridClasses,
                    role: 'grid',
                    'aria-rowcount': 6,
                    'aria-colcount': 7
                  },
                  [
                    ...calendarDays.value.map((date, index) => {
                      if (!date) return null

                      const [rangeStart, rangeEnd] = selectedRange.value

                      const isRangeStart =
                        isRangeMode.value && rangeStart ? isSameDay(date, rangeStart) : false
                      const isRangeEnd =
                        isRangeMode.value && rangeEnd ? isSameDay(date, rangeEnd) : false
                      const isInRange =
                        isRangeMode.value &&
                        rangeStart &&
                        rangeEnd &&
                        normalizeDate(date) >= normalizeDate(rangeStart) &&
                        normalizeDate(date) <= normalizeDate(rangeEnd)

                      const isSelected = !isRangeMode.value
                        ? selectedDate.value
                          ? isSameDay(date, selectedDate.value)
                          : false
                        : isRangeStart || isRangeEnd
                      const isCurrentMonthDay = isCurrentMonth(date)
                      const isTodayDay = isTodayUtil(date)

                      const isSelectingRangeEnd =
                        isRangeMode.value && Boolean(rangeStart) && !rangeEnd
                      const isBeforeRangeStart =
                        isSelectingRangeEnd &&
                        rangeStart &&
                        normalizeDate(date) < normalizeDate(rangeStart)

                      const isDisabled = isDateDisabled(date) || Boolean(isBeforeRangeStart)

                      const iso = formatDate(date, 'yyyy-MM-dd')

                      return h(
                        'button',
                        {
                          key: index,
                          type: 'button',
                          class: getDatePickerDayCellClasses(
                            isCurrentMonthDay,
                            isSelected,
                            isTodayDay,
                            isDisabled,
                            Boolean(isInRange),
                            Boolean(isRangeStart),
                            Boolean(isRangeEnd)
                          ),
                          disabled: isDisabled,
                          onClick: () => selectDate(date),
                          role: 'gridcell',
                          'data-date': iso,
                          onFocus: () => {
                            activeDateIso.value = iso
                          },
                          tabindex: activeDateIso.value === iso && !isDisabled ? 0 : -1,
                          'aria-label': iso,
                          'aria-selected': isSelected,
                          'aria-current': isTodayDay ? 'date' : undefined
                        },
                        date.getDate()
                      )
                    })
                  ]
                ),

                // Footer (range mode only)
                isRangeMode.value
                  ? h('div', { class: datePickerFooterClasses }, [
                      h(
                        'button',
                        {
                          type: 'button',
                          class: datePickerFooterButtonClasses,
                          onClick: setToday
                        },
                        labels.value.today
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          class: datePickerFooterButtonClasses,
                          onClick: closeCalendar
                        },
                        labels.value.ok
                      )
                    ])
                  : null
              ]
            )
        ]
      )
    }
  }
})

export default DatePicker
