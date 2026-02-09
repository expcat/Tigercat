import React, { useMemo, useState, useCallback } from 'react'
import {
  chartAxisTickTextClasses,
  chartGridLineClasses,
  classNames,
  createPolygonPath,
  getChartGridLineDasharray,
  getChartInnerRect,
  getRadarAngles,
  getRadarLabelAlign,
  getRadarPoints,
  polarToCartesian,
  RADAR_SPLIT_AREA_COLORS,
  resolveChartPalette,
  buildChartLegendItems,
  resolveMultiSeriesTooltipContent,
  resolveSeriesData,
  defaultRadarTooltipFormatter,
  type ChartPadding,
  type RadarChartDatum,
  type RadarChartProps as CoreRadarChartProps,
  type RadarChartSeries
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'

export interface RadarChartProps extends CoreRadarChartProps {
  data?: RadarChartDatum[]
  series?: RadarChartSeries[]
  padding?: ChartPadding
  showLevelLabels?: boolean
  levelLabelFormatter?: (value: number, level: number) => string
  levelLabelOffset?: number
  gridShape?: 'polygon' | 'circle'
  showSplitArea?: boolean
  splitAreaOpacity?: number
  splitAreaColors?: string[]
  pointBorderWidth?: number
  pointBorderColor?: string
  pointHoverSize?: number
  labelAutoAlign?: boolean
  title?: string
  desc?: string
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSeriesClick?: (index: number, series: RadarChartSeries) => void
  onSeriesHover?: (index: number | null, series: RadarChartSeries | null) => void
}

export const RadarChart: React.FC<RadarChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  series,
  maxValue,
  startAngle = -Math.PI / 2,
  levels = 5,
  showLevelLabels = false,
  showGrid = true,
  showAxis = true,
  showLabels = true,
  labelOffset = 12,
  labelFormatter,
  levelLabelFormatter,
  levelLabelOffset = 8,
  colors,
  gridLineStyle = 'solid',
  gridStrokeWidth = 1,
  hoverable = false,
  hoveredIndex: hoveredIndexProp,
  activeOpacity = 1,
  inactiveOpacity = 0.25,
  showTooltip = true,
  tooltipFormatter,
  selectable = false,
  selectedIndex: selectedIndexProp,
  onHoveredIndexChange,
  onSelectedIndexChange,
  onSeriesClick,
  onSeriesHover,
  showLegend = false,
  legendPosition = 'bottom',
  legendFormatter,
  legendMarkerSize = 10,
  legendGap = 8,
  strokeColor,
  strokeWidth = 2,
  fillColor,
  fillOpacity = 0.2,
  showPoints = true,
  pointSize = 3,
  pointColor,
  gridShape = 'polygon',
  showSplitArea = false,
  splitAreaOpacity = 0.06,
  splitAreaColors,
  pointBorderWidth = 2,
  pointBorderColor = '#fff',
  pointHoverSize,
  labelAutoAlign = true,
  title,
  desc,
  className
}) => {
  // Resolve series first (needed for hook callbacks)
  const resolvedSeries = useMemo<RadarChartSeries[]>(
    () =>
      resolveSeriesData<RadarChartDatum, RadarChartSeries>(series, data, {
        data: [] as RadarChartDatum[]
      } as Partial<Omit<RadarChartSeries, 'data'>>),
    [series, data]
  )

  // Use shared interaction hook for series-based interaction
  const {
    resolvedHoveredIndex: _resolvedHoveredIndex,
    resolvedSelectedIndex: _resolvedSelectedIndex,
    activeIndex: resolvedActiveIndex,
    tooltipPosition,
    handleMouseEnter: handleHoverEnter,
    handleMouseMove,
    handleMouseLeave: handleHoverLeave,
    handleClick: handleSelectIndex,
    handleLegendClick,
    handleLegendHover,
    handleLegendLeave,
    wrapperClasses
  } = useChartInteraction<RadarChartSeries>({
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

  // Point-level hover state for tooltip
  const [hoveredPoint, setHoveredPoint] = useState<{
    seriesIndex: number
    pointIndex: number
  } | null>(null)

  const handlePointEnter = useCallback(
    (seriesIndex: number, pointIndex: number, event: React.MouseEvent) => {
      if (!hoverable) return
      setHoveredPoint({ seriesIndex, pointIndex })
      handleHoverEnter(seriesIndex, event)
    },
    [hoverable, handleHoverEnter]
  )

  const handlePointMove = useCallback(
    (event: React.MouseEvent) => {
      handleMouseMove(event)
    },
    [handleMouseMove]
  )

  const handlePointLeave = useCallback(() => {
    setHoveredPoint(null)
    handleHoverLeave()
  }, [handleHoverLeave])

  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )

  const radius = useMemo(
    () => Math.max(0, Math.min(innerRect.width, innerRect.height) / 2),
    [innerRect.width, innerRect.height]
  )

  const cx = innerRect.width / 2
  const cy = innerRect.height / 2

  const axisData = useMemo(() => {
    if (series && series.length > 0) return series[0]?.data ?? []
    return data ?? []
  }, [series, data])

  const resolvedMaxValue = useMemo(() => {
    if (typeof maxValue === 'number') return Math.max(0, maxValue)
    const values = resolvedSeries.flatMap((item) => item.data.map((datum) => datum.value))
    const computedMax = values.length > 0 ? Math.max(...values) : 0
    return computedMax > 0 ? computedMax : 1
  }, [resolvedSeries, maxValue])

  const angles = useMemo(
    () => getRadarAngles(axisData.length, startAngle),
    [axisData.length, startAngle]
  )

  const seriesPoints = useMemo(
    () =>
      resolvedSeries.map((item) => ({
        series: item,
        points: getRadarPoints(item.data, {
          cx,
          cy,
          radius,
          startAngle,
          maxValue: resolvedMaxValue
        })
      })),
    [resolvedSeries, cx, cy, radius, startAngle, resolvedMaxValue]
  )

  const gridPaths = useMemo(() => {
    if (!showGrid || angles.length === 0) return []
    const resolvedLevels = Math.max(1, Math.floor(levels))

    return Array.from({ length: resolvedLevels }, (_, index) => {
      const levelRadius = radius * ((index + 1) / resolvedLevels)
      if (gridShape === 'circle') {
        return { type: 'circle' as const, cx, cy, r: levelRadius }
      }
      const ringPoints = angles.map((angle) => polarToCartesian(cx, cy, levelRadius, angle))
      return { type: 'polygon' as const, d: createPolygonPath(ringPoints), cx, cy, r: levelRadius }
    })
  }, [showGrid, levels, angles, radius, cx, cy, gridShape])

  const splitAreaPaths = useMemo(() => {
    if (!showSplitArea || angles.length === 0) return []
    const resolvedLevels = Math.max(1, Math.floor(levels))
    const areaColors =
      splitAreaColors && splitAreaColors.length > 0 ? splitAreaColors : RADAR_SPLIT_AREA_COLORS

    return Array.from({ length: resolvedLevels }, (_, index) => {
      const outerIndex = resolvedLevels - 1 - index
      const outerRadius = radius * ((outerIndex + 1) / resolvedLevels)
      const innerRadius = radius * (outerIndex / resolvedLevels)
      const color = areaColors[outerIndex % areaColors.length]

      if (gridShape === 'circle') {
        return { type: 'circle-ring' as const, cx, cy, outerRadius, innerRadius, color }
      }
      const outerPoints = angles.map((angle) => polarToCartesian(cx, cy, outerRadius, angle))
      const innerPoints =
        outerIndex > 0 ? angles.map((angle) => polarToCartesian(cx, cy, innerRadius, angle)) : []
      return { type: 'polygon-ring' as const, outerPoints, innerPoints, color }
    })
  }, [showSplitArea, levels, angles, radius, cx, cy, gridShape, splitAreaColors, splitAreaOpacity])

  const axisLines = useMemo(() => {
    if (!showAxis || angles.length === 0) return []
    return angles.map((angle) => {
      const end = polarToCartesian(cx, cy, radius, angle)
      return {
        x1: cx,
        y1: cy,
        x2: end.x,
        y2: end.y
      }
    })
  }, [showAxis, angles, cx, cy, radius])

  const labels = useMemo(() => {
    if (!showLabels || angles.length === 0) return []
    const formatLabel =
      labelFormatter ?? ((datum: RadarChartDatum) => datum.label ?? `${datum.value}`)

    return axisData.map((datum, index) => {
      const angle = angles[index]
      const position = polarToCartesian(cx, cy, radius + labelOffset, angle)
      const align = labelAutoAlign
        ? getRadarLabelAlign(angle)
        : { textAnchor: 'middle' as const, dominantBaseline: 'middle' as const }
      return {
        x: position.x,
        y: position.y,
        text: formatLabel(datum, index),
        textAnchor: align.textAnchor,
        dominantBaseline: align.dominantBaseline
      }
    })
  }, [showLabels, axisData, angles, cx, cy, radius, labelOffset, labelFormatter, labelAutoAlign])

  const levelLabels = useMemo(() => {
    if (!showLevelLabels || !showGrid || angles.length === 0) return []
    const resolvedLevels = Math.max(1, Math.floor(levels))
    const formatLevel = levelLabelFormatter ?? ((value: number) => `${value}`)

    return Array.from({ length: resolvedLevels }, (_, index) => {
      const ratio = (index + 1) / resolvedLevels
      const value = resolvedMaxValue * ratio
      const position = polarToCartesian(cx, cy, radius * ratio + levelLabelOffset, startAngle)

      return {
        x: position.x,
        y: position.y,
        text: formatLevel(value, index)
      }
    })
  }, [
    showLevelLabels,
    showGrid,
    angles.length,
    levels,
    resolvedMaxValue,
    cx,
    cy,
    radius,
    levelLabelOffset,
    startAngle,
    levelLabelFormatter
  ])

  const dasharray = getChartGridLineDasharray(gridLineStyle)
  const palette = useMemo(() => resolveChartPalette(colors), [colors])

  const tooltipContent = useMemo(
    () =>
      resolveMultiSeriesTooltipContent(
        hoveredPoint,
        resolvedSeries,
        tooltipFormatter,
        defaultRadarTooltipFormatter
      ),
    [hoveredPoint, resolvedSeries, tooltipFormatter]
  )

  const legendItems = useMemo(
    () =>
      buildChartLegendItems<RadarChartSeries>({
        data: resolvedSeries,
        palette,
        activeIndex: resolvedActiveIndex,
        getLabel: (s, i) =>
          legendFormatter ? legendFormatter(s, i) : (s.name ?? `Series ${i + 1}`),
        getColor: (s, i) => s.color ?? palette[i % palette.length]
      }),
    [resolvedSeries, palette, resolvedActiveIndex, legendFormatter]
  )

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      title={title}
      desc={desc}
      className={classNames(className)}>
      {/* Split areas */}
      {splitAreaPaths.map((area, index) => {
        if (area.type === 'circle-ring') {
          return (
            <g key={`split-${index}`}>
              <circle
                cx={area.cx}
                cy={area.cy}
                r={area.outerRadius}
                fill={area.color}
                fillOpacity={splitAreaOpacity}
                stroke="none"
                data-radar-split-area="true"
              />
              {area.innerRadius > 0 ? (
                <circle
                  cx={area.cx}
                  cy={area.cy}
                  r={area.innerRadius}
                  fill="var(--tiger-bg,#fff)"
                  stroke="none"
                />
              ) : null}
            </g>
          )
        }
        const outerPath = createPolygonPath(area.outerPoints)
        return (
          <g key={`split-${index}`}>
            {outerPath ? (
              <path
                d={outerPath}
                fill={area.color}
                fillOpacity={splitAreaOpacity}
                stroke="none"
                data-radar-split-area="true"
              />
            ) : null}
            {area.innerPoints.length > 0 ? (
              <path
                d={createPolygonPath(area.innerPoints)}
                fill="var(--tiger-bg,#fff)"
                stroke="none"
              />
            ) : null}
          </g>
        )
      })}
      {/* Grid lines */}
      {gridPaths.map((grid, index) =>
        grid.type === 'circle' ? (
          <circle
            key={`grid-${index}`}
            cx={grid.cx}
            cy={grid.cy}
            r={grid.r}
            className={chartGridLineClasses}
            fill="none"
            strokeWidth={gridStrokeWidth}
            strokeDasharray={dasharray}
          />
        ) : (
          <path
            key={`grid-${index}`}
            d={grid.d}
            className={chartGridLineClasses}
            fill="none"
            strokeWidth={gridStrokeWidth}
            strokeDasharray={dasharray}
          />
        )
      )}
      {axisLines.map((line, index) => (
        <line
          key={`axis-${index}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          className={chartGridLineClasses}
          strokeWidth={gridStrokeWidth}
          strokeDasharray={dasharray}
        />
      ))}
      {seriesPoints.map((item, seriesIndex) => {
        const seriesColor = item.series.color ?? palette[seriesIndex % palette.length]
        const resolvedStrokeColor =
          item.series.strokeColor ?? seriesColor ?? strokeColor ?? palette[0]
        const resolvedFillColor = item.series.fillColor ?? seriesColor ?? fillColor ?? palette[0]
        const resolvedFillOpacity = item.series.fillOpacity ?? fillOpacity
        const resolvedStrokeWidth = item.series.strokeWidth ?? strokeWidth
        const resolvedShowPoints = item.series.showPoints ?? showPoints
        const resolvedPointSize = item.series.pointSize ?? pointSize
        const resolvedPointColor = item.series.pointColor ?? seriesColor ?? pointColor
        const areaPath = createPolygonPath(item.points.map((point) => ({ x: point.x, y: point.y })))
        const resolvedOpacity =
          resolvedActiveIndex === null
            ? undefined
            : seriesIndex === resolvedActiveIndex
              ? activeOpacity
              : inactiveOpacity

        return (
          <ChartSeries
            key={`series-${seriesIndex}`}
            data={item.series.data}
            name={item.series.name}
            type="radar"
            className={item.series.className}
            opacity={resolvedOpacity}
            style={hoverable || selectable ? { cursor: 'pointer' } : undefined}
            onMouseEnter={
              hoverable ? (e: React.MouseEvent) => handleHoverEnter(seriesIndex, e) : undefined
            }
            onMouseLeave={hoverable ? handleHoverLeave : undefined}
            onClick={selectable ? () => handleSelectIndex(seriesIndex) : undefined}
            tabIndex={selectable ? 0 : undefined}
            onKeyDown={(event) => {
              if (!selectable) return
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              handleSelectIndex(seriesIndex)
            }}>
            {areaPath ? (
              <path
                d={areaPath}
                fill={resolvedFillColor}
                fillOpacity={resolvedFillOpacity}
                stroke={resolvedStrokeColor}
                strokeWidth={resolvedStrokeWidth}
                strokeLinejoin="round"
                className="transition-[fill-opacity,filter] duration-200 ease-out"
                style={
                  resolvedActiveIndex === seriesIndex
                    ? { filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }
                    : undefined
                }
                data-radar-area="true"
                data-series-index={seriesIndex}
              />
            ) : null}
            {resolvedShowPoints
              ? item.points.map((point) => {
                  const isHoveredPoint =
                    hoveredPoint?.seriesIndex === seriesIndex &&
                    hoveredPoint?.pointIndex === point.index
                  const hoverSize = pointHoverSize ?? resolvedPointSize + 2
                  const currentSize = isHoveredPoint
                    ? hoverSize
                    : (point.data.size ?? resolvedPointSize)
                  const resolvedBorderWidth = item.series.pointBorderWidth ?? pointBorderWidth
                  const resolvedBorderColor = item.series.pointBorderColor ?? pointBorderColor
                  return (
                    <circle
                      key={`point-${seriesIndex}-${point.index}`}
                      cx={point.x}
                      cy={point.y}
                      r={currentSize}
                      fill={point.data.color ?? resolvedPointColor ?? resolvedStrokeColor}
                      stroke={resolvedBorderColor}
                      strokeWidth={resolvedBorderWidth}
                      className={classNames(
                        showTooltip && hoverable ? 'cursor-pointer' : undefined,
                        'transition-[r] duration-150 ease-out'
                      )}
                      data-radar-point="true"
                      data-series-index={seriesIndex}
                      data-point-index={point.index}
                      onMouseEnter={
                        showTooltip && hoverable
                          ? (e: React.MouseEvent) => handlePointEnter(seriesIndex, point.index, e)
                          : undefined
                      }
                      onMouseMove={showTooltip && hoverable ? handlePointMove : undefined}
                      onMouseLeave={showTooltip && hoverable ? handlePointLeave : undefined}
                    />
                  )
                })
              : null}
          </ChartSeries>
        )
      })}
      {labels.map((label, index) => (
        <text
          key={`label-${index}`}
          x={label.x}
          y={label.y}
          className={chartAxisTickTextClasses}
          textAnchor={label.textAnchor}
          dominantBaseline={label.dominantBaseline}>
          {label.text}
        </text>
      ))}
      {levelLabels.map((label, index) => (
        <text
          key={`level-${index}`}
          x={label.x}
          y={label.y}
          className={chartAxisTickTextClasses}
          textAnchor="middle"
          dominantBaseline="middle"
          data-radar-level-label="true">
          {label.text}
        </text>
      ))}
    </ChartCanvas>
  )

  const tooltip =
    showTooltip && hoverable ? (
      <ChartTooltip
        content={tooltipContent}
        visible={hoveredPoint !== null && tooltipContent !== ''}
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
        interactive={hoverable || selectable}
        onItemClick={handleLegendClick}
        onItemHover={handleLegendHover}
        onItemLeave={handleLegendLeave}
      />
      {tooltip}
    </div>
  )
}

export default RadarChart
