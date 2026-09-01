import React, { useMemo } from 'react'
import {
  chartAxisLabelClasses,
  chartAxisLineClasses,
  chartAxisTickLineClasses,
  chartAxisTickTextClasses,
  classNames,
  getChartAxisGeometry,
  type ChartAxisProps as CoreChartAxisProps,
  type ChartScale
} from '@expcat/tigercat-core'

export interface ChartAxisProps
  extends CoreChartAxisProps, Omit<React.SVGAttributes<SVGGElement>, keyof CoreChartAxisProps> {
  scale: ChartScale
}

export const ChartAxis = ({
  orientation = 'bottom',
  scale,
  ticks = 5,
  tickValues,
  tickFormat,
  tickSize = 6,
  tickPadding = 4,
  label,
  labelOffset = 28,
  x = 0,
  y = 0,
  className,
  ...props
}: ChartAxisProps) => {
  const geometry = useMemo(
    () =>
      getChartAxisGeometry(scale, {
        orientation,
        tickCount: ticks,
        tickValues,
        tickFormat,
        tickSize,
        tickPadding,
        label,
        labelOffset
      }),
    [scale, orientation, ticks, tickValues, tickFormat, tickSize, tickPadding, label, labelOffset]
  )

  return (
    <g
      {...props}
      className={classNames(className)}
      transform={`translate(${x}, ${y})`}
      aria-hidden="true">
      <line {...geometry.axisLine} className={chartAxisLineClasses} data-axis-line="true" />
      {geometry.ticks.map((tick) => (
        <g key={tick.key} data-axis-tick="true">
          <line {...tick.line} className={chartAxisTickLineClasses} />
          <text {...tick.text} className={chartAxisTickTextClasses}>
            {tick.label}
          </text>
        </g>
      ))}
      {geometry.label ? (
        <text
          className={chartAxisLabelClasses}
          data-axis-label="true"
          x={geometry.label.x}
          y={geometry.label.y}
          textAnchor={geometry.label.textAnchor}
          dy={geometry.label.dy}
          transform={geometry.label.transform}>
          {geometry.label.text}
        </text>
      ) : null}
    </g>
  )
}

export default ChartAxis
