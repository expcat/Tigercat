/**
 * Gauge chart utilities
 * Arc geometry helpers for rendering gauge (speedometer) charts
 *
 * Angles are degrees, 0 = 12 o'clock, clockwise.
 */

import { prefersReducedMotion } from './transition'
import { DEFAULT_GAUGE_END_ANGLE, DEFAULT_GAUGE_START_ANGLE } from './chart/polar'

export interface GaugeArc {
  /** SVG arc path `d` */
  path: string
}

/* ------------------------------------------------------------------ */
/*  Easing                                                             */
/* ------------------------------------------------------------------ */

function easeOutCubic(t: number): number {
  const c = Math.min(1, Math.max(0, t))
  return 1 - (1 - c) ** 3
}

/* ------------------------------------------------------------------ */
/*  rAF Animation                                                      */
/* ------------------------------------------------------------------ */

export interface GaugeAnimationOptions {
  from: number
  to: number
  duration?: number
  onUpdate: (angle: number) => void
  onComplete?: () => void
  requestAnimationFrame?: (cb: FrameRequestCallback) => number
  cancelAnimationFrame?: (id: number) => void
}

export interface GaugeAnimationController {
  stop: () => void
}

export const GAUGE_ANIMATION_DURATION_MS = 600

/**
 * Animate a gauge value (angle) from `from` to `to` using rAF + easeOutCubic.
 * Returns a controller with a `stop()` method to cancel the animation.
 */
export function createGaugeAnimation(options: GaugeAnimationOptions): GaugeAnimationController {
  const duration = options.duration ?? GAUGE_ANIMATION_DURATION_MS
  const requestFrame =
    options.requestAnimationFrame ??
    (typeof globalThis.requestAnimationFrame === 'function'
      ? globalThis.requestAnimationFrame.bind(globalThis)
      : undefined)
  const cancelFrame =
    options.cancelAnimationFrame ??
    (typeof globalThis.cancelAnimationFrame === 'function'
      ? globalThis.cancelAnimationFrame.bind(globalThis)
      : undefined)

  if (!requestFrame || duration <= 0 || options.from === options.to || prefersReducedMotion()) {
    options.onUpdate(options.to)
    options.onComplete?.()
    return { stop: () => undefined }
  }

  let frameId: number | null = null
  let startTime: number | null = null
  let stopped = false

  const stop = () => {
    if (stopped) return
    stopped = true
    if (frameId !== null && cancelFrame) cancelFrame(frameId)
    frameId = null
  }

  const tick = (timestamp: number) => {
    if (stopped) return
    if (startTime === null) startTime = timestamp

    const elapsed = timestamp - startTime
    const progress = Math.min(1, elapsed / duration)
    const eased = easeOutCubic(progress)
    options.onUpdate(options.from + (options.to - options.from) * eased)

    if (progress < 1) {
      frameId = requestFrame(tick)
      return
    }

    frameId = null
    options.onComplete?.()
  }

  frameId = requestFrame(tick)
  return { stop }
}

/**
 * Convert degrees to radians.
 */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

function safeNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback
}

/**
 * Create an SVG arc path for a gauge segment.
 *
 * Angles are in degrees, 0 = 12 o'clock, clockwise.
 */
export function createGaugeArcPath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
  arcWidth: number
): string {
  if (![cx, cy, radius, startDeg, endDeg, arcWidth].every((value) => Number.isFinite(value))) {
    return ''
  }
  const outerR = Math.max(0, safeNumber(radius))
  const safeArcWidth = Math.max(0, safeNumber(arcWidth))
  const innerR = Math.max(0, outerR - safeArcWidth)

  // Convert to standard math angles (0=3 o'clock, CCW positive)
  // We use clockwise from top (12 o'clock) so adjust:
  const startRad = degToRad(startDeg - 90)
  const endRad = degToRad(endDeg - 90)

  const outerStart = {
    x: cx + outerR * Math.cos(startRad),
    y: cy + outerR * Math.sin(startRad)
  }
  const outerEnd = {
    x: cx + outerR * Math.cos(endRad),
    y: cy + outerR * Math.sin(endRad)
  }
  const innerStart = {
    x: cx + innerR * Math.cos(endRad),
    y: cy + innerR * Math.sin(endRad)
  }
  const innerEnd = {
    x: cx + innerR * Math.cos(startRad),
    y: cy + innerR * Math.sin(startRad)
  }

  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0

  return [
    `M${outerStart.x},${outerStart.y}`,
    `A${outerR},${outerR} 0 ${largeArc} 1 ${outerEnd.x},${outerEnd.y}`,
    `L${innerStart.x},${innerStart.y}`,
    `A${innerR},${innerR} 0 ${largeArc} 0 ${innerEnd.x},${innerEnd.y}`,
    'Z'
  ].join(' ')
}

/**
 * Create the needle (pointer) path for a gauge.
 */
export function createGaugeNeedlePath(
  cx: number,
  cy: number,
  length: number,
  angleDeg: number,
  needleWidth: number = 4
): string {
  const rad = degToRad(angleDeg - 90)
  const safeLength = Math.max(0, safeNumber(length))
  const tipX = cx + safeLength * Math.cos(rad)
  const tipY = cy + safeLength * Math.sin(rad)

  // Perpendicular offset for base width
  const perpRad = rad + Math.PI / 2
  const halfW = needleWidth / 2
  const bx1 = cx + halfW * Math.cos(perpRad)
  const by1 = cy + halfW * Math.sin(perpRad)
  const bx2 = cx - halfW * Math.cos(perpRad)
  const by2 = cy - halfW * Math.sin(perpRad)

  return `M${bx1},${by1} L${tipX},${tipY} L${bx2},${by2} Z`
}

