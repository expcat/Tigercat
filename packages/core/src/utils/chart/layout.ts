/**
 * Cartesian chart layout: bars, lines, areas, scatter.
 * Vue/React only bind the returned geometry.
 */

import type { ChartCurveType, ChartScale, ChartScaleValue } from '../../types/chart'
import type {
  AreaChartSeries,
  BarChartDatum,
  LineChartDatum,
  LineChartSeries,
  ScatterChartDatum
} from '../../types/chart-cartesian'
import { devWarn } from '../dev-warn'
import { getChartElementOpacity } from '../chart-interaction'
import {
  clampBarWidth,
  createAreaPath,
  createLinePath,
  ensureBarMinHeight,
  getScatterPointPath
} from './path'
import { scaleContainsValue } from './scale'

export const CHART_SURFACE_FILL = 'var(--tiger-bg,#ffffff)'
export const SCATTER_MAX_PIXEL_RADIUS = 40
export const SCATTER_ENTRANCE_STAGGER_MS = 60
export const SCATTER_ENTRANCE_STAGGER_MAX_MS = 600

export function formatChartTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
}

export function scatterPointDisplayLabel(
  datum: ScatterChartDatum,
  index: number,
  template: string
): string {
  if (datum.label) return datum.label
  return formatChartTemplate(template, { index: index + 1, x: datum.x, y: datum.y })
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function nextChartRovingIndex(current: number, key: string, count: number): number {
  if (count <= 0) return 0
  if (key === 'ArrowRight' || key === 'ArrowDown') return Math.min(count - 1, current + 1)
  if (key === 'ArrowLeft' || key === 'ArrowUp') return Math.max(0, current - 1)
  return current
}

export function isNumericChartDomain(values: unknown[]): boolean {
  return values.length > 0 && values.every((value) => typeof value === 'number')
}

export interface ChartPointRef {
  seriesIndex: number
  pointIndex: number
}

export function flattenChartPoints(
  series: Array<{ seriesIndex: number; points: Array<{ pointIndex: number }> }>
): ChartPointRef[] {
  const result: ChartPointRef[] = []
  for (const item of series) {
    for (const point of item.points) {
      result.push({ seriesIndex: item.seriesIndex, pointIndex: point.pointIndex })
    }
  }
  return result
}

export function chartPointTabIndex(
  seriesIndex: number,
  pointIndex: number,
  active: ChartPointRef | null,
  flat: ChartPointRef[]
): number {
  if (flat.length === 0) return -1
  const current = active ?? flat[0]
  return current.seriesIndex === seriesIndex && current.pointIndex === pointIndex ? 0 : -1
}

export function nextChartPointRef(
  current: ChartPointRef | null,
  key: string,
  flat: ChartPointRef[]
): ChartPointRef | null {
  if (flat.length === 0) return null
  const from = current
    ? Math.max(
        0,
        flat.findIndex(
          (point) =>
            point.seriesIndex === current.seriesIndex && point.pointIndex === current.pointIndex
        )
      )
    : 0
  return flat[nextChartRovingIndex(from, key, flat.length)] ?? null
}

export function chartMarkTabIndex(index: number, activeIndex: number | null): number {
  if (activeIndex === null) return index === 0 ? 0 : -1
  return activeIndex === index ? 0 : -1
}

export function findNearestPointIndex(
  points: Array<{ x: number; y: number }>,
  x: number,
  y: number
): number | null {
  if (points.length === 0) return null
  let best = 0
  let bestDist = Number.POSITIVE_INFINITY
  for (let i = 0; i < points.length; i++) {
    const dx = points[i].x - x
    const dy = points[i].y - y
    const dist = dx * dx + dy * dy
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  }
  return best
}

export function findNearestSeriesPoint(
  seriesPoints: Array<Array<{ x: number; y: number }>>,
  x: number,
  y: number
): { seriesIndex: number; pointIndex: number } | null {
  let best: { seriesIndex: number; pointIndex: number } | null = null
  let bestDist = Number.POSITIVE_INFINITY
  for (let seriesIndex = 0; seriesIndex < seriesPoints.length; seriesIndex++) {
    const points = seriesPoints[seriesIndex]
    for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
      const dx = points[pointIndex].x - x
      const dy = points[pointIndex].y - y
      const dist = dx * dx + dy * dy
      if (dist < bestDist) {
        bestDist = dist
        best = { seriesIndex, pointIndex }
      }
    }
  }
  return best
}

