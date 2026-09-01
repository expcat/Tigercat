import { defineComponent, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getChartSeriesPaint,
  type ChartSeriesPoint,
  type ChartSeriesProps,
  type ChartSeriesType
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
      type: String as PropType<ChartSeriesType>
    },
    className: {
      type: String
    }
  },
  setup(props, { slots, attrs }) {
    return () => {
      const paint = getChartSeriesPaint(props.type, props.color)
      return h(
        'g',
        {
          ...attrs,
          class: classNames(coerceClassValue(attrs.class), props.className),
          'data-series-name': props.name,
          'data-series-type': props.type,
          fill: paint.fill,
          stroke: paint.stroke,
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
  }
})

export default ChartSeries
