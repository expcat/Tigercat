import React, { useId, useMemo, useState, useEffect } from 'react'
import {
  classNames,
  createLinearScale,
  getNumberExtent,
  getStableChartGradientPrefix,
  getScatterHoverShadow,
  scatterPointTransitionClasses,
  SCATTER_ENTRANCE_CLASS,
  layoutScatterPoints,
  getCartesianChartShellClasses,
  chartMarkTabIndex,
  nextChartRovingIndex,
  isChartNavigationKey,
  CHART_SURFACE_FILL,
  SCATTER_ENTRANCE_STAGGER_MS,
  SCATTER_ENTRANCE_STAGGER_MAX_MS,
  formatChartTemplate,
  scatterPointDisplayLabel,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  DEFAULT_CHART_PADDING,
  resolveChartTooltipContent,
  mergeTigerLocale,
  getChartLabels,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type ChartScale,
  type ScatterChartDatum,
  type ScatterChartProps as CoreScatterChartProps,
  type TigerLocale,
  type TigerLocaleChart
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
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleChart>
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  width = 320,
  height = 200,
  padding = DEFAULT_CHART_PADDING,
  responsive = false,
  data,
  xScale,
  yScale,
  pointSize = 6,
  pointColor = 'var(--tiger-primary,#2563eb)',
  pointOpacity,
  pointStyle = 'circle',
  gradient = false,
  animated = false,
  pointBorderWidth = 0,
  pointBorderColor = CHART_SURFACE_FILL,
  sizeScale = false,
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
  // Interaction
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
  // Legend
  showLegend = false,
  legendPosition = 'bottom',
  legendMarkerSize = 10,
  legendGap = 8,
  legendFormatter,
  // Tooltip
  showTooltip = true,
  tooltipFormatter,
  // Other
  colors,
  title,
  desc,
  locale,
  labels: labelsOverride,
  className
}) => {
  const config = useTigerConfig()
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('scatter', gradientId),
    [gradientId]
  )
  const [mounted, setMounted] = useState(false)
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getChartLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )

  useEffect(() => {
    if (animated) setMounted(true)
  }, [animated])

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
  } = useChartInteraction<ScatterChartDatum>({
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
      onPointHover?.(index, index !== null ? data[index] : null)
    },
    onSelectedIndexChange,
    onClick: onPointClick
  })

  const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
    width,
    height,
    padding,
    responsive
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

  const palette = useMemo(() => resolveChartPalette(colors, pointColor), [colors, pointColor])

  const points = useMemo(
    () =>
      layoutScatterPoints(data, resolvedXScale, resolvedYScale, {
        pointSize,
        pointStyle,
        palette,
        activeIndex,
        hoveredIndex: resolvedHoveredIndex,
        gradient,
        gradientPrefix,
        sizeScale,
        pointOpacity,
        activeOpacity,
        inactiveOpacity
      }),
    [
      data,
      palette,
      activeIndex,
      activeOpacity,
      inactiveOpacity,
      resolvedHoveredIndex,
      resolvedXScale,
      resolvedYScale,
      pointSize,
      pointStyle,
      pointOpacity,
      gradient,
      gradientPrefix,
      sizeScale
    ]
  )

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems({
        data,
        palette,
        activeIndex,
        selectedIndex: resolvedSelectedIndex,
        getLabel: (d, i) =>
          legendFormatter
            ? legendFormatter(d, i)
            : scatterPointDisplayLabel(d, i, labels.pointAriaLabel),
        getColor: (d, i) => d.color ?? palette[i % palette.length]
      }),
    [data, legendFormatter, palette, activeIndex, resolvedSelectedIndex, labels.pointAriaLabel]
  )

  const tooltipContent = useMemo(
    () =>
      resolveChartTooltipContent(resolvedHoveredIndex, data, tooltipFormatter, (datum, index) =>
        formatChartTemplate(labels.pointAriaLabel, {
          index: index + 1,
          x: datum.x,
          y: datum.y
        })
      ),
    [resolvedHoveredIndex, data, tooltipFormatter, labels.pointAriaLabel]
  )

  const shouldShowXAxis = showAxis && showXAxis
  const shouldShowYAxis = showAxis && showYAxis
  const interactive = hoverable || selectable || Boolean(onPointClick)

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      responsive={responsive}
      title={title}
      desc={desc}
      onResolvedSizeChange={onResolvedSizeChange}>
      {gradient && (
        <defs>
          {points.map((point) => (
            <radialGradient
              key={`grad-${point.index}`}
              id={`${gradientPrefix}-${point.index}`}
              cx="35%"
              cy="35%"
              r="65%">
              <stop offset="0%" stopColor={CHART_SURFACE_FILL} stopOpacity={0.5} />
              <stop offset="50%" stopColor={point.color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={point.color} stopOpacity={1} />
            </radialGradient>
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
      <ChartSeries data={data} type="scatter">
        {points.map((point, visualIndex) => {
          const filterStyle = point.isHovered ? getScatterHoverShadow(point.color) : undefined
          const animDelay =
            animated && mounted
              ? `${Math.min(visualIndex * SCATTER_ENTRANCE_STAGGER_MS, SCATTER_ENTRANCE_STAGGER_MAX_MS)}ms`
              : undefined
          const visualActive = points.findIndex((item) => item.index === (activeIndex ?? 0))
          const sharedProps = {
            fill: point.fill,
            opacity: point.opacity,
            stroke: pointBorderColor,
            strokeWidth: pointBorderWidth,
            className: classNames(
              animated ? scatterPointTransitionClasses : undefined,
              animDelay && SCATTER_ENTRANCE_CLASS,
              interactive && 'cursor-pointer'
            ),
            style: {
              ...(filterStyle ? { filter: filterStyle } : {}),
              ...(animDelay ? { animationDelay: animDelay } : {})
            } as React.CSSProperties,
            tabIndex: interactive
              ? chartMarkTabIndex(visualIndex, visualActive < 0 ? 0 : visualActive)
              : undefined,
            role: interactive ? ('button' as const) : undefined,
            'aria-hidden': interactive ? undefined : true,
            'aria-label': interactive
              ? (point.datum.label ??
                formatChartTemplate(labels.pointAriaLabel, {
                  index: point.index + 1,
                  x: point.datum.x,
                  y: point.datum.y
                }))
              : undefined,
            'data-point-index': point.index,
            onMouseEnter: (e: React.MouseEvent) => handleMouseEnter(point.index, e),
            onMouseMove: handleMouseMove,
            onMouseLeave: handleMouseLeave,
            onClick: () => handleClick(point.index),
            onKeyDown: (e: React.KeyboardEvent) => {
              if (isChartNavigationKey(e.key)) {
                e.preventDefault()
                const nextVisual = nextChartRovingIndex(visualIndex, e.key, points.length)
                const next = points[nextVisual]
                const node = (e.currentTarget as SVGElement).parentElement?.querySelector(
                  `[data-point-index="${next.index}"]`
                )
                if (node instanceof SVGElement) node.focus()
                handleMouseEnter(next.index, e)
                return
              }
              handleKeyDown(e, point.index)
            }
          }

          if (pointStyle === 'circle') {
            return (
              <circle
                key={`point-${point.index}`}
                cx={point.cx}
                cy={point.cy}
                r={point.r}
                {...sharedProps}
              />
            )
          }

          return (
            <g key={`point-${point.index}`} transform={`translate(${point.cx},${point.cy})`}>
              <path d={point.d} {...sharedProps} />
            </g>
          )
        })}
      </ChartSeries>
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
      })}>
      {chart}
      {showLegend ? (
        <ChartLegend
          items={legendItems}
          orientation={chartLegendOrientationFromPosition(legendPosition)}
          markerSize={legendMarkerSize}
          gap={legendGap}
          ariaLabel={labels.legendAriaLabel}
          interactive={interactive}
          onItemClick={handleLegendClick}
          onItemHover={handleLegendHover}
          onItemLeave={handleLegendLeave}
        />
      ) : null}
      {tooltip}
    </div>
  )
}

export default ScatterChart
