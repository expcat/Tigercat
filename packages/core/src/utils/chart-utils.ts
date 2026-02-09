import type {
  BandScaleOptions,
  ChartAxisTick,
  ChartGridLineStyle,
  ChartPadding,
  ChartScale,
  ChartScaleValue,
  PointScaleOptions
} from '../types/chart'

export const chartCanvasBaseClasses = 'block'

export const chartAxisLineClasses = 'stroke-[color:var(--tiger-border,#e5e7eb)]'
export const chartAxisTickLineClasses = 'stroke-[color:var(--tiger-border,#e5e7eb)]'
export const chartAxisTickTextClasses = 'fill-[color:var(--tiger-text-secondary,#6b7280)] text-xs'
export const chartAxisLabelClasses = 'fill-[color:var(--tiger-text,#374151)] text-xs font-medium'

export const chartGridLineClasses = 'stroke-[color:var(--tiger-border,#e5e7eb)]'

/**
 * Default color palette for chart components.
 * Uses CSS variables with fallback colors.
 */
export const DEFAULT_CHART_COLORS = [
  'var(--tiger-chart-1,#2563eb)',
  'var(--tiger-chart-2,#22c55e)',
  'var(--tiger-chart-3,#f97316)',
  'var(--tiger-chart-4,#a855f7)',
  'var(--tiger-chart-5,#0ea5e9)',
  'var(--tiger-chart-6,#ef4444)'
] as const

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function normalizeChartPadding(padding?: ChartPadding): {
  top: number
  right: number
  bottom: number
  left: number
} {
  if (typeof padding === 'number') {
    return {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding
    }
  }

  return {
    top: padding?.top ?? 0,
    right: padding?.right ?? 0,
    bottom: padding?.bottom ?? 0,
    left: padding?.left ?? 0
  }
}

export function getChartInnerRect(
  width: number,
  height: number,
  padding: ChartPadding
): {
  x: number
  y: number
  width: number
  height: number
} {
  const resolvedPadding = normalizeChartPadding(padding)
  const innerWidth = Math.max(0, width - resolvedPadding.left - resolvedPadding.right)
  const innerHeight = Math.max(0, height - resolvedPadding.top - resolvedPadding.bottom)

  return {
    x: resolvedPadding.left,
    y: resolvedPadding.top,
    width: innerWidth,
    height: innerHeight
  }
}

export function createLinearScale(domain: [number, number], range: [number, number]): ChartScale {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0

  return {
    type: 'linear',
    domain: [d0, d1],
    range: [r0, r1],
    map: (value: ChartScaleValue) => {
      const numeric = typeof value === 'number' ? value : Number(value)
      if (span === 0) return (r0 + r1) / 2
      return r0 + ((numeric - d0) / span) * (r1 - r0)
    }
  }
}

export function createPointScale(
  domain: string[],
  range: [number, number],
  options: PointScaleOptions = {}
): ChartScale {
  const padding = clampNumber(options.padding ?? 0.5, 0, 1)
  const [rangeStart, rangeEnd] = range
  const span = rangeEnd - rangeStart
  const length = Math.abs(span)
  const direction = span >= 0 ? 1 : -1
  const n = domain.length
  const step = n > 1 ? length / Math.max(1, n - 1 + padding * 2) : 0
  const offset = n <= 1 ? length / 2 : step * padding
  const indexMap = new Map(domain.map((value, index) => [value, index]))

  return {
    type: 'point',
    domain,
    range: [rangeStart, rangeEnd],
    step,
    map: (value: ChartScaleValue) => {
      const key = String(value)
      const index = indexMap.get(key) ?? 0
      return rangeStart + direction * (offset + step * index)
    }
  }
}

