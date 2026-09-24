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
  'stroke-[color:var(--tiger-border)] [stroke-opacity:var(--tiger-chart-axis-line-opacity)]'
export const chartAxisTickLineClasses =
  'stroke-[color:var(--tiger-border)] [stroke-opacity:var(--tiger-chart-axis-tick-opacity)]'
export const chartAxisTickTextClasses =
  'fill-[color:var(--tiger-text-secondary)] text-xs tabular-nums'
export const chartAxisLabelClasses =
  'fill-[color:var(--tiger-text)] text-xs font-medium tabular-nums'

export const chartGridLineClasses =
  'stroke-[color:var(--tiger-border)] [stroke-opacity:var(--tiger-chart-grid-line-opacity)]'

export const chartLegendListClasses = 'flex flex-wrap'

export function getChartLegendItemClasses(options: {
  interactive: boolean
  dimmed: boolean
}): string {
  return classNames(
    'flex items-center gap-2 text-sm rounded-[var(--tiger-chart-legend-row-radius)]',
    'text-[color:var(--tiger-text-secondary)]',
    options.interactive
      ? 'cursor-pointer hover:text-[color:var(--tiger-text)] hover:bg-[var(--tiger-chart-legend-row-hover-bg)] transition-colors motion-reduce:transition-none'
      : 'cursor-default',
    options.dimmed ? 'opacity-50' : undefined
  )
}

export const chartTooltipBaseClasses = classNames(
  `fixed left-0 top-0 ${overlayZIndexClass.overlay} pointer-events-none will-change-transform`,
  'max-w-xs px-3 py-2 rounded-[var(--tiger-radius-md)] shadow-[var(--tiger-shadow-lg)]',
  'bg-[color:var(--tiger-bg-elevated)]',
  'text-[color:var(--tiger-text-inverse)]',
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
  'var(--tiger-chart-1)',
  'var(--tiger-chart-2)',
  'var(--tiger-chart-3)',
  'var(--tiger-chart-4)',
  'var(--tiger-chart-5)',
  'var(--tiger-chart-6)'
] as const

/**
 * Default split area colors for radar / polar grids (subtle alternating fills).
 * Optional `--tiger-chart-split-*` overrides; fallbacks mix `--tiger-text` so
 * bands follow light/dark instead of a black-alpha wash.
 */
export const RADAR_SPLIT_AREA_COLORS = [
  'var(--tiger-chart-split-1)',
  'var(--tiger-chart-split-2)'
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
  'transition-[opacity,filter] motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base)]'

export const pieSliceLabelInsideClasses =
  'text-[11px] font-medium pointer-events-none select-none'

export const funnelSegmentTransitionClasses =
  'transition-opacity motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base)]'

// ----------------------------------------------------------------------------
// Line / area / bar / scatter visual constants
// ----------------------------------------------------------------------------

/** Hover transition for line/area points. Duration and easing come from motion tokens. */
export const linePointTransitionClasses =
  'transition-[opacity,transform] [transition-duration:var(--tiger-motion-duration-base)] [transition-timing-function:var(--tiger-motion-ease-standard)]'

/** CSS classes for value labels displayed on bars */
export const barValueLabelClasses =
  'fill-[color:var(--tiger-text)] text-[11px] font-medium pointer-events-none select-none'

/** CSS classes for value labels inside bars (needs contrasting color) */
export const barValueLabelInsideClasses =
  'fill-[color:var(--tiger-text-inverse)] text-[11px] font-medium pointer-events-none select-none'

export const barInteractiveClasses =
  'cursor-pointer hover:brightness-110 motion-reduce:hover:brightness-100'

export const BAR_ANIMATED_CLASS = 'tiger-bar-animated motion-reduce:transition-none'

/** Hover transition for scatter points. Duration and easing come from motion tokens. */
export const scatterPointTransitionClasses =
  'transition-[opacity,transform] [transition-duration:var(--tiger-motion-duration-base)] [transition-timing-function:var(--tiger-motion-ease-standard)]'

/**
 * Drop shadow filter for hovered scatter points.
 *
 * Halo radius is token-driven (`--tiger-chart-scatter-halo-radius`, fallback
 * `4px`) so modern preset can amplify slightly without changing default visual.
 */
export function getScatterHoverShadow(): string {
  return 'drop-shadow(0 0 var(--tiger-chart-scatter-halo-radius) var(--tiger-series-color))'
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
      'tiger-line-draw var(--tiger-motion-duration-slow) var(--tiger-motion-ease-emphasized) forwards'
  },
  '.tiger-area-animated': {
    animation:
      'tiger-area-draw var(--tiger-motion-duration-slow) var(--tiger-motion-ease-emphasized) forwards'
  },
  '.tiger-scatter-entrance': {
    transformBox: 'fill-box',
    transformOrigin: 'center',
    animation:
      'tiger-scatter-entrance var(--tiger-motion-duration-slow) var(--tiger-motion-ease-standard) both'
  },
  '.tiger-bar-animated': {
    transition:
      'y var(--tiger-motion-duration-slow) var(--tiger-motion-ease-emphasized), height var(--tiger-motion-duration-slow) var(--tiger-motion-ease-emphasized), opacity var(--tiger-motion-duration-base) var(--tiger-motion-ease-decelerate), filter var(--tiger-motion-duration-base) var(--tiger-motion-ease-decelerate)'
  },
  '@keyframes tiger-donut-entrance': {
    from: { opacity: '0', transform: 'scale(0.9)' },
    to: { opacity: '1', transform: 'scale(1)' }
  },
  '.tiger-donut-entrance': {
    transformBox: 'fill-box',
    transformOrigin: 'center',
    animation:
      'tiger-donut-entrance var(--tiger-motion-duration-slow) var(--tiger-motion-ease-standard) both'
  }
} as const

/**
 * CSS animation keyframes and class for the donut entrance animation.
 * The plugin owns the keyframes; components must not inject `<style>`.
 */
export const DONUT_ENTRANCE_KEYFRAMES = ''
export const DONUT_ENTRANCE_CLASS = 'tiger-donut-entrance motion-reduce:animate-none'
