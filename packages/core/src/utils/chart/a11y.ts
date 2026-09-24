/**
 * Chart reading direction, accessible names, and one-value color styles.
 * Direction comes from ConfigProvider or the page, never a chart-local prop.
 */

import type { ChartPadding } from '../../types/chart'
import { normalizeChartPadding } from './scale'

export type ChartWritingDirection = 'ltr' | 'rtl'

export const CHART_SVG_ROLE = 'group'
export const CHART_SERIES_COLOR_PROPERTY = '--tiger-series-color'

/** Default light-theme hex paired with each `--tiger-chart-n` token. */
export const CHART_COLOR_TOKEN_FALLBACKS: Record<string, string> = {
  '--tiger-chart-1': '#2563eb',
  '--tiger-chart-2': '#16a34a',
  '--tiger-chart-3': '#d97706',
  '--tiger-chart-4': '#a855f7',
  '--tiger-chart-5': '#0ea5e9',
  '--tiger-chart-6': '#ef4444'
}

export function readPageWritingDirection(): ChartWritingDirection | null {
  if (typeof document === 'undefined') return null
  const value = document.documentElement.getAttribute('dir')
  if (value === 'rtl' || value === 'ltr') return value
  return null
}

export function resolveChartWritingDirection(
  configDirection?: string | null,
  pageDirection?: string | null
): ChartWritingDirection {
  const value = configDirection || pageDirection
  return value === 'rtl' ? 'rtl' : 'ltr'
}

/** Y axis sits on the block's inline-start edge. */
export function chartYAxisOrientation(direction: ChartWritingDirection): 'left' | 'right' {
  return direction === 'rtl' ? 'right' : 'left'
}

/**
 * Swap the physical gutters so the larger start padding follows inline-start.
 * Callers pass the result to both the canvas and the scales.
 */
export function logicalChartPadding(
  padding: ChartPadding | undefined,
  direction: ChartWritingDirection
): { top: number; right: number; bottom: number; left: number } {
  const resolved = normalizeChartPadding(padding)
  if (direction !== 'rtl') return resolved
  return {
    top: resolved.top,
    right: resolved.left,
    bottom: resolved.bottom,
    left: resolved.right
  }
}

export function chartAccessibleName(
  explicit: string | undefined,
  title: string | undefined,
  fallback: string
): string {
  const named = explicit?.trim() || title?.trim()
  return named || fallback
}

export function isChartPlotEmpty(rect: { width: number; height: number }): boolean {
  return !(rect.width > 0) || !(rect.height > 0)
}

export function chartSeriesColorStyle(color: string): Record<string, string> {
  return { [CHART_SERIES_COLOR_PROPERTY]: color }
}

/** Hover halo. The series color is a custom property, not a function argument. */
export function chartHoverShadowFilter(): string {
  return 'drop-shadow(0 0 var(--tiger-chart-scatter-halo-radius) var(--tiger-series-color))'
}

export function chartHoverShadowStyle(
  color: string,
  animationDelay?: string
): Record<string, string> {
  return {
    ...chartSeriesColorStyle(color),
    filter: chartHoverShadowFilter(),
    ...(animationDelay ? { animationDelay } : {})
  }
}

/**
 * `color-mix` whose second color is `--tiger-series-color`.
 * `base` is a fixed token (`var(--tiger-surface)`), never series data.
 */
export function chartTokenColorMix(
  space: 'oklab' | 'oklch',
  base: string,
  amount: string
): string {
  return `color-mix(in ${space}, ${base} ${amount}, var(${CHART_SERIES_COLOR_PROPERTY}))`
}

export function chartTooltipLines(content: string): string[] {
  if (!content) return []
  return content.split('\n').filter((line) => line.length > 0)
}
