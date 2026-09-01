import { defineComponent, computed, h, PropType, useId } from 'vue'
import {
  classNames,
  coerceClassValue,
  getStableChartGradientPrefix,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  resolveChartTooltipContent,
  getCartesianChartShellClasses,
  chartMarkTabIndex,
  nextChartRovingIndex,
  isChartNavigationKey,
  getChartLabels,
  mergeTigerLocale,
  formatChartTemplate,
  layoutPieSlices,
  pieSliceDisplayLabel,
  pieSliceTransitionClasses,
  pieSliceLabelInsideClasses,
  resolvePieRadii,
  DEFAULT_PIE_START_ANGLE,
  DONUT_ENTRANCE_CLASS,
  PIE_BASE_SHADOW,
  PIE_EMPHASIS_SHADOW,
  getChartElementOpacity,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type PieChartDatum,
  type PieChartProps as CorePieChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'
import { useResponsiveChartSize } from '../composables/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface VuePieChartProps extends CorePieChartProps {
  data: PieChartDatum[]
  padding?: ChartPadding
}

export type PieChartProps = VuePieChartProps

export const PieChart = defineComponent({
  name: 'TigerPieChart',
  inheritAttrs: false,
  props: {
    width: { type: Number, default: 320 },
    height: { type: Number, default: 200 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 24 },
    responsive: { type: Boolean, default: false },
    data: { type: Array as PropType<PieChartDatum[]>, required: true },
    innerRadius: { type: Number },
    innerRadiusRatio: { type: Number },
    outerRadius: { type: Number },
    startAngle: { type: Number, default: DEFAULT_PIE_START_ANGLE },
    endAngle: { type: Number, default: Math.PI * 2 },
    padAngle: { type: Number, default: 0 },
    colors: { type: Array as PropType<string[]> },
    showLabels: { type: Boolean, default: false },
    labelFormatter: {
      type: Function as PropType<(value: number, datum: PieChartDatum, index: number) => string>
    },
    hoverable: { type: Boolean, default: false },
    hoveredIndex: { type: Number as PropType<number | null>, default: undefined },
    activeOpacity: { type: Number, default: 1 },
    inactiveOpacity: { type: Number, default: 0.25 },
    selectable: { type: Boolean, default: false },
    selectedIndex: { type: Number as PropType<number | null>, default: undefined },
    showLegend: { type: Boolean, default: false },
    legendPosition: { type: String as PropType<ChartLegendPosition>, default: 'bottom' },
    legendMarkerSize: { type: Number, default: 10 },
    legendGap: { type: Number, default: 8 },
    legendFormatter: {
      type: Function as PropType<(datum: PieChartDatum, index: number) => string>
    },
    showTooltip: { type: Boolean, default: true },
    tooltipFormatter: {
      type: Function as PropType<(datum: PieChartDatum, index: number) => string>
    },
    title: { type: String },
    desc: { type: String },
    className: { type: String },
    borderWidth: { type: Number, default: 2 },
    borderColor: { type: String, default: 'var(--tiger-surface,#ffffff)' },
    hoverOffset: { type: Number, default: 8 },
    labelPosition: { type: String as PropType<'inside' | 'outside'>, default: 'inside' },
    shadow: { type: Boolean, default: false },
    gradient: { type: Boolean, default: false },
    centerValue: { type: [String, Number] as PropType<string | number> },
    centerLabel: { type: String },
    animated: { type: Boolean, default: false }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'slice-click', 'slice-hover'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getChartLabels(mergeTigerLocale(config.value.locale)))
    const interactive = computed(() => props.hoverable || props.selectable)
    const gradientPrefix = getStableChartGradientPrefix('pie', useId())

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
    } = useChartInteraction<PieChartDatum>({
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
      onHover: (index, datum) => emit('slice-hover', index, datum),
      onClick: (index, datum) => emit('slice-click', index, datum)
    })

    const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
      () => props.width,
      () => props.height,
      () => props.padding,
      () => props.responsive
    )

    const palette = computed(() => resolveChartPalette(props.colors))
    const radii = computed(() =>
      resolvePieRadii({
        innerWidth: innerRect.value.width,
        innerHeight: innerRect.value.height,
        innerRadius: props.innerRadius,
        outerRadius: props.outerRadius,
        innerRadiusRatio: props.innerRadiusRatio,
        labelPosition: props.labelPosition,
        hoverOffset: props.hoverOffset
      })
    )
    const slices = computed(() =>
      layoutPieSlices(props.data, {
        cx: radii.value.cx,
        cy: radii.value.cy,
        innerRadius: radii.value.innerRadius,
        outerRadius: radii.value.outerRadius,
        startAngle: props.startAngle,
        endAngle: props.endAngle,
        padAngle: props.padAngle,
        palette: palette.value,
        gradient: props.gradient,
        gradientPrefix,
        hoverOffset: props.hoverOffset,
        labelPosition: props.labelPosition
      })
    )
    const total = computed(() => slices.value.reduce((sum, slice) => sum + slice.value, 0))
    const sliceName = (datum: PieChartDatum, index: number) =>
      pieSliceDisplayLabel(datum, index, labels.value.sliceName)

    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: slices.value.map((slice) => slice.datum),
        palette: palette.value,
        activeIndex: activeIndex.value,
        selectedIndex: resolvedSelectedIndex.value,
        getLabel: (d, i) => (props.legendFormatter ? props.legendFormatter(d, i) : sliceName(d, i)),
        getColor: (d, i) => d.color ?? palette.value[i % palette.value.length]
      })
    )
    const tooltipContent = computed(() =>
      resolveChartTooltipContent(
        resolvedHoveredIndex.value,
        props.data,
        props.tooltipFormatter,
        (datum, index) => {
          const name = sliceName(datum, index)
          const percentage = total.value > 0 ? ((datum.value / total.value) * 100).toFixed(1) : '0'
          return `${name}: ${datum.value} (${percentage}%)`
        }
      )
    )

    return () => {
      const laid = slices.value
      const r = radii.value
      const visualActive = laid.findIndex(
        (slice) => slice.index === (activeIndex.value ?? resolvedHoveredIndex.value)
      )
      const centerParts = [props.centerValue, props.centerLabel].filter(
        (part) => part !== undefined
      )
      const resolvedDesc = [props.desc, ...centerParts.map((part) => String(part))]
        .filter(Boolean)
        .join(' ')

      const handleSliceKeyDown = (event: KeyboardEvent, visualIndex: number) => {
        if (isChartNavigationKey(event.key)) {
          event.preventDefault()
          const nextVisual = nextChartRovingIndex(visualIndex, event.key, laid.length)
          const next = laid[nextVisual]
          const node = (event.currentTarget as SVGGElement).parentElement?.querySelector(
            `[data-pie-slice][data-index="${next.index}"]`
          )
          if (node instanceof SVGElement) node.focus()
          handleMouseEnter(next.index, event)
          return
        }
        handleKeyDown(event, laid[visualIndex].index)
      }

      const chart = h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
          responsive: props.responsive,
          title: props.title,
          desc: resolvedDesc || undefined,
          className: props.animated ? DONUT_ENTRANCE_CLASS : undefined,
          onResolvedSizeChange
        },
        {
          default: () => {
            const gradientDefs = props.gradient
              ? h(
                  'defs',
                  null,
                  laid.map((slice) =>
                    h(
                      'linearGradient',
                      {
                        key: `pie-grad-${slice.index}`,
                        id: `${gradientPrefix}-${slice.index}`,
                        gradientUnits: 'userSpaceOnUse',
                        x1: r.cx,
                        y1: r.cy - r.outerRadius,
                        x2: r.cx,
                        y2: r.cy + r.outerRadius
                      },
                      [
                        h('stop', { offset: '0%', 'stop-color': slice.color, 'stop-opacity': '1' }),
                        h('stop', {
                          offset: '100%',
                          'stop-color': slice.color,
                          'stop-opacity': '0.7'
                        })
                      ]
                    )
                  )
                )
              : null
            const clip =
              r.innerRadius > 0 && centerParts.length > 0
                ? h('clipPath', { id: `${gradientPrefix}-center` }, [
                    h('circle', { cx: r.cx, cy: r.cy, r: r.innerRadius })
                  ])
                : null
            const sliceNodes = laid.map((slice, visualIndex) => {
              const isEmphasized = activeIndex.value === slice.index
              const ariaLabel = formatChartTemplate(labels.value.sliceAriaLabel, {
                label: sliceName(slice.datum, slice.index),
                value: slice.value,
                percent: slice.percent.toFixed(1)
              })
              return h(
                'g',
                {
                  key: `slice-${slice.index}`,
                  transform:
                    interactive.value && isEmphasized
                      ? `translate(${slice.hoverDx} ${slice.hoverDy})`
                      : undefined
                },
                [
                  h('path', {
                    d: slice.path,
                    fill: slice.fill,
                    opacity: getChartElementOpacity(slice.index, activeIndex.value, {
                      activeOpacity: props.activeOpacity,
                      inactiveOpacity: props.inactiveOpacity
                    }),
                    stroke: props.borderColor,
                    'stroke-width': props.borderWidth,
                    'stroke-linejoin': 'round',
                    'data-pie-slice': 'true',
                    'data-index': slice.index,
                    tabindex: interactive.value
                      ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                      : undefined,
                    role: interactive.value ? 'button' : undefined,
                    'aria-hidden': interactive.value ? undefined : true,
                    'aria-label': interactive.value ? ariaLabel : undefined,
                    class: classNames(
                      interactive.value && 'cursor-pointer',
                      pieSliceTransitionClasses
                    ),
                    style: {
                      filter: props.shadow
                        ? isEmphasized
                          ? PIE_EMPHASIS_SHADOW
                          : PIE_BASE_SHADOW
                        : undefined
                    },
                    onMouseenter: (e: MouseEvent) => handleMouseEnter(slice.index, e),
                    onMousemove: handleMouseMove,
                    onMouseleave: handleMouseLeave,
                    onFocus: (e: FocusEvent) => handleMouseEnter(slice.index, e),
                    onClick: () => handleClick(slice.index),
                    onKeydown: (e: KeyboardEvent) => handleSliceKeyDown(e, visualIndex)
                  })
                ]
              )
            })
            const outsideLabels =
              props.showLabels && props.labelPosition === 'outside'
                ? laid.map((slice) => {
                    const text = props.labelFormatter
                      ? props.labelFormatter(slice.value, slice.datum, slice.index)
                      : `${sliceName(slice.datum, slice.index)} ${slice.percent.toFixed(1)}%`
                    return h('g', { key: `label-group-${slice.index}`, 'aria-hidden': 'true' }, [
                      h('polyline', {
                        points: slice.outside?.points,
                        fill: 'none',
                        stroke: slice.color,
                        'stroke-width': 1,
                        opacity: 0.5
                      }),
                      h(
                        'text',
                        {
                          x: slice.outside?.x,
                          y: slice.outside?.y,
                          'text-anchor': slice.outside?.textAnchor,
                          'dominant-baseline': 'middle',
                          class: 'fill-[color:var(--tiger-text,#1f2937)] text-xs'
                        },
                        text
                      )
                    ])
                  })
                : []
            const insideLabels =
              props.showLabels && props.labelPosition !== 'outside'
                ? laid.map((slice) => {
                    const text = props.labelFormatter
                      ? props.labelFormatter(slice.value, slice.datum, slice.index)
                      : sliceName(slice.datum, slice.index)
                    return h(
                      'text',
                      {
                        key: `label-${slice.index}`,
                        x: slice.labelX,
                        y: slice.labelY,
                        class: pieSliceLabelInsideClasses,
                        'text-anchor': 'middle',
                        'dominant-baseline': 'middle',
                        'aria-hidden': 'true'
                      },
                      text
                    )
                  })
                : []
            const centerNode =
              centerParts.length > 0
                ? h(
                    'g',
                    {
                      'data-donut-center': 'true',
                      'clip-path': r.innerRadius > 0 ? `url(#${gradientPrefix}-center)` : undefined,
                      'aria-hidden': 'true'
                    },
                    [
                      props.centerValue !== undefined
                        ? h(
                            'text',
                            {
                              x: r.cx,
                              y: props.centerLabel !== undefined ? r.cy - 8 : r.cy,
                              'text-anchor': 'middle',
                              'dominant-baseline': 'middle',
                              class: 'fill-[color:var(--tiger-text,#1f2937)] text-xl font-semibold'
                            },
                            `${props.centerValue}`
                          )
                        : null,
                      props.centerLabel !== undefined
                        ? h(
                            'text',
                            {
                              x: r.cx,
                              y: props.centerValue !== undefined ? r.cy + 12 : r.cy,
                              'text-anchor': 'middle',
                              'dominant-baseline': 'middle',
                              class: 'fill-[color:var(--tiger-text-secondary,#6b7280)] text-xs'
                            },
                            props.centerLabel
                          )
                        : null
                    ]
                  )
                : null
            return [
              gradientDefs,
              clip,
              ...sliceNodes,
              ...outsideLabels,
              ...insideLabels,
              centerNode
            ]
          }
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
          }),
          'data-pie-chart': '',
          'data-donut-chart': r.innerRadius > 0 ? '' : undefined
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

export default PieChart
