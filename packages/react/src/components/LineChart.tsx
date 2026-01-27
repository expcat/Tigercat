import React, { useMemo, useState, useCallback } from 'react'
import {
  classNames,
  createLinearScale,
  createLinePath,
  createPointScale,
  DEFAULT_CHART_COLORS,
  getChartElementOpacity,
  getChartInnerRect,
  getNumberExtent,
  type ChartCurveType,
  type ChartLegendItem,
  type ChartPadding,
  type ChartScale,
  type LineChartDatum,
  type LineChartProps as CoreLineChartProps,
  type LineChartSeries
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'

export interface LineChartProps extends CoreLineChartProps {
  data?: LineChartDatum[]
  series?: LineChartSeries[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSeriesClick?: (seriesIndex: number, series: LineChartSeries) => void
  onSeriesHover?: (seriesIndex: number | null, series: LineChartSeries | null) => void
  onPointClick?: (seriesIndex: number, pointIndex: number, datum: LineChartDatum) => void
  onPointHover?: (
    seriesIndex: number | null,
    pointIndex: number | null,
    datum: LineChartDatum | null
  ) => void
}

export const LineChart: React.FC<LineChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  series,
  xScale: xScaleProp,
  yScale: yScaleProp,
  lineColor: _lineColor = 'var(--tiger-primary,#2563eb)',
  strokeWidth = 2,
  curve = 'linear',
  showPoints = true,
  pointSize = 4,
  pointColor: _pointColor,
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
  title,
  desc,
  className,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onSeriesClick,
  onSeriesHover,
  onPointClick,
  onPointHover
}) => {
  // Point-level hover state (not managed by hook)
  const [hoveredPointInfo, setHoveredPointInfo] = useState<{
    seriesIndex: number
    pointIndex: number
  } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )

  const resolvedSeries = useMemo<LineChartSeries[]>(() => {
    if (series && series.length > 0) return series
    if (data && data.length > 0) return [{ data }]
    return []
  }, [series, data])

  // Use shared interaction hook for series-level interaction
  const {
    resolvedHoveredIndex,
    resolvedSelectedIndex,
    activeIndex,
    handleMouseEnter: handleSeriesHoverEnter,
    handleMouseLeave: handleSeriesHoverLeave,
    handleClick: handleSeriesSelect,
    handleLegendClick,
    handleLegendHover,
    handleLegendLeave,
    wrapperClasses
  } = useChartInteraction<LineChartSeries>({
    hoverable,
    hoveredIndexProp,
    selectable,
    selectedIndexProp,
    activeOpacity,
    inactiveOpacity,
    legendPosition,
    getData: (index: number) => resolvedSeries[index],
    onHoveredIndexChange: (index) => {
      onHoveredIndexChange?.(index)
      onSeriesHover?.(index, index !== null ? resolvedSeries[index] : null)
    },
    onSelectedIndexChange: (index) => {
      onSelectedIndexChange?.(index)
      if (index !== null) {
        onSeriesClick?.(index, resolvedSeries[index])
      }
    }
  })

  const allData = useMemo(() => resolvedSeries.flatMap((s) => s.data), [resolvedSeries])
  const xValues = useMemo(() => allData.map((d) => d.x), [allData])
  const yValues = useMemo(() => allData.map((d) => d.y), [allData])
  const isXNumeric = useMemo(() => xValues.every((v) => typeof v === 'number'), [xValues])

  const resolvedXScale = useMemo(() => {
    if (xScaleProp) return xScaleProp
    if (isXNumeric) {
      const extent = getNumberExtent(xValues as number[], { includeZero: false })
      return createLinearScale(extent, [0, innerRect.width])
    } else {
      const categories = [...new Set(xValues.map(String))]
      return createPointScale(categories, [0, innerRect.width], { padding: 0.1 })
    }
  }, [xScaleProp, isXNumeric, xValues, innerRect.width])

  const resolvedYScale = useMemo(() => {
    if (yScaleProp) return yScaleProp
    const extent = getNumberExtent(yValues, { includeZero })
    return createLinearScale(extent, [innerRect.height, 0])
  }, [yScaleProp, yValues, includeZero, innerRect.height])

  const resolvedShowXAxis = showAxis && showXAxis
  const resolvedShowYAxis = showAxis && showYAxis

  const palette = useMemo(
    () => (colors && colors.length > 0 ? colors : [...DEFAULT_CHART_COLORS]),
    [colors]
  )

  const seriesData = useMemo(
    () =>
      resolvedSeries.map((s, seriesIndex) => {
        const color = s.color ?? palette[seriesIndex % palette.length]
        const points = s.data.map((datum, pointIndex) => ({
          x: resolvedXScale.map(datum.x),
          y: resolvedYScale.map(datum.y),
          datum,
          pointIndex
        }))
        const linePath = createLinePath(points, curve as ChartCurveType)
        const opacity = getChartElementOpacity(seriesIndex, activeIndex, {
          activeOpacity,
          inactiveOpacity
        })

        return {
          series: s,
          seriesIndex,
          color,
          linePath,
          points,
          opacity,
          strokeWidth: s.strokeWidth ?? strokeWidth,
          strokeDasharray: s.strokeDasharray,
          showPoints: s.showPoints ?? showPoints,
          pointSize: s.pointSize ?? pointSize,
          pointColor: s.pointColor ?? color
        }
      }),
    [
      resolvedSeries,
      palette,
      resolvedXScale,
      resolvedYScale,
      curve,
      activeIndex,
      activeOpacity,
      inactiveOpacity,
      strokeWidth,
      showPoints,
      pointSize
    ]
  )

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      resolvedSeries.map((s, index) => ({
        index,
        label: legendFormatter ? legendFormatter(s, index) : (s.name ?? `Series ${index + 1}`),
        color: s.color ?? palette[index % palette.length],
        active: activeIndex === null || activeIndex === index
      })),
    [resolvedSeries, legendFormatter, palette, activeIndex]
  )

  const formatTooltip = useCallback(
    (datum: LineChartDatum, seriesIndex: number, _pointIndex: number, s?: LineChartSeries) => {
      if (tooltipFormatter) return tooltipFormatter(datum, seriesIndex, _pointIndex, s)
      const seriesName = s?.name ?? `Series ${seriesIndex + 1}`
      const label = datum.label ?? String(datum.x)
      return `${seriesName} · ${label}: ${datum.y}`
    },
    [tooltipFormatter]
  )

  const tooltipContent = useMemo(() => {
    if (!hoveredPointInfo) return ''
    const { seriesIndex, pointIndex } = hoveredPointInfo
    const s = resolvedSeries[seriesIndex]
    const datum = s?.data[pointIndex]
    return datum ? formatTooltip(datum, seriesIndex, pointIndex, s) : ''
  }, [hoveredPointInfo, resolvedSeries, formatTooltip])

  const handlePointMouseEnter = useCallback(
    (seriesIndex: number, pointIndex: number, event: React.MouseEvent) => {
      setHoveredPointInfo({ seriesIndex, pointIndex })
      setTooltipPosition({ x: event.clientX, y: event.clientY })
      onPointHover?.(seriesIndex, pointIndex, resolvedSeries[seriesIndex]?.data[pointIndex])
    },
    [onPointHover, resolvedSeries]
  )

  const handlePointMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }, [])

  const handlePointMouseLeave = useCallback(() => {
    setHoveredPointInfo(null)
    onPointHover?.(null, null, null)
  }, [onPointHover])

  const handlePointClick = useCallback(
    (seriesIndex: number, pointIndex: number) => {
      onPointClick?.(seriesIndex, pointIndex, resolvedSeries[seriesIndex]?.data[pointIndex])
      handleSeriesSelect(seriesIndex)
    },
    [onPointClick, resolvedSeries, handleSeriesSelect]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, seriesIndex: number) => {
      if (!selectable) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleSeriesSelect(seriesIndex)
    },
    [selectable, handleSeriesSelect]
  )

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
      {resolvedShowXAxis && (
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
      {resolvedShowYAxis && (
        <ChartAxis
          scale={resolvedYScale}
          orientation="left"
          ticks={yTicks}
          tickValues={yTickValues}
          tickFormat={yTickFormat}
          label={yAxisLabel}
        />
      )}
      {seriesData.map((sd) => (
        <ChartSeries
          key={`series-${sd.seriesIndex}`}
          data={sd.series.data}
          name={sd.series.name}
          type="line"
          opacity={sd.opacity}
          className={classNames(sd.series.className, (hoverable || selectable) && 'cursor-pointer')}
          onMouseEnter={(e: React.MouseEvent) => handleSeriesHoverEnter(sd.seriesIndex, e)}
          onMouseLeave={handleSeriesHoverLeave}
          onClick={() => handleSeriesSelect(sd.seriesIndex)}
          tabIndex={selectable ? 0 : undefined}
          onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, sd.seriesIndex)}>
          <path
            d={sd.linePath}
            fill="none"
            stroke={sd.color}
            strokeWidth={sd.strokeWidth}
            strokeDasharray={sd.strokeDasharray}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-opacity duration-150"
            data-line-series={sd.seriesIndex}
          />
          {sd.showPoints &&
            sd.points.map((point) => (
              <circle
                key={`point-${sd.seriesIndex}-${point.pointIndex}`}
                cx={point.x}
                cy={point.y}
                r={sd.pointSize}
                fill={sd.pointColor}
                className="transition-all duration-150"
                data-point-index={point.pointIndex}
                onMouseEnter={(e) => handlePointMouseEnter(sd.seriesIndex, point.pointIndex, e)}
                onMouseMove={handlePointMouseMove}
                onMouseLeave={handlePointMouseLeave}
                onClick={(e) => {
                  e.stopPropagation()
                  handlePointClick(sd.seriesIndex, point.pointIndex)
                }}
              />
            ))}
        </ChartSeries>
      ))}
    </ChartCanvas>
  )

  const tooltip = showTooltip && (
    <ChartTooltip
      content={tooltipContent}
      visible={hoveredPointInfo !== null && tooltipContent !== ''}
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

export default LineChart
