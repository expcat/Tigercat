import { defineComponent, h, PropType, computed } from 'vue'
import { classNames, type ChartLegendItem, type ChartLegendPosition } from '@expcat/tigercat-core'

export interface VueChartLegendProps {
  items: ChartLegendItem[]
  position?: ChartLegendPosition
  markerSize?: number
  gap?: number
  interactive?: boolean
  className?: string
}

export const ChartLegend = defineComponent({
  name: 'TigerChartLegend',
  props: {
    items: {
      type: Array as PropType<ChartLegendItem[]>,
      required: true
    },
    position: {
      type: String as PropType<ChartLegendPosition>,
      default: 'bottom'
    },
    markerSize: {
      type: Number,
      default: 10
    },
    gap: {
      type: Number,
      default: 8
    },
    interactive: {
      type: Boolean,
      default: false
    },
    className: {
      type: String
    }
  },
  emits: ['item-click', 'item-hover', 'item-leave'],
  setup(props, { emit }) {
    const containerClasses = computed(() =>
      classNames(
        'flex flex-wrap',
        props.position === 'right' || props.position === 'left' ? 'flex-col' : 'flex-row',
        props.className
      )
    )

    const containerStyle = computed(() => ({
      gap: `${props.gap}px`
    }))

    const handleClick = (item: ChartLegendItem) => {
      if (!props.interactive) return
      emit('item-click', item.index, item)
    }

    const handleHover = (item: ChartLegendItem) => {
      if (!props.interactive) return
      emit('item-hover', item.index, item)
    }

    const handleLeave = () => {
      if (!props.interactive) return
      emit('item-leave')
    }

    return () =>
      h(
        'div',
        {
          class: containerClasses.value,
          style: containerStyle.value,
          // A group of toggle buttons is not a "list"; only use list semantics
          // for the static (non-interactive) legend.
          role: props.interactive ? 'group' : 'list',
          'aria-label': 'Chart legend',
          'data-chart-legend': 'true'
        },
        props.items.map((item) =>
          h(
            props.interactive ? 'button' : 'div',
            {
              key: `legend-${item.index}`,
              type: props.interactive ? 'button' : undefined,
              class: classNames(
                'flex items-center gap-2 text-sm rounded-[var(--tiger-chart-legend-row-radius,0)]',
                'text-[color:var(--tiger-text-secondary,#6b7280)]',
                props.interactive
                  ? 'cursor-pointer hover:text-[color:var(--tiger-text,#374151)] hover:bg-[var(--tiger-chart-legend-row-hover-bg,transparent)] transition-colors'
                  : 'cursor-default',
                item.active === false ? 'opacity-50' : undefined
              ),
              // Interactive items are real buttons; `role="listitem"` would
              // override the button role, so it is only set for the static legend.
              role: props.interactive ? undefined : 'listitem',
              'aria-pressed': props.interactive ? item.active !== false : undefined,
              'data-legend-item': 'true',
              onClick: props.interactive ? () => handleClick(item) : undefined,
              onMouseenter: props.interactive ? () => handleHover(item) : undefined,
              onMouseleave: props.interactive ? handleLeave : undefined
            },
            [
              h('span', {
                class: 'inline-block rounded-full shrink-0',
                style: {
                  width: `${props.markerSize}px`,
                  height: `${props.markerSize}px`,
                  background: `var(--tiger-chart-legend-marker-image, ${item.color})`,
                  '--tiger-chart-legend-marker-color': item.color
                } as Record<string, string>,
                'aria-hidden': 'true',
                'data-legend-marker': 'true'
              }),
              h('span', { style: { marginRight: `${props.gap}px` } }, item.label)
            ]
          )
        )
      )
  }
})

export default ChartLegend
