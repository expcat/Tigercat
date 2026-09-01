import { defineComponent, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  DEFAULT_DONUT_INNER_RADIUS_RATIO,
  type ChartPadding,
  type PieChartDatum,
  type DonutChartProps as CoreDonutChartProps
} from '@expcat/tigercat-core'
import { PieChart } from './PieChart'

export interface VueDonutChartProps extends CoreDonutChartProps {
  data: PieChartDatum[]
  padding?: ChartPadding
}

export type DonutChartProps = VueDonutChartProps

export const DonutChart = defineComponent({
  name: 'TigerDonutChart',
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<PieChartDatum[]>,
      required: true
    },
    innerRadiusRatio: {
      type: Number,
      default: DEFAULT_DONUT_INNER_RADIUS_RATIO
    },
    className: {
      type: String
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'slice-click', 'slice-hover'],
  setup(props, { attrs, emit }) {
    return () =>
      h(PieChart, {
        ...attrs,
        data: props.data,
        innerRadiusRatio: props.innerRadiusRatio,
        className: classNames(coerceClassValue(attrs.class), props.className),
        'onUpdate:hoveredIndex': (index: number | null) => emit('update:hoveredIndex', index),
        'onUpdate:selectedIndex': (index: number | null) => emit('update:selectedIndex', index),
        onSliceClick: (index: number, datum: PieChartDatum) => emit('slice-click', index, datum),
        onSliceHover: (index: number | null, datum: PieChartDatum | null) =>
          emit('slice-hover', index, datum)
      })
  }
})

export default DonutChart
