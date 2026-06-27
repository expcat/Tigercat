/**
 * Gauge chart utilities
 * Arc geometry helpers for rendering gauge (speedometer) charts
 */

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

  if (!requestFrame || duration <= 0 || options.from === options.to) {
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
 * Angles are in degrees, measured clockwise from 12-o'clock (CSS-style).
 */
export function createGaugeArcPath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
  arcWidth: number
): string {
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
  const ratio = Math.max(0, Math.min(1, (safeNumber(value, safeMin) - safeMin) / (safeMax - safeMin)))
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
): Array<{ x1: number; y1: number; x2: number; y2: number; value: number; label: string }> {
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
    ticks.push({
      x1: innerX,
      y1: innerY,
      x2: outerX,
      y2: outerY,
      value: val,
      label: Math.round(val).toString()
    })
  }
  return ticks
}
