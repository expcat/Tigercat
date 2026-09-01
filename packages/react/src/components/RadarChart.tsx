import React, { useCallback, useId, useMemo, useState } from 'react'
import {
  chartAxisTickTextClasses,
  chartGridLineClasses,
  classNames,
  getChartGridLineDasharray,
  getStableChartGradientPrefix,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  buildChartSeriesKeys,
  resolveSeriesData,
  defaultRadarTooltipFormatter,
  getCartesianChartShellClasses,
  chartPointTabIndex,
  flattenChartPoints,
  nextChartPointRef,
  isChartNavigationKey,
  getChartLabels,
  mergeTigerLocale,
  defaultChartSeriesName,
  formatChartTemplate,
  layoutRadar,
  findNearestPointIndex,
  polarToCartesian,
  DEFAULT_POLAR_CHART_PADDING,
  type ChartPadding,
  type RadarChartDatum,
  type RadarChartProps as CoreRadarChartProps,
  type RadarChartSeries
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'
import { useResponsiveChartSize } from '../hooks/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface RadarChartProps extends CoreRadarChartProps {
  data?: RadarChartDatum[]
  series?: RadarChartSeries[]
  padding?: ChartPadding
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSeriesClick?: (index: number, series: RadarChartSeries) => void
  onSeriesHover?: (index: number | null, series: RadarChartSeries | null) => void
}

