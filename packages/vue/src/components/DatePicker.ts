import { defineComponent, computed, ref, nextTick, h, PropType, watch, onBeforeUnmount } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  parseDate,
  formatDate,
  formatMonthYear,
  addDays,
  addMonths,
  isDateInRange,
  getCalendarDays,
  getShortDayNames,
  getDatePickerCalendarCellState,
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
  calendarSolidIcon20PathD,
  closeSolidIcon20PathD,
  chevronLeftSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  getDatePickerLocaleCode,
  getDatePickerLabels,
  getLocaleDirection,
  mergeTigerLocale,
  type ComponentSize,
  type DateFormat,
  type DatePickerModelValue,
  type DatePickerLocaleInput,
  type DatePickerLocalePreset,
  type DatePickerLabels,
  type TigerLocale,
  type DatePickerShortcut
} from '@expcat/tigercat-core'

import { createFilledIcon } from '../utils/icon-helpers'
import { useTigerConfig } from './ConfigProvider'

// Icons
const CalendarIcon = createFilledIcon(calendarSolidIcon20PathD, 'w-5 h-5')
const CloseIcon = createFilledIcon(closeSolidIcon20PathD, 'w-4 h-4')
const ChevronLeftIcon = createFilledIcon(chevronLeftSolidIcon20PathD, 'w-5 h-5')
const ChevronRightIcon = createFilledIcon(chevronRightSolidIcon20PathD, 'w-5 h-5')

function normalizeDatePickerLocale(
  locale?: DatePickerLocaleInput
): Partial<TigerLocale> | undefined {
  if (!locale) return undefined
  if (typeof locale === 'string') return { locale }
  if ('datePicker' in locale) return locale as Partial<TigerLocale>
  const preset = locale as Partial<DatePickerLocalePreset>
  return {
    locale: hasDatePickerLocaleCode(preset) ? preset.locale : undefined,
    datePicker: preset
  }
}

function hasDatePickerLocaleCode(
  locale: Partial<DatePickerLocalePreset>
): locale is Partial<DatePickerLocalePreset> & { locale: string } {
  return typeof locale.locale === 'string'
}

export type VueDatePickerModelValue = DatePickerModelValue
type DatePickerRangeInputValue = [Date | string | null, Date | string | null]

