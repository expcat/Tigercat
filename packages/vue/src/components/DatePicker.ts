import {
  defineComponent,
  computed,
  ref,
  h,
  PropType,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import {
  parseDate,
  formatDate,
  formatMonthYear,
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
  datePickerFooterClasses,
  datePickerFooterButtonClasses,
  CalendarIconPath,
  CloseIconPath,
  ChevronLeftIconPath,
  ChevronRightIconPath,
  type DatePickerSize,
  type DateFormat,
} from '@tigercat/core';

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
  );
};

// Icons
const CalendarIcon = createIcon(CalendarIconPath, 'w-5 h-5');
const CloseIcon = createIcon(CloseIconPath, 'w-4 h-4');
const ChevronLeftIcon = createIcon(ChevronLeftIconPath, 'w-5 h-5');
const ChevronRightIcon = createIcon(ChevronRightIconPath, 'w-5 h-5');

export type VueDatePickerModelValue =
  | Date
  | string
  | null
  | [Date | string | null, Date | string | null];

export interface VueDatePickerProps {
  range?: boolean;
  locale?: string;
  modelValue?: VueDatePickerModelValue;
  size?: DatePickerSize;
  format?: DateFormat;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  minDate?: Date | string | null;
  maxDate?: Date | string | null;
  clearable?: boolean;
  name?: string;
  id?: string;
}