/**
 * Map a value to a gauge angle.
 */
export function valueToGaugeAngle(
  value: number,
  min: number,
  max: number,
  startAngle: number,
  endAngle: number
): number {
  const safeStart = safeNumber(startAngle)
  const safeEnd = safeNumber(endAngle, safeStart)
  const safeMin = safeNumber(min)
  const safeMax = safeNumber(max, safeMin)
  if (safeMax <= safeMin) return safeStart
  const ratio = Math.max(
    0,
    Math.min(1, (safeNumber(value, safeMin) - safeMin) / (safeMax - safeMin))
  )
  return safeStart + ratio * (safeEnd - safeStart)
}

/**
 * Compute tick positions along the gauge arc.
 */
export function computeGaugeTicks(
  cx: number,
  cy: number,
  radius: number,
  min: number,
  max: number,
  startAngle: number,
  endAngle: number,
  tickCount: number
): Array<{
  x1: number
  y1: number
  x2: number
  y2: number
  value: number
  label: string
  labelX: number
  labelY: number
}> {
  const ticks = []
  const safeTickCount = Math.max(1, Math.floor(safeNumber(tickCount, 1)))
  const safeRadius = Math.max(0, safeNumber(radius))
  const safeMin = safeNumber(min)
  const safeMax = safeNumber(max, safeMin)
  const safeStart = safeNumber(startAngle)
  const safeEnd = safeNumber(endAngle, safeStart)
  for (let i = 0; i <= safeTickCount; i++) {
    const ratio = i / safeTickCount
    const val = safeMax <= safeMin ? safeMin : safeMin + ratio * (safeMax - safeMin)
    const angle = safeStart + ratio * (safeEnd - safeStart)
    const rad = degToRad(angle - 90)
    const innerRadius = Math.max(0, safeRadius - 8)
    const outerX = cx + safeRadius * Math.cos(rad)
    const outerY = cy + safeRadius * Math.sin(rad)
    const innerX = cx + innerRadius * Math.cos(rad)
    const innerY = cy + innerRadius * Math.sin(rad)
    const labelRadius = safeRadius + 12
    ticks.push({
      x1: innerX,
      y1: innerY,
      x2: outerX,
      y2: outerY,
      value: val,
      label: Math.round(val).toString(),
      labelX: cx + labelRadius * Math.cos(rad),
      labelY: cy + labelRadius * Math.sin(rad)
    })
  }
  return ticks
}

export interface LayoutGaugeOptions {
  innerWidth: number
  innerHeight: number
  value: number
  min: number
  max: number
  startAngle?: number
  endAngle?: number
  arcWidth?: number
  showTicks?: boolean
  tickCount?: number
  segments?: Array<{ range: [number, number]; color: string }>
  valueFormatter?: (value: number) => string
  label?: string
}

export interface LaidOutGauge {
  cx: number
  cy: number
  radius: number
  startAngle: number
  endAngle: number
  valueAngle: number
  trackPath: string
  valuePath: string | null
  segmentPaths: Array<{ path: string; color: string }>
  ticks: ReturnType<typeof computeGaugeTicks>
  needlePath: string
  valueText: { x: number; y: number; text: string }
  labelText: { x: number; y: number; text: string } | null
}

export function layoutGauge(options: LayoutGaugeOptions): LaidOutGauge {
  const cx = options.innerWidth / 2
  const cy = options.innerHeight / 2
  const startAngle = Number.isFinite(options.startAngle)
    ? (options.startAngle as number)
    : DEFAULT_GAUGE_START_ANGLE
  const endAngle = Number.isFinite(options.endAngle)
    ? (options.endAngle as number)
    : DEFAULT_GAUGE_END_ANGLE
  const arcWidth = Math.max(0, options.arcWidth ?? 20)
  const tickSpace = options.showTicks === false ? 4 : 20
  const radius = Math.max(0, Math.min(options.innerWidth, options.innerHeight) / 2 - tickSpace)
  const min = options.min
  const max = options.max
  const valueAngle = valueToGaugeAngle(options.value, min, max, startAngle, endAngle)
  const trackPath = createGaugeArcPath(cx, cy, radius, startAngle, endAngle, arcWidth)
  const valuePath =
    valueAngle === startAngle
      ? null
      : createGaugeArcPath(cx, cy, radius, startAngle, valueAngle, arcWidth)
  const segmentPaths = (options.segments ?? [])
    .map((seg) => {
      const sStart = valueToGaugeAngle(seg.range[0], min, max, startAngle, endAngle)
      const sEnd = valueToGaugeAngle(seg.range[1], min, max, startAngle, endAngle)
      return {
        path: createGaugeArcPath(cx, cy, radius, sStart, sEnd, arcWidth),
        color: seg.color
      }
    })
    .filter((seg) => seg.path !== '')
  const ticks =
    options.showTicks === false
      ? []
      : computeGaugeTicks(cx, cy, radius, min, max, startAngle, endAngle, options.tickCount ?? 5)
  const formatted = options.valueFormatter
    ? options.valueFormatter(options.value)
    : `${options.value}`
  if (options.valueFormatter) {
    ticks.forEach((tick) => {
      tick.label = options.valueFormatter!(tick.value)
    })
  }
  return {
    cx,
    cy,
    radius,
    startAngle,
    endAngle,
    valueAngle,
    trackPath,
    valuePath,
    segmentPaths,
    ticks,
    needlePath: createGaugeNeedlePath(cx, cy, Math.max(0, radius - arcWidth - 6), valueAngle),
    valueText: {
      x: cx,
      y: cy + radius * 0.35,
      text: formatted
    },
    labelText: options.label ? { x: cx, y: cy + radius * 0.35 + 20, text: options.label } : null
  }
}
