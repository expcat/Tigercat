import React, { useId, useMemo, useState, useCallback } from 'react'
import {
  classNames,
  createAreaPath,
  createLinearScale,
  createLinePath,
  createPointScale,
  getChartElementOpacity,
  getChartInnerRect,
  getStableChartGradientPrefix,
  getNumberExtent,
  linePointTransitionClasses,
  resolveChartPalette,
  buildChartLegendItems,
  buildChartSeriesKeys,
  resolveMultiSeriesTooltipContent,
  resolveSeriesData,
  defaultSeriesXYTooltipFormatter,
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
  lineColor = 'var(--tiger-primary,#2563eb)',
  strokeWidth = 2,
  curve = 'linear',
  showPoints = true,
  pointSize = 4,
  pointColor,
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
  showArea = false,
  areaOpacity = 0.15,
  pointHollow = false,
  animated = false,
  strokeGradient = false,
  pointGradient = false,
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

  // Unique gradient prefix for area fills
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('line', gradientId),
    [gradientId]
  )

  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )

  const resolvedSeries = useMemo<LineChartSeries[]>(
    () =>
      resolveSeriesData<LineChartDatum, LineChartSeries>(series, data, {
        // Single-series colors (`lineColor`/`pointColor`) seed the synthesized
        // series so they take effect when only `data` is provided.
        color: lineColor,
        pointColor
      } as Partial<Omit<LineChartSeries, 'data'>>),
    [series, data, lineColor, pointColor]
  )

  // Use shared interaction hook for series-level interaction
  const {
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
      return createPointScale(categories, [0, innerRect.width], { padding: 0 })
    }
  }, [xScaleProp, isXNumeric, xValues, innerRect.width])

  const resolvedYScale = useMemo(() => {
    if (yScaleProp) return yScaleProp
    const extent = getNumberExtent(yValues, { includeZero })
    return createLinearScale(extent, [innerRect.height, 0])
  }, [yScaleProp, yValues, includeZero, innerRect.height])

  const shouldShowXAxis = showAxis && showXAxis
  const shouldShowYAxis = showAxis && showYAxis

  const palette = useMemo(() => resolveChartPalette(colors), [colors])
  const seriesKeys = useMemo(
    () => buildChartSeriesKeys(resolvedSeries, { prefix: 'line-' }),
    [resolvedSeries]
  )

  const seriesData = useMemo(
    () =>
      resolvedSeries.map((s, seriesIndex) => {
        const seriesKey = seriesKeys[seriesIndex]
        const color = s.color ?? palette[seriesIndex % palette.length]
        const points = s.data.map((datum, pointIndex) => ({
          x: resolvedXScale.map(datum.x),
          y: resolvedYScale.map(datum.y),
          datum,
          pointIndex
        }))
        const linePath = createLinePath(points, curve as ChartCurveType)
        const seriesShowArea = s.showArea ?? showArea
        const areaPath = seriesShowArea
          ? createAreaPath(points, innerRect.height, curve as ChartCurveType)
          : ''
        const opacity = getChartElementOpacity(seriesIndex, activeIndex, {
          activeOpacity,
          inactiveOpacity
        })

        return {
          series: s,
          seriesIndex,
          seriesKey,
          color,
          linePath,
          areaPath,
          showArea: seriesShowArea,
          areaOpacity: s.areaOpacity ?? areaOpacity,
          points,
          opacity,
          strokeWidth: s.strokeWidth ?? strokeWidth,
          strokeDasharray: s.strokeDasharray,
          showPoints: s.showPoints ?? showPoints,
          pointSize: s.pointSize ?? pointSize,
          pointColor: s.pointColor ?? color,
          pointHollow: s.pointHollow ?? pointHollow
        }
      }),
    [
      resolvedSeries,
      seriesKeys,
      palette,
      resolvedXScale,
      resolvedYScale,
      curve,
      activeIndex,
      activeOpacity,
      inactiveOpacity,
      strokeWidth,
      showPoints,
      pointSize,
      showArea,
      areaOpacity,
      pointHollow,
      innerRect.height
    ]
  )

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems<LineChartSeries>({
        data: resolvedSeries,
        palette,
        activeIndex,
        getLabel: (s, i) =>
          legendFormatter ? legendFormatter(s, i) : (s.name ?? `Series ${i + 1}`),
        getColor: (s, i) => s.color ?? palette[i % palette.length]
      }),
    [resolvedSeries, legendFormatter, palette, activeIndex]
  )

  const tooltipContent = useMemo(
    () =>
      resolveMultiSeriesTooltipContent(
        hoveredPointInfo,
        resolvedSeries,
        tooltipFormatter,
        defaultSeriesXYTooltipFormatter
      ),
    [hoveredPointInfo, resolvedSeries, tooltipFormatter]
  )

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

  // Keyboard/focus tooltip: synthesize a pointer position from the point's
  // on-screen rect so focused points show the same tooltip as hovered ones.
  const showPointTooltipFromElement = useCallback(
    (el: SVGGraphicsElement, seriesIndex: number, pointIndex: number) => {
      if (!hoverable) return
      const rect = el.getBoundingClientRect()
      setHoveredPointInfo({ seriesIndex, pointIndex })
      setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      onPointHover?.(seriesIndex, pointIndex, resolvedSeries[seriesIndex]?.data[pointIndex])
    },
    [hoverable, onPointHover, resolvedSeries]
  )

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

  // Point-level interaction is gated: hover/tooltip on `hoverable`, click on
  // `selectable` or an explicit point-click callback (C26-2).
  const pointClickable = selectable || !!onPointClick

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      title={title}
      desc={desc}
      className={classNames(className)}>
      {/* Gradient defs and animation styles */}
      {(seriesData.some((sd) => sd.showArea) || animated || strokeGradient || pointGradient) && (
        <defs>
          {animated && (
            <style>{`
              .tiger-line-animated {
                animation: tiger-line-draw var(--tiger-motion-duration-slow,1.2s) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)) forwards;
              }
              @keyframes tiger-line-draw {
                from { stroke-dashoffset: 1; }
                to { stroke-dashoffset: 0; }
              }
              @media (prefers-reduced-motion: reduce) {
                .tiger-line-animated { animation-duration: 0ms; }
              }
            `}</style>
          )}
          {seriesData
            .filter((sd) => sd.showArea)
            .map((sd) => (
              <linearGradient
                key={`area-grad-${sd.seriesKey}`}
                id={`${gradientPrefix}-${sd.seriesKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1">
                <stop offset="0%" stopColor={sd.color} stopOpacity={sd.areaOpacity} />
                <stop offset="100%" stopColor={sd.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          {pointGradient &&
            seriesData.map((sd) => (
              <radialGradient
                key={`point-grad-${sd.seriesKey}`}
                id={`${gradientPrefix}-point-${sd.seriesKey}`}
                cx="0.5"
                cy="0.5"
                r="0.5">
                <stop offset="0%" stopColor={`color-mix(in oklab, ${sd.color} 100%, white 30%)`} />
                <stop offset="70%" stopColor={sd.color} />
                <stop
                  offset="100%"
                  stopColor={`color-mix(in oklab, ${sd.color} 100%, black 12%)`}
                />
              </radialGradient>
            ))}
          {strokeGradient &&
            seriesData.map((sd) => (
              <linearGradient
                key={`stroke-grad-${sd.seriesKey}`}
                id={`${gradientPrefix}-stroke-${sd.seriesKey}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0">
                <stop offset="0%" stopColor={`color-mix(in oklab, ${sd.color} 100%, white 12%)`} />
                <stop offset="50%" stopColor={sd.color} />
                <stop offset="100%" stopColor={`color-mix(in oklab, ${sd.color} 100%, black 8%)`} />
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
      {seriesData.map((sd) => (
        <ChartSeries
          key={sd.seriesKey}
          data={sd.series.data}
          name={sd.series.name}
          type="line"
          opacity={sd.opacity}
          data-series-key={sd.seriesKey}
          className={classNames(sd.series.className, (hoverable || selectable) && 'cursor-pointer')}
          onMouseEnter={(e: React.MouseEvent) => handleSeriesHoverEnter(sd.seriesIndex, e)}
          onMouseLeave={handleSeriesHoverLeave}
          onClick={() => handleSeriesSelect(sd.seriesIndex)}
          tabIndex={selectable ? 0 : undefined}
          onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, sd.seriesIndex)}>
          {/* Area fill path */}
          {sd.showArea && sd.areaPath && (
            <path
              d={sd.areaPath}
              fill={`url(#${gradientPrefix}-${sd.seriesKey})`}
              stroke="none"
              className="transition-opacity duration-300"
              data-area-series={sd.seriesIndex}
              data-series-key={sd.seriesKey}
            />
          )}
          <path
            d={sd.linePath}
            fill="none"
            stroke={strokeGradient ? `url(#${gradientPrefix}-stroke-${sd.seriesKey})` : sd.color}
            strokeWidth={sd.strokeWidth}
            strokeDasharray={animated ? (sd.strokeDasharray ?? '1') : sd.strokeDasharray}
            strokeDashoffset={animated ? '1' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={animated ? 1 : undefined}
            className={classNames(
              'transition-opacity [transition-duration:var(--tiger-motion-duration-base,200ms)]',
              animated && 'tiger-line-animated'
            )}
            data-line-series={sd.seriesIndex}
            data-series-key={sd.seriesKey}
          />
          {sd.showPoints &&
            sd.points.map((point) => {
              const isHovered =
                hoveredPointInfo?.seriesIndex === sd.seriesIndex &&
                hoveredPointInfo?.pointIndex === point.pointIndex
              const hoverSize = sd.pointSize + 2
              const datum = resolvedSeries[sd.seriesIndex]?.data?.[point.pointIndex]
              const pointInteractive = hoverable || pointClickable
              return (
                <circle
                  key={`point-${sd.seriesKey}-${point.pointIndex}`}
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? hoverSize : sd.pointSize}
                  fill={
                    sd.pointHollow
                      ? 'white'
                      : pointGradient
                        ? `url(#${gradientPrefix}-point-${sd.seriesKey})`
                        : sd.pointColor
                  }
                  stroke={sd.pointHollow ? sd.pointColor : 'none'}
                  strokeWidth={sd.pointHollow ? 2 : 0}
                  className={classNames(
                    linePointTransitionClasses,
                    pointInteractive && 'cursor-pointer'
                  )}
                  style={isHovered ? { filter: `drop-shadow(0 0 4px ${sd.color})` } : undefined}
                  role={pointInteractive ? 'button' : 'img'}
                  aria-label={datum?.label ?? String(datum?.y ?? '')}
                  tabIndex={pointInteractive ? 0 : undefined}
                  data-point-index={point.pointIndex}
                  data-series-key={sd.seriesKey}
                  onMouseEnter={
                    hoverable
                      ? (e) => handlePointMouseEnter(sd.seriesIndex, point.pointIndex, e)
                      : undefined
                  }
                  onMouseMove={hoverable ? handlePointMouseMove : undefined}
                  onMouseLeave={hoverable ? handlePointMouseLeave : undefined}
                  onClick={
                    pointClickable
                      ? (e) => {
                          e.stopPropagation()
                          handlePointClick(sd.seriesIndex, point.pointIndex)
                        }
                      : undefined
                  }
                  onFocus={
                    hoverable
                      ? (e) =>
                          showPointTooltipFromElement(
                            e.currentTarget,
                            sd.seriesIndex,
                            point.pointIndex
                          )
                      : undefined
                  }
                  onBlur={hoverable ? handlePointMouseLeave : undefined}
                  onKeyDown={
                    pointInteractive
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            if (pointClickable) {
                              handlePointClick(sd.seriesIndex, point.pointIndex)
                            } else {
                              showPointTooltipFromElement(
                                e.currentTarget,
                                sd.seriesIndex,
                                point.pointIndex
                              )
                            }
                          } else if (e.key === 'Escape' && hoverable) {
                            handlePointMouseLeave()
                          }
                        }
                      : undefined
                  }
                />
              )
            })}
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
