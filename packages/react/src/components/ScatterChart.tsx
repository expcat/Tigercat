import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import {
  classNames,
  createLinearScale,
  getChartElementOpacity,
  getChartInnerRect,
  getNumberExtent,
  getScatterGradientPrefix,
  getScatterHoverShadow,
  getScatterHoverSize,
  getScatterPointPath,
  scatterPointTransitionClasses,
  SCATTER_ENTRANCE_KEYFRAMES,
  SCATTER_ENTRANCE_CLASS,
  resolveChartPalette,
  buildChartLegendItems,
  resolveChartTooltipContent,
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
  pointSize = 6,
  pointColor = 'var(--tiger-primary,#2563eb)',
  pointOpacity,
  pointStyle = 'circle',
  gradient = false,
  animated = false,
  pointBorderWidth = 0,
  pointBorderColor = 'white',
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
  className
}) => {
  const gradientPrefixRef = useRef(getScatterGradientPrefix())
  const gradientPrefix = gradientPrefixRef.current
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (animated) setMounted(true)
  }, [animated])

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
    callbacks: { onClick: onPointClick }
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

  const palette = useMemo(() => resolveChartPalette(colors, pointColor), [colors, pointColor])

  const points = useMemo(
    () =>
      data.map((item, index) => {
        const color = item.color ?? palette[index % palette.length]
        const opacity = getChartElementOpacity(index, activeIndex, {
          activeOpacity,
          inactiveOpacity
        })
        const isHovered = resolvedHoveredIndex === index
        const baseSize = item.size ?? pointSize
        const r = isHovered ? getScatterHoverSize(baseSize) : baseSize

        return {
          cx: resolvedXScale.map(item.x),
          cy: resolvedYScale.map(item.y),
          r,
          baseSize,
          color,
          opacity: pointOpacity ?? opacity,
          isHovered,
          datum: item
        }
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
      pointOpacity
    ]
  )

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      buildChartLegendItems({
        data,
        palette,
        activeIndex,
        getLabel: (d, i) =>
          legendFormatter ? legendFormatter(d, i) : (d.label ?? `(${d.x}, ${d.y})`),
        getColor: (d, i) => d.color ?? palette[i % palette.length]
      }),
    [data, legendFormatter, palette, activeIndex]
  )

  const tooltipContent = useMemo(
    () =>
      resolveChartTooltipContent(resolvedHoveredIndex, data, tooltipFormatter, (datum, index) => {
        const label = datum.label ?? `Point ${index + 1}`
        return `${label}: (${datum.x}, ${datum.y})`
      }),
    [resolvedHoveredIndex, data, tooltipFormatter]
  )

  const shouldShowXAxis = showAxis && showXAxis
  const shouldShowYAxis = showAxis && showYAxis
  const interactive = hoverable || selectable

  const chart = (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      title={title}
      desc={desc}
      className={classNames(className)}>
      {/* Radial gradient defs */}
      {gradient && (
        <defs>
          {palette.map((color, i) => (
            <radialGradient
              key={`grad-${i}`}
              id={`${gradientPrefix}-${i}`}
              cx="35%"
              cy="35%"
              r="65%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.5} />
              <stop offset="50%" stopColor={color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </radialGradient>
          ))}
        </defs>
      )}
      {/* Animation keyframes */}
      {animated && mounted && <style>{SCATTER_ENTRANCE_KEYFRAMES}</style>}
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
        {points.map((point, index) => {
          const paletteIdx = index % palette.length
          const fill = gradient ? `url(#${gradientPrefix}-${paletteIdx})` : point.color

          const filterStyle = point.isHovered ? getScatterHoverShadow(point.color) : undefined

          const animDelay = animated && mounted ? `${index * 60}ms` : undefined

          const styleObj: React.CSSProperties = {
            ...(filterStyle ? { filter: filterStyle } : {}),
            ...(animDelay
              ? {
                  animation: `${SCATTER_ENTRANCE_CLASS} 500ms cubic-bezier(.34,1.56,.64,1) ${animDelay} both`
                }
              : {})
          }

          const sharedProps = {
            fill,
            opacity: point.opacity,
            stroke: pointBorderColor,
            strokeWidth: pointBorderWidth,
            className: classNames(scatterPointTransitionClasses, interactive && 'cursor-pointer'),
            style: Object.keys(styleObj).length > 0 ? styleObj : undefined,
            tabIndex: selectable ? 0 : undefined,
            role: selectable ? 'button' : ('img' as const),
            'aria-label':
              point.datum.label ?? `Point ${index + 1}: (${point.datum.x}, ${point.datum.y})`,
            'data-point-index': index,
            onMouseEnter: (e: React.MouseEvent) => handleMouseEnter(index, e),
            onMouseMove: handleMouseMove,
            onMouseLeave: handleMouseLeave,
            onClick: () => handleClick(index),
            onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index)
          }

          if (pointStyle === 'circle') {
            return (
              <circle
                key={`point-${index}`}
                cx={point.cx}
                cy={point.cy}
                r={point.r}
                {...sharedProps}
              />
            )
          }

          return (
            <path
              key={`point-${index}`}
              d={getScatterPointPath(pointStyle, point.r)}
              transform={`translate(${point.cx},${point.cy})`}
              {...sharedProps}
            />
          )
        })}
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
        interactive={interactive}
        onItemClick={handleLegendClick}
        onItemHover={handleLegendHover}
        onItemLeave={handleLegendLeave}
      />
      {tooltip}
    </div>
  )
}

export default ScatterChart
