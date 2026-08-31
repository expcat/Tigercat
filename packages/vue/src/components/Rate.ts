import { defineComponent, h, ref, computed, watch, type PropType } from 'vue'
import type { RateSize } from '@expcat/tigercat-core'
import {
  rateBaseClasses,
  getRateStarClasses,
  rateHalfStarInnerClasses,
  rateActiveColor,
  rateInactiveColor,
  rateHoverColor,
  rateIsInlineStartHalf,
  starPathD,
  starViewBox,
  classNames,
  coerceClassValue,
  mergeTigerLocale,
  getRateLabels,
  formatRateValueText,
  sliderGetKeyboardValue,
  sliderNormalizeValue,
  getLocaleDirection,
  type TigerLocale,
  type TigerLocaleRate
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type VueRateProps = InstanceType<typeof Rate>['$props']

export const Rate = defineComponent({
  name: 'TigerRate',
  inheritAttrs: false,
  props: {
    modelValue: { type: Number, default: undefined },
    defaultValue: { type: Number, default: 0 },
    count: { type: Number, default: 5 },
    allowHalf: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    size: { type: String as PropType<RateSize>, default: 'md' },
    allowClear: { type: Boolean, default: true },
    character: { type: String, default: undefined },
    className: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleRate>>, default: undefined }
  },
  emits: ['update:modelValue', 'change', 'hover-change'],
  setup(props, { emit, attrs, slots }) {
    const config = useTigerConfig()
    const hoverValue = ref(0)
    const isControlled = computed(() => props.modelValue !== undefined)
    const innerValue = ref(props.defaultValue)
    const currentValue = computed(() =>
      isControlled.value ? (props.modelValue as number) : innerValue.value
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getRateLabels(mergedLocale.value, props.labels))
    const rtl = computed(() => getLocaleDirection(mergedLocale.value) === 'rtl')
    const locked = computed(() => props.disabled || props.readOnly)
    const step = computed(() => (props.allowHalf ? 0.5 : 1))
    const normalized = computed(() =>
      sliderNormalizeValue(currentValue.value, 0, props.count, step.value)
    )

    watch(
      () => props.modelValue,
      (next) => {
        if (next !== undefined) innerValue.value = next
      }
    )

    function commitValue(next: number) {
      if (locked.value) return
      if (!isControlled.value) innerValue.value = next
      emit('update:modelValue', next)
      emit('change', next)
    }

    const displayValue = computed(() =>
      hoverValue.value > 0 ? hoverValue.value : normalized.value
    )

    function hitValue(index: number, clientX: number, el: HTMLElement): number {
      const half =
        props.allowHalf && rateIsInlineStartHalf(clientX, el.getBoundingClientRect(), rtl.value)
      return half ? index + 0.5 : index + 1
    }

    function handleClick(index: number, e: MouseEvent) {
      if (locked.value) return
      const val = hitValue(index, e.clientX, e.currentTarget as HTMLElement)
      commitValue(props.allowClear && val === normalized.value ? 0 : val)
    }

    function handleMouseMove(index: number, e: MouseEvent) {
      if (locked.value) return
      const val = hitValue(index, e.clientX, e.currentTarget as HTMLElement)
      if (val !== hoverValue.value) {
        hoverValue.value = val
        emit('hover-change', val)
      }
    }

    function handleMouseLeave() {
      if (locked.value) return
      hoverValue.value = 0
      emit('hover-change', 0)
    }

    function handleKeydown(e: KeyboardEvent) {
      if (locked.value) return
      const next = sliderGetKeyboardValue(
        e.key,
        normalized.value,
        0,
        props.count,
        step.value,
        undefined,
        rtl.value
      )
      if (next == null) return
      e.preventDefault()
      commitValue(next)
    }

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const slotChar = slots.character?.()
      const isChar = Boolean(slotChar || props.character)
      const glyph = (extraClass?: string) =>
        slotChar
          ? h('span', { class: extraClass }, slotChar)
          : isChar
            ? h('span', { class: extraClass }, props.character)
            : h(
                'svg',
                {
                  viewBox: starViewBox,
                  fill: 'currentColor',
                  class: extraClass ?? 'h-full w-full'
                },
                [h('path', { d: starPathD })]
              )

      const stars: ReturnType<typeof h>[] = []
      for (let i = 0; i < props.count; i++) {
        const full = displayValue.value >= i + 1
        const half = props.allowHalf && !full && displayValue.value >= i + 0.5
        const isHovering = hoverValue.value > 0
        const colorClass =
          full || half ? (isHovering ? rateHoverColor : rateActiveColor) : rateInactiveColor

        const children = half
          ? [
              h('span', { class: classNames('absolute inset-0', rateInactiveColor) }, [glyph()]),
              h(
                'span',
                {
                  class: classNames(
                    'absolute top-0 bottom-0 overflow-hidden',
                    isHovering ? rateHoverColor : rateActiveColor
                  ),
                  style: { width: '50%', insetInlineStart: 0 }
                },
                [glyph(rateHalfStarInnerClasses)]
              )
            ]
          : [h('span', { class: colorClass }, [glyph()])]

        stars.push(
          h(
            'span',
            {
              key: i,
              class: getRateStarClasses(props.size, isChar, locked.value),
              'aria-hidden': 'true',
              onClick: (e: MouseEvent) => handleClick(i, e),
              onMousemove: (e: MouseEvent) => handleMouseMove(i, e)
            },
            children
          )
        )
      }

      const valueText = formatRateValueText(
        labels.value.valueText,
        normalized.value,
        mergedLocale.value?.locale
      )
      const ariaLabel =
        (typeof attrsRecord['aria-label'] === 'string' && attrsRecord['aria-label']) ||
        labels.value.ariaLabel

      return h(
        'div',
        {
          ...attrs,
          class: classNames(rateBaseClasses, props.className, coerceClassValue(attrsRecord.class)),
          role: 'slider',
          'aria-label': ariaLabel,
          'aria-valuemin': 0,
          'aria-valuemax': props.count,
          'aria-valuenow': normalized.value,
          'aria-valuetext': valueText,
          'aria-disabled': props.disabled || undefined,
          'aria-readonly': props.readOnly || undefined,
          'aria-orientation': 'horizontal',
          tabindex: props.disabled ? -1 : 0,
          onKeydown: handleKeydown,
          onMouseleave: handleMouseLeave
        },
        stars
      )
    }
  }
})

export default Rate
