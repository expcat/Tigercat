/**
 * Shared chart helpers — palette, legend, tooltip, series normalisation.
 */

import type { ChartLegendItem, ChartScaleValue } from '../types/chart'
import { DEFAULT_CHART_COLORS } from './chart-utils'

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
