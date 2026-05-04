/**
 * Shared chart helpers — palette, legend, tooltip, series normalisation.
 */

import type { ChartLegendItem, ChartScaleValue } from '../types/chart'
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
  getLabel: (datum: T, index: number) => string
  getColor?: (datum: T, index: number) => string
}

/** Build `ChartLegendItem[]` from data/series array. */
export function buildChartLegendItems<T>(options: BuildLegendItemsOptions<T>): ChartLegendItem[] {
  const { data, palette, activeIndex, getLabel, getColor } = options

  return data.map((datum, index) => ({
    index,
    label: getLabel(datum, index),
    color: getColor ? getColor(datum, index) : palette[index % palette.length],
    active: activeIndex === null || activeIndex === index
  }))
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
  const fmt = formatter ?? defaultFormatter
  return fmt(datum, seriesIndex, pointIndex, s)
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

/** Default tooltip for multi-series x/y charts (Line, Area). */
export function defaultSeriesXYTooltipFormatter<TSeries extends { name?: string }>(
  datum: { x?: ChartScaleValue; y?: number; label?: string },
  seriesIndex: number,
  _pointIndex: number,
  series?: TSeries
): string {
  const seriesName = series?.name ?? `Series ${seriesIndex + 1}`
  const label = datum.label ?? (datum.x !== undefined ? String(datum.x) : '')
  return `${seriesName} · ${label}: ${datum.y ?? ''}`
}

/** Default tooltip for Radar chart. */
export function defaultRadarTooltipFormatter<TSeries extends { name?: string }>(
  datum: { value: number; label?: string },
  seriesIndex: number,
  _pointIndex: number,
  series?: TSeries
): string {
  const seriesName = series?.name ?? `Series ${seriesIndex + 1}`
  const label = datum.label ?? `#${_pointIndex + 1}`
  return `${seriesName} · ${label}: ${datum.value}`
}
