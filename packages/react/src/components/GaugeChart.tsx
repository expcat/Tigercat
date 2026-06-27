import React, { useId, useMemo, useState, useRef, useEffect } from 'react'
import {
  classNames,
  createGaugeArcPath,
  createGaugeNeedlePath,
  valueToGaugeAngle,
  computeGaugeTicks,
  getChartInnerRect,
  chartAxisTickTextClasses,
  getStableChartGradientPrefix,
  createGaugeAnimation,
  type ChartPadding,
  type GaugeChartProps as CoreGaugeChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'

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
  tooltipFormatter,
  label,
  segments,
  trackColor = 'var(--tiger-border,#e5e7eb)',
  color = 'var(--tiger-primary,#2563eb)',
  gradient = false,
  showTooltip = true,
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

  // rAF-driven animated angle
  const [animatedAngle, setAnimatedAngle] = useState(needleAngle)
  const prevAngleRef = useRef(needleAngle)

  useEffect(() => {
    const from = prevAngleRef.current
    const to = needleAngle
    prevAngleRef.current = to
    if (from === to) return
    const ctrl = createGaugeAnimation({
      from,
      to,
      onUpdate: (v) => setAnimatedAngle(v)
    })
    return () => ctrl.stop()
  }, [needleAngle])

  const ticks = useMemo(
    () =>
      showTicks ? computeGaugeTicks(cx, cy, radius, min, max, startAngle, endAngle, tickCount) : [],
    [showTicks, cx, cy, radius, min, max, startAngle, endAngle, tickCount]
  )

  const trackPath = createGaugeArcPath(cx, cy, radius, startAngle, endAngle, arcWidth)
  const valuePath =
    animatedAngle > startAngle
      ? createGaugeArcPath(cx, cy, radius, startAngle, animatedAngle, arcWidth)
      : null
  const needlePath = createGaugeNeedlePath(cx, cy, radius - arcWidth - 6, animatedAngle)

  const formattedValue = valueFormatter ? valueFormatter(value) : `${value}`

  // Tooltip (hover / focus over the gauge)
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0
  })
  const tooltipContent = tooltipFormatter
    ? tooltipFormatter(value)
    : label
      ? `${label}: ${formattedValue}`
      : formattedValue
  const handleTooltipMove = (e: React.MouseEvent) => {
    if (!showTooltip) return
    setTooltip({ visible: true, x: e.clientX, y: e.clientY })
  }
  const handleTooltipLeave = () => setTooltip((t) => ({ ...t, visible: false }))

  // Per-instance gradient ID (only used when gradient prop is on)
  const gradientId = useId()
  const gradientPrefix = useMemo(
    () => getStableChartGradientPrefix('gauge', gradientId),
    [gradientId]
  )
  const valueGradientId = `${gradientPrefix}-value`

  const wrapperRef = useRef<HTMLDivElement>(null)
  const handleTooltipFocus = () => {
    if (!showTooltip) return
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (rect)
      setTooltip({ visible: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }

  return (
    <div
      ref={wrapperRef}
      className="inline-block relative"
      tabIndex={showTooltip ? 0 : undefined}
      role="img"
      aria-label={label ? `${label}: ${formattedValue}` : formattedValue}
      onMouseMove={handleTooltipMove}
      onMouseLeave={handleTooltipLeave}
      onFocus={handleTooltipFocus}
      onBlur={handleTooltipLeave}>
      <ChartCanvas
        width={width}
        height={height}
        padding={padding}
        title={chartTitle}
        desc={desc}
        className={classNames(className)}>
        {/* Gradient defs (opt-in, only when gradient mode is on and value arc renders) */}
        {gradient && !segments && valuePath && (
          <defs>
            <linearGradient id={valueGradientId} x1={0} y1={0} x2={0} y2={1}>
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          </defs>
        )}

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
                fill={gradient ? `url(#${valueGradientId})` : color}
                strokeWidth={0}
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
        <path d={needlePath} fill="var(--tiger-text,#374151)" />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={5} fill="var(--tiger-text,#374151)" />

        {/* Value text */}
        <text
          x={cx}
          y={cy + radius * 0.35}
          className="fill-[color:var(--tiger-text,#374151)] text-lg font-semibold tabular-nums"
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
      {showTooltip && (
        <ChartTooltip
          content={tooltipContent}
          visible={tooltip.visible && tooltipContent !== ''}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
    </div>
  )
}
