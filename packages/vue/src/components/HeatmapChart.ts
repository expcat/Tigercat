import { defineComponent, computed, h, nextTick, PropType, ref, watchEffect } from 'vue'
import {
  classNames,
  coerceClassValue,
  layoutHeatmap,
  getHeatmapCellIndexAtPoint,
  getHeatmapDevicePixelRatio,
  paintHeatmapCanvas,
  resolveHeatmapRenderMode,
  formatHeatmapTooltip,
  heatmapLabelFill,
  heatmapCellTransitionClasses,
  getChartElementOpacity,
  getCartesianChartShellClasses,
  chartAxisTickTextClasses,
  chartMarkTabIndex,
  isChartNavigationKey,
  nextHeatmapCellIndex,
  getChartLabels,
  mergeTigerLocale,
  DEFAULT_HEATMAP_WIDTH,
  DEFAULT_HEATMAP_HEIGHT,
  DEFAULT_HEATMAP_PADDING,
  DEFAULT_HEATMAP_MIN_COLOR,
  DEFAULT_HEATMAP_MAX_COLOR,
  DEFAULT_HEATMAP_CELL_RADIUS,
  DEFAULT_HEATMAP_CELL_GAP,
  type ChartPadding,
  type HeatmapChartDatum,
  type HeatmapChartProps as CoreHeatmapChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'
import { useResponsiveChartSize } from '../composables/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface VueHeatmapChartProps extends CoreHeatmapChartProps {
  padding?: ChartPadding
  onCellClick?: (index: number, datum: HeatmapChartDatum | null) => void
}

export type HeatmapChartProps = VueHeatmapChartProps

