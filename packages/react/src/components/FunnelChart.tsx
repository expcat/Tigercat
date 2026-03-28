import React, { useMemo } from 'react'
import {
  classNames,
  computeFunnelSegments,
  getChartElementOpacity,
  getChartInnerRect,
  resolveChartPalette,
  buildChartLegendItems,
  resolveChartTooltipContent,
  chartAxisTickTextClasses,
  type ChartLegendItem,
  type ChartPadding,
  type FunnelChartDatum,
  type FunnelChartProps as CoreFunnelChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'

export interface FunnelChartProps extends CoreFunnelChartProps {
  data: FunnelChartDatum[]
  padding?: ChartPadding
  tooltipFormatter?: (datum: FunnelChartDatum, index: number) => string
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSegmentClick?: (index: number, datum: FunnelChartDatum) => void
  onSegmentHover?: (index: number | null, datum: FunnelChartDatum | null) => void
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  width = 320,
  height = 300,
  padding = 24,
  data,
  direction: _direction = 'vertical',
  gap = 2,
  pinch = false,
  colors,
  hoverable = false,
  hoveredIndex: hoveredIndexProp,
  activeOpacity = 1,
  inactiveOpacity = 0.25,
  selectable = false,
  selectedIndex: selectedIndexProp,
  showLegend = false,
  legendPosition = 'bottom',
  legendMarkerSize = 10,
  legendGap = 8,
  showTooltip = true,
  tooltipFormatter,
  title,
  desc,
  className,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onSegmentClick,
  onSegmentHover
}) => {
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
    hoverable,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    legendPosition,
    getData: (index: number) => data[index],
    onHoveredIndexChange: (index) => {
      onHoveredIndexChange?.(index)
      onSegmentHover?.(index, index !== null ? data[index] : null)
    },
    onSelectedIndexChange,
    callbacks: { onClick: onSegmentClick }
  })

  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )
  const palette = useMemo(() => resolveChartPalette(colors), [colors])

  const segments = useMemo(
    () =>
      computeFunnelSegments(data, {
        width: innerRect.width,
        height: innerRect.height,
        gap,
        pinch,
        colors: palette
      }),
    [data, innerRect.width, innerRect.height, gap, pinch, palette]
  )

  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data])

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems({
        data,
        palette,
        activeIndex,
        getLabel: (d, i) => d.label ?? `Stage ${i + 1}`,
        getColor: (d, i) => d.color ?? palette[i % palette.length]
      }),
    [data, palette, activeIndex]
  )

  const tooltipContent = useMemo(
    () =>
      resolveChartTooltipContent(resolvedHoveredIndex, data, tooltipFormatter, (datum, index) => {
        const pct = total > 0 ? ((datum.value / total) * 100).toFixed(1) : '0'
        const label = datum.label ?? `Stage ${index + 1}`
        return `${label}: ${datum.value} (${pct}%)`
      }),
    [resolvedHoveredIndex, data, tooltipFormatter, total]
  )

  const interactive = hoverable || selectable

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      title={title}
      desc={desc}
      className={classNames(className)}>
      <g data-series-type="funnel">
        {segments.map((seg) => {
          const opacity = getChartElementOpacity(seg.index, activeIndex, {
            activeOpacity,
            inactiveOpacity
          })
          return (
            <path
              key={`seg-${seg.index}`}
              d={seg.path}
              fill={seg.color}
              opacity={opacity}
              className={classNames(interactive && 'cursor-pointer')}
              style={{ transition: 'opacity 0.2s ease-out' }}
              tabIndex={selectable ? 0 : undefined}
              role={selectable ? 'button' : 'img'}
              aria-label={seg.label}
              onMouseEnter={(e) => handleMouseEnter(seg.index, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(seg.index)}
              onKeyDown={(e) => handleKeyDown(e, seg.index)}
            />
          )
        })}
      </g>
      {segments.map((seg) => (
        <text
          key={`label-${seg.index}`}
          x={seg.cx}
          y={seg.cy}
          className={chartAxisTickTextClasses}
          textAnchor="middle"
          dominantBaseline="middle">
          {seg.label}
        </text>
      ))}
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

  if (!showLegend) {
    return (
      <div className="inline-block relative">
        {chart}
        {tooltip}
      </div>
    )
  }

  return (
    <div className={wrapperClasses}>
      {chart}
      <ChartLegend
        items={legendItems}
        position={legendPosition}
        markerSize={legendMarkerSize}
        gap={legendGap}
        interactive={interactive}
        onItemClick={handleLegendClick}
        onItemHover={handleLegendHover}
        onItemLeave={handleLegendLeave}
      />
      {tooltip}
    </div>
  )
}
