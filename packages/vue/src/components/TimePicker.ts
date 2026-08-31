import {
  defineComponent,
  computed,
  ref,
  h,
  inject,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  useId,
  type PropType,
  type CSSProperties
} from 'vue'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  TIME_PICKER_DESKTOP_QUERY,
  adjacentTimePickerColumn,
  applyTimePickerColumn,
  applyTimePickerRangeColumn,
  buildTimePickerColumns,
  classNames,
  clockSolidIcon20PathD,
  closeSolidIcon20PathD,
  coerceClassValue,
  coerceTimePickerRange,
  coerceTimePickerSingle,
  commitTimePickerNow,
  commitTimePickerOk,
  datePickerSheetScrimClasses,
  emptyTimePickerValue,
  focusTimePickerOption,
  formatTime,
  formatTimePickerDisplay,
  formTimePickerValue,
  getInputClearButtonClasses,
  getInputFieldClasses,
  getInputPasswordToggleClasses,
  getInputWrapperClasses,
  getLocaleDirection,
  getTimePeriodLabels,
  getTimePickerItemClasses,
  getTimePickerLabels,
  getTimePickerMobileSelectRowClasses,
  getTimePickerRangeTabButtonClasses,
  icon20ViewBox,
  isTimePickerDesktopLayout,
  isTimePickerValueEmpty,
  mergeAriaDescribedBy,
  mergeStyleValues,
  mergeTigerLocale,
  parseTypedTimePickerValue,
  resolveInputTrailingLayout,
  resolveReadOnlyFlag,
  runShakeAnimation,
  seedTimePickerDraft,
  timePickerBaseClasses,
  timePickerColumnClasses,
  timePickerColumnHeaderClasses,
  timePickerColumnListClasses,
  timePickerDesktopColumnsClasses,
  timePickerFooterButtonClasses,
  timePickerFooterClasses,
  timePickerMobileSelectClasses,
  timePickerPanelClasses,
  timePickerRangeHeaderClasses,
  visibleTimePickerColumns,
  type ComponentSize,
  type FloatingPlacement,
  type InputStatus,
  type TimeFormat,
  type TimePickerConstraints,
  type TimePickerDraft,
  type TimePickerFocusUnit,
  type TimePickerLabels,
  type TimePickerModelValue,
  type TimePickerRangeTuple,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { renderVueOverlayTeleport, useVueAnchoredOverlay, useVueFocusTrap } from '../utils/overlay'
import { INPUT_GROUP_INJECTION_KEY, type InputGroupContext } from './InputGroup'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

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

export interface VueTimePickerProps {
  range?: boolean
  locale?: Partial<TigerLocale>
  labels?: Partial<TimePickerLabels>
  modelValue?: TimePickerModelValue | null
  defaultValue?: TimePickerModelValue | null
  open?: boolean
  defaultOpen?: boolean
  size?: ComponentSize
  format?: TimeFormat
  showSeconds?: boolean
  hourStep?: number
  minuteStep?: number
  secondStep?: number
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  minTime?: string | null
  maxTime?: string | null
  disabledTime?: (time: string) => boolean
  now?: Date
  clearable?: boolean
  name?: string
  id?: string
  status?: InputStatus
  placement?: FloatingPlacement
  offset?: number
  dropdownClassName?: string
  getPopupContainer?: () => HTMLElement | null
  className?: string
}

export type TimePickerProps = VueTimePickerProps
export type VueTimePickerModelValue = TimePickerModelValue

