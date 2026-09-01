import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  layoutGauge,
  createGaugeAnimation,
  createGaugeArcPath,
  createGaugeNeedlePath,
  getStableChartGradientPrefix,
  chartAxisTickTextClasses,
  getCartesianChartShellClasses,
  DEFAULT_GAUGE_END_ANGLE,
  DEFAULT_GAUGE_HEIGHT,
  DEFAULT_GAUGE_START_ANGLE,
  DEFAULT_GAUGE_WIDTH,
  type ChartPadding,
  type GaugeChartProps as CoreGaugeChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'
import { useResponsiveChartSize } from '../hooks/useResponsiveChartSize'

export interface GaugeChartProps extends CoreGaugeChartProps {
  padding?: ChartPadding
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  width = DEFAULT_GAUGE_WIDTH,
  height = DEFAULT_GAUGE_HEIGHT,
  padding = 24,
  responsive = false,
  value,
  min = 0,
  max = 100,
  startAngle = DEFAULT_GAUGE_START_ANGLE,
  endAngle = DEFAULT_GAUGE_END_ANGLE,
  arcWidth = 20,
  showTicks = true,
  tickCount = 5,
  valueFormatter,
  tooltipFormatter,
  label,
  segments,
  trackColor = 'var(--tiger-border,#e5e7eb)',
  color = 'var(--tiger-primary,#2563eb)',
  gradient = false,
  animated = true,
  showTooltip = true,
  title: chartTitle,
  desc,
  className
}) => {
  const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
    width,
    height,
    padding,
    responsive
  )
  const geometry = useMemo(
    () =>
      layoutGauge({
        innerWidth: innerRect.width,
        innerHeight: innerRect.height,
        value,
        min,
        max,
        startAngle,
        endAngle,
        arcWidth,
        showTicks,
        tickCount,
        segments,
        valueFormatter,
        label
      }),
    [
      innerRect.width,
      innerRect.height,
      value,
      min,
      max,
      startAngle,
      endAngle,
      arcWidth,
      showTicks,
      tickCount,
      segments,
      valueFormatter,
      label
    ]
  )
  const [animatedAngle, setAnimatedAngle] = useState(geometry.valueAngle)
  const prevAngleRef = useRef(geometry.valueAngle)

  useEffect(() => {
    const from = prevAngleRef.current
    const to = geometry.valueAngle
    prevAngleRef.current = to
    if (!animated || from === to) {
      setAnimatedAngle(to)
      return
    }
    const ctrl = createGaugeAnimation({
      from,
      to,
      onUpdate: (next) => setAnimatedAngle(next)
    })
    return () => ctrl.stop()
  }, [geometry.valueAngle, animated])

  const needlePath = useMemo(
    () =>
      createGaugeNeedlePath(
        geometry.cx,
        geometry.cy,
        Math.max(0, geometry.radius - arcWidth - 6),
        animatedAngle
      ),
    [geometry.cx, geometry.cy, geometry.radius, arcWidth, animatedAngle]
  )

  const valuePath = useMemo(() => {
    if (animatedAngle === geometry.startAngle) return null
    return createGaugeArcPath(
      geometry.cx,
      geometry.cy,
      geometry.radius,
      geometry.startAngle,
      animatedAngle,
      arcWidth
    )
  }, [animatedAngle, geometry.cx, geometry.cy, geometry.radius, geometry.startAngle, arcWidth])

  const formattedValue = geometry.valueText.text
  const [tooltip, setTooltip] = useState({ open: false, x: 0, y: 0 })
  const tooltipContent = tooltipFormatter
    ? tooltipFormatter(value)
    : label
      ? `${label}: ${formattedValue}`
      : formattedValue
  const handleTooltipMove = (e: React.MouseEvent) => {
    if (!showTooltip) return
    setTooltip({ open: true, x: e.clientX, y: e.clientY })
  }
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('gauge', gradientId),
    [gradientId]
  )
  const valueGradientId = `${gradientPrefix}-value`

  return (
    <div
      className={getCartesianChartShellClasses({
        showLegend: false,
        responsive,
        className
      })}
      role="meter"
      aria-valuenow={Number.isFinite(value) ? value : undefined}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={formattedValue}
      aria-label={label ?? chartTitle ?? formattedValue}
      onMouseMove={handleTooltipMove}
      onMouseLeave={() => setTooltip((current) => ({ ...current, open: false }))}>
      <ChartCanvas
        width={width}
        height={height}
        padding={padding}
        responsive={responsive}
        title={undefined}
        desc={undefined}
        onResolvedSizeChange={onResolvedSizeChange}>
        {gradient && valuePath && (
          <defs>
            <linearGradient
              id={valueGradientId}
              gradientUnits="userSpaceOnUse"
              x1={geometry.cx}
              y1={geometry.cy - geometry.radius}
              x2={geometry.cx}
              y2={geometry.cy + geometry.radius}>
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          </defs>
        )}
        <path d={geometry.trackPath} fill={trackColor} strokeWidth={0} aria-hidden="true" />
        {geometry.segmentPaths.map((seg, index) => (
          <path
            key={`seg-${index}`}
            d={seg.path}
            fill={seg.color}
            strokeWidth={0}
            aria-hidden="true"
          />
        ))}
        {valuePath && (
          <path
            d={valuePath}
            fill={gradient ? `url(#${valueGradientId})` : color}
            strokeWidth={0}
            aria-hidden="true"
          />
        )}
        {geometry.ticks.map((tick, index) => (
          <React.Fragment key={`tick-${index}`}>
            <line
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke="var(--tiger-text-secondary,#6b7280)"
              strokeWidth={1}
              aria-hidden="true"
            />
            <text
              x={tick.labelX}
              y={tick.labelY}
              className={chartAxisTickTextClasses}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '10px' }}
              aria-hidden="true">
              {tick.label}
            </text>
          </React.Fragment>
        ))}
        <path d={needlePath} fill="var(--tiger-text,#374151)" aria-hidden="true" />
        <circle
          cx={geometry.cx}
          cy={geometry.cy}
          r={5}
          fill="var(--tiger-text,#374151)"
          aria-hidden="true"
        />
        <text
          x={geometry.valueText.x}
          y={geometry.valueText.y}
          className="fill-[color:var(--tiger-text,#374151)] text-lg font-semibold tabular-nums"
          textAnchor="middle"
          dominantBaseline="middle"
          aria-hidden="true">
          {formattedValue}
        </text>
        {geometry.labelText && (
          <text
            x={geometry.labelText.x}
            y={geometry.labelText.y}
            className={chartAxisTickTextClasses}
            textAnchor="middle"
            dominantBaseline="middle"
            aria-hidden="true">
            {geometry.labelText.text}
          </text>
        )}
      </ChartCanvas>
      {showTooltip && (
        <ChartTooltip
          content={tooltipContent}
          open={tooltip.open && tooltipContent !== ''}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
    </div>
  )
}

export default GaugeChart
