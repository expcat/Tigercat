/**
 * Funnel chart utilities
 * Geometry helpers for rendering funnel chart segments as SVG paths
 */

import type { FunnelChartDatum } from '../types/chart'
import { DEFAULT_CHART_COLORS } from './chart-utils'
import { devWarn } from './dev-warn'

export interface FunnelSegment {
  /** Index in original data */
  index: number
  /** Original label (may be missing) */
  label?: string
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
  /** Width at top of segment (vertical) or height at start (horizontal) */
  topWidth: number
  /** Width at bottom of segment (vertical) or height at end (horizontal) */
  bottomWidth: number
}

export interface LayoutFunnelOptions {
  width: number
  height: number
  gap?: number
  pinch?: boolean
  colors?: string[]
  direction?: 'vertical' | 'horizontal'
}

/**
 * Layout funnel segments. Vertical: y increases, width follows value.
 * Horizontal: x increases, height follows value.
 */
export function computeFunnelSegments(
  data: FunnelChartDatum[],
  opts: LayoutFunnelOptions
): FunnelSegment[] {
  if (data.length === 0) return []

  const { width, height, gap = 2, pinch = false, colors, direction = 'vertical' } = opts
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0
  const safeHeight = Number.isFinite(height) ? Math.max(0, height) : 0
  const safeGap = Number.isFinite(gap) ? Math.max(0, gap) : 0
  if (safeWidth <= 0 || safeHeight <= 0) return []

  const palette = colors ?? DEFAULT_CHART_COLORS
  const valid: Array<{ datum: FunnelChartDatum; index: number; value: number }> = []
  data.forEach((datum, index) => {
    if (!Number.isFinite(datum.value)) {
      devWarn('FunnelChart.nonFinite', 'FunnelChart skipped a datum with a non-finite value')
      return
    }
    if (datum.value < 0) {
      devWarn('FunnelChart.negative', 'FunnelChart skipped a datum with a negative value')
      return
    }
    if (datum.value === 0) {
      devWarn('FunnelChart.zero', 'FunnelChart skipped a datum with value 0')
      return
    }
    valid.push({ datum, index, value: datum.value })
  })
  if (valid.length === 0) return []

  const maxValue = Math.max(...valid.map((item) => item.value))
  if (maxValue <= 0) return []

  for (let i = 1; i < valid.length; i++) {
    if (valid[i].value > valid[i - 1].value) {
      devWarn('FunnelChart.order', 'FunnelChart data is not ordered from widest to narrowest')
      break
    }
  }

  const horizontal = direction === 'horizontal'
  const main = horizontal ? safeWidth : safeHeight
  const cross = horizontal ? safeHeight : safeWidth
  const totalGap = Math.min(main, safeGap * (valid.length - 1))
  const segMain = Math.max(0, (main - totalGap) / valid.length)
  if (segMain <= 0) return []
  const halfCross = cross / 2

  return valid
    .map((item, i) => {
      const value = item.value
      const startRatio = value / maxValue
      const nextVal = i < valid.length - 1 ? valid[i + 1].value : pinch ? 0 : value
      const endRatio = nextVal / maxValue
      const startCross = cross * startRatio
      const endCross = cross * endRatio
      const origin = i * (segMain + safeGap)

      if (horizontal) {
        const x = origin
        const y1 = halfCross - startCross / 2
        const y2 = halfCross + startCross / 2
        const y3 = halfCross + endCross / 2
        const y4 = halfCross - endCross / 2
        const path = `M${x},${y1} L${x + segMain},${y4} L${x + segMain},${y3} L${x},${y2} Z`
        return {
          index: item.index,
          label: item.datum.label,
          value,
          color: item.datum.color ?? palette[item.index % palette.length],
          path: path.includes('NaN') ? '' : path,
          cx: x + segMain / 2,
          cy: halfCross,
          topWidth: startCross,
          bottomWidth: endCross
        }
      }

      const y = origin
      const x1 = halfCross - startCross / 2
      const x2 = halfCross + startCross / 2
      const x3 = halfCross + endCross / 2
      const x4 = halfCross - endCross / 2
      const path = `M${x1},${y} L${x2},${y} L${x3},${y + segMain} L${x4},${y + segMain} Z`
      return {
        index: item.index,
        label: item.datum.label,
        value,
        color: item.datum.color ?? palette[item.index % palette.length],
        path: path.includes('NaN') ? '' : path,
        cx: halfCross,
        cy: y + segMain / 2,
        topWidth: startCross,
        bottomWidth: endCross
      }
    })
    .filter((segment) => segment.path !== '')
}

export const layoutFunnel = computeFunnelSegments
