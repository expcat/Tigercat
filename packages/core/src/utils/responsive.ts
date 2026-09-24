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

export interface ObservedSize {
  width: number
  height: number
}

function readObserverSize(entry: ResizeObserverEntry): ObservedSize {
  const box = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize
  const width = box?.inlineSize ?? entry.contentRect.width
  const height = box?.blockSize ?? entry.contentRect.height
  return {
    width: Number.isFinite(width) ? width : 0,
    height: Number.isFinite(height) ? height : 0
  }
}

/**
 * Watch one element's content box. Returns an unsubscribe.
 * Missing `ResizeObserver` returns a no-op unsubscribe and does not throw.
 */
export function observeSize(
  element: Element | null | undefined,
  onSize: (size: ObservedSize) => void
): () => void {
  if (!element || typeof ResizeObserver === 'undefined') return () => undefined

  let stopped = false
  const observer = new ResizeObserver((entries) => {
    const list = entries ?? []
    if (list.length === 0) {
      onSize({ width: 0, height: 0 })
      return
    }
    const entry = list.find((item) => item.target === element) ?? list[0]
    if (!entry) return
    onSize(readObserverSize(entry))
  })
  observer.observe(element)
  return () => {
    if (stopped) return
    stopped = true
    observer.disconnect()
  }
}

/**
 * Watch an element's border box, including one synchronous read.
 * Returns a teardown. No-ops when RO is missing.
 */
export function observeElementSize(
  element: Element | null | undefined,
  onSize: (size: ObservedSize) => void
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
  return observeSize(element, () => emit())
}

function smallestDefinedResponsive<T>(
  map: Partial<Record<ResponsiveBreakpoint, T>>,
  skipXs: boolean
): T | undefined {
  for (const bp of RESPONSIVE_BREAKPOINT_ORDER) {
    if (skipXs && bp === 'xs') continue
    if (map[bp] !== undefined) return map[bp] as T
  }
  return undefined
}

/**
 * Resolve a responsive value for a measured container width.
 * Width `<= 0` is unmeasured: it does not select `xs` when a larger
 * breakpoint is authored, and it does not invent the caller's numeric
 * fallback while the map still has a value.
 * A positive width that matches nothing uses the smallest authored value,
 * not the numeric fallback.
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
  if (!Number.isFinite(width) || width <= 0) {
    return (
      smallestDefinedResponsive(map, true) ??
      smallestDefinedResponsive(map, false) ??
      fallback
    )
  }

  for (let i = RESPONSIVE_BREAKPOINT_ORDER.length - 1; i >= 0; i--) {
    const bp = RESPONSIVE_BREAKPOINT_ORDER[i]
    if (width >= minWidths[bp] && map[bp] !== undefined) {
      return map[bp] as T
    }
  }
  return smallestDefinedResponsive(map, false) ?? fallback
}

/**
 * CSS variables for one container-query property.
 * The smallest authored breakpoint is the base (including a 0-width container).
 * Larger breakpoints are `--tiger-{name}-{bp}` and the stylesheet promotes them.
 * A bare number only sets the base. It does not invent xs / 3 / 1.
 */
export function responsiveContainerVars(
  name: string,
  value: number | Partial<Record<ResponsiveBreakpoint, number>> | undefined,
  options: { unit?: string } = {}
): Record<string, string> {
  if (value == null) return {}
  const unit = options.unit ?? ''
  const write = (n: number) => `${n}${unit}`
  const baseKey = `--tiger-${name}-base`
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return {}
    return { [baseKey]: write(value) }
  }
  const base = smallestDefinedResponsive(value, false)
  if (base === undefined) return {}
  const vars: Record<string, string> = { [baseKey]: write(base) }
  let skippedBase = false
  for (const bp of RESPONSIVE_BREAKPOINT_ORDER) {
    const raw = value[bp]
    if (raw === undefined || !Number.isFinite(raw)) continue
    if (!skippedBase) {
      skippedBase = true
      continue
    }
    vars[`--tiger-${name}-${bp}`] = write(raw)
  }
  return vars
}
