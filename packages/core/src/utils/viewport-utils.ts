/**
 * Runtime viewport helpers aligned with Tigercat/Tailwind breakpoints.
 */

import { isBrowser } from './env'

export const TIGER_VIEWPORT_BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
  xxxl: 1920
} as const

export interface ViewportQueryOptions {
  width?: number
  getWindow?: () => Pick<Window, 'innerWidth'> | undefined
}

export function getViewportWidth(options: ViewportQueryOptions = {}): number | undefined {
  if (Number.isFinite(options.width)) {
    return options.width
  }

  const viewportWindow = options.getWindow?.() ?? (isBrowser() ? window : undefined)
  return viewportWindow?.innerWidth
}

export function isMobile(options: ViewportQueryOptions = {}): boolean {
  const width = getViewportWidth(options)
  return width !== undefined && width < TIGER_VIEWPORT_BREAKPOINTS.md
}

export function isTablet(options: ViewportQueryOptions = {}): boolean {
  const width = getViewportWidth(options)
  return (
    width !== undefined &&
    width >= TIGER_VIEWPORT_BREAKPOINTS.md &&
    width < TIGER_VIEWPORT_BREAKPOINTS.lg
  )
}
