import React, { useCallback, useEffect, useMemo, useRef } from 'react'
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
import { useChartInteraction } from '../hooks/useChartInteraction'

export interface HeatmapChartProps extends CoreHeatmapChartProps {
  padding?: ChartPadding
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onCellClick?: (index: number, datum: HeatmapChartDatum) => void
  onCellHover?: (index: number | null, datum: HeatmapChartDatum | null) => void
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  width = 400,
  height = 300,
  padding = 40,
  data,
  xLabels,
  yLabels,
  minColor = '#f0f9ff',
  maxColor = '#2563eb',
  colorSpace = 'rgb',
  cellRadius = 2,
  cellGap = 1,
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
  title,
  desc,
  className,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onCellClick,
  onCellHover
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const {
    tooltipPosition,
    resolvedHoveredIndex,
    activeIndex,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    handleClick
  } = useChartInteraction<HeatmapChartDatum>({
    hoverable,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    getData: (index: number) => data[index],
    onHoveredIndexChange: (index) => {
      onHoveredIndexChange?.(index)
      onCellHover?.(index, index !== null ? data[index] : null)
    },
    onSelectedIndexChange,
    callbacks: { onClick: onCellClick }
  })

  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )

  const cells = useMemo(
    () =>
      computeHeatmapCells(data, {
        xLabels,
        yLabels,
        width: innerRect.width,
        height: innerRect.height,
        cellGap,
        minColor,
        maxColor,
        colorSpace
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
      colorSpace
    ]
  )

  const tooltipContent = useMemo(
    () =>
      resolveChartTooltipContent(resolvedHoveredIndex, cells, undefined, (cell) => {
        const val = valueFormatter ? valueFormatter(cell.value) : `${cell.value}`
        return `${cell.xLabel} × ${cell.yLabel}: ${val}`
      }),
    [resolvedHoveredIndex, cells, valueFormatter]
  )

  const interactive = hoverable || selectable
  const rect = innerRect
  const cellW = (rect.width - cellGap * (xLabels.length - 1)) / xLabels.length
  const cellH = (rect.height - cellGap * (yLabels.length - 1)) / yLabels.length
  const resolvedRenderMode = resolveHeatmapRenderMode(cells.length, {
    renderMode,
    canvasThreshold
  })
  const shouldRenderCanvas = resolvedRenderMode === 'canvas'

  useEffect(() => {
    if (!shouldRenderCanvas) return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    context.clearRect(0, 0, rect.width, rect.height)
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = '10px sans-serif'

    cells.forEach((cell, idx) => {
      context.globalAlpha =
        getChartElementOpacity(idx, activeIndex, {
          activeOpacity,
          inactiveOpacity
        }) ?? 1
      context.fillStyle = cell.fill

      const radius = Math.max(0, Math.min(cellRadius, cell.w / 2, cell.h / 2))
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

      if (showValues) {
        context.globalAlpha = 1
        context.fillStyle = 'var(--tiger-text,#374151)'
        context.fillText(
          valueFormatter ? valueFormatter(cell.value) : `${cell.value}`,
          cell.x + cell.w / 2,
          cell.y + cell.h / 2
        )
      }
    })

    context.globalAlpha = 1
  }, [
    shouldRenderCanvas,
    cells,
    rect.width,
    rect.height,
    activeIndex,
    activeOpacity,
    inactiveOpacity,
    cellRadius,
    showValues,
    valueFormatter
  ])

  const getCanvasPoint = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget
    const bounds = canvas.getBoundingClientRect()
    const nativeEvent = event.nativeEvent
    const offsetX =
      typeof nativeEvent.offsetX === 'number' && Number.isFinite(nativeEvent.offsetX)
        ? nativeEvent.offsetX
        : event.clientX - bounds.left
    const offsetY =
      typeof nativeEvent.offsetY === 'number' && Number.isFinite(nativeEvent.offsetY)
        ? nativeEvent.offsetY
        : event.clientY - bounds.top
    const scaleX = bounds.width > 0 ? canvas.width / bounds.width : 1
    const scaleY = bounds.height > 0 ? canvas.height / bounds.height : 1

    return { x: offsetX * scaleX, y: offsetY * scaleY }
  }, [])

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
      if (index !== null) {
        handleClick(index)
      }
    },
    [cells, getCanvasPoint, handleClick]
  )

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      title={title}
      desc={desc}
      className={classNames(className)}>
      {/* X axis labels */}
      {xLabels.map((lbl, i) => (
        <text
          key={`x-${i}`}
          x={i * (cellW + cellGap) + cellW / 2}
          y={rect.height + 16}
          className={chartAxisTickTextClasses}
          textAnchor="middle">
          {lbl}
        </text>
      ))}

      {/* Y axis labels */}
      {yLabels.map((lbl, i) => (
        <text
          key={`y-${i}`}
          x={-8}
          y={i * (cellH + cellGap) + cellH / 2}
          className={chartAxisTickTextClasses}
          textAnchor="end"
          dominantBaseline="middle">
          {lbl}
        </text>
      ))}

      {/* Cells */}
      {!shouldRenderCanvas &&
        cells.map((cell, idx) => {
          const opacity = getChartElementOpacity(idx, activeIndex, {
            activeOpacity,
            inactiveOpacity
          })
          return (
            <React.Fragment key={`cell-${idx}`}>
              <rect
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                rx={cellRadius}
                fill={cell.fill}
                opacity={opacity}
                className={classNames(interactive && 'cursor-pointer')}
                style={
                  {
                    transition: 'opacity 0.2s ease-out',
                    rx: `var(--tiger-chart-block-radius, ${cellRadius}px)`
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => handleMouseEnter(idx, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(idx)}
              />
              {showValues && (
                <text
                  x={cell.x + cell.w / 2}
                  y={cell.y + cell.h / 2}
                  className="fill-[color:var(--tiger-text,#374151)] text-[10px]"
                  textAnchor="middle"
                  dominantBaseline="middle">
                  {valueFormatter ? valueFormatter(cell.value) : `${cell.value}`}
                </text>
              )}
            </React.Fragment>
          )
        })}
    </ChartCanvas>
  )

  const tooltip =
    showTooltip && hoverable ? (
      <ChartTooltip
        content={tooltipContent}
        visible={resolvedHoveredIndex !== null && tooltipContent !== ''}
        x={tooltipPosition.x}
        y={tooltipPosition.y}
      />
    ) : null

  return (
    <div className="inline-block relative">
      {chart}
      {shouldRenderCanvas && (
        <canvas
          ref={canvasRef}
          width={rect.width}
          height={rect.height}
          data-heatmap-canvas="true"
          data-heatmap-render-mode={resolvedRenderMode}
          className={classNames(interactive && 'cursor-pointer')}
          style={{
            position: 'absolute',
            left: `${rect.x}px`,
            top: `${rect.y}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            pointerEvents: interactive ? 'auto' : 'none'
          }}
          onMouseMove={interactive ? handleCanvasMouseMove : undefined}
          onMouseLeave={interactive ? handleMouseLeave : undefined}
          onClick={interactive ? handleCanvasClick : undefined}
        />
      )}
      {tooltip}
    </div>
  )
}
