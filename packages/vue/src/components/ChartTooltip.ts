import { defineComponent, h, computed, ref, watch, Teleport } from 'vue'
import { classNames, getChartTooltipTransform } from '@expcat/tigercat-core'

export interface VueChartTooltipProps {
  content: string
  visible?: boolean
  x?: number
  y?: number
  className?: string
}

export const ChartTooltip = defineComponent({
  name: 'TigerChartTooltip',
  props: {
    content: {
      type: String,
      required: true
    },
    visible: {
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
  setup(props) {
    const tooltipRef = ref<HTMLDivElement | null>(null)
    const adjustedPosition = ref({ x: props.x, y: props.y })

    // Adjust position to keep tooltip within viewport
    watch(
      () => [props.x, props.y, props.visible],
      (_value, _oldValue, onCleanup) => {
        if (!props.visible) return

        // Add small offset from cursor
        let x = props.x + 12
        let y = props.y - 8

        // Check bounds after render
        const frameHandle = requestAnimationFrame(() => {
          if (!tooltipRef.value) return

          const rect = tooltipRef.value.getBoundingClientRect()
          const viewportWidth = window.innerWidth
          const viewportHeight = window.innerHeight

          // Adjust if overflowing right
          if (x + rect.width > viewportWidth - 8) {
            x = props.x - rect.width - 12
          }

          // Adjust if overflowing bottom
          if (y + rect.height > viewportHeight - 8) {
            y = props.y - rect.height - 8
          }

          // Keep within left/top bounds
          x = Math.max(8, x)
          y = Math.max(8, y)

          adjustedPosition.value = { x, y }
        })
        onCleanup(() => cancelAnimationFrame(frameHandle))

        adjustedPosition.value = { x, y }
      },
      { immediate: true }
    )

    const tooltipClasses = computed(() =>
      classNames(
        'fixed left-0 top-0 z-[9999] pointer-events-none will-change-transform',
        'px-3 py-2 rounded-[var(--tiger-radius-md,0.375rem)] shadow-[var(--tiger-shadow-glass,0_10px_15px_-3px_rgb(0_0_0_/_0.1),0_4px_6px_-4px_rgb(0_0_0_/_0.1))]',
        'bg-[color:var(--tiger-bg-elevated,#1f2937)]',
        'text-[color:var(--tiger-text-inverse,#f9fafb)]',
        'text-sm whitespace-nowrap',
        'transition-opacity duration-150',
        props.visible ? 'opacity-100' : 'opacity-0',
        props.className
      )
    )

    return () => {
      // Don't render if content is empty
      if (!props.content) return null

      return h(Teleport, { to: 'body' }, [
        h(
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
          props.content
        )
      ])
    }
  }
})

export default ChartTooltip
