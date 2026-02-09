import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  createLinearScale,
  DEFAULT_CHART_COLORS,
  getChartElementOpacity,
  getChartInnerRect,
  getNumberExtent,
  type ChartGridLineStyle,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type ChartScale,
  type ChartScaleValue,
  type ScatterChartDatum,
  type ScatterChartProps as CoreScatterChartProps
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'

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
    legendFormatter: {
      type: Function as PropType<(datum: ScatterChartDatum, index: number) => string>
    },
    // Tooltip props
    showTooltip: {
      type: Boolean,
      default: true
    },
    tooltipFormatter: {
      type: Function as PropType<(datum: ScatterChartDatum, index: number) => string>
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
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'point-click', 'point-hover'],
  setup(props, { emit }) {
    // Use shared interaction composable
    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      handleKeyDown,
      handleLegendClick,
      handleLegendHover,
      handleLegendLeave,
      wrapperClasses
    } = useChartInteraction<ScatterChartDatum>({
      hoverable: computed(() => props.hoverable),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      emit: emit as (event: string, ...args: unknown[]) => void,
      getData: (index: number) => props.data[index],
      eventNames: { hover: 'point-hover', click: 'point-click' }
    })

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

    const showXAxis = computed(() => props.showAxis && props.showXAxis)
    const showYAxis = computed(() => props.showAxis && props.showYAxis)

    const palette = computed(() =>
      props.colors && props.colors.length > 0
        ? props.colors
        : props.pointColor
          ? [props.pointColor]
          : [...DEFAULT_CHART_COLORS]
    )

    const points = computed(() =>
      props.data.map((item, index) => {
        const color = item.color ?? palette.value[index % palette.value.length]
        const opacity = getChartElementOpacity(index, activeIndex.value, {
          activeOpacity: props.activeOpacity,
          inactiveOpacity: props.inactiveOpacity
        })

        return {
          cx: resolvedXScale.value.map(item.x),
          cy: resolvedYScale.value.map(item.y),
          r: item.size ?? props.pointSize,
          color,
          opacity: props.pointOpacity ?? opacity,
          datum: item
        }
      })
    )

    const legendItems = computed<ChartLegendItem[]>(() =>
      props.data.map((item, index) => ({
        index,
        label: props.legendFormatter
          ? props.legendFormatter(item, index)
          : (item.label ?? `(${item.x}, ${item.y})`),
        color: item.color ?? palette.value[index % palette.value.length],
        active: activeIndex.value === null || activeIndex.value === index
      }))
    )

    const formatTooltip = computed(
      () =>
        props.tooltipFormatter ??
        ((datum: ScatterChartDatum, index: number) => {
          const label = datum.label ?? `Point ${index + 1}`
          return `${label}: (${datum.x}, ${datum.y})`
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
                  type: 'scatter'
                },
                {
                  default: () =>
                    points.value.map((point, index) =>
                      h('circle', {
                        key: `point-${index}`,
                        cx: point.cx,
                        cy: point.cy,
                        r: point.r,
                        fill: point.color,
                        opacity: point.opacity,
                        class: classNames(
                          'transition-opacity duration-150',
                          (props.hoverable || props.selectable) && 'cursor-pointer'
                        ),
                        tabindex: props.selectable ? 0 : undefined,
                        role: props.selectable ? 'button' : 'img',
                        'aria-label':
                          point.datum.label ??
                          `Point ${index + 1}: (${point.datum.x}, ${point.datum.y})`,
                        'data-point-index': index,
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

export default ScatterChart
