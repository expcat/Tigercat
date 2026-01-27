import React, { useMemo, useState, useCallback } from 'react'
import {
  classNames,
  createBandScale,
  createLinearScale,
  DEFAULT_CHART_COLORS,
  getChartElementOpacity,
  getChartInnerRect,
  getNumberExtent,
  type BarChartDatum,
  type BarChartProps as CoreBarChartProps,
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

export interface BarChartProps extends CoreBarChartProps {
  data: BarChartDatum[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onBarClick?: (index: number, datum: BarChartDatum) => void
  onBarHover?: (index: number | null, datum: BarChartDatum | null) => void
}

export const BarChart: React.FC<BarChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  xScale,
  yScale,
  barColor = 'var(--tiger-primary,#2563eb)',
  barRadius = 4,
  barPaddingInner = 0.2,
  barPaddingOuter = 0.1,
  showGrid = true,
  showAxis = true,
  showXAxis = true,
  showYAxis = true,
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
  onBarClick,
  onBarHover
}) => {
  const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(null)
  const [localSelectedIndex, setLocalSelectedIndex] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )
  const xDomain = useMemo(() => data.map((item) => String(item.x)), [data])
  const yValues = useMemo(() => data.map((item) => item.y), [data])

  const resolvedXScale = useMemo(() => {
    if (xScale) return xScale
    return createBandScale(xDomain, [0, innerRect.width], {
      paddingInner: barPaddingInner,
      paddingOuter: barPaddingOuter
    })
  }, [xScale, xDomain, innerRect.width, barPaddingInner, barPaddingOuter])

  const resolvedYScale = useMemo(() => {
    if (yScale) return yScale
    const extent = getNumberExtent(yValues, { includeZero: true })
    return createLinearScale(extent, [innerRect.height, 0])
  }, [yScale, yValues, innerRect.height])

  const palette = useMemo(
    () =>
      colors && colors.length > 0 ? colors : barColor ? [barColor] : [...DEFAULT_CHART_COLORS],
    [colors, barColor]
  )

  const resolvedHoveredIndex = hoveredIndexProp !== undefined ? hoveredIndexProp : localHoveredIndex
  const resolvedSelectedIndex =
    selectedIndexProp !== undefined ? selectedIndexProp : localSelectedIndex

  const activeIndex = useMemo(() => {
    if (resolvedSelectedIndex !== null) return resolvedSelectedIndex
    if (hoverable && resolvedHoveredIndex !== null) return resolvedHoveredIndex
    return null
  }, [resolvedSelectedIndex, hoverable, resolvedHoveredIndex])

  const bars = useMemo(() => {
    const scale = resolvedXScale
    const bandWidth =
      scale.bandwidth ??
      (scale.step ? scale.step * 0.7 : (innerRect.width / Math.max(1, data.length)) * 0.8)
    const baseline = resolvedYScale.map(0)

    return data.map((item, index) => {
      const xKey = scale.type === 'linear' ? Number(item.x) : String(item.x)
      const xPos = scale.map(xKey)
      const barX = scale.bandwidth ? xPos : xPos - bandWidth / 2
      const barYValue = resolvedYScale.map(item.y)
      const barHeight = Math.abs(baseline - barYValue)
      const barY = Math.min(baseline, barYValue)
      const color = item.color ?? palette[index % palette.length]
      const opacity = getChartElementOpacity(index, activeIndex, {
        activeOpacity,
        inactiveOpacity
      })

      return {
        x: barX,
        y: barY,
        width: bandWidth,
        height: barHeight,
        color,
        opacity,
        datum: item,
        index
      }
    })
  }, [
    resolvedXScale,
    resolvedYScale,
    data,
    innerRect.width,
    palette,
    activeIndex,
    activeOpacity,
    inactiveOpacity
  ])

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      data.map((item, index) => ({
        index,
        label: legendFormatter ? legendFormatter(item, index) : (item.label ?? String(item.x)),
        color: item.color ?? palette[index % palette.length],
        active: activeIndex === null || activeIndex === index
      })),
    [data, legendFormatter, palette, activeIndex]
  )

  const formatTooltip = useCallback(
    (datum: BarChartDatum, index: number) => {
      if (tooltipFormatter) return tooltipFormatter(datum, index)
      const label = datum.label ?? String(datum.x)
      return `${label}: ${datum.y}`
    },
    [tooltipFormatter]
  )

  const tooltipContent = useMemo(() => {
    if (resolvedHoveredIndex === null) return ''
    const datum = data[resolvedHoveredIndex]
    return datum ? formatTooltip(datum, resolvedHoveredIndex) : ''
  }, [resolvedHoveredIndex, data, formatTooltip])

  const handleBarMouseEnter = useCallback(
    (index: number, event: React.MouseEvent) => {
      if (!hoverable) return
      if (hoveredIndexProp === undefined) {
        setLocalHoveredIndex(index)
      }
      setTooltipPosition({ x: event.clientX, y: event.clientY })
      onHoveredIndexChange?.(index)
      onBarHover?.(index, data[index])
    },
    [hoverable, hoveredIndexProp, onHoveredIndexChange, onBarHover, data]
  )

  const handleBarMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }, [])

  const handleBarMouseLeave = useCallback(() => {
    if (!hoverable) return
    if (hoveredIndexProp === undefined) {
      setLocalHoveredIndex(null)
    }
    onHoveredIndexChange?.(null)
    onBarHover?.(null, null)
  }, [hoverable, hoveredIndexProp, onHoveredIndexChange, onBarHover])

  const handleBarClick = useCallback(
    (index: number) => {
      if (selectable) {
        const nextIndex = resolvedSelectedIndex === index ? null : index
        if (selectedIndexProp === undefined) {
          setLocalSelectedIndex(nextIndex)
        }
        onSelectedIndexChange?.(nextIndex)
      }
      onBarClick?.(index, data[index])
    },
    [selectable, resolvedSelectedIndex, selectedIndexProp, onSelectedIndexChange, onBarClick, data]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (!selectable) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleBarClick(index)
    },
    [selectable, handleBarClick]
  )

  const handleLegendClick = useCallback(
    (index: number) => {
      handleBarClick(index)
    },
    [handleBarClick]
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
    handleBarMouseLeave()
  }, [handleBarMouseLeave])

  const shouldShowXAxis = showAxis && showXAxis
  const shouldShowYAxis = showAxis && showYAxis

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
      <ChartSeries data={data} type="bar">
        {bars.map((bar) => (
          <rect
            key={`bar-${bar.index}`}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={barRadius}
            ry={barRadius}
            fill={bar.color}
            opacity={bar.opacity}
            className={classNames(
              'transition-opacity duration-150',
              (hoverable || selectable) && 'cursor-pointer'
            )}
            tabIndex={selectable ? 0 : undefined}
            onMouseEnter={(e) => handleBarMouseEnter(bar.index, e)}
            onMouseMove={handleBarMouseMove}
            onMouseLeave={handleBarMouseLeave}
            onClick={() => handleBarClick(bar.index)}
            onKeyDown={(e) => handleKeyDown(e, bar.index)}
          />
        ))}
      </ChartSeries>
    </ChartCanvas>
  )

  const tooltip = showTooltip && (
    <ChartTooltip
      content={tooltipContent}
      visible={hoverable && resolvedHoveredIndex !== null && tooltipContent !== ''}
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

export default BarChart
