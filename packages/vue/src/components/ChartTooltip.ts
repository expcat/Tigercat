import { defineComponent, h, computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  classNames,
  coerceClassValue,
  chartTooltipBaseClasses,
  chartTooltipLines,
  chartTooltipViewport,
  getChartTooltipTransform,
  isBrowser,
  mapChartTooltipPointToDocument,
  registerEscapeDismiss,
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
    },
    id: {
      type: String
    }
  },
  emits: ['dismiss'],
  setup(props, { slots, attrs, emit }) {
    const tooltipRef = ref<HTMLDivElement | null>(null)
    const { anchorRef, target } = useVueOverlayPortalTarget()
    const adjustedPosition = ref({ x: props.x, y: props.y })
    const mounted = ref(false)
    let releaseEscape: (() => void) | undefined

    onMounted(() => {
      mounted.value = true
    })

    const placeTooltip = () => {
      const node = tooltipRef.value
      const host = node?.ownerDocument ?? target.value?.ownerDocument ?? document
      const point = mapChartTooltipPointToDocument({ x: props.x, y: props.y }, document, host)
      const rect = node ? node.getBoundingClientRect() : { width: 0, height: 0 }
      return resolveChartTooltipPosition({
        x: point.x,
        y: point.y,
        rect,
        viewport: chartTooltipViewport(host)
      })
    }

    watch(
      () => [props.x, props.y, props.open, props.content, mounted.value, target.value] as const,
      (_value, _oldValue, onCleanup) => {
        if (!props.open || !isBrowser()) return

        adjustedPosition.value = placeTooltip()

        const frameHandle = requestAnimationFrame(() => {
          if (!tooltipRef.value) return
          adjustedPosition.value = placeTooltip()
        })
        onCleanup(() => cancelAnimationFrame(frameHandle))
      },
      { immediate: true }
    )

    watch(
      () => props.open,
      (open) => {
        releaseEscape?.()
        releaseEscape = undefined
        if (!open || !isBrowser()) return
        releaseEscape = registerEscapeDismiss(
          document,
          () => emit('dismiss'),
          () => tooltipRef.value
        )
      },
      { immediate: true }
    )
    onBeforeUnmount(() => releaseEscape?.())

    const tooltipClasses = computed(() =>
      classNames(chartTooltipBaseClasses, coerceClassValue(attrs.class), props.className)
    )

    return () => {
      const slotContent = slots.default?.()
      const lines = chartTooltipLines(props.content)
      const body =
        slotContent && slotContent.length > 0
          ? slotContent
          : lines.length > 1
            ? h(
                'ul',
                { class: 'm-0 list-none whitespace-pre-line p-0' },
                lines.map((line, index) => h('li', { key: index }, line))
              )
            : props.content
      const tooltip =
        props.open && body
          ? h(
              'div',
              {
                ref: tooltipRef,
                id: props.id,
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
        tooltip ? renderVueOverlayTeleport(tooltip, mounted.value ? target.value : null) : null
      ]
    }
  }
})

export default ChartTooltip
