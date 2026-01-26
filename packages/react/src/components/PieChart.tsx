import React, { useMemo } from 'react'
import {
  chartAxisTickTextClasses,
  classNames,
  createPieArcPath,
  getChartInnerRect,
  getPieArcs,
  polarToCartesian,
  type ChartPadding,
  type PieChartDatum,
  type PieChartProps as CorePieChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'

const defaultPieColors = [
  'var(--tiger-chart-1,#2563eb)',
  'var(--tiger-chart-2,#22c55e)',
  'var(--tiger-chart-3,#f97316)',
  'var(--tiger-chart-4,#a855f7)',
  'var(--tiger-chart-5,#0ea5e9)',
  'var(--tiger-chart-6,#ef4444)'
]

export interface PieChartProps extends CorePieChartProps {
  data: PieChartDatum[]
  padding?: ChartPadding
}

export const PieChart: React.FC<PieChartProps> = ({
  width = 320,
  height = 200,
  padding = 24,
  data,
  innerRadius = 0,
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

  const resolvedInnerRadius = useMemo(
    () => Math.min(Math.max(0, innerRadius ?? 0), resolvedOuterRadius),
    [innerRadius, resolvedOuterRadius]
  )

  const arcs = useMemo(
    () =>
      getPieArcs(data, {
        startAngle,
        endAngle,
        padAngle
      }),
    [data, startAngle, endAngle, padAngle]
  )

  const palette = useMemo(() => (colors && colors.length > 0 ? colors : defaultPieColors), [colors])

  const cx = innerRect.width / 2
  const cy = innerRect.height / 2
  const labelRadius = resolvedInnerRadius + (resolvedOuterRadius - resolvedInnerRadius) / 2
  const formatLabel =
    labelFormatter ?? ((value: number, datum: PieChartDatum) => datum.label ?? `${value}`)

  return (
    <ChartCanvas width={width} height={height} padding={padding} className={classNames(className)}>
      <g data-series-type="pie">
        {arcs.map((arc) => {
          const color = arc.data.color ?? palette[arc.index % palette.length]
          const path = createPieArcPath({
            cx,
            cy,
            innerRadius: resolvedInnerRadius,
            outerRadius: resolvedOuterRadius,
            startAngle: arc.startAngle,
            endAngle: arc.endAngle
          })

          return (
            <path
              key={`slice-${arc.index}`}
              d={path}
              fill={color}
              data-pie-slice="true"
              data-index={arc.index}
            />
          )
        })}
      </g>
      {showLabels
        ? arcs.map((arc) => {
            const angle = (arc.startAngle + arc.endAngle) / 2
            const { x, y } = polarToCartesian(cx, cy, labelRadius, angle)
            const label = formatLabel(arc.value, arc.data, arc.index)

            return (
              <text
                key={`label-${arc.index}`}
                x={x}
                y={y}
                className={chartAxisTickTextClasses}
                textAnchor="middle"
                dominantBaseline="middle">
                {label}
              </text>
            )
          })
        : null}
    </ChartCanvas>
  )
}

export default PieChart