export function createBandScale(
  domain: string[],
  range: [number, number],
  options: BandScaleOptions = {}
): ChartScale {
  const paddingInner = clampNumber(options.paddingInner ?? 0.1, 0, 1)
  const paddingOuter = clampNumber(options.paddingOuter ?? 0.1, 0, 1)
  const align = clampNumber(options.align ?? 0.5, 0, 1)
  const [rangeStart, rangeEnd] = range
  const span = rangeEnd - rangeStart
  const length = Math.abs(span)
  const direction = span >= 0 ? 1 : -1
  const n = domain.length
  const step = n > 0 ? length / Math.max(1, n - paddingInner + paddingOuter * 2) : 0
  const bandwidth = step * (1 - paddingInner)
  const offset = (length - step * (n - paddingInner)) * align
  const indexMap = new Map(domain.map((value, index) => [value, index]))

  return {
    type: 'band',
    domain,
    range: [rangeStart, rangeEnd],
    step,
    bandwidth,
    map: (value: ChartScaleValue) => {
      const key = String(value)
      const index = indexMap.get(key) ?? 0
      return rangeStart + direction * (offset + step * index)
    }
  }
}

export function getChartAxisTicks(
  scale: ChartScale,
  options: {
    tickCount?: number
    tickValues?: ChartScaleValue[]
    tickFormat?: (value: ChartScaleValue) => string
  } = {}
): ChartAxisTick[] {
  const { tickCount = 5, tickValues, tickFormat } = options
  const format = tickFormat ?? ((value: ChartScaleValue) => `${value}`)

  const resolvedTickValues =
    tickValues ??
    (scale.type === 'linear' ? getLinearTicks(scale.domain as number[], tickCount) : scale.domain)

  return resolvedTickValues.map((value) => {
    const basePosition = scale.map(value)
    const position =
      scale.type === 'band' && typeof scale.bandwidth === 'number'
        ? basePosition + scale.bandwidth / 2
        : basePosition

    return {
      value,
      position,
      label: format(value)
    }
  })
}

function getLinearTicks(domain: number[], count: number): number[] {
  const min = Math.min(domain[0], domain[1])
  const max = Math.max(domain[0], domain[1])
  if (min === max || !Number.isFinite(min) || !Number.isFinite(max)) {
    return [min]
  }

  const step = getNiceStep((max - min) / Math.max(1, count))
  const start = Math.ceil(min / step) * step
  const end = Math.floor(max / step) * step
  const ticks: number[] = []

  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(roundTick(value, step))
  }

  return ticks
}

function getNiceStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) return 1
  const exponent = Math.floor(Math.log10(step))
  const fraction = step / Math.pow(10, exponent)
  const niceFraction = fraction >= 5 ? 5 : fraction >= 2 ? 2 : fraction >= 1 ? 1 : 0.5

  return niceFraction * Math.pow(10, exponent)
}

function roundTick(value: number, step: number): number {
  const precision = Math.max(0, -Math.floor(Math.log10(step)) + 1)
  return Number(value.toFixed(precision))
}

export function getChartGridLineDasharray(lineStyle: ChartGridLineStyle): string | undefined {
  if (lineStyle === 'dashed') return '4 4'
  if (lineStyle === 'dotted') return '1 4'
  return undefined
}

export function getNumberExtent(
  values: number[],
  options: {
    includeZero?: boolean
    fallback?: [number, number]
    padding?: number
  } = {}
): [number, number] {
  const fallback: [number, number] = options.fallback ?? [0, 1]
  if (values.length === 0) return fallback

  let min = Math.min(...values)
  let max = Math.max(...values)

  if (options.includeZero) {
    min = Math.min(min, 0)
    max = Math.max(max, 0)
  }

  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1
    return [min - pad, max + pad]
  }

  const padding = options.padding ?? 0
  if (padding > 0) {
    const span = max - min
    min -= span * padding
    max += span * padding
  }

  return [min, max]
}

export interface PieArcDatum<T> {
  data: T
  value: number
  startAngle: number
  endAngle: number
  padAngle: number
  index: number
}

