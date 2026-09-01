import React, { useId, useMemo } from 'react'
import {
  classNames,
  layoutSunburst,
  getChartElementOpacity,
  getStableChartGradientPrefix,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  getCartesianChartShellClasses,
  chartMarkTabIndex,
  isChartNavigationKey,
  nextSunburstArcIndex,
  getChartLabels,
  mergeTigerLocale,
  formatChartTemplate,
  sunburstArcTransitionClasses,
  DEFAULT_SUNBURST_SIZE,
  DEFAULT_SUNBURST_PADDING,
  type ChartLegendItem,
  type ChartPadding,
  type SunburstChartDatum,
  type SunburstChartProps as CoreSunburstChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'
import { useResponsiveChartSize } from '../hooks/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface SunburstChartProps extends CoreSunburstChartProps {
  data: SunburstChartDatum[]
  padding?: ChartPadding
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onArcClick?: (index: number, datum: SunburstChartDatum) => void
  onArcHover?: (index: number | null, datum: SunburstChartDatum | null) => void
}

export const SunburstChart: React.FC<SunburstChartProps> = ({
  width = DEFAULT_SUNBURST_SIZE,
  height = DEFAULT_SUNBURST_SIZE,
  padding = DEFAULT_SUNBURST_PADDING,
  responsive = false,
  data,
  innerRadiusRatio = 0,
  showLabels = true,
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
  onArcClick,
  onArcHover
}) => {
  const config = useTigerConfig()
  const labels = useMemo(() => getChartLabels(mergeTigerLocale(config.locale)), [config.locale])
  const interactive = hoverable || selectable || Boolean(onArcClick)
  const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
    width,
    height,
    padding,
    responsive
  )
  const palette = useMemo(() => resolveChartPalette(colors), [colors])
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('sunburst', gradientId),
    [gradientId]
  )
  const cx = innerRect.width / 2
  const cy = innerRect.height / 2
  const outerRadius = Math.min(innerRect.width, innerRect.height) / 2
  const innerRadius = outerRadius * Math.max(0, Math.min(1, innerRadiusRatio))
  const arcs = useMemo(
    () =>
      layoutSunburst(data, {
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
    resolvedSelectedIndex,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleKeyDown,
    handleLegendClick,
    handleLegendHover,
    handleLegendLeave
  } = useChartInteraction<SunburstChartDatum>({
    hoverable,
    showTooltip,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    legendPosition,
    getData: (index: number) => arcs[index]?.datum,
    onHoveredIndexChange: (index) => {
      onHoveredIndexChange?.(index)
      onArcHover?.(index, index !== null ? (arcs[index]?.datum ?? null) : null)
    },
    onSelectedIndexChange,
    onClick: (index, datum) => {
      if (datum !== undefined) onArcClick?.(index, datum)
    }
  })
  const roots = useMemo(() => arcs.filter((arc) => arc.depth === 0), [arcs])
  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems({
        data: roots.map((arc) => arc.datum),
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
    const arc = arcs[resolvedHoveredIndex]
    if (!arc) return ''
    if (tooltipFormatter) return tooltipFormatter(arc.datum, arc.index)
    return formatChartTemplate(labels.sunburstTooltip, {
      label: arc.label,
      value: arc.value,
      percent: arc.percent.toFixed(1)
    })
  }, [resolvedHoveredIndex, arcs, tooltipFormatter, labels.sunburstTooltip])
  const visualActive = arcs.findIndex((arc) => arc.index === (activeIndex ?? resolvedHoveredIndex))

  const handleArcKeyDown = (event: React.KeyboardEvent<SVGPathElement>, index: number) => {
    if (isChartNavigationKey(event.key)) {
      event.preventDefault()
      const next = nextSunburstArcIndex(index, event.key, arcs)
      const node = event.currentTarget.parentElement?.querySelector(
        `[data-sunburst-arc][data-index="${next}"]`
      )
      if (node instanceof SVGElement) node.focus()
      handleMouseEnter(next, event)
      return
    }
    handleKeyDown(event, index)
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
      {gradient && (
        <defs>
          {arcs.map((arc) => (
            <linearGradient
              key={`grad-${arc.index}`}
              id={`${gradientPrefix}-${arc.index}`}
              gradientUnits="userSpaceOnUse"
              x1={cx}
              y1={cy - outerRadius}
              x2={cx}
              y2={cy + outerRadius}>
              <stop offset="0%" stopColor={arc.color} stopOpacity={1} />
              <stop offset="100%" stopColor={arc.color} stopOpacity={0.7} />
            </linearGradient>
          ))}
        </defs>
      )}
      <g data-series-type="sunburst">
        {arcs.map((arc, visualIndex) => {
          const opacity = getChartElementOpacity(arc.index, activeIndex, {
            activeOpacity,
            inactiveOpacity
          })
          const ariaLabel = formatChartTemplate(labels.sunburstTooltip, {
            label: arc.label,
            value: arc.value,
            percent: arc.percent.toFixed(1)
          })
          return (
            <path
              key={`arc-${arc.index}`}
              d={arc.path}
              fill={gradient ? `url(#${gradientPrefix}-${arc.index})` : arc.color}
              opacity={opacity}
              stroke="var(--tiger-surface,#ffffff)"
              strokeWidth={1}
              data-sunburst-arc=""
              data-index={arc.index}
              className={classNames(interactive && 'cursor-pointer', sunburstArcTransitionClasses)}
              tabIndex={
                interactive
                  ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                  : undefined
              }
              role={interactive ? 'button' : undefined}
              aria-hidden={interactive ? undefined : true}
              aria-label={interactive ? ariaLabel : undefined}
              onMouseEnter={(e) => handleMouseEnter(arc.index, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onFocus={(e) => handleMouseEnter(arc.index, e)}
              onClick={() => handleClick(arc.index)}
              onKeyDown={(e) => handleArcKeyDown(e, arc.index)}
            />
          )
        })}
        {showLabels &&
          arcs.map(
            (arc) =>
              arc.showLabel && (
                <text
                  key={`label-${arc.index}`}
                  x={arc.labelX}
                  y={arc.labelY}
                  fill={arc.labelFill}
                  className="text-xs pointer-events-none select-none"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  aria-hidden="true">
                  {arc.label}
                </text>
              )
          )}
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

export default SunburstChart
