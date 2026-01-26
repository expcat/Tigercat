import React, { useMemo } from 'react'
import {
  classNames,
  createLinearScale,
  getChartInnerRect,
  getNumberExtent,
  type ChartPadding,
  type ChartScale,
  type ScatterChartDatum,
  type ScatterChartProps as CoreScatterChartProps
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartSeries } from './ChartSeries'

export interface ScatterChartProps extends CoreScatterChartProps {
  data: ScatterChartDatum[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  xScale,
  yScale,
  pointSize = 4,
  pointColor = 'var(--tiger-primary,#2563eb)',
  pointOpacity,
  showGrid = true,
  showAxis = true,
  includeZero = false,
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
  className
}) => {
  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )
  const xValues = useMemo(() => data.map((item) => item.x), [data])
  const yValues = useMemo(() => data.map((item) => item.y), [data])

  const resolvedXScale = useMemo(() => {
    if (xScale) return xScale
    const extent = getNumberExtent(xValues, { includeZero })
    return createLinearScale(extent, [0, innerRect.width])
  }, [xScale, xValues, includeZero, innerRect.width])

  const resolvedYScale = useMemo(() => {
    if (yScale) return yScale
    const extent = getNumberExtent(yValues, { includeZero })
    return createLinearScale(extent, [innerRect.height, 0])
  }, [yScale, yValues, includeZero, innerRect.height])

  return (
    <ChartCanvas width={width} height={height} padding={padding} className={classNames(className)}>
      {showGrid ? (
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
      ) : null}
      {showAxis ? (
        <ChartAxis
          scale={resolvedXScale}
          orientation="bottom"
          y={innerRect.height}
          ticks={xTicks}
          tickValues={xTickValues}
          tickFormat={xTickFormat}
          label={xAxisLabel}
        />
      ) : null}
      {showAxis ? (
        <ChartAxis
          scale={resolvedYScale}
          orientation="left"
          ticks={yTicks}
          tickValues={yTickValues}
          tickFormat={yTickFormat}
          label={yAxisLabel}
        />
      ) : null}
      <ChartSeries data={data} type="scatter">
        {data.map((item, index) => (
          <circle
            key={`point-${index}`}
            cx={resolvedXScale.map(item.x)}
            cy={resolvedYScale.map(item.y)}
            r={item.size ?? pointSize}
            fill={item.color ?? pointColor}
            opacity={pointOpacity}
          />
        ))}
      </ChartSeries>
    </ChartCanvas>
  )
}

export default ScatterChart