export const RadarChart: React.FC<RadarChartProps> = ({
  width = 320,
  height = 200,
  padding = DEFAULT_POLAR_CHART_PADDING,
  responsive = false,
  data,
  series,
  indicators,
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
  gradient = false,
  strokeGradient = false,
  pointGradient = false,
  pointBorderWidth = 2,
  pointBorderColor = 'var(--tiger-surface,#ffffff)',
  pointHoverSize,
  labelAutoAlign = true,
  title,
  desc,
  className
}) => {
  const config = useTigerConfig()
  const labels = useMemo(() => getChartLabels(mergeTigerLocale(config.locale)), [config.locale])
  const resolvedSeries = useMemo<RadarChartSeries[]>(
    () =>
      resolveSeriesData<RadarChartDatum, RadarChartSeries>(series, data, {
        data: [] as RadarChartDatum[]
      } as Partial<Omit<RadarChartSeries, 'data'>>),
    [series, data]
  )
  const seriesKeys = useMemo(
    () => buildChartSeriesKeys(resolvedSeries, { prefix: 'radar-' }),
    [resolvedSeries]
  )
  const interactive = hoverable || selectable || Boolean(onSeriesClick)
  const trackPointer = showTooltip || hoverable
  const focusable = interactive

  const {
    resolvedSelectedIndex,
    activeIndex: resolvedActiveIndex,
    tooltipPosition,
    handleMouseEnter: handleHoverEnter,
    handleMouseMove,
    handleMouseLeave: handleHoverLeave,
    handleClick: handleSelectIndex,
    handleLegendClick,
    handleLegendHover,
    handleLegendLeave
  } = useChartInteraction<RadarChartSeries>({
    hoverable,
    showTooltip,
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
    onSelectedIndexChange,
    onClick: (index, item) => {
      if (item) onSeriesClick?.(index, item)
    }
  })

  const [hoveredPoint, setHoveredPoint] = useState<{
    seriesIndex: number
    pointIndex: number
  } | null>(null)
  const [activePoint, setActivePoint] = useState<{
    seriesIndex: number
    pointIndex: number
  } | null>(null)

  const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
    width,
    height,
    padding,
    responsive
  )
  const palette = useMemo(() => resolveChartPalette(colors), [colors])
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('radar', gradientId),
    [gradientId]
  )
  const laid = useMemo(
    () =>
      layoutRadar(resolvedSeries, {
        innerWidth: innerRect.width,
        innerHeight: innerRect.height,
        startAngle,
        maxValue,
        levels,
        gridShape,
        palette,
        gradient,
        gradientPrefix,
        indicators,
        showLabels,
        showGrid,
        showAxis,
        showSplitArea,
        showLevelLabels,
        labelOffset,
        levelLabelOffset,
        labelFormatter,
        levelLabelFormatter,
        labelAutoAlign,
        strokeColor,
        fillColor,
        fillOpacity,
        splitAreaColors,
        seriesKeys,
        activeIndex: resolvedActiveIndex,
        activeOpacity,
        inactiveOpacity
      }),
    [
      resolvedSeries,
      innerRect.width,
      innerRect.height,
      startAngle,
      maxValue,
      levels,
      gridShape,
      palette,
      gradient,
      gradientPrefix,
      indicators,
      showLabels,
      showGrid,
      showAxis,
      showSplitArea,
      showLevelLabels,
      labelOffset,
      levelLabelOffset,
      labelFormatter,
      levelLabelFormatter,
      labelAutoAlign,
      strokeColor,
      fillColor,
      fillOpacity,
      splitAreaColors,
      seriesKeys,
      resolvedActiveIndex,
      activeOpacity,
      inactiveOpacity
    ]
  )

  const flatPoints = useMemo(
    () =>
      flattenChartPoints(
        laid.series.map((item) => ({
          seriesIndex: item.seriesIndex,
          points: item.points.map((point) => ({ pointIndex: point.index }))
        }))
      ),
    [laid.series]
  )

  const handlePointEnter = useCallback(
    (seriesIndex: number, pointIndex: number, event: React.MouseEvent | React.FocusEvent) => {
      if (!trackPointer) return
      setHoveredPoint({ seriesIndex, pointIndex })
      handleHoverEnter(seriesIndex, event)
    },
    [trackPointer, handleHoverEnter]
  )

  const handlePointLeave = useCallback(() => {
    setHoveredPoint(null)
    handleHoverLeave()
  }, [handleHoverLeave])

  const handleAreaMove = useCallback(
    (seriesIndex: number, event: React.MouseEvent<SVGPathElement>) => {
      if (!trackPointer) return
      const svg = event.currentTarget.ownerSVGElement
      if (!svg) return
      const ctm = event.currentTarget.getScreenCTM()
      if (!ctm) return
      const pt = svg.createSVGPoint()
      pt.x = event.clientX
      pt.y = event.clientY
      const loc = pt.matrixTransform(ctm.inverse())
      const axisPoints = laid.angles.map((angle) =>
        polarToCartesian(laid.cx, laid.cy, laid.radius, angle)
      )
      const pointIndex = findNearestPointIndex(axisPoints, loc.x, loc.y)
      if (pointIndex === null) return
      setHoveredPoint({ seriesIndex, pointIndex })
      handleHoverEnter(seriesIndex, event)
      handleMouseMove(event)
    },
    [trackPointer, laid.angles, laid.cx, laid.cy, laid.radius, handleHoverEnter, handleMouseMove]
  )

  const seriesName = (item: RadarChartSeries, index: number) =>
    item.name ?? defaultChartSeriesName(index, labels.seriesName)

  const tooltipContent = useMemo(() => {
    if (!hoveredPoint) return ''
    const seriesItem = laid.series[hoveredPoint.seriesIndex]
    const point = seriesItem?.points.find((item) => item.index === hoveredPoint.pointIndex)
    if (!point) return ''
    if (tooltipFormatter) {
      return tooltipFormatter(
        point.datum,
        hoveredPoint.seriesIndex,
        hoveredPoint.pointIndex,
        seriesItem.series
      )
    }
    return defaultRadarTooltipFormatter(
      point.datum,
      hoveredPoint.seriesIndex,
      hoveredPoint.pointIndex,
      seriesItem.series,
      labels.seriesName
    )
  }, [hoveredPoint, laid.series, tooltipFormatter, labels.seriesName])

  const legendItems = useMemo(
    () =>
      buildChartLegendItems<RadarChartSeries>({
        data: resolvedSeries,
        palette,
        activeIndex: resolvedActiveIndex,
        selectedIndex: resolvedSelectedIndex,
        getLabel: (item, index) =>
          legendFormatter ? legendFormatter(item, index) : seriesName(item, index),
        getColor: (item, index) => item.color ?? palette[index % palette.length]
      }),
    [
      resolvedSeries,
      palette,
      resolvedActiveIndex,
      resolvedSelectedIndex,
      legendFormatter,
      labels.seriesName
    ]
  )

  const dasharray = getChartGridLineDasharray(gridLineStyle)

  const handlePointKeyDown = (
    event: React.KeyboardEvent<SVGElement>,
    seriesIndex: number,
    pointIndex: number
  ) => {
    if (isChartNavigationKey(event.key)) {
      event.preventDefault()
      const next = nextChartPointRef({ seriesIndex, pointIndex }, event.key, flatPoints)
      if (!next) return
      setActivePoint(next)
      const node = event.currentTarget.ownerSVGElement?.querySelector(
        `[data-radar-point][data-series-index="${next.seriesIndex}"][data-point-index="${next.pointIndex}"]`
      )
      if (node instanceof SVGElement) node.focus()
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelectIndex(seriesIndex)
    }
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
      {(gradient || strokeGradient || pointGradient) && (
        <defs>
          {laid.series.map((item) => (
            <React.Fragment key={item.seriesKey}>
              {gradient && (
                <linearGradient
                  id={`${gradientPrefix}-${item.seriesKey}`}
                  gradientUnits="userSpaceOnUse"
                  x1={laid.cx}
                  y1={laid.cy - laid.radius}
                  x2={laid.cx}
                  y2={laid.cy + laid.radius}>
                  <stop offset="0%" stopColor={item.color} stopOpacity={item.fillOpacity} />
                  <stop
                    offset="100%"
                    stopColor={`color-mix(in oklab, var(--tiger-bg,#ffffff) 35%, ${item.color})`}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              )}
              {strokeGradient && (
                <linearGradient
                  id={`${gradientPrefix}-stroke-${item.seriesKey}`}
                  gradientUnits="userSpaceOnUse"
                  x1={laid.cx}
                  y1={laid.cy - laid.radius}
                  x2={laid.cx}
                  y2={laid.cy + laid.radius}>
                  <stop
                    offset="0%"
                    stopColor={`color-mix(in oklab, var(--tiger-bg,#ffffff) 20%, ${item.stroke})`}
                  />
                  <stop offset="50%" stopColor={item.stroke} />
                  <stop
                    offset="100%"
                    stopColor={`color-mix(in oklab, var(--tiger-text,#111827) 12%, ${item.stroke})`}
                  />
                </linearGradient>
              )}
              {pointGradient && (
                <radialGradient id={`${gradientPrefix}-point-${item.seriesKey}`}>
                  <stop
                    offset="0%"
                    stopColor={`color-mix(in oklab, var(--tiger-bg,#ffffff) 30%, ${item.color})`}
                  />
                  <stop offset="100%" stopColor={item.color} />
                </radialGradient>
              )}
            </React.Fragment>
          ))}
        </defs>
      )}
      {laid.splitAreas.map((area, index) => (
        <path
          key={`split-${index}`}
          d={area.d}
          fill={area.color}
          fillOpacity={splitAreaOpacity}
          fillRule="evenodd"
          stroke="none"
          data-radar-split-area="true"
          aria-hidden="true"
        />
      ))}
      {laid.grid.map((grid, index) =>
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
            aria-hidden="true"
          />
        ) : (
          <path
            key={`grid-${index}`}
            d={grid.d}
            className={chartGridLineClasses}
            fill="none"
            strokeWidth={gridStrokeWidth}
            strokeDasharray={dasharray}
            aria-hidden="true"
          />
        )
      )}
      {laid.axes.map((line, index) => (
        <line
          key={`axis-${index}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          className={chartGridLineClasses}
          strokeWidth={gridStrokeWidth}
          strokeDasharray={dasharray}
          aria-hidden="true"
        />
      ))}
      {laid.series.map((item) => {
        const showSeriesPoints = item.series.showPoints ?? showPoints
        const resolvedPointSize = item.series.pointSize ?? pointSize
        const resolvedPointColor = item.series.pointColor ?? pointColor ?? item.color
        return (
          <g
            key={item.seriesKey}
            data-series-type="radar"
            data-series-key={item.seriesKey}
            data-series-name={item.series.name}
            opacity={item.opacity}
            onMouseEnter={(e) => handleHoverEnter(item.seriesIndex, e)}
            onMouseLeave={handlePointLeave}
            onClick={() => handleSelectIndex(item.seriesIndex)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleSelectIndex(item.seriesIndex)
              }
            }}>
            {item.path ? (
              <path
                d={item.path}
                fill={item.fill}
                fillOpacity={gradient ? 1 : item.fillOpacity}
                stroke={
                  strokeGradient ? `url(#${gradientPrefix}-stroke-${item.seriesKey})` : item.stroke
                }
                strokeWidth={item.series.strokeWidth ?? strokeWidth}
                strokeLinejoin="round"
                className={classNames(
                  'motion-reduce:transition-none',
                  interactive && 'cursor-pointer'
                )}
                data-radar-area="true"
                data-series-index={item.seriesIndex}
                onMouseEnter={(e) => handleHoverEnter(item.seriesIndex, e)}
                onMouseMove={(e) => handleAreaMove(item.seriesIndex, e)}
                onMouseLeave={handlePointLeave}
                onClick={() => handleSelectIndex(item.seriesIndex)}
              />
            ) : null}
            {showSeriesPoints
              ? item.points.map((point) => {
                  const isHovered =
                    hoveredPoint?.seriesIndex === item.seriesIndex &&
                    hoveredPoint?.pointIndex === point.index
                  const currentSize = isHovered
                    ? (pointHoverSize ?? resolvedPointSize + 2)
                    : resolvedPointSize
                  return (
                    <circle
                      key={`point-${item.seriesKey}-${point.index}`}
                      cx={point.x}
                      cy={point.y}
                      r={currentSize}
                      fill={
                        pointGradient
                          ? `url(#${gradientPrefix}-point-${item.seriesKey})`
                          : (point.datum.color ?? resolvedPointColor)
                      }
                      stroke={item.series.pointBorderColor ?? pointBorderColor}
                      strokeWidth={item.series.pointBorderWidth ?? pointBorderWidth}
                      className="transition-[r] duration-150 ease-out motion-reduce:transition-none"
                      aria-hidden={focusable ? undefined : true}
                      tabIndex={
                        focusable
                          ? chartPointTabIndex(
                              item.seriesIndex,
                              point.index,
                              activePoint,
                              flatPoints
                            )
                          : undefined
                      }
                      role={focusable ? 'button' : undefined}
                      aria-label={
                        focusable
                          ? formatChartTemplate(labels.pointAriaLabel, {
                              index: point.index + 1,
                              x: seriesName(item.series, item.seriesIndex),
                              y: point.value
                            })
                          : undefined
                      }
                      data-radar-point="true"
                      data-series-index={item.seriesIndex}
                      data-point-index={point.index}
                      onMouseEnter={(e) => handlePointEnter(item.seriesIndex, point.index, e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handlePointLeave}
                      onFocus={(e) => handlePointEnter(item.seriesIndex, point.index, e)}
                      onClick={() => handleSelectIndex(item.seriesIndex)}
                      onKeyDown={(e) => handlePointKeyDown(e, item.seriesIndex, point.index)}
                    />
                  )
                })
              : item.points.map((point) => (
                  <circle
                    key={`hit-${item.seriesKey}-${point.index}`}
                    cx={point.x}
                    cy={point.y}
                    r={8}
                    fill="transparent"
                    aria-hidden="true"
                    tabIndex={
                      focusable
                        ? chartPointTabIndex(item.seriesIndex, point.index, activePoint, flatPoints)
                        : undefined
                    }
                    data-radar-point="true"
                    data-series-index={item.seriesIndex}
                    data-point-index={point.index}
                    onFocus={(e) => handlePointEnter(item.seriesIndex, point.index, e)}
                    onKeyDown={(e) => handlePointKeyDown(e, item.seriesIndex, point.index)}
                  />
                ))}
          </g>
        )
      })}
      {laid.labels.map((label, index) => (
        <text
          key={`label-${index}`}
          x={label.x}
          y={label.y}
          textAnchor={label.textAnchor}
          dominantBaseline={label.dominantBaseline}
          className={chartAxisTickTextClasses}
          aria-hidden="true">
          {label.text}
        </text>
      ))}
      {laid.levelLabels.map((label, index) => (
        <text
          key={`level-${index}`}
          x={label.x}
          y={label.y}
          className={chartAxisTickTextClasses}
          aria-hidden="true"
          data-radar-level-label="">
          {label.text}
        </text>
      ))}
    </ChartCanvas>
  )

  const tooltip = showTooltip && (
    <ChartTooltip
      content={tooltipContent}
      open={hoveredPoint !== null && tooltipContent !== ''}
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

export default RadarChart
