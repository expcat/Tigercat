import { defineComponent, computed, h, PropType, useId } from 'vue'
import {
  classNames,
  coerceClassValue,
  createBandScale,
  createLinearScale,
  getStableChartGradientPrefix,
  getBarValueLabelY,
  getNumberExtent,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  DEFAULT_CHART_PADDING,
  resolveChartTooltipContent,
  defaultXYTooltipFormatter,
  barValueLabelClasses,
  barValueLabelInsideClasses,
  barInteractiveClasses,
  BAR_ANIMATED_CLASS,
  layoutBarRects,
  resolveBarCornerRadius,
  getCartesianChartShellClasses,
  chartMarkTabIndex,
  nextChartRovingIndex,
  isChartNavigationKey,
  getChartLabels,
  mergeTigerLocale,
  type BarChartDatum,
  type BarChartProps as CoreBarChartProps,
  type BarValueLabelPosition,
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
import { useResponsiveChartSize } from '../composables/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface VueBarChartProps extends CoreBarChartProps {
  data: BarChartDatum[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
  onBarClick?: (index: number, datum: BarChartDatum) => void
}

export type BarChartProps = VueBarChartProps

export const BarChart = defineComponent({
  name: 'TigerBarChart',
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
      type: Number
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
      type: Array as PropType<ChartScaleValue[]>
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
    showTooltip: {
      type: Boolean,
      default: true
    },
    tooltipFormatter: {
      type: Function as PropType<(datum: BarChartDatum, index: number) => string>
    },
    legendFormatter: {
      type: Function as PropType<(datum: BarChartDatum, index: number) => string>
    },
    showValueLabels: {
      type: Boolean,
      default: false
    },
    valueLabelPosition: {
      type: String as PropType<BarValueLabelPosition>,
      default: 'top' as BarValueLabelPosition
    },
    valueLabelFormatter: {
      type: Function as PropType<(datum: BarChartDatum, index: number) => string>
    },
    barMinHeight: {
      type: Number,
      default: 0
    },
    barMaxWidth: {
      type: Number
    },
    gradient: {
      type: Boolean,
      default: false
    },
    animated: {
      type: Boolean,
      default: false
    },
    colors: {
      type: Array as PropType<string[]>
    },
    title: {
      type: String
    },
    desc: {
      type: String
    },
    className: {
      type: String
    },
    onBarClick: {
      type: Function as PropType<(index: number, datum: BarChartDatum) => void>
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'bar-click', 'bar-hover'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getChartLabels(mergeTigerLocale(config.value.locale)))
    const gradientPrefix = getStableChartGradientPrefix('bar', useId())
    const interactive = computed(
      () => props.hoverable || props.selectable || typeof props.onBarClick === 'function'
    )
    const corner = computed(() => resolveBarCornerRadius(props.barRadius))

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
    } = useChartInteraction<BarChartDatum>({
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
      getData: (index) => props.data[index],
      onHover: (index, datum) => emit('bar-hover', index, datum),
      onClick: (index, datum) => {
        props.onBarClick?.(index, datum as BarChartDatum)
        emit('bar-click', index, datum)
      }
    })

    const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
      () => props.width,
      () => props.height,
      () => props.padding,
      () => props.responsive
    )

    const xDomain = computed(() => props.data.map((item) => String(item.x)))
    const yValues = computed(() =>
      props.data.map((item) => item.y).filter((value) => Number.isFinite(value))
    )

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

    const shouldShowXAxis = computed(() => props.showAxis && props.showXAxis)
    const shouldShowYAxis = computed(() => props.showAxis && props.showYAxis)
    const palette = computed(() => resolveChartPalette(props.colors, props.barColor))

    const bars = computed(() =>
      layoutBarRects(props.data, resolvedXScale.value, resolvedYScale.value, {
        barMaxWidth: props.barMaxWidth,
        barMinHeight: props.barMinHeight,
        palette: palette.value,
        activeIndex: activeIndex.value,
        activeOpacity: props.activeOpacity,
        inactiveOpacity: props.inactiveOpacity,
        innerWidth: innerRect.value.width
      })
    )

    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: props.data,
        palette: palette.value,
        activeIndex: activeIndex.value,
        selectedIndex: resolvedSelectedIndex.value,
        getLabel: (d, i) =>
          props.legendFormatter ? props.legendFormatter(d, i) : (d.label ?? String(d.x)),
        getColor: (d, i) => d.color ?? palette.value[i % palette.value.length]
      })
    )

    const tooltipContent = computed(() =>
      resolveChartTooltipContent(
        resolvedHoveredIndex.value,
        props.data,
        props.tooltipFormatter,
        defaultXYTooltipFormatter
      )
    )

    return () => {
      const visualActive = bars.value.findIndex(
        (bar) => bar.index === (activeIndex.value ?? resolvedHoveredIndex.value)
      )
      const handleBarKeyDown = (event: KeyboardEvent, visualIndex: number) => {
        if (isChartNavigationKey(event.key)) {
          event.preventDefault()
          const nextVisual = nextChartRovingIndex(visualIndex, event.key, bars.value.length)
          const next = bars.value[nextVisual]
          const current = event.currentTarget as SVGElement
          const node = current.parentElement?.querySelector(`[data-bar-index="${next.index}"]`)
          if (node instanceof SVGElement) node.focus()
          handleMouseEnter(next.index, event)
          return
        }
        handleKeyDown(event, bars.value[visualIndex].index)
      }

      const gradientDefs = props.gradient
        ? h(
            'defs',
            null,
            bars.value.map((bar) =>
              h(
                'linearGradient',
                {
                  id: `${gradientPrefix}-${bar.index}`,
                  x1: '0',
                  y1: '0',
                  x2: '0',
                  y2: '1'
                },
                [
                  h('stop', {
                    offset: '0%',
                    'stop-color': bar.color,
                    'stop-opacity': '0.65'
                  }),
                  h('stop', {
                    offset: '100%',
                    'stop-color': bar.color,
                    'stop-opacity': '1'
                  })
                ]
              )
            )
          )
        : null

      const valueLabels =
        props.showValueLabels && bars.value.length > 0
          ? bars.value.map((bar) => {
              const labelText = props.valueLabelFormatter
                ? props.valueLabelFormatter(bar.datum, bar.index)
                : String(bar.datum.y)
              const labelY = getBarValueLabelY(bar.y, bar.height, props.valueLabelPosition, 8, {
                negative: bar.negative
              })
              const isInside = props.valueLabelPosition === 'inside'
              return h(
                'text',
                {
                  key: `label-${bar.index}`,
                  x: bar.x + bar.width / 2,
                  y: labelY,
                  'text-anchor': 'middle',
                  'dominant-baseline': isInside ? 'central' : bar.negative ? 'hanging' : 'auto',
                  class: isInside ? barValueLabelInsideClasses : barValueLabelClasses,
                  opacity: bar.opacity,
                  'data-value-label': ''
                },
                labelText
              )
            })
          : []

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
              gradientDefs,
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
                {
                  data: props.data,
                  type: 'bar'
                },
                {
                  default: () =>
                    bars.value.map((bar, visualIndex) =>
                      h('rect', {
                        key: `bar-${bar.index}`,
                        x: bar.x,
                        y: bar.y,
                        width: bar.width,
                        height: bar.height,
                        rx: corner.value.rx,
                        ry: corner.value.ry,
                        fill: props.gradient ? `url(#${gradientPrefix}-${bar.index})` : bar.color,
                        opacity: bar.opacity,
                        class: classNames(
                          props.animated && BAR_ANIMATED_CLASS,
                          interactive.value && barInteractiveClasses
                        ),
                        style: corner.value.style,
                        tabindex: interactive.value
                          ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                          : undefined,
                        role: interactive.value ? 'button' : undefined,
                        'aria-hidden': interactive.value ? undefined : true,
                        'aria-label': interactive.value
                          ? (bar.datum.label ?? defaultXYTooltipFormatter(bar.datum, bar.index))
                          : undefined,
                        'data-bar-index': bar.index,
                        onMouseenter: (e: MouseEvent) => handleMouseEnter(bar.index, e),
                        onMousemove: handleMouseMove,
                        onMouseleave: handleMouseLeave,
                        onClick: () => handleClick(bar.index),
                        onKeydown: (e: KeyboardEvent) => handleBarKeyDown(e, visualIndex)
                      })
                    )
                }
              ),
              ...valueLabels
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

export default BarChart
