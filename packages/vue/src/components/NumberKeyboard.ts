import { computed, defineComponent, h, inject, provide, ref, watch, type PropType } from 'vue'
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
  classNames,
  coerceClassValue,
  getNumberKeyboardInteractiveIndexes,
  getNumberKeyboardKeyClasses,
  getNumberKeyboardKeys,
  getNumberKeyboardLabels,
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
import { useTigerConfig } from './ConfigProvider'
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
    readonly: { type: Boolean, default: false },
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
  emits: [
    'update:modelValue',
    'update:open',
    'change',
    'input',
    'open-change',
    'key-press',
    'delete',
    'confirm',
    'blur'
  ],
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

    const innerValue = ref(postNumberKeyboardValue(props.defaultValue, props.mode))
    const innerOpen = ref(props.defaultOpen ?? false)

    const currentValue = computed(() => {
      if (props.modelValue !== undefined)
        return postNumberKeyboardValue(props.modelValue, props.mode)
      if (formItemControl?.value.value !== undefined) {
        return postNumberKeyboardValue(formItemControl.value.value, props.mode)
      }
      return innerValue.value
    })
    const isOpen = computed(() => (props.open !== undefined ? props.open : innerOpen.value))
    const overlayEnabled = computed(
      () => overlayMode.value && isOpen.value && !effectiveDisabled.value
    )

    const keys = computed(() =>
      getNumberKeyboardKeys({
        mode: props.mode,
        decimalSeparator: props.decimalSeparator,
        showConfirm: props.showConfirm,
        labels: labels.value
      })
    )
    const interactive = computed(() => getNumberKeyboardInteractiveIndexes(keys.value))
    const activeIndex = ref(interactive.value[0] ?? 0)

    watch(interactive, (next) => {
      if (!next.includes(activeIndex.value)) activeIndex.value = next[0] ?? 0
    })

    const rootRef = ref<HTMLDivElement | null>(null)
    const sheetRef = ref<HTMLDivElement | null>(null)

    useVueFocusTrap({ enabled: overlayEnabled, containerRef: sheetRef, inert: true })
    useVueBodyScrollLock(overlayEnabled)
    useVueEscapeKey({
      enabled: overlayEnabled,
      onEscape: () => setOpenSafe(false),
      layerRef: sheetRef
    })

    function setOpenSafe(next: boolean) {
      if (!overlayMode.value || effectiveDisabled.value) return
      if (props.open === undefined) innerOpen.value = next
      emit('update:open', next)
      emit('open-change', next)
    }

    function writeValue(next: string, payload: NumberKeyboardChangePayload) {
      if (props.modelValue === undefined) innerValue.value = next
      emit('update:modelValue', next)
      emit('input', next)
      emit('change', next, payload)
      formItemControl?.onChange(next)
    }

    function applyKey(key: NumberKeyboardKey) {
      if (effectiveDisabled.value || props.readonly || key.type === 'empty') return

      const result = applyNumberKeyboardKey(currentValue.value, key, {
        mode: props.mode,
        maxLength: props.maxLength,
        precision: props.precision,
        decimalSeparator: props.decimalSeparator
      })
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
        activeIndex.value = moveNumberKeyboardIndex(keys.value, activeIndex.value, event.key)
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
                  type: 'button',
                  tabindex: -1,
                  class: getNumberKeyboardKeyClasses(key, effectiveDisabled.value),
                  disabled: effectiveDisabled.value,
                  'aria-label': key.ariaLabel,
                  'data-key': key.value,
                  'data-active': index === activeIndex.value ? '' : undefined,
                  onClick: () => {
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
        Object.entries(attrs).filter(
          ([key]) => key !== 'class' && key !== 'style' && key !== 'id' && !key.startsWith('aria-')
        )
      )
      const attrDescribedBy =
        typeof attrs['aria-describedby'] === 'string' ? attrs['aria-describedby'] : undefined
      const attrLabelledby =
        typeof attrs['aria-labelledby'] === 'string' ? attrs['aria-labelledby'] : undefined
      const labelledby = attrLabelledby?.trim() ? attrLabelledby : formItemControl?.labelId.value
      const describedBy = mergeAriaDescribedBy(attrDescribedBy, formItemControl?.describedBy.value)

      return h(
        'div',
        {
          ...forwardedAttrs,
          ref: sheet ? sheetRef : rootRef,
          class: sheet ? sheetClasses.value : rootClasses.value,
          style: sheet ? undefined : rootStyle.value,
          role: sheet ? 'dialog' : 'group',
          'aria-modal': sheet || undefined,
          id: effectiveId.value,
          tabindex: effectiveDisabled.value ? -1 : 0,
          'aria-label': labelledby ? undefined : labels.value.ariaLabel,
          'aria-labelledby': labelledby,
          'aria-describedby': describedBy,
          'aria-disabled': effectiveDisabled.value || undefined,
          'aria-readonly': props.readonly || undefined,
          'aria-invalid': status.value === 'error' ? true : undefined,
          'aria-required': formItemControl?.required.value ? true : undefined,
          'data-tiger-number-keyboard': '',
          onKeydown: handleGroupKeyDown,
          onFocusout: handleFocusOut
        },
        [
          effectiveName.value
            ? h('input', {
                type: 'hidden',
                name: effectiveName.value,
                value: currentValue.value
              })
            : null,
          renderKeys()
        ]
      )
    }

    return () => {
      if (!overlayMode.value) return renderGroup(false)

      const target = resolveAnchoredOverlayTarget(rootRef.value)
      return h('div', { ref: rootRef, class: classNames('contents', props.className) }, [
        effectiveName.value
          ? h('input', { type: 'hidden', name: effectiveName.value, value: currentValue.value })
          : null,
        overlayEnabled.value
          ? renderVueOverlayTeleport(
              [
                h('div', { class: numberKeyboardScrimClasses, onClick: () => setOpenSafe(false) }),
                renderGroup(true)
              ],
              target
            )
          : null
      ])
    }
  }
})

export default NumberKeyboard
