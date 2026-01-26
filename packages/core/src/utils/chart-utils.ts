import type {
  BandScaleOptions,
  ChartAxisTick,
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

export function createLinearScale(
  domain: [number, number],
  range: [number, number]
): ChartScale<number> {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0

  return {
    type: 'linear',
    domain: [d0, d1],
    range: [r0, r1],
    map: (value: number) => {
      if (span === 0) return (r0 + r1) / 2
      return r0 + ((value - d0) / span) * (r1 - r0)
    }
  }
}

export function createPointScale(
  domain: string[],
  range: [number, number],
  options: PointScaleOptions = {}
): ChartScale<string> {
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
    map: (value: string) => {
      const index = indexMap.get(value) ?? 0
      return rangeStart + direction * (offset + step * index)
    }
  }
}

export function createBandScale(
  domain: string[],
  range: [number, number],
  options: BandScaleOptions = {}
): ChartScale<string> {
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
    map: (value: string) => {
      const index = indexMap.get(value) ?? 0
      return rangeStart + direction * (offset + step * index)
    }
  }
}

export function getChartAxisTicks<T extends ChartScaleValue>(
  scale: ChartScale<T>,
  options: {
    tickCount?: number
    tickValues?: T[]
    tickFormat?: (value: T) => string
  } = {}
): ChartAxisTick<T>[] {
  const { tickCount = 5, tickValues, tickFormat } = options
  const format = tickFormat ?? ((value: T) => `${value}`)

  const resolvedTickValues =
    tickValues ??
    (scale.type === 'linear'
      ? (getLinearTicks(scale.domain as number[], tickCount) as T[])
      : scale.domain)

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
