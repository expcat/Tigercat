/**
 * Multi-level sunburst layout. Starts at 12 o'clock and runs clockwise.
 * Vue/React only bind the returned geometry.
 */

import type { SunburstChartDatum } from '../types/chart'
import { DEFAULT_CHART_COLORS } from './chart/color'
import { createPieArcPath, polarToCartesian } from './chart/path'
import { chartLabelFill } from './heatmap-chart-utils'
import { isFiniteNumber } from './chart/layout'
import { devWarn } from './dev-warn'
import { chartTreeNodeKey, createChartTreeVisit, type ChartTreeVisit } from './chart/tree-visit'

export const DEFAULT_SUNBURST_SIZE = 320
export const DEFAULT_SUNBURST_PADDING = 24
export const DEFAULT_SUNBURST_START_ANGLE = -Math.PI / 2
export const DEFAULT_SUNBURST_END_ANGLE = (3 * Math.PI) / 2

export const sunburstArcTransitionClasses =
  'transition-[opacity,filter] motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base)]'

export interface SunburstArc {
  index: number
  label: string
  value: number
  depth: number
  startAngle: number
  endAngle: number
  color: string
  path: string
  midAngle: number
  innerRadius: number
  outerRadius: number
  datum: SunburstChartDatum
  parentIndex: number | null
  childIndices: number[]
  showLabel: boolean
  labelX: number
  labelY: number
  labelFill: string
  percent: number
}

export interface LayoutSunburstOptions {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  colors?: string[]
}

interface SizedSunburstNode {
  datum: SunburstChartDatum
  value: number
  children: SizedSunburstNode[]
}

/**
 * Resolve the effective tree in a single DFS holding one visit. A back-edge or
 * a repeated object is skipped while its first appearance is kept, and
 * every value aggregates over exactly the participating children, so depth,
 * totals and layout all consume the same safe tree.
 */
function resolveSunburstTree(
  data: readonly SunburstChartDatum[],
  visit: ChartTreeVisit
): SizedSunburstNode[] {
  const nodes: SizedSunburstNode[] = []
  for (const datum of data) {
    const key = chartTreeNodeKey(datum)
    if (
      !visit.enter(
        key,
        ['SunburstChart.cycle', 'SunburstChart skipped a cyclic node'],
        ['SunburstChart.duplicate', 'SunburstChart skipped a duplicate node']
      )
    ) {
      continue
    }
    const children =
      datum.children && datum.children.length > 0 ? resolveSunburstTree(datum.children, visit) : []
    visit.leave(key)
    let value: number | null = null
    if (children.length > 0) {
      value = children.reduce((sum, child) => sum + child.value, 0)
      if (isFiniteNumber(datum.value) && datum.value !== value) {
        devWarn(
          'SunburstChart.parentValue',
          'SunburstChart parent value differs from the sum of children; children sum is used for sweep'
        )
      }
    } else if (!isFiniteNumber(datum.value)) {
      devWarn('SunburstChart.nonFinite', 'SunburstChart skipped a datum with a non-finite value')
    } else if (datum.value < 0) {
      devWarn('SunburstChart.negative', 'SunburstChart skipped a datum with a negative value')
    } else if (datum.value === 0) {
      devWarn('SunburstChart.zero', 'SunburstChart skipped a datum with value 0')
    } else {
      value = datum.value
    }
    if (value !== null) nodes.push({ datum, value, children })
  }
  return nodes
}

function maxDrawnDepth(nodes: readonly SizedSunburstNode[]): number {
  let max = 0
  const walk = (items: readonly SizedSunburstNode[], depth: number) => {
    for (const item of items) {
      max = Math.max(max, depth)
      if (item.children.length > 0) walk(item.children, depth + 1)
    }
  }
  walk(nodes, 0)
  return max
}

export function getSunburstLabelPoint(
  arc: Pick<SunburstArc, 'innerRadius' | 'outerRadius' | 'midAngle'>,
  cx: number,
  cy: number
): { x: number; y: number } {
  const midRadius = (arc.innerRadius + arc.outerRadius) / 2
  return polarToCartesian(cx, cy, midRadius, arc.midAngle)
}

