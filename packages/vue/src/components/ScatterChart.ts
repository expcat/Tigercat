import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  createLinearScale,
  getChartInnerRect,
  getNumberExtent,
  type ChartGridLineStyle,
  type ChartPadding,
  type ChartScale,
  type ChartScaleValue,
  type ScatterChartDatum,
  type ScatterChartProps as CoreScatterChartProps
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartSeries } from './ChartSeries'

export interface VueScatterChartProps extends CoreScatterChartProps {
  data: ScatterChartDatum[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
}

export const ScatterChart = defineComponent({
  name: 'TigerScatterChart',
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
      type: Array as PropType<ScatterChartDatum[]>,
      required: true
    },
    xScale: {
      type: Object as PropType<ChartScale>
    },
    yScale: {
      type: Object as PropType<ChartScale>
    },
    pointSize: {
      type: Number,
      default: 4
    },
    pointColor: {
      type: String,
      default: 'var(--tiger-primary,#2563eb)'
    },
    pointOpacity: {
      type: Number
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    showAxis: {
      type: Boolean,
      default: true
    },
    includeZero: {
      type: Boolean,
      default: false
    },
    xAxisLabel: {
      type: String
    },
    yAxisLabel: {
      type: String
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
      type: Array as PropType<number[]>
    },
    yTickValues: {
      type: Array as PropType<number[]>
    },
    xTickFormat: {
      type: Function as PropType<(value: ChartScaleValue) => string>
    },
    yTickFormat: {
      type: Function as PropType<(value: ChartScaleValue) => string>
    },
    gridLineStyle: {
      type: String as PropType<ChartGridLineStyle>,
      default: 'solid' as ChartGridLineStyle
    },
    gridStrokeWidth: {
      type: Number,
      default: 1
    },
    className: {
      type: String
    }
  },
  setup(props) {
    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))

    const xValues = computed(() => props.data.map((item) => item.x))
    const yValues = computed(() => props.data.map((item) => item.y))

    const resolvedXScale = computed(() => {
      if (props.xScale) return props.xScale
      const extent = getNumberExtent(xValues.value, { includeZero: props.includeZero })
      return createLinearScale(extent, [0, innerRect.value.width])
    })

    const resolvedYScale = computed(() => {
      if (props.yScale) return props.yScale
      const extent = getNumberExtent(yValues.value, { includeZero: props.includeZero })
      return createLinearScale(extent, [innerRect.value.height, 0])
    })

    return () =>
      h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
          className: classNames(props.className)
        },
        {
          default: () =>
            [
              props.showGrid
                ? h(ChartGrid, {
                    xScale: resolvedXScale.value,
                    yScale: resolvedYScale.value,
                    show: 'both',
                    xTicks: props.xTicks,
                    yTicks: props.yTicks,
                    xTickValues: props.xTickValues,
                    yTickValues: props.yTickValues,
                    lineStyle: props.gridLineStyle,
                    strokeWidth: props.gridStrokeWidth
                  })
                : null,
              props.showAxis
                ? h(ChartAxis, {
                    scale: resolvedXScale.value,
                    orientation: 'bottom',
                    y: innerRect.value.height,
                    ticks: props.xTicks,
                    tickValues: props.xTickValues,
                    tickFormat: props.xTickFormat,
                    label: props.xAxisLabel
                  })
                : null,
              props.showAxis
                ? h(ChartAxis, {
                    scale: resolvedYScale.value,
                    orientation: 'left',
                    ticks: props.yTicks,
                    tickValues: props.yTickValues,
                    tickFormat: props.yTickFormat,
                    label: props.yAxisLabel
                  })
                : null,
              h(
                ChartSeries,
                {
                  data: props.data,
                  type: 'scatter'
                },
                {
                  default: () =>
                    props.data.map((item, index) =>
                      h('circle', {
                        key: `point-${index}`,
                        cx: resolvedXScale.value.map(item.x),
                        cy: resolvedYScale.value.map(item.y),
                        r: item.size ?? props.pointSize,
                        fill: item.color ?? props.pointColor,
                        opacity: props.pointOpacity
                      })
                    )
                }
              )
            ].filter(Boolean)
        }
      )
  }
})

export default ScatterChart
