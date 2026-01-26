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
        props.position === 'right' || props.position === 'left'
          ? 'flex-col gap-2'
          : 'flex-row gap-3',
        props.className
      )
    )

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
          role: 'list',
          'aria-label': 'Chart legend'
        },
        props.items.map((item) =>
          h(
            props.interactive ? 'button' : 'div',
            {
              key: `legend-${item.index}`,
              type: props.interactive ? 'button' : undefined,
              class: classNames(
                'flex items-center gap-2 text-sm',
                'text-[color:var(--tiger-text-secondary,#6b7280)]',
                props.interactive
                  ? 'cursor-pointer hover:text-[color:var(--tiger-text,#374151)] transition-colors'
                  : 'cursor-default',
                item.active === false ? 'opacity-50' : undefined
              ),
              role: 'listitem',
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
                  backgroundColor: item.color
                },
                'aria-hidden': 'true'
              }),
              h('span', { style: { marginRight: `${props.gap}px` } }, item.label)
            ]
          )
        )
      )
  }
})

export default ChartLegend
