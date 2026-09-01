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
const radarGradient = createGradientIdFactory('radar')
const gaugeGradient = createGradientIdFactory('gauge')
const funnelGradient = createGradientIdFactory('funnel')
const treemapGradient = createGradientIdFactory('treemap')
const sunburstGradient = createGradientIdFactory('sunburst')
const pieGradient = createGradientIdFactory('pie')

export type ChartGradientKind =
  | 'line'
  | 'area'
  | 'bar'
  | 'scatter'
  | 'radar'
  | 'gauge'
  | 'funnel'
  | 'treemap'
  | 'sunburst'
  | 'pie'

function normalizeSvgIdSegment(value: string): string {
  const normalized = value.replace(/[^A-Za-z0-9_-]/g, '-').replace(/^-+|-+$/g, '')
  return normalized || '0'
}

export function getStableChartGradientPrefix(kind: ChartGradientKind, instanceId: string): string {
  return `tiger-${kind}-grad-${normalizeSvgIdSegment(instanceId)}`
}

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

/** Generate a unique gradient ID prefix for a RadarChart instance. */
export function getRadarGradientPrefix(): string {
  return radarGradient.getPrefix()
}

/** Reset the radar gradient counter (for testing only) */
export function resetRadarGradientCounter(): void {
  radarGradient.reset()
}

/** Generate a unique gradient ID prefix for a GaugeChart instance. */
export function getGaugeGradientPrefix(): string {
  return gaugeGradient.getPrefix()
}

/** Reset the gauge gradient counter (for testing only) */
export function resetGaugeGradientCounter(): void {
  gaugeGradient.reset()
}

/** Generate a unique gradient ID prefix for a FunnelChart instance. */
export function getFunnelGradientPrefix(): string {
  return funnelGradient.getPrefix()
}

/** Reset the funnel gradient counter (for testing only) */
export function resetFunnelGradientCounter(): void {
  funnelGradient.reset()
}

/** Generate a unique gradient ID prefix for a TreeMapChart instance. */
export function getTreeMapGradientPrefix(): string {
  return treemapGradient.getPrefix()
}

/** Reset the treemap gradient counter (for testing only) */
export function resetTreeMapGradientCounter(): void {
  treemapGradient.reset()
}

/** Generate a unique gradient ID prefix for a SunburstChart instance. */
export function getSunburstGradientPrefix(): string {
  return sunburstGradient.getPrefix()
}

/** Reset the sunburst gradient counter (for testing only) */
export function resetSunburstGradientCounter(): void {
  sunburstGradient.reset()
}

/** Generate a unique gradient ID prefix for a PieChart instance. */
export function getPieGradientPrefix(): string {
  return pieGradient.getPrefix()
}

/** Reset the pie gradient counter (for testing only) */
export function resetPieGradientCounter(): void {
  pieGradient.reset()
}

/**
 * Calculate stacked Y values for area / bar charts.
 *
 * X is the union of every series (missing x is y=0). Positive and negative
 * values stack from zero in opposite directions so a negative never sits
 * inside a positive band.
 */
export function stackSeriesData<T extends { x: unknown; y: number }>(
  seriesData: T[][]
): { original: T; y0: number; y1: number }[][] {
  if (seriesData.length === 0) return []

  const xKeys: unknown[] = []
  const seen = new Set<string>()
  for (const series of seriesData) {
    for (const datum of series) {
      const key = String(datum.x)
      if (seen.has(key)) continue
      seen.add(key)
      xKeys.push(datum.x)
    }
  }

  const lookup = seriesData.map((series) => {
    const map = new Map<unknown, T>()
    for (const datum of series) {
      if (!map.has(datum.x)) map.set(datum.x, datum)
    }
    return map
  })

  const positive = new Map<unknown, number>()
  const negative = new Map<unknown, number>()
  const result: { original: T; y0: number; y1: number }[][] = []

  for (let index = 0; index < seriesData.length; index++) {
    const seriesLookup = lookup[index]
    const stackedSeries: { original: T; y0: number; y1: number }[] = []
    for (const x of xKeys) {
      const original = seriesLookup.get(x) ?? ({ x, y: 0 } as T)
      const y = Number.isFinite(original.y) ? original.y : 0
      if (y >= 0) {
        const y0 = positive.get(x) ?? 0
        const y1 = y0 + y
        stackedSeries.push({ original, y0, y1 })
        positive.set(x, y1)
      } else {
        const y0 = negative.get(x) ?? 0
        const y1 = y0 + y
        stackedSeries.push({ original, y0, y1 })
        negative.set(x, y1)
      }
    }
    result.push(stackedSeries)
  }

  return result
}
