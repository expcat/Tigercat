/**
 * Responsive breakpoint utilities for runtime column/value resolution.
 *
 * Pixel thresholds match `--tiger-breakpoint-*` / the layout grid table.
 * `xxl` / `xxxl` are not theme tokens — use `2xl`.
 * @since 0.6.0
 */

import { THEME_CSS_VARS, TIGER_BREAKPOINT_CSS_VALUES } from '../theme-runtime'
import type { Breakpoint } from '../types/grid'
import { isBrowser } from './env'

export type ResponsiveBreakpoint = Breakpoint

export const RESPONSIVE_BREAKPOINT_ORDER: ResponsiveBreakpoint[] = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl'
]

export const RESPONSIVE_BREAKPOINT_FALLBACK_PX: Record<ResponsiveBreakpoint, number> = {
  xs: parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpointXs),
  sm: parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpointSm),
  md: parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpointMd),
  lg: parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpointLg),
  xl: parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpointXl),
  '2xl': parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpoint2xl)
}

const BREAKPOINT_VAR: Record<ResponsiveBreakpoint, string> = {
  xs: THEME_CSS_VARS.breakpointXs,
  sm: THEME_CSS_VARS.breakpointSm,
  md: THEME_CSS_VARS.breakpointMd,
  lg: THEME_CSS_VARS.breakpointLg,
  xl: THEME_CSS_VARS.breakpointXl,
  '2xl': THEME_CSS_VARS.breakpoint2xl
}

function parsePx(raw: string, fallback: number): number {
  const value = parseFloat(raw)
  return Number.isFinite(value) ? value : fallback
}

/**
 * Read `--tiger-breakpoint-*` from the document, falling back to the theme table.
 */
export function readThemeBreakpointMinWidths(): Record<ResponsiveBreakpoint, number> {
  if (!isBrowser() || typeof getComputedStyle === 'undefined') {
    return { ...RESPONSIVE_BREAKPOINT_FALLBACK_PX }
  }
  const style = getComputedStyle(document.documentElement)
  const widths = { ...RESPONSIVE_BREAKPOINT_FALLBACK_PX }
  for (const bp of RESPONSIVE_BREAKPOINT_ORDER) {
    widths[bp] = parsePx(style.getPropertyValue(BREAKPOINT_VAR[bp]), widths[bp])
  }
  return widths
}

export function isResponsiveMap<T>(
  value: T | Partial<Record<ResponsiveBreakpoint, T>> | undefined | null
): value is Partial<Record<ResponsiveBreakpoint, T>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Watch an element's box. Returns a teardown. No-ops when RO is missing.
 */
export function observeElementSize(
  element: Element | null | undefined,
  onSize: (size: { width: number; height: number }) => void
): () => void {
  if (!element || typeof ResizeObserver === 'undefined') return () => undefined

  const emit = (): void => {
    const rect = element.getBoundingClientRect()
    onSize({
      width: Number.isFinite(rect.width) ? rect.width : 0,
      height: Number.isFinite(rect.height) ? rect.height : 0
    })
  }
  emit()
  const observer = new ResizeObserver(() => emit())
  observer.observe(element)
  return () => observer.disconnect()
}

/**
 * Resolve a responsive value for the given container (or viewport) width.
 * Falls back through breakpoints (largest matching first), then to `fallback`.
 */
export function resolveResponsiveValue<T>(
  value: T | Partial<Record<ResponsiveBreakpoint, T>>,
  width: number,
  fallback: T,
  minWidths: Record<ResponsiveBreakpoint, number> = RESPONSIVE_BREAKPOINT_FALLBACK_PX
): T {
  if (!isResponsiveMap(value)) {
    return value as T
  }

  const map = value
  for (let i = RESPONSIVE_BREAKPOINT_ORDER.length - 1; i >= 0; i--) {
    const bp = RESPONSIVE_BREAKPOINT_ORDER[i]
    if (width >= minWidths[bp] && map[bp] !== undefined) {
      return map[bp] as T
    }
  }
  return fallback
}
