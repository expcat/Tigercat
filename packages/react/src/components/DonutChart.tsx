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
  className
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
      className={classNames(className)}
    />
  )
}

export default DonutChart
