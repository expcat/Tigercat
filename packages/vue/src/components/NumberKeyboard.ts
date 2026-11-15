import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  provide,
  ref,
  useId,
  watch,
  type PropType
} from 'vue'
import type {
  InputStatus,
  NumberKeyboardChangePayload,
  NumberKeyboardKey,
  NumberKeyboardMode,
  TigerLocale,
  TigerLocaleNumberKeyboard
} from '@expcat/tigercat-core'
import {
  applyNumberKeyboardKey,
  callUnknownEventHandler,
  classNames,
  coerceClassValue,
  getNumberKeyboardInteractiveIndexes,
  getNumberKeyboardKeyClasses,
  getNumberKeyboardKeys,
  getNumberKeyboardLabels,
  isNumberKeyboardValueRejected,
  mergeAriaDescribedBy,
  mergeStyleValues,
  mergeTigerLocale,
  moveNumberKeyboardIndex,
  numberKeyboardEmptyKeyClasses,
  numberKeyboardGridClasses,
  numberKeyboardRootClasses,
  numberKeyboardScrimClasses,
  numberKeyboardSheetClasses,
  postNumberKeyboardValue,
  resolveAnchoredOverlayTarget,
  resolveNumberKeyboardPhysicalKey
} from '@expcat/tigercat-core'
import {
  renderVueOverlayTeleport,
  useVueBodyScrollLock,
  useVueEscapeKey,
  useVueFocusTrap
} from '../utils/overlay'
import { useTigerConfig } from './tiger-config'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export type VueNumberKeyboardProps = InstanceType<typeof NumberKeyboard>['$props']
export type NumberKeyboardProps = VueNumberKeyboardProps

