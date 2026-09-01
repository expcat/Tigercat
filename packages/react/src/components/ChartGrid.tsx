import React, { useMemo } from 'react'
import {
  chartGridLineClasses,
  classNames,
  getChartGridLines,
  type ChartGridProps as CoreChartGridProps,
  type ChartScale
} from '@expcat/tigercat-core'

export interface ChartGridProps
  extends CoreChartGridProps, Omit<React.SVGAttributes<SVGGElement>, keyof CoreChartGridProps> {
  xScale?: ChartScale
  yScale?: ChartScale
}

export const ChartGrid = ({
  xScale,
  yScale,
  xRange,
  yRange,
  width,
  height,
  show = 'both',
  xTicks = 5,
  yTicks = 5,
  xTickValues,
  yTickValues,
  lineStyle = 'solid',
  strokeWidth = 1,
  x = 0,
  y = 0,
  className,
  ...props
}: ChartGridProps) => {
  const lines = useMemo(
    () =>
      getChartGridLines({
        xScale,
        yScale,
        xRange,
        yRange,
        width,
        height,
        show,
        xTicks,
        yTicks,
        xTickValues,
        yTickValues,
        lineStyle,
        strokeWidth
      }),
    [
      xScale,
      yScale,
      xRange,
      yRange,
      width,
      height,
      show,
      xTicks,
      yTicks,
      xTickValues,
      yTickValues,
      lineStyle,
      strokeWidth
    ]
  )

  return (
    <g
      {...props}
      className={classNames(className)}
      transform={`translate(${x}, ${y})`}
      aria-hidden="true">
      {lines.map((line) => (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          className={chartGridLineClasses}
          strokeWidth={line.strokeWidth}
          strokeDasharray={line.strokeDasharray}
        />
      ))}
    </g>
  )
}

export default ChartGrid
