import { defineComponent, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  type ChartSeriesPoint,
  type ChartSeriesProps
} from '@expcat/tigercat-core'

export interface VueChartSeriesProps<
  T extends ChartSeriesPoint = ChartSeriesPoint
> extends ChartSeriesProps<T> {
  data: T[]
}

export const ChartSeries = defineComponent({
  name: 'TigerChartSeries',
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<ChartSeriesPoint[]>,
      required: true
    },
    name: {
      type: String
    },
    color: {
      type: String
    },
    opacity: {
      type: Number
    },
    type: {
      type: String
    },
    className: {
      type: String
    }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        'g',
        {
          ...attrs,
          class: classNames('outline-none', coerceClassValue(attrs.class), props.className),
          'data-series-name': props.name,
          'data-series-type': props.type,
          fill: props.color,
          stroke: props.color,
          opacity: props.opacity
        },
        slots.default?.({
          data: props.data,
          name: props.name,
          color: props.color,
          opacity: props.opacity,
          type: props.type
        })
      )
  }
})

export default ChartSeries
