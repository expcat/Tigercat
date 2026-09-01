import { defineComponent, computed, h, PropType, onMounted, ref, useId, watch } from 'vue'
import {
  classNames,
  createLinearScale,
  getNumberExtent,
  getStableChartGradientPrefix,
  getScatterHoverShadow,
  scatterPointTransitionClasses,
  SCATTER_ENTRANCE_CLASS,
  layoutScatterPoints,
  scatterPointDisplayLabel,
  getCartesianChartShellClasses,
  chartMarkTabIndex,
  nextChartRovingIndex,
  isChartNavigationKey,
  CHART_SURFACE_FILL,
  SCATTER_ENTRANCE_STAGGER_MS,
  SCATTER_ENTRANCE_STAGGER_MAX_MS,
  formatChartTemplate,
  coerceClassValue,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  DEFAULT_CHART_PADDING,
  resolveChartTooltipContent,
  mergeTigerLocale,
  getChartLabels,
  type ChartGridLineStyle,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type ChartScale,
  type ChartScaleValue,
  type ScatterChartDatum,
  type ScatterChartProps as CoreScatterChartProps,
  type TigerLocale,
  type TigerLocaleChart
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

export interface VueScatterChartProps extends CoreScatterChartProps {
  data: ScatterChartDatum[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleChart>
  onPointClick?: (index: number, datum: ScatterChartDatum) => void
}

export type ScatterChartProps = VueScatterChartProps

export const ScatterChart = defineComponent({
  name: 'TigerScatterChart',
  inheritAttrs: false,
  props: {
    width: { type: Number, default: 320 },
    height: { type: Number, default: 200 },
    padding: {
      type: [Number, Object] as PropType<ChartPadding>,
      default: () => ({ ...DEFAULT_CHART_PADDING })
    },
    responsive: { type: Boolean, default: false },
    data: {
      type: Array as PropType<ScatterChartDatum[]>,
      required: true
    },
    xScale: { type: Object as PropType<ChartScale> },
    yScale: { type: Object as PropType<ChartScale> },
    pointSize: { type: Number, default: 6 },
    pointColor: {
      type: String,
      default: 'var(--tiger-primary,#2563eb)'
    },
    pointOpacity: { type: Number },
    pointStyle: {
      type: String as PropType<'circle' | 'square' | 'triangle' | 'diamond'>,
      default: 'circle'
    },
    gradient: { type: Boolean, default: false },
    animated: { type: Boolean, default: false },
    pointBorderWidth: { type: Number, default: 0 },
    pointBorderColor: { type: String, default: CHART_SURFACE_FILL },
    sizeScale: {
      type: [Boolean, Object] as PropType<boolean | { minRadius?: number; maxRadius?: number }>,
      default: false
    },
    showGrid: { type: Boolean, default: true },
    showAxis: { type: Boolean, default: true },
    showXAxis: { type: Boolean, default: true },
    showYAxis: { type: Boolean, default: true },
    includeZero: { type: Boolean, default: false },
    xAxisLabel: { type: String },
    yAxisLabel: { type: String },
    xTicks: { type: Number, default: 5 },
    yTicks: { type: Number, default: 5 },
    xTickValues: { type: Array as PropType<number[]> },
    yTickValues: { type: Array as PropType<number[]> },
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
    gridStrokeWidth: { type: Number, default: 1 },
    // Interaction
    hoverable: { type: Boolean, default: false },
    hoveredIndex: {
      type: Number as PropType<number | null>,
      default: undefined
    },
    activeOpacity: { type: Number, default: 1 },
    inactiveOpacity: { type: Number, default: 0.25 },
    selectable: { type: Boolean, default: false },
    selectedIndex: {
      type: Number as PropType<number | null>,
      default: undefined
    },
    onPointClick: {
      type: Function as PropType<(index: number, datum: ScatterChartDatum) => void>
    },
    // Legend
    showLegend: { type: Boolean, default: false },
    legendPosition: {
      type: String as PropType<ChartLegendPosition>,
      default: 'bottom'
    },
    legendMarkerSize: { type: Number, default: 10 },
    legendGap: { type: Number, default: 8 },
    legendFormatter: {
      type: Function as PropType<(datum: ScatterChartDatum, index: number) => string>
    },
    // Tooltip
    showTooltip: { type: Boolean, default: true },
    tooltipFormatter: {
      type: Function as PropType<(datum: ScatterChartDatum, index: number) => string>
    },
    // Other
    colors: { type: Array as PropType<string[]> },
    title: { type: String },
    desc: { type: String },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleChart>>, default: undefined },
    className: { type: String }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'point-click', 'point-hover'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const gradientPrefix = getStableChartGradientPrefix('scatter', useId())
    const mounted = ref(false)
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getChartLabels(mergedLocale.value, props.labels))

    onMounted(() => {
      if (props.animated) mounted.value = true
    })
    watch(
      () => props.animated,
      (value) => {
        if (value) mounted.value = true
      }
    )

    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      resolvedSelectedIndex,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      handleKeyDown,
      handleLegendClick,
      handleLegendHover,
      handleLegendLeave
    } = useChartInteraction<ScatterChartDatum>({
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
      getData: (index: number) => props.data[index],
      onHover: (index, datum) => emit('point-hover', index, datum),
      onClick: (index, datum) => {
        props.onPointClick?.(index, datum as ScatterChartDatum)
        emit('point-click', index, datum)
      }
    })

    const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
      () => props.width,
      () => props.height,
      () => props.padding,
      () => props.responsive
    )

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

    const shouldShowXAxis = computed(() => props.showAxis && props.showXAxis)
    const shouldShowYAxis = computed(() => props.showAxis && props.showYAxis)

    const palette = computed(() => resolveChartPalette(props.colors, props.pointColor))

    const points = computed(() =>
      layoutScatterPoints(props.data, resolvedXScale.value, resolvedYScale.value, {
        pointSize: props.pointSize,
        pointStyle: props.pointStyle,
        palette: palette.value,
        activeIndex: activeIndex.value,
        hoveredIndex: resolvedHoveredIndex.value,
        gradient: props.gradient,
        gradientPrefix,
        sizeScale: props.sizeScale,
        pointOpacity: props.pointOpacity,
        activeOpacity: props.activeOpacity,
        inactiveOpacity: props.inactiveOpacity
      })
    )

    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: props.data,
        palette: palette.value,
        activeIndex: activeIndex.value,
        selectedIndex: resolvedSelectedIndex.value,
        getLabel: (d, i) =>
          props.legendFormatter
            ? props.legendFormatter(d, i)
            : scatterPointDisplayLabel(d, i, labels.value.pointAriaLabel),
        getColor: (d, i) => d.color ?? palette.value[i % palette.value.length]
      })
    )

    const tooltipContent = computed(() =>
      resolveChartTooltipContent(
        resolvedHoveredIndex.value,
        props.data,
        props.tooltipFormatter,
        (datum, index) =>
          formatChartTemplate(labels.value.pointAriaLabel, {
            index: index + 1,
            x: datum.x,
            y: datum.y
          })
      )
    )

    return () => {
      // Radial gradient defs for depth effect
      const defs = props.gradient
        ? h(
            'defs',
            null,
            points.value.map((point) =>
              h(
                'radialGradient',
                {
                  id: `${gradientPrefix}-${point.index}`,
                  cx: '35%',
                  cy: '35%',
                  r: '65%'
                },
                [
                  h('stop', {
                    offset: '0%',
                    'stop-color': CHART_SURFACE_FILL,
                    'stop-opacity': '0.5'
                  }),
                  h('stop', {
                    offset: '50%',
                    'stop-color': point.color,
                    'stop-opacity': '0.95'
                  }),
                  h('stop', {
                    offset: '100%',
                    'stop-color': point.color,
                    'stop-opacity': '1'
                  })
                ]
              )
            )
          )
        : null

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
              defs,
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
              h(
                ChartSeries,
                { data: props.data, type: 'scatter' },
                {
                  default: () =>
                    points.value.map((point, visualIndex) => {
                      const interactive =
                        props.hoverable ||
                        props.selectable ||
                        typeof props.onPointClick === 'function'
                      const filterStyle = point.isHovered
                        ? getScatterHoverShadow(point.color)
                        : undefined
                      const animDelay =
                        props.animated && mounted.value
                          ? `${Math.min(visualIndex * SCATTER_ENTRANCE_STAGGER_MS, SCATTER_ENTRANCE_STAGGER_MAX_MS)}ms`
                          : undefined
                      const visualActive = points.value.findIndex(
                        (item) => item.index === (activeIndex.value ?? 0)
                      )
                      const styleStr = [
                        filterStyle ? `filter:${filterStyle}` : '',
                        animDelay ? `animation-delay:${animDelay}` : ''
                      ]
                        .filter(Boolean)
                        .join(';')

                      const shared = {
                        fill: point.fill,
                        opacity: point.opacity,
                        stroke: props.pointBorderColor,
                        'stroke-width': props.pointBorderWidth,
                        class: classNames(
                          props.animated ? scatterPointTransitionClasses : undefined,
                          animDelay && SCATTER_ENTRANCE_CLASS,
                          interactive && 'cursor-pointer'
                        ),
                        style: styleStr || undefined,
                        tabindex: interactive
                          ? chartMarkTabIndex(visualIndex, visualActive < 0 ? 0 : visualActive)
                          : undefined,
                        role: interactive ? 'button' : undefined,
                        'aria-hidden': interactive ? undefined : true,
                        'aria-label': interactive
                          ? (point.datum.label ??
                            formatChartTemplate(labels.value.pointAriaLabel, {
                              index: point.index + 1,
                              x: point.datum.x,
                              y: point.datum.y
                            }))
                          : undefined,
                        'data-point-index': point.index,
                        onMouseenter: (e: MouseEvent) => handleMouseEnter(point.index, e),
                        onMousemove: handleMouseMove,
                        onMouseleave: handleMouseLeave,
                        onClick: () => handleClick(point.index),
                        onKeydown: (e: KeyboardEvent) => {
                          if (isChartNavigationKey(e.key)) {
                            e.preventDefault()
                            const nextVisual = nextChartRovingIndex(
                              visualIndex,
                              e.key,
                              points.value.length
                            )
                            const next = points.value[nextVisual]
                            const node = (
                              e.currentTarget as SVGElement
                            ).parentElement?.querySelector(`[data-point-index="${next.index}"]`)
                            if (node instanceof SVGElement) node.focus()
                            handleMouseEnter(next.index, e)
                            return
                          }
                          handleKeyDown(e, point.index)
                        }
                      }

                      if (props.pointStyle === 'circle') {
                        return h('circle', {
                          key: `point-${point.index}`,
                          cx: point.cx,
                          cy: point.cy,
                          r: point.r,
                          ...shared
                        })
                      }

                      return h(
                        'g',
                        {
                          key: `point-${point.index}`,
                          transform: `translate(${point.cx},${point.cy})`
                        },
                        h('path', {
                          d: point.d,
                          ...shared
                        })
                      )
                    })
                }
              )
            ].filter(Boolean)
        }
      )

      const tooltip = props.showTooltip
        ? h(ChartTooltip, {
            content: tooltipContent.value,
            open: resolvedHoveredIndex.value !== null && tooltipContent.value !== '',
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
                ariaLabel: labels.value.legendAriaLabel,
                interactive: props.hoverable || props.selectable,
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

export default ScatterChart
