import { defineComponent, computed, ref, h, inject, onBeforeUnmount, type PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
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
  sliderResolveMarks,
  sliderValuesEqual,
  sliderApplyThumbValue,
  sliderPickRangeThumb,
  sliderThumbInsetStyle,
  sliderRangeFillStyle,
  sliderSortRange,
  resolveSliderThumbName,
  getSliderLabels,
  mergeAriaDescribedBy,
  mergeStyleValues,
  createDocumentDragSession,
  getElementTextDirection,
  type DocumentDragSession
} from '@expcat/tigercat-core'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { useTigerConfig } from './ConfigProvider'

export interface VueSliderProps {
  modelValue?: number | [number, number]
  defaultValue?: number | [number, number]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  marks?: boolean | Record<number, string>
  tooltip?: boolean
  size?: ComponentSize
  range?: boolean
  status?: InputStatus
  className?: string
  style?: Record<string, string | number>
}

function displaySliderValue(
  value: number | [number, number],
  range: boolean,
  min: number,
  max: number
): number | [number, number] {
  if (range) {
    const tuple = Array.isArray(value) ? value : [min, max]
    const a = Math.min(Math.max(tuple[0], min), max)
    const b = Math.min(Math.max(tuple[1], min), max)
    return sliderSortRange([a, b])
  }
  const n = typeof value === 'number' ? value : value[0]
  return Math.min(Math.max(n, min), max)
}

export const Slider = defineComponent({
  name: 'TigerSlider',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Number, Array] as PropType<number | [number, number]>
    },
    value: {
      type: [Number, Array] as PropType<number | [number, number]>
    },
    defaultValue: {
      type: [Number, Array] as PropType<number | [number, number]>
    },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
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
    className: { type: String },
    style: { type: Object as PropType<Record<string, string | number>> }
  },
  emits: {
    'update:value': (value: number | [number, number]) =>
      typeof value === 'number' || Array.isArray(value),
    'update:modelValue': (value: number | [number, number]) =>
      typeof value === 'number' || Array.isArray(value),
    change: (value: number | [number, number]) => typeof value === 'number' || Array.isArray(value)
  },
  setup(props, { emit, attrs, expose }) {
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const config = useTigerConfig()
    const labels = computed(() => getSliderLabels(config.value.locale))

    const resolveBoundValue = (): number | [number, number] | undefined => {
      if (props.modelValue !== undefined) return props.modelValue
      if (props.value !== undefined) return props.value
      return undefined
    }

    const isControlled = computed(() => resolveBoundValue() !== undefined)
    const internalValue = ref<number | [number, number]>(
      resolveBoundValue() ??
        props.defaultValue ??
        (props.range ? [props.min, props.max] : props.min)
    )
    const currentValue = computed(() =>
      isControlled.value ? (resolveBoundValue() as number | [number, number]) : internalValue.value
    )
    const displayed = computed(() =>
      displaySliderValue(currentValue.value, props.range, props.min, props.max)
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
    let dragSession: DocumentDragSession | null = null
    let activeThumbLive: 'min' | 'max' | null = null

    expose({
      focus: () => thumbElement.value?.focus(),
      el: rootElement
    })

    const commit = (next: number | [number, number]) => {
      if (sliderValuesEqual(displayed.value, next)) return
      if (!isControlled.value) internalValue.value = next
      emit('update:modelValue', next)
      emit('update:value', next)
      emit('change', next)
      formItemControl?.onChange(next)
    }

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
      if (event.defaultPrevented || effectiveDisabled.value) return
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
      commit(sliderApplyThumbValue(current, pointerValue, which, props.range))
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
          commit(sliderApplyThumbValue(displayed.value, moved, activeThumbLive, props.range))
        },
        onEnd: stopDrag
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
      const rtl = getElementTextDirection(trackElement.value ?? rootElement.value) === 'rtl'
      const getPercentage = (val: number) => sliderGetPercentage(val, props.min, props.max)
      const current = displayed.value
      const rangeStyles = (() => {
        if (props.range && Array.isArray(current)) {
          return sliderRangeFillStyle(getPercentage(current[0]), getPercentage(current[1]), rtl)
        }
        const val = typeof current === 'number' ? current : current[0]
        return sliderRangeFillStyle(0, getPercentage(val), rtl)
      })()
      const thumbClasses = getSliderThumbClasses(
        props.size,
        effectiveDisabled.value,
        isDragging.value
      )
      const tooltipClasses = getSliderTooltipClasses(props.size)
      const marksObj = sliderResolveMarks(props.marks, props.min, props.max, props.step)

      const createThumb = (
        value: number,
        thumbType: 'min' | 'max' | null,
        name: { ariaLabel?: string; ariaLabelledby?: string },
        thumbId?: string
      ) => {
        const focused =
          (thumbType === 'min' && focusedThumb.value === 'min') ||
          (thumbType === 'max' && focusedThumb.value === 'max') ||
          (thumbType === null && focusedThumb.value === 'single')
        const showThumbTooltip =
          props.tooltip &&
          (showTooltip.value || focused) &&
          (thumbType === activeThumb.value || thumbType === null)
        const zIndex =
          activeThumb.value && thumbType ? (activeThumb.value === thumbType ? 2 : 1) : undefined

        return h(
          'div',
          {
            ref: thumbType === null ? thumbElement : undefined,
            id: thumbId,
            class: thumbClasses,
            style: { ...sliderThumbInsetStyle(getPercentage(value), rtl), zIndex },
            tabindex: effectiveDisabled.value ? -1 : 0,
            role: 'slider',
            'aria-valuenow': value,
            'aria-valuemin': props.min,
            'aria-valuemax': props.max,
            'aria-orientation': 'horizontal',
            'aria-disabled': effectiveDisabled.value || undefined,
            'aria-label': name.ariaLabel,
            'aria-labelledby': name.ariaLabelledby,
            'aria-describedby': describedBy,
            'aria-valuetext': String(value),
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
            onBlur: () => {
              focusedThumb.value = null
              formItemControl?.onBlur()
            },
            onKeydown: (e: KeyboardEvent) => {
              if (effectiveDisabled.value) return
              const isRtl = getElementTextDirection(trackElement.value) === 'rtl'
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
          showThumbTooltip ? [h('div', { class: tooltipClasses }, String(value))] : undefined
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
              createThumb(current[1], 'max', maxName)
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
                  'div',
                  {
                    class:
                      'absolute text-xs text-[var(--tiger-text-muted,#6b7280)] -translate-x-1/2',
                    style: sliderThumbInsetStyle(getPercentage(Number(key)), rtl)
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
          class: getSliderRootClasses(
            effectiveDisabled.value,
            classNames(props.className, coerceClassValue(attrs.class)),
            props.tooltip
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
          markNodes
        ]
      )
    }
  }
})

export default Slider