export function nextSunburstArcIndex(
  index: number,
  key: string,
  arcs: readonly SunburstArc[]
): number {
  const arc = arcs[index]
  if (!arc) return index
  if (key === 'ArrowUp' && arc.parentIndex !== null) return arc.parentIndex
  if (key === 'ArrowDown' && arc.childIndices.length > 0) return arc.childIndices[0]
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const siblings = arcs.filter(
      (item) => item.depth === arc.depth && item.parentIndex === arc.parentIndex
    )
    const pos = siblings.findIndex((item) => item.index === arc.index)
    if (pos < 0 || siblings.length === 0) return index
    const delta = key === 'ArrowRight' ? 1 : -1
    const next = siblings[(pos + delta + siblings.length) % siblings.length]
    return next.index
  }
  return index
}

export function layoutSunburst(
  data: readonly SunburstChartDatum[],
  opts: LayoutSunburstOptions
): SunburstArc[] {
  const cx = isFiniteNumber(opts.cx) ? opts.cx : 0
  const cy = isFiniteNumber(opts.cy) ? opts.cy : 0
  const safeInner = isFiniteNumber(opts.innerRadius) ? Math.max(0, opts.innerRadius) : 0
  const safeOuter = isFiniteNumber(opts.outerRadius)
    ? Math.max(safeInner, opts.outerRadius)
    : safeInner
  if (!(safeOuter > safeInner) && safeOuter <= 0) return []
  const palette = opts.colors && opts.colors.length > 0 ? opts.colors : DEFAULT_CHART_COLORS
  const sized = resolveSunburstTree(data, createChartTreeVisit())
  const depth = maxDrawnDepth(sized)
  const ringCount = depth + 1
  const ringWidth = ringCount > 0 ? (safeOuter - safeInner) / ringCount : 0
  const arcs: SunburstArc[] = []
  const rootTotal = sized.reduce((sum, item) => sum + item.value, 0)
  if (!(rootTotal > 0)) return []

  const layoutLevel = (
    items: readonly SizedSunburstNode[],
    startAngle: number,
    endAngle: number,
    level: number,
    parentIndex: number | null,
    parentColor: string
  ): number[] => {
    const total = items.reduce((sum, item) => sum + item.value, 0)
    if (!(total > 0)) return []
    const childIndices: number[] = []
    let angle = startAngle
    items.forEach((item, i) => {
      const sweep = ((endAngle - startAngle) * item.value) / total
      const sa = angle
      const ea = angle + sweep
      const hasChildren = item.children.length > 0
      const iR = safeInner + level * ringWidth
      const oR = hasChildren ? Math.max(iR, iR + ringWidth - 1) : safeOuter
      const color = item.datum.color ?? (level === 0 ? palette[i % palette.length] : parentColor)
      const path = createPieArcPath({
        cx,
        cy,
        innerRadius: iR,
        outerRadius: oR,
        startAngle: sa,
        endAngle: ea
      })
      if (!path || path.includes('NaN')) {
        angle = ea
        return
      }
      const midAngle = (sa + ea) / 2
      const midRadius = (iR + oR) / 2
      const arcLength = Math.abs(ea - sa) * midRadius
      const labelPos = polarToCartesian(cx, cy, midRadius, midAngle)
      const index = arcs.length
      arcs.push({
        index,
        label: item.datum.label,
        value: item.value,
        depth: level,
        startAngle: sa,
        endAngle: ea,
        color,
        path,
        midAngle,
        innerRadius: iR,
        outerRadius: oR,
        datum: item.datum,
        parentIndex,
        childIndices: [],
        showLabel: arcLength >= 14 && oR - iR >= 10,
        labelX: labelPos.x,
        labelY: labelPos.y,
        labelFill: chartLabelFill(color),
        percent: rootTotal > 0 ? (item.value / rootTotal) * 100 : 0
      })
      childIndices.push(index)
      if (hasChildren) {
        arcs[index].childIndices = layoutLevel(item.children, sa, ea, level + 1, index, color)
      }
      angle = ea
    })
    return childIndices
  }

  layoutLevel(sized, DEFAULT_SUNBURST_START_ANGLE, DEFAULT_SUNBURST_END_ANGLE, 0, null, palette[0])
  return arcs
}

export function computeSunburstArcs(
  data: SunburstChartDatum[],
  opts: LayoutSunburstOptions
): SunburstArc[] {
  return layoutSunburst(data, opts)
}