export const DatePicker = defineComponent({
  name: 'TigerDatePicker',
  props: {
    /**
     * Enable range selection (start/end).
     * When true, v-model uses a tuple: [start, end].
     * @default false
     */
    range: {
      type: Boolean,
      default: false,
    },
    /**
     * Locale used for month/day names in the calendar UI.
     * Example: 'zh-CN', 'en-US'
     */
    locale: {
      type: String,
    },
    /**
     * Selected date value (for v-model)
     */
    modelValue: {
      type: [Date, String, Array, null] as PropType<
        Date | string | null | [Date | string | null, Date | string | null]
      >,
      default: null,
    },
    /**
     * Date picker size
     * @default 'md'
     */
    size: {
      type: String as PropType<DatePickerSize>,
      default: 'md' as DatePickerSize,
    },
    /**
     * Date format string
     * @default 'yyyy-MM-dd'
     */
    format: {
      type: String as PropType<DateFormat>,
      default: 'yyyy-MM-dd' as DateFormat,
    },
    /**
     * Placeholder text
     * @default 'Select date'
     */
    placeholder: {
      type: String,
      default: 'Select date',
    },
    /**
     * Whether the date picker is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the date picker is readonly
     * @default false
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the date picker is required
     * @default false
     */
    required: {
      type: Boolean,
      default: false,
    },
    /**
     * Minimum selectable date
     */
    minDate: {
      type: [Date, String, null] as PropType<Date | string | null>,
      default: null,
    },
    /**
     * Maximum selectable date
     */
    maxDate: {
      type: [Date, String, null] as PropType<Date | string | null>,
      default: null,
    },
    /**
     * Show clear button
     * @default true
     */
    clearable: {
      type: Boolean,
      default: true,
    },
    /**
     * Input name attribute
     */
    name: {
      type: String,
    },
    /**
     * Input id attribute
     */
    id: {
      type: String,
    },
  },
  emits: {
    /**
     * Emitted when date changes (for v-model)
     */
    'update:modelValue': (value: unknown) => {
      if (value === null) return true;
      if (value instanceof Date) return true;
      if (Array.isArray(value) && value.length === 2) {
        const [start, end] = value;
        const validStart = start === null || start instanceof Date;
        const validEnd = end === null || end instanceof Date;
        return validStart && validEnd;
      }
      return false;
    },
    /**
     * Emitted when date changes
     */
    change: (value: unknown) => {
      if (value === null) return true;
      if (value instanceof Date) return true;
      if (Array.isArray(value) && value.length === 2) {
        const [start, end] = value;
        const validStart = start === null || start instanceof Date;
        const validEnd = end === null || end instanceof Date;
        return validStart && validEnd;
      }
      return false;
    },
    /**
     * Emitted when clear button is clicked
     */
    clear: () => true,
  },
  setup(props, { emit }) {
    const isOpen = ref(false);
    const calendarRef = ref<HTMLElement | null>(null);
    const inputWrapperRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);

    const isRangeMode = computed(() => props.range);

    const selectedDate = computed(() => {
      if (isRangeMode.value) return null;
      return parseDate(props.modelValue as Date | string | null);
    });

    const selectedRange = computed<[Date | null, Date | null]>(() => {
      if (!isRangeMode.value) return [null, null];
      const raw = props.modelValue as
        | [Date | string | null, Date | string | null]
        | null;
      if (!raw || !Array.isArray(raw)) return [null, null];
      return [parseDate(raw[0]), parseDate(raw[1])];
    });
    const minDateParsed = computed(() => parseDate(props.minDate));
    const maxDateParsed = computed(() => parseDate(props.maxDate));

    // Current viewing month/year in calendar
    const viewingMonth = ref(
      (selectedDate.value ?? selectedRange.value[0])?.getMonth() ??
        new Date().getMonth()
    );
    const viewingYear = ref(
      (selectedDate.value ?? selectedRange.value[0])?.getFullYear() ??
        new Date().getFullYear()
    );

    const displayValue = computed(() => {
      if (!isRangeMode.value) {
        return selectedDate.value
          ? formatDate(selectedDate.value, props.format)
          : '';
      }

      const [start, end] = selectedRange.value;
      const startText = start ? formatDate(start, props.format) : '';
      const endText = end ? formatDate(end, props.format) : '';

      if (!startText && !endText) return '';
      if (startText && endText) return `${startText} - ${endText}`;
      return startText ? `${startText} - ` : ` - ${endText}`;
    });

    const showClearButton = computed(() => {
      if (!props.clearable || props.disabled || props.readonly) return false;
      if (!isRangeMode.value) return selectedDate.value !== null;
      const [start, end] = selectedRange.value;
      return start !== null || end !== null;
    });

    const calendarDays = computed(() => {
      return getCalendarDays(viewingYear.value, viewingMonth.value);
    });

    const monthNames = computed(() => getMonthNames(props.locale));
    const dayNames = computed(() => getShortDayNames(props.locale));

    const labels = computed(() => {
      const lc = (props.locale ?? '').toLowerCase();
      if (lc.startsWith('zh')) {
        return {
          today: '今天',
          ok: '确定',
        };
      }
      return {
        today: 'Today',
        ok: 'OK',
      };
    });

    function toggleCalendar() {
      if (!props.disabled && !props.readonly) {
        isOpen.value = !isOpen.value;
        if (isOpen.value) {
          // Reset viewing month to selected date or current month
          const baseDate = selectedDate.value ?? selectedRange.value[0];
          if (baseDate) {
            viewingMonth.value = baseDate.getMonth();
            viewingYear.value = baseDate.getFullYear();
          }
        }
      }
    }

    function closeCalendar() {
      isOpen.value = false;
    }

    function setToday() {
      selectDate(new Date());
    }

    function selectDate(date: Date | null) {
      if (!date) return;

      const normalizedDate = normalizeDate(date);

      // Check if date is disabled
      if (
        !isDateInRange(normalizedDate, minDateParsed.value, maxDateParsed.value)
      ) {
        return;
      }

      if (!isRangeMode.value) {
        emit('update:modelValue', normalizedDate);
        emit('change', normalizedDate);
        closeCalendar();
        return;
      }

      const [start, end] = selectedRange.value;

      if (!start || (start && end)) {
        emit('update:modelValue', [normalizedDate, null]);
        emit('change', [normalizedDate, null]);
        return;
      }

      if (normalizedDate < start) {
        // Range rule (same as TimePicker): end cannot be earlier than start
        emit('update:modelValue', [start, start]);
        emit('change', [start, start]);
      } else {
        emit('update:modelValue', [start, normalizedDate]);
        emit('change', [start, normalizedDate]);
      }
    }

    function clearDate(event: Event) {
      event.stopPropagation();

      if (!isRangeMode.value) {
        emit('update:modelValue', null);
        emit('change', null);
      } else {
        emit('update:modelValue', [null, null]);
        emit('change', [null, null]);
      }

      emit('clear');
    }

    function previousMonth() {
      if (viewingMonth.value === 0) {
        viewingMonth.value = 11;
        viewingYear.value--;
      } else {
        viewingMonth.value--;
      }
    }

    function nextMonth() {
      if (viewingMonth.value === 11) {
        viewingMonth.value = 0;
        viewingYear.value++;
      } else {
        viewingMonth.value++;
      }
    }

    function isDateDisabled(date: Date | null): boolean {
      if (!date) return true;
      return !isDateInRange(date, minDateParsed.value, maxDateParsed.value);
    }

    function isCurrentMonth(date: Date | null): boolean {
      if (!date) return false;
      return date.getMonth() === viewingMonth.value;
    }

    function handleClickOutside(event: Event) {
      if (
        calendarRef.value &&
        inputWrapperRef.value &&
        !calendarRef.value.contains(event.target as Node) &&
        !inputWrapperRef.value.contains(event.target as Node)
      ) {
        closeCalendar();
      }
    }

    function handleInputClick() {
      toggleCalendar();
    }

    watch(isOpen, (newValue) => {
      if (newValue) {
        document.addEventListener('click', handleClickOutside);
      } else {
        document.removeEventListener('click', handleClickOutside);
      }
    });

    onMounted(() => {
      if (isOpen.value) {
        document.addEventListener('click', handleClickOutside);
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return () => {
      const inputClasses = getDatePickerInputClasses(
        props.size,
        props.disabled || props.readonly
      );
      const iconButtonClasses = getDatePickerIconButtonClasses(props.size);

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
                  formatMonthYear(
                    viewingYear.value,
                    viewingMonth.value,
                    props.locale
                  )
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
                ...dayNames.value.map((day) =>
                  h('div', { class: datePickerDayNameClasses, key: day }, day)
                ),
              ]),
              // Calendar grid
              h('div', { class: datePickerCalendarGridClasses }, [
                ...calendarDays.value.map((date, index) => {
                  if (!date) return null;

                  const [rangeStart, rangeEnd] = selectedRange.value;

                  const isRangeStart =
                    isRangeMode.value && rangeStart
                      ? isSameDay(date, rangeStart)
                      : false;
                  const isRangeEnd =
                    isRangeMode.value && rangeEnd
                      ? isSameDay(date, rangeEnd)
                      : false;
                  const isInRange =
                    isRangeMode.value &&
                    rangeStart &&
                    rangeEnd &&
                    normalizeDate(date) >= normalizeDate(rangeStart) &&
                    normalizeDate(date) <= normalizeDate(rangeEnd);

                  const isSelected = !isRangeMode.value
                    ? selectedDate.value
                      ? isSameDay(date, selectedDate.value)
                      : false
                    : isRangeStart || isRangeEnd;
                  const isCurrentMonthDay = isCurrentMonth(date);
                  const isTodayDay = isTodayUtil(date);

                  const isSelectingRangeEnd =
                    isRangeMode.value && Boolean(rangeStart) && !rangeEnd;
                  const isBeforeRangeStart =
                    isSelectingRangeEnd &&
                    rangeStart &&
                    normalizeDate(date) < normalizeDate(rangeStart);

                  const isDisabled =
                    isDateDisabled(date) || Boolean(isBeforeRangeStart);

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
                      'aria-label': formatDate(date, 'yyyy-MM-dd'),
                      'aria-selected': isSelected,
                    },
                    date.getDate()
                  );
                }),
              ]),

              // Footer (range mode only)
              isRangeMode.value
                ? h('div', { class: datePickerFooterClasses }, [
                    h(
                      'button',
                      {
                        type: 'button',
                        class: datePickerFooterButtonClasses,
                        onClick: setToday,
                      },
                      labels.value.today
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        class: datePickerFooterButtonClasses,
                        onClick: closeCalendar,
                      },
                      labels.value.ok
                    ),
                  ])
                : null,
            ]
          ),
      ]);
    };
  },
});

export default DatePicker;
