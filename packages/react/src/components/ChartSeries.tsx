import React from 'react'
import {
  classNames,
  type ChartSeriesPoint,
  type ChartSeriesProps as CoreChartSeriesProps
} from '@expcat/tigercat-core'

export interface ChartSeriesRenderProps<T extends ChartSeriesPoint = ChartSeriesPoint> {
  data: T[]
  name?: string
  color?: string
  opacity?: number
  type?: string
}

export interface ChartSeriesProps<T extends ChartSeriesPoint = ChartSeriesPoint>
  extends
    CoreChartSeriesProps<T>,
    Omit<React.SVGAttributes<SVGGElement>, keyof CoreChartSeriesProps<T> | 'children'> {
  data: T[]
  children?: React.ReactNode | ((props: ChartSeriesRenderProps<T>) => React.ReactNode)
}

export const ChartSeries = <T extends ChartSeriesPoint = ChartSeriesPoint>({
  data,
  name,
  color,
  opacity,
  type,
  className,
  children,
  ...props
}: ChartSeriesProps<T>) => {
  const content =
    typeof children === 'function' ? children({ data, name, color, opacity, type }) : children

  return (
    <g
      {...props}
      className={classNames(className)}
      data-series-name={name}
      data-series-type={type}
      fill={color}
      stroke={color}
      opacity={opacity}>
      {content}
    </g>
  )
}

export default ChartSeries
