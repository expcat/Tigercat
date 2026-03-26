import React, { useMemo } from 'react'
import {
  classNames,
  createGaugeArcPath,
  createGaugeNeedlePath,
  valueToGaugeAngle,
  computeGaugeTicks,
  getChartInnerRect,
  chartAxisTickTextClasses,
  type ChartPadding,
  type GaugeChartProps as CoreGaugeChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'

export interface GaugeChartProps extends CoreGaugeChartProps {
  padding?: ChartPadding
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  width = 280,
  height = 200,
  padding = 24,
  value,
  min = 0,
  max = 100,
  startAngle = 135,
  endAngle = 405,
  arcWidth = 20,
  showTicks = true,
  tickCount = 5,
  valueFormatter,
  label,
  segments,
  trackColor = 'var(--tiger-border,#e5e7eb)',
  color = 'var(--tiger-primary,#2563eb)',
  title: chartTitle,
  desc,
  className
}) => {
  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )

  const radius = useMemo(
    () => Math.min(innerRect.width, innerRect.height) / 2 - 4,
    [innerRect.width, innerRect.height]
  )

  const cx = innerRect.width / 2
  const cy = innerRect.height / 2

  const needleAngle = useMemo(
    () => valueToGaugeAngle(value, min, max, startAngle, endAngle),
    [value, min, max, startAngle, endAngle]
  )

  const ticks = useMemo(
    () =>
      showTicks ? computeGaugeTicks(cx, cy, radius, min, max, startAngle, endAngle, tickCount) : [],
    [showTicks, cx, cy, radius, min, max, startAngle, endAngle, tickCount]
  )

  const trackPath = createGaugeArcPath(cx, cy, radius, startAngle, endAngle, arcWidth)
  const valuePath =
    needleAngle > startAngle
      ? createGaugeArcPath(cx, cy, radius, startAngle, needleAngle, arcWidth)
      : null
  const needlePath = createGaugeNeedlePath(cx, cy, radius - arcWidth - 6, needleAngle)

  const formattedValue = valueFormatter ? valueFormatter(value) : `${value}`

  return (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      title={chartTitle}
      desc={desc}
      className={classNames(className)}>
      {/* Track */}
      <path d={trackPath} fill={trackColor} strokeWidth={0} />

      {/* Segments or value arc */}
      {segments
        ? segments.map((seg, i) => {
            const sStart = valueToGaugeAngle(seg.range[0], min, max, startAngle, endAngle)
            const sEnd = valueToGaugeAngle(seg.range[1], min, max, startAngle, endAngle)
            return (
              <path
                key={`seg-${i}`}
                d={createGaugeArcPath(cx, cy, radius, sStart, sEnd, arcWidth)}
                fill={seg.color}
                strokeWidth={0}
              />
            )
          })
        : valuePath && (
            <path
              d={valuePath}
              fill={color}
              strokeWidth={0}
              style={{ transition: 'all 0.3s ease-out' }}
            />
          )}

      {/* Ticks */}
      {ticks.map((tick, i) => (
        <React.Fragment key={`tick-${i}`}>
          <line
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="var(--tiger-text-secondary,#6b7280)"
            strokeWidth={1}
          />
          <text
            x={tick.x2 + (tick.x2 - tick.x1) * 1.5}
            y={tick.y2 + (tick.y2 - tick.y1) * 1.5}
            className={chartAxisTickTextClasses}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '10px' }}>
            {tick.label}
          </text>
        </React.Fragment>
      ))}

      {/* Needle */}
      <path
        d={needlePath}
        fill="var(--tiger-text,#374151)"
        style={{ transition: 'all 0.3s ease-out' }}
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={5} fill="var(--tiger-text,#374151)" />

      {/* Value text */}
      <text
        x={cx}
        y={cy + radius * 0.35}
        className="fill-[color:var(--tiger-text,#374151)] text-lg font-semibold"
        textAnchor="middle"
        dominantBaseline="middle">
        {formattedValue}
      </text>

      {/* Label */}
      {label && (
        <text
          x={cx}
          y={cy + radius * 0.35 + 20}
          className={chartAxisTickTextClasses}
          textAnchor="middle"
          dominantBaseline="middle">
          {label}
        </text>
      )}
    </ChartCanvas>
  )
}
