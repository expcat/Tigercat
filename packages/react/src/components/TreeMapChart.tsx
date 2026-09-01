import React, { useId, useMemo } from 'react'
import {
  classNames,
  layoutTreeMap,
  getChartElementOpacity,
  getStableChartGradientPrefix,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  getCartesianChartShellClasses,
  chartMarkTabIndex,
  nextChartRovingIndex,
  isChartNavigationKey,
  getChartLabels,
  mergeTigerLocale,
  formatChartTemplate,
  treemapNodeTransitionClasses,
  DEFAULT_TREEMAP_WIDTH,
  DEFAULT_TREEMAP_HEIGHT,
  DEFAULT_TREEMAP_PADDING,
  DEFAULT_TREEMAP_GAP,
  DEFAULT_TREEMAP_NODE_RADIUS,
  DEFAULT_TREEMAP_MIN_LABEL_SIZE,
  type ChartLegendItem,
  type ChartPadding,
  type TreeMapChartDatum,
  type TreeMapChartProps as CoreTreeMapChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'
import { useResponsiveChartSize } from '../hooks/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface TreeMapChartProps extends CoreTreeMapChartProps {
  data: TreeMapChartDatum[]
  padding?: ChartPadding
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onNodeClick?: (index: number, datum: TreeMapChartDatum) => void
  onNodeHover?: (index: number | null, datum: TreeMapChartDatum | null) => void
}

