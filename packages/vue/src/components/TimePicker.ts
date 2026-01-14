import {
  defineComponent,
  computed,
  ref,
  h,
  nextTick,
  PropType,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  icon20ViewBox,
  parseTime,
  formatTime,
  formatTimeDisplayWithLocale,
  getTimePeriodLabels,
  getTimePickerLabels,
  getTimePickerOptionAriaLabel,
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
  type TimePickerModelValue,
  type TimePickerLabels,
  type TimePickerRangeValue,
  type TimePickerSize,
  type TimeFormat,
} from "@tigercat/core";

// Helper function to create SVG icon
const createIcon = (path: string, className: string) => {
  return h(
    "svg",
    {
      class: className,
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: icon20ViewBox,
      fill: "currentColor",
    },
    [
      h("path", {
        "fill-rule": "evenodd",
        d: path,
        "clip-rule": "evenodd",
      }),
    ]
  );
};

// Icons
const ClockIcon = createIcon(ClockIconPath, "w-5 h-5");
const CloseIcon = createIcon(TimePickerCloseIconPath, "w-4 h-4");

export type VueTimePickerModelValue = TimePickerModelValue;

export interface VueTimePickerProps {
  modelValue?: VueTimePickerModelValue;
  locale?: string;
  labels?: Partial<TimePickerLabels>;
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
  className?: string;
  style?: Record<string, string | number>;
}

