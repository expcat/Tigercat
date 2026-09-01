import { defineComponent, computed, h, PropType } from 'vue'
import {
  chartGridLineClasses,
  classNames,
  coerceClassValue,
  getChartGridLines,
  type ChartGridLine,
  type ChartGridLineStyle,
  type ChartGridProps,
  type ChartScale,
  type ChartScaleValue
} from '@expcat/tigercat-core'

export interface VueChartGridProps extends ChartGridProps {
  xScale?: ChartScale
  yScale?: ChartScale
}

export const ChartGrid = defineComponent({
  name: 'TigerChartGrid',
  inheritAttrs: false,
  props: {
    xScale: {
      type: Object as PropType<ChartScale>
    },
    yScale: {
      type: Object as PropType<ChartScale>
    },
    xRange: {
      type: Array as unknown as PropType<[number, number]>
    },
    yRange: {
      type: Array as unknown as PropType<[number, number]>
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    show: {
      type: String as PropType<ChartGridLine>,
      default: 'both' as ChartGridLine
    },
    xTicks: {
      type: Number,
      default: 5
    },
    yTicks: {
      type: Number,
      default: 5
    },
    xTickValues: {
      type: Array as PropType<ChartScaleValue[]>
    },
    yTickValues: {
      type: Array as PropType<ChartScaleValue[]>
    },
    lineStyle: {
      type: String as PropType<ChartGridLineStyle>,
      default: 'solid' as ChartGridLineStyle
    },
    strokeWidth: {
      type: Number,
      default: 1
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
  setup(props, { attrs }) {
    const lines = computed(() =>
      getChartGridLines({
        xScale: props.xScale,
        yScale: props.yScale,
        xRange: props.xRange,
        yRange: props.yRange,
        width: props.width,
        height: props.height,
        show: props.show,
        xTicks: props.xTicks,
        yTicks: props.yTicks,
        xTickValues: props.xTickValues,
        yTickValues: props.yTickValues,
        lineStyle: props.lineStyle,
        strokeWidth: props.strokeWidth
      })
    )

    const gridClasses = computed(() => classNames(coerceClassValue(attrs.class), props.className))

    return () =>
      h(
        'g',
        {
          ...attrs,
          class: gridClasses.value,
          transform: `translate(${props.x}, ${props.y})`,
          'aria-hidden': 'true'
        },
        lines.value.map((line) =>
          h('line', {
            key: line.key,
            x1: line.x1,
            y1: line.y1,
            x2: line.x2,
            y2: line.y2,
            class: chartGridLineClasses,
            'stroke-width': line.strokeWidth,
            'stroke-dasharray': line.strokeDasharray
          })
        )
      )
  }
})

export default ChartGrid
