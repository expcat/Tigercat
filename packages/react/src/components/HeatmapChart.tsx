import React, { useMemo } from 'react'
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
  cellRadius = 2,
  cellGap = 1,
  showValues = false,
  valueFormatter,
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
        maxColor
      }),
    [data, xLabels, yLabels, innerRect.width, innerRect.height, cellGap, minColor, maxColor]
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
      {cells.map((cell, idx) => {
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
              style={{ transition: 'opacity 0.2s ease-out' }}
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
      {tooltip}
    </div>
  )
}