function scaleX(scale: ChartScale, value: ChartScaleValue): number {
  const xKey = scale.type === 'linear' ? Number(value) : String(value)
  return scale.map(xKey)
}

function sortLineData(data: LineChartDatum[], xScale: ChartScale): LineChartDatum[] {
  if (xScale.type !== 'linear') return data
  return data
    .map((datum, index) => ({ datum, index }))
    .sort((a, b) => {
      const dx = Number(a.datum.x) - Number(b.datum.x)
      return dx !== 0 ? dx : a.index - b.index
    })
    .map((item) => item.datum)
}

function filterLineData(
  data: LineChartDatum[],
  xScale: ChartScale,
  warnKey: string
): LineChartDatum[] {
  const seen = new Set<string>()
  const result: LineChartDatum[] = []
  for (const datum of data) {
    if (!isFiniteNumber(datum.y)) {
      devWarn(`${warnKey}.nonFiniteY`, `${warnKey} skipped a datum with a non-finite y`)
      continue
    }
    if (xScale.type === 'linear' && !isFiniteNumber(Number(datum.x))) {
      devWarn(`${warnKey}.nonFiniteX`, `${warnKey} skipped a datum with a non-finite x`)
      continue
    }
    if (xScale.type !== 'linear') {
      const key = String(datum.x)
      if (seen.has(key)) {
        devWarn(`${warnKey}.duplicateX`, `${warnKey} skipped a datum with a duplicate x`)
        continue
      }
      if (!scaleContainsValue(xScale, datum.x)) {
        devWarn(
          `${warnKey}.unknownX`,
          `${warnKey} skipped a datum whose x is not in the scale domain`
        )
        continue
      }
      seen.add(key)
    }
    result.push(datum)
  }
  return sortLineData(result, xScale)
}

export interface LayoutBarRectsOptions {
  barMaxWidth?: number
  barMinHeight?: number
  palette: string[]
  activeIndex?: number | null
  activeOpacity?: number
  inactiveOpacity?: number
  innerWidth: number
}

export interface LaidOutBar {
  x: number
  y: number
  width: number
  height: number
  color: string
  opacity: number | undefined
  datum: BarChartDatum
  index: number
  negative: boolean
}

export function layoutBarRects(
  data: BarChartDatum[],
  xScale: ChartScale,
  yScale: ChartScale,
  options: LayoutBarRectsOptions
): LaidOutBar[] {
  const rawBandWidth =
    xScale.bandwidth ??
    (xScale.step ? xScale.step * 0.7 : (options.innerWidth / Math.max(1, data.length)) * 0.8)
  const bandWidth = clampBarWidth(rawBandWidth, options.barMaxWidth)
  const bandOffset = rawBandWidth > bandWidth ? (rawBandWidth - bandWidth) / 2 : 0
  const baseline = yScale.map(0)
  const seen = new Set<string>()
  const bars: LaidOutBar[] = []

  data.forEach((item, index) => {
    if (!isFiniteNumber(item.y)) {
      devWarn('BarChart.nonFiniteY', 'BarChart skipped a datum with a non-finite y')
      return
    }
    if (xScale.type === 'linear' && !isFiniteNumber(Number(item.x))) {
      devWarn('BarChart.nonFiniteX', 'BarChart skipped a datum with a non-finite x')
      return
    }
    if (xScale.type !== 'linear') {
      const key = String(item.x)
      if (seen.has(key)) {
        devWarn('BarChart.duplicateX', 'BarChart skipped a datum with a duplicate x')
        return
      }
      if (!scaleContainsValue(xScale, item.x)) {
        devWarn('BarChart.unknownX', 'BarChart skipped a datum whose x is not in the scale domain')
        return
      }
      seen.add(key)
    }

    const xPos = scaleX(xScale, item.x)
    const barX = (xScale.bandwidth ? xPos : xPos - rawBandWidth / 2) + bandOffset
    const barYValue = yScale.map(item.y)
    let barHeight = Math.abs(baseline - barYValue)
    let barY = Math.min(baseline, barYValue)
    if ((options.barMinHeight ?? 0) > 0) {
      const clamped = ensureBarMinHeight(barY, barHeight, baseline, options.barMinHeight ?? 0)
      barY = clamped.y
      barHeight = clamped.height
    }
    if (barHeight === 0) return

    bars.push({
      x: barX,
      y: barY,
      width: bandWidth,
      height: barHeight,
      color: item.color ?? options.palette[index % options.palette.length],
      opacity: getChartElementOpacity(index, options.activeIndex ?? null, {
        activeOpacity: options.activeOpacity,
        inactiveOpacity: options.inactiveOpacity
      }),
      datum: item,
      index,
      negative: item.y < 0
    })
  })

  return bars
}

