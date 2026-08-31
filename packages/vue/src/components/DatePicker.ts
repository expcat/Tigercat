import {
  defineComponent,
  computed,
  ref,
  h,
  inject,
  watch,
  nextTick,
  useId,
  type PropType,
  type CSSProperties
} from 'vue'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  calendarSolidIcon20PathD,
  classNames,
  closeSolidIcon20PathD,
  coerceClassValue,
  coerceDatePickerRange,
  coerceDatePickerSingle,
  commitDatePickerDay,
  commitDatePickerToday,
  datePickerFooterButtonClasses,
  datePickerFooterClasses,
  datePickerPanelClasses,
  datePickerSheetScrimClasses,
  datePickerShortcutButtonClasses,
  datePickerShortcutListClasses,
  emptyDatePickerValue,
  formatDatePickerDisplay,
  formDatePickerValue,
  getDatePickerLabels,
  getDatePickerLocaleCode,
  getInputClearButtonClasses,
  getInputFieldClasses,
  getInputPasswordToggleClasses,
  getInputWrapperClasses,
  getLocaleDirection,
  getWeekStartsOn,
  icon20ViewBox,
  isDatePickerValueEmpty,
  mergeAriaDescribedBy,
  mergeStyleValues,
  mergeTigerLocale,
  parseDatePickerShortcut,
  parseTypedDatePickerValue,
  resolveDatePickerDisabled,
  resolveInputTrailingLayout,
  resolveReadOnlyFlag,
  runShakeAnimation,
  toCalendarDate,
  type ComponentSize,
  type DateFormat,
  type DatePickerModelValue,
  type DatePickerShortcut,
  type DatePickerLabels,
  type FloatingPlacement,
  type InputStatus,
  type TigerLocale,
  type WeekStartsOn
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { Calendar } from './Calendar'
import { renderVueOverlayTeleport, useVueAnchoredOverlay, useVueFocusTrap } from '../utils/overlay'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

type RangeTuple = [Date | null, Date | null]

function filledIcon(path: string, className: string) {
  return h(
    'svg',
    {
      class: className,
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: icon20ViewBox,
      fill: 'currentColor',
      'aria-hidden': 'true',
      focusable: 'false'
    },
    [h('path', { 'fill-rule': 'evenodd', d: path, 'clip-rule': 'evenodd' })]
  )
}

export interface VueDatePickerProps {
  range?: boolean
  locale?: Partial<TigerLocale>
  labels?: Partial<DatePickerLabels>
  modelValue?: DatePickerModelValue
  defaultValue?: DatePickerModelValue
  open?: boolean
  defaultOpen?: boolean
  size?: ComponentSize
  format?: DateFormat
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  minDate?: Date | string | null
  maxDate?: Date | string | null
  disabledDate?: (date: Date) => boolean
  weekStartsOn?: WeekStartsOn
  now?: Date
  clearable?: boolean
  name?: string
  id?: string
  shortcuts?: DatePickerShortcut[]
  status?: InputStatus
  placement?: FloatingPlacement
  offset?: number
  dropdownClassName?: string
  getPopupContainer?: () => HTMLElement | null
  className?: string
}

export type DatePickerProps = VueDatePickerProps
export type VueDatePickerModelValue = DatePickerModelValue

