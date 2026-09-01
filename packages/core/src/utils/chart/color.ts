/**
 * Chart color, palette, shadow, and CSS class constants.
 *
 * Pure visual tokens — no logic. Split out of `chart-utils.ts` (PR-12).
 */

import { classNames } from '../class-names'
import { overlayZIndexClass } from '../floating'
import type { ChartSeriesType } from '../../types/chart'

// ----------------------------------------------------------------------------
// Base classes
// ----------------------------------------------------------------------------

export const chartCanvasBaseClasses = 'block overflow-visible'

export const chartCanvasHostClasses = 'block min-w-0 w-full overflow-visible'

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

export const chartLegendListClasses = 'flex flex-wrap'

export function getChartLegendItemClasses(options: {
  interactive: boolean
  dimmed: boolean
}): string {
  return classNames(
    'flex items-center gap-2 text-sm rounded-[var(--tiger-chart-legend-row-radius,0)]',
    'text-[color:var(--tiger-text-secondary,#6b7280)]',
    options.interactive
      ? 'cursor-pointer hover:text-[color:var(--tiger-text,#374151)] hover:bg-[var(--tiger-chart-legend-row-hover-bg,transparent)] transition-colors motion-reduce:transition-none'
      : 'cursor-default',
    options.dimmed ? 'opacity-50' : undefined
  )
}

export const chartTooltipBaseClasses = classNames(
  `fixed left-0 top-0 ${overlayZIndexClass.overlay} pointer-events-none will-change-transform`,
  'max-w-xs px-3 py-2 rounded-[var(--tiger-radius-md,0.375rem)] shadow-[var(--tiger-shadow-glass,0_10px_15px_-3px_rgb(0_0_0_/_0.1),0_4px_6px_-4px_rgb(0_0_0_/_0.1))]',
  'bg-[color:var(--tiger-bg-elevated,#1f2937)]',
  'text-[color:var(--tiger-text-inverse,#f9fafb)]',
  'text-sm',
  'transition-opacity duration-150 motion-reduce:transition-none'
)

export function getChartSeriesPaint(
  type: ChartSeriesType | undefined,
  color: string | undefined
): { fill?: string; stroke?: string } {
  if (!color) return {}
  switch (type) {
    case 'line':
    case 'area':
    case 'radar':
      return { fill: 'none', stroke: color }
    case 'bar':
    case 'pie':
      return { fill: color, stroke: 'none' }
    case 'scatter':
      return { fill: color, stroke: color }
    case 'custom':
    default:
      return {}
  }
}

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
 * Optional `--tiger-chart-split-*` overrides; fallbacks mix `--tiger-text` so
 * bands follow light/dark instead of a black-alpha wash.
 */
export const RADAR_SPLIT_AREA_COLORS = [
  'var(--tiger-chart-split-1,color-mix(in oklab, var(--tiger-text) 4%, transparent))',
  'var(--tiger-chart-split-2,color-mix(in oklab, var(--tiger-text) 10%, transparent))'
]

// ----------------------------------------------------------------------------
// Drop shadows (pie / donut emphasis)
// ----------------------------------------------------------------------------

/** Drop shadow filter value for emphasized pie slices */
export const PIE_EMPHASIS_SHADOW =
  'drop-shadow(0 4px 8px color-mix(in oklab, var(--tiger-text) 25%, transparent))'
export const PIE_BASE_SHADOW =
  'drop-shadow(0 1px 2px color-mix(in oklab, var(--tiger-text) 12%, transparent))'

export const pieSliceTransitionClasses =
  'transition-[opacity,filter] motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base,200ms)]'

export const pieSliceLabelInsideClasses =
  'fill-[color:var(--tiger-text-inverse,#f9fafb)] text-[11px] font-medium pointer-events-none select-none'

export const funnelSegmentTransitionClasses =
  'transition-opacity motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base,200ms)]'

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
  'transition-all [transition-duration:var(--tiger-motion-duration-base,200ms)] [transition-timing-function:var(--tiger-motion-ease-spring,cubic-bezier(0,0,0.2,1))] motion-reduce:transition-none'

/** CSS classes for value labels displayed on bars */
export const barValueLabelClasses =
  'fill-[color:var(--tiger-text,#374151)] text-[11px] font-medium pointer-events-none select-none'

/** CSS classes for value labels inside bars (needs contrasting color) */
export const barValueLabelInsideClasses =
  'fill-[color:var(--tiger-text-inverse,#f9fafb)] text-[11px] font-medium pointer-events-none select-none'

