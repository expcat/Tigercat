import React, { useMemo } from 'react'
import {
  chartAxisLabelClasses,
  chartAxisLineClasses,
  chartAxisTickLineClasses,
  chartAxisTickTextClasses,
  classNames,
  getChartAxisTicks,
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
  const axisTicks = useMemo(
    () =>
      getChartAxisTicks(scale, {
        tickCount: ticks,
        tickValues,
        tickFormat
      }),
    [scale, ticks, tickValues, tickFormat]
  )

  const isHorizontal = orientation === 'top' || orientation === 'bottom'
  const isTopOrLeft = orientation === 'top' || orientation === 'left'
  const rangeStart = scale.range[0]
  const rangeEnd = scale.range[1]
  const axisLine = isHorizontal
    ? { x1: rangeStart, y1: 0, x2: rangeEnd, y2: 0 }
    : { x1: 0, y1: rangeStart, x2: 0, y2: rangeEnd }
  const tickDirection = isTopOrLeft ? -1 : 1
  const labelBase = tickSize + tickPadding + labelOffset
  const labelPosition = (rangeStart + rangeEnd) / 2

  return (
    <g {...props} className={classNames(className)} transform={`translate(${x}, ${y})`}>
      <line {...axisLine} className={chartAxisLineClasses} data-axis-line="true" />
      {axisTicks.map((tick) => {
        const textAnchor = (isHorizontal ? 'middle' : isTopOrLeft ? 'end' : 'start') as
          | 'middle'
          | 'end'
          | 'start'

        const tickLine = isHorizontal
          ? {
              x1: tick.position,
              y1: 0,
              x2: tick.position,
              y2: tickSize * tickDirection
            }
          : {
              x1: 0,
              y1: tick.position,
              x2: tickSize * tickDirection,
              y2: tick.position
            }

        const textProps = isHorizontal
          ? {
              x: tick.position,
              y: tickSize * tickDirection + tickPadding * tickDirection,
              textAnchor,
              dy: isTopOrLeft ? '-0.32em' : '0.71em'
            }
          : {
              x: (tickSize + tickPadding) * tickDirection,
              y: tick.position,
              textAnchor,
              dy: '0.32em'
            }

        return (
          <g key={`${tick.value}`} data-axis-tick="true">
            <line {...tickLine} className={chartAxisTickLineClasses} />
            <text {...textProps} className={chartAxisTickTextClasses}>
              {tick.label}
            </text>
          </g>
        )
      })}
      {label ? (
        <text
          className={chartAxisLabelClasses}
          data-axis-label="true"
          {...(isHorizontal
            ? {
                x: labelPosition,
                y: labelBase * tickDirection,
                textAnchor: 'middle',
                dy: isTopOrLeft ? '-0.32em' : '0.71em'
              }
            : {
                x: labelBase * tickDirection,
                y: labelPosition,
                textAnchor: 'middle',
                transform: `rotate(${isTopOrLeft ? -90 : 90} ${labelBase * tickDirection} ${labelPosition})`
              })}>
          {label}
        </text>
      ) : null}
    </g>
  )
}

export default ChartAxis
