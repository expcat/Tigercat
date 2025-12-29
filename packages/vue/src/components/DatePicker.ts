import { defineComponent, computed, ref, h, PropType, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
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
  type DatePickerSize,
  type DateFormat,
} from '@tigercat/core'

// Helper function to create SVG icon
const createIcon = (path: string, className: string) => {
  return h(
    'svg',
    {
      class: className,
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 20 20',
      fill: 'currentColor',
    },
    [
      h('path', {
        'fill-rule': 'evenodd',
        d: path,
        'clip-rule': 'evenodd',
      }),
    ]
  )
}

// Icons
const CalendarIcon = createIcon(CalendarIconPath, 'w-5 h-5')
const CloseIcon = createIcon(CloseIconPath, 'w-4 h-4')
const ChevronLeftIcon = createIcon(ChevronLeftIconPath, 'w-5 h-5')
const ChevronRightIcon = createIcon(ChevronRightIconPath, 'w-5 h-5')

export const DatePicker = defineComponent({
  name: 'TigerDatePicker',
  props: {
    modelValue: {
      type: [Date, String, null] as PropType<Date | string | null>,
      default: null,
    },
    size: {
      type: String as PropType<DatePickerSize>,
      default: 'md',
    },
    format: {
      type: String as PropType<DateFormat>,
      default: 'yyyy-MM-dd',
    },
    placeholder: {
      type: String,
      default: 'Select date',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    minDate: {
      type: [Date, String, null] as PropType<Date | string | null>,
      default: null,
    },
    maxDate: {
      type: [Date, String, null] as PropType<Date | string | null>,
      default: null,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      default: undefined,
    },
    id: {
      type: String,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'change', 'clear'],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const calendarRef = ref<HTMLElement | null>(null)
    const inputWrapperRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)

    const selectedDate = computed(() => parseDate(props.modelValue))
    const minDateParsed = computed(() => parseDate(props.minDate))
    const maxDateParsed = computed(() => parseDate(props.maxDate))

    // Current viewing month/year in calendar
    const viewingMonth = ref(selectedDate.value?.getMonth() ?? new Date().getMonth())
    const viewingYear = ref(selectedDate.value?.getFullYear() ?? new Date().getFullYear())

    const displayValue = computed(() => {
      return selectedDate.value ? formatDate(selectedDate.value, props.format) : ''
    })

    const showClearButton = computed(() => {
      return props.clearable && !props.disabled && !props.readonly && selectedDate.value !== null
    })

    const calendarDays = computed(() => {
      return getCalendarDays(viewingYear.value, viewingMonth.value)
    })

    const monthNames = getMonthNames()
    const dayNames = getShortDayNames()

    function toggleCalendar() {
      if (!props.disabled && !props.readonly) {
        isOpen.value = !isOpen.value
        if (isOpen.value) {
          // Reset viewing month to selected date or current month
          if (selectedDate.value) {
            viewingMonth.value = selectedDate.value.getMonth()
            viewingYear.value = selectedDate.value.getFullYear()
          }
        }
      }
    }

    function closeCalendar() {
      isOpen.value = false
    }

    function selectDate(date: Date | null) {
      if (!date) return

      const normalizedDate = normalizeDate(date)

      // Check if date is disabled
      if (!isDateInRange(normalizedDate, minDateParsed.value, maxDateParsed.value)) {
        return
      }

      emit('update:modelValue', normalizedDate)
      emit('change', normalizedDate)
      closeCalendar()
    }

    function clearDate(event: Event) {
      event.stopPropagation()
      emit('update:modelValue', null)
      emit('change', null)
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
      toggleCalendar()
    }

    watch(isOpen, (newValue) => {
      if (newValue) {
        document.addEventListener('click', handleClickOutside)
      } else {
        document.removeEventListener('click', handleClickOutside)
      }
    })

    onMounted(() => {
      if (isOpen.value) {
        document.addEventListener('click', handleClickOutside)
      }
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return () => {
      const inputClasses = getDatePickerInputClasses(props.size, props.disabled || props.readonly)
      const iconButtonClasses = getDatePickerIconButtonClasses(props.size)

      return h('div', { class: datePickerBaseClasses }, [
        // Input wrapper
        h(
          'div',
          {
            ref: inputWrapperRef,
            class: datePickerInputWrapperClasses,
          },
          [
            // Input field for date display
            h('input', {
              ref: inputRef,
              type: 'text',
              class: inputClasses,
              value: displayValue.value,
              placeholder: props.placeholder,
              disabled: props.disabled,
              readonly: true, // Always readonly to prevent manual text input and ensure date selection via calendar only
              required: props.required,
              name: props.name,
              id: props.id,
              onClick: handleInputClick,
              'aria-label': props.placeholder || 'Select date',
            }),
            // Clear button
            showClearButton.value &&
              h(
                'button',
                {
                  type: 'button',
                  class: datePickerClearButtonClasses,
                  onClick: clearDate,
                  'aria-label': 'Clear date',
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
                'aria-label': 'Toggle calendar',
              },
              CalendarIcon
            ),
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
              'aria-label': 'Calendar',
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
                    'aria-label': 'Previous month',
                  },
                  ChevronLeftIcon
                ),
                h(
                  'div',
                  { class: datePickerMonthYearClasses },
                  `${monthNames[viewingMonth.value]} ${viewingYear.value}`
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    class: datePickerNavButtonClasses,
                    onClick: nextMonth,
                    'aria-label': 'Next month',
                  },
                  ChevronRightIcon
                ),
              ]),
              // Day names header
              h('div', { class: datePickerCalendarGridClasses }, [
                ...dayNames.map((day) =>
                  h('div', { class: datePickerDayNameClasses, key: day }, day)
                ),
              ]),
              // Calendar grid
              h('div', { class: datePickerCalendarGridClasses }, [
                ...calendarDays.value.map((date, index) => {
                  if (!date) return null

                  const isSelected = selectedDate.value ? isSameDay(date, selectedDate.value) : false
                  const isCurrentMonthDay = isCurrentMonth(date)
                  const isTodayDay = isTodayUtil(date)
                  const isDisabled = isDateDisabled(date)

                  return h(
                    'button',
                    {
                      key: index,
                      type: 'button',
                      class: getDatePickerDayCellClasses(
                        isCurrentMonthDay,
                        isSelected,
                        isTodayDay,
                        isDisabled
                      ),
                      disabled: isDisabled,
                      onClick: () => selectDate(date),
                      'aria-label': formatDate(date, 'yyyy-MM-dd'),
                      'aria-selected': isSelected,
                    },
                    date.getDate()
                  )
                }),
              ]),
            ]
          ),
      ])
    }
  },
})

export default DatePicker
