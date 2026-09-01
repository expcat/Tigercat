import React, { useCallback, useId, useMemo } from 'react'
import {
  classNames,
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
  formatChartTemplate,
  layoutPieSlices,
  pieSliceDisplayLabel,
  pieSliceTransitionClasses,
  pieSliceLabelInsideClasses,
  resolvePieRadii,
  DEFAULT_PIE_START_ANGLE,
  DONUT_ENTRANCE_CLASS,
  PIE_BASE_SHADOW,
  PIE_EMPHASIS_SHADOW,
  getChartElementOpacity,
  type ChartLegendItem,
  type ChartPadding,
  type PieChartDatum,
  type PieChartProps as CorePieChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'
import { useResponsiveChartSize } from '../hooks/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface PieChartProps extends CorePieChartProps {
  data: PieChartDatum[]
  padding?: ChartPadding
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSliceClick?: (index: number, datum: PieChartDatum) => void
  onSliceHover?: (index: number | null, datum: PieChartDatum | null) => void
}

export const PieChart: React.FC<PieChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  responsive = false,
  data,
  innerRadius,
  innerRadiusRatio,
  outerRadius,
  startAngle = DEFAULT_PIE_START_ANGLE,
  endAngle = Math.PI * 2,
  padAngle = 0,
  colors,
  showLabels = false,
  labelFormatter,
  labelPosition = 'inside',
  borderWidth = 2,
  borderColor = 'var(--tiger-surface,#ffffff)',
  hoverOffset = 8,
  shadow = false,
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
  legendFormatter,
  centerValue,
  centerLabel,
  animated = false,
  title,
  desc,
  className,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onSliceClick,
  onSliceHover
}) => {
  const config = useTigerConfig()
  const labels = useMemo(() => getChartLabels(mergeTigerLocale(config.locale)), [config.locale])
  const interactive = hoverable || selectable || Boolean(onSliceClick)
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('pie', gradientId),
    [gradientId]
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
  } = useChartInteraction<PieChartDatum>({
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
      onSliceHover?.(index, index !== null ? data[index] : null)
    },
    onSelectedIndexChange,
    onClick: onSliceClick
  })

  const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
    width,
    height,
    padding,
    responsive
  )
  const palette = useMemo(() => resolveChartPalette(colors), [colors])
  const radii = useMemo(
    () =>
      resolvePieRadii({
        innerWidth: innerRect.width,
        innerHeight: innerRect.height,
        innerRadius,
        outerRadius,
        innerRadiusRatio,
        labelPosition,
        hoverOffset
      }),
    [
      innerRect.width,
      innerRect.height,
      innerRadius,
      outerRadius,
      innerRadiusRatio,
      labelPosition,
      hoverOffset
    ]
  )
  const slices = useMemo(
    () =>
      layoutPieSlices(data, {
        cx: radii.cx,
        cy: radii.cy,
        innerRadius: radii.innerRadius,
        outerRadius: radii.outerRadius,
        startAngle,
        endAngle,
        padAngle,
        palette,
        gradient,
        gradientPrefix,
        hoverOffset,
        labelPosition
      }),
    [
      data,
      radii.cx,
      radii.cy,
      radii.innerRadius,
      radii.outerRadius,
      startAngle,
      endAngle,
      padAngle,
      palette,
      gradient,
      gradientPrefix,
      hoverOffset,
      labelPosition
    ]
  )
  const total = useMemo(() => slices.reduce((sum, slice) => sum + slice.value, 0), [slices])
  const sliceName = useCallback(
    (datum: PieChartDatum, index: number) => pieSliceDisplayLabel(datum, index, labels.sliceName),
    [labels.sliceName]
  )

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems({
        data: slices.map((slice) => slice.datum),
        palette,
        activeIndex,
        selectedIndex: resolvedSelectedIndex,
        getLabel: (d, i) => (legendFormatter ? legendFormatter(d, i) : sliceName(d, i)),
        getColor: (d, i) => d.color ?? palette[i % palette.length]
      }),
    [slices, legendFormatter, palette, activeIndex, resolvedSelectedIndex, sliceName]
  )

  const tooltipContent = useMemo(
    () =>
      resolveChartTooltipContent(resolvedHoveredIndex, data, tooltipFormatter, (datum, index) => {
        const name = sliceName(datum, index)
        const percentage = total > 0 ? ((datum.value / total) * 100).toFixed(1) : '0'
        return `${name}: ${datum.value} (${percentage}%)`
      }),
    [resolvedHoveredIndex, data, tooltipFormatter, total, sliceName]
  )

  const visualActive = slices.findIndex(
    (slice) => slice.index === (activeIndex ?? resolvedHoveredIndex)
  )
  const centerParts = [centerValue, centerLabel].filter((part) => part !== undefined)
  const resolvedDesc = [desc, ...centerParts.map((part) => String(part))].filter(Boolean).join(' ')

  const handleSliceKeyDown = (event: React.KeyboardEvent<SVGPathElement>, visualIndex: number) => {
    if (isChartNavigationKey(event.key)) {
      event.preventDefault()
      const nextVisual = nextChartRovingIndex(visualIndex, event.key, slices.length)
      const next = slices[nextVisual]
      const node = event.currentTarget.parentElement?.querySelector(
        `[data-pie-slice][data-index="${next.index}"]`
      )
      if (node instanceof SVGElement) node.focus()
      handleMouseEnter(next.index, event)
      return
    }
    handleKeyDown(event, slices[visualIndex].index)
  }

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      responsive={responsive}
      title={title}
      desc={resolvedDesc || undefined}
      className={animated ? DONUT_ENTRANCE_CLASS : undefined}
      onResolvedSizeChange={onResolvedSizeChange}>
      {gradient && (
        <defs>
          {slices.map((slice) => (
            <linearGradient
              key={`pie-grad-${slice.index}`}
              id={`${gradientPrefix}-${slice.index}`}
              gradientUnits="userSpaceOnUse"
              x1={radii.cx}
              y1={radii.cy - radii.outerRadius}
              x2={radii.cx}
              y2={radii.cy + radii.outerRadius}>
              <stop offset="0%" stopColor={slice.color} stopOpacity={1} />
              <stop offset="100%" stopColor={slice.color} stopOpacity={0.7} />
            </linearGradient>
          ))}
        </defs>
      )}
      {radii.innerRadius > 0 && centerParts.length > 0 && (
        <clipPath id={`${gradientPrefix}-center`}>
          <circle cx={radii.cx} cy={radii.cy} r={radii.innerRadius} />
        </clipPath>
      )}
      {slices.map((slice, visualIndex) => {
        const isEmphasized = activeIndex === slice.index
        const ariaLabel = formatChartTemplate(labels.sliceAriaLabel, {
          label: sliceName(slice.datum, slice.index),
          value: slice.value,
          percent: slice.percent.toFixed(1)
        })
        return (
          <g
            key={`slice-${slice.index}`}
            transform={
              interactive && isEmphasized
                ? `translate(${slice.hoverDx} ${slice.hoverDy})`
                : undefined
            }>
            <path
              d={slice.path}
              fill={slice.fill}
              opacity={getChartElementOpacity(slice.index, activeIndex, {
                activeOpacity,
                inactiveOpacity
              })}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeLinejoin="round"
              data-pie-slice="true"
              data-index={slice.index}
              tabIndex={
                interactive
                  ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                  : undefined
              }
              role={interactive ? 'button' : undefined}
              aria-hidden={interactive ? undefined : true}
              aria-label={interactive ? ariaLabel : undefined}
              className={classNames(interactive && 'cursor-pointer', pieSliceTransitionClasses)}
              style={{
                filter: shadow ? (isEmphasized ? PIE_EMPHASIS_SHADOW : PIE_BASE_SHADOW) : undefined
              }}
              onMouseEnter={(e) => handleMouseEnter(slice.index, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onFocus={(e) => handleMouseEnter(slice.index, e)}
              onClick={() => handleClick(slice.index)}
              onKeyDown={(e) => handleSliceKeyDown(e, visualIndex)}
            />
          </g>
        )
      })}
      {showLabels &&
        labelPosition === 'outside' &&
        slices.map((slice) => {
          const text = labelFormatter
            ? labelFormatter(slice.value, slice.datum, slice.index)
            : `${sliceName(slice.datum, slice.index)} ${slice.percent.toFixed(1)}%`
          return (
            <g key={`label-group-${slice.index}`} aria-hidden="true">
              <polyline
                points={slice.outside?.points}
                fill="none"
                stroke={slice.color}
                strokeWidth={1}
                opacity={0.5}
              />
              <text
                x={slice.outside?.x}
                y={slice.outside?.y}
                textAnchor={slice.outside?.textAnchor}
                dominantBaseline="middle"
                className="fill-[color:var(--tiger-text,#1f2937)] text-xs">
                {text}
              </text>
            </g>
          )
        })}
      {showLabels &&
        labelPosition !== 'outside' &&
        slices.map((slice) => {
          const text = labelFormatter
            ? labelFormatter(slice.value, slice.datum, slice.index)
            : sliceName(slice.datum, slice.index)
          return (
            <text
              key={`label-${slice.index}`}
              x={slice.labelX}
              y={slice.labelY}
              className={pieSliceLabelInsideClasses}
              textAnchor="middle"
              dominantBaseline="middle"
              aria-hidden="true">
              {text}
            </text>
          )
        })}
      {centerParts.length > 0 && (
        <g
          data-donut-center="true"
          clipPath={radii.innerRadius > 0 ? `url(#${gradientPrefix}-center)` : undefined}
          aria-hidden="true">
          {centerValue !== undefined && (
            <text
              x={radii.cx}
              y={centerLabel !== undefined ? radii.cy - 8 : radii.cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[color:var(--tiger-text,#1f2937)] text-xl font-semibold">
              {`${centerValue}`}
            </text>
          )}
          {centerLabel !== undefined && (
            <text
              x={radii.cx}
              y={centerValue !== undefined ? radii.cy + 12 : radii.cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[color:var(--tiger-text-secondary,#6b7280)] text-xs">
              {centerLabel}
            </text>
          )}
        </g>
      )}
    </ChartCanvas>
  )

  const tooltip = showTooltip && (
    <ChartTooltip
      content={tooltipContent}
      open={resolvedHoveredIndex !== null && tooltipContent !== ''}
      x={tooltipPosition.x}
      y={tooltipPosition.y}
    />
  )

  return (
    <div
      className={getCartesianChartShellClasses({
        showLegend,
        legendPosition,
        responsive,
        className
      })}
      data-pie-chart=""
      data-donut-chart={radii.innerRadius > 0 ? '' : undefined}>
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

export default PieChart
