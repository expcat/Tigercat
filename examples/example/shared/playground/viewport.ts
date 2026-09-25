import type { DemoViewport } from './types'

/**
 * Closed demo floor. Short controls (a button row is ~72px with sandbox
 * padding) used to sit in the old 120px catalog floor and look empty.
 */
export const DEFAULT_DEMO_MIN_HEIGHT = 64

/**
 * `demo.json` files copied this value as `minHeight` when the catalog default
 * was 120. It is not a deliberate taller stage — resolve it as the shared floor.
 */
export const CATALOG_DEFAULT_MIN_HEIGHT = 120

/**
 * Open edge-locked overlays (side drawers) have no intrinsic height — they
 * stretch to the iframe. Reserve this stage only while that shell is open.
 * Closed previews stay on the content floor.
 */
export const DEMO_OVERLAY_STAGE_HEIGHT = 720

export function isChartDemoRoute(route: string): boolean {
  return route.endsWith('-chart') || route === 'gantt'
}

export interface ResolvedDemoViewport {
  mode: 'auto' | 'fixed'
  height?: number
  minHeight: number
  maxHeight?: number
}

export function resolveDemoViewport(route: string, viewport?: DemoViewport): ResolvedDemoViewport {
  const mode = viewport?.mode ?? 'auto'
  const declaredMin = viewport?.minHeight
  const minHeight =
    declaredMin === undefined || declaredMin === CATALOG_DEFAULT_MIN_HEIGHT
      ? DEFAULT_DEMO_MIN_HEIGHT
      : declaredMin
  const maxHeight = isChartDemoRoute(route) && mode !== 'fixed' ? undefined : viewport?.maxHeight
  return {
    mode,
    height: viewport?.height,
    minHeight,
    maxHeight
  }
}

/** Fit the reported content height, including an open overlay, without a route-wide floor. */
export function clampDemoFrameHeight(
  measured: number | undefined,
  viewport: ResolvedDemoViewport
): number {
  if (viewport.mode === 'fixed' && viewport.height !== undefined) return viewport.height
  const max = viewport.maxHeight
  const lower = max === undefined ? viewport.minHeight : Math.min(viewport.minHeight, max)
  const next = Math.max(lower, measured ?? lower)
  return max === undefined ? next : Math.min(max, next)
}
