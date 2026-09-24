import {
  defineComponent,
  computed,
  ref,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  watch,
  type PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  coerceSliderFormValue,
  callUnknownEventHandler,
  type ComponentSize,
  type InputStatus,
  sliderRangeClasses,
  sliderHitAreaClasses,
  getSliderRootClasses,
  getSliderTrackClasses,
  getSliderThumbClasses,
  getSliderTooltipClasses,
  sliderGetPercentage,
  sliderGetValueFromClientX,
  sliderGetKeyboardValue,
  sliderGetValueFromClientY,
  sliderPushApartRange,
  formatSliderTooltip,
  sliderResolveMarks,
  sliderValuesEqual,
  sliderApplyThumbValue,
  sliderPickRangeThumb,
  sliderThumbInsetStyle,
  sliderRangeFillStyle,
  sliderSortRange,
  sliderDisplayValue,
  sliderBounds,
  shouldSubmitNativeField,
  resolveSliderThumbName,
  getSliderLabels,
  mergeAriaDescribedBy,
  resolveFormItemSeed,
  runShakeAnimation,
  mergeStyleValues,
  createDocumentDragSession,
  getElementTextDirection,
  type DocumentDragSession
} from '@expcat/tigercat-core'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { useTigerConfig } from './ConfigProvider'

export interface VueSliderProps {
  modelValue?: number | string | [number, number] | null
  defaultValue?: number | string | [number, number]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  marks?: boolean | Record<number, string>
  tooltip?: boolean
  size?: ComponentSize
  range?: boolean
  status?: InputStatus
  name?: string
  className?: string
  style?: Record<string, string | number>
}

function displaySliderValue(
  value: number | [number, number] | null,
  range: boolean,
  min: number,
  max: number
): number | [number, number] {
  const { lower, upper } = sliderBounds(min, max)
  if (range) {
    const tuple = Array.isArray(value) ? value : [lower, upper]
    return sliderSortRange([
      sliderDisplayValue(tuple[0], min, max),
      sliderDisplayValue(tuple[1], min, max)
    ])
  }
  const numeric = typeof value === 'number' ? value : lower
  return sliderDisplayValue(numeric, min, max)
}

