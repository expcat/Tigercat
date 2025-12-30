import { defineComponent, computed, ref, h, PropType, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  parseTime,
  formatTime,
  formatTimeDisplay,
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
const ClockIcon = createIcon(ClockIconPath, 'w-5 h-5')
const CloseIcon = createIcon(TimePickerCloseIconPath, 'w-4 h-4')

export const TimePicker = defineComponent({
  name: 'TigerTimePicker',
  props: {
    /**
     * Selected time value (for v-model)
     */
    modelValue: {
      type: [String, null] as PropType<string | null>,
      default: null,
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
    'update:modelValue': (value: string | null) => 
      value === null || typeof value === 'string',
    /**
     * Emitted when time changes
     */
    change: (value: string | null) => 
      value === null || typeof value === 'string',
    /**
     * Emitted when clear button is clicked
     */
    clear: () => true,
  },
  setup(props, { emit }) {
    const isOpen = ref(false)
    const panelRef = ref<HTMLElement | null>(null)
    const inputWrapperRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)

    const parsedTime = computed(() => parseTime(props.modelValue))
    
    // Internal state for time selection
    const selectedHours = ref<number>(parsedTime.value?.hours ?? 0)
    const selectedMinutes = ref<number>(parsedTime.value?.minutes ?? 0)
    const selectedSeconds = ref<number>(parsedTime.value?.seconds ?? 0)
    const selectedPeriod = ref<'AM' | 'PM'>('AM')

    // Update internal state when modelValue changes
    watch(
      () => props.modelValue,
      (newValue) => {
        const parsed = parseTime(newValue)
        if (parsed) {
          selectedHours.value = parsed.hours
          selectedMinutes.value = parsed.minutes
          selectedSeconds.value = parsed.seconds
          
          if (props.format === '12') {
            const { period } = to12HourFormat(parsed.hours)
            selectedPeriod.value = period
          }
        }
      }
    )

    const displayValue = computed(() => {
      if (!parsedTime.value) return ''
      return formatTimeDisplay(
        parsedTime.value.hours,
        parsedTime.value.minutes,
        parsedTime.value.seconds,
        props.format,
        props.showSeconds
      )
    })

    const showClearButton = computed(() => {
      return props.clearable && !props.disabled && !props.readonly && props.modelValue !== null
    })

    const hoursList = computed(() => generateHours(props.hourStep, props.format))
    const minutesList = computed(() => generateMinutes(props.minuteStep))
    const secondsList = computed(() => generateSeconds(props.secondStep))

    function togglePanel() {
      if (!props.disabled && !props.readonly) {
        isOpen.value = !isOpen.value
        if (isOpen.value && parsedTime.value) {
          selectedHours.value = parsedTime.value.hours
          selectedMinutes.value = parsedTime.value.minutes
          selectedSeconds.value = parsedTime.value.seconds
          
          if (props.format === '12') {
            const { period } = to12HourFormat(parsedTime.value.hours)
            selectedPeriod.value = period
          }
        }
      }
    }

    function closePanel() {
      isOpen.value = false
    }

    function selectHour(hour: number) {
      if (props.format === '12') {
        selectedHours.value = to24HourFormat(hour, selectedPeriod.value)
      } else {
        selectedHours.value = hour
      }
      updateTime()
    }

    function selectMinute(minute: number) {
      selectedMinutes.value = minute
      updateTime()
    }

    function selectSecond(second: number) {
      selectedSeconds.value = second
      updateTime()
    }

    function selectPeriod(period: 'AM' | 'PM') {
      selectedPeriod.value = period
      // Convert current hour to 12-hour format, then back to 24-hour with new period
      const { hours: hours12 } = to12HourFormat(selectedHours.value)
      selectedHours.value = to24HourFormat(hours12, period)
      updateTime()
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
        return
      }

      const timeString = formatTime(
        selectedHours.value,
        selectedMinutes.value,
        selectedSeconds.value,
        props.showSeconds
      )
      emit('update:modelValue', timeString)
      emit('change', timeString)
    }

    function clearTime(event: Event) {
      event.stopPropagation()
      emit('update:modelValue', null)
      emit('change', null)
      emit('clear')
    }

    function setNow() {
      const now = getCurrentTime(props.showSeconds)
      const parsed = parseTime(now)
      if (parsed) {
        selectedHours.value = parsed.hours
        selectedMinutes.value = parsed.minutes
        selectedSeconds.value = parsed.seconds
        
        if (props.format === '12') {
          const { period } = to12HourFormat(parsed.hours)
          selectedPeriod.value = period
        }
        
        updateTime()
      }
      closePanel()
    }

    function isHourDisabled(hour: number): boolean {
      const hours24 = props.format === '12' ? to24HourFormat(hour, selectedPeriod.value) : hour
      return !isTimeInRange(hours24, selectedMinutes.value, props.minTime, props.maxTime)
    }

    function isMinuteDisabled(minute: number): boolean {
      return !isTimeInRange(selectedHours.value, minute, props.minTime, props.maxTime)
    }

    function handleClickOutside(event: Event) {
      if (
        panelRef.value &&
        inputWrapperRef.value &&
        !panelRef.value.contains(event.target as Node) &&
        !inputWrapperRef.value.contains(event.target as Node)
      ) {
        closePanel()
      }
    }

    function handleInputClick() {
      togglePanel()
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
      const inputClasses = getTimePickerInputClasses(props.size, props.disabled || props.readonly)
      const iconButtonClasses = getTimePickerIconButtonClasses(props.size)

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
              'aria-label': props.placeholder || 'Select time',
            }),
            // Clear button
            showClearButton.value &&
              h(
                'button',
                {
                  type: 'button',
                  class: timePickerClearButtonClasses,
                  onClick: clearTime,
                  'aria-label': 'Clear time',
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
                'aria-label': 'Toggle time picker',
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
              'aria-label': 'Time picker',
            },
            [
              // Columns container
              h('div', { class: timePickerPanelContentClasses }, [
                // Hours column
                h('div', { class: timePickerColumnClasses }, [
                  h('div', { class: timePickerColumnHeaderClasses }, 'Hour'),
                  h(
                    'div',
                    { class: timePickerColumnListClasses },
                    hoursList.value.map((hour) => {
                      const displayHour = props.format === '12' ? hour : hour
                      const hours24 =
                        props.format === '12'
                          ? to24HourFormat(hour, selectedPeriod.value)
                          : hour
                      const isSelected = selectedHours.value === hours24
                      const isDisabled = isHourDisabled(hour)

                      return h(
                        'button',
                        {
                          key: hour,
                          type: 'button',
                          class: getTimePickerItemClasses(isSelected, isDisabled),
                          disabled: isDisabled,
                          onClick: () => selectHour(hour),
                          'aria-label': `${displayHour} hours`,
                          'aria-selected': isSelected,
                        },
                        displayHour.toString().padStart(2, '0')
                      )
                    })
                  ),
                ]),
                // Minutes column
                h('div', { class: timePickerColumnClasses }, [
                  h('div', { class: timePickerColumnHeaderClasses }, 'Min'),
                  h(
                    'div',
                    { class: timePickerColumnListClasses },
                    minutesList.value.map((minute) => {
                      const isSelected = selectedMinutes.value === minute
                      const isDisabled = isMinuteDisabled(minute)

                      return h(
                        'button',
                        {
                          key: minute,
                          type: 'button',
                          class: getTimePickerItemClasses(isSelected, isDisabled),
                          disabled: isDisabled,
                          onClick: () => selectMinute(minute),
                          'aria-label': `${minute} minutes`,
                          'aria-selected': isSelected,
                        },
                        minute.toString().padStart(2, '0')
                      )
                    })
                  ),
                ]),
                // Seconds column (if enabled)
                props.showSeconds &&
                  h('div', { class: timePickerColumnClasses }, [
                    h('div', { class: timePickerColumnHeaderClasses }, 'Sec'),
                    h(
                      'div',
                      { class: timePickerColumnListClasses },
                      secondsList.value.map((second) => {
                        const isSelected = selectedSeconds.value === second

                        return h(
                          'button',
                          {
                            key: second,
                            type: 'button',
                            class: getTimePickerItemClasses(isSelected, false),
                            onClick: () => selectSecond(second),
                            'aria-label': `${second} seconds`,
                            'aria-selected': isSelected,
                          },
                          second.toString().padStart(2, '0')
                        )
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
                          class: getTimePickerPeriodButtonClasses(selectedPeriod.value === 'AM'),
                          onClick: () => selectPeriod('AM'),
                          'aria-label': 'AM',
                          'aria-selected': selectedPeriod.value === 'AM',
                        },
                        'AM'
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          class: getTimePickerPeriodButtonClasses(selectedPeriod.value === 'PM'),
                          onClick: () => selectPeriod('PM'),
                          'aria-label': 'PM',
                          'aria-selected': selectedPeriod.value === 'PM',
                        },
                        'PM'
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
                  'Now'
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    class: timePickerFooterButtonClasses,
                    onClick: closePanel,
                  },
                  'OK'
                ),
              ]),
            ]
          ),
      ])
    }
  },
})

export default TimePicker
