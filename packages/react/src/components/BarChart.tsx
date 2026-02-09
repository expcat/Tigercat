import React, { useMemo, useCallback } from 'react'
import {
  classNames,
  clampBarWidth,
  createBandScale,
  createLinearScale,
  DEFAULT_CHART_COLORS,
  ensureBarMinHeight,
  getBarGradientPrefix,
  getBarValueLabelY,
  getChartElementOpacity,
  getChartInnerRect,
  getNumberExtent,
  barValueLabelClasses,
  barValueLabelInsideClasses,
  barAnimatedTransition,
  type BarChartDatum,
  type BarChartProps as CoreBarChartProps,
  type BarValueLabelPosition,
  type ChartLegendItem,
  type ChartPadding,
  type ChartScale
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'

export interface BarChartProps extends CoreBarChartProps {
  data: BarChartDatum[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onBarClick?: (index: number, datum: BarChartDatum) => void
  onBarHover?: (index: number | null, datum: BarChartDatum | null) => void
}

export const BarChart: React.FC<BarChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  xScale,
  yScale,
  barColor = 'var(--tiger-primary,#2563eb)',
  barRadius = 4,
  barPaddingInner = 0.2,
  barPaddingOuter = 0.1,
  showGrid = true,
  showAxis = true,
  showXAxis = true,
  showYAxis = true,
  xAxisLabel,
  yAxisLabel,
  xTicks = 5,
  yTicks = 5,
  xTickValues,
  yTickValues,
  xTickFormat,
  yTickFormat,
  gridLineStyle = 'solid',
  gridStrokeWidth = 1,
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
  legendFormatter,
  showValueLabels = false,
  valueLabelPosition = 'top',
  valueLabelFormatter,
  barMinHeight = 0,
  barMaxWidth,
  gradient = false,
  animated = false,
  title,
  desc,
  className,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onBarClick,
  onBarHover
}) => {
  // Unique gradient prefix for this instance
  const gradientPrefix = useMemo(() => getBarGradientPrefix(), [])

  // Use shared interaction hook
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
  } = useChartInteraction<BarChartDatum>({
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
      onBarHover?.(index, index !== null ? data[index] : null)
    },
    onSelectedIndexChange,
    callbacks: {
      onClick: onBarClick
    }
  })

  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )
  const xDomain = useMemo(() => data.map((item) => String(item.x)), [data])
  const yValues = useMemo(() => data.map((item) => item.y), [data])

  const resolvedXScale = useMemo(() => {
    if (xScale) return xScale
    return createBandScale(xDomain, [0, innerRect.width], {
      paddingInner: barPaddingInner,
      paddingOuter: barPaddingOuter
    })
  }, [xScale, xDomain, innerRect.width, barPaddingInner, barPaddingOuter])

  const resolvedYScale = useMemo(() => {
    if (yScale) return yScale
    const extent = getNumberExtent(yValues, { includeZero: true })
    return createLinearScale(extent, [innerRect.height, 0])
  }, [yScale, yValues, innerRect.height])

  const palette = useMemo(
    () =>
      colors && colors.length > 0 ? colors : barColor ? [barColor] : [...DEFAULT_CHART_COLORS],
    [colors, barColor]
  )

  const bars = useMemo(() => {
    const scale = resolvedXScale
    const rawBandWidth =
      scale.bandwidth ??
      (scale.step ? scale.step * 0.7 : (innerRect.width / Math.max(1, data.length)) * 0.8)
    const bandWidth = clampBarWidth(rawBandWidth, barMaxWidth)
    const bandOffset = rawBandWidth > bandWidth ? (rawBandWidth - bandWidth) / 2 : 0
    const baseline = resolvedYScale.map(0)

    return data.map((item, index) => {
      const xKey = scale.type === 'linear' ? Number(item.x) : String(item.x)
      const xPos = scale.map(xKey)
      const barX = (scale.bandwidth ? xPos : xPos - rawBandWidth / 2) + bandOffset
      const barYValue = resolvedYScale.map(item.y)
      let barHeight = Math.abs(baseline - barYValue)
      let barY = Math.min(baseline, barYValue)

      // Apply minimum height constraint
      if (barMinHeight > 0 && barHeight > 0) {
        const clamped = ensureBarMinHeight(barY, barHeight, baseline, barMinHeight)
        barY = clamped.y
        barHeight = clamped.height
      }

      const color = item.color ?? palette[index % palette.length]
      const opacity = getChartElementOpacity(index, activeIndex, {
        activeOpacity,
        inactiveOpacity
      })

      return {
        x: barX,
        y: barY,
        width: bandWidth,
        height: barHeight,
        color,
        opacity,
        datum: item,
        index
      }
    })
  }, [
    resolvedXScale,
    resolvedYScale,
    data,
    innerRect.width,
    palette,
    activeIndex,
    activeOpacity,
    inactiveOpacity,
    barMinHeight,
    barMaxWidth
  ])

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      data.map((item, index) => ({
        index,
        label: legendFormatter ? legendFormatter(item, index) : (item.label ?? String(item.x)),
        color: item.color ?? palette[index % palette.length],
        active: activeIndex === null || activeIndex === index
      })),
    [data, legendFormatter, palette, activeIndex]
  )

  const formatTooltip = useCallback(
    (datum: BarChartDatum, index: number) => {
      if (tooltipFormatter) return tooltipFormatter(datum, index)
      const label = datum.label ?? String(datum.x)
      return `${label}: ${datum.y}`
    },
    [tooltipFormatter]
  )

  const tooltipContent = useMemo(() => {
    if (resolvedHoveredIndex === null) return ''
    const datum = data[resolvedHoveredIndex]
    return datum ? formatTooltip(datum, resolvedHoveredIndex) : ''
  }, [resolvedHoveredIndex, data, formatTooltip])

  const shouldShowXAxis = showAxis && showXAxis
  const shouldShowYAxis = showAxis && showYAxis

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      title={title}
      desc={desc}
      className={classNames(className)}>
      {gradient && (
        <defs>
          {bars.map((bar) => (
            <linearGradient
              key={`grad-${bar.index}`}
              id={`${gradientPrefix}-${bar.index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1">
              <stop offset="0%" stopColor={bar.color} stopOpacity={0.65} />
              <stop offset="100%" stopColor={bar.color} stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>
      )}
      {showGrid && (
        <ChartGrid
          xScale={resolvedXScale}
          yScale={resolvedYScale}
          show="both"
          xTicks={xTicks}
          yTicks={yTicks}
          xTickValues={xTickValues}
          yTickValues={yTickValues}
          lineStyle={gridLineStyle}
          strokeWidth={gridStrokeWidth}
        />
      )}
      {shouldShowXAxis && (
        <ChartAxis
          scale={resolvedXScale}
          orientation="bottom"
          y={innerRect.height}
          ticks={xTicks}
          tickValues={xTickValues}
          tickFormat={xTickFormat}
          label={xAxisLabel}
        />
      )}
      {shouldShowYAxis && (
        <ChartAxis
          scale={resolvedYScale}
          orientation="left"
          ticks={yTicks}
          tickValues={yTickValues}
          tickFormat={yTickFormat}
          label={yAxisLabel}
        />
      )}
      <ChartSeries data={data} type="bar">
        {bars.map((bar) => (
          <rect
            key={`bar-${bar.index}`}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={barRadius}
            ry={barRadius}
            fill={gradient ? `url(#${gradientPrefix}-${bar.index})` : bar.color}
            opacity={bar.opacity}
            className={classNames(
              'transition-[opacity,filter] duration-200',
              (hoverable || selectable) && 'cursor-pointer hover:brightness-110'
            )}
            style={
              animated
                ? {
                    transition:
                      'y 600ms cubic-bezier(.4,0,.2,1), height 600ms cubic-bezier(.4,0,.2,1), opacity 200ms ease-out, filter 200ms ease-out'
                  }
                : undefined
            }
            tabIndex={selectable ? 0 : undefined}
            onMouseEnter={(e) => handleMouseEnter(bar.index, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(bar.index)}
            onKeyDown={(e) => handleKeyDown(e, bar.index)}
          />
        ))}
      </ChartSeries>
      {showValueLabels &&
        bars.map((bar) => {
          const labelText = valueLabelFormatter
            ? valueLabelFormatter(bar.datum, bar.index)
            : String(bar.datum.y)
          const labelY = getBarValueLabelY(bar.y, bar.height, valueLabelPosition, 8)
          const isInside = valueLabelPosition === 'inside'
          return (
            <text
              key={`label-${bar.index}`}
              x={bar.x + bar.width / 2}
              y={labelY}
              textAnchor="middle"
              dominantBaseline={isInside ? 'central' : 'auto'}
              className={isInside ? barValueLabelInsideClasses : barValueLabelClasses}
              opacity={bar.opacity}
              data-value-label="">
              {labelText}
            </text>
          )
        })}
    </ChartCanvas>
  )

  const tooltip = showTooltip && (
    <ChartTooltip
      content={tooltipContent}
      visible={hoverable && resolvedHoveredIndex !== null && tooltipContent !== ''}
      x={tooltipPosition.x}
      y={tooltipPosition.y}
    />
  )

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
        interactive={hoverable || selectable}
        onItemClick={handleLegendClick}
        onItemHover={handleLegendHover}
        onItemLeave={handleLegendLeave}
      />
      {tooltip}
    </div>
  )
}

export default BarChart
