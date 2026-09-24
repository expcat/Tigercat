/**
 * Nested squarify treemap layout.
 * Vue/React only bind the returned geometry.
 */

import type { TreeMapChartDatum } from '../types/chart'
import { DEFAULT_CHART_COLORS } from './chart/color'
import { chartLabelFill } from './heatmap-chart-utils'
import { isFiniteNumber } from './chart/layout'
import { devWarn } from './dev-warn'
import { scanFiniteExtent } from './chart/scale'
import { chartTreeNodeKey, createChartTreeVisit, type ChartTreeVisit } from './chart/tree-visit'

export const DEFAULT_TREEMAP_WIDTH = 400
export const DEFAULT_TREEMAP_HEIGHT = 300
export const DEFAULT_TREEMAP_PADDING = 8
export const DEFAULT_TREEMAP_GAP = 2
export const DEFAULT_TREEMAP_NODE_RADIUS = 2
export const DEFAULT_TREEMAP_MIN_LABEL_SIZE = 10

export const treemapNodeTransitionClasses =
  'transition-[opacity,filter] motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base)]'

export interface TreeMapNode {
  index: number
  label: string
  value: number
  depth: number
  x: number
  y: number
  w: number
  h: number
  color: string
  datum: TreeMapChartDatum
  parentIndex: number | null
  showLabel: boolean
  fontSize: number
  labelFill: string
}

export interface LayoutTreeMapOptions {
  width: number
  height: number
  gap?: number
  colors?: string[]
  minLabelSize?: number
}

interface SizedItem {
  datum: TreeMapChartDatum
  value: number
  depth: number
  color: string
}

function nodeValue(
  datum: TreeMapChartDatum,
  visit: ChartTreeVisit = createChartTreeVisit()
): number | null {
  const key = chartTreeNodeKey(datum)
  if (
    !visit.enter(
      key,
      ['TreeMapChart.cycle', 'TreeMapChart skipped a cyclic node'],
      ['TreeMapChart.duplicate', 'TreeMapChart skipped a duplicate node']
    )
  ) {
    return null
  }
  try {
  const children = datum.children
  if (children && children.length > 0) {
    let sum = 0
    let any = false
    for (const child of children) {
      const childValue = nodeValue(child, visit)
      if (childValue === null) continue
      any = true
      sum += childValue
    }
    if (any) {
      if (isFiniteNumber(datum.value) && datum.value !== sum) {
        devWarn(
          'TreeMapChart.parentValue',
          'TreeMapChart parent value differs from the sum of children; children sum is used for area'
        )
      }
      return sum
    }
  }
  if (!isFiniteNumber(datum.value)) {
    devWarn('TreeMapChart.nonFinite', 'TreeMapChart skipped a datum with a non-finite value')
    return null
  }
  if (datum.value < 0) {
    devWarn('TreeMapChart.negative', 'TreeMapChart skipped a datum with a negative value')
    return null
  }
  if (datum.value === 0) {
    devWarn('TreeMapChart.zero', 'TreeMapChart skipped a datum with value 0')
    return null
  }
  return datum.value
  } finally {
    visit.leave(key)
  }
}

function worst(row: number[], side: number): number {
  if (row.length === 0 || !(side > 0)) return Number.POSITIVE_INFINITY
  const sum = row.reduce((total, value) => total + value, 0)
  if (!(sum > 0)) return Number.POSITIVE_INFINITY
  const extent = scanFiniteExtent(row)
  const max = extent?.max ?? 0
  const min = extent?.min ?? 0
  return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min))
}

function pushNode(
  item: SizedItem,
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number,
  minLabelSize: number,
  out: TreeMapNode[],
  parentIndex: number | null
): TreeMapNode {
  const pad = gap / 2
  const node: TreeMapNode = {
    index: out.length,
    label: item.datum.label,
    value: item.value,
    depth: item.depth,
    x: x + pad,
    y: y + pad,
    w: Math.max(0, w - gap),
    h: Math.max(0, h - gap),
    color: item.color,
    datum: item.datum,
    showLabel: false,
    fontSize: minLabelSize,
    labelFill: chartLabelFill(item.color),
    parentIndex
  }
  const fontSize = Math.min(12, Math.max(8, Math.min(node.h * 0.3, node.w * 0.2)))
  node.fontSize = fontSize
  node.showLabel =
    node.w >= minLabelSize && node.h >= minLabelSize + 4 && fontSize >= minLabelSize * 0.6
  out.push(node)
  return node
}

function layoutRow(
  row: SizedItem[],
  x: number,
  y: number,
  w: number,
  h: number,
  horizontal: boolean,
  gap: number,
  minLabelSize: number,
  out: TreeMapNode[],
  parentIndex: number | null
): void {
  const total = row.reduce((sum, item) => sum + item.value, 0)
  let offset = 0
  for (const item of row) {
    const share = total > 0 ? item.value / total : 0
    if (horizontal) {
      const rowH = h * share
      layoutItem(item, x, y + offset, w, rowH, gap, minLabelSize, out, parentIndex)
      offset += rowH
    } else {
      const rowW = w * share
      layoutItem(item, x + offset, y, rowW, h, gap, minLabelSize, out, parentIndex)
      offset += rowW
    }
  }
}

