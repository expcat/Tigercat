import React, { useMemo, useState, useCallback } from 'react'
import {
  chartAxisTickTextClasses,
  classNames,
  createPieArcPath,
  DEFAULT_CHART_COLORS,
  getChartElementOpacity,
  getChartInnerRect,
  getPieArcs,
  polarToCartesian,
  type ChartLegendItem,
  type ChartPadding,
  type PieChartDatum,
  type PieChartProps as CorePieChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'

export interface PieChartProps extends CorePieChartProps {
  data: PieChartDatum[]
  padding?: ChartPadding
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSliceClick?: (index: number, datum: PieChartDatum) => void
  onSliceHover?: (index: number | null, datum: PieChartDatum | null) => void
}

export const PieChart: React.FC<PieChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  innerRadius = 0,
  outerRadius,
  startAngle = 0,
  endAngle = Math.PI * 2,
  padAngle = 0,
  colors,
  showLabels = false,
  labelFormatter,
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
  onSliceClick,
  onSliceHover
}) => {
  const [localHoveredIndex, setLocalHoveredIndex] = useState<number | null>(null)
  const [localSelectedIndex, setLocalSelectedIndex] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )

  const resolvedOuterRadius = useMemo(() => {
    if (typeof outerRadius === 'number') return Math.max(0, outerRadius)
    return Math.max(0, Math.min(innerRect.width, innerRect.height) / 2)
  }, [outerRadius, innerRect.width, innerRect.height])

  const resolvedInnerRadius = useMemo(
    () => Math.min(Math.max(0, innerRadius ?? 0), resolvedOuterRadius),
    [innerRadius, resolvedOuterRadius]
  )

  const arcs = useMemo(
    () =>
      getPieArcs(data, {
        startAngle,
        endAngle,
        padAngle
      }),
    [data, startAngle, endAngle, padAngle]
  )

  const palette = useMemo(
    () => (colors && colors.length > 0 ? colors : [...DEFAULT_CHART_COLORS]),
    [colors]
  )

  const cx = innerRect.width / 2
  const cy = innerRect.height / 2
  const labelRadius = resolvedInnerRadius + (resolvedOuterRadius - resolvedInnerRadius) / 2

  const resolvedHoveredIndex = hoveredIndexProp !== undefined ? hoveredIndexProp : localHoveredIndex
  const resolvedSelectedIndex =
    selectedIndexProp !== undefined ? selectedIndexProp : localSelectedIndex

  const activeIndex = useMemo(() => {
    if (resolvedSelectedIndex !== null) return resolvedSelectedIndex
    if (hoverable && resolvedHoveredIndex !== null) return resolvedHoveredIndex
    return null
  }, [resolvedSelectedIndex, hoverable, resolvedHoveredIndex])

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data])

  const formatLabel =
    labelFormatter ?? ((value: number, datum: PieChartDatum) => datum.label ?? `${value}`)

  const legendItems = useMemo<ChartLegendItem[]>(
    () =>
      arcs.map((arc) => ({
        index: arc.index,
        label: legendFormatter
          ? legendFormatter(arc.data, arc.index)
          : (arc.data.label ?? `${arc.index + 1}`),
        color: arc.data.color ?? palette[arc.index % palette.length],
        active: activeIndex === null || activeIndex === arc.index
      })),
    [arcs, legendFormatter, palette, activeIndex]
  )

  const formatTooltip = useCallback(
    (datum: PieChartDatum, index: number) => {
      if (tooltipFormatter) return tooltipFormatter(datum, index)
      const label = datum.label ?? `Slice ${index + 1}`
      const percentage = total > 0 ? ((datum.value / total) * 100).toFixed(1) : '0'
      return `${label}: ${datum.value} (${percentage}%)`
    },
    [tooltipFormatter, total]
  )

  const tooltipContent = useMemo(() => {
    if (resolvedHoveredIndex === null) return ''
    const datum = data[resolvedHoveredIndex]
    return datum ? formatTooltip(datum, resolvedHoveredIndex) : ''
  }, [resolvedHoveredIndex, data, formatTooltip])

  const handleSliceMouseEnter = useCallback(
    (index: number, event: React.MouseEvent) => {
      if (!hoverable) return
      if (hoveredIndexProp === undefined) {
        setLocalHoveredIndex(index)
      }
      setTooltipPosition({ x: event.clientX, y: event.clientY })
      onHoveredIndexChange?.(index)
      onSliceHover?.(index, data[index])
    },
    [hoverable, hoveredIndexProp, onHoveredIndexChange, onSliceHover, data]
  )

  const handleSliceMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }, [])

  const handleSliceMouseLeave = useCallback(() => {
    if (!hoverable) return
    if (hoveredIndexProp === undefined) {
      setLocalHoveredIndex(null)
    }
    onHoveredIndexChange?.(null)
    onSliceHover?.(null, null)
  }, [hoverable, hoveredIndexProp, onHoveredIndexChange, onSliceHover])

  const handleSliceClick = useCallback(
    (index: number) => {
      if (selectable) {
        const nextIndex = resolvedSelectedIndex === index ? null : index
        if (selectedIndexProp === undefined) {
          setLocalSelectedIndex(nextIndex)
        }
        onSelectedIndexChange?.(nextIndex)
      }
      onSliceClick?.(index, data[index])
    },
    [
      selectable,
      resolvedSelectedIndex,
      selectedIndexProp,
      onSelectedIndexChange,
      onSliceClick,
      data
    ]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (!selectable) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleSliceClick(index)
    },
    [selectable, handleSliceClick]
  )

  const handleLegendClick = useCallback(
    (index: number) => {
      handleSliceClick(index)
    },
    [handleSliceClick]
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
    handleSliceMouseLeave()
  }, [handleSliceMouseLeave])

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
      <g data-series-type="pie">
        {arcs.map((arc) => {
          const color = arc.data.color ?? palette[arc.index % palette.length]
          const path = createPieArcPath({
            cx,
            cy,
            innerRadius: resolvedInnerRadius,
            outerRadius: resolvedOuterRadius,
            startAngle: arc.startAngle,
            endAngle: arc.endAngle
          })
          const opacity = getChartElementOpacity(arc.index, activeIndex, {
            activeOpacity,
            inactiveOpacity
          })

          return (
            <path
              key={`slice-${arc.index}`}
              d={path}
              fill={color}
              opacity={opacity}
              className={classNames(
                'transition-opacity duration-150',
                (hoverable || selectable) && 'cursor-pointer'
              )}
              tabIndex={selectable ? 0 : undefined}
              data-pie-slice="true"
              data-index={arc.index}
              onMouseEnter={(e) => handleSliceMouseEnter(arc.index, e)}
              onMouseMove={handleSliceMouseMove}
              onMouseLeave={handleSliceMouseLeave}
              onClick={() => handleSliceClick(arc.index)}
              onKeyDown={(e) => handleKeyDown(e, arc.index)}
            />
          )
        })}
      </g>
      {showLabels &&
        arcs.map((arc) => {
          const angle = (arc.startAngle + arc.endAngle) / 2
          const { x, y } = polarToCartesian(cx, cy, labelRadius, angle)
          const label = formatLabel(arc.value, arc.data, arc.index)

          return (
            <text
              key={`label-${arc.index}`}
              x={x}
              y={y}
              className={chartAxisTickTextClasses}
              textAnchor="middle"
              dominantBaseline="middle">
              {label}
            </text>
          )
        })}
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

export default PieChart
