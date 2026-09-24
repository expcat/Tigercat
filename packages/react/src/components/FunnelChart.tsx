import React, { useCallback, useId, useMemo } from 'react'
import {
  classNames,
  layoutFunnel,
  getChartElementOpacity,
  getStableChartGradientPrefix,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  resolveChartTooltipContent,
  getCartesianChartShellClasses,
  chartMarkTabIndex,
  nextChartRovingIndex,
  isChartNavigationKey,
  getChartLabels,
  mergeTigerLocale,
  funnelStageDisplayLabel,
  chartLabelFill,
  resolveChartWritingDirection,
  readPageWritingDirection,
  funnelSegmentTransitionClasses,
  pieSliceLabelInsideClasses,
  DEFAULT_FUNNEL_HEIGHT,
  type ChartLegendItem,
  type ChartPadding,
  type FunnelChartDatum,
  type FunnelChartProps as CoreFunnelChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'
import { useResponsiveChartSize } from '../hooks/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface FunnelChartProps extends CoreFunnelChartProps {
  data: FunnelChartDatum[]
  padding?: ChartPadding
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSegmentClick?: (index: number, datum: FunnelChartDatum) => void
  onSegmentHover?: (index: number | null, datum: FunnelChartDatum | null) => void
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  width = 320,
  height = DEFAULT_FUNNEL_HEIGHT,
  padding = 24,
  responsive = true,
  data,
  orientation = 'vertical',
  gap = 2,
  pinch = false,
  colors,
  gradient = false,
  showLabels = true,
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
  locale,
  labels: labelsOverride,
  className,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onSegmentClick,
  onSegmentHover
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const direction = useMemo(
    () => resolveChartWritingDirection(config.direction, readPageWritingDirection()),
    [config.direction]
  )
  const labels = useMemo(
    () => getChartLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const interactive = hoverable || selectable || Boolean(onSegmentClick)
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
  } = useChartInteraction<FunnelChartDatum>({
    hoverable,
    showTooltip,
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
    onClick: (index, datum) => {
      if (datum !== undefined) onSegmentClick?.(index, datum)
    }
  })

  const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
    width,
    height,
    padding,
    responsive
  )
  const palette = useMemo(() => resolveChartPalette(colors), [colors])
  const segments = useMemo(
    () =>
      layoutFunnel(data, {
        width: innerRect.width,
        height: innerRect.height,
        gap,
        pinch,
        colors: palette,
        orientation,
        direction
      }),
    [data, innerRect.width, innerRect.height, gap, pinch, palette, orientation, direction]
  )
  const total = useMemo(() => segments.reduce((sum, segment) => sum + segment.value, 0), [segments])
  const stageName = useCallback(
    (datum: FunnelChartDatum, index: number) =>
      funnelStageDisplayLabel(datum, index, labels.stageName),
    [labels.stageName]
  )
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('funnel', gradientId),
    [gradientId]
  )
  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems({
        data: segments,
        palette,
        activeIndex,
        selectedIndex: resolvedSelectedIndex,
        getIndex: (segment) => segment.index,
        getLabel: (segment) => stageName(data[segment.index], segment.index),
        getColor: (segment) => segment.color
      }),
    [segments, data, palette, activeIndex, resolvedSelectedIndex, stageName]
  )
  const tooltipContent = useMemo(
    () =>
      resolveChartTooltipContent(resolvedHoveredIndex, data, tooltipFormatter, (datum, index) => {
        const pct = total > 0 ? ((datum.value / total) * 100).toFixed(1) : '0'
        return `${stageName(datum, index)}: ${datum.value} (${pct}%)`
      }),
    [resolvedHoveredIndex, data, tooltipFormatter, total, stageName]
  )
  const visualActive = segments.findIndex(
    (segment) => segment.index === (activeIndex ?? resolvedHoveredIndex)
  )

  const handleSegmentKeyDown = (
    event: React.KeyboardEvent<SVGPathElement>,
    visualIndex: number
  ) => {
    if (isChartNavigationKey(event.key)) {
      event.preventDefault()
      const nextVisual = nextChartRovingIndex(visualIndex, event.key, segments.length)
      const next = segments[nextVisual]
      const node = event.currentTarget.parentElement?.querySelector(
        `[data-funnel-segment][data-index="${next.index}"]`
      )
      if (node instanceof SVGElement) node.focus()
      handleMouseEnter(next.index, event)
      return
    }
    handleKeyDown(event, segments[visualIndex].index)
  }

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      responsive={responsive}
      title={title}
      desc={desc}
      aria-label={title ? undefined : labels.funnelChartAriaLabel}
      onResolvedSizeChange={onResolvedSizeChange}>
      {gradient && (
        <defs>
          {segments.map((seg) => (
            <linearGradient
              key={`grad-${seg.index}`}
              id={`${gradientPrefix}-${seg.index}`}
              gradientUnits="userSpaceOnUse"
              x1={orientation === 'horizontal' ? 0 : 0}
              y1={0}
              x2={orientation === 'horizontal' ? innerRect.width : 0}
              y2={orientation === 'horizontal' ? 0 : innerRect.height}>
              <stop offset="0%" stopColor={seg.color} stopOpacity={1} />
              <stop offset="100%" stopColor={seg.color} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>
      )}
      <g data-series-type="funnel">
        {segments.map((seg, visualIndex) => {
          const opacity = getChartElementOpacity(seg.index, activeIndex, {
            activeOpacity,
            inactiveOpacity
          })
          return (
            <path
              key={`seg-${seg.index}`}
              d={seg.path}
              fill={gradient ? `url(#${gradientPrefix}-${seg.index})` : seg.color}
              opacity={opacity}
              className={classNames(
                interactive && 'cursor-pointer',
                funnelSegmentTransitionClasses
              )}
              data-funnel-segment=""
              data-index={seg.index}
              tabIndex={
                interactive
                  ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                  : undefined
              }
              role={interactive ? 'button' : undefined}
              aria-hidden={interactive ? undefined : true}
              aria-label={
                interactive
                  ? `${stageName(data[seg.index] ?? { value: seg.value, label: seg.label }, seg.index)}: ${seg.value} (${total > 0 ? ((seg.value / total) * 100).toFixed(1) : '0'}%)`
                  : undefined
              }
              onMouseEnter={(e) => handleMouseEnter(seg.index, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onFocus={(e) => handleMouseEnter(seg.index, e)}
              onClick={() => handleClick(seg.index)}
              onKeyDown={(e) => handleSegmentKeyDown(e, visualIndex)}
            />
          )
        })}
      </g>
      {showLabels &&
        segments.map((seg) => (
          <text
            key={`label-${seg.index}`}
            x={seg.cx}
            y={seg.cy}
            className={pieSliceLabelInsideClasses}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={chartLabelFill(seg.color)}
            aria-hidden={interactive ? true : undefined}>
            {stageName(data[seg.index] ?? { value: seg.value, label: seg.label }, seg.index)}
          </text>
        ))}
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
          interactive={hoverable || selectable}
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

export default FunnelChart
