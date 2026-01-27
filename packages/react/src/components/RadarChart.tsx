import React, { useMemo, useState } from 'react'
import {
  chartAxisTickTextClasses,
  chartGridLineClasses,
  classNames,
  createPolygonPath,
  DEFAULT_CHART_COLORS,
  getChartGridLineDasharray,
  getChartInnerRect,
  getRadarAngles,
  getRadarPoints,
  polarToCartesian,
  type ChartPadding,
  type RadarChartDatum,
  type RadarChartProps as CoreRadarChartProps,
  type RadarChartSeries
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartSeries } from './ChartSeries'

export interface RadarChartProps extends CoreRadarChartProps {
  data?: RadarChartDatum[]
  series?: RadarChartSeries[]
  padding?: ChartPadding
  showLevelLabels?: boolean
  levelLabelFormatter?: (value: number, level: number) => string
  levelLabelOffset?: number
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
  strokeColor = DEFAULT_CHART_COLORS[0],
  strokeWidth = 2,
  fillColor = DEFAULT_CHART_COLORS[0],
  fillOpacity = 0.2,
  showPoints = true,
  pointSize = 3,
  pointColor,
  title,
  desc,
  className
}) => {
  const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(null)
  const [localSelectedIndex, setLocalSelectedIndex] = useState<number | null>(null)
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

  const resolvedSeries = useMemo<RadarChartSeries[]>(() => {
    if (series && series.length > 0) return series
    return [{ data: data ?? [] }]
  }, [series, data])

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
      const ringPoints = angles.map((angle) => polarToCartesian(cx, cy, levelRadius, angle))
      return createPolygonPath(ringPoints)
    })
  }, [showGrid, levels, angles, radius, cx, cy])

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
      return {
        x: position.x,
        y: position.y,
        text: formatLabel(datum, index)
      }
    })
  }, [showLabels, axisData, angles, cx, cy, radius, labelOffset, labelFormatter])

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
  const palette = useMemo(
    () => (colors && colors.length > 0 ? colors : [...DEFAULT_CHART_COLORS]),
    [colors]
  )
  const formatTooltip = useMemo(
    () =>
      tooltipFormatter ??
      ((datum: RadarChartDatum, seriesIndex: number, index: number, series?: RadarChartSeries) => {
        const label = datum.label ?? `#${index + 1}`
        const value = datum.value
        const name = series?.name ?? `Series ${seriesIndex + 1}`
        return `${name} · ${label}: ${value}`
      }),
    [tooltipFormatter]
  )
  const resolvedSelectedIndex =
    selectedIndexProp !== undefined ? selectedIndexProp : localSelectedIndex
  const resolvedHoveredIndex = hoveredIndexProp !== undefined ? hoveredIndexProp : localHoveredIndex
  const resolvedActiveIndex = useMemo(() => {
    if (resolvedSelectedIndex !== null) return resolvedSelectedIndex
    if (hoverable && resolvedHoveredIndex !== null) return resolvedHoveredIndex
    return null
  }, [resolvedSelectedIndex, hoverable, resolvedHoveredIndex])

  const handleHover = (index: number | null) => {
    if (!hoverable) return
    if (hoveredIndexProp === undefined) {
      setLocalHoveredIndex(index)
    }
    onHoveredIndexChange?.(index)
    if (index !== null) {
      onSeriesHover?.(index, resolvedSeries[index])
    } else {
      onSeriesHover?.(null, null)
    }
  }

  const handleSelectIndex = (index: number) => {
    if (!selectable) return
    const nextIndex = resolvedSelectedIndex === index ? null : index
    if (selectedIndexProp === undefined) {
      setLocalSelectedIndex(nextIndex)
    }
    onSelectedIndexChange?.(nextIndex)
    onSeriesClick?.(index, resolvedSeries[index])
  }
  const resolvedLegendItems = useMemo(
    () =>
      resolvedSeries.map((item, index) => {
        const color = item.color ?? palette[index % palette.length]
        const label = legendFormatter
          ? legendFormatter(item, index)
          : (item.name ?? `Series ${index + 1}`)

        return {
          index,
          label,
          color
        }
      }),
    [resolvedSeries, palette, legendFormatter]
  )
  const legendContainerClasses = classNames(
    'flex flex-wrap',
    legendPosition === 'right' ? 'flex-col gap-2' : 'flex-row gap-3'
  )
  const wrapperClasses = classNames(
    'inline-flex',
    legendPosition === 'right' ? 'flex-row items-start gap-4' : 'flex-col gap-2'
  )

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      title={title}
      desc={desc}
      className={classNames(className)}>
      {gridPaths.map((path, index) => (
        <path
          key={`grid-${index}`}
          d={path}
          className={chartGridLineClasses}
          fill="none"
          strokeWidth={gridStrokeWidth}
          strokeDasharray={dasharray}
        />
      ))}
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
        const resolvedStrokeColor = item.series.strokeColor ?? seriesColor ?? strokeColor
        const resolvedFillColor = item.series.fillColor ?? seriesColor ?? fillColor
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
            onMouseEnter={hoverable ? () => handleHover(seriesIndex) : undefined}
            onMouseLeave={hoverable ? () => handleHover(null) : undefined}
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
                data-radar-area="true"
                data-series-index={seriesIndex}
              />
            ) : null}
            {resolvedShowPoints
              ? item.points.map((point) => {
                  const tooltipText = showTooltip
                    ? formatTooltip(point.data, seriesIndex, point.index, item.series)
                    : null

                  return (
                    <circle
                      key={`point-${seriesIndex}-${point.index}`}
                      cx={point.x}
                      cy={point.y}
                      r={point.data.size ?? resolvedPointSize}
                      fill={point.data.color ?? resolvedPointColor ?? resolvedStrokeColor}
                      data-radar-point="true"
                      data-series-index={seriesIndex}>
                      {tooltipText ? <title>{tooltipText}</title> : null}
                    </circle>
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
          textAnchor="middle"
          dominantBaseline="middle">
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

  if (!showLegend) return chart

  return (
    <div className={wrapperClasses}>
      {chart}
      <div className={legendContainerClasses}>
        {resolvedLegendItems.map((item) => (
          <button
            key={`legend-${item.index}`}
            type="button"
            className={classNames(
              'flex items-center gap-2 text-sm text-gray-600',
              selectable ? 'cursor-pointer' : 'cursor-default'
            )}
            onClick={selectable ? () => handleSelectIndex(item.index) : undefined}
            onMouseEnter={hoverable ? () => handleHover(item.index) : undefined}
            onMouseLeave={hoverable ? () => handleHover(null) : undefined}>
            <span
              className="inline-block rounded-full"
              style={{
                width: `${legendMarkerSize}px`,
                height: `${legendMarkerSize}px`,
                backgroundColor: item.color
              }}
            />
            <span style={{ marginRight: `${legendGap}px` }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default RadarChart