export const barInteractiveClasses =
  'cursor-pointer hover:brightness-110 motion-reduce:hover:brightness-100'

export const BAR_ANIMATED_CLASS = 'tiger-bar-animated motion-reduce:transition-none'

/** CSS transition string for animated bars */
export const barAnimatedTransition =
  'transition: y var(--tiger-motion-duration-slow,600ms) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)), height var(--tiger-motion-duration-slow,600ms) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)), opacity var(--tiger-motion-duration-base,200ms) var(--tiger-motion-ease-decelerate,ease-out), filter var(--tiger-motion-duration-base,200ms) var(--tiger-motion-ease-decelerate,ease-out)'

/**
 * CSS transition for scatter point hover.
 *
 * Default fallback `cubic-bezier(0,0,0.2,1)` mirrors Tailwind `ease-out` so
 * visual is unchanged. With `<html data-tiger-style="modern">` the timing
 * function switches to `--tiger-motion-ease-spring` for a subtle overshoot
 * on hover scaling (matches phase2.7 §3 ScatterChart "spring 缩放").
 */
export const scatterPointTransitionClasses =
  'transition-all [transition-duration:var(--tiger-motion-duration-base,200ms)] [transition-timing-function:var(--tiger-motion-ease-spring,cubic-bezier(0,0,0.2,1))] motion-reduce:transition-none'

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

export const SCATTER_ENTRANCE_CLASS = 'tiger-scatter-entrance motion-reduce:animate-none'
export const LINE_DRAW_CLASS = 'tiger-line-animated motion-reduce:animate-none'
export const AREA_DRAW_CLASS = 'tiger-area-animated motion-reduce:animate-none'

/**
 * Plugin keyframes for cartesian chart entrance / draw animations.
 * Components apply the class names; they must not inject `<style>` at runtime.
 */
export const cartesianChartAnimationBaseStyles = {
  '@keyframes tiger-line-draw': {
    from: { strokeDashoffset: '1' },
    to: { strokeDashoffset: '0' }
  },
  '@keyframes tiger-area-draw': {
    from: { strokeDashoffset: '1' },
    to: { strokeDashoffset: '0' }
  },
  '@keyframes tiger-scatter-entrance': {
    from: { opacity: '0', transform: 'scale(0)' },
    '60%': { transform: 'scale(1.15)' },
    to: { opacity: '1', transform: 'scale(1)' }
  },
  '.tiger-line-animated': {
    animation:
      'tiger-line-draw var(--tiger-motion-duration-slow,1.2s) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)) forwards'
  },
  '.tiger-area-animated': {
    animation:
      'tiger-area-draw var(--tiger-motion-duration-slow,1.2s) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)) forwards'
  },
  '.tiger-scatter-entrance': {
    transformBox: 'fill-box',
    transformOrigin: 'center',
    animation:
      'tiger-scatter-entrance var(--tiger-motion-duration-slow,500ms) var(--tiger-motion-ease-spring,cubic-bezier(.34,1.56,.64,1)) both'
  },
  '.tiger-bar-animated': {
    transition:
      'y var(--tiger-motion-duration-slow,600ms) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)), height var(--tiger-motion-duration-slow,600ms) var(--tiger-motion-ease-emphasized,cubic-bezier(.4,0,.2,1)), opacity var(--tiger-motion-duration-base,200ms) var(--tiger-motion-ease-decelerate,ease-out), filter var(--tiger-motion-duration-base,200ms) var(--tiger-motion-ease-decelerate,ease-out)'
  },
  '@keyframes tiger-donut-entrance': {
    from: { opacity: '0', transform: 'scale(0.9)' },
    to: { opacity: '1', transform: 'scale(1)' }
  },
  '.tiger-donut-entrance': {
    transformBox: 'fill-box',
    transformOrigin: 'center',
    animation:
      'tiger-donut-entrance var(--tiger-motion-duration-slow,500ms) var(--tiger-motion-ease-spring,cubic-bezier(.34,1.56,.64,1)) both'
  }
} as const

/**
 * CSS animation keyframes and class for the donut entrance animation.
 * The plugin owns the keyframes; components must not inject `<style>`.
 */
export const DONUT_ENTRANCE_KEYFRAMES = ''
export const DONUT_ENTRANCE_CLASS = 'tiger-donut-entrance motion-reduce:animate-none'
