import React, { useMemo } from 'react'
import {
  chartGridLineClasses,
  classNames,
  getChartAxisTicks,
  getChartGridLineDasharray,
  type ChartGridProps as CoreChartGridProps,
  type ChartScale,
  type ChartScaleValue
} from '@expcat/tigercat-core'

export interface ChartGridProps<
  TX extends ChartScaleValue = ChartScaleValue,
  TY extends ChartScaleValue = ChartScaleValue
>
  extends
    CoreChartGridProps<TX, TY>,
    Omit<React.SVGAttributes<SVGGElement>, keyof CoreChartGridProps<TX, TY>> {
  xScale?: ChartScale<TX>
  yScale?: ChartScale<TY>
}

export const ChartGrid = <
  TX extends ChartScaleValue = ChartScaleValue,
  TY extends ChartScaleValue = ChartScaleValue
>({
  xScale,
  yScale,
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
}: ChartGridProps<TX, TY>) => {
  const dasharray = useMemo(() => getChartGridLineDasharray(lineStyle), [lineStyle])

  const resolvedXTicks = useMemo(() => {
    if (!xScale) return []
    return getChartAxisTicks(xScale, { tickCount: xTicks, tickValues: xTickValues as TX[] })
  }, [xScale, xTicks, xTickValues])

  const resolvedYTicks = useMemo(() => {
    if (!yScale) return []
    return getChartAxisTicks(yScale, { tickCount: yTicks, tickValues: yTickValues as TY[] })
  }, [yScale, yTicks, yTickValues])

  const shouldRenderX = show === 'both' || show === 'x'
  const shouldRenderY = show === 'both' || show === 'y'
  const xRange = xScale?.range
  const yRange = yScale?.range

  return (
    <g {...props} className={classNames(className)} transform={`translate(${x}, ${y})`}>
      {shouldRenderX && xScale && yRange
        ? resolvedXTicks.map((tick) => (
            <line
              key={`x-${tick.value}`}
              x1={tick.position}
              y1={yRange[0]}
              x2={tick.position}
              y2={yRange[1]}
              className={chartGridLineClasses}
              strokeWidth={strokeWidth}
              strokeDasharray={dasharray}
            />
          ))
        : null}
      {shouldRenderY && yScale && xRange
        ? resolvedYTicks.map((tick) => (
            <line
              key={`y-${tick.value}`}
              x1={xRange[0]}
              y1={tick.position}
              x2={xRange[1]}
              y2={tick.position}
              className={chartGridLineClasses}
              strokeWidth={strokeWidth}
              strokeDasharray={dasharray}
            />
          ))
        : null}
    </g>
  )
}

export default ChartGrid
