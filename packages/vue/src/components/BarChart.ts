import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  createBandScale,
  createLinearScale,
  getChartInnerRect,
  getNumberExtent,
  type BarChartDatum,
  type BarChartProps as CoreBarChartProps,
  type ChartGridLineStyle,
  type ChartPadding,
  type ChartScale,
  type ChartScaleValue
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartSeries } from './ChartSeries'

export interface VueBarChartProps extends CoreBarChartProps {
  data: BarChartDatum[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
}

export const BarChart = defineComponent({
  name: 'TigerBarChart',
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
      type: Array as PropType<BarChartDatum[]>,
      required: true
    },
    xScale: {
      type: Object as PropType<ChartScale>
    },
    yScale: {
      type: Object as PropType<ChartScale>
    },
    barColor: {
      type: String,
      default: 'var(--tiger-primary,#2563eb)'
    },
    barRadius: {
      type: Number,
      default: 4
    },
    barPaddingInner: {
      type: Number,
      default: 0.2
    },
    barPaddingOuter: {
      type: Number,
      default: 0.1
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    showAxis: {
      type: Boolean,
      default: true
    },
    showXAxis: {
      type: Boolean,
      default: true
    },
    showYAxis: {
      type: Boolean,
      default: true
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
      type: Array as PropType<ChartScaleValue[]>
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

    const xDomain = computed(() => props.data.map((item) => String(item.x)))
    const yValues = computed(() => props.data.map((item) => item.y))

    const resolvedXScale = computed(() => {
      if (props.xScale) return props.xScale
      return createBandScale(xDomain.value, [0, innerRect.value.width], {
        paddingInner: props.barPaddingInner,
        paddingOuter: props.barPaddingOuter
      })
    })

    const resolvedYScale = computed(() => {
      if (props.yScale) return props.yScale
      const extent = getNumberExtent(yValues.value, { includeZero: true })
      return createLinearScale(extent, [innerRect.value.height, 0])
    })

    const showXAxis = computed(() => props.showAxis && props.showXAxis)
    const showYAxis = computed(() => props.showAxis && props.showYAxis)

    const bars = computed(() => {
      const scale = resolvedXScale.value
      const bandWidth =
        scale.bandwidth ??
        (scale.step
          ? scale.step * 0.7
          : (innerRect.value.width / Math.max(1, props.data.length)) * 0.8)
      const baseline = resolvedYScale.value.map(0)

      return props.data.map((item) => {
        const xKey = scale.type === 'linear' ? Number(item.x) : String(item.x)
        const xPos = scale.map(xKey)
        const barX = scale.bandwidth ? xPos : xPos - bandWidth / 2
        const barYValue = resolvedYScale.value.map(item.y)
        const barHeight = Math.abs(baseline - barYValue)
        const barY = Math.min(baseline, barYValue)

        return {
          x: barX,
          y: barY,
          width: bandWidth,
          height: barHeight,
          color: item.color ?? props.barColor
        }
      })
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
              showXAxis.value
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
              showYAxis.value
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
                  type: 'bar'
                },
                {
                  default: () =>
                    bars.value.map((bar, index) =>
                      h('rect', {
                        key: `bar-${index}`,
                        x: bar.x,
                        y: bar.y,
                        width: bar.width,
                        height: bar.height,
                        rx: props.barRadius,
                        ry: props.barRadius,
                        fill: bar.color
                      })
                    )
                }
              )
            ].filter(Boolean)
        }
      )
  }
})

export default BarChart
