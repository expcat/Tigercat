import { defineComponent, computed, h, ref, PropType } from 'vue'
import {
  chartAxisTickTextClasses,
  chartGridLineClasses,
  classNames,
  createPolygonPath,
  DEFAULT_CHART_COLORS,
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
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'

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
    hoveredIndex: {
      type: Number as PropType<number | null>,
      default: undefined
    },
    activeOpacity: {
      type: Number,
      default: 1
    },
    inactiveOpacity: {
      type: Number,
      default: 0.25
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selectedIndex: {
      type: Number as PropType<number | null>,
      default: undefined
    },
    showLegend: {
      type: Boolean,
      default: false
    },
    legendPosition: {
      type: String as PropType<'bottom' | 'right'>,
      default: 'bottom'
    },
    legendFormatter: {
      type: Function as PropType<(series: RadarChartSeries, index: number) => string>
    },
    legendMarkerSize: {
      type: Number,
      default: 10
    },
    legendGap: {
      type: Number,
      default: 8
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
      default: DEFAULT_CHART_COLORS[0]
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    fillColor: {
      type: String,
      default: DEFAULT_CHART_COLORS[0]
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
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'series-click', 'series-hover'],
  setup(props, { emit }) {
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

    // Use shared interaction composable
    const {
      resolvedHoveredIndex: _resolvedHoveredIndex,
      resolvedSelectedIndex: _resolvedSelectedIndex,
      activeIndex: resolvedActiveIndex,
      tooltipPosition,
      handleMouseEnter: handleHoverEnter,
      handleMouseMove,
      handleMouseLeave: handleHoverLeave,
      handleClick: handleSelectIndex,
      wrapperClasses
    } = useChartInteraction<RadarChartSeries>({
      hoverable: computed(() => props.hoverable),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      emit: emit as (event: string, ...args: unknown[]) => void,
      getData: (index: number) => resolvedSeries.value[index],
      eventNames: {
        hover: 'series-hover',
        click: 'series-click'
      }
    })

    // Point-level hover state for tooltip
    const hoveredPoint = ref<{ seriesIndex: number; pointIndex: number } | null>(null)

    const handlePointEnter = (seriesIndex: number, pointIndex: number, event: MouseEvent) => {
      if (!props.hoverable) return
      hoveredPoint.value = { seriesIndex, pointIndex }
      handleHoverEnter(seriesIndex, event)
    }

    const handlePointMove = (event: MouseEvent) => {
      handleMouseMove(event)
    }

    const handlePointLeave = () => {
      hoveredPoint.value = null
      handleHoverLeave()
    }

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
      props.colors && props.colors.length > 0 ? props.colors : [...DEFAULT_CHART_COLORS]
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

    const tooltipContent = computed(() => {
      if (!hoveredPoint.value) return ''
      const { seriesIndex, pointIndex } = hoveredPoint.value
      const series = resolvedSeries.value[seriesIndex]
      if (!series) return ''
      const datum = series.data[pointIndex]
      if (!datum) return ''
      return formatTooltip.value(datum, seriesIndex, pointIndex, series)
    })

    const resolvedLegendItems = computed(() =>
      resolvedSeries.value.map((item, index) => {
        const color = item.color ?? palette.value[index % palette.value.length]
        const label = props.legendFormatter
          ? props.legendFormatter(item, index)
          : (item.name ?? `Series ${index + 1}`)

        return {
          index,
          label,
          color
        }
      })
    )
    const legendContainerClasses = computed(() =>
      classNames(
        'flex flex-wrap',
        props.legendPosition === 'right' ? 'flex-col gap-2' : 'flex-row gap-3'
      )
    )

    return () => {
      const chart = h(
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
                      ? props.activeOpacity
                      : props.inactiveOpacity

                return h(
                  ChartSeries,
                  {
                    key: `series-${seriesIndex}`,
                    data: item.series.data,
                    name: item.series.name,
                    type: 'radar',
                    class: classNames(
                      item.series.className,
                      props.hoverable || props.selectable ? 'cursor-pointer' : null
                    ),
                    opacity: resolvedOpacity,
                    onMouseenter: props.hoverable
                      ? (e: MouseEvent) => handleHoverEnter(seriesIndex, e)
                      : undefined,
                    onMouseleave: props.hoverable ? handleHoverLeave : undefined,
                    onClick: props.selectable ? () => handleSelectIndex(seriesIndex) : undefined,
                    tabindex: props.selectable ? 0 : undefined,
                    onKeydown: (event: KeyboardEvent) => {
                      if (!props.selectable) return
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      handleSelectIndex(seriesIndex)
                    }
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
                            return h('circle', {
                              key: `point-${seriesIndex}-${point.index}`,
                              cx: point.x,
                              cy: point.y,
                              r: point.data.size ?? resolvedPointSize,
                              fill: point.data.color ?? resolvedPointColor ?? resolvedStrokeColor,
                              class: props.showTooltip && props.hoverable ? 'cursor-pointer' : null,
                              'data-radar-point': 'true',
                              'data-series-index': seriesIndex,
                              'data-point-index': point.index,
                              onMouseenter:
                                props.showTooltip && props.hoverable
                                  ? (e: MouseEvent) => handlePointEnter(seriesIndex, point.index, e)
                                  : undefined,
                              onMousemove:
                                props.showTooltip && props.hoverable ? handlePointMove : undefined,
                              onMouseleave:
                                props.showTooltip && props.hoverable ? handlePointLeave : undefined
                            })
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

      const tooltip =
        props.showTooltip && props.hoverable
          ? h(ChartTooltip, {
              content: tooltipContent.value,
              visible: hoveredPoint.value !== null && tooltipContent.value !== '',
              x: tooltipPosition.value.x,
              y: tooltipPosition.value.y
            })
          : null

      if (!props.showLegend) {
        return h('div', { class: 'inline-block relative' }, [chart, tooltip])
      }

      return h('div', { class: wrapperClasses.value }, [
        chart,
        h(
          'div',
          { class: legendContainerClasses.value },
          resolvedLegendItems.value.map((item) =>
            h(
              'button',
              {
                key: `legend-${item.index}`,
                type: 'button',
                class: classNames(
                  'flex items-center gap-2 text-sm text-gray-600',
                  props.selectable ? 'cursor-pointer' : 'cursor-default'
                ),
                onClick: props.selectable ? () => handleSelectIndex(item.index) : undefined,
                onMouseenter: props.hoverable
                  ? (e: MouseEvent) => handleHoverEnter(item.index, e)
                  : undefined,
                onMouseleave: props.hoverable ? handlePointLeave : undefined
              },
              [
                h('span', {
                  class: 'inline-block rounded-full',
                  style: {
                    width: `${props.legendMarkerSize}px`,
                    height: `${props.legendMarkerSize}px`,
                    backgroundColor: item.color
                  }
                }),
                h('span', { style: { marginRight: `${props.legendGap}px` } }, item.label)
              ]
            )
          )
        ),
        tooltip
      ])
    }
  }
})

export default RadarChart
