/**
 * Chart scales (linear / point / band) + numeric extent + padding helpers.
 *
 * Split out of `chart-utils.ts` (PR-12).
 */

import type {
  BandScaleOptions,
  ChartPadding,
  ChartScale,
  ChartScaleValue,
  PointScaleOptions
} from '../../types/chart'

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
