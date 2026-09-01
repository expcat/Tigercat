/**
 * Shared chart helpers — palette, legend, tooltip, series normalisation.
 */

import type {
  ChartLegendItem,
  ChartLegendPosition,
  ChartLegendOrientation,
  ChartScaleValue
} from '../types/chart'
import { classNames } from './class-names'
import { DEFAULT_CHART_COLORS } from './chart-utils'

export interface BuildChartSeriesKeysOptions<T> {
  prefix?: string
  getIdentity?: (series: T, index: number) => string | number | undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getDefaultChartSeriesIdentity(value: unknown): string | number | undefined {
  if (!isRecord(value)) return undefined

  const id = value.id
  if (typeof id === 'string' && id.trim()) return id
  if (typeof id === 'number' && Number.isFinite(id)) return id

  const key = value.key
  if (typeof key === 'string' && key.trim()) return key
  if (typeof key === 'number' && Number.isFinite(key)) return key

  const name = value.name
  if (typeof name === 'string' && name.trim()) return name
  return undefined
}

function normalizeChartSeriesKeyPart(value: string | number): string {
  const normalized = String(value)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  return normalized || 'series'
}

export function buildChartSeriesKeys<T>(
  series: readonly T[],
  options: BuildChartSeriesKeysOptions<T> = {}
): string[] {
  const { prefix = 'series-', getIdentity } = options
  const seen = new Map<string, number>()

  return series.map((item, index) => {
    const identity = getIdentity?.(item, index) ?? getDefaultChartSeriesIdentity(item)
    const base = normalizeChartSeriesKeyPart(identity ?? `index-${index}`)
    const duplicateIndex = seen.get(base) ?? 0
    seen.set(base, duplicateIndex + 1)
    const uniqueBase = duplicateIndex === 0 ? base : `${base}-${duplicateIndex + 1}`

    return `${prefix}${uniqueBase}`
  })
}

/** Resolve palette: `colors` → `fallbackColor` → DEFAULT_CHART_COLORS. */
export function resolveChartPalette(
  colors: string[] | undefined,
  fallbackColor?: string
): string[] {
  if (colors && colors.length > 0) return colors
  if (fallbackColor) return [fallbackColor]
  return [...DEFAULT_CHART_COLORS]
}

export interface BuildLegendItemsOptions<T> {
  data: T[]
  palette: string[]
  activeIndex: number | null
  selectedIndex?: number | null
  getLabel: (datum: T, index: number) => string
  getColor?: (datum: T, index: number) => string
}

/** Build `ChartLegendItem[]` from data/series array. */
export function buildChartLegendItems<T>(options: BuildLegendItemsOptions<T>): ChartLegendItem[] {
  const { data, palette, activeIndex, selectedIndex = null, getLabel, getColor } = options

  return data.map((datum, index) => ({
    index,
    label: getLabel(datum, index),
    color: getColor ? getColor(datum, index) : palette[index % palette.length],
    active: activeIndex === null || activeIndex === index,
    selected: selectedIndex !== null && selectedIndex === index
  }))
}

export function chartLegendOrientationFromPosition(
  position: ChartLegendPosition
): ChartLegendOrientation {
  return position === 'left' || position === 'right' ? 'vertical' : 'horizontal'
}

export function getChartLegendShellClasses(position: ChartLegendPosition = 'bottom'): string {
  return classNames(
    'inline-flex',
    position === 'right'
      ? 'flex-row items-start gap-4'
      : position === 'left'
        ? 'flex-row-reverse items-start gap-4'
        : position === 'top'
          ? 'flex-col-reverse gap-2'
          : 'flex-col gap-2'
  )
}

export function getCartesianChartShellClasses(options: {
  showLegend: boolean
  legendPosition?: ChartLegendPosition
  responsive?: boolean
  className?: string
}): string {
  if (!options.showLegend) {
    return classNames(
      'relative',
      options.responsive ? 'block w-full min-w-0' : 'inline-block',
      options.className
    )
  }
  return classNames(
    getChartLegendShellClasses(options.legendPosition),
    options.responsive && 'w-full min-w-0',
    options.className
  )
}

/** Resolve tooltip content for single-series charts (Bar, Scatter, Pie). */
export function resolveChartTooltipContent<T>(
  hoveredIndex: number | null,
  data: T[],
  formatter: ((datum: T, index: number) => string) | undefined,
  defaultFormatter: (datum: T, index: number) => string
): string {
  if (hoveredIndex === null) return ''
  const datum = data[hoveredIndex]
  if (!datum) return ''
  const fmt = formatter ?? defaultFormatter
  return fmt(datum, hoveredIndex)
}

export function getChartTooltipTransform(position: { x: number; y: number }): string {
  return `translate3d(${position.x}px, ${position.y}px, 0)`
}

export interface ChartTooltipPositionInput {
  x: number
  y: number
  rect: { width: number; height: number }
  viewport: { width: number; height: number }
  offsetX?: number
  offsetY?: number
  padding?: number
}

export function resolveChartTooltipPosition(input: ChartTooltipPositionInput): {
  x: number
  y: number
} {
  const offsetX = input.offsetX ?? 12
  const offsetY = input.offsetY ?? -8
  const padding = input.padding ?? 8
  const anchorX = Number.isFinite(input.x) ? input.x : 0
  const anchorY = Number.isFinite(input.y) ? input.y : 0
  const rectWidth = Number.isFinite(input.rect.width) ? Math.max(0, input.rect.width) : 0
  const rectHeight = Number.isFinite(input.rect.height) ? Math.max(0, input.rect.height) : 0
  const viewportWidth = Number.isFinite(input.viewport.width)
    ? Math.max(0, input.viewport.width)
    : 0
  const viewportHeight = Number.isFinite(input.viewport.height)
    ? Math.max(0, input.viewport.height)
    : 0

  let nextX = anchorX + offsetX
  let nextY = anchorY + offsetY

  if (nextX + rectWidth > viewportWidth - padding) {
    nextX = anchorX - rectWidth - offsetX
  }
  if (nextY + rectHeight > viewportHeight - padding) {
    nextY = anchorY - rectHeight - Math.abs(offsetY)
  }

  return {
    x: Math.max(padding, nextX),
    y: Math.max(padding, nextY)
  }
}

export interface DownsampledPoint<T> {
  item: T
  index: number
}

export function downsampleSeriesData<T>(
  data: readonly T[],
  threshold: number,
  getValue: (item: T, index: number) => number = (_item, index) => index
): DownsampledPoint<T>[] {
  const safeThreshold = Math.max(0, Math.floor(Number.isFinite(threshold) ? threshold : 0))
  if (safeThreshold === 0 || data.length <= safeThreshold) {
    return data.map((item, index) => ({ item, index }))
  }
  if (safeThreshold === 1) {
    return [{ item: data[0], index: 0 }]
  }

  const result: DownsampledPoint<T>[] = [{ item: data[0], index: 0 }]
  const bucketSize = (data.length - 2) / Math.max(1, safeThreshold - 2)

  for (let bucket = 0; bucket < safeThreshold - 2; bucket++) {
    const start = Math.floor(1 + bucket * bucketSize)
    const end = Math.min(data.length - 1, Math.floor(1 + (bucket + 1) * bucketSize))
    let selectedIndex = start
    let selectedValue = Number.NEGATIVE_INFINITY
    for (let index = start; index < end; index++) {
      const rawValue = getValue(data[index], index)
      const value = Math.abs(Number.isFinite(rawValue) ? rawValue : 0)
      if (value > selectedValue) {
        selectedValue = value
        selectedIndex = index
      }
    }
    result.push({ item: data[selectedIndex], index: selectedIndex })
  }

  result.push({ item: data[data.length - 1], index: data.length - 1 })
  return result
}

function chartDatumX(datum: unknown): unknown {
  if (typeof datum === 'object' && datum !== null && 'x' in datum) {
    return (datum as { x?: unknown }).x
  }
  return undefined
}

/** Resolve tooltip content for multi-series charts (Line, Area, Radar). */
export function resolveMultiSeriesTooltipContent<TDatum, TSeries extends { data: TDatum[] }>(
  hoveredPoint: { seriesIndex: number; pointIndex: number } | null,
  series: TSeries[],
  formatter:
    | ((datum: TDatum, seriesIndex: number, pointIndex: number, series?: TSeries) => string)
    | undefined,
  defaultFormatter: (
    datum: TDatum,
    seriesIndex: number,
    pointIndex: number,
    series?: TSeries
  ) => string
): string {
  if (!hoveredPoint) return ''
  const { seriesIndex, pointIndex } = hoveredPoint
  const s = series[seriesIndex]
  const datum = s?.data[pointIndex]
  if (!datum) return ''
  if (formatter) return formatter(datum, seriesIndex, pointIndex, s)

  const x = chartDatumX(datum)
  if (x === undefined) return defaultFormatter(datum, seriesIndex, pointIndex, s)

  const lines: string[] = []
  series.forEach((item, index) => {
    const matchIndex = item.data.findIndex((point) => String(chartDatumX(point)) === String(x))
    if (matchIndex < 0) return
    lines.push(defaultFormatter(item.data[matchIndex], index, matchIndex, item))
  })
  return lines.length > 0 ? lines.join('\n') : defaultFormatter(datum, seriesIndex, pointIndex, s)
}

/**
 * Normalise `series` / `data` props for multi-series charts.
 * Returns `series` if non-empty, else wraps `data` into a single-series array.
 */
export function resolveSeriesData<TDatum, TSeries extends { data: TDatum[] }>(
  series: TSeries[] | undefined,
  data: TDatum[] | undefined,
  defaultSeries?: Partial<Omit<TSeries, 'data'>>
): TSeries[] {
  if (series && series.length > 0) return series
  if (data && data.length > 0) {
    return [{ ...defaultSeries, data } as TSeries]
  }
  return []
}

/** Default tooltip for single-datum x/y charts (Bar, Scatter). */
export function defaultXYTooltipFormatter(
  datum: { x?: ChartScaleValue; y?: number; label?: string },
  index: number
): string {
  const label = datum.label ?? (datum.x !== undefined ? String(datum.x) : `#${index + 1}`)
  return `${label}: ${datum.y ?? ''}`
}

export function defaultChartSeriesName(index: number, template = 'Series {index}'): string {
  return template.replace('{index}', String(index + 1))
}

/** Default tooltip for multi-series x/y charts (Line, Area). */
export function defaultSeriesXYTooltipFormatter<TSeries extends { name?: string }>(
  datum: { x?: ChartScaleValue; y?: number; label?: string },
  seriesIndex: number,
  _pointIndex: number,
  series?: TSeries,
  seriesNameTemplate = 'Series {index}'
): string {
  const seriesName = series?.name ?? defaultChartSeriesName(seriesIndex, seriesNameTemplate)
  const label = datum.label ?? (datum.x !== undefined ? String(datum.x) : '')
  return `${seriesName} · ${label}: ${datum.y ?? ''}`
}

/** Default tooltip for Radar chart. */
export function defaultRadarTooltipFormatter<TSeries extends { name?: string }>(
  datum: { value: number; label?: string },
  seriesIndex: number,
  pointIndex: number,
  series?: TSeries,
  seriesNameTemplate = 'Series {index}'
): string {
  const seriesName = series?.name ?? defaultChartSeriesName(seriesIndex, seriesNameTemplate)
  const label = datum.label ?? `#${pointIndex + 1}`
  return `${seriesName} · ${label}: ${datum.value}`
}
