import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  computeFunnelSegments,
  getChartElementOpacity,
  getChartInnerRect,
  getFunnelGradientPrefix,
  resolveChartPalette,
  buildChartLegendItems,
  resolveChartTooltipContent,
  chartAxisTickTextClasses,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type FunnelChartDatum,
  type FunnelChartProps as CoreFunnelChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'

export interface VueFunnelChartProps extends CoreFunnelChartProps {
  data: FunnelChartDatum[]
  padding?: ChartPadding
}

export const FunnelChart = defineComponent({
  name: 'TigerFunnelChart',
  props: {
    width: { type: Number, default: 320 },
    height: { type: Number, default: 300 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 24 },
    data: { type: Array as PropType<FunnelChartDatum[]>, required: true },
    direction: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    gap: { type: Number, default: 2 },
    pinch: { type: Boolean, default: false },
    colors: { type: Array as PropType<string[]> },
    gradient: { type: Boolean, default: false },
    // Interaction
    hoverable: { type: Boolean, default: false },
    hoveredIndex: { type: Number as PropType<number | null>, default: undefined },
    activeOpacity: { type: Number, default: 1 },
    inactiveOpacity: { type: Number, default: 0.25 },
    selectable: { type: Boolean, default: false },
    selectedIndex: { type: Number as PropType<number | null>, default: undefined },
    // Legend
    showLegend: { type: Boolean, default: false },
    legendPosition: { type: String as PropType<ChartLegendPosition>, default: 'bottom' },
    legendMarkerSize: { type: Number, default: 10 },
    legendGap: { type: Number, default: 8 },
    // Tooltip
    showTooltip: { type: Boolean, default: true },
    tooltipFormatter: {
      type: Function as PropType<(datum: FunnelChartDatum, index: number) => string>
    },
    // a11y
    title: { type: String },
    desc: { type: String },
    className: { type: String }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'segment-click', 'segment-hover'],
  setup(props, { emit }) {
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
    } = useChartInteraction<FunnelChartDatum>({
      hoverable: computed(() => props.hoverable),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      emit: emit as (event: string, ...args: unknown[]) => void,
      getData: (index: number) => props.data[index],
      eventNames: { hover: 'segment-hover', click: 'segment-click' }
    })

    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))
    const palette = computed(() => resolveChartPalette(props.colors))

    const segments = computed(() =>
      computeFunnelSegments(props.data, {
        width: innerRect.value.width,
        height: innerRect.value.height,
        gap: props.gap,
        pinch: props.pinch,
        colors: palette.value
      })
    )

    const total = computed(() => props.data.reduce((s, d) => s + d.value, 0))

    // Stable gradient ID prefix per FunnelChart instance
    const gradientPrefix = getFunnelGradientPrefix()

    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: props.data,
        palette: palette.value,
        activeIndex: activeIndex.value,
        getLabel: (d, i) => d.label ?? `Stage ${i + 1}`,
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
          const label = datum.label ?? `Stage ${index + 1}`
          return `${label}: ${datum.value} (${pct}%)`
        }
      )
    )

    return () => {
      const interactive = props.hoverable || props.selectable

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
          default: () => {
            const defs = props.gradient
              ? h(
                  'defs',
                  {},
                  segments.value.map((seg) =>
                    h(
                      'linearGradient',
                      {
                        key: `grad-${seg.index}`,
                        id: `${gradientPrefix}-${seg.index}`,
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                      },
                      [
                        h('stop', { offset: '0%', 'stop-color': seg.color, 'stop-opacity': 1 }),
                        h('stop', {
                          offset: '100%',
                          'stop-color': seg.color,
                          'stop-opacity': 0.55
                        })
                      ]
                    )
                  )
                )
              : null

            const paths = h(
              ChartSeries,
              { data: props.data, type: 'funnel' },
              {
                default: () =>
                  segments.value.map((seg) => {
                    const opacity = getChartElementOpacity(seg.index, activeIndex.value, {
                      activeOpacity: props.activeOpacity,
                      inactiveOpacity: props.inactiveOpacity
                    })
                    return h('path', {
                      key: `seg-${seg.index}`,
                      d: seg.path,
                      fill: props.gradient ? `url(#${gradientPrefix}-${seg.index})` : seg.color,
                      opacity,
                      class: classNames(interactive && 'cursor-pointer'),
                      style: {
                        transition: 'opacity 0.2s ease-out'
                      },
                      tabindex: props.selectable ? 0 : undefined,
                      role: props.selectable ? 'button' : 'img',
                      'aria-label': seg.label,
                      onMouseenter: (e: MouseEvent) => handleMouseEnter(seg.index, e),
                      onMousemove: handleMouseMove,
                      onMouseleave: handleMouseLeave,
                      onClick: () => handleClick(seg.index),
                      onKeydown: (e: KeyboardEvent) => handleKeyDown(e, seg.index)
                    })
                  })
              }
            )

            const labels = segments.value.map((seg) =>
              h(
                'text',
                {
                  key: `label-${seg.index}`,
                  x: seg.cx,
                  y: seg.cy,
                  class: chartAxisTickTextClasses,
                  'text-anchor': 'middle',
                  'dominant-baseline': 'middle'
                },
                seg.label
              )
            )

            return [defs, paths, ...labels].filter(Boolean)
          }
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
          interactive,
          onItemClick: handleLegendClick,
          onItemHover: handleLegendHover,
          onItemLeave: handleLegendLeave
        }),
        tooltip
      ])
    }
  }
})

export default FunnelChart
