import React, { useMemo, useCallback } from 'react'
import {
  classNames,
  createLinearScale,
  DEFAULT_CHART_COLORS,
  getChartElementOpacity,
  getChartInnerRect,
  getNumberExtent,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type ChartScale,
  type ScatterChartDatum,
  type ScatterChartProps as CoreScatterChartProps
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'

export interface ScatterChartProps extends CoreScatterChartProps {
  data: ScatterChartDatum[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
  // Interaction props
  hoverable?: boolean
  hoveredIndex?: number | null
  onHoveredIndexChange?: (index: number | null) => void
  activeOpacity?: number
  inactiveOpacity?: number
  selectable?: boolean
  selectedIndex?: number | null
  onSelectedIndexChange?: (index: number | null) => void
  onPointClick?: (index: number, datum: ScatterChartDatum) => void
  onPointHover?: (index: number | null, datum: ScatterChartDatum | null) => void
  // Legend props
  showLegend?: boolean
  legendPosition?: ChartLegendPosition
  legendMarkerSize?: number
  legendGap?: number
  legendFormatter?: (datum: ScatterChartDatum, index: number) => string
  // Tooltip props
  showTooltip?: boolean
  tooltipFormatter?: (datum: ScatterChartDatum, index: number) => string
  // Other
  colors?: string[]
  title?: string
  desc?: string
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  xScale,
  yScale,
  pointSize = 4,
  pointColor = 'var(--tiger-primary,#2563eb)',
  pointOpacity,
  showGrid = true,
  showAxis = true,
  showXAxis = true,
  showYAxis = true,
  includeZero = false,
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
  // Interaction props
  hoverable = false,
  hoveredIndex: hoveredIndexProp,
  onHoveredIndexChange,
  activeOpacity = 1,
  inactiveOpacity = 0.25,
  selectable = false,
  selectedIndex: selectedIndexProp,
  onSelectedIndexChange,
  onPointClick,
  onPointHover,
  // Legend props
  showLegend = false,
  legendPosition = 'bottom',
  legendMarkerSize = 10,
  legendGap = 8,
  legendFormatter,
  // Tooltip props
  showTooltip = true,
  tooltipFormatter,
  // Other
  colors,
  title,
  desc,
  className
}) => {
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
  } = useChartInteraction<ScatterChartDatum>({
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
      onPointHover?.(index, index !== null ? data[index] : null)
    },
    onSelectedIndexChange,
    callbacks: {
      onClick: onPointClick
    }
  })

  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )
  const xValues = useMemo(() => data.map((item) => item.x), [data])
  const yValues = useMemo(() => data.map((item) => item.y), [data])

  const resolvedXScale = useMemo(() => {
    if (xScale) return xScale
    const extent = getNumberExtent(xValues, { includeZero })
    return createLinearScale(extent, [0, innerRect.width])
  }, [xScale, xValues, includeZero, innerRect.width])

  const resolvedYScale = useMemo(() => {
    if (yScale) return yScale
    const extent = getNumberExtent(yValues, { includeZero })
    return createLinearScale(extent, [innerRect.height, 0])
  }, [yScale, yValues, includeZero, innerRect.height])

  const palette = useMemo(
    () =>
      colors && colors.length > 0 ? colors : pointColor ? [pointColor] : [...DEFAULT_CHART_COLORS],
    [colors, pointColor]
  )

  const points = useMemo(
    () =>
      data.map((item, index) => {
        const color = item.color ?? palette[index % palette.length]
        const opacity = getChartElementOpacity(index, activeIndex, {
          activeOpacity,
          inactiveOpacity
        })

        return {
          cx: resolvedXScale.map(item.x),
          cy: resolvedYScale.map(item.y),
          r: item.size ?? pointSize,
          color,
          opacity: pointOpacity ?? opacity,
          datum: item
        }
      }),
    [
      data,
      palette,
      activeIndex,
      activeOpacity,
      inactiveOpacity,
      resolvedXScale,
      resolvedYScale,
      pointSize,
      pointOpacity
    ]
  )

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      data.map((item, index) => ({
        index,
        label: legendFormatter
          ? legendFormatter(item, index)
          : (item.label ?? `(${item.x}, ${item.y})`),
        color: item.color ?? palette[index % palette.length],
        active: activeIndex === null || activeIndex === index
      })),
    [data, legendFormatter, palette, activeIndex]
  )

  const formatTooltip = useCallback(
    (datum: ScatterChartDatum, index: number) => {
      if (tooltipFormatter) return tooltipFormatter(datum, index)
      const label = datum.label ?? `Point ${index + 1}`
      return `${label}: (${datum.x}, ${datum.y})`
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
      <ChartSeries data={data} type="scatter">
        {points.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.cx}
            cy={point.cy}
            r={point.r}
            fill={point.color}
            opacity={point.opacity}
            className={classNames(
              'transition-opacity duration-150',
              (hoverable || selectable) && 'cursor-pointer'
            )}
            tabIndex={selectable ? 0 : undefined}
            role={selectable ? 'button' : 'img'}
            aria-label={
              point.datum.label ?? `Point ${index + 1}: (${point.datum.x}, ${point.datum.y})`
            }
            data-point-index={index}
            onMouseEnter={(e) => handleMouseEnter(index, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </ChartSeries>
    </ChartCanvas>
  )

  const tooltip = showTooltip && hoverable && (
    <ChartTooltip
      content={tooltipContent}
      visible={resolvedHoveredIndex !== null && tooltipContent !== ''}
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

export default ScatterChart