export const Slider = defineComponent({
  name: 'TigerSlider',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Number, String, Array] as PropType<number | string | [number, number] | null>
    },
    defaultValue: {
      type: [Number, Array] as PropType<number | [number, number]>
    },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    vertical: { type: Boolean, default: false },
    pushApart: { type: Boolean, default: false },
    showRange: { type: Boolean, default: true },
    showInput: { type: Boolean, default: false },
    formatTooltip: { type: Function as PropType<(value: number) => string>, default: undefined },
    marks: {
      type: [Boolean, Object] as PropType<boolean | Record<number, string>>,
      default: false
    },
    tooltip: { type: Boolean, default: true },
    size: {
      type: String as PropType<ComponentSize>,
      default: 'md' as ComponentSize
    },
    range: { type: Boolean, default: false },
    status: { type: String as PropType<InputStatus> },
    name: { type: String },
    className: { type: String },
    style: { type: Object as PropType<Record<string, string | number>> }
  },
  emits: {
    'update:modelValue': (value: number | [number, number]) =>
      typeof value === 'number' || Array.isArray(value)
  },
  setup(props, { emit, attrs, expose }) {
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const config = useTigerConfig()
    const labels = computed(() => getSliderLabels(config.value.locale))

    const resolveBoundValue = (): number | [number, number] | null | undefined => {
      if (props.modelValue !== undefined) {
        if (props.modelValue === null) return null
        const coerced = coerceSliderFormValue(props.modelValue, props.range)
        return coerced
      }
      if (!formItemControl?.name.value) return undefined
      return (
        resolveFormItemSeed(
          undefined,
          formItemControl.name.value,
          formItemControl.value.value,
          (raw) => coerceSliderFormValue(raw, props.range)
        ) ?? null
      )
    }

    const isControlled = computed(() => resolveBoundValue() !== undefined)
    const initialBound = resolveBoundValue()
    const internalValue = ref<number | [number, number]>(
      (Array.isArray(initialBound)
        ? [initialBound[0], initialBound[1]]
        : initialBound) ??
        (Array.isArray(props.defaultValue)
          ? [props.defaultValue[0], props.defaultValue[1]]
          : props.defaultValue) ??
        (props.range ? [props.min, props.max] : props.min)
    )
    const preview = ref<number | [number, number] | null>(null)
    const currentValue = computed<number | [number, number]>(() => {
      const bound = resolveBoundValue()
      if (bound === undefined) return internalValue.value
      if (bound === null) {
        return props.range ? [props.min, props.max] : props.min
      }
      if (Array.isArray(bound)) return [bound[0], bound[1]]
      return bound
    })
    const displayed = computed(() =>
      displaySliderValue(preview.value ?? currentValue.value, props.range, props.min, props.max)
    )

    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )

    const isDragging = ref(false)
    const activeThumb = ref<'min' | 'max' | null>(null)
    const showTooltip = ref(false)
    const focusedThumb = ref<'min' | 'max' | 'single' | null>(null)
    const trackElement = ref<HTMLElement | null>(null)
    const rootElement = ref<HTMLElement | null>(null)
    const thumbElement = ref<HTMLElement | null>(null)

    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      ([nextStatus], oldValue) => {
        if (oldValue === undefined) return
        if (nextStatus === 'error') runShakeAnimation(rootElement.value)
      },
      { flush: 'post' }
    )
    let dragSession: DocumentDragSession | null = null
    let activeThumbLive: 'min' | 'max' | null = null

    expose({
      focus: () => thumbElement.value?.focus(),
      el: rootElement
    })

    const commit = (next: number | [number, number]) => {
      if (sliderValuesEqual(currentValue.value, next) && preview.value === null) return
      preview.value = null
      if (props.modelValue === undefined && !formItemControl?.name.value) internalValue.value = next
      emit('update:modelValue', next)
      formItemControl?.onChange(next)
    }

    const elementDir = ref<'ltr' | 'rtl' | null>(null)
    const readDirection = () => {
      const closest = rootElement.value?.closest('[dir]')
      const attr = closest?.getAttribute('dir')
      if (attr === 'rtl' || attr === 'ltr') {
        elementDir.value = attr
        return
      }
      elementDir.value = null
    }
    onMounted(readDirection)
    watch(() => config.value.direction, readDirection)
    const rtl = computed(
      () => (elementDir.value ?? (config.value.direction === 'rtl' ? 'rtl' : 'ltr')) === 'rtl'
    )

    const stopDrag = () => {
      dragSession?.dispose()
      dragSession = null
      isDragging.value = false
      activeThumb.value = null
      activeThumbLive = null
      showTooltip.value = false
    }

    onBeforeUnmount(stopDrag)

    const handlePointerDown = (event: PointerEvent, thumb: 'min' | 'max' | null) => {
      callUnknownEventHandler(attrs.onPointerdown, event)
      if (event.defaultPrevented || effectiveDisabled.value || props.readOnly) return
      if (event.button !== 0) return
      event.preventDefault()
      const track = trackElement.value
      if (!track) return
      const rect = track.getBoundingClientRect()
      const isRtl = getElementTextDirection(track) === 'rtl'
      const pointerValue = sliderGetValueFromClientX(
        event.clientX,
        rect,
        props.min,
        props.max,
        props.step,
        isRtl
      )
      const current = displayed.value
      const which =
        props.range && Array.isArray(current)
          ? (thumb ?? sliderPickRangeThumb(current, pointerValue))
          : null
      activeThumbLive = which
      activeThumb.value = which
      isDragging.value = true
      if (props.tooltip) showTooltip.value = true
      preview.value = sliderApplyThumbValue(current, pointerValue, which, props.range)
      ;(event.currentTarget as HTMLElement).focus()

      dragSession?.dispose()
      dragSession = createDocumentDragSession({
        startX: event.clientX,
        startY: event.clientY,
        ownerDocument: (event.currentTarget as HTMLElement).ownerDocument,
        pointerId: event.pointerId,
        pointerTarget: event.currentTarget as Element,
        onMove: ({ event: moveEvent, currentX }) => {
          if (moveEvent.cancelable) moveEvent.preventDefault()
          const box = trackElement.value?.getBoundingClientRect()
          if (!box) return
          const dir = getElementTextDirection(trackElement.value) === 'rtl'
          const moved = sliderGetValueFromClientX(
            currentX,
            box,
            props.min,
            props.max,
            props.step,
            dir
          )
          preview.value = sliderApplyThumbValue(
            preview.value ?? displayed.value,
            moved,
            activeThumbLive,
            props.range
          )
        },
        onEnd: () => {
          if (preview.value !== null) commit(preview.value)
          stopDrag()
        }
      })
    }

    return () => {
      const { class: _class, style: _style, onPointerdown: _onPointerdown, ...restAttrs } = attrs
      const ariaLabel =
        typeof restAttrs['aria-label'] === 'string'
          ? (restAttrs['aria-label'] as string)
          : undefined
      const attrLabelledby =
        typeof restAttrs['aria-labelledby'] === 'string'
          ? (restAttrs['aria-labelledby'] as string)
          : undefined
      const labelledby = attrLabelledby?.trim() ? attrLabelledby : formItemControl?.labelId.value
      const describedBy = mergeAriaDescribedBy(
        typeof restAttrs['aria-describedby'] === 'string'
          ? (restAttrs['aria-describedby'] as string)
          : undefined,
        formItemControl?.describedBy.value
      )
      const attrId = typeof restAttrs.id === 'string' ? restAttrs.id : undefined
      const effectiveId = attrId ?? formItemControl?.id.value
      const directionRtl = rtl.value
      const bounds = sliderBounds(props.min, props.max)
      const getPercentage = (val: number) => sliderGetPercentage(val, props.min, props.max)
      const current = displayed.value
      const rangeStyles = (() => {
        if (props.range && Array.isArray(current)) {
          return sliderRangeFillStyle(
            getPercentage(current[0]),
            getPercentage(current[1]),
            directionRtl
          )
        }
        const val = typeof current === 'number' ? current : current[0]
        return sliderRangeFillStyle(0, getPercentage(val), directionRtl)
      })()
      const thumbClasses = getSliderThumbClasses(
        props.size,
        effectiveDisabled.value,
        isDragging.value,
        status.value
      )
      const tooltipClasses = getSliderTooltipClasses(props.size)
      const marksObj = sliderResolveMarks(props.marks, props.min, props.max, props.step)

      const createThumb = (
        value: number,
        thumbType: 'min' | 'max' | null,
        name: { ariaLabel?: string; ariaLabelledby?: string; suffix?: string },
        thumbId?: string
      ) => {
        const focused =
          (thumbType === 'min' && focusedThumb.value === 'min') ||
          (thumbType === 'max' && focusedThumb.value === 'max') ||
          (thumbType === null && focusedThumb.value === 'single')
        const showThumbTooltip =
          props.tooltip &&
          (thumbType === null
            ? showTooltip.value || focused || isDragging.value
            : focused || (isDragging.value && activeThumb.value === thumbType))
        const zIndex =
          activeThumb.value && thumbType ? (activeThumb.value === thumbType ? 2 : 1) : undefined

        return h(
          'div',
          {
            ref: thumbType === null ? thumbElement : undefined,
            id: thumbId,
            class: thumbClasses,
            style: { ...sliderThumbInsetStyle(getPercentage(value), directionRtl), zIndex },
            tabindex: effectiveDisabled.value ? -1 : 0,
            role: 'slider',
            'aria-valuenow': value,
            'aria-valuemin': bounds.lower,
            'aria-valuemax': bounds.upper,
            'aria-orientation': 'horizontal',
            'aria-disabled': effectiveDisabled.value || undefined,
            'aria-invalid': status.value === 'error' || undefined,
            'aria-label': name.suffix ? undefined : name.ariaLabel,
            'aria-labelledby': name.suffix
              ? `${name.ariaLabelledby ?? ''} ${thumbId ?? ''}-suffix`.trim()
              : name.ariaLabelledby,
            'aria-describedby': describedBy,
            'aria-valuetext': formatSliderTooltip(value, props.formatTooltip),
            'aria-readonly': props.readOnly || undefined,
            onPointerdown: (e: PointerEvent) => handlePointerDown(e, thumbType),
            onMouseenter: () => {
              if (props.tooltip) showTooltip.value = true
            },
            onMouseleave: () => {
              if (!isDragging.value) showTooltip.value = false
            },
            onFocus: () => {
              focusedThumb.value = thumbType ?? 'single'
            },
            onBlur: (event: FocusEvent) => {
              focusedThumb.value = null
              const next = event.relatedTarget as Node | null
              if (next && rootElement.value?.contains(next)) return
              formItemControl?.onBlur()
            },
            onKeydown: (e: KeyboardEvent) => {
              if (effectiveDisabled.value || props.readOnly) return
              const isRtl = directionRtl
              const newValue = sliderGetKeyboardValue(
                e.key,
                value,
                props.min,
                props.max,
                props.step,
                undefined,
                isRtl
              )
              if (newValue === null) return
              e.preventDefault()
              commit(sliderApplyThumbValue(displayed.value, newValue, thumbType, props.range))
            }
          },
          [
            ...(showThumbTooltip
              ? [h('div', { class: tooltipClasses }, formatSliderTooltip(value, props.formatTooltip))]
              : []),
            ...(name.suffix
              ? [h('span', { id: `${thumbId ?? 'thumb'}-suffix`, class: 'sr-only' }, name.suffix)]
              : [])
          ]
        )
      }

      const singleName = resolveSliderThumbName({
        thumb: null,
        range: false,
        ariaLabel,
        ariaLabelledby: labelledby,
        labels: labels.value
      })
      const minName = resolveSliderThumbName({
        thumb: 'min',
        range: true,
        ariaLabel,
        ariaLabelledby: labelledby,
        labels: labels.value
      })
      const maxName = resolveSliderThumbName({
        thumb: 'max',
        range: true,
        ariaLabel,
        ariaLabelledby: labelledby,
        labels: labels.value
      })

      const thumbs =
        props.range && Array.isArray(current)
          ? [
              createThumb(current[0], 'min', minName, effectiveId),
              createThumb(current[1], 'max', maxName, effectiveId ? `${effectiveId}-max` : 'slider-max')
            ]
          : createThumb(
              typeof current === 'number' ? current : current[0],
              null,
              singleName,
              effectiveId
            )

      const markNodes =
        Object.keys(marksObj).length === 0
          ? null
          : h(
              'div',
              { class: 'relative w-full mt-2 h-4' },
              Object.entries(marksObj).map(([key, label]) =>
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'absolute text-xs text-[var(--tiger-text-secondary)] -translate-x-1/2',
                    style: sliderThumbInsetStyle(getPercentage(Number(key)), directionRtl),
                    disabled: effectiveDisabled.value || props.readOnly || undefined,
                    onClick: () => {
                      if (effectiveDisabled.value || props.readOnly) return
                      commit(
                        props.range && Array.isArray(displayed.value)
                          ? (sliderApplyThumbValue(
                              displayed.value,
                              Number(key),
                              sliderPickRangeThumb(displayed.value, Number(key)),
                              true
                            ) as [number, number])
                          : Number(key)
                      )
                    }
                  },
                  label
                )
              )
            )

      return h(
        'div',
        {
          ...restAttrs,
          ref: rootElement,
          'data-orientation': props.vertical ? 'vertical' : 'horizontal',
          'data-readonly': props.readOnly || undefined,
          'data-show-input': props.showInput || undefined,
          'data-show-range': props.showRange || undefined,
          'data-push-apart': props.pushApart || undefined,
          class: getSliderRootClasses(
            effectiveDisabled.value,
            classNames(props.className, coerceClassValue(attrs.class)),
            props.tooltip &&
              (showTooltip.value || focusedThumb.value !== null || isDragging.value),
            status.value
          ),
          style: mergeStyleValues(attrs.style, props.style),
          'data-status': status.value === 'default' ? undefined : status.value
        },
        [
          h(
            'div',
            {
              class: sliderHitAreaClasses,
              onPointerdown: (e: PointerEvent) => {
                const target = e.target as HTMLElement
                if (target.closest('[role="slider"]')) return
                handlePointerDown(e, null)
              }
            },
            [
              h(
                'div',
                {
                  ref: trackElement,
                  class: getSliderTrackClasses(props.size, effectiveDisabled.value),
                  onPointerdown: (e: PointerEvent) => {
                    const target = e.target as HTMLElement
                    if (target.closest('[role="slider"]')) return
                    handlePointerDown(e, null)
                  }
                },
                [h('div', { class: sliderRangeClasses, style: rangeStyles }), thumbs]
              )
            ]
          ),
          markNodes,
          shouldSubmitNativeField({
            name: props.name ?? formItemControl?.name.value,
            disabled: effectiveDisabled.value
          })
            ? h('input', {
                type: 'hidden',
                name: props.name ?? formItemControl?.name.value,
                value:
                  resolveBoundValue() === null
                    ? ''
                    : Array.isArray(current)
                      ? `${current[0]},${current[1]}`
                      : String(current)
              })
            : null
        ]
      )
    }
  }
})

export default Slider
