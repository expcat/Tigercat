import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  computeSunburstArcs,
  getChartElementOpacity,
  getChartInnerRect,
  resolveChartPalette,
  buildChartLegendItems,
  resolveChartTooltipContent,
  chartAxisTickTextClasses,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type SunburstChartDatum,
  type SunburstChartProps as CoreSunburstChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'

export interface VueSunburstChartProps extends CoreSunburstChartProps {
  data: SunburstChartDatum[]
  padding?: ChartPadding
}

export const SunburstChart = defineComponent({
  name: 'TigerSunburstChart',
  props: {
    width: { type: Number, default: 320 },
    height: { type: Number, default: 320 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 24 },
    data: { type: Array as PropType<SunburstChartDatum[]>, required: true },
    innerRadiusRatio: { type: Number, default: 0 },
    showLabels: { type: Boolean, default: true },
    colors: { type: Array as PropType<string[]> },
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
      type: Function as PropType<(datum: SunburstChartDatum, index: number) => string>
    },
    // a11y
    title: { type: String },
    desc: { type: String },
    className: { type: String }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'arc-click', 'arc-hover'],
  setup(props, { emit }) {
    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      handleLegendClick,
      handleLegendHover,
      handleLegendLeave,
      wrapperClasses
    } = useChartInteraction<SunburstChartDatum>({
      hoverable: computed(() => props.hoverable),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      emit: emit as (event: string, ...args: unknown[]) => void,
      getData: (index: number) => {
        const arc = arcs.value[index]
        return arc
          ? ({ label: arc.label, value: arc.value } as SunburstChartDatum)
          : ({} as SunburstChartDatum)
      },
      eventNames: { hover: 'arc-hover', click: 'arc-click' }
    })

    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))
    const palette = computed(() => resolveChartPalette(props.colors))

    const outerRadius = computed(() => Math.min(innerRect.value.width, innerRect.value.height) / 2)
    const innerRadius = computed(
      () => outerRadius.value * Math.max(0, Math.min(1, props.innerRadiusRatio))
    )

    const cx = computed(() => innerRect.value.width / 2)
    const cy = computed(() => innerRect.value.height / 2)

    const arcs = computed(() =>
      computeSunburstArcs(props.data, {
        cx: cx.value,
        cy: cy.value,
        innerRadius: innerRadius.value,
        outerRadius: outerRadius.value,
        colors: palette.value
      })
    )

    // Legend uses only root-level items (depth === 0)
    const rootArcs = computed(() => arcs.value.filter((a) => a.depth === 0))

    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: rootArcs.value,
        palette: palette.value,
        activeIndex: activeIndex.value,
        getLabel: (d) => d.label,
        getColor: (d) => d.color
      })
    )

    const tooltipContent = computed(() =>
      resolveChartTooltipContent(
        resolvedHoveredIndex.value,
        arcs.value,
        undefined,
        (arc) => `${arc.label}: ${arc.value}`
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
          default: () =>
            h(
              ChartSeries,
              { data: arcs.value, type: 'sunburst' },
              {
                default: () =>
                  arcs.value.map((arc) => {
                    const opacity = getChartElementOpacity(arc.index, activeIndex.value, {
                      activeOpacity: props.activeOpacity,
                      inactiveOpacity: props.inactiveOpacity
                    })
                    return h('path', {
                      key: `arc-${arc.index}`,
                      d: arc.path,
                      fill: arc.color,
                      opacity,
                      stroke: '#ffffff',
                      'stroke-width': 1,
                      class: classNames(interactive && 'cursor-pointer'),
                      style: { transition: 'opacity 0.2s ease-out' },
                      tabindex: props.selectable ? 0 : undefined,
                      role: props.selectable ? 'button' : 'img',
                      'aria-label': arc.label,
                      onMouseenter: (e: MouseEvent) => handleMouseEnter(arc.index, e),
                      onMousemove: handleMouseMove,
                      onMouseleave: handleMouseLeave,
                      onClick: () => handleClick(arc.index)
                    })
                  })
              }
            )
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

export default SunburstChart