export const TimePicker = defineComponent({
  name: "TigerTimePicker",
  inheritAttrs: false,
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
     * UI labels for i18n.
     * When provided, merges with locale-based defaults.
     */
    labels: {
      type: Object as PropType<Partial<TimePickerLabels>>,
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
      default: "md" as TimePickerSize,
    },
    /**
     * Time format (12-hour or 24-hour)
     * @default '24'
     */
    format: {
      type: String as PropType<TimeFormat>,
      default: "24" as TimeFormat,
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
     */
    placeholder: {
      type: String,
      default: undefined,
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

    className: {
      type: String,
      default: undefined,
    },

    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined,
    },
  },
  emits: {
    /**
     * Emitted when time changes (for v-model)
     */
    "update:modelValue": (value: TimePickerModelValue) =>
      value === null ||
      typeof value === "string" ||
      (Array.isArray(value) && value.length === 2),
    /**
     * Emitted when time changes
     */
    change: (value: TimePickerModelValue) =>
      value === null ||
      typeof value === "string" ||
      (Array.isArray(value) && value.length === 2),
    /**
     * Emitted when clear button is clicked
     */
    clear: () => true,
  },
  setup(props, { emit, attrs }) {
    const isOpen = ref(false);
    const panelRef = ref<HTMLElement | null>(null);
    const inputWrapperRef = ref<HTMLElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);

    const isRangeMode = computed(() => props.range === true);
    const activePart = ref<"start" | "end">("start");

    const normalizeRangeValue = (value: unknown): TimePickerRangeValue => {
      if (Array.isArray(value)) return [value[0] ?? null, value[1] ?? null];
      return [null, null];
    };

    const currentRangeValue = computed<TimePickerRangeValue>(() => {
      if (!isRangeMode.value) return [null, null];
      return normalizeRangeValue(props.modelValue);
    });

    const currentSingleValue = computed<string | null>(() => {
      if (isRangeMode.value) return null;
      return typeof props.modelValue === "string" || props.modelValue === null
        ? props.modelValue
        : null;
    });

    const activeValue = computed<string | null>(() => {
      if (!isRangeMode.value) return currentSingleValue.value;
      return currentRangeValue.value[activePart.value === "start" ? 0 : 1];
    });

    const parsedTime = computed(() => parseTime(activeValue.value));

    // Internal state for time selection
    const selectedHours = ref<number>(parsedTime.value?.hours ?? 0);
    const selectedMinutes = ref<number>(parsedTime.value?.minutes ?? 0);
    const selectedSeconds = ref<number>(parsedTime.value?.seconds ?? 0);
    const selectedPeriod = ref<"AM" | "PM">("AM");

    const syncSelectionFromActiveValue = () => {
      const parsed = parseTime(activeValue.value);
      if (!parsed) return;

      selectedHours.value = parsed.hours;
      selectedMinutes.value = parsed.minutes;
      selectedSeconds.value = parsed.seconds;

      if (props.format === "12") {
        const { period } = to12HourFormat(parsed.hours);
        selectedPeriod.value = period;
      }
    };

    watch(
      () => [activeValue.value, props.format] as const,
      syncSelectionFromActiveValue,
      { immediate: true }
    );

    const labels = computed(() =>
      getTimePickerLabels(props.locale, props.labels)
    );

    const computedPlaceholder = computed(
      () =>
        props.placeholder ??
        (isRangeMode.value
          ? labels.value.selectTimeRange
          : labels.value.selectTime)
    );

    const periodLabels = computed(() => getTimePeriodLabels(props.locale));

    const rootClasses = computed(() =>
      classNames(
        timePickerBaseClasses,
        props.className,
        coerceClassValue(attrs.class)
      )
    );

    const rootStyle = computed(() =>
      mergeStyleValues(attrs.style, props.style)
    );

    const displayValue = computed(() => {
      if (!isRangeMode.value) {
        if (!parsedTime.value) return "";
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
        if (!parsed) return "";
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
      if (!start && !end) return "";
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

          if (props.format === "12") {
            const { period } = to12HourFormat(parsedTime.value.hours);
            selectedPeriod.value = period;
          }
        }
      }
    }

    function closePanel() {
      isOpen.value = false;
      inputRef.value?.focus();
    }

    function focusOptionInUnit(
      unit: "hour" | "minute" | "second" | "period",
      action: "prev" | "next" | "first" | "last"
    ) {
      const panel = panelRef.value;
      if (!panel) return;

      const all = Array.from(
        panel.querySelectorAll(`button[data-tiger-timepicker-unit="${unit}"]`)
      ) as HTMLButtonElement[];

      const nodes = all.filter((button) => !button.disabled);
      if (nodes.length === 0) return;

      const active = document.activeElement as HTMLButtonElement | null;
      const activeIndex = active ? nodes.indexOf(active) : -1;
      const selectedIndex = nodes.findIndex(
        (button) => button.getAttribute("aria-selected") === "true"
      );
      const baseIndex =
        activeIndex >= 0 ? activeIndex : Math.max(0, selectedIndex);

      let nextIndex = baseIndex;
      if (action === "prev") nextIndex = Math.max(0, baseIndex - 1);
      if (action === "next")
        nextIndex = Math.min(nodes.length - 1, baseIndex + 1);
      if (action === "first") nextIndex = 0;
      if (action === "last") nextIndex = nodes.length - 1;

      nodes[nextIndex]?.focus();
    }

    function handlePanelKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
        return;
      }

      const active = document.activeElement as HTMLElement | null;
      const unit = active?.getAttribute("data-tiger-timepicker-unit") as
        | "hour"
        | "minute"
        | "second"
        | "period"
        | null;

      if (!unit) return;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusOptionInUnit(unit, "prev");
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusOptionInUnit(unit, "next");
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusOptionInUnit(unit, "first");
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        focusOptionInUnit(unit, "last");
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        const el = document.activeElement as HTMLButtonElement | null;
        if (el && el.tagName === "BUTTON" && !el.disabled) {
          event.preventDefault();
          el.click();
        }
      }
    }

    function selectHour(hour: number) {
      if (props.format === "12") {
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

    function selectPeriod(period: "AM" | "PM") {
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
        emit("update:modelValue", timeString);
        emit("change", timeString);
        return;
      }

      const nextRange: [string | null, string | null] = [
        ...currentRangeValue.value,
      ];
      const index = activePart.value === "start" ? 0 : 1;

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
      if (activePart.value === "end" && parsedStart && startSeconds !== null) {
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

          if (props.format === "12") {
            const { period } = to12HourFormat(parsedStart.hours);
            selectedPeriod.value = period;
          }
        }
      }

      nextRange[index] = timeString;

      if (
        activePart.value === "start" &&
        endSeconds !== null &&
        candidateSeconds > endSeconds
      ) {
        nextRange[1] = timeString;
      }
      emit("update:modelValue", nextRange);
      emit("change", nextRange);

      if (activePart.value === "start" && nextRange[1] === null) {
        activePart.value = "end";
      }
    }

    function clearTime(event: Event) {
      event.stopPropagation();

      if (!isRangeMode.value) {
        emit("update:modelValue", null);
        emit("change", null);
        emit("clear");
        return;
      }

      const cleared: [string | null, string | null] = [null, null];
      emit("update:modelValue", cleared);
      emit("change", cleared);
      emit("clear");
    }

    function setNow() {
      const now = getCurrentTime(props.showSeconds);
      const parsed = parseTime(now);
      if (parsed) {
        selectedHours.value = parsed.hours;
        selectedMinutes.value = parsed.minutes;
        selectedSeconds.value = parsed.seconds;

        if (props.format === "12") {
          const { period } = to12HourFormat(parsed.hours);
          selectedPeriod.value = period;
        }

        updateTime();
      }
    }

    function isHourDisabled(hour: number): boolean {
      const hours24 =
        props.format === "12"
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

    watch(isOpen, async (newValue) => {
      if (newValue) {
        document.addEventListener("click", handleClickOutside);

        await nextTick();
        const panel = panelRef.value;
        if (!panel) return;

        const selectedHour = panel.querySelector(
          'button[data-tiger-timepicker-unit="hour"][aria-selected="true"]:not([disabled])'
        ) as HTMLButtonElement | null;

        if (selectedHour) {
          selectedHour.focus();
          return;
        }

        const firstHour = panel.querySelector(
          'button[data-tiger-timepicker-unit="hour"]:not([disabled])'
        ) as HTMLButtonElement | null;

        firstHour?.focus();
      } else {
        document.removeEventListener("click", handleClickOutside);
      }
    });

    onMounted(() => {
      if (isOpen.value) {
        document.addEventListener("click", handleClickOutside);
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClickOutside);
    });

    return () => {
      const inputClasses = getTimePickerInputClasses(
        props.size,
        props.disabled || props.readonly
      );
      const iconButtonClasses = getTimePickerIconButtonClasses(props.size);

      return h(
        "div",
        { ...attrs, class: rootClasses.value, style: rootStyle.value },
        [
          // Input wrapper
          h(
            "div",
            {
              ref: inputWrapperRef,
              class: timePickerInputWrapperClasses,
            },
            [
              // Input field for time display
              h("input", {
                ref: inputRef,
                type: "text",
                class: inputClasses,
                value: displayValue.value,
                placeholder: computedPlaceholder.value,
                disabled: props.disabled,
                readonly: true,
                required: props.required,
                name: props.name,
                id: props.id,
                onClick: handleInputClick,
                "aria-label": computedPlaceholder.value,
              }),
              // Clear button
              showClearButton.value &&
                h(
                  "button",
                  {
                    type: "button",
                    class: timePickerClearButtonClasses,
                    onClick: clearTime,
                    "aria-label": labels.value.clear,
                  },
                  CloseIcon
                ),
              // Clock icon button
              h(
                "button",
                {
                  type: "button",
                  class: iconButtonClasses,
                  disabled: props.disabled || props.readonly,
                  onClick: togglePanel,
                  "aria-label": labels.value.toggle,
                },
                ClockIcon
              ),
            ]
          ),
          // Time picker panel
          isOpen.value &&
            h(
              "div",
              {
                ref: panelRef,
                class: timePickerPanelClasses,
                role: "dialog",
                "aria-label": labels.value.dialog,
                onKeydown: handlePanelKeydown,
              },
              [
                // Range header
                isRangeMode.value &&
                  h("div", { class: timePickerRangeHeaderClasses }, [
                    h(
                      "button",
                      {
                        type: "button",
                        class: getTimePickerRangeTabButtonClasses(
                          activePart.value === "start"
                        ),
                        onClick: () => (activePart.value = "start"),
                        "aria-label": labels.value.start,
                        "aria-selected": activePart.value === "start",
                      },
                      labels.value.start
                    ),
                    h(
                      "button",
                      {
                        type: "button",
                        class: getTimePickerRangeTabButtonClasses(
                          activePart.value === "end"
                        ),
                        onClick: () => (activePart.value = "end"),
                        "aria-label": labels.value.end,
                        "aria-selected": activePart.value === "end",
                      },
                      labels.value.end
                    ),
                  ]),

                // Columns container
                h("div", { class: timePickerPanelContentClasses }, [
                  // Hours column
                  h("div", { class: timePickerColumnClasses }, [
                    h(
                      "div",
                      { class: timePickerColumnHeaderClasses },
                      labels.value.hour
                    ),
                    h(
                      "div",
                      { class: timePickerColumnListClasses },
                      hoursList.value.map((hour) => {
                        const displayHour = props.format === "12" ? hour : hour;
                        const hours24 =
                          props.format === "12"
                            ? to24HourFormat(hour, selectedPeriod.value)
                            : hour;
                        const isSelected = selectedHours.value === hours24;
                        const isDisabled = isHourDisabled(hour);

                        return h(
                          "button",
                          {
                            key: hour,
                            type: "button",
                            class: getTimePickerItemClasses(
                              isSelected,
                              isDisabled
                            ),
                            disabled: isDisabled,
                            onClick: () => selectHour(hour),
                            "data-tiger-timepicker-unit": "hour",
                            "aria-label": getTimePickerOptionAriaLabel(
                              displayHour,
                              "hour",
                              props.locale,
                              props.labels
                            ),
                            "aria-selected": isSelected,
                          },
                          displayHour.toString().padStart(2, "0")
                        );
                      })
                    ),
                  ]),
                  // Minutes column
                  h("div", { class: timePickerColumnClasses }, [
                    h(
                      "div",
                      { class: timePickerColumnHeaderClasses },
                      labels.value.minute
                    ),
                    h(
                      "div",
                      { class: timePickerColumnListClasses },
                      minutesList.value.map((minute) => {
                        const isSelected = selectedMinutes.value === minute;
                        const isDisabled = isMinuteDisabled(minute);

                        return h(
                          "button",
                          {
                            key: minute,
                            type: "button",
                            class: getTimePickerItemClasses(
                              isSelected,
                              isDisabled
                            ),
                            disabled: isDisabled,
                            onClick: () => selectMinute(minute),
                            "data-tiger-timepicker-unit": "minute",
                            "aria-label": getTimePickerOptionAriaLabel(
                              minute,
                              "minute",
                              props.locale,
                              props.labels
                            ),
                            "aria-selected": isSelected,
                          },
                          minute.toString().padStart(2, "0")
                        );
                      })
                    ),
                  ]),
                  // Seconds column (if enabled)
                  props.showSeconds &&
                    h("div", { class: timePickerColumnClasses }, [
                      h(
                        "div",
                        { class: timePickerColumnHeaderClasses },
                        labels.value.second
                      ),
                      h(
                        "div",
                        { class: timePickerColumnListClasses },
                        secondsList.value.map((second) => {
                          const isSelected = selectedSeconds.value === second;

                          return h(
                            "button",
                            {
                              key: second,
                              type: "button",
                              class: getTimePickerItemClasses(
                                isSelected,
                                false
                              ),
                              onClick: () => selectSecond(second),
                              "data-tiger-timepicker-unit": "second",
                              "aria-label": getTimePickerOptionAriaLabel(
                                second,
                                "second",
                                props.locale,
                                props.labels
                              ),
                              "aria-selected": isSelected,
                            },
                            second.toString().padStart(2, "0")
                          );
                        })
                      ),
                    ]),
                  // AM/PM column (if 12-hour format)
                  props.format === "12" &&
                    h("div", { class: timePickerColumnClasses }, [
                      h("div", { class: timePickerColumnHeaderClasses }, " "),
                      h("div", { class: "flex flex-col" }, [
                        h(
                          "button",
                          {
                            type: "button",
                            class: getTimePickerPeriodButtonClasses(
                              selectedPeriod.value === "AM"
                            ),
                            onClick: () => selectPeriod("AM"),
                            "data-tiger-timepicker-unit": "period",
                            "aria-label": periodLabels.value.am,
                            "aria-selected": selectedPeriod.value === "AM",
                          },
                          periodLabels.value.am
                        ),
                        h(
                          "button",
                          {
                            type: "button",
                            class: getTimePickerPeriodButtonClasses(
                              selectedPeriod.value === "PM"
                            ),
                            onClick: () => selectPeriod("PM"),
                            "data-tiger-timepicker-unit": "period",
                            "aria-label": periodLabels.value.pm,
                            "aria-selected": selectedPeriod.value === "PM",
                          },
                          periodLabels.value.pm
                        ),
                      ]),
                    ]),
                ]),
                // Footer
                h("div", { class: timePickerFooterClasses }, [
                  h(
                    "button",
                    {
                      type: "button",
                      class: timePickerFooterButtonClasses,
                      onClick: setNow,
                    },
                    labels.value.now
                  ),
                  h(
                    "button",
                    {
                      type: "button",
                      class: timePickerFooterButtonClasses,
                      onClick: closePanel,
                    },
                    labels.value.ok
                  ),
                ]),
              ]
            ),
        ]
      );
    };
  },
});

export default TimePicker;
