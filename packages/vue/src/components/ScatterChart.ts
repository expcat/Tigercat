import { defineComponent, computed, h, PropType, onMounted, ref } from 'vue'
import {
  classNames,
  createLinearScale,
  getChartElementOpacity,
  getChartInnerRect,
  getNumberExtent,
  getScatterGradientPrefix,
  getScatterHoverShadow,
  getScatterHoverSize,
  getScatterPointPath,
  scatterPointTransitionClasses,
  SCATTER_ENTRANCE_KEYFRAMES,
  SCATTER_ENTRANCE_CLASS,
  resolveChartPalette,
  buildChartLegendItems,
  resolveChartTooltipContent,
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
    width: { type: Number, default: 320 },
    height: { type: Number, default: 200 },
    padding: {
      type: [Number, Object] as PropType<ChartPadding>,
      default: 24
    },
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
    pointBorderColor: { type: String, default: 'white' },
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
    className: { type: String }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'point-click', 'point-hover'],
  setup(props, { emit }) {
    const gradientPrefix = getScatterGradientPrefix()
    const mounted = ref(false)

    onMounted(() => {
      if (props.animated) mounted.value = true
    })

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

    const shouldShowXAxis = computed(() => props.showAxis && props.showXAxis)
    const shouldShowYAxis = computed(() => props.showAxis && props.showYAxis)

    const palette = computed(() => resolveChartPalette(props.colors, props.pointColor))

    const points = computed(() =>
      props.data.map((item, index) => {
        const color = item.color ?? palette.value[index % palette.value.length]
        const opacity = getChartElementOpacity(index, activeIndex.value, {
          activeOpacity: props.activeOpacity,
          inactiveOpacity: props.inactiveOpacity
        })
        const isHovered = resolvedHoveredIndex.value === index
        const baseSize = item.size ?? props.pointSize
        const r = isHovered ? getScatterHoverSize(baseSize) : baseSize

        return {
          cx: resolvedXScale.value.map(item.x),
          cy: resolvedYScale.value.map(item.y),
          r,
          baseSize,
          color,
          opacity: props.pointOpacity ?? opacity,
          isHovered,
          datum: item
        }
      })
    )

    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: props.data,
        palette: palette.value,
        activeIndex: activeIndex.value,
        getLabel: (d, i) =>
          props.legendFormatter ? props.legendFormatter(d, i) : (d.label ?? `(${d.x}, ${d.y})`),
        getColor: (d, i) => d.color ?? palette.value[i % palette.value.length]
      })
    )

    const tooltipContent = computed(() =>
      resolveChartTooltipContent(
        resolvedHoveredIndex.value,
        props.data,
        props.tooltipFormatter,
        (datum, index) => {
          const label = datum.label ?? `Point ${index + 1}`
          return `${label}: (${datum.x}, ${datum.y})`
        }
      )
    )

    return () => {
      // Radial gradient defs for depth effect
      const defs = props.gradient
        ? h(
            'defs',
            null,
            palette.value.map((color, i) =>
              h(
                'radialGradient',
                { id: `${gradientPrefix}-${i}`, cx: '35%', cy: '35%', r: '65%' },
                [
                  h('stop', { offset: '0%', 'stop-color': '#fff', 'stop-opacity': '0.5' }),
                  h('stop', { offset: '50%', 'stop-color': color, 'stop-opacity': '0.95' }),
                  h('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': '1' })
                ]
              )
            )
          )
        : null

      // Animation keyframes
      const animStyle =
        props.animated && mounted.value ? h('style', null, SCATTER_ENTRANCE_KEYFRAMES) : null

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
              defs,
              animStyle,
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
                    points.value.map((point, index) => {
                      const paletteIdx = index % palette.value.length
                      const fill = props.gradient
                        ? `url(#${gradientPrefix}-${paletteIdx})`
                        : point.color
                      const interactive = props.hoverable || props.selectable

                      const filterStyle = point.isHovered
                        ? getScatterHoverShadow(point.color)
                        : undefined

                      const animDelay =
                        props.animated && mounted.value ? `${index * 60}ms` : undefined

                      const styleStr = [
                        filterStyle ? `filter:${filterStyle}` : '',
                        animDelay
                          ? `animation:${SCATTER_ENTRANCE_CLASS} 500ms cubic-bezier(.34,1.56,.64,1) ${animDelay} both`
                          : ''
                      ]
                        .filter(Boolean)
                        .join(';')

                      const shared = {
                        fill,
                        opacity: point.opacity,
                        stroke: props.pointBorderColor,
                        'stroke-width': props.pointBorderWidth,
                        class: classNames(
                          scatterPointTransitionClasses,
                          interactive && 'cursor-pointer'
                        ),
                        style: styleStr || undefined,
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
                      }

                      if (props.pointStyle === 'circle') {
                        return h('circle', {
                          key: `point-${index}`,
                          cx: point.cx,
                          cy: point.cy,
                          r: point.r,
                          ...shared
                        })
                      }

                      return h('path', {
                        key: `point-${index}`,
                        d: getScatterPointPath(props.pointStyle, point.r),
                        transform: `translate(${point.cx},${point.cy})`,
                        ...shared
                      })
                    })
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
