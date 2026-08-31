import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  watch,
  type PropType,
  type CSSProperties
} from 'vue'
import type {
  ColorFormat,
  ComponentSize,
  FloatingPlacement,
  HsvaColor,
  InputStatus,
  TigerLocale,
  TigerLocaleColorPicker
} from '@expcat/tigercat-core'
import {
  applyColorPickerAlpha,
  applyColorPickerHue,
  classNames,
  coerceClassValue,
  colorPickerBaseClasses,
  colorPickerCheckerboardStyle,
  colorPickerChromeLabelClasses,
  colorPickerClearButtonClasses,
  colorPickerHueTrackStyle,
  colorPickerInputClasses,
  colorPickerPanelClasses,
  colorPickerPreviewClasses,
  colorPickerSliderTrackClasses,
  colorPickerSvPlaneClasses,
  colorPickerSvThumbClasses,
  colorPickerTriggerSwatchClasses,
  commitPresetColor,
  createDocumentDragSession,
  cssColorFromHsva,
  formatHsva,
  getColorPickerAlphaTrackStyle,
  getColorPickerFormatLabel,
  getColorPickerLabels,
  getColorPickerSvPlaneStyle,
  getColorPickerTriggerClasses,
  hsvaFromSvPointer,
  isColorPickerEmpty,
  mergeAriaDescribedBy,
  mergeHsvaHue,
  mergeTigerLocale,
  nudgeColorPickerSv,
  parseColorInput,
  parseColorToHsva,
  seedColorPickerHsva,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  SHAKE_CLASS,
  runShakeAnimation
} from '@expcat/tigercat-core'
import {
  renderVueOverlayTeleport,
  useVueAnchoredOverlay,
  useVueBodyScrollLock,
  useVueFocusTrap
} from '../utils/overlay'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { ColorSwatch } from './ColorSwatch'

export type VueColorPickerProps = InstanceType<typeof ColorPicker>['$props']
export type ColorPickerProps = VueColorPickerProps
export type { ColorFormat }

