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