export const NumberKeyboard = defineComponent({
  name: 'TigerNumberKeyboard',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    mode: { type: String as PropType<NumberKeyboardMode>, default: 'number' },
    maxLength: { type: Number, default: undefined },
    precision: { type: Number, default: undefined },
    decimalSeparator: { type: String, default: '.' },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    confirmText: { type: String, default: undefined },
    deleteText: { type: String, default: undefined },
    ariaLabel: { type: String, default: undefined },
    showConfirm: { type: Boolean, default: true },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    name: { type: String, default: undefined },
    id: { type: String, default: undefined },
    status: { type: String as PropType<InputStatus>, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: {
      type: Object as PropType<Partial<TigerLocaleNumberKeyboard>>,
      default: undefined
    },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['update:modelValue', 'update:open', 'key-press', 'delete', 'confirm', 'blur'],
  setup(props, { attrs, emit, expose }) {
    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    provide(FORM_ITEM_CONTROL_INJECTION_KEY, null)

    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() =>
      getNumberKeyboardLabels(mergedLocale.value, {
        ...props.labels,
        ariaLabel: props.ariaLabel?.trim() || props.labels?.ariaLabel,
        deleteText: props.deleteText?.trim() || props.labels?.deleteText,
        confirmText: props.confirmText?.trim()
      })
    )

    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)
    const overlayMode = computed(() => props.open !== undefined || props.defaultOpen !== undefined)

    const inputOptions = computed(() => ({
      mode: props.mode,
      maxLength: props.maxLength,
      precision: props.precision,
      decimalSeparator: props.decimalSeparator
    }))

    const innerValue = ref(props.defaultValue ?? '')
    const innerOpen = ref(props.defaultOpen ?? false)

    const rawValue = computed(() => {
      if (props.modelValue !== undefined) return props.modelValue
      if (formItemControl?.value.value !== undefined) return formItemControl.value.value
      return innerValue.value
    })
    const currentValue = computed(() =>
      postNumberKeyboardValue(rawValue.value, props.mode, inputOptions.value)
    )
    const invalidValue = computed(() =>
      isNumberKeyboardValueRejected(rawValue.value, props.mode, inputOptions.value)
    )
    const errorId = `${useId()}-error`
    const isOpen = computed(() => (props.open !== undefined ? props.open : innerOpen.value))
    const overlayEnabled = computed(
      () => overlayMode.value && isOpen.value && !effectiveDisabled.value
    )

    const keys = computed(() => {
      const layout = getNumberKeyboardKeys({
        mode: props.mode,
        decimalSeparator: props.decimalSeparator,
        showConfirm: props.showConfirm,
        labels: labels.value
      })
      if (!props.readOnly) return layout
      return layout.map((key) => (key.type === 'empty' ? key : { ...key, disabled: true }))
    })
    const interactive = computed(() => getNumberKeyboardInteractiveIndexes(keys.value))
    const activeIndex = ref(interactive.value[0] ?? 0)
    const keyRefs = ref<Array<HTMLButtonElement | null>>([])

    watch(interactive, (next) => {
      if (!next.includes(activeIndex.value)) activeIndex.value = next[0] ?? 0
    })

    watch(
      () => [invalidValue.value, labels.value.invalidValueText] as const,
      ([isInvalid], previous) => {
        if (isInvalid) formItemControl?.setError(labels.value.invalidValueText)
        else if (previous?.[0]) formItemControl?.setError(null)
      },
      { immediate: true }
    )

    const rootRef = ref<HTMLDivElement | null>(null)
    const sheetRef = ref<HTMLDivElement | null>(null)

    useVueFocusTrap({
      enabled: overlayEnabled,
      containerRef: sheetRef,
      inert: true,
      autoFocus: true,
      // The field opens this sheet on focus. Restoring that focus would reopen it.
      returnFocus: false
    })
    watch(overlayEnabled, (open) => {
      if (!open) return
      nextTick(() => {
        const active =
          sheetRef.value?.querySelector<HTMLElement>('[data-tiger-number-key-active]') ??
          sheetRef.value
        active?.focus()
      })
    })
    useVueBodyScrollLock(overlayEnabled)
    useVueEscapeKey({
      enabled: overlayEnabled,
      onEscape: () => setOpenSafe(false),
      layerRef: sheetRef
    })

    function setOpenSafe(next: boolean) {
      if (!overlayMode.value || effectiveDisabled.value || next === isOpen.value) return
      if (props.open === undefined) innerOpen.value = next
      emit('update:open', next)
    }

    function writeValue(next: string, _payload: NumberKeyboardChangePayload) {
      if (next === currentValue.value) return
      if (props.modelValue === undefined) innerValue.value = next
      emit('update:modelValue', next)
      formItemControl?.onChange(next)
    }

    function focusActiveKey(index: number) {
      nextTick(() => keyRefs.value[index]?.focus())
    }

    function applyKey(key: NumberKeyboardKey) {
      if (effectiveDisabled.value || props.readOnly || key.disabled || key.type === 'empty') return

      const result = applyNumberKeyboardKey(currentValue.value, key, inputOptions.value)
      const payload: NumberKeyboardChangePayload = {
        value: result.nextValue,
        key: key.value,
        action: result.action,
        mode: props.mode
      }
      emit('key-press', key, payload)

      if (result.action === 'confirm') {
        emit('confirm', currentValue.value, { ...payload, value: currentValue.value })
        setOpenSafe(false)
        return
      }

      if (result.action === 'delete') emit('delete', result.nextValue, payload)
      if (result.changed) writeValue(result.nextValue, payload)
    }

    function handleGroupKeyDown(event: KeyboardEvent) {
      if (effectiveDisabled.value) return
      if (
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'Home' ||
        event.key === 'End'
      ) {
        event.preventDefault()
        if (interactive.value.length === 0) return
        activeIndex.value = moveNumberKeyboardIndex(keys.value, activeIndex.value, event.key)
        focusActiveKey(activeIndex.value)
        return
      }
      if (event.key === ' ') {
        event.preventDefault()
        const key = keys.value[activeIndex.value]
        if (key) applyKey(key)
        return
      }
      const physical = resolveNumberKeyboardPhysicalKey(event.key, {
        mode: props.mode,
        decimalSeparator: props.decimalSeparator
      })
      if (!physical) return
      event.preventDefault()
      const match =
        keys.value.find((key) => key.type === physical.type && key.value === physical.value) ??
        ({
          type: physical.type,
          value: physical.value,
          label: physical.value,
          ariaLabel: physical.value
        } as NumberKeyboardKey)
      applyKey(match)
    }

    function handleFocusOut(event: FocusEvent) {
      const next = event.relatedTarget as Node | null
      const root = overlayMode.value ? sheetRef.value : rootRef.value
      if (root && next && root.contains(next)) return
      formItemControl?.onBlur()
      emit('blur', event)
    }

    expose({
      focus: () => (overlayMode.value ? sheetRef.value : rootRef.value)?.focus()
    })

    const rootClasses = computed(() =>
      classNames(numberKeyboardRootClasses, props.className, coerceClassValue(attrs.class))
    )
    const sheetClasses = computed(() =>
      classNames(numberKeyboardSheetClasses, props.className, coerceClassValue(attrs.class))
    )
    const rootStyle = computed(() =>
      mergeStyleValues(props.style, (attrs as Record<string, unknown>).style)
    )

    function renderKeys() {
      return h(
        'div',
        { class: numberKeyboardGridClasses },
        keys.value.map((key, index) =>
          key.type === 'empty'
            ? h('div', {
                key: `${key.type}-${index}`,
                class: numberKeyboardEmptyKeyClasses,
                'aria-hidden': 'true'
              })
            : h(
                'button',
                {
                  key: `${key.type}-${key.value}-${index}`,
                  ref: (el: unknown) => {
                    keyRefs.value[index] = el instanceof HTMLButtonElement ? el : null
                  },
                  type: 'button',
                  tabindex:
                    interactive.value.includes(index) && index === activeIndex.value ? 0 : -1,
                  class: getNumberKeyboardKeyClasses(
                    key,
                    effectiveDisabled.value || !!key.disabled
                  ),
                  disabled: effectiveDisabled.value || !!key.disabled,
                  'aria-disabled': key.disabled || effectiveDisabled.value || undefined,
                  'aria-label': key.ariaLabel,
                  'data-key': key.value,
                  'data-active': index === activeIndex.value ? '' : undefined,
                  'data-tiger-number-key-active':
                    interactive.value.includes(index) && index === activeIndex.value
                      ? ''
                      : undefined,
                  onMousedown: (event: MouseEvent) => {
                    event.preventDefault()
                    ;(overlayMode.value ? sheetRef.value : rootRef.value)?.focus()
                  },
                  onClick: () => {
                    if (key.disabled || props.readOnly) return
                    activeIndex.value = index
                    applyKey(key)
                  }
                },
                key.label
              )
        )
      )
    }

    function renderGroup(sheet: boolean) {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style' && key !== 'id')
      )
      const attrDescribedBy =
        typeof attrs['aria-describedby'] === 'string' ? attrs['aria-describedby'] : undefined
      const attrLabelledby =
        typeof attrs['aria-labelledby'] === 'string' ? attrs['aria-labelledby'] : undefined
      const labelledby = attrLabelledby?.trim() ? attrLabelledby : formItemControl?.labelId.value
      const describedBy = mergeAriaDescribedBy(
        mergeAriaDescribedBy(attrDescribedBy, invalidValue.value ? errorId : undefined),
        formItemControl?.describedBy.value
      )
      const groupTabIndex = effectiveDisabled.value ? -1 : interactive.value.length > 0 ? -1 : 0

      return h(
        'div',
        {
          ...forwardedAttrs,
          ref: sheet ? sheetRef : rootRef,
          class: sheet ? sheetClasses.value : rootClasses.value,
          style: sheet ? undefined : rootStyle.value,
          role: sheet ? 'dialog' : 'group',
          'aria-modal': sheet || undefined,
          id: sheet ? undefined : effectiveId.value,
          tabindex: groupTabIndex,
          'aria-label': labelledby ? undefined : labels.value.ariaLabel,
          'aria-labelledby': labelledby,
          'aria-describedby': describedBy,
          'aria-disabled': effectiveDisabled.value || undefined,
          'aria-invalid': status.value === 'error' || invalidValue.value ? true : undefined,
          'data-tiger-number-keyboard': '',
          onKeydown: (event: KeyboardEvent) => {
            handleGroupKeyDown(event)
            callUnknownEventHandler(forwardedAttrs.onKeydown, event)
          },
          onFocusout: (event: FocusEvent) => {
            handleFocusOut(event)
            callUnknownEventHandler(forwardedAttrs.onFocusout, event)
          }
        },
        [
          !sheet && effectiveName.value
            ? h('input', {
                type: 'hidden',
                name: effectiveName.value,
                value: currentValue.value,
                disabled: effectiveDisabled.value || undefined
              })
            : null,
          sheet ? null : renderInvalidNote(),
          renderKeys()
        ]
      )
    }

    function renderInvalidNote() {
      if (!invalidValue.value) return null
      return h(
        'p',
        {
          id: errorId,
          class: 'px-1 text-xs text-[var(--tiger-error)]',
          'aria-live': 'polite',
          'data-tiger-number-keyboard-error': ''
        },
        labels.value.invalidValueText
      )
    }

    function renderAnchorInput() {
      if (!effectiveName.value && !effectiveId.value) return null
      return h('input', {
        type: 'hidden',
        id: effectiveId.value,
        name: effectiveName.value,
        value: currentValue.value,
        disabled: effectiveDisabled.value || undefined
      })
    }

    return () => {
      if (!overlayMode.value) return renderGroup(false)

      const target = resolveAnchoredOverlayTarget(rootRef.value)
      return h(
        'div',
        { ref: rootRef, class: classNames('contents', props.className), style: rootStyle.value },
        [
          renderAnchorInput(),
          renderInvalidNote(),
          overlayEnabled.value
            ? renderVueOverlayTeleport(
                [
                  h('div', {
                    class: numberKeyboardScrimClasses,
                    onClick: () => setOpenSafe(false)
                  }),
                  renderGroup(true)
                ],
                target
              )
            : null
        ]
      )
    }
  }
})

export default NumberKeyboard
