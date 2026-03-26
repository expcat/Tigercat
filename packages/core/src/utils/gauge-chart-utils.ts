/**
 * Gauge chart utilities
 * Arc geometry helpers for rendering gauge (speedometer) charts
 */

import { polarToCartesian } from './chart-utils'

export interface GaugeArc {
  /** SVG arc path `d` */
  path: string
}

/**
 * Convert degrees to radians.
 */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
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
  const outerR = radius
  const innerR = radius - arcWidth

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
  const tipX = cx + length * Math.cos(rad)
  const tipY = cy + length * Math.sin(rad)

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
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return startAngle + ratio * (endAngle - startAngle)
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
  for (let i = 0; i <= tickCount; i++) {
    const ratio = i / tickCount
    const val = min + ratio * (max - min)
    const angle = startAngle + ratio * (endAngle - startAngle)
    const rad = degToRad(angle - 90)
    const outerX = cx + radius * Math.cos(rad)
    const outerY = cy + radius * Math.sin(rad)
    const innerX = cx + (radius - 8) * Math.cos(rad)
    const innerY = cy + (radius - 8) * Math.sin(rad)
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
