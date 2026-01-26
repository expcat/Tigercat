import { defineComponent, computed, h, PropType, ref } from 'vue'
import {
  chartAxisTickTextClasses,
  chartGridLineClasses,
  classNames,
  createPolygonPath,
  getChartGridLineDasharray,
  getChartInnerRect,
  getRadarAngles,
  getRadarPoints,
  polarToCartesian,
  type ChartPadding,
  type RadarChartDatum,
  type RadarChartProps as CoreRadarChartProps,
  type RadarChartSeries
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartSeries } from './ChartSeries'

const defaultRadarColors = [
  'var(--tiger-chart-1,#2563eb)',
  'var(--tiger-chart-2,#22c55e)',
  'var(--tiger-chart-3,#f97316)',
  'var(--tiger-chart-4,#a855f7)',
  'var(--tiger-chart-5,#0ea5e9)',
  'var(--tiger-chart-6,#ef4444)'
]

export interface VueRadarChartProps extends CoreRadarChartProps {
  data?: RadarChartDatum[]
  series?: RadarChartSeries[]
  padding?: ChartPadding
}

export const RadarChart = defineComponent({
  name: 'TigerRadarChart',
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
      type: Array as PropType<RadarChartDatum[]>
    },
    series: {
      type: Array as PropType<RadarChartSeries[]>
    },
    maxValue: {
      type: Number
    },
    startAngle: {
      type: Number,
      default: -Math.PI / 2
    },
    levels: {
      type: Number,
      default: 5
    },
    showLevelLabels: {
      type: Boolean,
      default: false
    },
    showGrid: {
      type: Boolean,
      default: true
    },
    showAxis: {
      type: Boolean,
      default: true
    },
    showLabels: {
      type: Boolean,
      default: true
    },
    labelOffset: {
      type: Number,
      default: 12
    },
    labelFormatter: {
      type: Function as PropType<(datum: RadarChartDatum, index: number) => string>
    },
    levelLabelFormatter: {
      type: Function as PropType<(value: number, level: number) => string>
    },
    levelLabelOffset: {
      type: Number,
      default: 8
    },
    hoverable: {
      type: Boolean,
      default: false
    },
    activeSeriesIndex: {
      type: Number
    },
    hoverOpacity: {
      type: Number,
      default: 1
    },
    mutedOpacity: {
      type: Number,
      default: 0.25
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    tooltipFormatter: {
      type: Function as PropType<
        (
          datum: RadarChartDatum,
          seriesIndex: number,
          index: number,
          series?: RadarChartSeries
        ) => string
      >
    },
    colors: {
      type: Array as PropType<string[]>
    },
    gridLineStyle: {
      type: String as PropType<'solid' | 'dashed' | 'dotted'>,
      default: 'solid'
    },
    gridStrokeWidth: {
      type: Number,
      default: 1
    },
    strokeColor: {
      type: String,
      default: defaultRadarColors[0]
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    fillColor: {
      type: String,
      default: defaultRadarColors[0]
    },
    fillOpacity: {
      type: Number,
      default: 0.2
    },
    showPoints: {
      type: Boolean,
      default: true
    },
    pointSize: {
      type: Number,
      default: 3
    },
    pointColor: {
      type: String
    },
    title: {
      type: String
    },
    desc: {
      type: String
    },
    className: {
      type: String
    }
  },
  setup(props) {
    const hoveredIndex = ref<number | null>(null)
    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))

    const radius = computed(() =>
      Math.max(0, Math.min(innerRect.value.width, innerRect.value.height) / 2)
    )

    const cx = computed(() => innerRect.value.width / 2)
    const cy = computed(() => innerRect.value.height / 2)

    const resolvedSeries = computed<RadarChartSeries[]>(() => {
      if (props.series && props.series.length > 0) return props.series
      return [{ data: props.data ?? [] }]
    })

    const axisData = computed(() => {
      if (props.series && props.series.length > 0) return props.series[0]?.data ?? []
      return props.data ?? []
    })

    const resolvedMaxValue = computed(() => {
      if (typeof props.maxValue === 'number') return Math.max(0, props.maxValue)
      const values = resolvedSeries.value.flatMap((item) => item.data.map((datum) => datum.value))
      const computedMax = values.length > 0 ? Math.max(...values) : 0
      return computedMax > 0 ? computedMax : 1
    })

    const angles = computed(() => getRadarAngles(axisData.value.length, props.startAngle))

    const seriesPoints = computed(() =>
      resolvedSeries.value.map((item) => ({
        series: item,
        points: getRadarPoints(item.data, {
          cx: cx.value,
          cy: cy.value,
          radius: radius.value,
          startAngle: props.startAngle,
          maxValue: resolvedMaxValue.value
        })
      }))
    )

    const gridPaths = computed(() => {
      if (!props.showGrid || angles.value.length === 0) return []
      const resolvedLevels = Math.max(1, Math.floor(props.levels))

      return Array.from({ length: resolvedLevels }, (_, index) => {
        const levelRadius = radius.value * ((index + 1) / resolvedLevels)
        const ringPoints = angles.value.map((angle) =>
          polarToCartesian(cx.value, cy.value, levelRadius, angle)
        )
        return createPolygonPath(ringPoints)
      })
    })

    const axisLines = computed(() => {
      if (!props.showAxis || angles.value.length === 0) return []
      return angles.value.map((angle) => {
        const end = polarToCartesian(cx.value, cy.value, radius.value, angle)
        return {
          x1: cx.value,
          y1: cy.value,
          x2: end.x,
          y2: end.y
        }
      })
    })

    const labels = computed(() => {
      if (!props.showLabels || angles.value.length === 0) return []
      const formatLabel =
        props.labelFormatter ?? ((datum: RadarChartDatum) => datum.label ?? `${datum.value}`)

      return axisData.value.map((datum, index) => {
        const angle = angles.value[index]
        const position = polarToCartesian(
          cx.value,
          cy.value,
          radius.value + props.labelOffset,
          angle
        )
        return {
          x: position.x,
          y: position.y,
          text: formatLabel(datum, index)
        }
      })
    })

    const levelLabels = computed(() => {
      if (!props.showLevelLabels || !props.showGrid || angles.value.length === 0) return []
      const resolvedLevels = Math.max(1, Math.floor(props.levels))
      const formatLevel = props.levelLabelFormatter ?? ((value: number) => `${value}`)

      return Array.from({ length: resolvedLevels }, (_, index) => {
        const ratio = (index + 1) / resolvedLevels
        const value = resolvedMaxValue.value * ratio
        const position = polarToCartesian(
          cx.value,
          cy.value,
          radius.value * ratio + props.levelLabelOffset,
          props.startAngle
        )

        return {
          x: position.x,
          y: position.y,
          text: formatLevel(value, index)
        }
      })
    })

    const dasharray = computed(() => getChartGridLineDasharray(props.gridLineStyle))
    const palette = computed(() =>
      props.colors && props.colors.length > 0 ? props.colors : defaultRadarColors
    )
    const formatTooltip = computed(
      () =>
        props.tooltipFormatter ??
        ((
          datum: RadarChartDatum,
          seriesIndex: number,
          index: number,
          series?: RadarChartSeries
        ) => {
          const label = datum.label ?? `#${index + 1}`
          const value = datum.value
          const name = series?.name ?? `Series ${seriesIndex + 1}`
          return `${name} · ${label}: ${value}`
        })
    )
    const resolvedActiveIndex = computed(() =>
      typeof props.activeSeriesIndex === 'number'
        ? props.activeSeriesIndex
        : props.hoverable
          ? hoveredIndex.value
          : null
    )
    const shouldHandleHover = computed(
      () => props.hoverable && typeof props.activeSeriesIndex !== 'number'
    )

    return () =>
      h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
          title: props.title,
          desc: props.desc,
          className: classNames(props.className)
        },
        {
          default: () =>
            [
              ...gridPaths.value.map((path, index) =>
                h('path', {
                  key: `grid-${index}`,
                  d: path,
                  class: chartGridLineClasses,
                  fill: 'none',
                  'stroke-width': props.gridStrokeWidth,
                  'stroke-dasharray': dasharray.value
                })
              ),
              ...axisLines.value.map((line, index) =>
                h('line', {
                  key: `axis-${index}`,
                  x1: line.x1,
                  y1: line.y1,
                  x2: line.x2,
                  y2: line.y2,
                  class: chartGridLineClasses,
                  'stroke-width': props.gridStrokeWidth,
                  'stroke-dasharray': dasharray.value
                })
              ),
              ...seriesPoints.value.map((item, seriesIndex) => {
                const seriesColor =
                  item.series.color ?? palette.value[seriesIndex % palette.value.length]
                const resolvedStrokeColor =
                  item.series.strokeColor ?? seriesColor ?? props.strokeColor
                const resolvedFillColor = item.series.fillColor ?? seriesColor ?? props.fillColor
                const resolvedFillOpacity = item.series.fillOpacity ?? props.fillOpacity
                const resolvedStrokeWidth = item.series.strokeWidth ?? props.strokeWidth
                const resolvedShowPoints = item.series.showPoints ?? props.showPoints
                const resolvedPointSize = item.series.pointSize ?? props.pointSize
                const resolvedPointColor = item.series.pointColor ?? seriesColor ?? props.pointColor
                const areaPath = createPolygonPath(
                  item.points.map((point) => ({ x: point.x, y: point.y }))
                )
                const resolvedOpacity =
                  resolvedActiveIndex.value === null
                    ? undefined
                    : seriesIndex === resolvedActiveIndex.value
                      ? props.hoverOpacity
                      : props.mutedOpacity

                return h(
                  ChartSeries,
                  {
                    key: `series-${seriesIndex}`,
                    data: item.series.data,
                    name: item.series.name,
                    type: 'radar',
                    className: item.series.className,
                    opacity: resolvedOpacity,
                    style: props.hoverable ? { cursor: 'pointer' } : undefined,
                    onMouseenter: shouldHandleHover.value
                      ? () => {
                          hoveredIndex.value = seriesIndex
                        }
                      : undefined,
                    onMouseleave: shouldHandleHover.value
                      ? () => {
                          hoveredIndex.value = null
                        }
                      : undefined
                  },
                  {
                    default: () => [
                      areaPath
                        ? h('path', {
                            d: areaPath,
                            fill: resolvedFillColor,
                            'fill-opacity': resolvedFillOpacity,
                            stroke: resolvedStrokeColor,
                            'stroke-width': resolvedStrokeWidth,
                            'data-radar-area': 'true',
                            'data-series-index': seriesIndex
                          })
                        : null,
                      resolvedShowPoints
                        ? item.points.map((point) => {
                            const tooltipText = props.showTooltip
                              ? formatTooltip.value(
                                  point.data,
                                  seriesIndex,
                                  point.index,
                                  item.series
                                )
                              : null

                            return h(
                              'circle',
                              {
                                key: `point-${seriesIndex}-${point.index}`,
                                cx: point.x,
                                cy: point.y,
                                r: point.data.size ?? resolvedPointSize,
                                fill: point.data.color ?? resolvedPointColor ?? resolvedStrokeColor,
                                'data-radar-point': 'true',
                                'data-series-index': seriesIndex
                              },
                              tooltipText ? [h('title', tooltipText)] : undefined
                            )
                          })
                        : null
                    ]
                  }
                )
              }),
              ...labels.value.map((label, index) =>
                h(
                  'text',
                  {
                    key: `label-${index}`,
                    x: label.x,
                    y: label.y,
                    class: chartAxisTickTextClasses,
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle'
                  },
                  label.text
                )
              ),
              ...levelLabels.value.map((label, index) =>
                h(
                  'text',
                  {
                    key: `level-${index}`,
                    x: label.x,
                    y: label.y,
                    class: chartAxisTickTextClasses,
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle',
                    'data-radar-level-label': 'true'
                  },
                  label.text
                )
              )
            ].filter(Boolean)
        }
      )
  }
})

export default RadarChart