export function resolveBarCornerRadius(barRadius: number | undefined): {
  rx?: number
  ry?: number
  style?: string
} {
  if (barRadius !== undefined) {
    return { rx: barRadius, ry: barRadius }
  }
  return { style: 'rx:var(--tiger-chart-bar-radius,4px);ry:var(--tiger-chart-bar-radius,4px)' }
}

export interface LaidOutLinePoint {
  x: number
  y: number
  datum: LineChartDatum
  pointIndex: number
}

export interface LaidOutLineSeries {
  series: LineChartSeries
  seriesIndex: number
  color: string
  linePath: string
  areaPath: string
  showArea: boolean
  areaOpacity: number
  points: LaidOutLinePoint[]
  opacity: number | undefined
  strokeWidth: number
  strokeDasharray: string | undefined
  showPoints: boolean
  pointSize: number
  pointColor: string
  pointHollow: boolean
}

export interface LayoutLineSeriesOptions {
  curve: ChartCurveType
  palette: string[]
  activeIndex: number | null
  showArea: boolean
  areaOpacity: number
  strokeWidth: number
  showPoints: boolean
  pointSize: number
  pointColor?: string
  pointHollow: boolean
  activeOpacity?: number
  inactiveOpacity?: number
}

export function layoutLineSeries(
  series: LineChartSeries[],
  xScale: ChartScale,
  yScale: ChartScale,
  options: LayoutLineSeriesOptions
): LaidOutLineSeries[] {
  const baseline = yScale.map(0)
  return series.map((s, seriesIndex) => {
    const color = s.color ?? options.palette[seriesIndex % options.palette.length]
    const data = filterLineData(s.data, xScale, 'LineChart')
    const points = data.map((datum, pointIndex) => ({
      x: scaleX(xScale, datum.x),
      y: yScale.map(datum.y),
      datum,
      pointIndex
    }))
    const showArea = s.showArea ?? options.showArea
    return {
      series: s,
      seriesIndex,
      color,
      linePath: createLinePath(points, options.curve),
      areaPath: showArea ? createAreaPath(points, baseline, options.curve) : '',
      showArea,
      areaOpacity: s.areaOpacity ?? options.areaOpacity,
      points,
      opacity: getChartElementOpacity(seriesIndex, options.activeIndex, {
        activeOpacity: options.activeOpacity,
        inactiveOpacity: options.inactiveOpacity
      }),
      strokeWidth: s.strokeWidth ?? options.strokeWidth,
      strokeDasharray: s.strokeDasharray,
      showPoints: s.showPoints ?? options.showPoints,
      pointSize: s.pointSize ?? options.pointSize,
      pointColor: s.pointColor ?? options.pointColor ?? color,
      pointHollow: s.pointHollow ?? options.pointHollow
    }
  })
}

export interface PathCommand {
  type: string
  values: number[]
}

export function parseSvgPath(path: string): PathCommand[] {
  const result: PathCommand[] = []
  const re = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(path)) !== null) {
    const values = match[2]
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
    result.push({ type: match[1], values })
  }
  return result
}

