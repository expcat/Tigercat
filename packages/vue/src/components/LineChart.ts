import { defineComponent, computed, h, PropType, ref, useId } from 'vue'
import {
  classNames,
  coerceClassValue,
  createLinearScale,
  createPointScale,
  getStableChartGradientPrefix,
  getNumberExtent,
  linePointTransitionClasses,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  DEFAULT_CHART_PADDING,
  buildChartSeriesKeys,
  resolveMultiSeriesTooltipContent,
  resolveSeriesData,
  defaultSeriesXYTooltipFormatter,
  defaultChartSeriesName,
  layoutLineSeries,
  getCartesianChartShellClasses,
  findNearestSeriesPoint,
  flattenChartPoints,
  chartPointTabIndex,
  nextChartPointRef,
  isChartNavigationKey,
  isNumericChartDomain,
  CHART_SURFACE_FILL,
  LINE_DRAW_CLASS,
  getChartLabels,
  mergeTigerLocale,
  formatChartTemplate,
  type ChartCurveType,
  type ChartGridLineStyle,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type ChartScale,
  type ChartScaleValue,
  type LineChartDatum,
  type LineChartProps as CoreLineChartProps,
  type LineChartSeries
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'
import { useResponsiveChartSize } from '../composables/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface VueLineChartProps extends CoreLineChartProps {
  data?: LineChartDatum[]
  series?: LineChartSeries[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
  onPointClick?: (seriesIndex: number, pointIndex: number, datum: LineChartDatum) => void
}

export type LineChartProps = VueLineChartProps

// Asymmetric default padding leaves room for the left y-axis tick labels
// (3-digit / currency values) and the bottom x-axis label so they are not clipped.

export const LineChart = defineComponent({
  name: 'TigerLineChart',
  inheritAttrs: false,
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
      default: () => ({ ...DEFAULT_CHART_PADDING })
    },
    responsive: { type: Boolean, default: false },
    data: {
      type: Array as PropType<LineChartDatum[]>
    },
    series: {
      type: Array as PropType<LineChartSeries[]>
    },
    xScale: {
      type: Object as PropType<ChartScale>
    },
    yScale: {
      type: Object as PropType<ChartScale>
    },
    lineColor: {
      type: String,
      default: 'var(--tiger-primary,#2563eb)'
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    curve: {
      type: String as PropType<ChartCurveType>,
      default: 'linear'
    },
    showPoints: {
      type: Boolean,
      default: true
    },
    pointSize: {
      type: Number,
      default: 4
    },
    pointColor: {
      type: String
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
    // Area fill props
    showArea: {
      type: Boolean,
      default: false
    },
    areaOpacity: {
      type: Number,
      default: 0.15
    },
    // Point styling
    pointHollow: {
      type: Boolean,
      default: false
    },
    // Animation
    animated: {
      type: Boolean,
      default: false
    },
    // Stroke gradient (modern look — opt-in)
    strokeGradient: {
      type: Boolean,
      default: false
    },
    // Point fill radial gradient (modern look — opt-in)
    pointGradient: {
      type: Boolean,
      default: false
    },
    // Tooltip props
    showTooltip: {
      type: Boolean,
      default: true
    },
    tooltipFormatter: {
      type: Function as PropType<
        (
          datum: LineChartDatum,
          seriesIndex: number,
          pointIndex: number,
          series?: LineChartSeries
        ) => string
      >
    },
    legendFormatter: {
      type: Function as PropType<(series: LineChartSeries, index: number) => string>
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
    },
    onPointClick: {
      type: Function as PropType<
        (seriesIndex: number, pointIndex: number, datum: LineChartDatum) => void
      >
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
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getChartLabels(mergeTigerLocale(config.value.locale)))
    const hoveredPointInfo = ref<{ seriesIndex: number; pointIndex: number } | null>(null)
    const tooltipPosition = ref({ x: 0, y: 0 })

    // Unique gradient prefix for area fills
    const gradientPrefix = getStableChartGradientPrefix('line', useId())

    const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
      () => props.width,
      () => props.height,
      () => props.padding,
      () => props.responsive
    )

    // Normalize series data. Single-series colors (`lineColor`/`pointColor`)
    // seed the synthesized series so they apply when only `data` is provided.
    const resolvedSeries = computed<LineChartSeries[]>(() =>
      resolveSeriesData(props.series, props.data, {
        color: props.lineColor,
        pointColor: props.pointColor
      } as Partial<Omit<LineChartSeries, 'data'>>)
    )

    // Use shared interaction composable for series-level interaction
    const {
      activeIndex,
      resolvedSelectedIndex,
      handleMouseEnter: handleSeriesHoverEnter,
      handleMouseLeave: handleSeriesHoverLeave,
      handleClick: handleSeriesSelect,
      handleLegendClick,
      handleLegendHover,
      handleLegendLeave
    } = useChartInteraction<LineChartSeries>({
      hoverable: computed(() => props.hoverable),
      showTooltip: computed(() => props.showTooltip),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      onHoveredIndexChange: (index) => emit('update:hoveredIndex', index),
      onSelectedIndexChange: (index) => emit('update:selectedIndex', index),
      getData: (index: number) => resolvedSeries.value[index],
      onHover: (index, datum) => emit('series-hover', index, datum),
      onClick: (index, datum) => emit('series-click', index, datum)
    })

    // Collect all x values and y values
    const allData = computed(() => resolvedSeries.value.flatMap((s) => s.data))

    const xValues = computed(() => allData.value.map((d) => d.x))
    const yValues = computed(() => allData.value.map((d) => d.y))

    // Determine if x axis is numeric or categorical
    const isXNumeric = computed(() => isNumericChartDomain(xValues.value))

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
      const extent = getNumberExtent(yValues.value, {
        includeZero: props.includeZero || props.showArea
      })
      return createLinearScale(extent, [innerRect.value.height, 0])
    })

    const shouldShowXAxis = computed(() => props.showAxis && props.showXAxis)
    const shouldShowYAxis = computed(() => props.showAxis && props.showYAxis)

    const palette = computed(() => resolveChartPalette(props.colors))
    const seriesKeys = computed(() =>
      buildChartSeriesKeys(resolvedSeries.value, { prefix: 'line-' })
    )

    const seriesData = computed(() => {
      const laidOut = layoutLineSeries(
        resolvedSeries.value,
        resolvedXScale.value,
        resolvedYScale.value,
        {
          curve: props.curve,
          palette: palette.value,
          activeIndex: activeIndex.value,
          showArea: props.showArea,
          areaOpacity: props.areaOpacity,
          strokeWidth: props.strokeWidth,
          showPoints: props.showPoints,
          pointSize: props.pointSize,
          pointColor: props.pointColor,
          pointHollow: props.pointHollow,
          activeOpacity: props.activeOpacity,
          inactiveOpacity: props.inactiveOpacity
        }
      )
      return laidOut.map((item, seriesIndex) => ({
        ...item,
        seriesKey: seriesKeys.value[seriesIndex]
      }))
    })

    const flatPoints = computed(() => flattenChartPoints(seriesData.value))

    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: resolvedSeries.value,
        palette: palette.value,
        activeIndex: activeIndex.value,
        selectedIndex: resolvedSelectedIndex.value,
        getLabel: (s, i) =>
          props.legendFormatter
            ? props.legendFormatter(s, i)
            : (s.name ?? defaultChartSeriesName(i, labels.value.seriesName)),
        getColor: (s, i) => s.color ?? palette.value[i % palette.value.length]
      })
    )

    const tooltipContent = computed(() =>
      resolveMultiSeriesTooltipContent(
        hoveredPointInfo.value,
        resolvedSeries.value,
        props.tooltipFormatter,
        (datum, seriesIndex, pointIndex, s) =>
          defaultSeriesXYTooltipFormatter(
            datum,
            seriesIndex,
            pointIndex,
            s,
            labels.value.seriesName
          )
      )
    )

    const handlePointMouseEnter = (seriesIndex: number, pointIndex: number, event: MouseEvent) => {
      hoveredPointInfo.value = { seriesIndex, pointIndex }
      tooltipPosition.value = { x: event.clientX, y: event.clientY }
      if (props.hoverable) {
        emit(
          'point-hover',
          seriesIndex,
          pointIndex,
          resolvedSeries.value[seriesIndex]?.data[pointIndex]
        )
      }
    }

    const handlePointMouseMove = (event: MouseEvent) => {
      tooltipPosition.value = { x: event.clientX, y: event.clientY }
    }

    const handlePointMouseLeave = () => {
      hoveredPointInfo.value = null
      if (props.hoverable) {
        emit('point-hover', null, null, null)
      }
    }

    // Keyboard/focus tooltip: synthesize a pointer position from the point's
    // on-screen rect so focused points show the same tooltip as hovered ones.
    const showPointTooltipFromElement = (
      el: SVGGraphicsElement,
      seriesIndex: number,
      pointIndex: number
    ) => {
      if (!(props.showTooltip || props.hoverable)) return
      const rect = el.getBoundingClientRect()
      hoveredPointInfo.value = { seriesIndex, pointIndex }
      tooltipPosition.value = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      emit(
        'point-hover',
        seriesIndex,
        pointIndex,
        resolvedSeries.value[seriesIndex]?.data[pointIndex]
      )
    }

    const handlePointClick = (seriesIndex: number, pointIndex: number) => {
      const datum = resolvedSeries.value[seriesIndex]?.data[pointIndex]
      props.onPointClick?.(seriesIndex, pointIndex, datum)
      emit('point-click', seriesIndex, pointIndex, datum)
      handleSeriesSelect(seriesIndex)
    }

    const handlePlotMouseMove = (event: MouseEvent) => {
      if (!(props.showTooltip || props.hoverable)) return
      const target = event.currentTarget as SVGGraphicsElement
      const rect = target.getBoundingClientRect()
      const width = rect.width || innerRect.value.width
      const height = rect.height || innerRect.value.height
      if (width === 0 || height === 0) return
      const x = ((event.clientX - rect.left) / width) * innerRect.value.width
      const y = ((event.clientY - rect.top) / height) * innerRect.value.height
      const nearest = findNearestSeriesPoint(
        seriesData.value.map((sd) => sd.points),
        x,
        y
      )
      if (!nearest) return
      hoveredPointInfo.value = nearest
      tooltipPosition.value = { x: event.clientX, y: event.clientY }
    }

    return () => {
      const pointClickable = typeof props.onPointClick === 'function'
      const trackPointHover = props.showTooltip || props.hoverable
      const chart = h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
          responsive: props.responsive,
          title: props.title,
          desc: props.desc,
          onResolvedSizeChange
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
              // Gradient defs and animation styles
              trackPointHover
                ? h('rect', {
                    width: innerRect.value.width,
                    height: innerRect.value.height,
                    fill: 'transparent',
                    'data-plot-hit': '',
                    onMousemove: handlePlotMouseMove,
                    onMouseleave: handlePointMouseLeave
                  })
                : null,
              seriesData.value.some((sd) => sd.showArea) ||
              props.strokeGradient ||
              props.pointGradient
                ? h('defs', null, [
                    ...seriesData.value
                      .filter((sd) => sd.showArea)
                      .map((sd) =>
                        h(
                          'linearGradient',
                          {
                            key: `area-grad-${sd.seriesKey}`,
                            id: `${gradientPrefix}-${sd.seriesKey}`,
                            x1: '0',
                            y1: '0',
                            x2: '0',
                            y2: '1'
                          },
                          [
                            h('stop', {
                              offset: '0%',
                              'stop-color': sd.color,
                              'stop-opacity': sd.areaOpacity
                            }),
                            h('stop', {
                              offset: '100%',
                              'stop-color': sd.color,
                              'stop-opacity': 0.02
                            })
                          ]
                        )
                      ),
                    // Point fill radial gradients (bright center → series color edge)
                    ...(props.pointGradient
                      ? seriesData.value.map((sd) =>
                          h(
                            'radialGradient',
                            {
                              key: `point-grad-${sd.seriesKey}`,
                              id: `${gradientPrefix}-point-${sd.seriesKey}`,
                              cx: '0.5',
                              cy: '0.5',
                              r: '0.5'
                            },
                            [
                              h('stop', {
                                offset: '0%',
                                'stop-color': `color-mix(in oklab, ${sd.color} 100%, white 30%)`
                              }),
                              h('stop', {
                                offset: '70%',
                                'stop-color': sd.color
                              }),
                              h('stop', {
                                offset: '100%',
                                'stop-color': `color-mix(in oklab, ${sd.color} 100%, black 12%)`
                              })
                            ]
                          )
                        )
                      : []),
                    // Stroke gradients (3-stop horizontal lighter→base→darker)
                    ...(props.strokeGradient
                      ? seriesData.value.map((sd) =>
                          h(
                            'linearGradient',
                            {
                              key: `stroke-grad-${sd.seriesKey}`,
                              id: `${gradientPrefix}-stroke-${sd.seriesKey}`,
                              x1: '0',
                              y1: '0',
                              x2: '1',
                              y2: '0'
                            },
                            [
                              h('stop', {
                                offset: '0%',
                                'stop-color': `color-mix(in oklab, ${sd.color} 100%, white 12%)`
                              }),
                              h('stop', {
                                offset: '50%',
                                'stop-color': sd.color
                              }),
                              h('stop', {
                                offset: '100%',
                                'stop-color': `color-mix(in oklab, ${sd.color} 100%, black 8%)`
                              })
                            ]
                          )
                        )
                      : [])
                  ])
                : null,
              // Render each series
              ...seriesData.value.map((sd) =>
                h(
                  ChartSeries,
                  {
                    key: sd.seriesKey,
                    data: sd.series.data,
                    name: sd.series.name,
                    type: 'line',
                    opacity: sd.opacity,
                    'data-series-key': sd.seriesKey,
                    class: classNames(
                      sd.series.className,
                      (props.hoverable || props.selectable) && 'cursor-pointer'
                    ),
                    onMouseenter: (e: MouseEvent) => handleSeriesHoverEnter(sd.seriesIndex, e),
                    onMouseleave: handleSeriesHoverLeave,
                    onClick: () => handleSeriesSelect(sd.seriesIndex)
                  },
                  {
                    default: () => [
                      // Area fill path
                      sd.showArea && sd.areaPath
                        ? h('path', {
                            d: sd.areaPath,
                            fill: `url(#${gradientPrefix}-${sd.seriesKey})`,
                            stroke: 'none',
                            class:
                              'transition-opacity motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base,200ms)]',
                            'data-area-series': sd.seriesIndex,
                            'data-series-key': sd.seriesKey
                          })
                        : null,
                      // Line path
                      h('path', {
                        d: sd.linePath,
                        fill: 'none',
                        stroke: props.strokeGradient
                          ? `url(#${gradientPrefix}-stroke-${sd.seriesKey})`
                          : sd.color,
                        'stroke-width': sd.strokeWidth,
                        'stroke-dasharray': sd.strokeDasharray,
                        'stroke-dashoffset':
                          props.animated && !sd.strokeDasharray ? '1' : undefined,
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        pathLength: props.animated && !sd.strokeDasharray ? 1 : undefined,
                        class: classNames(
                          props.animated && !sd.strokeDasharray
                            ? undefined
                            : 'transition-opacity motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base,200ms)]',
                          props.animated && !sd.strokeDasharray && LINE_DRAW_CLASS
                        ),
                        'data-line-series': sd.seriesIndex,
                        'data-series-key': sd.seriesKey
                      }),
                      // Data points
                      sd.showPoints
                        ? sd.points.map((point) => {
                            const isHovered =
                              hoveredPointInfo.value?.seriesIndex === sd.seriesIndex &&
                              hoveredPointInfo.value?.pointIndex === point.pointIndex
                            const hoverSize = sd.pointSize + 2
                            const datum =
                              resolvedSeries.value[sd.seriesIndex]?.data?.[point.pointIndex]
                            const pointInteractive =
                              props.hoverable || props.selectable || pointClickable
                            return h('circle', {
                              key: `point-${sd.seriesKey}-${point.pointIndex}`,
                              cx: point.x,
                              cy: point.y,
                              r: isHovered ? hoverSize : sd.pointSize,
                              fill: sd.pointHollow
                                ? CHART_SURFACE_FILL
                                : props.pointGradient
                                  ? `url(#${gradientPrefix}-point-${sd.seriesKey})`
                                  : sd.pointColor,
                              stroke: sd.pointHollow ? sd.pointColor : 'none',
                              'stroke-width': sd.pointHollow ? 2 : 0,
                              class: classNames(
                                props.animated ? linePointTransitionClasses : undefined,
                                pointInteractive && 'cursor-pointer'
                              ),
                              style: isHovered
                                ? `filter: drop-shadow(0 0 4px ${sd.color})`
                                : undefined,
                              role: pointInteractive ? 'button' : undefined,
                              'aria-hidden': pointInteractive ? undefined : true,
                              'aria-label': pointInteractive
                                ? (datum?.label ??
                                  formatChartTemplate(labels.value.pointAriaLabel, {
                                    index: point.pointIndex + 1,
                                    x: String(datum?.x ?? ''),
                                    y: String(datum?.y ?? '')
                                  }))
                                : undefined,
                              tabindex: pointInteractive
                                ? chartPointTabIndex(
                                    sd.seriesIndex,
                                    point.pointIndex,
                                    hoveredPointInfo.value,
                                    flatPoints.value
                                  )
                                : undefined,
                              'data-point-index': point.pointIndex,
                              'data-series-key': sd.seriesKey,
                              onMouseenter: trackPointHover
                                ? (e: MouseEvent) =>
                                    handlePointMouseEnter(sd.seriesIndex, point.pointIndex, e)
                                : undefined,
                              onMousemove: trackPointHover ? handlePointMouseMove : undefined,
                              onMouseleave: trackPointHover ? handlePointMouseLeave : undefined,
                              onClick: (e: MouseEvent) => {
                                e.stopPropagation()
                                handlePointClick(sd.seriesIndex, point.pointIndex)
                              },
                              onFocus: trackPointHover
                                ? (e: FocusEvent) =>
                                    showPointTooltipFromElement(
                                      e.currentTarget as unknown as SVGGraphicsElement,
                                      sd.seriesIndex,
                                      point.pointIndex
                                    )
                                : undefined,
                              onBlur: trackPointHover ? handlePointMouseLeave : undefined,
                              onKeydown: pointInteractive
                                ? (e: KeyboardEvent) => {
                                    if (isChartNavigationKey(e.key)) {
                                      e.preventDefault()
                                      const next = nextChartPointRef(
                                        {
                                          seriesIndex: sd.seriesIndex,
                                          pointIndex: point.pointIndex
                                        },
                                        e.key,
                                        flatPoints.value
                                      )
                                      if (!next) return
                                      const node = (
                                        e.currentTarget as SVGElement
                                      ).ownerSVGElement?.querySelector(
                                        `[data-series-key="${seriesKeys.value[next.seriesIndex]}"][data-point-index="${next.pointIndex}"]`
                                      )
                                      if (node instanceof SVGElement) node.focus()
                                      return
                                    }
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      if (pointClickable) {
                                        handlePointClick(sd.seriesIndex, point.pointIndex)
                                      } else {
                                        showPointTooltipFromElement(
                                          e.currentTarget as unknown as SVGGraphicsElement,
                                          sd.seriesIndex,
                                          point.pointIndex
                                        )
                                      }
                                    } else if (e.key === 'Escape' && trackPointHover) {
                                      handlePointMouseLeave()
                                    }
                                  }
                                : undefined
                            })
                          })
                        : null
                    ]
                  }
                )
              )
            ].filter(Boolean)
        }
      )

      const tooltip = props.showTooltip
        ? h(ChartTooltip, {
            content: tooltipContent.value,
            open: hoveredPointInfo.value !== null && tooltipContent.value !== '',
            x: tooltipPosition.value.x,
            y: tooltipPosition.value.y
          })
        : null

      return h(
        'div',
        {
          class: getCartesianChartShellClasses({
            showLegend: props.showLegend,
            legendPosition: props.legendPosition,
            responsive: props.responsive,
            className: classNames(coerceClassValue(attrs.class), props.className)
          })
        },
        [
          chart,
          props.showLegend
            ? h(ChartLegend, {
                items: legendItems.value,
                orientation: chartLegendOrientationFromPosition(props.legendPosition),
                markerSize: props.legendMarkerSize,
                gap: props.legendGap,
                interactive: props.hoverable || props.selectable,
                ariaLabel: labels.value.legendAriaLabel,
                onItemClick: handleLegendClick,
                onItemHover: handleLegendHover,
                onItemLeave: handleLegendLeave
              })
            : null,
          tooltip
        ]
      )
    }
  }
})

export default LineChart
