/**
 * Multi-level sunburst layout. Starts at 12 o'clock and runs clockwise.
 * Vue/React only bind the returned geometry.
 */

import type { SunburstChartDatum } from '../types/chart'
import { DEFAULT_CHART_COLORS, createPieArcPath, polarToCartesian } from './chart-utils'
import { heatmapLabelFill } from './heatmap-chart-utils'
import { isFiniteNumber } from './chart/layout'
import { devWarn } from './dev-warn'

export const DEFAULT_SUNBURST_SIZE = 320
export const DEFAULT_SUNBURST_PADDING = 24
export const DEFAULT_SUNBURST_START_ANGLE = -Math.PI / 2
export const DEFAULT_SUNBURST_END_ANGLE = (3 * Math.PI) / 2

export const sunburstArcTransitionClasses =
  'transition-[opacity,filter] motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base,200ms)]'

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

function nodeValue(datum: SunburstChartDatum): number | null {
  const children = datum.children
  if (children && children.length > 0) {
    let sum = 0
    let any = false
    for (const child of children) {
      const childValue = nodeValue(child)
      if (childValue === null) continue
      any = true
      sum += childValue
    }
    if (any) {
      if (isFiniteNumber(datum.value) && datum.value !== sum) {
        devWarn(
          'SunburstChart.parentValue',
          'SunburstChart parent value differs from the sum of children; children sum is used for sweep'
        )
      }
      return sum
    }
  }
  if (!isFiniteNumber(datum.value)) {
    devWarn('SunburstChart.nonFinite', 'SunburstChart skipped a datum with a non-finite value')
    return null
  }
  if (datum.value < 0) {
    devWarn('SunburstChart.negative', 'SunburstChart skipped a datum with a negative value')
    return null
  }
  if (datum.value === 0) {
    devWarn('SunburstChart.zero', 'SunburstChart skipped a datum with value 0')
    return null
  }
  return datum.value
}

function maxDrawnDepth(data: readonly SunburstChartDatum[]): number {
  let max = 0
  const walk = (items: readonly SunburstChartDatum[], depth: number) => {
    for (const item of items) {
      if (nodeValue(item) === null) continue
      max = Math.max(max, depth)
      if (item.children && item.children.length > 0) walk(item.children, depth + 1)
    }
  }
  walk(data, 0)
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
  const depth = maxDrawnDepth(data)
  const ringCount = depth + 1
  const ringWidth = ringCount > 0 ? (safeOuter - safeInner) / ringCount : 0
  const arcs: SunburstArc[] = []
  const rootTotal = data.reduce((sum, item) => sum + (nodeValue(item) ?? 0), 0)
  if (!(rootTotal > 0)) return []

  const layoutLevel = (
    items: readonly SunburstChartDatum[],
    startAngle: number,
    endAngle: number,
    level: number,
    parentIndex: number | null,
    parentColor: string
  ): number[] => {
    const sized = items
      .map((datum) => ({ datum, value: nodeValue(datum) }))
      .filter((item): item is { datum: SunburstChartDatum; value: number } => item.value !== null)
    const total = sized.reduce((sum, item) => sum + item.value, 0)
    if (!(total > 0)) return []
    const childIndices: number[] = []
    let angle = startAngle
    sized.forEach((item, i) => {
      const sweep = ((endAngle - startAngle) * item.value) / total
      const sa = angle
      const ea = angle + sweep
      const hasChildren = Boolean(item.datum.children && item.datum.children.length > 0)
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
        labelFill: heatmapLabelFill(color, 0.6),
        percent: rootTotal > 0 ? (item.value / rootTotal) * 100 : 0
      })
      childIndices.push(index)
      if (hasChildren) {
        arcs[index].childIndices = layoutLevel(
          item.datum.children!,
          sa,
          ea,
          level + 1,
          index,
          color
        )
      }
      angle = ea
    })
    return childIndices
  }

  layoutLevel(data, DEFAULT_SUNBURST_START_ANGLE, DEFAULT_SUNBURST_END_ANGLE, 0, null, palette[0])
  return arcs
}

export function computeSunburstArcs(
  data: SunburstChartDatum[],
  opts: LayoutSunburstOptions
): SunburstArc[] {
  return layoutSunburst(data, opts)
}
