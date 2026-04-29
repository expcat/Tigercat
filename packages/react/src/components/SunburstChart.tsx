import React, { useMemo } from 'react'
import {
  classNames,
  computeSunburstArcs,
  getChartElementOpacity,
  getChartInnerRect,
  resolveChartPalette,
  buildChartLegendItems,
  resolveChartTooltipContent,
  type ChartLegendItem,
  type ChartPadding,
  type SunburstChartDatum,
  type SunburstChartProps as CoreSunburstChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'

export interface SunburstChartProps extends CoreSunburstChartProps {
  data: SunburstChartDatum[]
  padding?: ChartPadding
  tooltipFormatter?: (datum: SunburstChartDatum, index: number) => string
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onArcClick?: (index: number, datum: SunburstChartDatum) => void
  onArcHover?: (index: number | null, datum: SunburstChartDatum | null) => void
}

export const SunburstChart: React.FC<SunburstChartProps> = ({
  width = 320,
  height = 320,
  padding = 24,
  data,
  innerRadiusRatio = 0,
  showLabels: _showLabels = true,
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
  tooltipFormatter: _tooltipFormatter,
  title,
  desc,
  className,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onArcClick,
  onArcHover
}) => {
  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )
  const palette = useMemo(() => resolveChartPalette(colors), [colors])

  const outerRadius = useMemo(
    () => Math.min(innerRect.width, innerRect.height) / 2,
    [innerRect.width, innerRect.height]
  )
  const innerRadius = useMemo(
    () => outerRadius * Math.max(0, Math.min(1, innerRadiusRatio)),
    [outerRadius, innerRadiusRatio]
  )

  const cx = innerRect.width / 2
  const cy = innerRect.height / 2

  const arcs = useMemo(
    () =>
      computeSunburstArcs(data, {
        cx,
        cy,
        innerRadius,
        outerRadius,
        colors: palette
      }),
    [data, cx, cy, innerRadius, outerRadius, palette]
  )

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
    hoverable,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    legendPosition,
    getData: (index: number) => {
      const arc = arcs[index]
      return arc
        ? ({ label: arc.label, value: arc.value } as SunburstChartDatum)
        : ({} as SunburstChartDatum)
    },
    onHoveredIndexChange: (index) => {
      onHoveredIndexChange?.(index)
      const arc = index !== null ? arcs[index] : null
      onArcHover?.(
        index,
        arc ? ({ label: arc.label, value: arc.value } as SunburstChartDatum) : null
      )
    },
    onSelectedIndexChange,
    callbacks: { onClick: onArcClick }
  })

  const rootArcs = useMemo(() => arcs.filter((a) => a.depth === 0), [arcs])

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems({
        data: rootArcs,
        palette,
        activeIndex,
        getLabel: (d) => d.label,
        getColor: (d) => d.color
      }),
    [rootArcs, palette, activeIndex]
  )

  const tooltipContent = useMemo(
    () =>
      resolveChartTooltipContent(resolvedHoveredIndex, arcs, undefined, (arc) => {
        return `${arc.label}: ${arc.value}`
      }),
    [resolvedHoveredIndex, arcs]
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
      <g data-series-type="sunburst">
        {arcs.map((arc) => {
          const opacity = getChartElementOpacity(arc.index, activeIndex, {
            activeOpacity,
            inactiveOpacity
          })
          return (
            <path
              key={`arc-${arc.index}`}
              d={arc.path}
              fill={arc.color}
              opacity={opacity}
              stroke="var(--tiger-surface,#ffffff)"
              strokeWidth={1}
              className={classNames(interactive && 'cursor-pointer')}
              style={{
                transition: 'opacity 0.2s ease-out, filter 0.2s ease-out',
                filter:
                  activeIndex === arc.index
                    ? 'var(--tiger-chart-block-active-filter, none)'
                    : 'none'
              }}
              tabIndex={selectable ? 0 : undefined}
              role={selectable ? 'button' : 'img'}
              aria-label={arc.label}
              onMouseEnter={(e) => handleMouseEnter(arc.index, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(arc.index)}
            />
          )
        })}
      </g>
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
