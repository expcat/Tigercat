import {
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  useId,
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
  COLOR_PICKER_INVALID_VALUE_TEXT,
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
  DEFAULT_COLOR_PICKER_HSVA,
  describeColorPickerValue,
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
  parseColorToHsva,
  resolveColorPickerDrag,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  SHAKE_CLASS,
  runShakeAnimation,
  submittedColorPickerValue
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
    modelValue: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
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
  emits: ['update:modelValue', 'update:open', 'blur'],
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

    const innerValue = ref<string | null | undefined>(props.defaultValue)
    const innerOpen = ref(props.defaultOpen)
    const textDirty = ref(false)
    const inputInvalid = ref(false)

    watch(
      () => props.modelValue,
      (value) => {
        if (value !== undefined) innerValue.value = value
      }
    )

    const committed = computed(() => {
      if (props.modelValue !== undefined) return props.modelValue
      if (formItemControl?.value.value !== undefined) {
        return formItemControl.value.value as string | null | undefined
      }
      return innerValue.value
    })
    const isOpen = computed(() => (props.open !== undefined ? props.open : innerOpen.value))
    const locked = computed(() => props.readOnly)

    const described = describeColorPickerValue(committed.value, props.format, props.showAlpha)
    const baseHsva = ref<HsvaColor | null>(described.hsva)
    const previewHsva = ref<HsvaColor | null>(null)
    const inputValue = ref(described.text)
    inputInvalid.value = described.invalid

    const editingHsva = computed(
      () => previewHsva.value ?? baseHsva.value ?? { ...DEFAULT_COLOR_PICKER_HSVA }
    )
    const paintableHsva = computed(() =>
      isColorPickerEmpty(committed.value) ? null : baseHsva.value
    )

    watch(
      () => [committed.value, props.format, props.showAlpha] as const,
      () => {
        if (previewHsva.value) return
        if (textDirty.value && isColorPickerEmpty(committed.value)) return
        const next = describeColorPickerValue(committed.value, props.format, props.showAlpha)
        baseHsva.value = next.hsva
          ? mergeHsvaHue(baseHsva.value, next.hsva)
          : null
        if (next.hsva) {
          inputValue.value = next.text
          inputInvalid.value = false
          textDirty.value = false
          return
        }
        if (committed.value == null || String(committed.value).trim() === '') {
          if (!textDirty.value) {
            inputValue.value = ''
            inputInvalid.value = false
          }
          return
        }
        inputValue.value = next.text
        inputInvalid.value = true
        textDirty.value = false
      }
    )

    const rootRef = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLButtonElement | null>(null)
    const panelRef = ref<HTMLElement | null>(null)
    const svRef = ref<HTMLElement | null>(null)
    const panelId = `tiger-colorpicker-${useId()}`
    const inputErrorId = `${panelId}-error`
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

    function writeCommitted(next: string | null) {
      if (effectiveDisabled.value || locked.value) return
      const current = committed.value ?? null
      if (current === next) return
      if (isColorPickerEmpty(current) && (next == null || next === '')) return
      if (props.modelValue === undefined) innerValue.value = next
      emit('update:modelValue', next)
      formItemControl?.onChange(next)
    }

    function setOpenSafe(next: boolean) {
      if (effectiveDisabled.value || next === isOpen.value) return
      if (props.open === undefined) innerOpen.value = next
      emit('update:open', next)
    }

    function previewHsvaValue(next: HsvaColor) {
      if (effectiveDisabled.value || locked.value) return
      previewHsva.value = resolveColorPickerDrag(
        'preview',
        next,
        props.format,
        props.showAlpha
      ).hsva
    }

    function commitHsva(next: HsvaColor) {
      if (effectiveDisabled.value || locked.value) return
      const resolved = resolveColorPickerDrag('commit', next, props.format, props.showAlpha)
      previewHsva.value = null
      baseHsva.value = resolved.hsva
      inputValue.value = resolved.value ?? ''
      inputInvalid.value = false
      textDirty.value = false
      writeCommitted(resolved.value)
    }

    function commitTextDraft() {
      if (effectiveDisabled.value || locked.value) return
      const raw = inputValue.value
      if (raw.trim() === '') {
        textDirty.value = false
        inputInvalid.value = false
        baseHsva.value = null
        previewHsva.value = null
        writeCommitted(null)
        return
      }
      const parsed = parseColorToHsva(raw)
      if (!parsed) {
        textDirty.value = true
        inputInvalid.value = true
        previewHsva.value = null
        baseHsva.value = null
        writeCommitted(null)
        return
      }
      commitHsva(mergeHsvaHue(baseHsva.value, parsed))
    }

    const hasValue = computed(() => paintableHsva.value != null)
    const showClear = computed(
      () => props.clearable && hasValue.value && !effectiveDisabled.value && !locked.value
    )
    const displayColor = computed(() =>
      paintableHsva.value ? cssColorFromHsva(paintableHsva.value, props.showAlpha) : ''
    )
    const previewColor = computed(() => {
      if (previewHsva.value) return cssColorFromHsva(previewHsva.value, props.showAlpha)
      return displayColor.value
    })

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
        textDirty.value = false
        inputInvalid.value = false
        inputValue.value = ''
        baseHsva.value = null
        previewHsva.value = null
        writeCommitted(null)
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
      if (effectiveDisabled.value || locked.value) return
      event.preventDefault()
      const plane = svRef.value
      if (!plane) return
      const apply = (clientX: number, clientY: number) => {
        previewHsvaValue(
          hsvaFromSvPointer(
            clientX,
            clientY,
            plane.getBoundingClientRect(),
            editingHsva.value.h,
            editingHsva.value.a
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
          const pending = previewHsva.value
          dragDispose = undefined
          if (pending) commitHsva(pending)
        }
      })
      dragDispose = session.dispose
    }

    function handleSvKeydown(event: KeyboardEvent) {
      if (locked.value) return
      const step = event.shiftKey ? 10 : 2
      const current = editingHsva.value
      let next: HsvaColor | null = null
      if (event.key === 'ArrowRight') next = nudgeColorPickerSv(current, step, 0)
      else if (event.key === 'ArrowLeft') next = nudgeColorPickerSv(current, -step, 0)
      else if (event.key === 'ArrowUp') next = nudgeColorPickerSv(current, 0, step)
      else if (event.key === 'ArrowDown') next = nudgeColorPickerSv(current, 0, -step)
      if (!next) return
      event.preventDefault()
      commitHsva(next)
    }

    function sliderHsva(kind: 'hue' | 'alpha', raw: string): HsvaColor {
      const current = editingHsva.value
      return kind === 'hue'
        ? applyColorPickerHue(current, Number(raw))
        : applyColorPickerAlpha(current, Number(raw) / 100)
    }

    function handlePreset(color: string) {
      if (locked.value) return
      const formatted = commitPresetColor(color, editingHsva.value, props.format, props.showAlpha)
      if (!formatted) return
      const next = parseColorToHsva(formatted)
      if (!next) return
      commitHsva(next)
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
                    { class: 'text-xs font-medium text-[var(--tiger-text)]' },
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
                            textDirty.value = false
                            inputInvalid.value = false
                            inputValue.value = ''
                            baseHsva.value = null
                            previewHsva.value = null
                            writeCommitted(null)
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
                    style: getColorPickerSvPlaneStyle(editingHsva.value.h),
                    role: 'slider',
                    tabindex: effectiveDisabled.value ? -1 : 0,
                    'aria-label': `${labels.value.saturation}, ${labels.value.brightness}`,
                    'aria-valuemin': 0,
                    'aria-valuemax': 100,
                    'aria-valuenow': Math.round(editingHsva.value.s),
                    'aria-valuetext': `${labels.value.saturation} ${Math.round(editingHsva.value.s)}, ${labels.value.brightness} ${Math.round(editingHsva.value.v)}`,
                    'aria-readonly': locked.value || undefined,
                    'data-tiger-colorpicker-sv': '',
                    onPointerdown: startSvDrag,
                    onKeydown: handleSvKeydown
                  },
                  [
                    h('span', {
                      class: colorPickerSvThumbClasses,
                      style: { left: `${editingHsva.value.s}%`, top: `${100 - editingHsva.value.v}%` },
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
                    value: Math.round(editingHsva.value.h),
                    class: colorPickerSliderTrackClasses,
                    style: colorPickerHueTrackStyle,
                    'aria-label': labels.value.hue,
                    'aria-readonly': locked.value || undefined,
                    disabled: effectiveDisabled.value,
                    onInput: (event: Event) => {
                      previewHsvaValue(
                        sliderHsva('hue', (event.target as HTMLInputElement).value)
                      )
                    },
                    onChange: (event: Event) => {
                      commitHsva(sliderHsva('hue', (event.target as HTMLInputElement).value))
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
                        value: Math.round(editingHsva.value.a * 100),
                        class: colorPickerSliderTrackClasses,
                        style: getColorPickerAlphaTrackStyle(editingHsva.value),
                        'aria-label': labels.value.alpha,
                        'aria-readonly': locked.value || undefined,
                        disabled: effectiveDisabled.value,
                        onInput: (event: Event) => {
                          previewHsvaValue(
                            sliderHsva('alpha', (event.target as HTMLInputElement).value)
                          )
                        },
                        onChange: (event: Event) => {
                          commitHsva(sliderHsva('alpha', (event.target as HTMLInputElement).value))
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
                    class: classNames(
                      colorPickerInputClasses,
                      inputInvalid.value && 'border-[var(--tiger-error)]'
                    ),
                    value: inputValue.value,
                    'aria-label': labels.value.value,
                    'aria-invalid': inputInvalid.value || undefined,
                    'aria-describedby': inputInvalid.value ? inputErrorId : undefined,
                    disabled: effectiveDisabled.value,
                    readonly: locked.value,
                    onInput: (event: Event) => {
                      if (locked.value) return
                      const raw = (event.target as HTMLInputElement).value
                      textDirty.value = true
                      inputValue.value = raw
                      inputInvalid.value = raw.trim() !== '' && parseColorToHsva(raw) == null
                    },
                    onBlur: () => commitTextDraft(),
                    onKeydown: (event: KeyboardEvent) => {
                      if (event.key !== 'Enter') return
                      event.preventDefault()
                      commitTextDraft()
                    }
                  }),
                  inputInvalid.value
                    ? h(
                        'p',
                        {
                          id: inputErrorId,
                          class: 'text-xs text-[var(--tiger-error)]',
                          'aria-live': 'polite'
                        },
                        COLOR_PICKER_INVALID_VALUE_TEXT
                      )
                    : null
                ]),
                h('div', { class: 'flex items-center gap-2' }, [
                  h('div', {
                    class: colorPickerPreviewClasses,
                    style: {
                      ...colorPickerCheckerboardStyle,
                      ...(previewColor.value
                        ? { boxShadow: `inset 0 0 0 999px ${previewColor.value}` }
                        : null)
                    },
                    role: 'img',
                    'aria-hidden': 'true'
                  }),
                  h(
                    'span',
                    { class: 'text-xs font-mono text-[var(--tiger-text)]' },
                    previewHsva.value
                      ? formatHsva(previewHsva.value, props.format, props.showAlpha)
                      : hasValue.value
                        ? formatHsva(paintableHsva.value!, props.format, props.showAlpha)
                        : ''
                  )
                ]),
                props.presets && props.presets.length > 0
                  ? h(ColorSwatch, {
                      colors: props.presets,
                      modelValue: hasValue.value
                        ? formatHsva(paintableHsva.value!, props.format, props.showAlpha)
                        : undefined,
                      columns: Math.min(8, props.presets.length),
                      size: 'sm',
                      readOnly: locked.value,
                      ariaLabel: labels.value.swatches,
                      'onUpdate:modelValue': (color: string) => handlePreset(color)
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
                value: submittedColorPickerValue(committed.value),
                disabled: effectiveDisabled.value || undefined
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
              'aria-controls': panelId,
              'aria-readonly': locked.value || undefined,
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
