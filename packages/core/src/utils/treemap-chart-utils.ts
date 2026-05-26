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

type FlatItem = { label: string; value: number; depth: number; color?: string }

/** WeakMap cache: data array → flattened leaf list */
const flattenCache = new WeakMap<readonly TreeMapChartDatum[], FlatItem[]>()

/**
 * Flatten hierarchical data to a single level (sum children values).
 * Results are cached per data array reference.
 */
function flattenData(data: readonly TreeMapChartDatum[], depth: number = 0): FlatItem[] {
  if (depth === 0) {
    const cached = flattenCache.get(data)
    if (cached) return cached
  }
  const result: FlatItem[] = []
  for (const d of data) {
    if (d.children && d.children.length > 0) {
      result.push(...flattenData(d.children, depth + 1))
    } else {
      result.push({ label: d.label, value: d.value, depth, color: d.color })
    }
  }
  if (depth === 0) {
    flattenCache.set(data, result)
  }
  return result
}

/** Last-result memo cache for computeTreeMapNodes */
let _tmLastData: readonly TreeMapChartDatum[] | null = null
let _tmLastW = 0
let _tmLastH = 0
let _tmLastGap = 0
let _tmLastColors: readonly string[] | null = null
let _tmLastResult: TreeMapNode[] = []

/**
 * Compute squarified treemap layout.
 *
 * Uses a simplified slice-and-dice approach for reliable results.
 * Layout is memoized: identical inputs (by reference for data/colors,
 * by value for scalars) return the cached result.
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

  // Return cached result when inputs are unchanged
  if (
    data === _tmLastData &&
    width === _tmLastW &&
    height === _tmLastH &&
    gap === _tmLastGap &&
    palette === _tmLastColors
  ) {
    return _tmLastResult
  }

  const flat = flattenData(data)
  if (flat.length === 0) {
    _tmLastData = data
    _tmLastW = width
    _tmLastH = height
    _tmLastGap = gap
    _tmLastColors = palette
    _tmLastResult = []
    return _tmLastResult
  }

  const totalValue = flat.reduce((s, d) => s + d.value, 0)
  if (totalValue === 0) {
    _tmLastData = data
    _tmLastW = width
    _tmLastH = height
    _tmLastGap = gap
    _tmLastColors = palette
    _tmLastResult = []
    return _tmLastResult
  }

  // Sort descending
  const sorted = flat.map((d, i) => ({ ...d, originalIndex: i })).sort((a, b) => b.value - a.value)

  const nodes: TreeMapNode[] = []
  layoutRect(sorted, 0, 0, width, height, gap, palette, nodes)

  _tmLastData = data
  _tmLastW = width
  _tmLastH = height
  _tmLastGap = gap
  _tmLastColors = palette
  _tmLastResult = nodes
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
