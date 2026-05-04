import { defineComponent, computed, h, nextTick, PropType, ref, watchEffect } from 'vue'
import {
  classNames,
  computeHeatmapCells,
  getHeatmapCellIndexAtPoint,
  getChartElementOpacity,
  getChartInnerRect,
  resolveHeatmapRenderMode,
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
    colorSpace: { type: String as PropType<'rgb' | 'oklch'>, default: 'rgb' as const },
    cellRadius: { type: Number, default: 2 },
    cellGap: { type: Number, default: 1 },
    showValues: { type: Boolean, default: false },
    renderMode: { type: String as PropType<'svg' | 'canvas' | 'auto'>, default: 'auto' },
    canvasThreshold: { type: Number },
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
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      wrapperClasses: _wrapperClasses
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
        maxColor: props.maxColor,
        colorSpace: props.colorSpace
      })
    )

    const tooltipContent = computed(() =>
      resolveChartTooltipContent(resolvedHoveredIndex.value, cells.value, undefined, (cell) => {
        const val = props.valueFormatter ? props.valueFormatter(cell.value) : `${cell.value}`
        return `${cell.xLabel} × ${cell.yLabel}: ${val}`
      })
    )

    const resolvedRenderMode = computed(() =>
      resolveHeatmapRenderMode(cells.value.length, {
        renderMode: props.renderMode,
        canvasThreshold: props.canvasThreshold
      })
    )

    const shouldRenderCanvas = computed(() => resolvedRenderMode.value === 'canvas')

    watchEffect(() => {
      if (!shouldRenderCanvas.value) return

      const rect = innerRect.value
      const cellList = cells.value
      const currentActiveIndex = activeIndex.value
      const currentActiveOpacity = props.activeOpacity
      const currentInactiveOpacity = props.inactiveOpacity
      const currentCellRadius = props.cellRadius
      const currentShowValues = props.showValues
      const formatter = props.valueFormatter

      nextTick(() => {
        const canvas = canvasRef.value
        const context = canvas?.getContext('2d')
        if (!canvas || !context) return

        context.clearRect(0, 0, rect.width, rect.height)
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.font = '10px sans-serif'

        cellList.forEach((cell, idx) => {
          context.globalAlpha =
            getChartElementOpacity(idx, currentActiveIndex, {
              activeOpacity: currentActiveOpacity,
              inactiveOpacity: currentInactiveOpacity
            }) ?? 1
          context.fillStyle = cell.fill

          const radius = Math.max(0, Math.min(currentCellRadius, cell.w / 2, cell.h / 2))
          if (radius > 0) {
            context.beginPath()
            context.moveTo(cell.x + radius, cell.y)
            context.lineTo(cell.x + cell.w - radius, cell.y)
            context.quadraticCurveTo(cell.x + cell.w, cell.y, cell.x + cell.w, cell.y + radius)
            context.lineTo(cell.x + cell.w, cell.y + cell.h - radius)
            context.quadraticCurveTo(
              cell.x + cell.w,
              cell.y + cell.h,
              cell.x + cell.w - radius,
              cell.y + cell.h
            )
            context.lineTo(cell.x + radius, cell.y + cell.h)
            context.quadraticCurveTo(cell.x, cell.y + cell.h, cell.x, cell.y + cell.h - radius)
            context.lineTo(cell.x, cell.y + radius)
            context.quadraticCurveTo(cell.x, cell.y, cell.x + radius, cell.y)
            context.closePath()
            context.fill()
          } else {
            context.fillRect(cell.x, cell.y, cell.w, cell.h)
          }

          if (currentShowValues) {
            context.globalAlpha = 1
            context.fillStyle = 'var(--tiger-text,#374151)'
            context.fillText(
              formatter ? formatter(cell.value) : `${cell.value}`,
              cell.x + cell.w / 2,
              cell.y + cell.h / 2
            )
          }
        })

        context.globalAlpha = 1
      })
    })

    const getCanvasPoint = (event: MouseEvent) => {
      const canvas = event.currentTarget as HTMLCanvasElement
      const bounds = canvas.getBoundingClientRect()
      const scaleX = bounds.width > 0 ? canvas.width / bounds.width : 1
      const scaleY = bounds.height > 0 ? canvas.height / bounds.height : 1

      return {
        x: event.offsetX * scaleX,
        y: event.offsetY * scaleY
      }
    }

    const handleCanvasMouseMove = (event: MouseEvent) => {
      const point = getCanvasPoint(event)
      const index = getHeatmapCellIndexAtPoint(cells.value, point.x, point.y)
      if (index === null) {
        handleMouseLeave()
        return
      }

      handleMouseEnter(index, event)
      handleMouseMove(event)
    }

    const handleCanvasClick = (event: MouseEvent) => {
      const point = getCanvasPoint(event)
      const index = getHeatmapCellIndexAtPoint(cells.value, point.x, point.y)
      if (index !== null) {
        handleClick(index)
      }
    }

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
            const cellElems = shouldRenderCanvas.value
              ? []
              : cells.value
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
                        style: {
                          transition: 'opacity 0.2s ease-out',
                          rx: `var(--tiger-chart-block-radius, ${props.cellRadius}px)`
                        },
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

      const canvas = shouldRenderCanvas.value
        ? h('canvas', {
            ref: canvasRef,
            width: rect.width,
            height: rect.height,
            class: classNames(interactive && 'cursor-pointer'),
            style: {
              position: 'absolute',
              left: `${rect.x}px`,
              top: `${rect.y}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              pointerEvents: interactive ? 'auto' : 'none'
            },
            'data-heatmap-canvas': 'true',
            'data-heatmap-render-mode': resolvedRenderMode.value,
            onMousemove: interactive ? handleCanvasMouseMove : undefined,
            onMouseleave: interactive ? handleMouseLeave : undefined,
            onClick: interactive ? handleCanvasClick : undefined
          })
        : null

      return h('div', { class: 'inline-block relative' }, [chart, canvas, tooltip])
    }
  }
})

export default HeatmapChart
