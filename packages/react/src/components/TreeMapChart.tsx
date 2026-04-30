import React, { useMemo } from 'react'
import {
  classNames,
  computeTreeMapNodes,
  getChartElementOpacity,
  getChartInnerRect,
  getTreeMapGradientPrefix,
  resolveChartPalette,
  buildChartLegendItems,
  resolveChartTooltipContent,
  type ChartLegendItem,
  type ChartPadding,
  type TreeMapChartDatum,
  type TreeMapChartProps as CoreTreeMapChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'

export interface TreeMapChartProps extends CoreTreeMapChartProps {
  data: TreeMapChartDatum[]
  padding?: ChartPadding
  tooltipFormatter?: (datum: TreeMapChartDatum, index: number) => string
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onNodeClick?: (index: number, datum: TreeMapChartDatum) => void
  onNodeHover?: (index: number | null, datum: TreeMapChartDatum | null) => void
}

export const TreeMapChart: React.FC<TreeMapChartProps> = ({
  width = 400,
  height = 300,
  padding = 8,
  data,
  gap = 2,
  showLabels = true,
  minLabelSize = 10,
  colors,
  gradient = false,
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
  onNodeClick,
  onNodeHover
}) => {
  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )
  const palette = useMemo(() => resolveChartPalette(colors), [colors])
  const gradientPrefix = useMemo(() => getTreeMapGradientPrefix(), [])

  const nodes = useMemo(
    () =>
      computeTreeMapNodes(data, {
        width: innerRect.width,
        height: innerRect.height,
        gap,
        colors: palette
      }),
    [data, innerRect.width, innerRect.height, gap, palette]
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
  } = useChartInteraction<TreeMapChartDatum>({
    hoverable,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    legendPosition,
    getData: (index: number) => {
      const node = nodes[index]
      return node
        ? ({ label: node.label, value: node.value } as TreeMapChartDatum)
        : ({} as TreeMapChartDatum)
    },
    onHoveredIndexChange: (index) => {
      onHoveredIndexChange?.(index)
      const node = index !== null ? nodes[index] : null
      onNodeHover?.(
        index,
        node ? ({ label: node.label, value: node.value } as TreeMapChartDatum) : null
      )
    },
    onSelectedIndexChange,
    callbacks: { onClick: onNodeClick }
  })

  const total = useMemo(() => nodes.reduce((s, n) => s + n.value, 0), [nodes])

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems({
        data: nodes,
        palette,
        activeIndex,
        getLabel: (d) => d.label,
        getColor: (d) => d.color
      }),
    [nodes, palette, activeIndex]
  )

  const tooltipContent = useMemo(
    () =>
      resolveChartTooltipContent(resolvedHoveredIndex, nodes, undefined, (node) => {
        const pct = total > 0 ? ((node.value / total) * 100).toFixed(1) : '0'
        return `${node.label}: ${node.value} (${pct}%)`
      }),
    [resolvedHoveredIndex, nodes, total]
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
      <g data-series-type="treemap">
        {gradient && (
          <defs>
            {nodes.map((node) => (
              <linearGradient
                key={`grad-${node.index}`}
                id={`${gradientPrefix}-${node.index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1">
                <stop offset="0%" stopColor={node.color} stopOpacity={1} />
                <stop offset="100%" stopColor={node.color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
        )}
        {nodes.map((node) => {
          const opacity = getChartElementOpacity(node.index, activeIndex, {
            activeOpacity,
            inactiveOpacity
          })
          return (
            <React.Fragment key={`node-${node.index}`}>
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx={2}
                fill={gradient ? `url(#${gradientPrefix}-${node.index})` : node.color}
                opacity={opacity}
                className={classNames(interactive && 'cursor-pointer')}
                style={
                  {
                    transition: 'opacity 0.2s ease-out, filter 0.2s ease-out',
                    rx: 'var(--tiger-chart-block-radius, 2px)',
                    filter:
                      activeIndex === node.index
                        ? 'var(--tiger-chart-block-active-filter, none)'
                        : 'none'
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => handleMouseEnter(node.index, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(node.index)}
              />
              {showLabels && node.w > 30 && node.h > minLabelSize + 4 && (
                <text
                  x={node.x + node.w / 2}
                  y={node.y + node.h / 2}
                  className="fill-white text-xs"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    pointerEvents: 'none',
                    fontSize: `${Math.min(12, node.h * 0.3)}px`
                  }}>
                  {node.label}
                </text>
              )}
            </React.Fragment>
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