export const ColorPicker = defineComponent({
  name: 'TigerColorPicker',
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    disabled: Boolean,
    size: { type: String as PropType<ComponentSize>, default: 'md' },
    showAlpha: Boolean,
    format: { type: String as PropType<ColorFormat>, default: 'hex' },
    presets: { type: Array as PropType<string[]>, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleColorPicker>>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    closeOnSelect: { type: Boolean, default: true },
    name: String,
    id: String,
    status: { type: String as PropType<InputStatus>, default: undefined },
    placement: { type: String as PropType<FloatingPlacement>, default: 'bottom-start' },
    offset: { type: Number, default: 4 },
    dropdownClassName: String,
    getPopupContainer: { type: Function as PropType<() => HTMLElement | null> },
    className: String
  },
  emits: ['update:modelValue', 'update:open', 'change', 'input', 'open-change', 'blur'],
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    provide(FORM_ITEM_CONTROL_INJECTION_KEY, null)

    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getColorPickerLabels(mergedLocale.value, props.labels))
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const effectiveId = computed(() => props.id ?? formItemControl?.id.value)
    const effectiveName = computed(() => props.name ?? formItemControl?.name.value)

    const innerValue = ref(props.defaultValue)
    const innerOpen = ref(props.defaultOpen)
    const dragging = ref(false)

    watch(
      () => props.modelValue,
      (value) => {
        if (value !== undefined) innerValue.value = value
      }
    )

    const committed = computed(() => {
      if (props.modelValue !== undefined) return props.modelValue
      if (formItemControl?.value.value !== undefined) {
        return formItemControl.value.value as string | undefined
      }
      return innerValue.value
    })
    const isOpen = computed(() => (props.open !== undefined ? props.open : innerOpen.value))

    const hsva = ref<HsvaColor>(seedColorPickerHsva(committed.value))
    const inputValue = ref(
      isColorPickerEmpty(committed.value)
        ? ''
        : formatHsva(seedColorPickerHsva(committed.value), props.format, props.showAlpha)
    )

    watch(
      () => [committed.value, props.format, props.showAlpha] as const,
      () => {
        if (dragging.value) return
        const parsed = parseColorToHsva(committed.value)
        if (parsed) {
          hsva.value = mergeHsvaHue(hsva.value, parsed)
          inputValue.value = formatHsva(parsed, props.format, props.showAlpha)
          return
        }
        if (isColorPickerEmpty(committed.value)) inputValue.value = ''
      }
    )

    const rootRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLButtonElement | null>(null)
    const panelRef = ref<HTMLElement | null>(null)
    const svRef = ref<HTMLElement | null>(null)
    const panelId = `tiger-colorpicker-panel-${Math.random().toString(36).slice(2, 9)}`
    let dragDispose: (() => void) | undefined

    const overlay = useVueAnchoredOverlay({
      enabled: isOpen,
      referenceRef: triggerRef,
      floatingRef: panelRef,
      containerRef: rootRef,
      placement: () => props.placement ?? 'bottom-start',
      offset: () => props.offset ?? 4,
      layout: 'fullscreen-sm',
      dismissOnOutside: true,
      dismissOnEscape: true,
      restoreFocusOnDismiss: true,
      getContainer: () => props.getPopupContainer?.() ?? null,
      onDismiss: () => {
        setOpenSafe(false)
        window.setTimeout(() => triggerRef.value?.focus(), 0)
      }
    })
    useVueFocusTrap({ enabled: isOpen, containerRef: panelRef, inert: true })
    useVueBodyScrollLock(isOpen)

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      () => {
        if (status.value === 'error') runShakeAnimation(rootRef.value)
      }
    )

    watch(isOpen, (open) => {
      if (!open) return
      nextTick(() => svRef.value?.focus())
    })

    onBeforeUnmount(() => dragDispose?.())

    function writeCommitted(next: string) {
      if (props.modelValue === undefined) innerValue.value = next
      emit('update:modelValue', next)
      emit('input', next)
      emit('change', next)
      formItemControl?.onChange(next)
    }

    function setOpenSafe(next: boolean) {
      if (effectiveDisabled.value) return
      if (props.open === undefined) innerOpen.value = next
      emit('update:open', next)
      emit('open-change', next)
    }

    function commitHsva(next: HsvaColor) {
      hsva.value = next
      const formatted = formatHsva(next, props.format, props.showAlpha)
      inputValue.value = formatted
      writeCommitted(formatted)
    }

    const hasValue = computed(() => !isColorPickerEmpty(committed.value))
    const showClear = computed(() => props.clearable && hasValue.value && !effectiveDisabled.value)
    const displayColor = computed(() => cssColorFromHsva(hsva.value, props.showAlpha))

    function handleTriggerKeydown(event: KeyboardEvent) {
      if (effectiveDisabled.value) return
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault()
        setOpenSafe(!isOpen.value)
      } else if (event.key === 'Escape' && isOpen.value) {
        event.preventDefault()
        setOpenSafe(false)
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && showClear.value) {
        event.preventDefault()
        writeCommitted('')
        inputValue.value = ''
      }
    }

    function handleFocusout(event: FocusEvent) {
      const next = event.relatedTarget as Node | null
      if (
        (rootRef.value && next && rootRef.value.contains(next)) ||
        (panelRef.value && next && panelRef.value.contains(next))
      ) {
        return
      }
      formItemControl?.onBlur()
      emit('blur', event)
    }

    function startSvDrag(event: PointerEvent) {
      if (effectiveDisabled.value) return
      event.preventDefault()
      const plane = svRef.value
      if (!plane) return
      dragging.value = true
      const apply = (clientX: number, clientY: number) => {
        commitHsva(
          hsvaFromSvPointer(
            clientX,
            clientY,
            plane.getBoundingClientRect(),
            hsva.value.h,
            hsva.value.a
          )
        )
      }
      apply(event.clientX, event.clientY)
      dragDispose?.()
      const session = createDocumentDragSession({
        startX: event.clientX,
        startY: event.clientY,
        pointerId: event.pointerId,
        pointerTarget: plane,
        dragThreshold: 0,
        onMove: (payload) => apply(payload.currentX, payload.currentY),
        onEnd: () => {
          dragging.value = false
          dragDispose = undefined
        }
      })
      dragDispose = session.dispose
    }

    function handleSvKeydown(event: KeyboardEvent) {
      const step = event.shiftKey ? 10 : 2
      let next: HsvaColor | null = null
      if (event.key === 'ArrowRight') next = nudgeColorPickerSv(hsva.value, step, 0)
      else if (event.key === 'ArrowLeft') next = nudgeColorPickerSv(hsva.value, -step, 0)
      else if (event.key === 'ArrowUp') next = nudgeColorPickerSv(hsva.value, 0, step)
      else if (event.key === 'ArrowDown') next = nudgeColorPickerSv(hsva.value, 0, -step)
      if (!next) return
      event.preventDefault()
      commitHsva(next)
    }

    function handlePreset(color: string) {
      const formatted = commitPresetColor(color, hsva.value, props.format, props.showAlpha)
      if (!formatted) return
      const next = parseColorToHsva(formatted)
      if (next) hsva.value = next
      inputValue.value = formatted
      writeCommitted(formatted)
      if (props.closeOnSelect) setOpenSafe(false)
    }

    expose({
      focus: () => triggerRef.value?.focus(),
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

      const triggerSwatchStyle: CSSProperties = {
        ...colorPickerCheckerboardStyle
      }
      if (hasValue.value) {
        triggerSwatchStyle.boxShadow = `inset 0 0 0 999px ${displayColor.value}`
      }

      const panel = isOpen.value
        ? renderVueOverlayTeleport(
            h(
              'div',
              {
                ref: panelRef,
                id: panelId,
                role: 'dialog',
                'aria-modal': 'true',
                'aria-label': labels.value.panelTitle,
                class: classNames(
                  colorPickerPanelClasses,
                  overlay.floatingClasses.value,
                  props.dropdownClassName
                ),
                style: overlay.floatingStyles.value,
                'data-positioned': overlay.positioned.value,
                'data-tiger-colorpicker-panel': '',
                onFocusout: handleFocusout
              },
              [
                h('div', { class: 'flex items-center justify-between gap-2' }, [
                  h(
                    'span',
                    { class: 'text-xs font-medium text-[var(--tiger-text,#111827)]' },
                    labels.value.panelTitle
                  ),
                  showClear.value
                    ? h(
                        'button',
                        {
                          type: 'button',
                          class: colorPickerClearButtonClasses,
                          'data-tiger-colorpicker-clear': '',
                          onClick: () => {
                            writeCommitted('')
                            inputValue.value = ''
                          }
                        },
                        labels.value.clear
                      )
                    : null
                ]),
                h(
                  'div',
                  {
                    ref: svRef,
                    class: colorPickerSvPlaneClasses,
                    style: getColorPickerSvPlaneStyle(hsva.value.h),
                    role: 'slider',
                    tabindex: effectiveDisabled.value ? -1 : 0,
                    'aria-label': `${labels.value.saturation}, ${labels.value.brightness}`,
                    'aria-valuemin': 0,
                    'aria-valuemax': 100,
                    'aria-valuenow': Math.round(hsva.value.s),
                    'aria-valuetext': `${labels.value.saturation} ${Math.round(hsva.value.s)}, ${labels.value.brightness} ${Math.round(hsva.value.v)}`,
                    'data-tiger-colorpicker-sv': '',
                    onPointerdown: startSvDrag,
                    onKeydown: handleSvKeydown
                  },
                  [
                    h('span', {
                      class: colorPickerSvThumbClasses,
                      style: { left: `${hsva.value.s}%`, top: `${100 - hsva.value.v}%` },
                      'aria-hidden': 'true'
                    })
                  ]
                ),
                h('div', [
                  h('label', { class: colorPickerChromeLabelClasses }, labels.value.hue),
                  h('input', {
                    type: 'range',
                    min: 0,
                    max: 360,
                    value: Math.round(hsva.value.h),
                    class: colorPickerSliderTrackClasses,
                    style: colorPickerHueTrackStyle,
                    'aria-label': labels.value.hue,
                    disabled: effectiveDisabled.value,
                    onInput: (event: Event) => {
                      dragging.value = true
                      commitHsva(
                        applyColorPickerHue(
                          hsva.value,
                          Number((event.target as HTMLInputElement).value)
                        )
                      )
                      dragging.value = false
                    }
                  })
                ]),
                props.showAlpha
                  ? h('div', [
                      h('label', { class: colorPickerChromeLabelClasses }, labels.value.alpha),
                      h('input', {
                        type: 'range',
                        min: 0,
                        max: 100,
                        value: Math.round(hsva.value.a * 100),
                        class: colorPickerSliderTrackClasses,
                        style: getColorPickerAlphaTrackStyle(hsva.value),
                        'aria-label': labels.value.alpha,
                        disabled: effectiveDisabled.value,
                        onInput: (event: Event) => {
                          dragging.value = true
                          commitHsva(
                            applyColorPickerAlpha(
                              hsva.value,
                              Number((event.target as HTMLInputElement).value) / 100
                            )
                          )
                          dragging.value = false
                        }
                      })
                    ])
                  : null,
                h('div', [
                  h(
                    'label',
                    { class: classNames(colorPickerChromeLabelClasses, 'uppercase') },
                    getColorPickerFormatLabel(props.format, labels.value)
                  ),
                  h('input', {
                    type: 'text',
                    class: colorPickerInputClasses,
                    value: inputValue.value,
                    'aria-label': labels.value.value,
                    disabled: effectiveDisabled.value,
                    onInput: (event: Event) => {
                      const raw = (event.target as HTMLInputElement).value
                      inputValue.value = raw
                      const parsed = parseColorInput(raw, props.format, props.showAlpha)
                      if (!parsed) return
                      const next = parseColorToHsva(parsed)
                      if (!next) return
                      hsva.value = next
                      writeCommitted(parsed)
                    }
                  })
                ]),
                h('div', { class: 'flex items-center gap-2' }, [
                  h('div', {
                    class: colorPickerPreviewClasses,
                    style: {
                      ...colorPickerCheckerboardStyle,
                      boxShadow: `inset 0 0 0 999px ${displayColor.value}`
                    },
                    role: 'img',
                    'aria-hidden': 'true'
                  }),
                  h(
                    'span',
                    { class: 'text-xs font-mono text-[var(--tiger-text,#111827)]' },
                    hasValue.value ? formatHsva(hsva.value, props.format, props.showAlpha) : ''
                  )
                ]),
                props.presets && props.presets.length > 0
                  ? h(ColorSwatch, {
                      colors: props.presets,
                      modelValue: hasValue.value ? formatHsva(hsva.value, 'hex', false) : undefined,
                      columns: Math.min(8, props.presets.length),
                      size: 'sm',
                      ariaLabel: labels.value.swatches,
                      onChange: (color: string) => handlePreset(color)
                    })
                  : null,
                h('div', { class: selectDoneActionClasses }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: selectDoneButtonClasses,
                      onClick: () => setOpenSafe(false)
                    },
                    labels.value.done
                  )
                ])
              ]
            ),
            overlay.target.value
          )
        : null

      return h(
        'div',
        {
          ref: rootRef,
          class: classNames(
            colorPickerBaseClasses,
            props.className,
            coerceClassValue(attrs.class),
            status.value === 'error' ? SHAKE_CLASS : undefined
          ),
          onFocusout: handleFocusout
        },
        [
          effectiveName.value
            ? h('input', {
                type: 'hidden',
                name: effectiveName.value,
                value: hasValue.value ? (committed.value ?? '') : ''
              })
            : null,
          h(
            'button',
            {
              ref: triggerRef,
              type: 'button',
              id: effectiveId.value,
              class: getColorPickerTriggerClasses(
                props.size,
                effectiveDisabled.value,
                status.value
              ),
              'data-tiger-colorpicker-trigger': '',
              'aria-label': labelledby ? undefined : labels.value.trigger,
              'aria-labelledby': labelledby,
              'aria-describedby': describedBy,
              title: labels.value.trigger,
              'aria-haspopup': 'dialog',
              'aria-expanded': isOpen.value,
              'aria-controls': isOpen.value ? panelId : undefined,
              'aria-invalid': status.value === 'error' ? true : undefined,
              'aria-required': formItemControl?.required.value || undefined,
              disabled: effectiveDisabled.value,
              onClick: () => setOpenSafe(!isOpen.value),
              onKeydown: handleTriggerKeydown
            },
            [h('span', { class: colorPickerTriggerSwatchClasses, style: triggerSwatchStyle })]
          ),
          panel
        ]
      )
    }
  }
})

export default ColorPicker
