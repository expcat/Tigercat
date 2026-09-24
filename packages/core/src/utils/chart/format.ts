/**
 * Stable gradient ids and stacked-series formatting.
 * Instance ids come from the framework (`useId`); there is no process counter.
 */

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
