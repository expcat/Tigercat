/**
 * Sunburst chart utilities
 * Multi-level arc layout for hierarchical data
 */

import type { SunburstChartDatum } from '../types/chart'
import { DEFAULT_CHART_COLORS } from './chart-utils'
import { createPieArcPath } from './chart-utils'

export interface SunburstArc {
  /** Flat list index */
  index: number
  /** Label */
  label: string
  /** Value */
  value: number
  /** Ring depth (0 = innermost) */
  depth: number
  /** Start angle in radians */
  startAngle: number
  /** End angle in radians */
  endAngle: number
  /** Fill color */
  color: string
  /** SVG arc path */
  path: string
  /** Midpoint angle (for labels) */
  midAngle: number
}

/**
 * Flatten hierarchical data into arc descriptors with depth levels.
 */
export function computeSunburstArcs(
  data: SunburstChartDatum[],
  opts: {
    cx: number
    cy: number
    innerRadius: number
    outerRadius: number
    colors?: string[]
  }
): SunburstArc[] {
  const { cx, cy, innerRadius, outerRadius, colors } = opts
  const palette = colors ?? DEFAULT_CHART_COLORS

  // Determine max depth
  function maxDepth(items: SunburstChartDatum[], d: number): number {
    let m = d
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        m = Math.max(m, maxDepth(item.children, d + 1))
      }
    }
    return m
  }

  const depth = maxDepth(data, 0)
  const ringWidth =
    depth > 0 ? (outerRadius - innerRadius) / (depth + 1) : outerRadius - innerRadius

  const arcs: SunburstArc[] = []
  let flatIndex = 0

  function layoutLevel(
    items: SunburstChartDatum[],
    startAngle: number,
    endAngle: number,
    level: number,
    parentColorIdx: number
  ): void {
    const total = items.reduce((s, d) => s + sumValue(d), 0)
    if (total === 0) return

    let angle = startAngle
    items.forEach((item, i) => {
      const val = sumValue(item)
      const sweep = ((endAngle - startAngle) * val) / total
      const sa = angle
      const ea = angle + sweep

      const iR = innerRadius + level * ringWidth
      const oR = iR + ringWidth - 1 // 1px gap between rings

      const colorIdx = level === 0 ? i : parentColorIdx
      const color = item.color ?? palette[colorIdx % palette.length]

      const path = createPieArcPath({
        cx,
        cy,
        innerRadius: iR,
        outerRadius: oR,
        startAngle: sa,
        endAngle: ea
      })

      arcs.push({
        index: flatIndex++,
        label: item.label,
        value: item.value,
        depth: level,
        startAngle: sa,
        endAngle: ea,
        color,
        path,
        midAngle: (sa + ea) / 2
      })

      if (item.children && item.children.length > 0) {
        layoutLevel(item.children, sa, ea, level + 1, colorIdx)
      }

      angle = ea
    })
  }

  layoutLevel(data, -Math.PI / 2, (3 * Math.PI) / 2, 0, 0)

  return arcs
}

function sumValue(d: SunburstChartDatum): number {
  if (d.children && d.children.length > 0) {
    return d.children.reduce((s, c) => s + sumValue(c), 0)
  }
  return d.value
}
