import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  computeTreeMapNodes,
  getChartElementOpacity,
  getChartInnerRect,
  resolveChartPalette,
  buildChartLegendItems,
  resolveChartTooltipContent,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type TreeMapChartDatum,
  type TreeMapChartProps as CoreTreeMapChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'

export interface VueTreeMapChartProps extends CoreTreeMapChartProps {
  data: TreeMapChartDatum[]
  padding?: ChartPadding
}

export const TreeMapChart = defineComponent({
  name: 'TigerTreeMapChart',
  props: {
    width: { type: Number, default: 400 },
    height: { type: Number, default: 300 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 8 },
    data: { type: Array as PropType<TreeMapChartDatum[]>, required: true },
    gap: { type: Number, default: 2 },
    showLabels: { type: Boolean, default: true },
    minLabelSize: { type: Number, default: 10 },
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
      type: Function as PropType<(datum: TreeMapChartDatum, index: number) => string>
    },
    // a11y
    title: { type: String },
    desc: { type: String },
    className: { type: String }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'node-click', 'node-hover'],
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
    } = useChartInteraction<TreeMapChartDatum>({
      hoverable: computed(() => props.hoverable),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      emit: emit as (event: string, ...args: unknown[]) => void,
      getData: (index: number) => {
        const node = nodes.value[index]
        return node
          ? ({ label: node.label, value: node.value } as TreeMapChartDatum)
          : ({} as TreeMapChartDatum)
      },
      eventNames: { hover: 'node-hover', click: 'node-click' }
    })

    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))
    const palette = computed(() => resolveChartPalette(props.colors))

    const nodes = computed(() =>
      computeTreeMapNodes(props.data, {
        width: innerRect.value.width,
        height: innerRect.value.height,
        gap: props.gap,
        colors: palette.value
      })
    )

    const total = computed(() => nodes.value.reduce((s, n) => s + n.value, 0))

    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: nodes.value,
        palette: palette.value,
        activeIndex: activeIndex.value,
        getLabel: (d) => d.label,
        getColor: (d) => d.color
      })
    )

    const tooltipContent = computed(() =>
      resolveChartTooltipContent(resolvedHoveredIndex.value, nodes.value, undefined, (node) => {
        const pct = total.value > 0 ? ((node.value / total.value) * 100).toFixed(1) : '0'
        return `${node.label}: ${node.value} (${pct}%)`
      })
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
            return h(
              ChartSeries,
              { data: nodes.value, type: 'treemap' },
              {
                default: () =>
                  nodes.value
                    .map((node) => {
                      const opacity = getChartElementOpacity(node.index, activeIndex.value, {
                        activeOpacity: props.activeOpacity,
                        inactiveOpacity: props.inactiveOpacity
                      })
                      const elems = [
                        h('rect', {
                          key: `node-${node.index}`,
                          x: node.x,
                          y: node.y,
                          width: node.w,
                          height: node.h,
                          rx: 2,
                          fill: node.color,
                          opacity,
                          class: classNames(interactive && 'cursor-pointer'),
                          style: { transition: 'opacity 0.2s ease-out' },
                          onMouseenter: (e: MouseEvent) => handleMouseEnter(node.index, e),
                          onMousemove: handleMouseMove,
                          onMouseleave: handleMouseLeave,
                          onClick: () => handleClick(node.index)
                        })
                      ]

                      if (props.showLabels && node.w > 30 && node.h > props.minLabelSize + 4) {
                        elems.push(
                          h(
                            'text',
                            {
                              key: `label-${node.index}`,
                              x: node.x + node.w / 2,
                              y: node.y + node.h / 2,
                              class: 'fill-white text-xs',
                              'text-anchor': 'middle',
                              'dominant-baseline': 'middle',
                              style: {
                                pointerEvents: 'none',
                                fontSize: `${Math.min(12, node.h * 0.3)}px`
                              }
                            },
                            node.label
                          )
                        )
                      }

                      return elems
                    })
                    .flat()
              }
            )
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

export default TreeMapChart
