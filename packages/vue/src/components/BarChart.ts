import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  createBandScale,
  createLinearScale,
  DEFAULT_CHART_COLORS,
  getChartInnerRect,
  getNumberExtent,
  type BarChartDatum,
  type BarChartProps as CoreBarChartProps,
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
    tooltipFormatter: {
      type: Function as PropType<(datum: BarChartDatum, index: number) => string>
    },
    // Other
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
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'bar-click', 'bar-hover'],
  setup(props, { emit }) {
    // Use shared interaction composable
    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      getElementOpacity,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      handleKeyDown,
      handleLegendClick,
      handleLegendHover,
      handleLegendLeave,
      wrapperClasses
    } = useChartInteraction<BarChartDatum>({
      hoverable: computed(() => props.hoverable),
      hoveredIndexProp: props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      emit: emit as (event: string, ...args: any[]) => void,
      getData: (index) => props.data[index],
      eventNames: { hover: 'bar-hover', click: 'bar-click' }
    })

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

    const palette = computed(() =>
      props.colors && props.colors.length > 0
        ? props.colors
        : props.barColor
          ? [props.barColor]
          : [...DEFAULT_CHART_COLORS]
    )

    const bars = computed(() => {
      const scale = resolvedXScale.value
      const bandWidth =
        scale.bandwidth ??
        (scale.step
          ? scale.step * 0.7
          : (innerRect.value.width / Math.max(1, props.data.length)) * 0.8)
      const baseline = resolvedYScale.value.map(0)

      return props.data.map((item, index) => {
        const xKey = scale.type === 'linear' ? Number(item.x) : String(item.x)
        const xPos = scale.map(xKey)
        const barX = scale.bandwidth ? xPos : xPos - bandWidth / 2
        const barYValue = resolvedYScale.value.map(item.y)
        const barHeight = Math.abs(baseline - barYValue)
        const barY = Math.min(baseline, barYValue)
        const color = item.color ?? palette.value[index % palette.value.length]
        const opacity = getElementOpacity(index)

        return {
          x: barX,
          y: barY,
          width: bandWidth,
          height: barHeight,
          color,
          opacity,
          datum: item
        }
      })
    })

    const legendItems = computed<ChartLegendItem[]>(() =>
      props.data.map((item, index) => ({
        index,
        label: item.label ?? String(item.x),
        color: item.color ?? palette.value[index % palette.value.length],
        active: activeIndex.value === null || activeIndex.value === index
      }))
    )

    const formatTooltip = computed(
      () =>
        props.tooltipFormatter ??
        ((datum: BarChartDatum) => {
          const label = datum.label ?? String(datum.x)
          return `${label}: ${datum.y}`
        })
    )

    const tooltipContent = computed(() => {
      if (resolvedHoveredIndex.value === null) return ''
      const datum = props.data[resolvedHoveredIndex.value]
      return datum ? formatTooltip.value(datum, resolvedHoveredIndex.value) : ''
    })

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
                        fill: bar.color,
                        opacity: bar.opacity,
                        class: classNames(
                          (props.hoverable || props.selectable) &&
                            'cursor-pointer transition-opacity duration-150'
                        ),
                        tabindex: props.selectable ? 0 : undefined,
                        role: props.selectable ? 'button' : 'img',
                        'aria-label': bar.datum.label ?? String(bar.datum.x),
                        'data-bar-index': index,
                        onMouseenter: (e: MouseEvent) => handleMouseEnter(index, e),
                        onMousemove: handleMouseMove,
                        onMouseleave: handleMouseLeave,
                        onClick: () => handleClick(index),
                        onKeydown: (e: KeyboardEvent) => handleKeyDown(e, index)
                      })
                    )
                }
              )
            ].filter(Boolean)
        }
      )

      const tooltip =
        props.showTooltip && props.hoverable
          ? h(ChartTooltip, {
              content: tooltipContent.value,
              visible: resolvedHoveredIndex.value !== null && tooltipContent.value !== '',
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
          onItemClick: handleLegendClick,
          onItemHover: handleLegendHover,
          onItemLeave: handleLegendLeave
        }),
        tooltip
      ])
    }
  }
})

export default BarChart
