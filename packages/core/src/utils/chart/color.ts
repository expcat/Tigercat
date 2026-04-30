/**
 * Chart color, palette, shadow, and CSS class constants.
 *
 * Pure visual tokens — no logic. Split out of `chart-utils.ts` (PR-12).
 */

// ----------------------------------------------------------------------------
// Base classes
// ----------------------------------------------------------------------------

export const chartCanvasBaseClasses = 'block'

export const chartAxisLineClasses =
  'stroke-[color:var(--tiger-border,#e5e7eb)] [stroke-opacity:var(--tiger-chart-axis-line-opacity,1)]'
export const chartAxisTickLineClasses =
  'stroke-[color:var(--tiger-border,#e5e7eb)] [stroke-opacity:var(--tiger-chart-axis-tick-opacity,1)]'
export const chartAxisTickTextClasses =
  'fill-[color:var(--tiger-text-secondary,#6b7280)] text-xs tabular-nums'
export const chartAxisLabelClasses =
  'fill-[color:var(--tiger-text,#374151)] text-xs font-medium tabular-nums'

export const chartGridLineClasses =
  'stroke-[color:var(--tiger-border,#e5e7eb)] [stroke-opacity:var(--tiger-chart-grid-line-opacity,1)]'

// ----------------------------------------------------------------------------
// Default palette (theme tokens with hex fallback)
// ----------------------------------------------------------------------------

/**
 * Default color palette for chart components.
 * Uses CSS variables with fallback colors so palette swaps cleanly with themes.
 */
export const DEFAULT_CHART_COLORS = [
  'var(--tiger-chart-1,#2563eb)',
  'var(--tiger-chart-2,#22c55e)',
  'var(--tiger-chart-3,#f97316)',
  'var(--tiger-chart-4,#a855f7)',
  'var(--tiger-chart-5,#0ea5e9)',
  'var(--tiger-chart-6,#ef4444)'
] as const

/**
 * Default split area colors for radar / polar grids (subtle alternating fills).
 */
export const RADAR_SPLIT_AREA_COLORS = [
  'var(--tiger-chart-split-1,rgba(0,0,0,0.02))',
  'var(--tiger-chart-split-2,rgba(0,0,0,0.05))'
]

// ----------------------------------------------------------------------------
// Drop shadows (pie / donut emphasis)
// ----------------------------------------------------------------------------

/** Drop shadow filter value for emphasized pie slices */
export const PIE_EMPHASIS_SHADOW = 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
export const PIE_BASE_SHADOW = 'drop-shadow(0 1px 2px rgba(0,0,0,0.06))'

/** Enhanced donut-specific shadow – deeper & more diffuse for richer emphasis */
export const DONUT_EMPHASIS_SHADOW =
  'drop-shadow(0 8px 20px rgba(0,0,0,0.28)) drop-shadow(0 2px 6px rgba(0,0,0,0.12))'
export const DONUT_BASE_SHADOW = 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))'

// ----------------------------------------------------------------------------
// Line / area / bar / scatter visual constants
// ----------------------------------------------------------------------------

/**
 * CSS transition classes for line/area chart point hover.
 *
 * Default fallback `cubic-bezier(0,0,0.2,1)` mirrors Tailwind `ease-out` so
 * visual is unchanged. With `<html data-tiger-style="modern">` the timing
 * function switches to `--tiger-motion-ease-spring` for a subtle overshoot
 * on hover scaling (matches phase2.7 §3 LineChart/AreaChart "spring 缩放",
 * mirrors `scatterPointTransitionClasses` from PR-19k(f)).
 */
export const linePointTransitionClasses =
  'transition-all duration-200 [transition-timing-function:var(--tiger-motion-ease-spring,cubic-bezier(0,0,0.2,1))]'

/** CSS classes for value labels displayed on bars */
export const barValueLabelClasses =
  'fill-[color:var(--tiger-text,#374151)] text-[11px] font-medium pointer-events-none select-none'

/** CSS classes for value labels inside bars (needs contrasting color) */
export const barValueLabelInsideClasses =
  'fill-white text-[11px] font-medium pointer-events-none select-none'

/** CSS transition string for animated bars */
export const barAnimatedTransition =
  'transition: y var(--tiger-motion-duration-slow,600ms) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)), height var(--tiger-motion-duration-slow,600ms) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)), opacity 200ms ease-out, filter 200ms ease-out'

/**
 * CSS transition for scatter point hover.
 *
 * Default fallback `cubic-bezier(0,0,0.2,1)` mirrors Tailwind `ease-out` so
 * visual is unchanged. With `<html data-tiger-style="modern">` the timing
 * function switches to `--tiger-motion-ease-spring` for a subtle overshoot
 * on hover scaling (matches phase2.7 §3 ScatterChart "spring 缩放").
 */
export const scatterPointTransitionClasses =
  'transition-all duration-200 [transition-timing-function:var(--tiger-motion-ease-spring,cubic-bezier(0,0,0.2,1))]'

/**
 * Drop shadow filter for hovered scatter points.
 *
 * Halo radius is token-driven (`--tiger-chart-scatter-halo-radius`, fallback
 * `4px`) so modern preset can amplify slightly without changing default visual.
 */
export function getScatterHoverShadow(color: string): string {
  return `drop-shadow(0 0 var(--tiger-chart-scatter-halo-radius,4px) ${color})`
}

/** Compute the hovered size for a scatter point. */
export function getScatterHoverSize(baseSize: number): number {
  return baseSize + 2
}

/**
 * CSS animation keyframes and class for scatter entrance animation.
 * Inject once via <style> tag.
 */
export const SCATTER_ENTRANCE_KEYFRAMES = `@keyframes tiger-scatter-entrance{from{opacity:0;transform:scale(0)}60%{transform:scale(1.15)}to{opacity:1;transform:scale(1)}}`
export const SCATTER_ENTRANCE_CLASS = 'tiger-scatter-entrance'
