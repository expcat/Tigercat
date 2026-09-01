import { defineComponent, h, computed, ref, watch } from 'vue'
import {
  classNames,
  coerceClassValue,
  chartTooltipBaseClasses,
  getChartTooltipTransform,
  isBrowser,
  resolveChartTooltipPosition
} from '@expcat/tigercat-core'
import { renderVueOverlayTeleport, useVueOverlayPortalTarget } from '../utils/overlay'

export interface VueChartTooltipProps {
  content?: string
  open?: boolean
  x?: number
  y?: number
  className?: string
}

export const ChartTooltip = defineComponent({
  name: 'TigerChartTooltip',
  inheritAttrs: false,
  props: {
    content: {
      type: String,
      default: ''
    },
    open: {
      type: Boolean,
      default: false
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    className: {
      type: String
    }
  },
  setup(props, { slots, attrs }) {
    const tooltipRef = ref<HTMLDivElement | null>(null)
    const { anchorRef, target } = useVueOverlayPortalTarget()
    const adjustedPosition = ref({ x: props.x, y: props.y })

    watch(
      () => [props.x, props.y, props.open, props.content] as const,
      (_value, _oldValue, onCleanup) => {
        if (!props.open || !isBrowser()) return

        const initialPosition = resolveChartTooltipPosition({
          x: props.x,
          y: props.y,
          rect: { width: 0, height: 0 },
          viewport: { width: window.innerWidth, height: window.innerHeight }
        })

        const frameHandle = requestAnimationFrame(() => {
          if (!tooltipRef.value) return

          const rect = tooltipRef.value.getBoundingClientRect()
          adjustedPosition.value = resolveChartTooltipPosition({
            x: props.x,
            y: props.y,
            rect,
            viewport: { width: window.innerWidth, height: window.innerHeight }
          })
        })
        onCleanup(() => cancelAnimationFrame(frameHandle))

        adjustedPosition.value = initialPosition
      },
      { immediate: true }
    )

    const tooltipClasses = computed(() =>
      classNames(chartTooltipBaseClasses, coerceClassValue(attrs.class), props.className)
    )

    return () => {
      const slotContent = slots.default?.()
      const body = slotContent && slotContent.length > 0 ? slotContent : props.content
      const tooltip =
        props.open && body
          ? h(
              'div',
              {
                ref: tooltipRef,
                class: tooltipClasses.value,
                style: {
                  transform: getChartTooltipTransform(adjustedPosition.value)
                },
                role: 'tooltip',
                'data-chart-tooltip': 'true'
              },
              body
            )
          : null

      return [
        h('span', { ref: anchorRef, hidden: true }),
        tooltip ? renderVueOverlayTeleport(tooltip, target.value) : null
      ]
    }
  }
})

export default ChartTooltip
