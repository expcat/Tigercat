import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  getChartInnerRect,
  type ChartPadding,
  type DonutChartDatum,
  type DonutChartProps as CoreDonutChartProps
} from '@expcat/tigercat-core'
import { PieChart } from './PieChart'

export interface VueDonutChartProps extends CoreDonutChartProps {
  data: DonutChartDatum[]
  padding?: ChartPadding
}

export const DonutChart = defineComponent({
  name: 'TigerDonutChart',
  props: {
    width: {
      type: Number,
      default: 320
    },
    height: {
      type: Number,
      default: 200
    },
    padding: {
      type: [Number, Object] as PropType<ChartPadding>,
      default: 24
    },
    data: {
      type: Array as PropType<DonutChartDatum[]>,
      required: true
    },
    innerRadius: {
      type: Number
    },
    innerRadiusRatio: {
      type: Number,
      default: 0.6
    },
    outerRadius: {
      type: Number
    },
    startAngle: {
      type: Number,
      default: 0
    },
    endAngle: {
      type: Number,
      default: Math.PI * 2
    },
    padAngle: {
      type: Number,
      default: 0
    },
    colors: {
      type: Array as PropType<string[]>
    },
    showLabels: {
      type: Boolean,
      default: false
    },
    labelFormatter: {
      type: Function as PropType<(value: number, datum: DonutChartDatum, index: number) => string>
    },
    className: {
      type: String
    }
  },
  setup(props) {
    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))

    const resolvedOuterRadius = computed(() => {
      if (typeof props.outerRadius === 'number') return Math.max(0, props.outerRadius)
      return Math.max(0, Math.min(innerRect.value.width, innerRect.value.height) / 2)
    })

    const resolvedInnerRadius = computed(() => {
      if (typeof props.innerRadius === 'number') {
        return Math.min(Math.max(0, props.innerRadius), resolvedOuterRadius.value)
      }

      const ratio = Math.min(Math.max(props.innerRadiusRatio ?? 0.6, 0), 1)
      return resolvedOuterRadius.value * ratio
    })

    return () =>
      h(PieChart, {
        width: props.width,
        height: props.height,
        padding: props.padding,
        data: props.data,
        innerRadius: resolvedInnerRadius.value,
        outerRadius: props.outerRadius,
        startAngle: props.startAngle,
        endAngle: props.endAngle,
        padAngle: props.padAngle,
        colors: props.colors,
        showLabels: props.showLabels,
        labelFormatter: props.labelFormatter,
        className: classNames(props.className)
      })
  }
})

export default DonutChart