export function getPieArcs<T extends { value: number }>(
  data: T[],
  options: {
    startAngle?: number
    endAngle?: number
    padAngle?: number
  } = {}
): PieArcDatum<T>[] {
  const startAngle = options.startAngle ?? 0
  const endAngle = options.endAngle ?? Math.PI * 2
  const padAngle = Math.max(0, options.padAngle ?? 0)
  const values = data.map((item) => Math.max(0, item.value))
  const total = values.reduce((sum, value) => sum + value, 0)
  if (total <= 0) return []

  const totalAngle = endAngle - startAngle
  const totalPadding = padAngle * data.length
  const availableAngle = Math.max(0, totalAngle - totalPadding)

  let current = startAngle
  return data.map((item, index) => {
    const value = values[index]
    const sliceAngle = availableAngle * (value / total)
    const sliceStart = current
    const sliceEnd = sliceStart + sliceAngle
    current = sliceEnd + padAngle

    return {
      data: item,
      value,
      startAngle: sliceStart,
      endAngle: sliceEnd,
      padAngle,
      index
    }
  })
}

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angle: number
): { x: number; y: number } {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  }
}

export function createPieArcPath(options: {
  cx: number
  cy: number
  innerRadius?: number
  outerRadius: number
  startAngle: number
  endAngle: number
}): string {
  const { cx, cy, outerRadius } = options
  const innerRadius = Math.max(0, options.innerRadius ?? 0)

  let startAngle = options.startAngle
  let endAngle = options.endAngle
  const fullCircle = Math.PI * 2
  if (endAngle - startAngle >= fullCircle) {
    endAngle = startAngle + fullCircle - 0.0001
  }

  if (endAngle <= startAngle) return ''

  const startOuter = polarToCartesian(cx, cy, outerRadius, startAngle)
  const endOuter = polarToCartesian(cx, cy, outerRadius, endAngle)
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0

  if (innerRadius <= 0) {
    return [
      `M ${cx} ${cy}`,
      `L ${startOuter.x} ${startOuter.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
      'Z'
    ].join(' ')
  }

  const startInner = polarToCartesian(cx, cy, innerRadius, startAngle)
  const endInner = polarToCartesian(cx, cy, innerRadius, endAngle)

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
    'Z'
  ].join(' ')
}

/**
 * Compute translate offset for a pie slice hover emphasis effect.
 * The slice moves outward along its bisector angle.
 */
export function computePieHoverOffset(
  startAngle: number,
  endAngle: number,
  offset: number
): { dx: number; dy: number } {
  const midAngle = (startAngle + endAngle) / 2
  return {
    dx: offset * Math.cos(midAngle),
    dy: offset * Math.sin(midAngle)
  }
}

/**
 * Compute positions for an outside label with a leader line.
 * Returns anchor (on slice edge), elbow (turn point), label (text position), and textAnchor.
 */
export function computePieLabelLine(
  cx: number,
  cy: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  offset?: number
): {
  anchor: { x: number; y: number }
  elbow: { x: number; y: number }
  label: { x: number; y: number }
  textAnchor: 'start' | 'end'
} {
  const midAngle = (startAngle + endAngle) / 2
  const gap = offset ?? Math.max(12, outerRadius * 0.15)
  const anchor = polarToCartesian(cx, cy, outerRadius, midAngle)
  const elbow = polarToCartesian(cx, cy, outerRadius + gap * 0.6, midAngle)
  const isRight = Math.cos(midAngle) >= 0

  return {
    anchor,
    elbow,
    label: {
      x: elbow.x + (isRight ? gap * 0.8 : -gap * 0.8),
      y: elbow.y
    },
    textAnchor: isRight ? 'start' : 'end'
  }
}

/** Drop shadow filter value for emphasized pie slices */
export const PIE_EMPHASIS_SHADOW = 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
export const PIE_BASE_SHADOW = 'drop-shadow(0 1px 2px rgba(0,0,0,0.06))'

/** Enhanced donut-specific shadow – deeper & more diffuse for richer emphasis */
export const DONUT_EMPHASIS_SHADOW =
  'drop-shadow(0 8px 20px rgba(0,0,0,0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.12))'
export const DONUT_BASE_SHADOW = 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))'

export function getRadarAngles(count: number, startAngle = -Math.PI / 2): number[] {
  if (count <= 0) return []
  const step = (Math.PI * 2) / count
  return Array.from({ length: count }, (_, index) => startAngle + step * index)
}

export interface RadarPoint<T> {
  data: T
  value: number
  angle: number
  radius: number
  x: number
  y: number
  index: number
}

export function getRadarPoints<T extends { value: number }>(
  data: T[],
  options: {
    cx: number
    cy: number
    radius: number
    startAngle?: number
    maxValue?: number
  }
): RadarPoint<T>[] {
  if (data.length === 0) return []

  const startAngle = options.startAngle ?? -Math.PI / 2
  const maxValue = Math.max(0, options.maxValue ?? Math.max(...data.map((datum) => datum.value)))
  const resolvedMax = maxValue > 0 ? maxValue : 1
  const step = (Math.PI * 2) / data.length

  return data.map((datum, index) => {
    const value = Math.max(0, datum.value)
    const ratio = value / resolvedMax
    const radius = options.radius * ratio
    const angle = startAngle + step * index
    const point = polarToCartesian(options.cx, options.cy, radius, angle)

    return {
      data: datum,
      value,
      angle,
      radius,
      x: point.x,
      y: point.y,
      index
    }
  })
}

export function createPolygonPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  const [first, ...rest] = points
  return [`M ${first.x} ${first.y}`, ...rest.map((point) => `L ${point.x} ${point.y}`), 'Z'].join(
    ' '
  )
}

// ============================================================================
// Line/Area Chart Utilities
// ============================================================================

import type { ChartCurveType } from '../types/chart'

let lineGradientCounter = 0

/**
 * Generate a unique gradient ID prefix for a LineChart instance.
 */
export function getLineGradientPrefix(): string {
  return `tiger-line-grad-${++lineGradientCounter}`
}

/**
 * Reset the line gradient counter (for testing only)
 */
export function resetLineGradientCounter(): void {
  lineGradientCounter = 0
}

let areaGradientCounter = 0

/**
 * Generate a unique gradient ID prefix for an AreaChart instance.
 */
export function getAreaGradientPrefix(): string {
  return `tiger-area-grad-${++areaGradientCounter}`
}

/**
 * Reset the area gradient counter (for testing only)
 */
export function resetAreaGradientCounter(): void {
  areaGradientCounter = 0
}

/**
 * CSS transition classes for line chart point hover
 */
export const linePointTransitionClasses = 'transition-all duration-200 ease-out'

/**
 * Create a line path from points
 */
export function createLinePath(
  points: Array<{ x: number; y: number }>,
  curve: ChartCurveType = 'linear'
): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  switch (curve) {
    case 'step':
      return createStepPath(points, 0.5)
    case 'stepBefore':
      return createStepPath(points, 0)
    case 'stepAfter':
      return createStepPath(points, 1)
    case 'monotone':
      return createMonotonePath(points)
    case 'natural':
      return createNaturalPath(points)
    case 'linear':
    default:
      return createLinearPath(points)
  }
}

/**
 * Create an area path from points (closed polygon with baseline)
 */
export function createAreaPath(
  points: Array<{ x: number; y: number }>,
  baseline: number,
  curve: ChartCurveType = 'linear'
): string {
  if (points.length === 0) return ''

  const linePath = createLinePath(points, curve)
  if (!linePath) return ''

  // Close the area by going to baseline and back
  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]

  return `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`
}

/**
 * Create a linear path (straight lines between points)
 */
function createLinearPath(points: Array<{ x: number; y: number }>): string {
  const [first, ...rest] = points
  return [`M ${first.x} ${first.y}`, ...rest.map((p) => `L ${p.x} ${p.y}`)].join(' ')
}

/**
 * Create a step path
 * @param t - Step position (0 = before, 0.5 = middle, 1 = after)
 */
function createStepPath(points: Array<{ x: number; y: number }>, t: number): string {
  const [first, ...rest] = points
  const commands: string[] = [`M ${first.x} ${first.y}`]

  let prev = first
  for (const point of rest) {
    if (t === 0) {
      // Step before: vertical first, then horizontal
      commands.push(`V ${point.y}`, `H ${point.x}`)
    } else if (t === 1) {
      // Step after: horizontal first, then vertical
      commands.push(`H ${point.x}`, `V ${point.y}`)
    } else {
      // Step middle
      const midX = prev.x + (point.x - prev.x) * t
      commands.push(`H ${midX}`, `V ${point.y}`, `H ${point.x}`)
    }
    prev = point
  }

  return commands.join(' ')
}

/**
 * Create a monotone cubic spline path (preserves monotonicity)
 */
function createMonotonePath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return createLinearPath(points)

  const n = points.length
  const tangents: number[] = []

  // Calculate tangents using finite differences
  for (let i = 0; i < n; i++) {
    if (i === 0) {
      tangents.push((points[1].y - points[0].y) / (points[1].x - points[0].x))
    } else if (i === n - 1) {
      tangents.push((points[n - 1].y - points[n - 2].y) / (points[n - 1].x - points[n - 2].x))
    } else {
      const d0 = (points[i].y - points[i - 1].y) / (points[i].x - points[i - 1].x)
      const d1 = (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x)

      // Use harmonic mean for monotonicity
      if (d0 * d1 <= 0) {
        tangents.push(0)
      } else {
        tangents.push((3 * (d0 + d1)) / (2 / d0 + 2 / d1 + 2 / ((d0 + d1) / 2)))
      }
    }
  }

  // Adjust tangents to ensure monotonicity
  for (let i = 0; i < n - 1; i++) {
    const d = (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x)
    if (Math.abs(d) < 1e-10) {
      tangents[i] = 0
      tangents[i + 1] = 0
    } else {
      const alpha = tangents[i] / d
      const beta = tangents[i + 1] / d
      const s = alpha * alpha + beta * beta

      if (s > 9) {
        const t = 3 / Math.sqrt(s)
        tangents[i] = t * alpha * d
        tangents[i + 1] = t * beta * d
      }
    }
  }

  // Build path
  const commands: string[] = [`M ${points[0].x} ${points[0].y}`]

  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const dx = p1.x - p0.x
    const cp1x = p0.x + dx / 3
    const cp1y = p0.y + (tangents[i] * dx) / 3
    const cp2x = p1.x - dx / 3
    const cp2y = p1.y - (tangents[i + 1] * dx) / 3

    commands.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`)
  }

  return commands.join(' ')
}

