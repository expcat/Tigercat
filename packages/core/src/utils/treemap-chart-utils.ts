/**
 * TreeMap chart utilities
 * Squarified treemap layout algorithm
 */

import type { TreeMapChartDatum } from '../types/chart'
import { DEFAULT_CHART_COLORS } from './chart-utils'

export interface TreeMapNode {
  /** Index in the flat list */
  index: number
  /** Label */
  label: string
  /** Value */
  value: number
  /** Depth level (0 = root children) */
  depth: number
  /** Pixel position */
  x: number
  y: number
  w: number
  h: number
  /** Fill color */
  color: string
}

/**
 * Flatten hierarchical data to a single level (sum children values).
 */
function flattenData(
  data: TreeMapChartDatum[],
  depth: number = 0
): Array<{ label: string; value: number; depth: number; color?: string }> {
  const result: Array<{ label: string; value: number; depth: number; color?: string }> = []
  for (const d of data) {
    if (d.children && d.children.length > 0) {
      result.push(...flattenData(d.children, depth + 1))
    } else {
      result.push({ label: d.label, value: d.value, depth, color: d.color })
    }
  }
  return result
}

/**
 * Compute squarified treemap layout.
 *
 * Uses a simplified slice-and-dice approach for reliable results.
 */
export function computeTreeMapNodes(
  data: TreeMapChartDatum[],
  opts: {
    width: number
    height: number
    gap?: number
    colors?: string[]
  }
): TreeMapNode[] {
  const { width, height, gap = 2, colors } = opts
  const palette = colors ?? DEFAULT_CHART_COLORS
  const flat = flattenData(data)
  if (flat.length === 0) return []

  const totalValue = flat.reduce((s, d) => s + d.value, 0)
  if (totalValue === 0) return []

  // Sort descending
  const sorted = flat.map((d, i) => ({ ...d, originalIndex: i })).sort((a, b) => b.value - a.value)

  const nodes: TreeMapNode[] = []
  layoutRect(sorted, 0, 0, width, height, gap, palette, nodes)
  return nodes
}

function layoutRect(
  items: Array<{
    label: string
    value: number
    depth: number
    color?: string
    originalIndex: number
  }>,
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number,
  palette: readonly string[],
  out: TreeMapNode[]
): void {
  if (items.length === 0 || w <= 0 || h <= 0) return

  if (items.length === 1) {
    const item = items[0]
    out.push({
      index: item.originalIndex,
      label: item.label,
      value: item.value,
      depth: item.depth,
      x: x + gap / 2,
      y: y + gap / 2,
      w: Math.max(0, w - gap),
      h: Math.max(0, h - gap),
      color: item.color ?? palette[item.originalIndex % palette.length]
    })
    return
  }

  const total = items.reduce((s, d) => s + d.value, 0)
  const isWide = w >= h

  // Split items where first group fills ~half the area
  let runSum = 0
  let splitIdx = 1
  for (let i = 0; i < items.length - 1; i++) {
    runSum += items[i].value
    if (runSum / total >= 0.5) {
      splitIdx = i + 1
      break
    }
    splitIdx = i + 1
  }

  const firstGroup = items.slice(0, splitIdx)
  const secondGroup = items.slice(splitIdx)
  const firstRatio = firstGroup.reduce((s, d) => s + d.value, 0) / total

  if (isWide) {
    const splitW = w * firstRatio
    layoutRect(firstGroup, x, y, splitW, h, gap, palette, out)
    layoutRect(secondGroup, x + splitW, y, w - splitW, h, gap, palette, out)
  } else {
    const splitH = h * firstRatio
    layoutRect(firstGroup, x, y, w, splitH, gap, palette, out)
    layoutRect(secondGroup, x, y + splitH, w, h - splitH, gap, palette, out)
  }
}
