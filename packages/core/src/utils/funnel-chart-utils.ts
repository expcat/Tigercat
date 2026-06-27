/**
 * Funnel chart utilities
 * Geometry helpers for rendering funnel chart segments as SVG paths
 */

import type { FunnelChartDatum } from '../types/chart'
import { DEFAULT_CHART_COLORS } from './chart-utils'

export interface FunnelSegment {
  /** Index in original data */
  index: number
  /** Label text */
  label: string
  /** Original value */
  value: number
  /** Resolved fill color */
  color: string
  /** SVG path `d` for the trapezoid / triangle */
  path: string
  /** Center x of the segment (for label positioning) */
  cx: number
  /** Center y of the segment */
  cy: number
  /** Width at top of segment */
  topWidth: number
  /** Width at bottom of segment */
  bottomWidth: number
}

/**
 * Compute funnel segments (vertical layout).
 *
 * Each segment is a trapezoid whose top-width comes from its own value
 * and bottom-width from the next item's value (or `pinch → 0` for last).
 */
export function computeFunnelSegments(
  data: FunnelChartDatum[],
  opts: {
    width: number
    height: number
    gap?: number
    pinch?: boolean
    colors?: string[]
  }
): FunnelSegment[] {
  if (data.length === 0) return []

  const { width, height, gap = 2, pinch = false, colors } = opts
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0
  const safeHeight = Number.isFinite(height) ? Math.max(0, height) : 0
  const safeGap = Number.isFinite(gap) ? Math.max(0, gap) : 0
  if (safeWidth <= 0 || safeHeight <= 0) return []

  const palette = colors ?? DEFAULT_CHART_COLORS
  const values = data.map((d) => (Number.isFinite(d.value) ? Math.max(0, d.value) : 0))
  const maxValue = Math.max(...values)
  if (maxValue <= 0) return []

  const totalGap = Math.min(safeHeight, safeGap * (data.length - 1))
  const segH = Math.max(0, (safeHeight - totalGap) / data.length)
  const halfW = safeWidth / 2

  return data.map((d, i) => {
    const value = values[i]
    const topRatio = value / maxValue
    const nextVal = i < data.length - 1 ? values[i + 1] : pinch ? 0 : value
    const bottomRatio = nextVal / maxValue

    const tw = safeWidth * topRatio
    const bw = safeWidth * bottomRatio
    const y = i * (segH + safeGap)
    const cx = halfW
    const cy = y + segH / 2

    const x1 = cx - tw / 2
    const x2 = cx + tw / 2
    const x3 = cx + bw / 2
    const x4 = cx - bw / 2

    const path = `M${x1},${y} L${x2},${y} L${x3},${y + segH} L${x4},${y + segH} Z`

    return {
      index: i,
      label: d.label ?? `Stage ${i + 1}`,
      value,
      color: d.color ?? palette[i % palette.length],
      path,
      cx,
      cy,
      topWidth: tw,
      bottomWidth: bw
    }
  })
}
