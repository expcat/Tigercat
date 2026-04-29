/**
 * Gradient ID factories + data formatting (stack) utilities for charts.
 *
 * Each chart family (line / area / bar / scatter) gets its own counter so
 * SVG <linearGradient> IDs never collide across instances.
 *
 * Split out of `chart-utils.ts` (PR-12).
 */

function createGradientIdFactory(prefix: string) {
  let counter = 0
  return {
    getPrefix: () => `tiger-${prefix}-grad-${++counter}`,
    reset: () => {
      counter = 0
    }
  }
}

const lineGradient = createGradientIdFactory('line')
const areaGradient = createGradientIdFactory('area')
const barGradient = createGradientIdFactory('bar')
const scatterGradient = createGradientIdFactory('scatter')

/** Generate a unique gradient ID prefix for a LineChart instance. */
export function getLineGradientPrefix(): string {
  return lineGradient.getPrefix()
}

/** Reset the line gradient counter (for testing only) */
export function resetLineGradientCounter(): void {
  lineGradient.reset()
}

/** Generate a unique gradient ID prefix for an AreaChart instance. */
export function getAreaGradientPrefix(): string {
  return areaGradient.getPrefix()
}

/** Reset the area gradient counter (for testing only) */
export function resetAreaGradientCounter(): void {
  areaGradient.reset()
}

/**
 * Generate a unique gradient ID prefix for a BarChart instance.
 * Each BarChart must have its own prefix to avoid gradient ID collisions.
 */
export function getBarGradientPrefix(): string {
  return barGradient.getPrefix()
}

/** Reset the bar gradient counter (for testing only) */
export function resetBarGradientCounter(): void {
  barGradient.reset()
}

/** Generate a unique gradient ID prefix for a ScatterChart instance. */
export function getScatterGradientPrefix(): string {
  return scatterGradient.getPrefix()
}

/** Reset the scatter gradient counter (for testing only) */
export function resetScatterGradientCounter(): void {
  scatterGradient.reset()
}

/**
 * Calculate stacked Y values for area / bar charts.
 *
 * Returns per-series points with `y0` (base) and `y1` (top) computed from
 * the previous series at the same `x` value.
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