export interface VueDatePickerProps {
  range?: boolean
  locale?: DatePickerLocaleInput
  labels?: Partial<DatePickerLabels>
  modelValue?: VueDatePickerModelValue
  size?: ComponentSize
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
  shortcuts?: DatePickerShortcut[]
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
      type: [String, Object] as PropType<DatePickerLocaleInput>
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
      type: String as PropType<ComponentSize>,
      default: 'md' as ComponentSize
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
    },
    /**
     * Shortcut presets for quick date selection
     */
    shortcuts: {
      type: Array as PropType<DatePickerShortcut[]>,
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
     * Convenience event emitted alongside `update:modelValue` on every value
     * change. This is an intentional, non-v-model event (the idiomatic Vue
     * pattern); it always carries the same normalized value as
     * `update:modelValue`. Prefer `v-model` for two-way binding and use
     * `@change` only for side effects.
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
    const config = useTigerConfig()
    const isOpen = ref(false)
    const calendarRef = ref<HTMLElement | null>(null)
    const mobileCalendarRef = ref<HTMLElement | null>(null)
    const inputWrapperRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)

    const activeDateIso = ref<string | null>(null)
    const activeRangePart = ref<'start' | 'end'>('start')
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
    const mergedLocale = computed(() =>
      mergeTigerLocale(config.value.locale, normalizeDatePickerLocale(props.locale))
    )
    const localeCode = computed(() => getDatePickerLocaleCode(mergedLocale.value))

    // Current viewing month/year in calendar
    const viewingMonth = ref(
      (selectedDate.value ?? selectedRange.value[0])?.getMonth() ?? new Date().getMonth()
    )
    const viewingYear = ref(
      (selectedDate.value ?? selectedRange.value[0])?.getFullYear() ?? new Date().getFullYear()
    )

    const displayValue = computed(() => {
      if (!isRangeMode.value) {
        return selectedDate.value
          ? formatDate(selectedDate.value, props.format, localeCode.value)
          : ''
      }

      const [start, end] = selectedRange.value
      const startText = start ? formatDate(start, props.format, localeCode.value) : ''
      const endText = end ? formatDate(end, props.format, localeCode.value) : ''

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

    const dayNames = computed(() => getShortDayNames(localeCode.value))
    const isRtl = computed(() => getLocaleDirection(localeCode.value) === 'rtl')
    const previousMonthIcon = computed(() => (isRtl.value ? ChevronRightIcon : ChevronLeftIcon))
    const nextMonthIcon = computed(() => (isRtl.value ? ChevronLeftIcon : ChevronRightIcon))

    const labels = computed(() => getDatePickerLabels(mergedLocale.value, props.labels))

    const mobileDate = computed(() => {
      if (!isRangeMode.value) return selectedDate.value ?? normalizeDate(new Date())
      const [start, end] = selectedRange.value
      return (
        (activeRangePart.value === 'start' ? start : end) ??
        start ??
        end ??
        normalizeDate(new Date())
      )
    })

    const mobileYears = computed(() => {
      const baseYear = mobileDate.value.getFullYear()
      return Array.from({ length: 101 }, (_, index) => baseYear - 50 + index)
    })

    const mobileDays = computed(() => {
      const date = mobileDate.value
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
      return Array.from({ length: daysInMonth }, (_, index) => index + 1)
    })

    /** Emit both update:modelValue and change in one call */
    const emitValue = (value: DatePickerModelValue | null) => {
      emit('update:modelValue', value)
      emit('change', value)
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
          restoreFocusEl.value = inputRef.value ?? null
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

    function handleShortcut(shortcut: DatePickerShortcut) {
      const val = typeof shortcut.value === 'function' ? shortcut.value() : shortcut.value

      // Normalize shortcut values the same way React does (parse strings, zero
      // the time component) so v-model receives canonical `Date` instances.
      if (!isRangeMode.value) {
        const date =
          val instanceof Date
            ? normalizeDate(val)
            : val
              ? normalizeDate(parseDate(val as string)!)
              : null
        emitValue(date)
      } else {
        const range = val as DatePickerRangeInputValue | null
        if (range && Array.isArray(range)) {
          emitValue([
            range[0]
              ? normalizeDate(range[0] instanceof Date ? range[0] : parseDate(range[0])!)
              : null,
            range[1]
              ? normalizeDate(range[1] instanceof Date ? range[1] : parseDate(range[1])!)
              : null
          ])
        }
      }

      closeCalendar()
    }

    function selectDate(date: Date | null) {
      if (!date) return

      const normalizedDate = normalizeDate(date)

      // Check if date is disabled
      if (!isDateInRange(normalizedDate, minDateParsed.value, maxDateParsed.value)) {
        return
      }

      if (!isRangeMode.value) {
        emitValue(normalizedDate)
        closeCalendar()
        return
      }

      const [start, end] = selectedRange.value

      if (!start || (start && end)) {
        emitValue([normalizedDate, null])
        return
      }

      // Range rule: end cannot be earlier than start
      emitValue([start, normalizedDate < start ? start : normalizedDate])
    }

    function commitMobileDate(date: Date) {
      const normalized = normalizeDate(date)
      if (!isDateInRange(normalized, minDateParsed.value, maxDateParsed.value)) return

      viewingYear.value = normalized.getFullYear()
      viewingMonth.value = normalized.getMonth()

      if (!isRangeMode.value) {
        emitValue(normalized)
        return
      }

      const [start, end] = selectedRange.value
      if (activeRangePart.value === 'start') {
        emitValue([normalized, end && end < normalized ? normalized : end])
        activeRangePart.value = 'end'
        return
      }

      emitValue([start ?? normalized, start && normalized < start ? start : normalized])
    }

    function updateMobileDate(part: 'year' | 'month' | 'day', value: number) {
      const base = mobileDate.value
      const nextYear = part === 'year' ? value : base.getFullYear()
      const nextMonth = part === 'month' ? value : base.getMonth()
      const maxDay = new Date(nextYear, nextMonth + 1, 0).getDate()
      const nextDay = Math.min(part === 'day' ? value : base.getDate(), maxDay)
      commitMobileDate(new Date(nextYear, nextMonth, nextDay))
    }

    function clearDate(event: Event) {
      event.stopPropagation()
      emitValue(!isRangeMode.value ? null : [null, null])
      emit('clear')
    }

    function stepViewingMonth(delta: number) {
      const next = addMonths(new Date(viewingYear.value, viewingMonth.value, 1), delta)
      viewingYear.value = next.getFullYear()
      viewingMonth.value = next.getMonth()
    }

    function previousMonth() {
      stepViewingMonth(-1)
    }

    function nextMonth() {
      stepViewingMonth(1)
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
        inputWrapperRef.value &&
        !calendarRef.value?.contains(event.target as Node) &&
        !mobileCalendarRef.value?.contains(event.target as Node) &&
        !inputWrapperRef.value.contains(event.target as Node)
      ) {
        closeCalendar()
      }
    }

    function handleInputClick() {
      toggleCalendar()
    }

    watch(isOpen, (newValue) => {
      if (newValue) {
        document.addEventListener('click', handleClickOutside)

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
                ref: mobileCalendarRef,
                class: datePickerMobileWheelClasses,
                role: 'group',
                'aria-label': labels.value.calendar
              },
              [
                isRangeMode.value
                  ? h('div', { class: 'mb-3 flex items-center gap-2' }, [
                      h(
                        'button',
                        {
                          type: 'button',
                          class: datePickerFooterButtonClasses,
                          'aria-selected': activeRangePart.value === 'start',
                          onClick: () => (activeRangePart.value = 'start')
                        },
                        'Start'
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          class: datePickerFooterButtonClasses,
                          'aria-selected': activeRangePart.value === 'end',
                          onClick: () => (activeRangePart.value = 'end')
                        },
                        'End'
                      )
                    ])
                  : null,
                h('div', { class: datePickerMobileWheelGridClasses }, [
                  h(
                    'select',
                    {
                      class: datePickerMobileWheelSelectClasses,
                      value: mobileDate.value.getFullYear(),
                      'aria-label': 'Year',
                      onChange: (event: Event) =>
                        updateMobileDate('year', Number((event.target as HTMLSelectElement).value))
                    },
                    mobileYears.value.map((year) => h('option', { value: year }, year))
                  ),
                  h(
                    'select',
                    {
                      class: datePickerMobileWheelSelectClasses,
                      value: mobileDate.value.getMonth(),
                      'aria-label': 'Month',
                      onChange: (event: Event) =>
                        updateMobileDate('month', Number((event.target as HTMLSelectElement).value))
                    },
                    Array.from({ length: 12 }, (_, month) =>
                      h('option', { value: month }, month + 1)
                    )
                  ),
                  h(
                    'select',
                    {
                      class: datePickerMobileWheelSelectClasses,
                      value: mobileDate.value.getDate(),
                      'aria-label': 'Day',
                      onChange: (event: Event) =>
                        updateMobileDate('day', Number((event.target as HTMLSelectElement).value))
                    },
                    mobileDays.value.map((day) => h('option', { value: day }, day))
                  )
                ]),
                h('div', { class: 'mt-4 flex justify-end gap-2' }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: datePickerFooterButtonClasses,
                      'aria-label': `Mobile ${labels.value.ok}`,
                      onClick: closeCalendar
                    },
                    labels.value.ok
                  )
                ])
              ]
            ),
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
                    previousMonthIcon.value
                  ),
                  h(
                    'div',
                    { class: datePickerMonthYearClasses },
                    formatMonthYear(viewingYear.value, viewingMonth.value, localeCode.value)
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: datePickerNavButtonClasses,
                      onClick: nextMonth,
                      'aria-label': labels.value.nextMonth
                    },
                    nextMonthIcon.value
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
                (() => {
                  return h(
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

                        const cell = getDatePickerCalendarCellState({
                          date,
                          selectedDate: selectedDate.value,
                          selectedRange: selectedRange.value,
                          isRangeMode: isRangeMode.value,
                          isCurrentMonth,
                          isDateDisabled
                        })

                        return h(
                          'button',
                          {
                            key: index,
                            type: 'button',
                            class: getDatePickerDayCellClasses(
                              cell.isCurrentMonthDay,
                              cell.isSelected,
                              cell.isTodayDay,
                              cell.isDisabled,
                              cell.isInRange,
                              cell.isRangeStart,
                              cell.isRangeEnd
                            ),
                            disabled: cell.isDisabled,
                            onClick: () => selectDate(date),
                            role: 'gridcell',
                            'data-date': cell.iso,
                            onFocus: () => {
                              activeDateIso.value = cell.iso
                            },
                            tabindex: activeDateIso.value === cell.iso && !cell.isDisabled ? 0 : -1,
                            'aria-label': cell.iso,
                            'aria-selected': cell.isSelected,
                            'aria-current': cell.isTodayDay ? 'date' : undefined
                          },
                          date.getDate()
                        )
                      })
                    ]
                  )
                })(),

                // Shortcuts panel
                props.shortcuts?.length
                  ? h(
                      'div',
                      {
                        class:
                          'flex flex-wrap gap-1 px-3 py-2 border-t border-[var(--tiger-border,#e5e7eb)]'
                      },
                      props.shortcuts.map((sc) =>
                        h(
                          'button',
                          {
                            type: 'button',
                            class: datePickerFooterButtonClasses,
                            onClick: () => handleShortcut(sc)
                          },
                          sc.label
                        )
                      )
                    )
                  : null,

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