export const TimePicker = defineComponent({
  name: 'TigerTimePicker',
  inheritAttrs: false,
  props: {
    range: { type: Boolean, default: false },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TimePickerLabels>>, default: undefined },
    modelValue: {
      type: [String, Array, null] as PropType<TimePickerModelValue | null>,
      default: undefined
    },
    defaultValue: {
      type: [String, Array, null] as PropType<TimePickerModelValue | null>,
      default: undefined
    },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    format: { type: String as PropType<TimeFormat>, default: '24' },
    showSeconds: Boolean,
    hourStep: { type: Number, default: 1 },
    minuteStep: { type: Number, default: 1 },
    secondStep: { type: Number, default: 1 },
    placeholder: { type: String, default: undefined },
    disabled: Boolean,
    readonly: { type: Boolean, default: undefined },
    required: Boolean,
    minTime: { type: String as PropType<string | null>, default: undefined },
    maxTime: { type: String as PropType<string | null>, default: undefined },
    disabledTime: { type: Function as PropType<(time: string) => boolean>, default: undefined },
    now: { type: Date as PropType<Date>, default: undefined },
    clearable: { type: Boolean, default: true },
    name: String,
    id: String,
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
    const localeCode = computed(() => mergedLocale.value?.locale)
    const labels = computed(() => getTimePickerLabels(mergedLocale.value, props.labels))
    const periodLabels = computed(() => getTimePeriodLabels(localeCode.value))
    const dir = computed(() => getLocaleDirection(mergedLocale.value))
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

    const localValue = ref<string | null | TimePickerRangeTuple>(
      props.range
        ? coerceTimePickerRange(props.defaultValue)
        : coerceTimePickerSingle(props.defaultValue)
    )
    const localOpen = ref(props.defaultOpen)
    const draft = ref<TimePickerDraft>(seedTimePickerDraft(null, props.format))
    const draftRange = ref<TimePickerRangeTuple | null>(null)
    const activePart = ref<'start' | 'end'>('start')
    const draftText = ref<string | null>(null)
    const desktop = ref(isTimePickerDesktopLayout())

    const committed = computed(() => {
      if (props.modelValue !== undefined) {
        return props.range
          ? coerceTimePickerRange(props.modelValue)
          : coerceTimePickerSingle(props.modelValue)
      }
      if (formItemControl?.value.value !== undefined) {
        return props.range
          ? coerceTimePickerRange(formItemControl.value.value)
          : coerceTimePickerSingle(formItemControl.value.value)
      }
      return localValue.value
    })
    const isOpen = computed(() => (props.open !== undefined ? props.open : localOpen.value))

    const constraints = computed<TimePickerConstraints>(() => ({
      minTime: props.minTime,
      maxTime: props.maxTime,
      disabledTime: props.disabledTime,
      hourStep: props.hourStep,
      minuteStep: props.minuteStep,
      secondStep: props.secondStep,
      format: props.format,
      showSeconds: props.showSeconds
    }))

    function writeCommitted(next: string | null | TimePickerRangeTuple) {
      if (props.modelValue === undefined && formItemControl?.value.value === undefined) {
        localValue.value = next
      }
      emit('update:modelValue', next)
      emit('change', next)
      emit('input', next)
      formItemControl?.onChange(formTimePickerValue(props.range, next))
      draftText.value = null
    }

    function seedPanel(value: string | null | TimePickerRangeTuple, part: 'start' | 'end') {
      if (props.range) {
        const tuple = (value as TimePickerRangeTuple | null) ?? null
        draftRange.value = tuple
        const active = tuple?.[part === 'start' ? 0 : 1] ?? null
        draft.value = seedTimePickerDraft(active, props.format)
        return
      }
      draft.value = seedTimePickerDraft(value as string | null, props.format)
    }

    function setOpenSafe(next: boolean) {
      if (effectiveDisabled.value || isReadOnly.value) return
      if (props.open === undefined) localOpen.value = next
      emit('update:open', next)
      emit('open-change', next)
      if (!next) draftText.value = null
    }

    const displaySource = computed(() => {
      if (!isOpen.value) return committed.value
      if (props.range) return draftRange.value
      return draft.value.parts
        ? formatTime(
            draft.value.parts.hours,
            draft.value.parts.minutes,
            draft.value.parts.seconds,
            props.showSeconds
          )
        : null
    })
    const displayValue = computed(
      () =>
        draftText.value ??
        formatTimePickerDisplay(
          props.range,
          displaySource.value,
          props.format,
          props.showSeconds,
          localeCode.value
        )
    )
    const placeholderText = computed(
      () =>
        props.placeholder ?? (props.range ? labels.value.selectTimeRange : labels.value.selectTime)
    )
    const showClear = computed(
      () =>
        props.clearable &&
        !effectiveDisabled.value &&
        !isReadOnly.value &&
        !isTimePickerValueEmpty(props.range, committed.value)
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
    const columns = computed(() =>
      buildTimePickerColumns({
        instanceId: panelId.value,
        draft: draft.value,
        constraints: constraints.value,
        labels: labels.value,
        periodLabels: periodLabels.value
      })
    )

    const rootRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)
    const panelRef = ref<HTMLElement | null>(null)
    const inputWrapperRef = ref<HTMLElement | null>(null)
    const instanceId = useId()
    const panelId = computed(() => `tiger-timepicker-panel-${instanceId}`)

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

    function focusPanel() {
      const panel = panelRef.value
      if (!panel) return
      if (desktop.value) {
        const selected = panel.querySelector<HTMLElement>(
          '[data-tiger-timepicker-unit="hour"][aria-selected="true"]'
        )
        const first = panel.querySelector<HTMLElement>(
          '[data-tiger-timepicker-unit="hour"]:not([aria-disabled="true"])'
        )
        ;(selected ?? first)?.focus()
        panel.querySelectorAll('[aria-selected="true"]').forEach((node) => {
          ;(node as HTMLElement).scrollIntoView({ block: 'nearest' })
        })
        return
      }
      panel.querySelector('select')?.focus()
    }

    watch(
      isOpen,
      (open) => {
        if (!open) return
        activePart.value = 'start'
        seedPanel(committed.value, 'start')
        nextTick(focusPanel)
      },
      { immediate: true }
    )
    watch(activePart, () => {
      if (isOpen.value) nextTick(focusPanel)
    })

    let media: MediaQueryList | null = null
    const syncDesktop = () => {
      desktop.value = isTimePickerDesktopLayout()
    }
    onMounted(() => {
      syncDesktop()
      if (typeof window.matchMedia !== 'function') return
      media = window.matchMedia(TIME_PICKER_DESKTOP_QUERY)
      media.addEventListener('change', syncDesktop)
    })
    onUnmounted(() => {
      media?.removeEventListener('change', syncDesktop)
    })

    function selectColumn(unit: TimePickerFocusUnit, option: number | 'AM' | 'PM') {
      if (props.range) {
        const next = applyTimePickerRangeColumn({
          draftRange: draftRange.value,
          activePart: activePart.value,
          column: unit,
          option,
          constraints: constraints.value
        })
        draftRange.value = next.nextRange
        activePart.value = next.nextActivePart
        const active = next.nextRange?.[next.nextActivePart === 'start' ? 0 : 1] ?? null
        draft.value = seedTimePickerDraft(active, props.format)
        return
      }
      draft.value = applyTimePickerColumn(draft.value, unit, option, constraints.value)
    }

    function confirmDraft() {
      const result = commitTimePickerOk({
        range: props.range,
        draft: draft.value,
        draftRange: draftRange.value,
        constraints: constraints.value
      })
      if (!result) {
        setOpenSafe(false)
        return
      }
      writeCommitted(result.nextCommitted)
      if (result.close) setOpenSafe(false)
    }

    function selectNow() {
      const result = commitTimePickerNow(props.range, props.now ?? new Date(), constraints.value)
      writeCommitted(result.nextCommitted)
      seedPanel(result.nextCommitted, 'start')
      if (result.close) setOpenSafe(false)
    }

    function clearValue() {
      writeCommitted(emptyTimePickerValue(props.range))
      emit('clear')
      inputRef.value?.focus()
    }

    function parseDraft() {
      if (draftText.value == null) return
      const parsed = parseTypedTimePickerValue(
        draftText.value,
        props.format,
        props.showSeconds,
        props.range,
        periodLabels.value
      )
      writeCommitted(parsed)
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
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (draftText.value != null) {
          parseDraft()
          return
        }
        if (isOpen.value) {
          confirmDraft()
          return
        }
        setOpenSafe(true)
      }
    }

    function handlePanelKeyDown(event: KeyboardEvent) {
      const unit = (event.target as HTMLElement).getAttribute(
        'data-tiger-timepicker-unit'
      ) as TimePickerFocusUnit | null
      if (!unit) return
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        focusTimePickerOption(panelRef.value, unit, 'prev')
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        focusTimePickerOption(panelRef.value, unit, 'next')
        return
      }
      if (event.key === 'Home') {
        event.preventDefault()
        focusTimePickerOption(panelRef.value, unit, 'first')
        return
      }
      if (event.key === 'End') {
        event.preventDefault()
        focusTimePickerOption(panelRef.value, unit, 'last')
        return
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        const next = adjacentTimePickerColumn(
          unit,
          visibleTimePickerColumns(props.format, props.showSeconds),
          dir.value,
          event.key
        )
        if (next) focusTimePickerOption(panelRef.value, next, 'first')
      }
    }

    function switchPart(part: 'start' | 'end') {
      activePart.value = part
      const active = draftRange.value?.[part === 'start' ? 0 : 1] ?? null
      draft.value = seedTimePickerDraft(active, props.format)
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
              'aria-label': labels.value.clear,
              onMousedown: (event: MouseEvent) => event.preventDefault(),
              onClick: clearValue
            },
            [filledIcon(closeSolidIcon20PathD, 'w-4 h-4')]
          )
        : null
      const clockBtn = h(
        'button',
        {
          type: 'button',
          class: getInputPasswordToggleClasses(effectiveSize.value, { offsetSlots: 0 }),
          disabled: effectiveDisabled.value || isReadOnly.value,
          'aria-label': labels.value.toggle,
          onMousedown: (event: MouseEvent) => event.preventDefault(),
          onClick: () => setOpenSafe(!isOpen.value)
        },
        [filledIcon(clockSolidIcon20PathD, 'w-5 h-5')]
      )

      const columnTree = desktop.value
        ? h(
            'div',
            { class: timePickerDesktopColumnsClasses },
            columns.value.map((column) => {
              const active =
                column.options.find((option) => option.selected) ??
                column.options.find((option) => !option.disabled)
              return h('div', { class: timePickerColumnClasses, key: column.unit }, [
                h(
                  'div',
                  { id: column.headerId, class: timePickerColumnHeaderClasses },
                  column.label
                ),
                h(
                  'div',
                  {
                    id: column.listId,
                    role: 'listbox',
                    'aria-labelledby': column.headerId,
                    'aria-activedescendant': active
                      ? `${column.listId}-${String(active.value)}`
                      : undefined,
                    class: timePickerColumnListClasses,
                    onKeydown: handlePanelKeyDown
                  },
                  column.options.map((option) => {
                    const selected = option.selected
                    const tabIndex = option.disabled ? -1 : selected || option === active ? 0 : -1
                    return h(
                      'div',
                      {
                        key: String(option.value),
                        id: `${column.listId}-${String(option.value)}`,
                        role: 'option',
                        tabindex: tabIndex,
                        'aria-selected': selected,
                        'aria-disabled': option.disabled || undefined,
                        'aria-label': option.ariaLabel,
                        'data-tiger-timepicker-unit': column.unit,
                        class: getTimePickerItemClasses(selected, option.disabled),
                        onClick: () => {
                          if (!option.disabled) selectColumn(column.unit, option.value)
                        }
                      },
                      option.label
                    )
                  })
                )
              ])
            })
          )
        : h(
            'div',
            { class: getTimePickerMobileSelectRowClasses(columns.value.length as 2 | 3 | 4) },
            columns.value.map((column) => {
              const selected = column.options.find((option) => option.selected)
              return h(
                'select',
                {
                  key: column.unit,
                  class: timePickerMobileSelectClasses,
                  'aria-label': column.label,
                  value: selected ? String(selected.value) : '',
                  onChange: (event: Event) => {
                    const raw = (event.target as HTMLSelectElement).value
                    const option = column.unit === 'period' ? (raw as 'AM' | 'PM') : Number(raw)
                    selectColumn(column.unit, option)
                  }
                },
                [
                  selected ? null : h('option', { value: '', disabled: true }),
                  ...column.options.map((option) =>
                    h(
                      'option',
                      {
                        value: String(option.value),
                        disabled: option.disabled
                      },
                      option.label
                    )
                  )
                ]
              )
            })
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
                'aria-label': labels.value.dialog,
                class: classNames(
                  timePickerPanelClasses,
                  overlay.floatingClasses.value,
                  props.dropdownClassName
                ),
                style: overlay.floatingStyles.value,
                'data-positioned': overlay.positioned.value,
                'data-tiger': 'timepicker-panel',
                onFocusout: handleFocusOut
              },
              [
                props.range
                  ? h('div', { class: timePickerRangeHeaderClasses, role: 'tablist' }, [
                      h(
                        'button',
                        {
                          type: 'button',
                          role: 'tab',
                          class: getTimePickerRangeTabButtonClasses(activePart.value === 'start'),
                          'aria-selected': activePart.value === 'start',
                          onClick: () => switchPart('start')
                        },
                        labels.value.start
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          role: 'tab',
                          class: getTimePickerRangeTabButtonClasses(activePart.value === 'end'),
                          'aria-selected': activePart.value === 'end',
                          onClick: () => switchPart('end')
                        },
                        labels.value.end
                      )
                    ])
                  : null,
                columnTree,
                h('div', { class: timePickerFooterClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: timePickerFooterButtonClasses,
                      onClick: selectNow
                    },
                    labels.value.now
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      class: timePickerFooterButtonClasses,
                      onClick: confirmDraft
                    },
                    labels.value.ok
                  )
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
          class: classNames(timePickerBaseClasses, props.className, coerceClassValue(_class)),
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
            [input, clearBtn, clockBtn]
          ),
          renderVueOverlayTeleport(panel, overlay.target.value)
        ]
      )
    }
  }
})

export default TimePicker