/**
 * Create a natural cubic spline path
 */
function createNaturalPath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return createLinearPath(points)
  if (points.length === 2) return createLinearPath(points)

  const n = points.length - 1

  // Solve tridiagonal system for second derivatives
  const a: number[] = new Array(n + 1).fill(0)
  const b: number[] = new Array(n + 1).fill(0)
  const c: number[] = new Array(n + 1).fill(0)
  const d: number[] = new Array(n + 1).fill(0)

  // Natural spline boundary conditions
  b[0] = 1
  b[n] = 1

  for (let i = 1; i < n; i++) {
    const h0 = points[i].x - points[i - 1].x
    const h1 = points[i + 1].x - points[i].x
    a[i] = h0
    b[i] = 2 * (h0 + h1)
    c[i] = h1
    d[i] = (3 * (points[i + 1].y - points[i].y)) / h1 - (3 * (points[i].y - points[i - 1].y)) / h0
  }

  // Solve with Thomas algorithm
  const m: number[] = new Array(n + 1).fill(0)
  const z: number[] = new Array(n + 1).fill(0)

  for (let i = 1; i <= n; i++) {
    const l = b[i] - a[i] * m[i - 1]
    m[i] = c[i] / l
    z[i] = (d[i] - a[i] * z[i - 1]) / l
  }

  const M: number[] = new Array(n + 1).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    M[i] = z[i] - m[i] * M[i + 1]
  }

  // Build path using cubic segments
  const commands: string[] = [`M ${points[0].x} ${points[0].y}`]

  for (let i = 0; i < n; i++) {
    const h = points[i + 1].x - points[i].x
    const p0 = points[i]
    const p1 = points[i + 1]

    // Control points for cubic Bezier
    const cp1x = p0.x + h / 3
    const cp1y = p0.y + (h / 3) * ((p1.y - p0.y) / h - (h * (M[i + 1] + 2 * M[i])) / 6)
    const cp2x = p1.x - h / 3
    const cp2y = p1.y - (h / 3) * ((p1.y - p0.y) / h + (h * (2 * M[i + 1] + M[i])) / 6)

    commands.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`)
  }

  return commands.join(' ')
}

/**
 * Calculate stacked Y values for area charts
 */
export function stackSeriesData<T extends { x: unknown; y: number }>(
  seriesData: T[][]
): { original: T; y0: number; y1: number }[][] {
  if (seriesData.length === 0) return []

  const result: { original: T; y0: number; y1: number }[][] = []
  const stackedValues: Map<unknown, number> = new Map()

  for (const series of seriesData) {
    const stackedSeries: { original: T; y0: number; y1: number }[] = []

    for (const datum of series) {
      const prevY = stackedValues.get(datum.x) ?? 0
      const y0 = prevY
      const y1 = prevY + datum.y

      stackedSeries.push({ original: datum, y0, y1 })
      stackedValues.set(datum.x, y1)
    }

    result.push(stackedSeries)
  }

  return result
}

// ============================================================================
// Bar Chart Utilities
// ============================================================================

let barGradientCounter = 0

/**
 * Generate a unique gradient ID prefix for a BarChart instance.
 * Each BarChart must have its own prefix to avoid gradient ID collisions.
 */
export function getBarGradientPrefix(): string {
  return `tiger-bar-grad-${++barGradientCounter}`
}

/**
 * Reset the gradient counter (for testing only)
 */
export function resetBarGradientCounter(): void {
  barGradientCounter = 0
}

/**
 * Clamp bar width to a maximum value
 */
export function clampBarWidth(width: number, maxWidth?: number): number {
  if (maxWidth === undefined || maxWidth <= 0) return width
  return Math.min(width, maxWidth)
}

/**
 * Ensure bar meets minimum height for near-zero values.
 * Returns adjusted y and height while keeping the bar anchored at the baseline.
 */
export function ensureBarMinHeight(
  barY: number,
  barHeight: number,
  baseline: number,
  minHeight: number
): { y: number; height: number } {
  if (minHeight <= 0 || barHeight === 0 || barHeight >= minHeight) {
    return { y: barY, height: barHeight }
  }
  // Positive value: bar top is above baseline → extend upward
  if (barY < baseline) {
    return { y: baseline - minHeight, height: minHeight }
  }
  // Negative value: bar top is at baseline → extend downward
  return { y: baseline, height: minHeight }
}

/**
 * Get the Y coordinate for a value label on a bar
 */
export function getBarValueLabelY(
  barY: number,
  barHeight: number,
  position: 'top' | 'inside',
  offset = 8
): number {
  if (position === 'inside') {
    return barY + barHeight / 2
  }
  return barY - offset
}

/**
 * CSS classes for value labels displayed on bars
 */
export const barValueLabelClasses =
  'fill-[color:var(--tiger-text,#374151)] text-[11px] font-medium pointer-events-none select-none'

/**
 * CSS classes for value labels inside bars (needs contrasting color)
 */
export const barValueLabelInsideClasses =
  'fill-white text-[11px] font-medium pointer-events-none select-none'

/**
 * CSS transition string for animated bars
 */
export const barAnimatedTransition =
  'transition: y 600ms cubic-bezier(.4,0,.2,1), height 600ms cubic-bezier(.4,0,.2,1), opacity 200ms ease-out, filter 200ms ease-out'