export const TreeMapChart: React.FC<TreeMapChartProps> = ({
  width = DEFAULT_TREEMAP_WIDTH,
  height = DEFAULT_TREEMAP_HEIGHT,
  padding = DEFAULT_TREEMAP_PADDING,
  responsive = false,
  data,
  gap = DEFAULT_TREEMAP_GAP,
  showLabels = true,
  minLabelSize = DEFAULT_TREEMAP_MIN_LABEL_SIZE,
  nodeRadius = DEFAULT_TREEMAP_NODE_RADIUS,
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
  tooltipFormatter,
  title,
  desc,
  className,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onNodeClick,
  onNodeHover
}) => {
  const config = useTigerConfig()
  const labels = useMemo(() => getChartLabels(mergeTigerLocale(config.locale)), [config.locale])
  const interactive = hoverable || selectable || Boolean(onNodeClick)
  const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
    width,
    height,
    padding,
    responsive
  )
  const palette = useMemo(() => resolveChartPalette(colors), [colors])
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('treemap', gradientId),
    [gradientId]
  )
  const nodes = useMemo(
    () =>
      layoutTreeMap(data, {
        width: innerRect.width,
        height: innerRect.height,
        gap,
        colors: palette,
        minLabelSize
      }),
    [data, innerRect.width, innerRect.height, gap, palette, minLabelSize]
  )
  const {
    tooltipPosition,
    resolvedHoveredIndex,
    activeIndex,
    resolvedSelectedIndex,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleKeyDown,
    handleLegendClick,
    handleLegendHover,
    handleLegendLeave
  } = useChartInteraction<TreeMapChartDatum>({
    hoverable,
    showTooltip,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    legendPosition,
    getData: (index: number) => nodes[index]?.datum,
    onHoveredIndexChange: (index) => {
      onHoveredIndexChange?.(index)
      onNodeHover?.(index, index !== null ? (nodes[index]?.datum ?? null) : null)
    },
    onSelectedIndexChange,
    onClick: onNodeClick
  })
  const rootTotal = useMemo(
    () => nodes.filter((node) => node.depth === 0).reduce((sum, node) => sum + node.value, 0),
    [nodes]
  )
  const roots = useMemo(() => nodes.filter((node) => node.depth === 0), [nodes])
  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems({
        data: roots.map((node) => node.datum),
        palette,
        activeIndex,
        selectedIndex: resolvedSelectedIndex,
        getLabel: (d) => d.label,
        getColor: (_d, i) => roots[i]?.color ?? palette[i % palette.length]
      }).map((item, i) => ({ ...item, index: roots[i]?.index ?? item.index })),
    [roots, palette, activeIndex, resolvedSelectedIndex]
  )
  const tooltipContent = useMemo(() => {
    if (resolvedHoveredIndex === null) return ''
    const node = nodes[resolvedHoveredIndex]
    if (!node) return ''
    if (tooltipFormatter) return tooltipFormatter(node.datum, node.index)
    const percent = rootTotal > 0 ? ((node.value / rootTotal) * 100).toFixed(1) : '0'
    return formatChartTemplate(labels.treemapTooltip, {
      label: node.label,
      value: node.value,
      percent
    })
  }, [resolvedHoveredIndex, nodes, tooltipFormatter, rootTotal, labels.treemapTooltip])
  const visualActive = nodes.findIndex(
    (node) => node.index === (activeIndex ?? resolvedHoveredIndex)
  )

  const handleNodeKeyDown = (event: React.KeyboardEvent<SVGRectElement>, visualIndex: number) => {
    if (isChartNavigationKey(event.key)) {
      event.preventDefault()
      const nextVisual = nextChartRovingIndex(visualIndex, event.key, nodes.length)
      const next = nodes[nextVisual]
      const node = event.currentTarget.parentElement?.querySelector(
        `[data-treemap-node][data-index="${next.index}"]`
      )
      if (node instanceof SVGElement) node.focus()
      handleMouseEnter(next.index, event)
      return
    }
    handleKeyDown(event, nodes[visualIndex].index)
  }

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      responsive={responsive}
      title={title}
      desc={desc}
      onResolvedSizeChange={onResolvedSizeChange}>
      <defs>
        {gradient &&
          nodes.map((node) => (
            <linearGradient
              key={`grad-${node.index}`}
              id={`${gradientPrefix}-${node.index}`}
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={0}
              y2={innerRect.height}>
              <stop offset="0%" stopColor={node.color} stopOpacity={1} />
              <stop offset="100%" stopColor={node.color} stopOpacity={0.7} />
            </linearGradient>
          ))}
        {nodes.map((node) => (
          <clipPath key={`clip-${node.index}`} id={`${gradientPrefix}-clip-${node.index}`}>
            <rect x={node.x} y={node.y} width={node.w} height={node.h} />
          </clipPath>
        ))}
      </defs>
      <g data-series-type="treemap">
        {nodes.map((node, visualIndex) => {
          const opacity = getChartElementOpacity(node.index, activeIndex, {
            activeOpacity,
            inactiveOpacity
          })
          const percent = rootTotal > 0 ? ((node.value / rootTotal) * 100).toFixed(1) : '0'
          const ariaLabel = formatChartTemplate(labels.treemapTooltip, {
            label: node.label,
            value: node.value,
            percent
          })
          return (
            <React.Fragment key={`node-${node.index}`}>
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx={nodeRadius}
                fill={gradient ? `url(#${gradientPrefix}-${node.index})` : node.color}
                opacity={opacity}
                data-treemap-node=""
                data-index={node.index}
                className={classNames(
                  interactive && 'cursor-pointer',
                  treemapNodeTransitionClasses
                )}
                tabIndex={
                  interactive
                    ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                    : undefined
                }
                role={interactive ? 'button' : undefined}
                aria-hidden={interactive ? undefined : true}
                aria-label={interactive ? ariaLabel : undefined}
                onMouseEnter={(e) => handleMouseEnter(node.index, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onFocus={(e) => handleMouseEnter(node.index, e)}
                onClick={() => handleClick(node.index)}
                onKeyDown={(e) => handleNodeKeyDown(e, visualIndex)}
              />
              {showLabels && node.showLabel && (
                <text
                  x={node.x + node.w / 2}
                  y={node.y + Math.min(14, node.h / 2)}
                  fill={node.labelFill}
                  className="pointer-events-none select-none"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={node.fontSize}
                  clipPath={`url(#${gradientPrefix}-clip-${node.index})`}
                  aria-hidden="true">
                  {node.label}
                </text>
              )}
            </React.Fragment>
          )
        })}
      </g>
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
        showLegend,
        legendPosition,
        responsive,
        className
      })}>
      {chart}
      {showLegend ? (
        <ChartLegend
          items={legendItems}
          orientation={chartLegendOrientationFromPosition(legendPosition)}
          markerSize={legendMarkerSize}
          gap={legendGap}
          interactive={interactive}
          ariaLabel={labels.legendAriaLabel}
          onItemClick={handleLegendClick}
          onItemHover={handleLegendHover}
          onItemLeave={handleLegendLeave}
        />
      ) : null}
      {tooltip}
    </div>
  )
}

export default TreeMapChart
