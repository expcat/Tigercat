import React, { useMemo } from 'react'
import {
  classNames,
  createBandScale,
  createLinearScale,
  getChartInnerRect,
  getNumberExtent,
  type BarChartDatum,
  type BarChartProps as CoreBarChartProps,
  type ChartPadding,
  type ChartScale
} from '@expcat/tigercat-core'
import { ChartAxis } from './ChartAxis'
import { ChartCanvas } from './ChartCanvas'
import { ChartGrid } from './ChartGrid'
import { ChartSeries } from './ChartSeries'

export interface BarChartProps extends CoreBarChartProps {
  data: BarChartDatum[]
  padding?: ChartPadding
  xScale?: ChartScale
  yScale?: ChartScale
}

export const BarChart: React.FC<BarChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  xScale,
  yScale,
  barColor = 'var(--tiger-primary,#2563eb)',
  barRadius = 4,
  barPaddingInner = 0.2,
  barPaddingOuter = 0.1,
  showGrid = true,
  showAxis = true,
  showXAxis = true,
  showYAxis = true,
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
  const xDomain = useMemo(() => data.map((item) => String(item.x)), [data])
  const yValues = useMemo(() => data.map((item) => item.y), [data])

  const resolvedXScale = useMemo(() => {
    if (xScale) return xScale
    return createBandScale(xDomain, [0, innerRect.width], {
      paddingInner: barPaddingInner,
      paddingOuter: barPaddingOuter
    })
  }, [xScale, xDomain, innerRect.width, barPaddingInner, barPaddingOuter])

  const resolvedYScale = useMemo(() => {
    if (yScale) return yScale
    const extent = getNumberExtent(yValues, { includeZero: true })
    return createLinearScale(extent, [innerRect.height, 0])
  }, [yScale, yValues, innerRect.height])

  const bars = useMemo(() => {
    const scale = resolvedXScale
    const bandWidth =
      scale.bandwidth ??
      (scale.step ? scale.step * 0.7 : (innerRect.width / Math.max(1, data.length)) * 0.8)
    const baseline = resolvedYScale.map(0)

    return data.map((item) => {
      const xKey = scale.type === 'linear' ? Number(item.x) : String(item.x)
      const xPos = scale.map(xKey)
      const barX = scale.bandwidth ? xPos : xPos - bandWidth / 2
      const barYValue = resolvedYScale.map(item.y)
      const barHeight = Math.abs(baseline - barYValue)
      const barY = Math.min(baseline, barYValue)

      return {
        x: barX,
        y: barY,
        width: bandWidth,
        height: barHeight,
        color: item.color ?? barColor
      }
    })
  }, [resolvedXScale, resolvedYScale, data, innerRect.width, barColor])

  const shouldShowXAxis = showAxis && showXAxis
  const shouldShowYAxis = showAxis && showYAxis

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
      {shouldShowXAxis ? (
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
      {shouldShowYAxis ? (
        <ChartAxis
          scale={resolvedYScale}
          orientation="left"
          ticks={yTicks}
          tickValues={yTickValues}
          tickFormat={yTickFormat}
          label={yAxisLabel}
        />
      ) : null}
      <ChartSeries data={data} type="bar">
        {bars.map((bar, index) => (
          <rect
            key={`bar-${index}`}
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            rx={barRadius}
            ry={barRadius}
            fill={bar.color}
          />
        ))}
      </ChartSeries>
    </ChartCanvas>
  )
}

export default BarChart