export function reverseSvgPath(path: string): string {
  const commands = parseSvgPath(path)
  if (commands.length === 0) return ''

  let x = 0
  let y = 0
  const segments: Array<{
    start: { x: number; y: number }
    end: { x: number; y: number }
    type: string
    values: number[]
  }> = []

  for (const cmd of commands) {
    const start = { x, y }
    if (cmd.type === 'M' || cmd.type === 'L') {
      x = cmd.values[0]
      y = cmd.values[1]
    } else if (cmd.type === 'H') {
      x = cmd.values[0]
    } else if (cmd.type === 'V') {
      y = cmd.values[0]
    } else if (cmd.type === 'C') {
      x = cmd.values[4]
      y = cmd.values[5]
    }
    segments.push({ start, end: { x, y }, type: cmd.type, values: cmd.values })
  }

  const last = segments[segments.length - 1]
  const out = [`M ${last.end.x} ${last.end.y}`]
  for (let i = segments.length - 1; i >= 1; i--) {
    const seg = segments[i]
    if (seg.type === 'L' || seg.type === 'M') {
      out.push(`L ${seg.start.x} ${seg.start.y}`)
    } else if (seg.type === 'H') {
      out.push(`H ${seg.start.x}`)
    } else if (seg.type === 'V') {
      out.push(`V ${seg.start.y}`)
    } else if (seg.type === 'C') {
      const [cp1x, cp1y, cp2x, cp2y] = seg.values
      out.push(`C ${cp2x} ${cp2y}, ${cp1x} ${cp1y}, ${seg.start.x} ${seg.start.y}`)
    }
  }
  return out.join(' ')
}

export function createStackedAreaPath(
  topPoints: Array<{ x: number; y: number }>,
  bottomPoints: Array<{ x: number; y: number }>,
  curve: ChartCurveType
): string {
  const topPath = createLinePath(topPoints, curve)
  const bottomPath = createLinePath(bottomPoints, curve)
  if (!topPath || !bottomPath) return ''
  const reversed = reverseSvgPath(bottomPath).replace(/^M/, 'L')
  return `${topPath} ${reversed} Z`
}

export interface LaidOutAreaSeries extends LaidOutLineSeries {
  fillColor: string
  fillOpacity: number
}

export interface LayoutAreaSeriesOptions extends LayoutLineSeriesOptions {
  stacked?: boolean
  fillOpacity: number
  stackedData?: { original: LineChartDatum; y0: number; y1: number }[][]
}

export function layoutAreaSeries(
  series: AreaChartSeries[],
  xScale: ChartScale,
  yScale: ChartScale,
  options: LayoutAreaSeriesOptions
): LaidOutAreaSeries[] {
  const baseline = yScale.map(0)
  return series.map((s, seriesIndex) => {
    const color = s.color ?? options.palette[seriesIndex % options.palette.length]
    const fillColor = s.fillColor ?? color
    const fillOpacity = s.fillOpacity ?? options.fillOpacity
    let points: LaidOutLinePoint[]
    let areaPath: string
    let linePath: string

    if (options.stacked && options.stackedData) {
      const stackedSeries = options.stackedData[seriesIndex] ?? []
      points = stackedSeries.map((sd, pointIndex) => ({
        x: scaleX(xScale, sd.original.x as ChartScaleValue),
        y: yScale.map(sd.y1),
        datum: sd.original,
        pointIndex
      }))
      const topPoints = points.map((p) => ({ x: p.x, y: p.y }))
      const bottomPoints = stackedSeries.map((sd) => ({
        x: scaleX(xScale, sd.original.x as ChartScaleValue),
        y: yScale.map(sd.y0)
      }))
      areaPath = createStackedAreaPath(topPoints, bottomPoints, options.curve)
      linePath = createLinePath(topPoints, options.curve)
    } else {
      const data = filterLineData(s.data, xScale, 'AreaChart')
      points = data.map((datum, pointIndex) => ({
        x: scaleX(xScale, datum.x),
        y: yScale.map(datum.y),
        datum,
        pointIndex
      }))
      areaPath = createAreaPath(points, baseline, options.curve)
      linePath = createLinePath(points, options.curve)
    }

    return {
      series: s,
      seriesIndex,
      color,
      fillColor,
      fillOpacity,
      linePath,
      areaPath,
      showArea: true,
      areaOpacity: fillOpacity,
      points,
      opacity: getChartElementOpacity(seriesIndex, options.activeIndex, {
        activeOpacity: options.activeOpacity,
        inactiveOpacity: options.inactiveOpacity
      }),
      strokeWidth: s.strokeWidth ?? options.strokeWidth,
      strokeDasharray: s.strokeDasharray,
      showPoints: s.showPoints ?? options.showPoints,
      pointSize: s.pointSize ?? options.pointSize,
      pointColor: s.pointColor ?? options.pointColor ?? color,
      pointHollow: s.pointHollow ?? options.pointHollow
    }
  })
}

