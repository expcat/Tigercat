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
  parseTime,
  formatTime,
  formatTimeDisplayWithLocale,
  getTimePeriodLabels,
  to12HourFormat,
  to24HourFormat,
  isTimeInRange,
  generateHours,
  generateMinutes,
  generateSeconds,
  getCurrentTime,
  timePickerBaseClasses,
  timePickerInputWrapperClasses,
  getTimePickerInputClasses,
  getTimePickerIconButtonClasses,
  timePickerClearButtonClasses,
  timePickerPanelClasses,
  timePickerPanelContentClasses,
  timePickerRangeHeaderClasses,
  getTimePickerRangeTabButtonClasses,
  timePickerColumnClasses,
  timePickerColumnHeaderClasses,
  timePickerColumnListClasses,
  getTimePickerItemClasses,
  getTimePickerPeriodButtonClasses,
  timePickerFooterClasses,
  timePickerFooterButtonClasses,
  ClockIconPath,
  TimePickerCloseIconPath,
  type TimePickerSize,
  type TimeFormat,
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
const ClockIcon = createIcon(ClockIconPath, 'w-5 h-5');
const CloseIcon = createIcon(TimePickerCloseIconPath, 'w-4 h-4');

export type VueTimePickerModelValue =
  | string
  | null
  | [string | null, string | null];

export interface VueTimePickerProps {
  modelValue?: VueTimePickerModelValue;
  locale?: string;
  range?: boolean;
  size?: TimePickerSize;
  format?: TimeFormat;
  showSeconds?: boolean;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  minTime?: string | null;
  maxTime?: string | null;
  clearable?: boolean;
  name?: string;
  id?: string;
}

