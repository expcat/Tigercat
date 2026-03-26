import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  computeHeatmapCells,
  getChartElementOpacity,
  getChartInnerRect,
  resolveChartTooltipContent,
  chartAxisTickTextClasses,
  type ChartPadding,
  type HeatmapChartDatum,
  type HeatmapChartProps as CoreHeatmapChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'

export interface VueHeatmapChartProps extends CoreHeatmapChartProps {
  padding?: ChartPadding
}

export const HeatmapChart = defineComponent({
  name: 'TigerHeatmapChart',
  props: {
    width: { type: Number, default: 400 },
    height: { type: Number, default: 300 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 40 },
    data: { type: Array as PropType<HeatmapChartDatum[]>, required: true },
    xLabels: { type: Array as PropType<string[]>, required: true },
    yLabels: { type: Array as PropType<string[]>, required: true },
    minColor: { type: String, default: '#f0f9ff' },
    maxColor: { type: String, default: '#2563eb' },
    cellRadius: { type: Number, default: 2 },
    cellGap: { type: Number, default: 1 },
    showValues: { type: Boolean, default: false },
    valueFormatter: { type: Function as PropType<(value: number) => string> },
    // Interaction
    hoverable: { type: Boolean, default: false },
    hoveredIndex: { type: Number as PropType<number | null>, default: undefined },
    activeOpacity: { type: Number, default: 1 },
    inactiveOpacity: { type: Number, default: 0.25 },
    selectable: { type: Boolean, default: false },
    selectedIndex: { type: Number as PropType<number | null>, default: undefined },
    // Tooltip
    showTooltip: { type: Boolean, default: true },
    tooltipFormatter: {
      type: Function as PropType<(datum: HeatmapChartDatum, index: number) => string>
    },
    // a11y
    title: { type: String },
    desc: { type: String },
    className: { type: String }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'cell-click', 'cell-hover'],
  setup(props, { emit }) {
    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      wrapperClasses
    } = useChartInteraction<HeatmapChartDatum>({
      hoverable: computed(() => props.hoverable),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      emit: emit as (event: string, ...args: unknown[]) => void,
      getData: (index: number) => props.data[index],
      eventNames: { hover: 'cell-hover', click: 'cell-click' }
    })

    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))

    const cells = computed(() =>
      computeHeatmapCells(props.data, {
        xLabels: props.xLabels,
        yLabels: props.yLabels,
        width: innerRect.value.width,
        height: innerRect.value.height,
        cellGap: props.cellGap,
        minColor: props.minColor,
        maxColor: props.maxColor
      })
    )

    const tooltipContent = computed(() =>
      resolveChartTooltipContent(resolvedHoveredIndex.value, cells.value, undefined, (cell) => {
        const val = props.valueFormatter ? props.valueFormatter(cell.value) : `${cell.value}`
        return `${cell.xLabel} × ${cell.yLabel}: ${val}`
      })
    )

    return () => {
      const interactive = props.hoverable || props.selectable
      const rect = innerRect.value

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
            // X axis labels
            const xAxisLabels = props.xLabels.map((label, i) => {
              const cellW =
                (rect.width - props.cellGap * (props.xLabels.length - 1)) / props.xLabels.length
              return h(
                'text',
                {
                  key: `x-${i}`,
                  x: i * (cellW + props.cellGap) + cellW / 2,
                  y: rect.height + 16,
                  class: chartAxisTickTextClasses,
                  'text-anchor': 'middle'
                },
                label
              )
            })

            // Y axis labels
            const yAxisLabels = props.yLabels.map((label, i) => {
              const cellH =
                (rect.height - props.cellGap * (props.yLabels.length - 1)) / props.yLabels.length
              return h(
                'text',
                {
                  key: `y-${i}`,
                  x: -8,
                  y: i * (cellH + props.cellGap) + cellH / 2,
                  class: chartAxisTickTextClasses,
                  'text-anchor': 'end',
                  'dominant-baseline': 'middle'
                },
                label
              )
            })

            // Cells
            const cellElems = cells.value
              .map((cell, idx) => {
                const opacity = getChartElementOpacity(idx, activeIndex.value, {
                  activeOpacity: props.activeOpacity,
                  inactiveOpacity: props.inactiveOpacity
                })
                const elems = [
                  h('rect', {
                    key: `cell-${idx}`,
                    x: cell.x,
                    y: cell.y,
                    width: cell.w,
                    height: cell.h,
                    rx: props.cellRadius,
                    fill: cell.fill,
                    opacity,
                    class: classNames(interactive && 'cursor-pointer'),
                    style: { transition: 'opacity 0.2s ease-out' },
                    onMouseenter: (e: MouseEvent) => handleMouseEnter(idx, e),
                    onMousemove: handleMouseMove,
                    onMouseleave: handleMouseLeave,
                    onClick: () => handleClick(idx)
                  })
                ]
                if (props.showValues) {
                  const val = props.valueFormatter
                    ? props.valueFormatter(cell.value)
                    : `${cell.value}`
                  elems.push(
                    h(
                      'text',
                      {
                        key: `val-${idx}`,
                        x: cell.x + cell.w / 2,
                        y: cell.y + cell.h / 2,
                        class: 'fill-[color:var(--tiger-text,#374151)] text-[10px]',
                        'text-anchor': 'middle',
                        'dominant-baseline': 'middle'
                      },
                      val
                    )
                  )
                }
                return elems
              })
              .flat()

            return [...xAxisLabels, ...yAxisLabels, ...cellElems]
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

      return h('div', { class: 'inline-block relative' }, [chart, tooltip])
    }
  }
})

export default HeatmapChart
