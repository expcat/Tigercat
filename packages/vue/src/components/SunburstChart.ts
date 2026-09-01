import { defineComponent, computed, h, PropType, useId } from 'vue'
import {
  classNames,
  coerceClassValue,
  layoutSunburst,
  getChartElementOpacity,
  getStableChartGradientPrefix,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  getCartesianChartShellClasses,
  chartMarkTabIndex,
  isChartNavigationKey,
  nextSunburstArcIndex,
  getChartLabels,
  mergeTigerLocale,
  formatChartTemplate,
  sunburstArcTransitionClasses,
  DEFAULT_SUNBURST_SIZE,
  DEFAULT_SUNBURST_PADDING,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type SunburstChartDatum,
  type SunburstChartProps as CoreSunburstChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'
import { useResponsiveChartSize } from '../composables/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface VueSunburstChartProps extends CoreSunburstChartProps {
  data: SunburstChartDatum[]
  padding?: ChartPadding
  onArcClick?: (index: number, datum: SunburstChartDatum) => void
}

export type SunburstChartProps = VueSunburstChartProps

export const SunburstChart = defineComponent({
  name: 'TigerSunburstChart',
  inheritAttrs: false,
  props: {
    width: { type: Number, default: DEFAULT_SUNBURST_SIZE },
    height: { type: Number, default: DEFAULT_SUNBURST_SIZE },
    padding: {
      type: [Number, Object] as PropType<ChartPadding>,
      default: DEFAULT_SUNBURST_PADDING
    },
    responsive: { type: Boolean, default: false },
    data: { type: Array as PropType<SunburstChartDatum[]>, required: true },
    innerRadiusRatio: { type: Number, default: 0 },
    showLabels: { type: Boolean, default: true },
    colors: { type: Array as PropType<string[]> },
    gradient: { type: Boolean, default: false },
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
    showTooltip: { type: Boolean, default: true },
    tooltipFormatter: {
      type: Function as PropType<(datum: SunburstChartDatum, index: number) => string>
    },
    title: { type: String },
    desc: { type: String },
    className: { type: String },
    onArcClick: {
      type: Function as PropType<(index: number, datum: SunburstChartDatum) => void>
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'arc-click', 'arc-hover'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getChartLabels(mergeTigerLocale(config.value.locale)))
    const interactive = computed(
      () => props.hoverable || props.selectable || typeof props.onArcClick === 'function'
    )
    const gradientPrefix = getStableChartGradientPrefix('sunburst', useId())
    const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
      () => props.width,
      () => props.height,
      () => props.padding,
      () => props.responsive
    )
    const palette = computed(() => resolveChartPalette(props.colors))
    const cx = computed(() => innerRect.value.width / 2)
    const cy = computed(() => innerRect.value.height / 2)
    const outerRadius = computed(() => Math.min(innerRect.value.width, innerRect.value.height) / 2)
    const innerRadius = computed(
      () => outerRadius.value * Math.max(0, Math.min(1, props.innerRadiusRatio))
    )
    const arcs = computed(() =>
      layoutSunburst(props.data, {
        cx: cx.value,
        cy: cy.value,
        innerRadius: innerRadius.value,
        outerRadius: outerRadius.value,
        colors: palette.value
      })
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
    } = useChartInteraction<SunburstChartDatum>({
      hoverable: computed(() => props.hoverable),
      showTooltip: computed(() => props.showTooltip),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      getData: (index) => arcs.value[index]?.datum,
      onHoveredIndexChange: (index) => emit('update:hoveredIndex', index),
      onSelectedIndexChange: (index) => emit('update:selectedIndex', index),
      onHover: (index, datum) => emit('arc-hover', index, datum),
      onClick: (index, datum) => {
        if (datum) props.onArcClick?.(index, datum)
        emit('arc-click', index, datum)
      }
    })
    const roots = computed(() => arcs.value.filter((arc) => arc.depth === 0))
    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: roots.value.map((arc) => arc.datum),
        palette: palette.value,
        activeIndex: activeIndex.value,
        selectedIndex: resolvedSelectedIndex.value,
        getLabel: (d) => d.label,
        getColor: (_d, i) => roots.value[i]?.color ?? palette.value[i % palette.value.length]
      }).map((item, i) => ({ ...item, index: roots.value[i]?.index ?? item.index }))
    )
    const tooltipContent = computed(() => {
      if (resolvedHoveredIndex.value === null) return ''
      const arc = arcs.value[resolvedHoveredIndex.value]
      if (!arc) return ''
      if (props.tooltipFormatter) return props.tooltipFormatter(arc.datum, arc.index)
      return formatChartTemplate(labels.value.sunburstTooltip, {
        label: arc.label,
        value: arc.value,
        percent: arc.percent.toFixed(1)
      })
    })

    const handleArcKeyDown = (event: KeyboardEvent, index: number) => {
      if (isChartNavigationKey(event.key)) {
        event.preventDefault()
        const next = nextSunburstArcIndex(index, event.key, arcs.value)
        const node = (event.currentTarget as Element | null)?.parentElement?.querySelector(
          `[data-sunburst-arc][data-index="${next}"]`
        )
        if (node instanceof SVGElement) node.focus()
        handleMouseEnter(next, event)
        return
      }
      handleKeyDown(event, index)
    }

    return () => {
      const current = arcs.value
      const visualActive = current.findIndex(
        (arc) => arc.index === (activeIndex.value ?? resolvedHoveredIndex.value)
      )
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
            props.gradient
              ? h(
                  'defs',
                  current.map((arc) =>
                    h(
                      'linearGradient',
                      {
                        key: `grad-${arc.index}`,
                        id: `${gradientPrefix}-${arc.index}`,
                        gradientUnits: 'userSpaceOnUse',
                        x1: cx.value,
                        y1: cy.value - outerRadius.value,
                        x2: cx.value,
                        y2: cy.value + outerRadius.value
                      },
                      [
                        h('stop', {
                          offset: '0%',
                          'stop-color': arc.color,
                          'stop-opacity': '1'
                        }),
                        h('stop', {
                          offset: '100%',
                          'stop-color': arc.color,
                          'stop-opacity': '0.7'
                        })
                      ]
                    )
                  )
                )
              : null,
            h('g', { 'data-series-type': 'sunburst' }, [
              ...current.map((arc, visualIndex) =>
                h('path', {
                  key: `arc-${arc.index}`,
                  d: arc.path,
                  fill: props.gradient ? `url(#${gradientPrefix}-${arc.index})` : arc.color,
                  opacity: getChartElementOpacity(arc.index, activeIndex.value, {
                    activeOpacity: props.activeOpacity,
                    inactiveOpacity: props.inactiveOpacity
                  }),
                  stroke: 'var(--tiger-surface,#ffffff)',
                  'stroke-width': 1,
                  'data-sunburst-arc': '',
                  'data-index': arc.index,
                  class: classNames(
                    interactive.value && 'cursor-pointer',
                    sunburstArcTransitionClasses
                  ),
                  tabindex: interactive.value
                    ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                    : undefined,
                  role: interactive.value ? 'button' : undefined,
                  'aria-hidden': interactive.value ? undefined : true,
                  'aria-label': interactive.value
                    ? formatChartTemplate(labels.value.sunburstTooltip, {
                        label: arc.label,
                        value: arc.value,
                        percent: arc.percent.toFixed(1)
                      })
                    : undefined,
                  onMouseenter: (e: MouseEvent) => handleMouseEnter(arc.index, e),
                  onMousemove: handleMouseMove,
                  onMouseleave: handleMouseLeave,
                  onFocus: (e: FocusEvent) => handleMouseEnter(arc.index, e),
                  onClick: () => handleClick(arc.index),
                  onKeydown: (e: KeyboardEvent) => handleArcKeyDown(e, arc.index)
                })
              ),
              ...(props.showLabels
                ? current
                    .filter((arc) => arc.showLabel)
                    .map((arc) =>
                      h(
                        'text',
                        {
                          key: `label-${arc.index}`,
                          x: arc.labelX,
                          y: arc.labelY,
                          fill: arc.labelFill,
                          class: 'text-xs pointer-events-none select-none',
                          'text-anchor': 'middle',
                          'dominant-baseline': 'middle',
                          'aria-hidden': 'true'
                        },
                        arc.label
                      )
                    )
                : [])
            ])
          ]
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
                interactive: interactive.value,
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

export default SunburstChart
