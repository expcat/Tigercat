/**
 * Responsive breakpoint utilities for runtime column/value resolution.
 * @since 0.6.0
 */

export type ResponsiveBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'

/**
 * Breakpoint minimum widths (px), ordered smallest → largest.
 */
const BREAKPOINT_MIN_WIDTHS: [ResponsiveBreakpoint, number][] = [
  ['xxxl', 1920],
  ['xxl', 1536],
  ['xl', 1280],
  ['lg', 1024],
  ['md', 768],
  ['sm', 640],
  ['xs', 0]
]

/**
 * Resolve a responsive value for the given screen width.
 * Falls back through breakpoints (largest matching first), then to `fallback`.
 */
export function resolveResponsiveValue<T>(
  value: T | Partial<Record<ResponsiveBreakpoint, T>>,
  width: number,
  fallback: T
): T {
  if (typeof value !== 'object' || value === null) {
    return value as T
  }

  const map = value as Partial<Record<ResponsiveBreakpoint, T>>
  for (const [bp, minWidth] of BREAKPOINT_MIN_WIDTHS) {
    if (width >= minWidth && map[bp] !== undefined) {
      return map[bp] as T
    }
  }
  return fallback
}
