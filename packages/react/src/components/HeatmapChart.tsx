import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  classNames,
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
import { useChartInteraction } from '../hooks/useChartInteraction'
import { useResponsiveChartSize } from '../hooks/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface HeatmapChartProps extends CoreHeatmapChartProps {
  padding?: ChartPadding
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onCellClick?: (index: number, datum: HeatmapChartDatum | null) => void
  onCellHover?: (index: number | null, datum: HeatmapChartDatum | null) => void
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  width = DEFAULT_HEATMAP_WIDTH,
  height = DEFAULT_HEATMAP_HEIGHT,
  padding = DEFAULT_HEATMAP_PADDING,
  responsive = false,
  data,
  xLabels,
  yLabels,
  minColor = DEFAULT_HEATMAP_MIN_COLOR,
  maxColor = DEFAULT_HEATMAP_MAX_COLOR,
  min,
  max,
  colorSpace = 'rgb',
  cellRadius = DEFAULT_HEATMAP_CELL_RADIUS,
  cellGap = DEFAULT_HEATMAP_CELL_GAP,
  showValues = false,
  valueFormatter,
  renderMode = 'auto',
  canvasThreshold,
  hoverable = false,
  hoveredIndex: hoveredIndexProp,
  activeOpacity = 1,
  inactiveOpacity = 0.25,
  selectable = false,
  selectedIndex: selectedIndexProp,
  showTooltip = true,
  tooltipFormatter,
  title,
  desc,
  className,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onCellClick,
  onCellHover
}) => {
  const config = useTigerConfig()
  const labels = useMemo(() => getChartLabels(mergeTigerLocale(config.locale)), [config.locale])
  const interactive = hoverable || selectable || Boolean(onCellClick)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
    width,
    height,
    padding,
    responsive
  )
  const layout = useMemo(
    () =>
      layoutHeatmap(data, {
        xLabels,
        yLabels,
        width: innerRect.width,
        height: innerRect.height,
        cellGap,
        minColor,
        maxColor,
        colorSpace,
        min,
        max
      }),
    [
      data,
      xLabels,
      yLabels,
      innerRect.width,
      innerRect.height,
      cellGap,
      minColor,
      maxColor,
      colorSpace,
      min,
      max
    ]
  )
  const cells = layout.cells
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
    hoverable,
    showTooltip,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    getData: (index: number) => cells[index]?.datum ?? null,
    onHoveredIndexChange: (index) => {
      onHoveredIndexChange?.(index)
      onCellHover?.(index, index !== null ? (cells[index]?.datum ?? null) : null)
    },
    onSelectedIndexChange,
    onClick: (index, datum) => onCellClick?.(index, datum ?? null)
  })

  const formatValue = useCallback(
    (value: number | null) => {
      if (value === null) return ''
      return valueFormatter ? valueFormatter(value) : `${value}`
    },
    [valueFormatter]
  )

  const tooltipContent = useMemo(() => {
    if (resolvedHoveredIndex === null) return ''
    const cell = cells[resolvedHoveredIndex]
    if (!cell) return ''
    if (tooltipFormatter) return tooltipFormatter(cell.datum, cell.index)
    return formatHeatmapTooltip(labels.heatmapTooltip, cell, formatValue(cell.value))
  }, [resolvedHoveredIndex, cells, tooltipFormatter, labels.heatmapTooltip, formatValue])

  const pointerInteractive = interactive || showTooltip
  const resolvedRenderMode = resolveHeatmapRenderMode(cells.length, {
    renderMode,
    canvasThreshold
  })
  const shouldRenderCanvas = resolvedRenderMode === 'canvas'
  const visualActive = cells.findIndex(
    (cell) => cell.index === (activeIndex ?? resolvedHoveredIndex)
  )

  useEffect(() => {
    if (!shouldRenderCanvas) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const dpr = getHeatmapDevicePixelRatio()
    canvas.width = Math.max(0, Math.round(innerRect.width * dpr))
    canvas.height = Math.max(0, Math.round(innerRect.height * dpr))
    paintHeatmapCanvas(context, cells, {
      width: innerRect.width,
      height: innerRect.height,
      dpr,
      cellRadius,
      showValues,
      valueFormatter,
      activeIndex,
      activeOpacity,
      inactiveOpacity
    })
  }, [
    shouldRenderCanvas,
    cells,
    innerRect.width,
    innerRect.height,
    activeIndex,
    activeOpacity,
    inactiveOpacity,
    cellRadius,
    showValues,
    valueFormatter
  ])

  const getCanvasPoint = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget
      const bounds = canvas.getBoundingClientRect()
      const cssWidth = innerRect.width
      const cssHeight = innerRect.height
      const x = bounds.width > 0 ? ((event.clientX - bounds.left) / bounds.width) * cssWidth : 0
      const y = bounds.height > 0 ? ((event.clientY - bounds.top) / bounds.height) * cssHeight : 0
      return { x, y }
    },
    [innerRect.width, innerRect.height]
  )

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getCanvasPoint(event)
      const index = getHeatmapCellIndexAtPoint(cells, point.x, point.y)
      if (index === null) {
        handleMouseLeave()
        return
      }
      handleMouseEnter(index, event)
      handleMouseMove(event)
    },
    [cells, getCanvasPoint, handleMouseEnter, handleMouseLeave, handleMouseMove]
  )

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const point = getCanvasPoint(event)
      const index = getHeatmapCellIndexAtPoint(cells, point.x, point.y)
      if (index !== null) handleClick(index)
    },
    [cells, getCanvasPoint, handleClick]
  )

  const handleCellKeyDown = (
    event: React.KeyboardEvent<SVGRectElement | HTMLCanvasElement>,
    index: number
  ) => {
    if (isChartNavigationKey(event.key)) {
      event.preventDefault()
      const next = nextHeatmapCellIndex(index, event.key, layout.cols, layout.rows)
      if (!shouldRenderCanvas) {
        const node = event.currentTarget.parentElement?.querySelector(
          `[data-heatmap-cell][data-index="${next}"]`
        )
        if (node instanceof SVGElement) node.focus()
      }
      handleMouseEnter(next, event)
      return
    }
    handleKeyDown(event, index)
  }

  const hiddenTable = (
    <table className="sr-only" data-heatmap-table="">
      <thead>
        <tr>
          <td />
          {xLabels.map((label) => (
            <th key={`hx-${label}`} scope="col">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {yLabels.map((yLabel, row) => (
          <tr key={`hy-${yLabel}`}>
            <th scope="row">{yLabel}</th>
            {xLabels.map((xLabel, col) => {
              const cell = cells[row * layout.cols + col]
              return <td key={`hv-${xLabel}-${yLabel}`}>{formatValue(cell?.value ?? null)}</td>
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      responsive={responsive}
      title={title}
      desc={desc}
      onResolvedSizeChange={onResolvedSizeChange}>
      {layout.xAxisLabels.map((label, i) => (
        <text
          key={`x-${i}`}
          x={label.x}
          y={label.y}
          className={chartAxisTickTextClasses}
          textAnchor="middle">
          {label.text}
        </text>
      ))}
      {layout.yAxisLabels.map((label, i) => (
        <text
          key={`y-${i}`}
          x={label.x}
          y={label.y}
          className={chartAxisTickTextClasses}
          textAnchor="end"
          dominantBaseline="middle">
          {label.text}
        </text>
      ))}
      {!shouldRenderCanvas &&
        cells.map((cell, visualIndex) => {
          const opacity = getChartElementOpacity(cell.index, activeIndex, {
            activeOpacity,
            inactiveOpacity
          })
          const ariaLabel = formatHeatmapTooltip(
            labels.heatmapTooltip,
            cell,
            formatValue(cell.value)
          )
          return (
            <React.Fragment key={`cell-${cell.index}`}>
              <rect
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                rx={cellRadius}
                fill={cell.fill}
                opacity={opacity}
                data-heatmap-cell=""
                data-index={cell.index}
                className={classNames(
                  interactive && 'cursor-pointer',
                  heatmapCellTransitionClasses
                )}
                tabIndex={
                  interactive
                    ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                    : undefined
                }
                role={interactive ? 'button' : undefined}
                aria-hidden={interactive ? undefined : true}
                aria-label={interactive ? ariaLabel : undefined}
                onMouseEnter={(e) => handleMouseEnter(cell.index, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onFocus={(e) => handleMouseEnter(cell.index, e)}
                onClick={() => handleClick(cell.index)}
                onKeyDown={(e) => handleCellKeyDown(e, cell.index)}
              />
              {showValues && cell.value !== null && (
                <text
                  x={cell.x + cell.w / 2}
                  y={cell.y + cell.h / 2}
                  fill={heatmapLabelFill(cell.fill, cell.heat)}
                  className="text-[10px] pointer-events-none"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  aria-hidden="true">
                  {formatValue(cell.value)}
                </text>
              )}
            </React.Fragment>
          )
        })}
    </ChartCanvas>
  )

  const tooltip = showTooltip ? (
    <ChartTooltip
      content={tooltipContent}
      open={resolvedHoveredIndex !== null && tooltipContent !== ''}
      x={tooltipPosition.x}
      y={tooltipPosition.y}
    />
  ) : null

  return (
    <div
      className={getCartesianChartShellClasses({
        showLegend: false,
        responsive,
        className
      })}>
      {chart}
      {shouldRenderCanvas && (
        <canvas
          ref={canvasRef}
          data-heatmap-canvas="true"
          data-heatmap-render-mode={resolvedRenderMode}
          className={classNames(interactive && 'cursor-pointer')}
          tabIndex={interactive ? 0 : undefined}
          aria-hidden={interactive ? undefined : true}
          style={{
            position: 'absolute',
            left: `${innerRect.x}px`,
            top: `${innerRect.y}px`,
            width: `${innerRect.width}px`,
            height: `${innerRect.height}px`,
            pointerEvents: pointerInteractive ? 'auto' : 'none'
          }}
          onMouseMove={pointerInteractive ? handleCanvasMouseMove : undefined}
          onMouseLeave={pointerInteractive ? handleMouseLeave : undefined}
          onClick={interactive ? handleCanvasClick : undefined}
          onKeyDown={
            interactive
              ? (event) =>
                  handleCellKeyDown(event, visualActive < 0 ? 0 : (cells[visualActive]?.index ?? 0))
              : undefined
          }
        />
      )}
      {hiddenTable}
      {tooltip}
    </div>
  )
}

export default HeatmapChart
