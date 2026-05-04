/**
 * SVG path geometry for chart shapes:
 * pie / donut, radar polygon, line / area / step / monotone / natural,
 * scatter point, bar geometry helpers.
 *
 * Split out of `chart-utils.ts` (PR-12).
 */

import type { ChartCurveType } from '../../types/chart'

// ============================================================================
// Polar primitives
// ============================================================================

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

// ============================================================================
// Pie / Donut
// ============================================================================

export interface PieArcDatum<T> {
  data: T
  value: number
  startAngle: number
  endAngle: number
  padAngle: number
  index: number
}

interface PieArcGeometry {
  value: number
  startAngle: number
  endAngle: number
  padAngle: number
  index: number
}

const pieArcGeometryCache = new Map<string, readonly PieArcGeometry[]>()
const maxPieArcGeometryCacheSize = 128

function getPieArcGeometryCacheKey(
  values: readonly number[],
  startAngle: number,
  endAngle: number,
  padAngle: number
): string {
  return `${startAngle}:${endAngle}:${padAngle}:${values.join(',')}`
}

export function clearPieArcCache(): void {
  pieArcGeometryCache.clear()
}

export function getPieArcCacheSize(): number {
  return pieArcGeometryCache.size
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

  const cacheKey = getPieArcGeometryCacheKey(values, startAngle, endAngle, padAngle)
  const cachedGeometry = pieArcGeometryCache.get(cacheKey)
  if (cachedGeometry) {
    return cachedGeometry.map((geometry, index) => ({
      data: data[index],
      value: geometry.value,
      startAngle: geometry.startAngle,
      endAngle: geometry.endAngle,
      padAngle: geometry.padAngle,
      index: geometry.index
    }))
  }

  const totalAngle = endAngle - startAngle
  const totalPadding = padAngle * data.length
  const availableAngle = Math.max(0, totalAngle - totalPadding)

  let current = startAngle
  const geometry = data.map((_item, index) => {
    const value = values[index]
    const sliceAngle = availableAngle * (value / total)
    const sliceStart = current
    const sliceEnd = sliceStart + sliceAngle
    current = sliceEnd + padAngle

    return {
      value,
      startAngle: sliceStart,
      endAngle: sliceEnd,
      padAngle,
      index
    }
  })

  if (pieArcGeometryCache.size >= maxPieArcGeometryCacheSize) {
    const firstKey = pieArcGeometryCache.keys().next().value
    if (firstKey) {
      pieArcGeometryCache.delete(firstKey)
    }
  }

  const frozenGeometry = Object.freeze(geometry.map((item) => Object.freeze(item)))
  pieArcGeometryCache.set(cacheKey, frozenGeometry)

  return frozenGeometry.map((item, index) => ({
    data: data[index],
    value: item.value,
    startAngle: item.startAngle,
    endAngle: item.endAngle,
    padAngle: item.padAngle,
    index: item.index
  }))
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

// ============================================================================
// Radar
// ============================================================================

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

/**
 * Compute text-anchor and dominant-baseline for a radar label based on its angle.
 * Mimics ECharts indicator name positioning for natural readability.
 */
export function getRadarLabelAlign(angle: number): {
  textAnchor: 'start' | 'middle' | 'end'
  dominantBaseline: 'auto' | 'middle' | 'hanging'
} {
  // Normalize angle to [0, 2π)
  const TWO_PI = Math.PI * 2
  const a = ((angle % TWO_PI) + TWO_PI) % TWO_PI

  // Threshold for "near" top/bottom/left/right (~18°)
  const threshold = Math.PI / 10

  // Horizontal alignment
  let textAnchor: 'start' | 'middle' | 'end'
  if (
    Math.abs(a - Math.PI * 1.5) < threshold ||
    a < threshold ||
    Math.abs(a - TWO_PI) < threshold
  ) {
    textAnchor = 'middle'
  } else if (a > Math.PI - threshold && a < Math.PI + threshold) {
    textAnchor = 'middle'
  } else if (a < Math.PI) {
    textAnchor = 'start'
  } else {
    textAnchor = 'end'
  }

  // Vertical alignment
  let dominantBaseline: 'auto' | 'middle' | 'hanging'
  if (Math.abs(a - Math.PI / 2) < threshold * 1.5) {
    dominantBaseline = 'hanging'
  } else if (Math.abs(a - Math.PI * 1.5) < threshold * 1.5) {
    dominantBaseline = 'auto'
  } else {
    dominantBaseline = 'middle'
  }

  return { textAnchor, dominantBaseline }
}

// ============================================================================
// Line / Area / Step / Monotone / Natural
// ============================================================================

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

// ============================================================================
// Bar geometry helpers
// ============================================================================

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

// ============================================================================
// Scatter point
// ============================================================================

/**
 * Generate SVG path for different point shapes centered at (0, 0).
 * Use with transform="translate(cx, cy)".
 */
export function getScatterPointPath(
  style: 'square' | 'triangle' | 'diamond',
  size: number
): string {
  switch (style) {
    case 'square':
      return `M ${-size} ${-size} L ${size} ${-size} L ${size} ${size} L ${-size} ${size} Z`
    case 'triangle': {
      const h = size * 1.15
      return `M 0 ${-h} L ${size} ${h * 0.75} L ${-size} ${h * 0.75} Z`
    }
    case 'diamond':
      return `M 0 ${-size * 1.2} L ${size} 0 L 0 ${size * 1.2} L ${-size} 0 Z`
  }
}
