import React from 'react'
import {
  DEFAULT_DONUT_INNER_RADIUS_RATIO,
  type ChartPadding,
  type PieChartDatum,
  type DonutChartProps as CoreDonutChartProps
} from '@expcat/tigercat-core'
import { PieChart } from './PieChart'

export interface DonutChartProps extends CoreDonutChartProps {
  data: PieChartDatum[]
  padding?: ChartPadding
  onHoveredIndexChange?: (index: number | null) => void
  onSelectedIndexChange?: (index: number | null) => void
  onSliceClick?: (index: number, datum: PieChartDatum) => void
  onSliceHover?: (index: number | null, datum: PieChartDatum | null) => void
}

export const DonutChart: React.FC<DonutChartProps> = ({
  innerRadiusRatio = DEFAULT_DONUT_INNER_RADIUS_RATIO,
  ...props
}) => {
  return <PieChart innerRadiusRatio={innerRadiusRatio} {...props} />
}

export default DonutChart
