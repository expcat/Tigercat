import React, { useMemo, useCallback } from 'react'
import {
  chartAxisTickTextClasses,
  classNames,
  computePieHoverOffset,
  computePieLabelLine,
  createPieArcPath,
  DEFAULT_CHART_COLORS,
  getChartElementOpacity,
  getChartInnerRect,
  getPieArcs,
  PIE_BASE_SHADOW,
  PIE_EMPHASIS_SHADOW,
  polarToCartesian,
  type ChartLegendItem,
  type ChartPadding,
  type PieChartDatum,
  type PieChartProps as CorePieChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../hooks/useChartInteraction'

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
  labelPosition = 'inside',
  borderWidth = 2,
  borderColor = '#ffffff',
  hoverOffset = 8,
  shadow = false,
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
  // Use shared interaction hook
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
  } = useChartInteraction<PieChartDatum>({
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
      onSliceHover?.(index, index !== null ? data[index] : null)
    },
    onSelectedIndexChange,
    callbacks: {
      onClick: onSliceClick
    }
  })

  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )

  const resolvedOuterRadius = useMemo(() => {
    if (typeof outerRadius === 'number') return Math.max(0, outerRadius)
    const maxR = Math.min(innerRect.width, innerRect.height) / 2
    return labelPosition === 'outside' ? maxR * 0.72 : maxR
  }, [outerRadius, innerRect.width, innerRect.height, labelPosition])

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

  const interactive = hoverable || selectable

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
          const isEmphasized = activeIndex === arc.index
          const opacity = getChartElementOpacity(arc.index, activeIndex, {
            activeOpacity,
            inactiveOpacity
          })
          const { dx, dy } =
            interactive && isEmphasized && hoverOffset > 0
              ? computePieHoverOffset(arc.startAngle, arc.endAngle, hoverOffset)
              : { dx: 0, dy: 0 }

          return (
            <path
              key={`slice-${arc.index}`}
              d={path}
              fill={color}
              opacity={opacity}
              stroke={borderColor}
              strokeWidth={borderWidth}
              strokeLinejoin="round"
              className={classNames(interactive && 'cursor-pointer')}
              style={{
                transform: isEmphasized
                  ? `translate(${dx}px, ${dy}px) scale(1.04)`
                  : `translate(${dx}px, ${dy}px)`,
                transformOrigin: `${cx}px ${cy}px`,
                transition:
                  'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease-out, filter 0.3s ease-out',
                filter: shadow ? (isEmphasized ? PIE_EMPHASIS_SHADOW : PIE_BASE_SHADOW) : undefined
              }}
              tabIndex={selectable ? 0 : undefined}
              data-pie-slice="true"
              data-index={arc.index}
              onMouseEnter={(e) => handleMouseEnter(arc.index, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(arc.index)}
              onKeyDown={(e) => handleKeyDown(e, arc.index)}
            />
          )
        })}
      </g>
      {showLabels &&
        labelPosition === 'outside' &&
        arcs.map((arc) => {
          const color = arc.data.color ?? palette[arc.index % palette.length]
          const line = computePieLabelLine(
            cx,
            cy,
            resolvedOuterRadius,
            arc.startAngle,
            arc.endAngle
          )
          const pct = total > 0 ? ((arc.value / total) * 100).toFixed(1) : '0'
          const labelText = labelFormatter
            ? labelFormatter(arc.value, arc.data, arc.index)
            : `${arc.data.label ?? arc.value} ${pct}%`

          return (
            <g key={`label-group-${arc.index}`}>
              <polyline
                points={`${line.anchor.x},${line.anchor.y} ${line.elbow.x},${line.elbow.y} ${line.label.x},${line.label.y}`}
                fill="none"
                stroke={color}
                strokeWidth={1}
                opacity={0.5}
              />
              <text
                x={line.label.x}
                y={line.label.y}
                textAnchor={line.textAnchor}
                dominantBaseline="middle"
                className="fill-[color:var(--tiger-text-secondary,#6b7280)] text-xs">
                {labelText}
              </text>
            </g>
          )
        })}
      {showLabels &&
        labelPosition !== 'outside' &&
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
        interactive={interactive}
        onItemClick={handleLegendClick}
        onItemHover={handleLegendHover}
        onItemLeave={handleLegendLeave}
      />
      {tooltip}
    </div>
  )
}

export default PieChart