export interface ScatterSizeScale {
  minRadius?: number
  maxRadius?: number
}

export interface LayoutScatterPointsOptions {
  pointSize: number
  pointStyle: 'circle' | 'square' | 'triangle' | 'diamond'
  palette: string[]
  activeIndex: number | null
  hoveredIndex: number | null
  gradient?: boolean
  gradientPrefix?: string
  sizeScale?: boolean | ScatterSizeScale
  pointOpacity?: number
  activeOpacity?: number
  inactiveOpacity?: number
}

export interface LaidOutScatterPoint {
  cx: number
  cy: number
  r: number
  d: string | undefined
  fill: string
  color: string
  opacity: number | undefined
  isHovered: boolean
  datum: ScatterChartDatum
  index: number
}

function resolveScatterRadius(
  size: number | undefined,
  pointSize: number,
  sizeScale: boolean | ScatterSizeScale | undefined,
  domain: [number, number] | null
): number | null {
  if (size === undefined) return pointSize
  if (!isFiniteNumber(size) || size <= 0) return null
  if (!sizeScale) {
    return Math.min(size, SCATTER_MAX_PIXEL_RADIUS)
  }
  if (!domain) return pointSize
  const rangeMin =
    typeof sizeScale === 'object'
      ? (sizeScale.minRadius ?? Math.max(2, pointSize / 2))
      : Math.max(2, pointSize / 2)
  const rangeMax =
    typeof sizeScale === 'object'
      ? (sizeScale.maxRadius ?? Math.min(SCATTER_MAX_PIXEL_RADIUS, pointSize * 3))
      : Math.min(SCATTER_MAX_PIXEL_RADIUS, pointSize * 3)
  const [d0, d1] = domain
  if (d0 === d1) return (rangeMin + rangeMax) / 2
  const t = (size - d0) / (d1 - d0)
  return rangeMin + Math.min(1, Math.max(0, t)) * (rangeMax - rangeMin)
}

export function layoutScatterPoints(
  data: ScatterChartDatum[],
  xScale: ChartScale,
  yScale: ChartScale,
  options: LayoutScatterPointsOptions
): LaidOutScatterPoint[] {
  const sizes = data
    .map((item) => item.size)
    .filter((size): size is number => isFiniteNumber(size) && size > 0)
  const domain: [number, number] | null =
    options.sizeScale && sizes.length > 0 ? [Math.min(...sizes), Math.max(...sizes)] : null

  const points: LaidOutScatterPoint[] = []
  data.forEach((item, index) => {
    if (!isFiniteNumber(item.x) || !isFiniteNumber(item.y)) {
      devWarn('ScatterChart.nonFinite', 'ScatterChart skipped a datum with a non-finite x or y')
      return
    }
    const baseSize = resolveScatterRadius(item.size, options.pointSize, options.sizeScale, domain)
    if (baseSize === null) {
      devWarn('ScatterChart.invalidSize', 'ScatterChart skipped a datum with a non-positive size')
      return
    }
    const isHovered = options.hoveredIndex === index
    const r = isHovered ? baseSize + 2 : baseSize
    const color = item.color ?? options.palette[index % options.palette.length]
    const fill =
      options.gradient && options.gradientPrefix
        ? `url(#${options.gradientPrefix}-${index})`
        : color
    const opacity =
      options.pointOpacity ??
      getChartElementOpacity(index, options.activeIndex, {
        activeOpacity: options.activeOpacity,
        inactiveOpacity: options.inactiveOpacity
      })

    points.push({
      cx: xScale.map(item.x),
      cy: yScale.map(item.y),
      r,
      d: options.pointStyle === 'circle' ? undefined : getScatterPointPath(options.pointStyle, r),
      fill,
      color,
      opacity,
      isHovered,
      datum: item,
      index
    })
  })
  return points
}
