import { defineComponent, computed, h, PropType, ref } from 'vue'
import {
  classNames,
  createAreaPath,
  createLinearScale,
  createLinePath,
  createPointScale,
  getAreaGradientPrefix,
  getChartElementOpacity,
  getChartInnerRect,
  getNumberExtent,
  stackSeriesData,
  resolveChartPalette,
  buildChartLegendItems,
  resolveMultiSeriesTooltipContent,
  resolveSeriesData,
  defaultSeriesXYTooltipFormatter,
  type AreaChartDatum,
  type AreaChartProps as CoreAreaChartProps,
  type AreaChartSeries,
  type ChartCurveType,
  type ChartGridLineStyle,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type ChartScale,
  type ChartScaleValue
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'

export interface VueAreaChartProps extends CoreAreaChartProps {
  data?: AreaChartDatum[]
  series?: AreaChartSeries[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
}

export const AreaChart = defineComponent({
  name: 'TigerAreaChart',
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
      type: Array as PropType<AreaChartDatum[]>
    },
    series: {
      type: Array as PropType<AreaChartSeries[]>
    },
    xScale: {
      type: Object as PropType<ChartScale>
    },
    yScale: {
      type: Object as PropType<ChartScale>
    },
    areaColor: {
      type: String,
      default: 'var(--tiger-primary,#2563eb)'
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    fillOpacity: {
      type: Number,
      default: 0.2
    },
    curve: {
      type: String as PropType<ChartCurveType>,
      default: 'linear'
    },
    showPoints: {
      type: Boolean,
      default: false
    },
    pointSize: {
      type: Number,
      default: 4
    },
    pointColor: {
      type: String
    },
    stacked: {
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
    showXAxis: {
      type: Boolean,
      default: true
    },
    showYAxis: {
      type: Boolean,
      default: true
    },
    includeZero: {
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
      default: 'solid'
    },
    gridStrokeWidth: {
      type: Number,
      default: 1
    },
    colors: {
      type: Array as PropType<string[]>
    },
    // Interaction props
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
    // Legend props
    showLegend: {
      type: Boolean,
      default: false
    },
    legendPosition: {
      type: String as PropType<ChartLegendPosition>,
      default: 'bottom'
    },
    legendMarkerSize: {
      type: Number,
      default: 10
    },
    legendGap: {
      type: Number,
      default: 8
    },
    // Tooltip props
    showTooltip: {
      type: Boolean,
      default: true
    },
    gradient: {
      type: Boolean,
      default: false
    },
    animated: {
      type: Boolean,
      default: false
    },
    pointHollow: {
      type: Boolean,
      default: false
    },
    tooltipFormatter: {
      type: Function as PropType<
        (
          datum: AreaChartDatum,
          seriesIndex: number,
          pointIndex: number,
          series?: AreaChartSeries
        ) => string
      >
    },
    legendFormatter: {
      type: Function as PropType<(series: AreaChartSeries, index: number) => string>
    },
    // Accessibility
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
  emits: [
    'update:hoveredIndex',
    'update:selectedIndex',
    'series-click',
    'series-hover',
    'point-click',
    'point-hover'
  ],
  setup(props, { emit }) {
    // Point-level hover state (not managed by composable)
    const hoveredPointInfo = ref<{ seriesIndex: number; pointIndex: number } | null>(null)
    const tooltipPosition = ref({ x: 0, y: 0 })

    // Unique gradient prefix for area fills
    const gradientPrefix = getAreaGradientPrefix()

    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))

    // Normalize series data
    const resolvedSeries = computed<AreaChartSeries[]>(() =>
      resolveSeriesData(props.series, props.data)
    )

    // Use shared interaction composable for series-level interaction
    const {
      resolvedHoveredIndex: _resolvedHoveredIndex,
      resolvedSelectedIndex: _resolvedSelectedIndex,
      activeIndex,
      handleMouseEnter: handleSeriesHoverEnter,
      handleMouseLeave: handleSeriesHoverLeave,
      handleClick: handleSeriesSelect,
      handleLegendClick: _handleLegendClick,
      handleLegendHover: _handleLegendHover,
      handleLegendLeave: _handleLegendLeave,
      wrapperClasses
    } = useChartInteraction<AreaChartSeries>({
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

    // Collect all x values and y values
    const allData = computed(() => resolvedSeries.value.flatMap((s) => s.data))

    const xValues = computed(() => allData.value.map((d) => d.x))
    const yValues = computed(() => {
      if (props.stacked) {
        // For stacked, we need max of cumulative values
        const stackedData = stackSeriesData(resolvedSeries.value.map((s) => s.data))
        return stackedData.flatMap((series) => series.map((d) => d.y1))
      }
      return allData.value.map((d) => d.y)
    })

    // Determine if x axis is numeric or categorical
    const isXNumeric = computed(() => xValues.value.every((v) => typeof v === 'number'))

    const resolvedXScale = computed(() => {
      if (props.xScale) return props.xScale

      if (isXNumeric.value) {
        const extent = getNumberExtent(xValues.value as number[], { includeZero: false })
        return createLinearScale(extent, [0, innerRect.value.width])
      } else {
        const categories = [...new Set(xValues.value.map(String))]
        return createPointScale(categories, [0, innerRect.value.width], { padding: 0 })
      }
    })

    const resolvedYScale = computed(() => {
      if (props.yScale) return props.yScale
      const extent = getNumberExtent(yValues.value, { includeZero: props.includeZero })
      return createLinearScale(extent, [innerRect.value.height, 0])
    })

    const baseline = computed(() => resolvedYScale.value.map(0))

    const shouldShowXAxis = computed(() => props.showAxis && props.showXAxis)
    const shouldShowYAxis = computed(() => props.showAxis && props.showYAxis)

    const palette = computed(() => resolveChartPalette(props.colors))

    // Calculate area paths and points for each series
    const seriesData = computed(() => {
      const stackedData = props.stacked
        ? stackSeriesData(resolvedSeries.value.map((s) => s.data))
        : null

      return resolvedSeries.value.map((series, seriesIndex) => {
        const color = series.color ?? palette.value[seriesIndex % palette.value.length]
        const fillColor = series.fillColor ?? color
        const seriesFillOpacity = series.fillOpacity ?? props.fillOpacity

        let points: Array<{ x: number; y: number; datum: AreaChartDatum; pointIndex: number }>
        let areaPath: string
        let linePath: string

        if (props.stacked && stackedData) {
          // Stacked mode
          const stackedSeries = stackedData[seriesIndex]
          points = stackedSeries.map((sd, pointIndex) => ({
            x: resolvedXScale.value.map(sd.original.x),
            y: resolvedYScale.value.map(sd.y1),
            datum: sd.original,
            pointIndex
          }))

          // For stacked area, we need custom path that goes from y0 to y1
          const topPoints = points.map((p) => ({ x: p.x, y: p.y }))
          const bottomPoints = stackedSeries
            .map((sd) => ({
              x: resolvedXScale.value.map(sd.original.x),
              y: resolvedYScale.value.map(sd.y0)
            }))
            .reverse()

          const topPath = createLinePath(topPoints, props.curve)
          const bottomPath = createLinePath(bottomPoints, props.curve).replace('M', 'L')
          areaPath = `${topPath} ${bottomPath} Z`
          linePath = topPath
        } else {
          // Non-stacked mode
          points = series.data.map((datum, pointIndex) => ({
            x: resolvedXScale.value.map(datum.x),
            y: resolvedYScale.value.map(datum.y),
            datum,
            pointIndex
          }))

          areaPath = createAreaPath(points, baseline.value, props.curve)
          linePath = createLinePath(points, props.curve)
        }

        const opacity = getChartElementOpacity(seriesIndex, activeIndex.value, {
          activeOpacity: props.activeOpacity,
          inactiveOpacity: props.inactiveOpacity
        })

        return {
          series,
          seriesIndex,
          color,
          fillColor,
          fillOpacity: seriesFillOpacity,
          areaPath,
          linePath,
          points,
          opacity,
          strokeWidth: series.strokeWidth ?? props.strokeWidth,
          strokeDasharray: series.strokeDasharray,
          showPoints: series.showPoints ?? props.showPoints,
          pointSize: series.pointSize ?? props.pointSize,
          pointColor: series.pointColor ?? color,
          pointHollow: series.pointHollow ?? props.pointHollow
        }
      })
    })

    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: resolvedSeries.value,
        palette: palette.value,
        activeIndex: activeIndex.value,
        getLabel: (s, i) =>
          props.legendFormatter ? props.legendFormatter(s, i) : (s.name ?? `Series ${i + 1}`),
        getColor: (s, i) => s.color ?? palette.value[i % palette.value.length]
      })
    )

    const tooltipContent = computed(() =>
      resolveMultiSeriesTooltipContent(
        hoveredPointInfo.value,
        resolvedSeries.value,
        props.tooltipFormatter,
        defaultSeriesXYTooltipFormatter
      )
    )

    const handlePointMouseEnter = (seriesIndex: number, pointIndex: number, event: MouseEvent) => {
      hoveredPointInfo.value = { seriesIndex, pointIndex }
      tooltipPosition.value = { x: event.clientX, y: event.clientY }
      emit(
        'point-hover',
        seriesIndex,
        pointIndex,
        resolvedSeries.value[seriesIndex]?.data[pointIndex]
      )
    }

    const handlePointMouseMove = (event: MouseEvent) => {
      tooltipPosition.value = { x: event.clientX, y: event.clientY }
    }

    const handlePointMouseLeave = () => {
      hoveredPointInfo.value = null
      emit('point-hover', null, null, null)
    }

    const handlePointClick = (seriesIndex: number, pointIndex: number) => {
      emit(
        'point-click',
        seriesIndex,
        pointIndex,
        resolvedSeries.value[seriesIndex]?.data[pointIndex]
      )
      handleSeriesSelect(seriesIndex)
    }

    const handleKeyDown = (event: KeyboardEvent, seriesIndex: number) => {
      if (!props.selectable) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleSeriesSelect(seriesIndex)
    }

    return () => {
      const reversedSeriesData = [...seriesData.value].reverse()

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
              // Gradient defs and animation styles
              props.gradient || props.animated
                ? h('defs', null, [
                    // Animation keyframes
                    props.animated
                      ? h(
                          'style',
                          null,
                          `
                          .tiger-area-animated {
                            animation: tiger-area-draw 1.2s cubic-bezier(.4,0,.2,1) forwards;
                          }
                          @keyframes tiger-area-draw {
                            from { stroke-dashoffset: 1; }
                            to { stroke-dashoffset: 0; }
                          }
                        `
                        )
                      : null,
                    // Area fill gradients
                    ...(props.gradient
                      ? reversedSeriesData.map((sd) =>
                          h(
                            'linearGradient',
                            {
                              key: `area-grad-${sd.seriesIndex}`,
                              id: `${gradientPrefix}-${sd.seriesIndex}`,
                              x1: '0',
                              y1: '0',
                              x2: '0',
                              y2: '1'
                            },
                            [
                              h('stop', {
                                offset: '0%',
                                'stop-color': sd.fillColor,
                                'stop-opacity': sd.fillOpacity
                              }),
                              h('stop', {
                                offset: '100%',
                                'stop-color': sd.fillColor,
                                'stop-opacity': 0.02
                              })
                            ]
                          )
                        )
                      : [])
                  ])
                : null,
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
              shouldShowXAxis.value
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
              shouldShowYAxis.value
                ? h(ChartAxis, {
                    scale: resolvedYScale.value,
                    orientation: 'left',
                    ticks: props.yTicks,
                    tickValues: props.yTickValues,
                    tickFormat: props.yTickFormat,
                    label: props.yAxisLabel
                  })
                : null,
              // Layer 1: area fills + line strokes (reverse order for proper stacking visual)
              ...reversedSeriesData.map((sd) =>
                h(
                  ChartSeries,
                  {
                    key: `series-${sd.seriesIndex}`,
                    data: sd.series.data,
                    name: sd.series.name,
                    type: 'area',
                    opacity: sd.opacity,
                    class: classNames(
                      sd.series.className,
                      (props.hoverable || props.selectable) && 'cursor-pointer',
                      'outline-none'
                    ),
                    onMouseenter: (e: MouseEvent) => handleSeriesHoverEnter(sd.seriesIndex, e),
                    onMouseleave: handleSeriesHoverLeave,
                    onClick: () => handleSeriesSelect(sd.seriesIndex),
                    tabindex: props.selectable ? 0 : undefined,
                    onKeydown: (e: KeyboardEvent) => handleKeyDown(e, sd.seriesIndex)
                  },
                  {
                    default: () => [
                      // Area fill
                      h('path', {
                        d: sd.areaPath,
                        fill: props.gradient
                          ? `url(#${gradientPrefix}-${sd.seriesIndex})`
                          : sd.fillColor,
                        'fill-opacity': props.gradient ? 1 : sd.fillOpacity,
                        stroke: 'none',
                        class: 'transition-opacity duration-300',
                        'data-area-series': sd.seriesIndex
                      }),
                      // Line stroke
                      h('path', {
                        d: sd.linePath,
                        fill: 'none',
                        stroke: sd.color,
                        'stroke-width': sd.strokeWidth,
                        'stroke-dasharray': props.animated
                          ? (sd.strokeDasharray ?? '1')
                          : sd.strokeDasharray,
                        'stroke-dashoffset': props.animated ? '1' : undefined,
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        pathLength: props.animated ? 1 : undefined,
                        class: classNames(
                          'transition-opacity duration-200',
                          props.animated && 'tiger-area-animated'
                        )
                      })
                    ]
                  }
                )
              ),
              // Layer 2: data points on top of all areas (prevents coverage)
              ...seriesData.value
                .filter((sd) => sd.showPoints)
                .map((sd) =>
                  h(
                    'g',
                    { key: `points-${sd.seriesIndex}`, opacity: sd.opacity },
                    sd.points.map((point) => {
                      const isHovered =
                        hoveredPointInfo.value?.seriesIndex === sd.seriesIndex &&
                        hoveredPointInfo.value?.pointIndex === point.pointIndex
                      const hoverSize = sd.pointSize + 2
                      return h('circle', {
                        key: `point-${sd.seriesIndex}-${point.pointIndex}`,
                        cx: point.x,
                        cy: point.y,
                        r: isHovered ? hoverSize : sd.pointSize,
                        fill: sd.pointHollow ? 'white' : sd.pointColor,
                        stroke: sd.pointHollow ? sd.pointColor : 'none',
                        'stroke-width': sd.pointHollow ? 2 : 0,
                        class: 'transition-all duration-200 ease-out',
                        style: isHovered ? `filter: drop-shadow(0 0 4px ${sd.color})` : undefined,
                        'data-point-index': point.pointIndex,
                        onMouseenter: (e: MouseEvent) =>
                          handlePointMouseEnter(sd.seriesIndex, point.pointIndex, e),
                        onMousemove: handlePointMouseMove,
                        onMouseleave: handlePointMouseLeave,
                        onClick: (e: MouseEvent) => {
                          e.stopPropagation()
                          handlePointClick(sd.seriesIndex, point.pointIndex)
                        }
                      })
                    })
                  )
                )
            ].filter(Boolean)
        }
      )

      const tooltip = props.showTooltip
        ? h(ChartTooltip, {
            content: tooltipContent.value,
            visible: hoveredPointInfo.value !== null && tooltipContent.value !== '',
            x: tooltipPosition.value.x,
            y: tooltipPosition.value.y
          })
        : null

      if (!props.showLegend) {
        return h('div', { class: 'inline-block relative' }, [chart, tooltip])
      }

      return h('div', { class: wrapperClasses.value }, [
        chart,
        h(ChartLegend, {
          items: legendItems.value,
          position: props.legendPosition,
          markerSize: props.legendMarkerSize,
          gap: props.legendGap,
          interactive: props.hoverable || props.selectable,
          onItemClick: handleSeriesSelect,
          onItemHover: handleSeriesHoverEnter,
          onItemLeave: handleSeriesHoverLeave
        }),
        tooltip
      ])
    }
  }
})

export default AreaChart