export const TimePicker = defineComponent({
  name: 'TigerTimePicker',
  props: {
    /**
     * Selected time value (for v-model)
     */
    modelValue: {
      type: [String, Array, null] as PropType<
        string | null | [string | null, string | null]
      >,
      default: null,
    },

    /**
     * Locale used for UI labels and display formatting.
     */
    locale: {
      type: String,
      default: undefined,
    },

    /**
     * Enable range selection (start/end).
     */
    range: {
      type: Boolean,
      default: false,
    },
    /**
     * Time picker size
     * @default 'md'
     */
    size: {
      type: String as PropType<TimePickerSize>,
      default: 'md' as TimePickerSize,
    },
    /**
     * Time format (12-hour or 24-hour)
     * @default '24'
     */
    format: {
      type: String as PropType<TimeFormat>,
      default: '24' as TimeFormat,
    },
    /**
     * Show seconds selector
     * @default false
     */
    showSeconds: {
      type: Boolean,
      default: false,
    },
    /**
     * Step size for hours
     * @default 1
     */
    hourStep: {
      type: Number,
      default: 1,
    },
    /**
     * Step size for minutes
     * @default 1
     */
    minuteStep: {
      type: Number,
      default: 1,
    },
    /**
     * Step size for seconds
     * @default 1
     */
    secondStep: {
      type: Number,
      default: 1,
    },
    /**
     * Placeholder text
     * @default 'Select time'
     */
    placeholder: {
      type: String,
      default: 'Select time',
    },
    /**
     * Whether the time picker is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the time picker is readonly
     * @default false
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the time picker is required
     * @default false
     */
    required: {
      type: Boolean,
      default: false,
    },
    /**
     * Minimum selectable time
     */
    minTime: {
      type: [String, null] as PropType<string | null>,
      default: null,
    },
    /**
     * Maximum selectable time
     */
    maxTime: {
      type: [String, null] as PropType<string | null>,
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
     * Emitted when time changes (for v-model)
     */
    'update:modelValue': (
      value: string | null | [string | null, string | null]
    ) =>
      value === null ||
      typeof value === 'string' ||
      (Array.isArray(value) && value.length === 2),
    /**
     * Emitted when time changes
     */
    change: (value: string | null | [string | null, string | null]) =>
      value === null ||
      typeof value === 'string' ||
      (Array.isArray(value) && value.length === 2),
    /**
     * Emitted when clear button is clicked
     */
    clear: () => true,
  },
  setup(props, { emit }) {
    const isOpen = ref(false);
    const panelRef = ref<HTMLElement | null>(null);
    const inputWrapperRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);

    const isRangeMode = computed(() => props.range === true);
    const activePart = ref<'start' | 'end'>('start');

    const normalizeRangeValue = (
      value: unknown
    ): [string | null, string | null] => {
      if (Array.isArray(value)) return [value[0] ?? null, value[1] ?? null];
      return [null, null];
    };

    const currentRangeValue = computed<[string | null, string | null]>(() => {
      if (!isRangeMode.value) return [null, null];
      return normalizeRangeValue(props.modelValue);
    });

    const currentSingleValue = computed<string | null>(() => {
      if (isRangeMode.value) return null;
      return typeof props.modelValue === 'string' || props.modelValue === null
        ? props.modelValue
        : null;
    });

    const activeValue = computed<string | null>(() => {
      if (!isRangeMode.value) return currentSingleValue.value;
      return currentRangeValue.value[activePart.value === 'start' ? 0 : 1];
    });

    const parsedTime = computed(() => parseTime(activeValue.value));

    // Internal state for time selection
    const selectedHours = ref<number>(parsedTime.value?.hours ?? 0);
    const selectedMinutes = ref<number>(parsedTime.value?.minutes ?? 0);
    const selectedSeconds = ref<number>(parsedTime.value?.seconds ?? 0);
    const selectedPeriod = ref<'AM' | 'PM'>('AM');

    // Update internal state when modelValue changes
    watch(
      () => props.modelValue,
      (newValue) => {
        const parsed = parseTime(activeValue.value);
        if (parsed) {
          selectedHours.value = parsed.hours;
          selectedMinutes.value = parsed.minutes;
          selectedSeconds.value = parsed.seconds;

          if (props.format === '12') {
            const { period } = to12HourFormat(parsed.hours);
            selectedPeriod.value = period;
          }
        }
      }
    );

    watch(
      () => activePart.value,
      () => {
        const parsed = parseTime(activeValue.value);
        if (parsed) {
          selectedHours.value = parsed.hours;
          selectedMinutes.value = parsed.minutes;
          selectedSeconds.value = parsed.seconds;

          if (props.format === '12') {
            const { period } = to12HourFormat(parsed.hours);
            selectedPeriod.value = period;
          }
        }
      }
    );

    const isZh = computed(() =>
      (props.locale ?? '').toLowerCase().startsWith('zh')
    );
    const labels = computed(() =>
      isZh.value
        ? {
            hour: '时',
            minute: '分',
            second: '秒',
            now: '现在',
            ok: '确定',
            start: '开始',
            end: '结束',
            clear: '清除时间',
            toggle: '打开时间选择器',
            dialog: '时间选择器',
          }
        : {
            hour: 'Hour',
            minute: 'Min',
            second: 'Sec',
            now: 'Now',
            ok: 'OK',
            start: 'Start',
            end: 'End',
            clear: 'Clear time',
            toggle: 'Toggle time picker',
            dialog: 'Time picker',
          }
    );

    const periodLabels = computed(() => getTimePeriodLabels(props.locale));

    const displayValue = computed(() => {
      if (!isRangeMode.value) {
        if (!parsedTime.value) return '';
        return formatTimeDisplayWithLocale(
          parsedTime.value.hours,
          parsedTime.value.minutes,
          parsedTime.value.seconds,
          props.format,
          props.showSeconds,
          props.locale
        );
      }

      const toDisplay = (timeStr: string | null): string => {
        const parsed = parseTime(timeStr);
        if (!parsed) return '';
        return formatTimeDisplayWithLocale(
          parsed.hours,
          parsed.minutes,
          parsed.seconds,
          props.format,
          props.showSeconds,
          props.locale
        );
      };

      const start = toDisplay(currentRangeValue.value[0]);
      const end = toDisplay(currentRangeValue.value[1]);
      if (!start && !end) return '';
      return `${start} - ${end}`;
    });

    const showClearButton = computed(() => {
      if (!props.clearable || props.disabled || props.readonly) return false;
      if (!isRangeMode.value) return currentSingleValue.value !== null;
      return (
        currentRangeValue.value[0] !== null ||
        currentRangeValue.value[1] !== null
      );
    });

    const hoursList = computed(() =>
      generateHours(props.hourStep, props.format)
    );
    const minutesList = computed(() => generateMinutes(props.minuteStep));
    const secondsList = computed(() => generateSeconds(props.secondStep));

    function togglePanel() {
      if (!props.disabled && !props.readonly) {
        isOpen.value = !isOpen.value;
        if (isOpen.value && parsedTime.value) {
          selectedHours.value = parsedTime.value.hours;
          selectedMinutes.value = parsedTime.value.minutes;
          selectedSeconds.value = parsedTime.value.seconds;

          if (props.format === '12') {
            const { period } = to12HourFormat(parsedTime.value.hours);
            selectedPeriod.value = period;
          }
        }
      }
    }

    function closePanel() {
      isOpen.value = false;
    }

    function selectHour(hour: number) {
      if (props.format === '12') {
        selectedHours.value = to24HourFormat(hour, selectedPeriod.value);
      } else {
        selectedHours.value = hour;
      }
      updateTime();
    }

    function selectMinute(minute: number) {
      selectedMinutes.value = minute;
      updateTime();
    }

    function selectSecond(second: number) {
      selectedSeconds.value = second;
      updateTime();
    }

    function selectPeriod(period: 'AM' | 'PM') {
      selectedPeriod.value = period;
      // Convert current hour to 12-hour format, then back to 24-hour with new period
      const { hours: hours12 } = to12HourFormat(selectedHours.value);
      selectedHours.value = to24HourFormat(hours12, period);
      updateTime();
    }

    function updateTime() {
      if (
        !isTimeInRange(
          selectedHours.value,
          selectedMinutes.value,
          props.minTime,
          props.maxTime
        )
      ) {
        return;
      }

      let timeString = formatTime(
        selectedHours.value,
        selectedMinutes.value,
        selectedSeconds.value,
        props.showSeconds
      );

      if (!isRangeMode.value) {
        emit('update:modelValue', timeString);
        emit('change', timeString);
        return;
      }

      const nextRange: [string | null, string | null] = [
        ...currentRangeValue.value,
      ];
      const index = activePart.value === 'start' ? 0 : 1;

      const parsedStart = parseTime(currentRangeValue.value[0]);
      const parsedEnd = parseTime(currentRangeValue.value[1]);
      const candidateSeconds =
        selectedHours.value * 3600 +
        selectedMinutes.value * 60 +
        selectedSeconds.value;
      const startSeconds = parsedStart
        ? parsedStart.hours * 3600 +
          parsedStart.minutes * 60 +
          parsedStart.seconds
        : null;
      const endSeconds = parsedEnd
        ? parsedEnd.hours * 3600 + parsedEnd.minutes * 60 + parsedEnd.seconds
        : null;

      // Keep range ordered: end should never be earlier than start.
      // If user selects an out-of-order time, clamp the opposite side to match.
      if (activePart.value === 'end' && parsedStart && startSeconds !== null) {
        if (candidateSeconds < startSeconds) {
          timeString = formatTime(
            parsedStart.hours,
            parsedStart.minutes,
            parsedStart.seconds,
            props.showSeconds
          );
          selectedHours.value = parsedStart.hours;
          selectedMinutes.value = parsedStart.minutes;
          selectedSeconds.value = parsedStart.seconds;

          if (props.format === '12') {
            const { period } = to12HourFormat(parsedStart.hours);
            selectedPeriod.value = period;
          }
        }
      }

      nextRange[index] = timeString;

      if (
        activePart.value === 'start' &&
        endSeconds !== null &&
        candidateSeconds > endSeconds
      ) {
        nextRange[1] = timeString;
      }
      emit('update:modelValue', nextRange);
      emit('change', nextRange);

      if (activePart.value === 'start' && nextRange[1] === null) {
        activePart.value = 'end';
      }
    }

    function clearTime(event: Event) {
      event.stopPropagation();

      if (!isRangeMode.value) {
        emit('update:modelValue', null);
        emit('change', null);
        emit('clear');
        return;
      }

      const cleared: [string | null, string | null] = [null, null];
      emit('update:modelValue', cleared);
      emit('change', cleared);
      emit('clear');
    }

    function setNow() {
      const now = getCurrentTime(props.showSeconds);
      const parsed = parseTime(now);
      if (parsed) {
        selectedHours.value = parsed.hours;
        selectedMinutes.value = parsed.minutes;
        selectedSeconds.value = parsed.seconds;

        if (props.format === '12') {
          const { period } = to12HourFormat(parsed.hours);
          selectedPeriod.value = period;
        }

        updateTime();
      }
    }

    function isHourDisabled(hour: number): boolean {
      const hours24 =
        props.format === '12'
          ? to24HourFormat(hour, selectedPeriod.value)
          : hour;
      return !isTimeInRange(
        hours24,
        selectedMinutes.value,
        props.minTime,
        props.maxTime
      );
    }

    function isMinuteDisabled(minute: number): boolean {
      return !isTimeInRange(
        selectedHours.value,
        minute,
        props.minTime,
        props.maxTime
      );
    }

    function handleClickOutside(event: Event) {
      if (
        panelRef.value &&
        inputWrapperRef.value &&
        !panelRef.value.contains(event.target as Node) &&
        !inputWrapperRef.value.contains(event.target as Node)
      ) {
        closePanel();
      }
    }

    function handleInputClick() {
      togglePanel();
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
      const inputClasses = getTimePickerInputClasses(
        props.size,
        props.disabled || props.readonly
      );
      const iconButtonClasses = getTimePickerIconButtonClasses(props.size);

      return h('div', { class: timePickerBaseClasses }, [
        // Input wrapper
        h(
          'div',
          {
            ref: inputWrapperRef,
            class: timePickerInputWrapperClasses,
          },
          [
            // Input field for time display
            h('input', {
              ref: inputRef,
              type: 'text',
              class: inputClasses,
              value: displayValue.value,
              placeholder: props.placeholder,
              disabled: props.disabled,
              readonly: true,
              required: props.required,
              name: props.name,
              id: props.id,
              onClick: handleInputClick,
              'aria-label':
                props.placeholder ||
                (isZh.value ? '请选择时间' : 'Select time'),
            }),
            // Clear button
            showClearButton.value &&
              h(
                'button',
                {
                  type: 'button',
                  class: timePickerClearButtonClasses,
                  onClick: clearTime,
                  'aria-label': labels.value.clear,
                },
                CloseIcon
              ),
            // Clock icon button
            h(
              'button',
              {
                type: 'button',
                class: iconButtonClasses,
                disabled: props.disabled || props.readonly,
                onClick: togglePanel,
                'aria-label': labels.value.toggle,
              },
              ClockIcon
            ),
          ]
        ),
        // Time picker panel
        isOpen.value &&
          h(
            'div',
            {
              ref: panelRef,
              class: timePickerPanelClasses,
              role: 'dialog',
              'aria-label': labels.value.dialog,
            },
            [
              // Range header
              isRangeMode.value &&
                h('div', { class: timePickerRangeHeaderClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: getTimePickerRangeTabButtonClasses(
                        activePart.value === 'start'
                      ),
                      onClick: () => (activePart.value = 'start'),
                      'aria-label': labels.value.start,
                      'aria-selected': activePart.value === 'start',
                    },
                    labels.value.start
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: getTimePickerRangeTabButtonClasses(
                        activePart.value === 'end'
                      ),
                      onClick: () => (activePart.value = 'end'),
                      'aria-label': labels.value.end,
                      'aria-selected': activePart.value === 'end',
                    },
                    labels.value.end
                  ),
                ]),

              // Columns container
              h('div', { class: timePickerPanelContentClasses }, [
                // Hours column
                h('div', { class: timePickerColumnClasses }, [
                  h(
                    'div',
                    { class: timePickerColumnHeaderClasses },
                    labels.value.hour
                  ),
                  h(
                    'div',
                    { class: timePickerColumnListClasses },
                    hoursList.value.map((hour) => {
                      const displayHour = props.format === '12' ? hour : hour;
                      const hours24 =
                        props.format === '12'
                          ? to24HourFormat(hour, selectedPeriod.value)
                          : hour;
                      const isSelected = selectedHours.value === hours24;
                      const isDisabled = isHourDisabled(hour);

                      return h(
                        'button',
                        {
                          key: hour,
                          type: 'button',
                          class: getTimePickerItemClasses(
                            isSelected,
                            isDisabled
                          ),
                          disabled: isDisabled,
                          onClick: () => selectHour(hour),
                          'aria-label': isZh.value
                            ? `${displayHour}${labels.value.hour}`
                            : `${displayHour} hours`,
                          'aria-selected': isSelected,
                        },
                        displayHour.toString().padStart(2, '0')
                      );
                    })
                  ),
                ]),
                // Minutes column
                h('div', { class: timePickerColumnClasses }, [
                  h(
                    'div',
                    { class: timePickerColumnHeaderClasses },
                    labels.value.minute
                  ),
                  h(
                    'div',
                    { class: timePickerColumnListClasses },
                    minutesList.value.map((minute) => {
                      const isSelected = selectedMinutes.value === minute;
                      const isDisabled = isMinuteDisabled(minute);

                      return h(
                        'button',
                        {
                          key: minute,
                          type: 'button',
                          class: getTimePickerItemClasses(
                            isSelected,
                            isDisabled
                          ),
                          disabled: isDisabled,
                          onClick: () => selectMinute(minute),
                          'aria-label': isZh.value
                            ? `${minute}${labels.value.minute}`
                            : `${minute} minutes`,
                          'aria-selected': isSelected,
                        },
                        minute.toString().padStart(2, '0')
                      );
                    })
                  ),
                ]),
                // Seconds column (if enabled)
                props.showSeconds &&
                  h('div', { class: timePickerColumnClasses }, [
                    h(
                      'div',
                      { class: timePickerColumnHeaderClasses },
                      labels.value.second
                    ),
                    h(
                      'div',
                      { class: timePickerColumnListClasses },
                      secondsList.value.map((second) => {
                        const isSelected = selectedSeconds.value === second;

                        return h(
                          'button',
                          {
                            key: second,
                            type: 'button',
                            class: getTimePickerItemClasses(isSelected, false),
                            onClick: () => selectSecond(second),
                            'aria-label': isZh.value
                              ? `${second}${labels.value.second}`
                              : `${second} seconds`,
                            'aria-selected': isSelected,
                          },
                          second.toString().padStart(2, '0')
                        );
                      })
                    ),
                  ]),
                // AM/PM column (if 12-hour format)
                props.format === '12' &&
                  h('div', { class: timePickerColumnClasses }, [
                    h('div', { class: timePickerColumnHeaderClasses }, ' '),
                    h('div', { class: 'flex flex-col' }, [
                      h(
                        'button',
                        {
                          type: 'button',
                          class: getTimePickerPeriodButtonClasses(
                            selectedPeriod.value === 'AM'
                          ),
                          onClick: () => selectPeriod('AM'),
                          'aria-label': periodLabels.value.am,
                          'aria-selected': selectedPeriod.value === 'AM',
                        },
                        periodLabels.value.am
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          class: getTimePickerPeriodButtonClasses(
                            selectedPeriod.value === 'PM'
                          ),
                          onClick: () => selectPeriod('PM'),
                          'aria-label': periodLabels.value.pm,
                          'aria-selected': selectedPeriod.value === 'PM',
                        },
                        periodLabels.value.pm
                      ),
                    ]),
                  ]),
              ]),
              // Footer
              h('div', { class: timePickerFooterClasses }, [
                h(
                  'button',
                  {
                    type: 'button',
                    class: timePickerFooterButtonClasses,
                    onClick: setNow,
                  },
                  labels.value.now
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    class: timePickerFooterButtonClasses,
                    onClick: closePanel,
                  },
                  labels.value.ok
                ),
              ]),
            ]
          ),
      ]);
    };
  },
});

export default TimePicker;