export const DatePicker = defineComponent({
  name: 'TigerDatePicker',
  inheritAttrs: false,
  props: {
    range: { type: Boolean, default: false },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<DatePickerLabels>>, default: undefined },
    modelValue: {
      type: [Date, String, Array, null] as PropType<DatePickerModelValue>,
      default: undefined
    },
    defaultValue: {
      type: [Date, String, Array, null] as PropType<DatePickerModelValue>,
      default: undefined
    },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    format: { type: String as PropType<DateFormat>, default: 'yyyy-MM-dd' },
    placeholder: { type: String, default: undefined },
    disabled: Boolean,
    readonly: { type: Boolean, default: undefined },
    required: Boolean,
    minDate: { type: [Date, String, null] as PropType<Date | string | null>, default: undefined },
    maxDate: { type: [Date, String, null] as PropType<Date | string | null>, default: undefined },
    disabledDate: { type: Function as PropType<(date: Date) => boolean>, default: undefined },
    weekStartsOn: { type: Number as PropType<WeekStartsOn>, default: undefined },
    now: { type: Date as PropType<Date>, default: undefined },
    clearable: { type: Boolean, default: true },
    name: String,
    id: String,
    shortcuts: { type: Array as PropType<DatePickerShortcut[]>, default: undefined },
    status: { type: String as PropType<InputStatus>, default: undefined },
    placement: { type: String as PropType<FloatingPlacement>, default: 'bottom-start' },
    offset: { type: Number, default: 4 },
    dropdownClassName: String,
    getPopupContainer: { type: Function as PropType<() => HTMLElement | null> },
    className: String
  },
  emits: ['update:modelValue', 'update:open', 'change', 'input', 'open-change', 'clear', 'blur'],
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const inputGroup = inject<InputGroupContext | null>(INPUT_GROUP_INJECTION_KEY, null)
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const localeCode = computed(() => getDatePickerLocaleCode(mergedLocale.value))
    const labels = computed(() => getDatePickerLabels(mergedLocale.value, props.labels))
    const weekStartsOn = computed(() => props.weekStartsOn ?? getWeekStartsOn(localeCode.value))
    const isReadOnly = computed(() => resolveReadOnlyFlag(props.readonly))
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const inGroup = computed(() => inputGroup != null)
    const effectiveSize = computed(() => props.size ?? inputGroup?.size ?? 'md')
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const required = computed(() => props.required || Boolean(formItemControl?.required.value))

    const localValue = ref<Date | null | RangeTuple>(
      props.range
        ? coerceDatePickerRange(props.defaultValue)
        : coerceDatePickerSingle(props.defaultValue)
    )
    const localOpen = ref(props.defaultOpen)
    const previewRange = ref<RangeTuple | null>(null)
    const draftText = ref<string | null>(null)

    const committed = computed(() => {
      if (props.modelValue !== undefined) {
        return props.range
          ? coerceDatePickerRange(props.modelValue)
          : coerceDatePickerSingle(props.modelValue)
      }
      if (formItemControl?.value.value !== undefined) {
        return props.range
          ? coerceDatePickerRange(formItemControl.value.value)
          : coerceDatePickerSingle(formItemControl.value.value)
      }
      return localValue.value
    })
    const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value))

    function writeCommitted(next: Date | null | RangeTuple) {
      if (props.modelValue === undefined && formItemControl?.value.value === undefined) {
        localValue.value = next
      }
      emit('update:modelValue', next)
      emit('change', next)
      emit('input', next)
      formItemControl?.onChange(formDatePickerValue(props.range, next, null))
    }

    function setOpenSafe(next: boolean) {
      if (effectiveDisabled.value || isReadOnly.value) return
      if (props.open === undefined) localOpen.value = next
      emit('update:open', next)
      emit('open-change', next)
      if (!next) previewRange.value = null
    }

    const displaySource = computed(() =>
      props.range ? (previewRange.value ?? committed.value) : committed.value
    )
    const displayValue = computed(
      () =>
        draftText.value ??
        formatDatePickerDisplay(props.range, displaySource.value, props.format, localeCode.value)
    )
    const placeholderText = computed(
      () =>
        props.placeholder ??
        (props.range ? labels.value.rangePlaceholder : labels.value.placeholder)
    )
    const minDate = computed(() => toCalendarDate(props.minDate ?? null))
    const maxDate = computed(() => toCalendarDate(props.maxDate ?? null))
    const rangeSelectingEnd = computed(() =>
      Boolean(props.range && previewRange.value?.[0] && !previewRange.value?.[1])
    )
    function isDateDisabled(date: Date) {
      return resolveDatePickerDisabled(date, {
        minDate: minDate.value,
        maxDate: maxDate.value,
        disabledDate: props.disabledDate,
        rangeStart: previewRange.value?.[0] ?? null,
        rangeSelectingEnd: rangeSelectingEnd.value
      })
    }
    const calendarValue = computed(() => {
      if (!props.range) return committed.value as Date | null
      return previewRange.value?.[0] ?? (committed.value as RangeTuple)[0] ?? null
    })
    const rangeHighlight = computed(() =>
      props.range ? (previewRange.value ?? (committed.value as RangeTuple)) : undefined
    )
    const showClear = computed(
      () =>
        props.clearable &&
        !effectiveDisabled.value &&
        !isReadOnly.value &&
        !isDatePickerValueEmpty(props.range, committed.value)
    )
    const trailing = computed(() =>
      resolveInputTrailingLayout({
        clearable: props.clearable,
        disabled: effectiveDisabled.value,
        readOnly: isReadOnly.value,
        valueLength: showClear.value ? 1 : 0,
        hasCustomSuffix: true
      })
    )

    const rootRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)
    const panelRef = ref<HTMLElement | null>(null)
    const inputWrapperRef = ref<HTMLElement | null>(null)
    const instanceId = useId()
    const panelId = computed(() => `tiger-datepicker-panel-${instanceId}`)

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      () => {
        if (status.value === 'error') runShakeAnimation(rootRef.value)
      }
    )

    const overlay = useVueAnchoredOverlay({
      enabled: isOpen,
      referenceRef: inputWrapperRef,
      floatingRef: panelRef,
      placement: () => props.placement ?? 'bottom-start',
      offset: () => props.offset ?? 4,
      layout: 'bottom-sheet-sm',
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      getContainer: () => props.getPopupContainer?.() ?? null,
      onDismiss: () => setOpenSafe(false)
    })
    useVueFocusTrap({ enabled: isOpen, containerRef: panelRef, inert: true })

    watch(isOpen, (open) => {
      if (!open) return
      nextTick(() => {
        panelRef.value?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus()
      })
    })

    function selectDay(date: Date) {
      const result = commitDatePickerDay({
        range: props.range,
        picked: date,
        committed: committed.value,
        preview: previewRange.value
      })
      writeCommitted(result.nextCommitted)
      previewRange.value = result.nextPreview
      draftText.value = null
      if (result.close) setOpenSafe(false)
    }

    function selectToday() {
      const today = props.now ?? new Date()
      if (isDateDisabled(today)) return
      const result = commitDatePickerToday(props.range, today)
      writeCommitted(result.nextCommitted)
      previewRange.value = null
      draftText.value = null
      if (result.close) setOpenSafe(false)
    }

    function applyShortcut(shortcut: DatePickerShortcut) {
      const parsed = parseDatePickerShortcut(shortcut, props.range)
      if (parsed == null) return
      writeCommitted(parsed)
      previewRange.value = null
      draftText.value = null
      if (!props.range) setOpenSafe(false)
    }

    function clearValue() {
      writeCommitted(emptyDatePickerValue(props.range))
      previewRange.value = null
      draftText.value = null
      emit('clear')
      inputRef.value?.focus()
    }

    function parseDraft() {
      if (draftText.value == null) return
      const parsed = parseTypedDatePickerValue(draftText.value, props.format, props.range)
      writeCommitted(
        props.range
          ? ((parsed as RangeTuple | null) ?? [null, null])
          : ((parsed as Date | null) ?? null)
      )
      draftText.value = null
    }

    function handleFocusOut(event: FocusEvent) {
      const next = event.relatedTarget as Node | null
      if (
        (rootRef.value && next && rootRef.value.contains(next)) ||
        (panelRef.value && next && panelRef.value.contains(next))
      ) {
        return
      }
      parseDraft()
      formItemControl?.onBlur()
      emit('blur', event)
    }

    function handleInputKeyDown(event: KeyboardEvent) {
      if (effectiveDisabled.value || isReadOnly.value) return
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setOpenSafe(true)
        return
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        if (isOpen.value || draftText.value != null) parseDraft()
        else setOpenSafe(true)
      }
    }

    expose({
      focus: () => inputRef.value?.focus(),
      open: () => setOpenSafe(true),
      close: () => setOpenSafe(false)
    })

    return () => {
      const attrRecord = attrs as Record<string, unknown>
      const describedBy = mergeAriaDescribedBy(
        typeof attrRecord['aria-describedby'] === 'string'
          ? (attrRecord['aria-describedby'] as string)
          : undefined,
        formItemControl?.describedBy.value
      )
      const labelledby =
        typeof attrRecord['aria-labelledby'] === 'string' &&
        (attrRecord['aria-labelledby'] as string).trim()
          ? (attrRecord['aria-labelledby'] as string)
          : formItemControl?.labelId.value
      const ariaLabel =
        typeof attrRecord['aria-label'] === 'string' && (attrRecord['aria-label'] as string).trim()
          ? (attrRecord['aria-label'] as string)
          : undefined
      const trailingLayout = trailing.value
      const input = h('input', {
        ref: inputRef,
        type: 'text',
        class: getInputFieldClasses({
          size: effectiveSize.value,
          status: status.value,
          hasSuffix: trailingLayout.hasSuffix,
          hasDualSuffix: trailingLayout.hasDualSuffix
        }),
        value: displayValue.value,
        placeholder: placeholderText.value,
        disabled: effectiveDisabled.value,
        readonly: isReadOnly.value,
        required: required.value,
        name: effectiveName.value,
        id: effectiveId.value,
        autocomplete: 'off',
        'aria-label': ariaLabel ?? (labelledby ? undefined : placeholderText.value),
        'aria-labelledby': labelledby,
        'aria-describedby': describedBy,
        'aria-invalid': status.value === 'error' ? true : undefined,
        'aria-required': required.value ? true : undefined,
        'aria-controls': isOpen.value ? panelId.value : undefined,
        onInput: (event: Event) => {
          draftText.value = (event.target as HTMLInputElement).value
        },
        onClick: () => setOpenSafe(true),
        onKeydown: handleInputKeyDown,
        onBlur: parseDraft
      })
      const clearBtn = showClear.value
        ? h(
            'button',
            {
              type: 'button',
              class: getInputClearButtonClasses(effectiveSize.value, {
                offsetSlots: trailingLayout.clearOffsetSlots
              }),
              'aria-label': labels.value.clearDate,
              onMousedown: (event: MouseEvent) => event.preventDefault(),
              onClick: clearValue
            },
            [filledIcon(closeSolidIcon20PathD, 'w-4 h-4')]
          )
        : null
      const calendarBtn = h(
        'button',
        {
          type: 'button',
          class: getInputPasswordToggleClasses(effectiveSize.value, { offsetSlots: 0 }),
          disabled: effectiveDisabled.value || isReadOnly.value,
          'aria-label': labels.value.toggleCalendar,
          onMousedown: (event: MouseEvent) => event.preventDefault(),
          onClick: () => setOpenSafe(!isOpen.value)
        },
        [filledIcon(calendarSolidIcon20PathD, 'w-5 h-5')]
      )

      const panel = isOpen.value
        ? [
            h('button', {
              type: 'button',
              class: datePickerSheetScrimClasses,
              tabindex: -1,
              'aria-hidden': 'true',
              onClick: () => setOpenSafe(false)
            }),
            h(
              'div',
              {
                ref: panelRef,
                id: panelId.value,
                role: 'dialog',
                'aria-modal': 'true',
                'aria-label': labels.value.calendar,
                class: classNames(
                  datePickerPanelClasses,
                  overlay.floatingClasses.value,
                  props.dropdownClassName
                ),
                style: overlay.floatingStyles.value,
                'data-positioned': overlay.positioned.value,
                'data-tiger': 'datepicker-panel',
                onFocusout: handleFocusOut
              },
              [
                h(Calendar, {
                  modelValue: calendarValue.value,
                  now: props.now,
                  locale: mergedLocale.value,
                  weekStartsOn: weekStartsOn.value,
                  disabledDate: isDateDisabled,
                  rangeValue: rangeHighlight.value,
                  onChange: selectDay
                }),
                props.shortcuts?.length
                  ? h(
                      'div',
                      { class: datePickerShortcutListClasses },
                      props.shortcuts.map((shortcut) =>
                        h(
                          'button',
                          {
                            key: shortcut.label,
                            type: 'button',
                            class: datePickerShortcutButtonClasses,
                            onClick: () => applyShortcut(shortcut)
                          },
                          shortcut.label
                        )
                      )
                    )
                  : null,
                h('div', { class: datePickerFooterClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: datePickerFooterButtonClasses,
                      onClick: selectToday
                    },
                    labels.value.today
                  ),
                  props.range
                    ? h(
                        'button',
                        {
                          type: 'button',
                          class: datePickerFooterButtonClasses,
                          onClick: () => setOpenSafe(false)
                        },
                        labels.value.ok
                      )
                    : null
                ])
              ]
            )
          ]
        : null

      const { class: _class, style: attrStyle, ...restAttrs } = attrRecord
      return h(
        'div',
        {
          ...restAttrs,
          ref: rootRef,
          class: classNames(
            'relative inline-block w-full',
            props.className,
            coerceClassValue(_class)
          ),
          style: mergeStyleValues(attrStyle) as CSSProperties | undefined,
          [TIGER_CHROME_ATTR]: '',
          onAnimationend: () => rootRef.value?.classList.remove(SHAKE_CLASS),
          onFocusout: handleFocusOut
        },
        [
          h(
            'div',
            {
              ref: inputWrapperRef,
              class: getInputWrapperClasses(status.value, { inGroup: inGroup.value })
            },
            [input, clearBtn, calendarBtn]
          ),
          renderVueOverlayTeleport(panel, overlay.target.value)
        ]
      )
    }
  }
})

export default DatePicker