export const HeatmapChart = defineComponent({
  name: 'TigerHeatmapChart',
  inheritAttrs: false,
  props: {
    width: { type: Number, default: DEFAULT_HEATMAP_WIDTH },
    height: { type: Number, default: DEFAULT_HEATMAP_HEIGHT },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: DEFAULT_HEATMAP_PADDING },
    responsive: { type: Boolean, default: false },
    data: { type: Array as PropType<HeatmapChartDatum[]>, required: true },
    xLabels: { type: Array as PropType<string[]>, required: true },
    yLabels: { type: Array as PropType<string[]>, required: true },
    minColor: { type: String, default: DEFAULT_HEATMAP_MIN_COLOR },
    maxColor: { type: String, default: DEFAULT_HEATMAP_MAX_COLOR },
    min: { type: Number },
    max: { type: Number },
    colorSpace: { type: String as PropType<'rgb' | 'oklch'>, default: 'rgb' as const },
    cellRadius: { type: Number, default: DEFAULT_HEATMAP_CELL_RADIUS },
    cellGap: { type: Number, default: DEFAULT_HEATMAP_CELL_GAP },
    showValues: { type: Boolean, default: false },
    renderMode: { type: String as PropType<'svg' | 'canvas' | 'auto'>, default: 'auto' },
    canvasThreshold: { type: Number },
    valueFormatter: { type: Function as PropType<(value: number) => string> },
    hoverable: { type: Boolean, default: false },
    hoveredIndex: { type: Number as PropType<number | null>, default: undefined },
    activeOpacity: { type: Number, default: 1 },
    inactiveOpacity: { type: Number, default: 0.25 },
    selectable: { type: Boolean, default: false },
    selectedIndex: { type: Number as PropType<number | null>, default: undefined },
    showTooltip: { type: Boolean, default: true },
    tooltipFormatter: {
      type: Function as PropType<(datum: HeatmapChartDatum | null, index: number) => string>
    },
    title: { type: String },
    desc: { type: String },
    className: { type: String },
    onCellClick: {
      type: Function as PropType<(index: number, datum: HeatmapChartDatum | null) => void>
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'cell-click', 'cell-hover'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getChartLabels(mergeTigerLocale(config.value.locale)))
    const interactive = computed(
      () => props.hoverable || props.selectable || typeof props.onCellClick === 'function'
    )
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
      () => props.width,
      () => props.height,
      () => props.padding,
      () => props.responsive
    )
    const layout = computed(() =>
      layoutHeatmap(props.data, {
        xLabels: props.xLabels,
        yLabels: props.yLabels,
        width: innerRect.value.width,
        height: innerRect.value.height,
        cellGap: props.cellGap,
        minColor: props.minColor,
        maxColor: props.maxColor,
        colorSpace: props.colorSpace,
        min: props.min,
        max: props.max
      })
    )
    const cells = computed(() => layout.value.cells)
    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      handleKeyDown
    } = useChartInteraction<HeatmapChartDatum | null>({
      hoverable: computed(() => props.hoverable),
      showTooltip: computed(() => props.showTooltip),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      getData: (index: number) => cells.value[index]?.datum ?? null,
      onHoveredIndexChange: (index) => emit('update:hoveredIndex', index),
      onSelectedIndexChange: (index) => emit('update:selectedIndex', index),
      onHover: (index, datum) => emit('cell-hover', index, datum ?? null),
      onClick: (index, datum) => {
        const resolved = datum ?? null
        props.onCellClick?.(index, resolved)
        emit('cell-click', index, resolved)
      }
    })

    const formatValue = (value: number | null): string => {
      if (value === null) return ''
      return props.valueFormatter ? props.valueFormatter(value) : `${value}`
    }

    const tooltipContent = computed(() => {
      if (resolvedHoveredIndex.value === null) return ''
      const cell = cells.value[resolvedHoveredIndex.value]
      if (!cell) return ''
      if (props.tooltipFormatter) return props.tooltipFormatter(cell.datum, cell.index)
      return formatHeatmapTooltip(labels.value.heatmapTooltip, cell, formatValue(cell.value))
    })

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
        const dpr = getHeatmapDevicePixelRatio()
        canvas.width = Math.max(0, Math.round(rect.width * dpr))
        canvas.height = Math.max(0, Math.round(rect.height * dpr))
        paintHeatmapCanvas(context, cellList, {
          width: rect.width,
          height: rect.height,
          dpr,
          cellRadius: currentCellRadius,
          showValues: currentShowValues,
          valueFormatter: formatter,
          activeIndex: currentActiveIndex,
          activeOpacity: currentActiveOpacity,
          inactiveOpacity: currentInactiveOpacity
        })
      })
    })

    const getCanvasPoint = (event: MouseEvent) => {
      const canvas = event.currentTarget as HTMLCanvasElement
      const bounds = canvas.getBoundingClientRect()
      const cssWidth = innerRect.value.width
      const cssHeight = innerRect.value.height
      const x = bounds.width > 0 ? ((event.clientX - bounds.left) / bounds.width) * cssWidth : 0
      const y = bounds.height > 0 ? ((event.clientY - bounds.top) / bounds.height) * cssHeight : 0
      return { x, y }
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
      if (index !== null) handleClick(index)
    }

    const handleCellKeyDown = (event: KeyboardEvent, index: number) => {
      if (isChartNavigationKey(event.key)) {
        event.preventDefault()
        const next = nextHeatmapCellIndex(index, event.key, layout.value.cols, layout.value.rows)
        if (!shouldRenderCanvas.value) {
          const node = (event.currentTarget as Element | null)?.parentElement?.querySelector(
            `[data-heatmap-cell][data-index="${next}"]`
          )
          if (node instanceof SVGElement) node.focus()
        }
        handleMouseEnter(next, event)
        return
      }
      handleKeyDown(event, index)
    }

    return () => {
      const pointerInteractive = interactive.value || props.showTooltip
      const rect = innerRect.value
      const currentLayout = layout.value
      const currentCells = currentLayout.cells
      const visualActive = currentCells.findIndex(
        (cell) => cell.index === (activeIndex.value ?? resolvedHoveredIndex.value)
      )

      const hiddenTable = h('table', { class: 'sr-only', 'data-heatmap-table': '' }, [
        h('thead', [
          h('tr', [
            h('td'),
            ...props.xLabels.map((label) => h('th', { key: `hx-${label}`, scope: 'col' }, label))
          ])
        ]),
        h('tbody', [
          ...props.yLabels.map((yLabel, row) =>
            h('tr', { key: `hy-${yLabel}` }, [
              h('th', { scope: 'row' }, yLabel),
              ...props.xLabels.map((xLabel, col) => {
                const cell = currentCells[row * currentLayout.cols + col]
                return h('td', { key: `hv-${xLabel}-${yLabel}` }, formatValue(cell?.value ?? null))
              })
            ])
          )
        ])
      ])

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
          default: () => {
            const xAxisLabels = currentLayout.xAxisLabels.map((label, i) =>
              h(
                'text',
                {
                  key: `x-${i}`,
                  x: label.x,
                  y: label.y,
                  class: chartAxisTickTextClasses,
                  'text-anchor': 'middle'
                },
                label.text
              )
            )
            const yAxisLabels = currentLayout.yAxisLabels.map((label, i) =>
              h(
                'text',
                {
                  key: `y-${i}`,
                  x: label.x,
                  y: label.y,
                  class: chartAxisTickTextClasses,
                  'text-anchor': 'end',
                  'dominant-baseline': 'middle'
                },
                label.text
              )
            )
            const cellElems = shouldRenderCanvas.value
              ? []
              : currentCells.flatMap((cell, visualIndex) => {
                  const opacity = getChartElementOpacity(cell.index, activeIndex.value, {
                    activeOpacity: props.activeOpacity,
                    inactiveOpacity: props.inactiveOpacity
                  })
                  const ariaLabel = formatHeatmapTooltip(
                    labels.value.heatmapTooltip,
                    cell,
                    formatValue(cell.value)
                  )
                  const elems = [
                    h('rect', {
                      key: `cell-${cell.index}`,
                      x: cell.x,
                      y: cell.y,
                      width: cell.w,
                      height: cell.h,
                      rx: props.cellRadius,
                      fill: cell.fill,
                      opacity,
                      'data-heatmap-cell': '',
                      'data-index': cell.index,
                      class: classNames(
                        interactive.value && 'cursor-pointer',
                        heatmapCellTransitionClasses
                      ),
                      tabindex: interactive.value
                        ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                        : undefined,
                      role: interactive.value ? 'button' : undefined,
                      'aria-hidden': interactive.value ? undefined : true,
                      'aria-label': interactive.value ? ariaLabel : undefined,
                      onMouseenter: (e: MouseEvent) => handleMouseEnter(cell.index, e),
                      onMousemove: handleMouseMove,
                      onMouseleave: handleMouseLeave,
                      onFocus: (e: FocusEvent) => handleMouseEnter(cell.index, e),
                      onClick: () => handleClick(cell.index),
                      onKeydown: (e: KeyboardEvent) => handleCellKeyDown(e, cell.index)
                    })
                  ]
                  if (props.showValues && cell.value !== null) {
                    elems.push(
                      h(
                        'text',
                        {
                          key: `val-${cell.index}`,
                          x: cell.x + cell.w / 2,
                          y: cell.y + cell.h / 2,
                          fill: heatmapLabelFill(cell.fill, cell.heat),
                          class: 'text-[10px] pointer-events-none',
                          'text-anchor': 'middle',
                          'dominant-baseline': 'middle',
                          'aria-hidden': 'true'
                        },
                        formatValue(cell.value)
                      )
                    )
                  }
                  return elems
                })
            return [...xAxisLabels, ...yAxisLabels, ...cellElems]
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

      const canvas = shouldRenderCanvas.value
        ? h('canvas', {
            ref: canvasRef,
            class: classNames(interactive.value && 'cursor-pointer'),
            style: {
              position: 'absolute',
              left: `${rect.x}px`,
              top: `${rect.y}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              pointerEvents: pointerInteractive ? 'auto' : 'none'
            },
            tabindex: interactive.value ? 0 : undefined,
            'aria-hidden': interactive.value ? undefined : true,
            'data-heatmap-canvas': 'true',
            'data-heatmap-render-mode': resolvedRenderMode.value,
            onMousemove: pointerInteractive ? handleCanvasMouseMove : undefined,
            onMouseleave: pointerInteractive ? handleMouseLeave : undefined,
            onClick: interactive.value ? handleCanvasClick : undefined,
            onKeydown: interactive.value
              ? (event: KeyboardEvent) =>
                  handleCellKeyDown(
                    event,
                    visualActive < 0 ? 0 : (currentCells[visualActive]?.index ?? 0)
                  )
              : undefined
          })
        : null

      return h(
        'div',
        {
          class: getCartesianChartShellClasses({
            showLegend: false,
            responsive: props.responsive,
            className: classNames(coerceClassValue(attrs.class), props.className)
          })
        },
        [chart, canvas, hiddenTable, tooltip]
      )
    }
  }
})

export default HeatmapChart
