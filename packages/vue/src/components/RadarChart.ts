import { defineComponent, computed, h, ref, PropType, useId } from 'vue'
import {
  chartAxisTickTextClasses,
  chartGridLineClasses,
  classNames,
  coerceClassValue,
  getChartGridLineDasharray,
  getStableChartGradientPrefix,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  buildChartSeriesKeys,
  resolveSeriesData,
  defaultRadarTooltipFormatter,
  getCartesianChartShellClasses,
  chartPointTabIndex,
  flattenChartPoints,
  nextChartPointRef,
  isChartNavigationKey,
  getChartLabels,
  mergeTigerLocale,
  defaultChartSeriesName,
  formatChartTemplate,
  layoutRadar,
  findNearestPointIndex,
  polarToCartesian,
  DEFAULT_POLAR_CHART_PADDING,
  type ChartGridLineStyle,
  type ChartLegendPosition,
  type ChartPadding,
  type RadarChartDatum,
  type RadarChartProps as CoreRadarChartProps,
  type RadarChartSeries
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'
import { useResponsiveChartSize } from '../composables/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface VueRadarChartProps extends CoreRadarChartProps {
  data?: RadarChartDatum[]
  series?: RadarChartSeries[]
  padding?: ChartPadding
  onSeriesClick?: (index: number, series: RadarChartSeries) => void
}

export type RadarChartProps = VueRadarChartProps

