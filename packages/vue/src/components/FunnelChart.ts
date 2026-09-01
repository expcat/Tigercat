import { defineComponent, computed, h, PropType, useId } from 'vue'
import {
  classNames,
  coerceClassValue,
  layoutFunnel,
  getChartElementOpacity,
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
  funnelStageDisplayLabel,
  funnelSegmentTransitionClasses,
  pieSliceLabelInsideClasses,
  DEFAULT_FUNNEL_HEIGHT,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type FunnelChartDatum,
  type FunnelChartProps as CoreFunnelChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'
import { useResponsiveChartSize } from '../composables/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface VueFunnelChartProps extends CoreFunnelChartProps {
  data: FunnelChartDatum[]
  padding?: ChartPadding
  onSegmentClick?: (index: number, datum: FunnelChartDatum) => void
}

export type FunnelChartProps = VueFunnelChartProps

export const FunnelChart = defineComponent({
  name: 'TigerFunnelChart',
  inheritAttrs: false,
  props: {
    width: { type: Number, default: 320 },
    height: { type: Number, default: DEFAULT_FUNNEL_HEIGHT },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 24 },
    responsive: { type: Boolean, default: false },
    data: { type: Array as PropType<FunnelChartDatum[]>, required: true },
    direction: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    gap: { type: Number, default: 2 },
    pinch: { type: Boolean, default: false },
    colors: { type: Array as PropType<string[]> },
    gradient: { type: Boolean, default: false },
    showLabels: { type: Boolean, default: true },
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
      type: Function as PropType<(datum: FunnelChartDatum, index: number) => string>
    },
    title: { type: String },
    desc: { type: String },
    className: { type: String },
    onSegmentClick: {
      type: Function as PropType<(index: number, datum: FunnelChartDatum) => void>
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'segment-click', 'segment-hover'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getChartLabels(mergeTigerLocale(config.value.locale)))
    const interactive = computed(
      () => props.hoverable || props.selectable || typeof props.onSegmentClick === 'function'
    )
    const gradientPrefix = getStableChartGradientPrefix('funnel', useId())
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
    } = useChartInteraction<FunnelChartDatum>({
      hoverable: computed(() => props.hoverable),
      showTooltip: computed(() => props.showTooltip),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      getData: (index) => props.data[index],
      onHoveredIndexChange: (index) => emit('update:hoveredIndex', index),
      onSelectedIndexChange: (index) => emit('update:selectedIndex', index),
      onHover: (index, datum) => emit('segment-hover', index, datum),
      onClick: (index, datum) => {
        props.onSegmentClick?.(index, datum as FunnelChartDatum)
        emit('segment-click', index, datum)
      }
    })
    const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
      () => props.width,
      () => props.height,
      () => props.padding,
      () => props.responsive
    )
    const palette = computed(() => resolveChartPalette(props.colors))
    const segments = computed(() =>
      layoutFunnel(props.data, {
        width: innerRect.value.width,
        height: innerRect.value.height,
        gap: props.gap,
        pinch: props.pinch,
        colors: palette.value,
        direction: props.direction
      })
    )
    const total = computed(() => segments.value.reduce((sum, segment) => sum + segment.value, 0))
    const stageName = (datum: FunnelChartDatum, index: number) =>
      funnelStageDisplayLabel(datum, index, labels.value.stageName)
    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: props.data,
        palette: palette.value,
        activeIndex: activeIndex.value,
        selectedIndex: resolvedSelectedIndex.value,
        getLabel: (d, i) => stageName(d, i),
        getColor: (d, i) => d.color ?? palette.value[i % palette.value.length]
      })
    )
    const tooltipContent = computed(() =>
      resolveChartTooltipContent(
        resolvedHoveredIndex.value,
        props.data,
        props.tooltipFormatter,
        (datum, index) => {
          const pct = total.value > 0 ? ((datum.value / total.value) * 100).toFixed(1) : '0'
          return `${stageName(datum, index)}: ${datum.value} (${pct}%)`
        }
      )
    )

    return () => {
      const segs = segments.value
      const visualActive = segs.findIndex(
        (segment) => segment.index === (activeIndex.value ?? resolvedHoveredIndex.value)
      )
      const handleSegmentKeyDown = (event: KeyboardEvent, visualIndex: number) => {
        if (isChartNavigationKey(event.key)) {
          event.preventDefault()
          const nextVisual = nextChartRovingIndex(visualIndex, event.key, segs.length)
          const next = segs[nextVisual]
          const node = (event.currentTarget as SVGElement).parentElement?.querySelector(
            `[data-funnel-segment][data-index="${next.index}"]`
          )
          if (node instanceof SVGElement) node.focus()
          handleMouseEnter(next.index, event)
          return
        }
        handleKeyDown(event, segs[visualIndex].index)
      }
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
                  null,
                  segs.map((seg) =>
                    h(
                      'linearGradient',
                      {
                        key: `grad-${seg.index}`,
                        id: `${gradientPrefix}-${seg.index}`,
                        gradientUnits: 'userSpaceOnUse',
                        x1: 0,
                        y1: 0,
                        x2: props.direction === 'horizontal' ? innerRect.value.width : 0,
                        y2: props.direction === 'horizontal' ? 0 : innerRect.value.height
                      },
                      [
                        h('stop', { offset: '0%', 'stop-color': seg.color, 'stop-opacity': '1' }),
                        h('stop', {
                          offset: '100%',
                          'stop-color': seg.color,
                          'stop-opacity': '0.55'
                        })
                      ]
                    )
                  )
                )
              : null,
            h(
              'g',
              { 'data-series-type': 'funnel' },
              segs.map((seg, visualIndex) =>
                h('path', {
                  key: `seg-${seg.index}`,
                  d: seg.path,
                  fill: props.gradient ? `url(#${gradientPrefix}-${seg.index})` : seg.color,
                  opacity: getChartElementOpacity(seg.index, activeIndex.value, {
                    activeOpacity: props.activeOpacity,
                    inactiveOpacity: props.inactiveOpacity
                  }),
                  class: classNames(
                    interactive.value && 'cursor-pointer',
                    funnelSegmentTransitionClasses
                  ),
                  'data-funnel-segment': '',
                  'data-index': seg.index,
                  tabindex: interactive.value
                    ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                    : undefined,
                  role: interactive.value ? 'button' : undefined,
                  'aria-hidden': interactive.value ? undefined : true,
                  onMouseenter: (e: MouseEvent) => handleMouseEnter(seg.index, e),
                  onMousemove: handleMouseMove,
                  onMouseleave: handleMouseLeave,
                  onFocus: (e: FocusEvent) => handleMouseEnter(seg.index, e),
                  onClick: () => handleClick(seg.index),
                  onKeydown: (e: KeyboardEvent) => handleSegmentKeyDown(e, visualIndex)
                })
              )
            ),
            ...(props.showLabels
              ? segs.map((seg) =>
                  h(
                    'text',
                    {
                      key: `label-${seg.index}`,
                      x: seg.cx,
                      y: seg.cy,
                      class: pieSliceLabelInsideClasses,
                      'text-anchor': 'middle',
                      'dominant-baseline': 'middle',
                      'aria-hidden': 'true'
                    },
                    stageName(
                      props.data[seg.index] ?? { value: seg.value, label: seg.label },
                      seg.index
                    )
                  )
                )
              : [])
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

export default FunnelChart
