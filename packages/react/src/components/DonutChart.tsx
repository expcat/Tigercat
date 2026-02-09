import React, { useMemo } from 'react'
import {
  classNames,
  getChartInnerRect,
  type ChartPadding,
  type DonutChartDatum,
  type DonutChartProps as CoreDonutChartProps
} from '@expcat/tigercat-core'
import { PieChart } from './PieChart'

export interface DonutChartProps extends CoreDonutChartProps {
  data: DonutChartDatum[]
  padding?: ChartPadding
  // Interaction callbacks
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSliceClick?: (index: number, datum: DonutChartDatum) => void
  onSliceHover?: (index: number | null, datum: DonutChartDatum | null) => void
}

export const DonutChart: React.FC<DonutChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  innerRadius,
  innerRadiusRatio = 0.6,
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
  // Interaction props
  hoverable = false,
  hoveredIndex,
  activeOpacity = 1,
  inactiveOpacity = 0.25,
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

  const resolvedOuterRadius = useMemo(() => {
    if (typeof outerRadius === 'number') return Math.max(0, outerRadius)
    return Math.max(0, Math.min(innerRect.width, innerRect.height) / 2)
  }, [outerRadius, innerRect.width, innerRect.height])

  const resolvedInnerRadius = useMemo(() => {
    if (typeof innerRadius === 'number') {
      return Math.min(Math.max(0, innerRadius), resolvedOuterRadius)
    }

    const ratio = Math.min(Math.max(innerRadiusRatio ?? 0.6, 0), 1)
    return resolvedOuterRadius * ratio
  }, [innerRadius, innerRadiusRatio, resolvedOuterRadius])

  return (
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
      colors={colors}
      showLabels={showLabels}
      labelFormatter={labelFormatter}
      labelPosition={labelPosition}
      // Visual enhancements
      borderWidth={borderWidth}
      borderColor={borderColor}
      hoverOffset={hoverOffset}
      shadow={shadow}
      // Interaction props
      hoverable={hoverable}
      hoveredIndex={hoveredIndex}
      activeOpacity={activeOpacity}
      inactiveOpacity={inactiveOpacity}
      selectable={selectable}
      selectedIndex={selectedIndex}
      // Legend props
      showLegend={showLegend}
      legendPosition={legendPosition}
      legendMarkerSize={legendMarkerSize}
      legendGap={legendGap}
      // Tooltip props
      showTooltip={showTooltip}
      tooltipFormatter={tooltipFormatter}
      // Accessibility
      title={title}
      desc={desc}
      className={classNames(className)}
      // Callbacks
      onHoveredIndexChange={onHoveredIndexChange}
      onSelectedIndexChange={onSelectedIndexChange}
      onSliceClick={onSliceClick}
      onSliceHover={onSliceHover}
    />
  )
}

export default DonutChart
