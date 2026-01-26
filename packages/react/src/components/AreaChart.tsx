import React, { useMemo, useState, useCallback } from 'react'
import {
  classNames,
  createAreaPath,
  createLinearScale,
  createLinePath,
  createPointScale,
  DEFAULT_CHART_COLORS,
  getChartElementOpacity,
  getChartInnerRect,
  getNumberExtent,
  stackSeriesData,
  type AreaChartDatum,
  type AreaChartProps as CoreAreaChartProps,
  type AreaChartSeries,
  type ChartCurveType,
  type ChartGridLineStyle,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type ChartScale,
  type ChartScaleValue
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'

export interface AreaChartProps extends CoreAreaChartProps {
  data?: AreaChartDatum[]
  series?: AreaChartSeries[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSeriesClick?: (seriesIndex: number, series: AreaChartSeries) => void
  onSeriesHover?: (seriesIndex: number | null, series: AreaChartSeries | null) => void
  onPointClick?: (seriesIndex: number, pointIndex: number, datum: AreaChartDatum) => void
  onPointHover?: (
    seriesIndex: number | null,
    pointIndex: number | null,
    datum: AreaChartDatum | null
  ) => void
}

export const AreaChart: React.FC<AreaChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  series,
  xScale: xScaleProp,
  yScale: yScaleProp,
  areaColor = 'var(--tiger-primary,#2563eb)',
  strokeWidth = 2,
  fillOpacity = 0.2,
  curve = 'linear',
  showPoints = false,
  pointSize = 4,
  pointColor,
  stacked = false,
  showGrid = true,
  showAxis = true,
  showXAxis = true,
  showYAxis = true,
  includeZero = true,
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
  const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(null)
  const [localSelectedIndex, setLocalSelectedIndex] = useState<number | null>(null)
  const [hoveredPointInfo, setHoveredPointInfo] = useState<{
    seriesIndex: number
    pointIndex: number
  } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )

  const resolvedSeries = useMemo<AreaChartSeries[]>(() => {
    if (series && series.length > 0) return series
    if (data && data.length > 0) return [{ data }]
    return []
  }, [series, data])

  const allData = useMemo(() => resolvedSeries.flatMap((s) => s.data), [resolvedSeries])
  const xValues = useMemo(() => allData.map((d) => d.x), [allData])

  const yValues = useMemo(() => {
    if (stacked) {
      const stackedData = stackSeriesData(resolvedSeries.map((s) => s.data))
      return stackedData.flatMap((s) => s.map((d) => d.y1))
    }
    return allData.map((d) => d.y)
  }, [stacked, resolvedSeries, allData])

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

  const baseline = useMemo(() => resolvedYScale.map(0), [resolvedYScale])

  const resolvedShowXAxis = showAxis && showXAxis
  const resolvedShowYAxis = showAxis && showYAxis

  const palette = useMemo(
    () => (colors && colors.length > 0 ? colors : [...DEFAULT_CHART_COLORS]),
    [colors]
  )

  const resolvedHoveredIndex = hoveredIndexProp !== undefined ? hoveredIndexProp : localHoveredIndex
  const resolvedSelectedIndex =
    selectedIndexProp !== undefined ? selectedIndexProp : localSelectedIndex

  const activeIndex = useMemo(() => {
    if (resolvedSelectedIndex !== null) return resolvedSelectedIndex
    if (hoverable && resolvedHoveredIndex !== null) return resolvedHoveredIndex
    return null
  }, [resolvedSelectedIndex, hoverable, resolvedHoveredIndex])

  const seriesData = useMemo(() => {
    const stackedData = stacked ? stackSeriesData(resolvedSeries.map((s) => s.data)) : null

    return resolvedSeries.map((s, seriesIndex) => {
      const color = s.color ?? palette[seriesIndex % palette.length]
      const seriesFillColor = s.fillColor ?? color
      const seriesFillOpacity = s.fillOpacity ?? fillOpacity

      let points: Array<{ x: number; y: number; datum: AreaChartDatum; pointIndex: number }>
      let areaPath: string
      let linePath: string

      if (stacked && stackedData) {
        const stackedSeries = stackedData[seriesIndex]
        points = stackedSeries.map((sd, pointIndex) => ({
          x: resolvedXScale.map(sd.original.x),
          y: resolvedYScale.map(sd.y1),
          datum: sd.original,
          pointIndex
        }))

        const topPoints = points.map((p) => ({ x: p.x, y: p.y }))
        const bottomPoints = stackedSeries
          .map((sd) => ({
            x: resolvedXScale.map(sd.original.x),
            y: resolvedYScale.map(sd.y0)
          }))
          .reverse()

        const topPath = createLinePath(topPoints, curve as ChartCurveType)
        const bottomPath = createLinePath(bottomPoints, curve as ChartCurveType).replace('M', 'L')
        areaPath = `${topPath} ${bottomPath} Z`
        linePath = topPath
      } else {
        points = s.data.map((datum, pointIndex) => ({
          x: resolvedXScale.map(datum.x),
          y: resolvedYScale.map(datum.y),
          datum,
          pointIndex
        }))

        areaPath = createAreaPath(points, baseline, curve as ChartCurveType)
        linePath = createLinePath(points, curve as ChartCurveType)
      }

      const opacity = getChartElementOpacity(seriesIndex, activeIndex, {
        activeOpacity,
        inactiveOpacity
      })

      return {
        series: s,
        seriesIndex,
        color,
        fillColor: seriesFillColor,
        fillOpacity: seriesFillOpacity,
        areaPath,
        linePath,
        points,
        opacity,
        strokeWidth: s.strokeWidth ?? strokeWidth,
        strokeDasharray: s.strokeDasharray,
        showPoints: s.showPoints ?? showPoints,
        pointSize: s.pointSize ?? pointSize,
        pointColor: s.pointColor ?? color
      }
    })
  }, [
    resolvedSeries,
    palette,
    resolvedXScale,
    resolvedYScale,
    curve,
    stacked,
    baseline,
    activeIndex,
    activeOpacity,
    inactiveOpacity,
    fillOpacity,
    strokeWidth,
    showPoints,
    pointSize
  ])

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
    (datum: AreaChartDatum, seriesIndex: number, _pointIndex: number, s?: AreaChartSeries) => {
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

  const handleSeriesMouseEnter = useCallback(
    (seriesIndex: number) => {
      if (!hoverable) return
      if (hoveredIndexProp === undefined) {
        setLocalHoveredIndex(seriesIndex)
      }
      onHoveredIndexChange?.(seriesIndex)
      onSeriesHover?.(seriesIndex, resolvedSeries[seriesIndex])
    },
    [hoverable, hoveredIndexProp, onHoveredIndexChange, onSeriesHover, resolvedSeries]
  )

  const handleSeriesMouseLeave = useCallback(() => {
    if (!hoverable) return
    if (hoveredIndexProp === undefined) {
      setLocalHoveredIndex(null)
    }
    onHoveredIndexChange?.(null)
    onSeriesHover?.(null, null)
  }, [hoverable, hoveredIndexProp, onHoveredIndexChange, onSeriesHover])

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

  const handleSeriesClick = useCallback(
    (seriesIndex: number) => {
      if (!selectable) return
      const nextIndex = resolvedSelectedIndex === seriesIndex ? null : seriesIndex
      if (selectedIndexProp === undefined) {
        setLocalSelectedIndex(nextIndex)
      }
      onSelectedIndexChange?.(nextIndex)
      onSeriesClick?.(seriesIndex, resolvedSeries[seriesIndex])
    },
    [
      selectable,
      resolvedSelectedIndex,
      selectedIndexProp,
      onSelectedIndexChange,
      onSeriesClick,
      resolvedSeries
    ]
  )

  const handlePointClick = useCallback(
    (seriesIndex: number, pointIndex: number) => {
      onPointClick?.(seriesIndex, pointIndex, resolvedSeries[seriesIndex]?.data[pointIndex])
      handleSeriesClick(seriesIndex)
    },
    [onPointClick, resolvedSeries, handleSeriesClick]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, seriesIndex: number) => {
      if (!selectable) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleSeriesClick(seriesIndex)
    },
    [selectable, handleSeriesClick]
  )

  const handleLegendClick = useCallback(
    (index: number) => {
      handleSeriesClick(index)
    },
    [handleSeriesClick]
  )

  const handleLegendHover = useCallback(
    (index: number) => {
      if (!hoverable) return
      if (hoveredIndexProp === undefined) {
        setLocalHoveredIndex(index)
      }
      onHoveredIndexChange?.(index)
    },
    [hoverable, hoveredIndexProp, onHoveredIndexChange]
  )

  const handleLegendLeave = useCallback(() => {
    handleSeriesMouseLeave()
  }, [handleSeriesMouseLeave])

  const wrapperClasses = useMemo(
    () =>
      classNames(
        'inline-flex',
        legendPosition === 'right'
          ? 'flex-row items-start gap-4'
          : legendPosition === 'left'
            ? 'flex-row-reverse items-start gap-4'
            : legendPosition === 'top'
              ? 'flex-col-reverse gap-2'
              : 'flex-col gap-2'
      ),
    [legendPosition]
  )

  // Reverse for proper stacking visual
  const reversedSeriesData = useMemo(() => [...seriesData].reverse(), [seriesData])

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
      {reversedSeriesData.map((sd) => (
        <ChartSeries
          key={`series-${sd.seriesIndex}`}
          data={sd.series.data}
          name={sd.series.name}
          type="area"
          opacity={sd.opacity}
          className={classNames(sd.series.className, (hoverable || selectable) && 'cursor-pointer')}
          onMouseEnter={() => handleSeriesMouseEnter(sd.seriesIndex)}
          onMouseLeave={handleSeriesMouseLeave}
          onClick={() => handleSeriesClick(sd.seriesIndex)}
          tabIndex={selectable ? 0 : undefined}
          onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, sd.seriesIndex)}>
          <path
            d={sd.areaPath}
            fill={sd.fillColor}
            fillOpacity={sd.fillOpacity}
            stroke="none"
            className="transition-opacity duration-150"
            data-area-series={sd.seriesIndex}
          />
          <path
            d={sd.linePath}
            fill="none"
            stroke={sd.color}
            strokeWidth={sd.strokeWidth}
            strokeDasharray={sd.strokeDasharray}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-opacity duration-150"
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

export default AreaChart
