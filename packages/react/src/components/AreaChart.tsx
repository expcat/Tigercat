import React, { useId, useMemo, useState, useCallback } from 'react'
import {
  classNames,
  createLinearScale,
  createPointScale,
  getStableChartGradientPrefix,
  getNumberExtent,
  linePointTransitionClasses,
  stackSeriesData,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  DEFAULT_CHART_PADDING,
  buildChartSeriesKeys,
  resolveMultiSeriesTooltipContent,
  resolveSeriesData,
  defaultSeriesXYTooltipFormatter,
  defaultChartSeriesName,
  layoutAreaSeries,
  getCartesianChartShellClasses,
  findNearestSeriesPoint,
  flattenChartPoints,
  chartPointTabIndex,
  nextChartPointRef,
  isChartNavigationKey,
  isNumericChartDomain,
  CHART_SURFACE_FILL,
  AREA_DRAW_CLASS,
  getChartLabels,
  mergeTigerLocale,
  formatChartTemplate,
  type LineChartDatum,
  type AreaChartProps as CoreAreaChartProps,
  type AreaChartSeries,
  type ChartCurveType,
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
import { useResponsiveChartSize } from '../hooks/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface AreaChartProps extends CoreAreaChartProps {
  data?: LineChartDatum[]
  series?: AreaChartSeries[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSeriesClick?: (seriesIndex: number, series: AreaChartSeries) => void
  onSeriesHover?: (seriesIndex: number | null, series: AreaChartSeries | null) => void
  onPointClick?: (seriesIndex: number, pointIndex: number, datum: LineChartDatum) => void
  onPointHover?: (
    seriesIndex: number | null,
    pointIndex: number | null,
    datum: LineChartDatum | null
  ) => void
  gradient?: boolean
  animated?: boolean
  pointHollow?: boolean
  strokeGradient?: boolean
  pointGradient?: boolean
}

export const AreaChart: React.FC<AreaChartProps> = ({
  width = 320,
  height = 200,
  padding = DEFAULT_CHART_PADDING,
  responsive = false,
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
  gradient = false,
  animated = false,
  pointHollow = false,
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
  const config = useTigerConfig()
  const labels = useMemo(() => getChartLabels(mergeTigerLocale(config.locale)), [config.locale])
  // Point-level hover state (not managed by hook)
  const [hoveredPointInfo, setHoveredPointInfo] = useState<{
    seriesIndex: number
    pointIndex: number
  } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Unique gradient prefix for area fills
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('area', gradientId),
    [gradientId]
  )

  const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
    width,
    height,
    padding,
    responsive
  )

  const resolvedSeries = useMemo<AreaChartSeries[]>(
    () =>
      resolveSeriesData<LineChartDatum, AreaChartSeries>(series, data, {
        // Single-series colors (`areaColor`/`pointColor`) seed the synthesized
        // series so they take effect when only `data` is provided.
        color: areaColor,
        pointColor
      } as Partial<Omit<AreaChartSeries, 'data'>>),
    [series, data, areaColor, pointColor]
  )

  // Use shared interaction hook for series-level interaction
  const {
    activeIndex,
    resolvedSelectedIndex,
    handleMouseEnter: handleSeriesHoverEnter,
    handleMouseLeave: handleSeriesHoverLeave,
    handleClick: handleSeriesSelect,
    handleLegendClick,
    handleLegendHover,
    handleLegendLeave
  } = useChartInteraction<AreaChartSeries>({
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
    onClick: (index, series) => {
      if (series) onSeriesClick?.(index, series)
    }
  })

  const stackedData = useMemo(
    () => (stacked ? stackSeriesData(resolvedSeries.map((s) => s.data)) : null),
    [stacked, resolvedSeries]
  )
  const allData = useMemo(() => resolvedSeries.flatMap((s) => s.data), [resolvedSeries])
  const xValues = useMemo(() => allData.map((d) => d.x), [allData])

  const yValues = useMemo(() => {
    if (stackedData) {
      return stackedData.flatMap((series) => series.flatMap((item) => [item.y0, item.y1]))
    }
    return allData.map((d) => d.y)
  }, [stackedData, allData])

  const isXNumeric = useMemo(() => isNumericChartDomain(xValues), [xValues])

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
    const extent = getNumberExtent(yValues, { includeZero: includeZero || stacked })
    return createLinearScale(extent, [innerRect.height, 0])
  }, [yScaleProp, yValues, includeZero, stacked, innerRect.height])

  const shouldShowXAxis = showAxis && showXAxis
  const shouldShowYAxis = showAxis && showYAxis

  const palette = useMemo(() => resolveChartPalette(colors), [colors])
  const seriesKeys = useMemo(
    () => buildChartSeriesKeys(resolvedSeries, { prefix: 'area-' }),
    [resolvedSeries]
  )

  const seriesData = useMemo(() => {
    const laidOut = layoutAreaSeries(resolvedSeries, resolvedXScale, resolvedYScale, {
      curve: curve as ChartCurveType,
      palette,
      activeIndex,
      showArea: true,
      areaOpacity: fillOpacity,
      strokeWidth,
      showPoints,
      pointSize,
      pointColor,
      pointHollow,
      activeOpacity,
      inactiveOpacity,
      stacked,
      fillOpacity,
      stackedData: stackedData ?? undefined
    })
    return laidOut.map((item, seriesIndex) => ({
      ...item,
      seriesKey: seriesKeys[seriesIndex]
    }))
  }, [
    resolvedSeries,
    seriesKeys,
    palette,
    resolvedXScale,
    resolvedYScale,
    curve,
    stacked,
    stackedData,
    activeIndex,
    activeOpacity,
    inactiveOpacity,
    fillOpacity,
    strokeWidth,
    showPoints,
    pointSize,
    pointColor,
    pointHollow
  ])

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems<AreaChartSeries>({
        data: resolvedSeries,
        palette,
        activeIndex,
        selectedIndex: resolvedSelectedIndex,
        getLabel: (s, i) =>
          legendFormatter
            ? legendFormatter(s, i)
            : (s.name ?? defaultChartSeriesName(i, labels.seriesName)),
        getColor: (s, i) => s.color ?? palette[i % palette.length]
      }),
    [
      resolvedSeries,
      legendFormatter,
      palette,
      activeIndex,
      resolvedSelectedIndex,
      labels.seriesName
    ]
  )

  const tooltipContent = useMemo(
    () =>
      resolveMultiSeriesTooltipContent(
        hoveredPointInfo,
        resolvedSeries,
        tooltipFormatter,
        (datum, seriesIndex, pointIndex, s) =>
          defaultSeriesXYTooltipFormatter(datum, seriesIndex, pointIndex, s, labels.seriesName)
      ),
    [hoveredPointInfo, resolvedSeries, tooltipFormatter, labels.seriesName]
  )

  const handlePointMouseEnter = useCallback(
    (seriesIndex: number, pointIndex: number, event: React.MouseEvent) => {
      setHoveredPointInfo({ seriesIndex, pointIndex })
      setTooltipPosition({ x: event.clientX, y: event.clientY })
      if (hoverable) {
        onPointHover?.(seriesIndex, pointIndex, resolvedSeries[seriesIndex]?.data[pointIndex])
      }
    },
    [hoverable, onPointHover, resolvedSeries]
  )

  const handlePointMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }, [])

  const handlePointMouseLeave = useCallback(() => {
    setHoveredPointInfo(null)
    if (hoverable) {
      onPointHover?.(null, null, null)
    }
  }, [hoverable, onPointHover])

  // Keyboard/focus tooltip: synthesize a pointer position from the point's
  // on-screen rect so focused points show the same tooltip as hovered ones.
  const showPointTooltipFromElement = useCallback(
    (el: SVGGraphicsElement, seriesIndex: number, pointIndex: number) => {
      if (!(showTooltip || hoverable)) return
      const rect = el.getBoundingClientRect()
      setHoveredPointInfo({ seriesIndex, pointIndex })
      setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      onPointHover?.(seriesIndex, pointIndex, resolvedSeries[seriesIndex]?.data[pointIndex])
    },
    [hoverable, showTooltip, onPointHover, resolvedSeries]
  )

  const handlePointClick = useCallback(
    (seriesIndex: number, pointIndex: number) => {
      onPointClick?.(seriesIndex, pointIndex, resolvedSeries[seriesIndex]?.data[pointIndex])
      handleSeriesSelect(seriesIndex)
    },
    [onPointClick, resolvedSeries, handleSeriesSelect]
  )

  const pointClickable = Boolean(onPointClick)
  const trackPointHover = showTooltip || hoverable
  const flatPoints = useMemo(() => flattenChartPoints(seriesData), [seriesData])

  // Reverse for proper stacking visual
  const reversedSeriesData = useMemo(() => [...seriesData].reverse(), [seriesData])

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
          {gradient &&
            reversedSeriesData.map((sd) => (
              <linearGradient
                key={`area-grad-${sd.seriesKey}`}
                id={`${gradientPrefix}-${sd.seriesKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1">
                <stop offset="0%" stopColor={sd.fillColor} stopOpacity={sd.fillOpacity} />
                <stop offset="100%" stopColor={sd.fillColor} stopOpacity={0.02} />
              </linearGradient>
            ))}
          {pointGradient &&
            reversedSeriesData.map((sd) => (
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
            reversedSeriesData.map((sd) => (
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
      {trackPointHover ? (
        <rect
          width={innerRect.width}
          height={innerRect.height}
          fill="transparent"
          data-plot-hit=""
          onMouseMove={(event) => {
            const target = event.currentTarget
            const rect = target.getBoundingClientRect()
            const width = rect.width || innerRect.width
            const height = rect.height || innerRect.height
            if (width === 0 || height === 0) return
            const x = ((event.clientX - rect.left) / width) * innerRect.width
            const y = ((event.clientY - rect.top) / height) * innerRect.height
            const nearest = findNearestSeriesPoint(
              seriesData.map((sd) => sd.points),
              x,
              y
            )
            if (!nearest) return
            setHoveredPointInfo(nearest)
            setTooltipPosition({ x: event.clientX, y: event.clientY })
          }}
          onMouseLeave={handlePointMouseLeave}
        />
      ) : null}
      {reversedSeriesData.map((sd) => {
        const canAnimateStroke = animated && !sd.strokeDasharray
        return (
          <ChartSeries
            key={sd.seriesKey}
            data={sd.series.data}
            name={sd.series.name}
            type="area"
            opacity={sd.opacity}
            data-series-key={sd.seriesKey}
            className={classNames(
              sd.series.className,
              (hoverable || selectable) && 'cursor-pointer',
              'outline-none'
            )}
            onMouseEnter={(e: React.MouseEvent) => handleSeriesHoverEnter(sd.seriesIndex, e)}
            onMouseLeave={handleSeriesHoverLeave}
            onClick={() => handleSeriesSelect(sd.seriesIndex)}>
            <path
              d={sd.areaPath}
              fill={gradient ? `url(#${gradientPrefix}-${sd.seriesKey})` : sd.fillColor}
              fillOpacity={gradient ? 1 : sd.fillOpacity}
              stroke="none"
              className="transition-opacity motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base,200ms)]"
              data-area-series={sd.seriesIndex}
              data-series-key={sd.seriesKey}
            />
            <path
              d={sd.linePath}
              fill="none"
              stroke={strokeGradient ? `url(#${gradientPrefix}-stroke-${sd.seriesKey})` : sd.color}
              strokeWidth={sd.strokeWidth}
              strokeDasharray={sd.strokeDasharray}
              strokeDashoffset={canAnimateStroke ? '1' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={canAnimateStroke ? 1 : undefined}
              className={classNames(
                canAnimateStroke
                  ? AREA_DRAW_CLASS
                  : 'transition-opacity motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base,200ms)]'
              )}
            />
          </ChartSeries>
        )
      })}
      {/* Layer 2: data points on top of all areas (prevents coverage) */}
      {seriesData.map(
        (sd) =>
          sd.showPoints && (
            <g key={`points-${sd.seriesKey}`} opacity={sd.opacity} data-series-key={sd.seriesKey}>
              {sd.points.map((point) => {
                const isHovered =
                  hoveredPointInfo?.seriesIndex === sd.seriesIndex &&
                  hoveredPointInfo?.pointIndex === point.pointIndex
                const hoverSize = sd.pointSize + 2
                const datum = point.datum
                const pointInteractive = hoverable || selectable || pointClickable
                return (
                  <circle
                    key={`point-${sd.seriesKey}-${point.pointIndex}`}
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? hoverSize : sd.pointSize}
                    fill={
                      sd.pointHollow
                        ? CHART_SURFACE_FILL
                        : pointGradient
                          ? `url(#${gradientPrefix}-point-${sd.seriesKey})`
                          : sd.pointColor
                    }
                    stroke={sd.pointHollow ? sd.pointColor : 'none'}
                    strokeWidth={sd.pointHollow ? 2 : 0}
                    className={classNames(
                      animated ? linePointTransitionClasses : undefined,
                      pointInteractive && 'cursor-pointer'
                    )}
                    style={isHovered ? { filter: `drop-shadow(0 0 4px ${sd.color})` } : undefined}
                    role={pointInteractive ? 'button' : undefined}
                    aria-hidden={pointInteractive ? undefined : true}
                    aria-label={
                      pointInteractive
                        ? (datum?.label ??
                          formatChartTemplate(labels.pointAriaLabel, {
                            index: point.pointIndex + 1,
                            x: String(datum?.x ?? ''),
                            y: String(datum?.y ?? '')
                          }))
                        : undefined
                    }
                    tabIndex={
                      pointInteractive
                        ? chartPointTabIndex(
                            sd.seriesIndex,
                            point.pointIndex,
                            hoveredPointInfo,
                            flatPoints
                          )
                        : undefined
                    }
                    data-point-index={point.pointIndex}
                    data-series-key={sd.seriesKey}
                    onMouseEnter={
                      trackPointHover
                        ? (e) => handlePointMouseEnter(sd.seriesIndex, point.pointIndex, e)
                        : undefined
                    }
                    onMouseMove={trackPointHover ? handlePointMouseMove : undefined}
                    onMouseLeave={trackPointHover ? handlePointMouseLeave : undefined}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePointClick(sd.seriesIndex, point.pointIndex)
                    }}
                    onFocus={
                      trackPointHover
                        ? (e) =>
                            showPointTooltipFromElement(
                              e.currentTarget,
                              sd.seriesIndex,
                              point.pointIndex
                            )
                        : undefined
                    }
                    onBlur={trackPointHover ? handlePointMouseLeave : undefined}
                    onKeyDown={
                      pointInteractive
                        ? (e) => {
                            if (isChartNavigationKey(e.key)) {
                              e.preventDefault()
                              const next = nextChartPointRef(
                                { seriesIndex: sd.seriesIndex, pointIndex: point.pointIndex },
                                e.key,
                                flatPoints
                              )
                              if (!next) return
                              const node = e.currentTarget.ownerSVGElement?.querySelector(
                                `[data-series-key="${seriesKeys[next.seriesIndex]}"][data-point-index="${next.pointIndex}"]`
                              )
                              if (node instanceof SVGElement) node.focus()
                              return
                            }
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
                            } else if (e.key === 'Escape' && trackPointHover) {
                              handlePointMouseLeave()
                            }
                          }
                        : undefined
                    }
                  />
                )
              })}
            </g>
          )
      )}
    </ChartCanvas>
  )

  const tooltip = showTooltip && (
    <ChartTooltip
      content={tooltipContent}
      open={hoveredPointInfo !== null && tooltipContent !== ''}
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

export default AreaChart