export const RadarChart = defineComponent({
  name: 'TigerRadarChart',
  inheritAttrs: false,
  props: {
    width: { type: Number, default: 320 },
    height: { type: Number, default: 200 },
    padding: {
      type: [Number, Object] as PropType<ChartPadding>,
      default: DEFAULT_POLAR_CHART_PADDING
    },
    responsive: { type: Boolean, default: false },
    data: { type: Array as PropType<RadarChartDatum[]> },
    series: { type: Array as PropType<RadarChartSeries[]> },
    indicators: { type: Array as PropType<string[]> },
    maxValue: { type: Number },
    startAngle: { type: Number, default: -Math.PI / 2 },
    levels: { type: Number, default: 5 },
    showLevelLabels: { type: Boolean, default: false },
    showGrid: { type: Boolean, default: true },
    showAxis: { type: Boolean, default: true },
    showLabels: { type: Boolean, default: true },
    labelOffset: { type: Number, default: 12 },
    labelFormatter: {
      type: Function as PropType<(datum: RadarChartDatum, index: number) => string>
    },
    levelLabelFormatter: {
      type: Function as PropType<(value: number, level: number) => string>
    },
    levelLabelOffset: { type: Number, default: 8 },
    hoverable: { type: Boolean, default: false },
    hoveredIndex: { type: Number as PropType<number | null>, default: undefined },
    activeOpacity: { type: Number, default: 1 },
    inactiveOpacity: { type: Number, default: 0.25 },
    selectable: { type: Boolean, default: false },
    selectedIndex: { type: Number as PropType<number | null>, default: undefined },
    showLegend: { type: Boolean, default: false },
    legendPosition: { type: String as PropType<ChartLegendPosition>, default: 'bottom' },
    legendFormatter: {
      type: Function as PropType<(series: RadarChartSeries, index: number) => string>
    },
    legendMarkerSize: { type: Number, default: 10 },
    legendGap: { type: Number, default: 8 },
    showTooltip: { type: Boolean, default: true },
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
    colors: { type: Array as PropType<string[]> },
    gridLineStyle: { type: String as PropType<ChartGridLineStyle>, default: 'solid' },
    gridStrokeWidth: { type: Number, default: 1 },
    strokeColor: { type: String },
    strokeWidth: { type: Number, default: 2 },
    fillColor: { type: String },
    fillOpacity: { type: Number, default: 0.2 },
    showPoints: { type: Boolean, default: true },
    pointSize: { type: Number, default: 3 },
    pointColor: { type: String },
    gridShape: { type: String as PropType<'polygon' | 'circle'>, default: 'polygon' },
    showSplitArea: { type: Boolean, default: false },
    gradient: { type: Boolean, default: false },
    strokeGradient: { type: Boolean, default: false },
    pointGradient: { type: Boolean, default: false },
    splitAreaOpacity: { type: Number, default: 0.06 },
    splitAreaColors: { type: Array as PropType<string[]> },
    pointBorderWidth: { type: Number, default: 2 },
    pointBorderColor: { type: String, default: 'var(--tiger-surface,#ffffff)' },
    pointHoverSize: { type: Number },
    labelAutoAlign: { type: Boolean, default: true },
    title: { type: String },
    desc: { type: String },
    className: { type: String },
    onSeriesClick: {
      type: Function as PropType<(index: number, series: RadarChartSeries) => void>
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'series-click', 'series-hover'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getChartLabels(mergeTigerLocale(config.value.locale)))
    const resolvedSeries = computed(() =>
      resolveSeriesData<RadarChartDatum, RadarChartSeries>(props.series, props.data, {
        data: [] as RadarChartDatum[]
      } as Partial<Omit<RadarChartSeries, 'data'>>)
    )
    const seriesKeys = computed(() =>
      buildChartSeriesKeys(resolvedSeries.value, { prefix: 'radar-' })
    )
    const interactive = computed(
      () => props.hoverable || props.selectable || typeof props.onSeriesClick === 'function'
    )
    const trackPointer = computed(() => props.showTooltip || props.hoverable)
    const focusable = interactive
    const hoveredPoint = ref<{ seriesIndex: number; pointIndex: number } | null>(null)
    const activePoint = ref<{ seriesIndex: number; pointIndex: number } | null>(null)
    const gradientPrefix = getStableChartGradientPrefix('radar', useId())

    const {
      resolvedSelectedIndex,
      activeIndex: resolvedActiveIndex,
      tooltipPosition,
      handleMouseEnter: handleHoverEnter,
      handleMouseMove,
      handleMouseLeave: handleHoverLeave,
      handleClick: handleSelectIndex,
      handleLegendClick,
      handleLegendHover,
      handleLegendLeave
    } = useChartInteraction<RadarChartSeries>({
      hoverable: computed(() => props.hoverable),
      showTooltip: computed(() => props.showTooltip),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      getData: (index) => resolvedSeries.value[index],
      onHoveredIndexChange: (index) => {
        emit('update:hoveredIndex', index)
        emit('series-hover', index, index !== null ? resolvedSeries.value[index] : null)
      },
      onSelectedIndexChange: (index) => emit('update:selectedIndex', index),
      onClick: (index, item) => {
        if (item) {
          props.onSeriesClick?.(index, item)
          emit('series-click', index, item)
        }
      }
    })

    const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
      () => props.width,
      () => props.height,
      () => props.padding,
      () => props.responsive
    )
    const palette = computed(() => resolveChartPalette(props.colors))
    const laid = computed(() =>
      layoutRadar(resolvedSeries.value, {
        innerWidth: innerRect.value.width,
        innerHeight: innerRect.value.height,
        startAngle: props.startAngle,
        maxValue: props.maxValue,
        levels: props.levels,
        gridShape: props.gridShape,
        palette: palette.value,
        gradient: props.gradient,
        gradientPrefix,
        indicators: props.indicators,
        showLabels: props.showLabels,
        showGrid: props.showGrid,
        showAxis: props.showAxis,
        showSplitArea: props.showSplitArea,
        showLevelLabels: props.showLevelLabels,
        labelOffset: props.labelOffset,
        levelLabelOffset: props.levelLabelOffset,
        labelFormatter: props.labelFormatter,
        levelLabelFormatter: props.levelLabelFormatter,
        labelAutoAlign: props.labelAutoAlign,
        strokeColor: props.strokeColor,
        fillColor: props.fillColor,
        fillOpacity: props.fillOpacity,
        splitAreaColors: props.splitAreaColors,
        seriesKeys: seriesKeys.value,
        activeIndex: resolvedActiveIndex.value,
        activeOpacity: props.activeOpacity,
        inactiveOpacity: props.inactiveOpacity
      })
    )
    const flatPoints = computed(() =>
      flattenChartPoints(
        laid.value.series.map((item) => ({
          seriesIndex: item.seriesIndex,
          points: item.points.map((point) => ({ pointIndex: point.index }))
        }))
      )
    )
    const seriesName = (item: RadarChartSeries, index: number) =>
      item.name ?? defaultChartSeriesName(index, labels.value.seriesName)
    const tooltipContent = computed(() => {
      const hovered = hoveredPoint.value
      if (!hovered) return ''
      const seriesItem = laid.value.series[hovered.seriesIndex]
      const point = seriesItem?.points.find((item) => item.index === hovered.pointIndex)
      if (!point) return ''
      if (props.tooltipFormatter) {
        return props.tooltipFormatter(
          point.datum,
          hovered.seriesIndex,
          hovered.pointIndex,
          seriesItem.series
        )
      }
      return defaultRadarTooltipFormatter(
        point.datum,
        hovered.seriesIndex,
        hovered.pointIndex,
        seriesItem.series,
        labels.value.seriesName
      )
    })
    const legendItems = computed(() =>
      buildChartLegendItems<RadarChartSeries>({
        data: resolvedSeries.value,
        palette: palette.value,
        activeIndex: resolvedActiveIndex.value,
        selectedIndex: resolvedSelectedIndex.value,
        getLabel: (item, index) =>
          props.legendFormatter ? props.legendFormatter(item, index) : seriesName(item, index),
        getColor: (item, index) => item.color ?? palette.value[index % palette.value.length]
      })
    )

    return () => {
      const layout = laid.value
      const dasharray = getChartGridLineDasharray(props.gridLineStyle)
      const focusableMarks = focusable.value
      const handlePointEnter = (
        seriesIndex: number,
        pointIndex: number,
        event: MouseEvent | FocusEvent
      ) => {
        if (!trackPointer.value) return
        hoveredPoint.value = { seriesIndex, pointIndex }
        handleHoverEnter(seriesIndex, event)
      }
      const handlePointLeave = () => {
        hoveredPoint.value = null
        handleHoverLeave()
      }
      const handleAreaMove = (seriesIndex: number, event: MouseEvent) => {
        if (!trackPointer.value) return
        const path = event.currentTarget as SVGPathElement
        const svg = path.ownerSVGElement
        if (!svg) return
        const ctm = path.getScreenCTM()
        if (!ctm) return
        const pt = svg.createSVGPoint()
        pt.x = event.clientX
        pt.y = event.clientY
        const loc = pt.matrixTransform(ctm.inverse())
        const axisPoints = layout.angles.map((angle) =>
          polarToCartesian(layout.cx, layout.cy, layout.radius, angle)
        )
        const pointIndex = findNearestPointIndex(axisPoints, loc.x, loc.y)
        if (pointIndex === null) return
        hoveredPoint.value = { seriesIndex, pointIndex }
        handleHoverEnter(seriesIndex, event)
        handleMouseMove(event)
      }
      const handlePointKeyDown = (
        event: KeyboardEvent,
        seriesIndex: number,
        pointIndex: number
      ) => {
        if (isChartNavigationKey(event.key)) {
          event.preventDefault()
          const next = nextChartPointRef({ seriesIndex, pointIndex }, event.key, flatPoints.value)
          if (!next) return
          activePoint.value = next
          const node = (event.currentTarget as SVGElement).ownerSVGElement?.querySelector(
            `[data-radar-point][data-series-index="${next.seriesIndex}"][data-point-index="${next.pointIndex}"]`
          )
          if (node instanceof SVGElement) node.focus()
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleSelectIndex(seriesIndex)
        }
      }

      const defs =
        props.gradient || props.strokeGradient || props.pointGradient
          ? h(
              'defs',
              null,
              layout.series.flatMap((item) => {
                const nodes = []
                if (props.gradient) {
                  nodes.push(
                    h(
                      'linearGradient',
                      {
                        id: `${gradientPrefix}-${item.seriesKey}`,
                        gradientUnits: 'userSpaceOnUse',
                        x1: layout.cx,
                        y1: layout.cy - layout.radius,
                        x2: layout.cx,
                        y2: layout.cy + layout.radius
                      },
                      [
                        h('stop', {
                          offset: '0%',
                          'stop-color': item.color,
                          'stop-opacity': String(item.fillOpacity)
                        }),
                        h('stop', {
                          offset: '100%',
                          'stop-color': `color-mix(in oklab, var(--tiger-bg,#ffffff) 35%, ${item.color})`,
                          'stop-opacity': '0.02'
                        })
                      ]
                    )
                  )
                }
                if (props.strokeGradient) {
                  nodes.push(
                    h(
                      'linearGradient',
                      {
                        id: `${gradientPrefix}-stroke-${item.seriesKey}`,
                        gradientUnits: 'userSpaceOnUse',
                        x1: layout.cx,
                        y1: layout.cy - layout.radius,
                        x2: layout.cx,
                        y2: layout.cy + layout.radius
                      },
                      [
                        h('stop', {
                          offset: '0%',
                          'stop-color': `color-mix(in oklab, var(--tiger-bg,#ffffff) 20%, ${item.stroke})`
                        }),
                        h('stop', { offset: '50%', 'stop-color': item.stroke }),
                        h('stop', {
                          offset: '100%',
                          'stop-color': `color-mix(in oklab, var(--tiger-text,#111827) 12%, ${item.stroke})`
                        })
                      ]
                    )
                  )
                }
                if (props.pointGradient) {
                  nodes.push(
                    h('radialGradient', { id: `${gradientPrefix}-point-${item.seriesKey}` }, [
                      h('stop', {
                        offset: '0%',
                        'stop-color': `color-mix(in oklab, var(--tiger-bg,#ffffff) 30%, ${item.color})`
                      }),
                      h('stop', { offset: '100%', 'stop-color': item.color })
                    ])
                  )
                }
                return nodes
              })
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
          default: () => [
            defs,
            ...layout.splitAreas.map((area, index) =>
              h('path', {
                key: `split-${index}`,
                d: area.d,
                fill: area.color,
                'fill-opacity': props.splitAreaOpacity,
                'fill-rule': 'evenodd',
                stroke: 'none',
                'data-radar-split-area': 'true',
                'aria-hidden': 'true'
              })
            ),
            ...layout.grid.map((grid, index) =>
              grid.type === 'circle'
                ? h('circle', {
                    key: `grid-${index}`,
                    cx: grid.cx,
                    cy: grid.cy,
                    r: grid.r,
                    class: chartGridLineClasses,
                    fill: 'none',
                    'stroke-width': props.gridStrokeWidth,
                    'stroke-dasharray': dasharray,
                    'aria-hidden': 'true'
                  })
                : h('path', {
                    key: `grid-${index}`,
                    d: grid.d,
                    class: chartGridLineClasses,
                    fill: 'none',
                    'stroke-width': props.gridStrokeWidth,
                    'stroke-dasharray': dasharray,
                    'aria-hidden': 'true'
                  })
            ),
            ...layout.axes.map((line, index) =>
              h('line', {
                key: `axis-${index}`,
                x1: line.x1,
                y1: line.y1,
                x2: line.x2,
                y2: line.y2,
                class: chartGridLineClasses,
                'stroke-width': props.gridStrokeWidth,
                'stroke-dasharray': dasharray,
                'aria-hidden': 'true'
              })
            ),
            ...layout.series.map((item) => {
              const showSeriesPoints = item.series.showPoints ?? props.showPoints
              const resolvedPointSize = item.series.pointSize ?? props.pointSize
              const resolvedPointColor = item.series.pointColor ?? props.pointColor ?? item.color
              const points = showSeriesPoints
                ? item.points.map((point) => {
                    const isHovered =
                      hoveredPoint.value?.seriesIndex === item.seriesIndex &&
                      hoveredPoint.value?.pointIndex === point.index
                    const currentSize = isHovered
                      ? (props.pointHoverSize ?? resolvedPointSize + 2)
                      : resolvedPointSize
                    return h('circle', {
                      key: `point-${item.seriesKey}-${point.index}`,
                      cx: point.x,
                      cy: point.y,
                      r: currentSize,
                      fill: props.pointGradient
                        ? `url(#${gradientPrefix}-point-${item.seriesKey})`
                        : (point.datum.color ?? resolvedPointColor),
                      stroke: item.series.pointBorderColor ?? props.pointBorderColor,
                      'stroke-width': item.series.pointBorderWidth ?? props.pointBorderWidth,
                      class: 'transition-[r] duration-150 ease-out motion-reduce:transition-none',
                      'aria-hidden': focusableMarks ? undefined : true,
                      tabindex: focusableMarks
                        ? chartPointTabIndex(
                            item.seriesIndex,
                            point.index,
                            activePoint.value,
                            flatPoints.value
                          )
                        : undefined,
                      role: focusableMarks ? 'button' : undefined,
                      'aria-label': focusableMarks
                        ? formatChartTemplate(labels.value.pointAriaLabel, {
                            index: point.index + 1,
                            x: seriesName(item.series, item.seriesIndex),
                            y: point.value
                          })
                        : undefined,
                      'data-radar-point': 'true',
                      'data-series-index': item.seriesIndex,
                      'data-point-index': point.index,
                      onMouseenter: (e: MouseEvent) =>
                        handlePointEnter(item.seriesIndex, point.index, e),
                      onMousemove: handleMouseMove,
                      onMouseleave: handlePointLeave,
                      onFocus: (e: FocusEvent) =>
                        handlePointEnter(item.seriesIndex, point.index, e),
                      onClick: () => handleSelectIndex(item.seriesIndex),
                      onKeydown: (e: KeyboardEvent) =>
                        handlePointKeyDown(e, item.seriesIndex, point.index)
                    })
                  })
                : item.points.map((point) =>
                    h('circle', {
                      key: `hit-${item.seriesKey}-${point.index}`,
                      cx: point.x,
                      cy: point.y,
                      r: 8,
                      fill: 'transparent',
                      'aria-hidden': 'true',
                      tabindex: focusableMarks
                        ? chartPointTabIndex(
                            item.seriesIndex,
                            point.index,
                            activePoint.value,
                            flatPoints.value
                          )
                        : undefined,
                      'data-radar-point': 'true',
                      'data-series-index': item.seriesIndex,
                      'data-point-index': point.index,
                      onFocus: (e: FocusEvent) =>
                        handlePointEnter(item.seriesIndex, point.index, e),
                      onKeydown: (e: KeyboardEvent) =>
                        handlePointKeyDown(e, item.seriesIndex, point.index)
                    })
                  )
              return h(
                'g',
                {
                  key: item.seriesKey,
                  'data-series-type': 'radar',
                  'data-series-key': item.seriesKey,
                  'data-series-name': item.series.name,
                  opacity: item.opacity,
                  onMouseenter: (e: MouseEvent) => handleHoverEnter(item.seriesIndex, e),
                  onMouseleave: handlePointLeave,
                  onClick: () => handleSelectIndex(item.seriesIndex),
                  onKeydown: (event: KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      handleSelectIndex(item.seriesIndex)
                    }
                  }
                },
                [
                  item.path
                    ? h('path', {
                        d: item.path,
                        fill: item.fill,
                        'fill-opacity': props.gradient ? 1 : item.fillOpacity,
                        stroke: props.strokeGradient
                          ? `url(#${gradientPrefix}-stroke-${item.seriesKey})`
                          : item.stroke,
                        'stroke-width': item.series.strokeWidth ?? props.strokeWidth,
                        'stroke-linejoin': 'round',
                        class: classNames(
                          'motion-reduce:transition-none',
                          interactive.value && 'cursor-pointer'
                        ),
                        'data-radar-area': 'true',
                        'data-series-index': item.seriesIndex,
                        onMouseenter: (e: MouseEvent) => handleHoverEnter(item.seriesIndex, e),
                        onMousemove: (e: MouseEvent) => handleAreaMove(item.seriesIndex, e),
                        onMouseleave: handlePointLeave,
                        onClick: () => handleSelectIndex(item.seriesIndex)
                      })
                    : null,
                  ...points
                ]
              )
            }),
            ...layout.labels.map((label, index) =>
              h(
                'text',
                {
                  key: `label-${index}`,
                  x: label.x,
                  y: label.y,
                  'text-anchor': label.textAnchor,
                  'dominant-baseline': label.dominantBaseline,
                  class: chartAxisTickTextClasses,
                  'aria-hidden': 'true'
                },
                label.text
              )
            ),
            ...layout.levelLabels.map((label, index) =>
              h(
                'text',
                {
                  key: `level-${index}`,
                  x: label.x,
                  y: label.y,
                  class: chartAxisTickTextClasses,
                  'aria-hidden': 'true',
                  'data-radar-level-label': ''
                },
                label.text
              )
            )
          ]
        }
      )

      const tooltip = props.showTooltip
        ? h(ChartTooltip, {
            content: tooltipContent.value,
            open: hoveredPoint.value !== null && tooltipContent.value !== '',
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

export default RadarChart