function layoutItem(
  item: SizedItem,
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number,
  minLabelSize: number,
  out: TreeMapNode[],
  parentIndex: number | null
): void {
  const node = pushNode(item, x, y, w, h, gap, minLabelSize, out, parentIndex)
  const children = item.datum.children
  if (!children || children.length === 0) return
  const header = Math.min(18, Math.max(0, node.h * 0.22))
  const inset = Math.max(gap, 2)
  const childW = node.w - inset * 2
  const childH = node.h - header - inset
  if (childW <= 0 || childH <= 0) return
  const childItems = sizeItems(children, item.depth + 1, item.color)
  if (childItems.length === 0) return
  squarify(childItems, node.x + inset, node.y + header, childW, childH, gap, minLabelSize, out, node.index)
}

function squarify(
  items: SizedItem[],
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number,
  minLabelSize: number,
  out: TreeMapNode[],
  parentIndex: number | null
): void {
  if (items.length === 0 || w <= 0 || h <= 0) return
  if (items.length === 1) {
    layoutItem(items[0], x, y, w, h, gap, minLabelSize, out, parentIndex)
    return
  }

  const total = items.reduce((sum, item) => sum + item.value, 0)
  if (!(total > 0)) return
  const area = w * h
  const scale = area / total
  let remaining = items.slice()
  let cx = x
  let cy = y
  let cw = w
  let ch = h

  while (remaining.length > 0) {
    if (!(cw > 0) || !(ch > 0)) return
    const side = Math.min(cw, ch)
    const row: SizedItem[] = []
    const rowAreas: number[] = []
    while (remaining.length > 0) {
      const next = remaining[0]
      const nextArea = next.value * scale
      const candidate = rowAreas.concat(nextArea)
      if (row.length === 0 || worst(candidate, side) <= worst(rowAreas, side)) {
        row.push(remaining.shift()!)
        rowAreas.push(nextArea)
      } else {
        break
      }
    }
    const rowValue = row.reduce((sum, item) => sum + item.value, 0)
    const restValue = remaining.reduce((sum, item) => sum + item.value, 0)
    const rowShare = rowValue / (rowValue + restValue)
    const horizontal = cw >= ch
    if (horizontal) {
      const rowW = cw * rowShare
      layoutRow(row, cx, cy, rowW, ch, false, gap, minLabelSize, out, parentIndex)
      cx += rowW
      cw -= rowW
    } else {
      const rowH = ch * rowShare
      layoutRow(row, cx, cy, cw, rowH, true, gap, minLabelSize, out, parentIndex)
      cy += rowH
      ch -= rowH
    }
  }
}

function sizeItems(
  data: readonly TreeMapChartDatum[],
  depth: number,
  parentColor: string
): SizedItem[] {
  const items: SizedItem[] = []
  for (const datum of data) {
    const value = nodeValue(datum)
    if (value === null) continue
    items.push({
      datum,
      value,
      depth,
      color: datum.color ?? parentColor
    })
  }
  return items
}

export function layoutTreeMap(
  data: readonly TreeMapChartDatum[],
  opts: LayoutTreeMapOptions
): TreeMapNode[] {
  const safeWidth = isFiniteNumber(opts.width) ? Math.max(0, opts.width) : 0
  const safeHeight = isFiniteNumber(opts.height) ? Math.max(0, opts.height) : 0
  const gap = isFiniteNumber(opts.gap) ? Math.max(0, opts.gap) : 0
  const minLabelSize = isFiniteNumber(opts.minLabelSize)
    ? Math.max(0, opts.minLabelSize)
    : DEFAULT_TREEMAP_MIN_LABEL_SIZE
  if (safeWidth <= 0 || safeHeight <= 0) return []
  const palette = opts.colors && opts.colors.length > 0 ? opts.colors : DEFAULT_CHART_COLORS
  const items: SizedItem[] = []
  data.forEach((datum, index) => {
    const value = nodeValue(datum)
    if (value === null) return
    items.push({
      datum,
      value,
      depth: 0,
      color: datum.color ?? palette[index % palette.length]
    })
  })
  const out: TreeMapNode[] = []
  squarify(items, 0, 0, safeWidth, safeHeight, gap, minLabelSize, out, null)
  return out
}

export function nextTreeMapNodeIndex(
  index: number,
  key: string,
  nodes: readonly Pick<TreeMapNode, 'index' | 'x' | 'y' | 'w' | 'h' | 'parentIndex'>[]
): number {
  const current = nodes[index]
  if (!current) return index
  const cx = current.x + current.w / 2
  const cy = current.y + current.h / 2
  let best: number | null = null
  let bestDist = Number.POSITIVE_INFINITY
  for (const node of nodes) {
    if (node.index === current.index) continue
    const dx = node.x + node.w / 2 - cx
    const dy = node.y + node.h / 2 - cy
    const matches =
      key === 'ArrowRight'
        ? dx > 0 && Math.abs(dy) <= Math.abs(dx)
        : key === 'ArrowLeft'
          ? dx < 0 && Math.abs(dy) <= Math.abs(dx)
          : key === 'ArrowDown'
            ? dy > 0 && Math.abs(dx) <= Math.abs(dy)
            : key === 'ArrowUp'
              ? dy < 0 && Math.abs(dx) <= Math.abs(dy)
              : false
    if (!matches) continue
    const dist = dx * dx + dy * dy
    if (dist < bestDist) {
      bestDist = dist
      best = node.index
    }
  }
  if (best !== null) return best
  if (key === 'ArrowUp' && current.parentIndex !== null) return current.parentIndex
  if (key === 'ArrowDown') {
    const child = nodes.find((node) => node.parentIndex === current.index)
    if (child) return child.index
  }
  return index
}

export function computeTreeMapNodes(
  data: TreeMapChartDatum[],
  opts: LayoutTreeMapOptions
): TreeMapNode[] {
  return layoutTreeMap(data, opts)
}
