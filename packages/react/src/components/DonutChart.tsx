import React, { useMemo } from 'react'
import {
  classNames,
  getChartInnerRect,
  normalizeChartPadding,
  type ChartPadding,
  type DonutChartDatum,
  type DonutChartProps as CoreDonutChartProps
} from '@expcat/tigercat-core'
import { PieChart } from './PieChart'

export interface DonutChartProps extends CoreDonutChartProps {
  data: DonutChartDatum[]
  padding?: ChartPadding
  /** Text shown as the main value in the donut center */
  centerValue?: string | number
  /** Descriptive label shown below centerValue in the donut center */
  centerLabel?: string
  /** Enable entrance animation */
  animated?: boolean
  // Interaction callbacks
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSliceClick?: (index: number, datum: DonutChartDatum) => void
  onSliceHover?: (index: number | null, datum: DonutChartDatum | null) => void
}

/** ECharts-inspired vibrant palette for donut charts */
const DONUT_PALETTE = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc'
]

export const DonutChart: React.FC<DonutChartProps> = ({
  width = 320,
  height = 240,
  padding = 24,
  data,
  innerRadius,
  innerRadiusRatio = 0.62,
  outerRadius,
  startAngle = 0,
  endAngle = Math.PI * 2,
  padAngle = 0.04,
  colors,
  showLabels = false,
  labelFormatter,
  labelPosition = 'inside',
  borderWidth = 0,
  borderColor = '#ffffff',
  hoverOffset = 10,
  shadow = true,
  // Interaction props
  hoverable = false,
  hoveredIndex,
  activeOpacity = 1,
  inactiveOpacity = 0.3,
  selectable = false,
  selectedIndex,
  // Legend props
  showLegend = false,
  legendPosition = 'bottom',
  legendMarkerSize = 10,
  legendGap = 8,
  // Tooltip props
  showTooltip = true,
  tooltipFormatter,
  // Accessibility
  title,
  desc,
  className,
  // DonutChart-specific
  centerValue,
  centerLabel,
  animated = false,
  // Callbacks
  onHoveredIndexChange,
  onSelectedIndexChange,
  onSliceClick,
  onSliceHover
}) => {
  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )

  const pad = useMemo(() => normalizeChartPadding(padding), [padding])

  const resolvedOuterRadius = useMemo(() => {
    if (typeof outerRadius === 'number') return Math.max(0, outerRadius)
    return Math.max(0, Math.min(innerRect.width, innerRect.height) / 2)
  }, [outerRadius, innerRect.width, innerRect.height])

  const resolvedInnerRadius = useMemo(() => {
    if (typeof innerRadius === 'number') {
      return Math.min(Math.max(0, innerRadius), resolvedOuterRadius)
    }
    const ratio = Math.min(Math.max(innerRadiusRatio ?? 0.62, 0), 1)
    return resolvedOuterRadius * ratio
  }, [innerRadius, innerRadiusRatio, resolvedOuterRadius])

  const resolvedColors = useMemo(
    () => (colors && colors.length > 0 ? colors : DONUT_PALETTE),
    [colors]
  )

  const donutTooltipFormatter = useMemo(() => {
    if (tooltipFormatter) return tooltipFormatter
    const total = data.reduce((s, d) => s + d.value, 0)
    return (datum: DonutChartDatum, index: number) => {
      const pct = total > 0 ? ((datum.value / total) * 100).toFixed(1) : '0'
      const label = datum.label ?? `#${index + 1}`
      return `${label}: ${datum.value} (${pct}%)`
    }
  }, [tooltipFormatter, data])

  const hasCenterContent = centerValue !== undefined || centerLabel !== undefined
  const centerX = pad.left + innerRect.width / 2
  const centerY = pad.top + innerRect.height / 2

  return (
    <div className="inline-block relative" data-donut-chart="true">
      <PieChart
        width={width}
        height={height}
        padding={padding}
        data={data}
        innerRadius={resolvedInnerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        padAngle={padAngle}
        colors={resolvedColors}
        showLabels={showLabels}
        labelFormatter={labelFormatter}
        labelPosition={labelPosition}
        borderWidth={borderWidth}
        borderColor={borderColor}
        hoverOffset={hoverOffset}
        shadow={shadow}
        hoverable={hoverable}
        hoveredIndex={hoveredIndex}
        activeOpacity={activeOpacity}
        inactiveOpacity={inactiveOpacity}
        selectable={selectable}
        selectedIndex={selectedIndex}
        showLegend={showLegend}
        legendPosition={legendPosition}
        legendMarkerSize={legendMarkerSize}
        legendGap={legendGap}
        showTooltip={showTooltip}
        tooltipFormatter={donutTooltipFormatter}
        title={title}
        desc={desc}
        className={classNames(className)}
        onHoveredIndexChange={onHoveredIndexChange}
        onSelectedIndexChange={onSelectedIndexChange}
        onSliceClick={onSliceClick}
        onSliceHover={onSliceHover}
      />
      {hasCenterContent && (
        <div
          data-donut-center="true"
          style={{
            position: 'absolute',
            left: `${centerX}px`,
            top: `${centerY}px`,
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            lineHeight: '1.3'
          }}>
          {centerValue !== undefined && (
            <div
              className="text-xl font-semibold text-[color:var(--tiger-text,#1f2937)]"
              style={{ lineHeight: '1.2' }}>
              {`${centerValue}`}
            </div>
          )}
          {centerLabel !== undefined && (
            <div
              className="text-xs text-[color:var(--tiger-text-secondary,#6b7280)]"
              style={{ marginTop: '2px' }}>
              {centerLabel}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DonutChart
