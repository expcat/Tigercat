import { defineComponent, h, ref, computed, watch, type PropType } from 'vue'
import type { RateSize } from '@expcat/tigercat-core'
import {
  rateBaseClasses,
  getRateStarClasses,
  rateHalfStarInnerClasses,
  rateActiveColor,
  rateInactiveColor,
  rateHoverColor,
  starPathD,
  starViewBox,
  classNames,
  coerceClassValue,
  mergeTigerLocale,
  getRateLabels,
  formatRateValueText,
  type TigerLocale,
  type TigerLocaleRate
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export type VueRateProps = InstanceType<typeof Rate>['$props']

export const Rate = defineComponent({
  name: 'TigerRate',
  props: {
    modelValue: { type: Number, default: undefined },
    defaultValue: { type: Number, default: 0 },
    count: { type: Number, default: 5 },
    allowHalf: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<RateSize>, default: 'md' },
    allowClear: { type: Boolean, default: true },
    character: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleRate>>, default: undefined }
  },
  emits: ['update:modelValue', 'change', 'hover-change'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const hoverValue = ref(0)
    const isControlled = computed(() => props.modelValue !== undefined)
    const innerValue = ref(props.defaultValue)
    const currentValue = computed(() =>
      isControlled.value ? (props.modelValue as number) : innerValue.value
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getRateLabels(mergedLocale.value, props.labels))

    watch(
      () => props.modelValue,
      (next) => {
        if (next !== undefined) innerValue.value = next
      }
    )

    function commitValue(next: number) {
      if (!isControlled.value) innerValue.value = next
      emit('update:modelValue', next)
      emit('change', next)
    }

    const displayValue = computed(() =>
      hoverValue.value > 0 ? hoverValue.value : currentValue.value
    )

    function getStarValue(index: number, isHalf: boolean): number {
      return isHalf ? index + 0.5 : index + 1
    }

    function handleClick(index: number, e: MouseEvent) {
      if (props.disabled) return
      const el = e.currentTarget as HTMLElement
      const rect = el.getBoundingClientRect()
      const isHalf = props.allowHalf && e.clientX - rect.left < rect.width / 2
      const val = getStarValue(index, isHalf)
      const newVal = props.allowClear && val === currentValue.value ? 0 : val
      commitValue(newVal)
    }

    function handleMouseMove(index: number, e: MouseEvent) {
      if (props.disabled) return
      const el = e.currentTarget as HTMLElement
      const rect = el.getBoundingClientRect()
      const isHalf = props.allowHalf && e.clientX - rect.left < rect.width / 2
      const val = getStarValue(index, isHalf)
      if (val !== hoverValue.value) {
        hoverValue.value = val
        emit('hover-change', val)
      }
    }

    function handleMouseLeave() {
      if (props.disabled) return
      hoverValue.value = 0
      emit('hover-change', 0)
    }

    function handleKeydown(e: KeyboardEvent) {
      if (props.disabled) return
      const step = props.allowHalf ? 0.5 : 1
      let next = currentValue.value
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = Math.min(props.count, currentValue.value + step)
          break
        case 'ArrowLeft':
        case 'ArrowDown':
          next = Math.max(0, currentValue.value - step)
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = props.count
          break
        default:
          return
      }
      e.preventDefault()
      commitValue(next)
    }

    return () => {
      const isChar = !!props.character
      const stars: ReturnType<typeof h>[] = []

      for (let i = 0; i < props.count; i++) {
        const full = displayValue.value >= i + 1
        const half = props.allowHalf && !full && displayValue.value >= i + 0.5
        const isHovering = hoverValue.value > 0

        const colorClass =
          full || half ? (isHovering ? rateHoverColor : rateActiveColor) : rateInactiveColor

        const starContent = isChar
          ? h('span', null, props.character)
          : h(
              'svg',
              {
                viewBox: starViewBox,
                fill: 'currentColor',
                class: 'w-full h-full'
              },
              [h('path', { d: starPathD })]
            )

        // For half star, render two overlapping layers
        const children = half
          ? [
              // Inactive background (full star)
              h('span', { class: classNames('absolute inset-0', rateInactiveColor) }, [
                isChar
                  ? h('span', null, props.character)
                  : h(
                      'svg',
                      {
                        viewBox: starViewBox,
                        fill: 'currentColor',
                        class: 'w-full h-full'
                      },
                      [h('path', { d: starPathD })]
                    )
              ]),
              // Active half (clipped left 50%; inner glyph keeps full-star width)
              h(
                'span',
                {
                  class: classNames(
                    'absolute inset-0 overflow-hidden',
                    isHovering ? rateHoverColor : rateActiveColor
                  ),
                  style: { width: '50%' }
                },
                [
                  isChar
                    ? h('span', { class: rateHalfStarInnerClasses }, props.character)
                    : h(
                        'svg',
                        {
                          viewBox: starViewBox,
                          fill: 'currentColor',
                          class: rateHalfStarInnerClasses
                        },
                        [h('path', { d: starPathD })]
                      )
                ]
              )
            ]
          : [h('span', { class: colorClass }, [starContent])]

        stars.push(
          h(
            'span',
            {
              key: i,
              class: getRateStarClasses(props.size, isChar, props.disabled),
              'aria-hidden': 'true',
              onClick: (e: MouseEvent) => handleClick(i, e),
              onMousemove: (e: MouseEvent) => handleMouseMove(i, e),
              onMouseleave: handleMouseLeave
            },
            children
          )
        )
      }

      const valueText = formatRateValueText(
        labels.value.valueText,
        currentValue.value,
        mergedLocale.value?.locale
      )

      return h(
        'div',
        {
          class: classNames(rateBaseClasses, coerceClassValue(attrs.class)),
          role: 'slider',
          'aria-label': labels.value.ariaLabel,
          'aria-valuemin': 0,
          'aria-valuemax': props.count,
          'aria-valuenow': currentValue.value,
          'aria-valuetext': valueText,
          'aria-disabled': props.disabled || undefined,
          'aria-orientation': 'horizontal',
          tabindex: props.disabled ? -1 : 0,
          onKeydown: handleKeydown
        },
        stars
      )
    }
  }
})

export default Rate
