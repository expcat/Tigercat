import { defineComponent, h, PropType, computed } from 'vue'
import {
  classNames,
  coerceClassValue,
  chartLegendListClasses,
  getChartLabels,
  getChartLegendItemClasses,
  mergeTigerLocale,
  type ChartLegendItem,
  type ChartLegendOrientation,
  type ChartLegendProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueChartLegendProps extends ChartLegendProps {
  items: ChartLegendItem[]
}

export const ChartLegend = defineComponent({
  name: 'TigerChartLegend',
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<ChartLegendItem[]>,
      required: true
    },
    orientation: {
      type: String as PropType<ChartLegendOrientation>,
      default: 'horizontal' as ChartLegendOrientation
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
    ariaLabel: {
      type: String
    },
    className: {
      type: String
    }
  },
  emits: ['item-click', 'item-hover', 'item-leave'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getChartLabels(mergeTigerLocale(config.value.locale)))
    const resolvedAriaLabel = computed(() => props.ariaLabel ?? labels.value.legendAriaLabel)
    const containerClasses = computed(() =>
      classNames(
        chartLegendListClasses,
        props.orientation === 'vertical' ? 'flex-col' : 'flex-row',
        coerceClassValue(attrs.class),
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

    const handleHover = (item: ChartLegendItem, event: Event) => {
      if (!props.interactive) return
      emit('item-hover', item.index, item, event)
    }

    const handleLeave = (event?: FocusEvent | MouseEvent) => {
      if (!props.interactive) return
      const current = event?.currentTarget
      const related = event && 'relatedTarget' in event ? event.relatedTarget : null
      if (current instanceof Node && related instanceof Node && current.contains(related)) {
        return
      }
      emit('item-leave')
    }

    return () =>
      h(
        'div',
        {
          class: containerClasses.value,
          style: containerStyle.value,
          role: props.interactive ? 'group' : 'list',
          'aria-label': resolvedAriaLabel.value,
          'data-chart-legend': 'true',
          onMouseleave: props.interactive ? (event: MouseEvent) => handleLeave(event) : undefined,
          onFocusout: props.interactive ? (event: FocusEvent) => handleLeave(event) : undefined
        },
        props.items.map((item) => {
          const highlighted = Boolean(
            item.active && props.items.some((entry) => entry.active === false)
          )
          return h(
            props.interactive ? 'button' : 'div',
            {
              key: `legend-${item.index}`,
              type: props.interactive ? 'button' : undefined,
              class: getChartLegendItemClasses({
                interactive: props.interactive,
                dimmed: item.active === false
              }),
              role: props.interactive ? undefined : 'listitem',
              'aria-pressed': props.interactive ? Boolean(item.selected) : undefined,
              'aria-current': props.interactive && highlighted ? 'true' : undefined,
              'data-legend-item': 'true',
              onClick: props.interactive ? () => handleClick(item) : undefined,
              onMouseenter: props.interactive
                ? (event: Event) => handleHover(item, event)
                : undefined,
              onFocus: props.interactive ? (event: Event) => handleHover(item, event) : undefined
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
              h('span', null, item.label)
            ]
          )
        })
      )
  }
})

export default ChartLegend
