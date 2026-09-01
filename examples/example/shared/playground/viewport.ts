import type { DemoViewport } from './types'

/** Overlay / popup / select-class routes whose closed iframe must still fit an open layer. */
export const OVERLAY_DEMO_ROUTES = new Set([
  'select',
  'auto-complete',
  'cascader',
  'tree-select',
  'datepicker',
  'timepicker',
  'color-picker',
  'cron-editor',
  'dropdown',
  'context-menu',
  'popover',
  'tooltip',
  'popconfirm',
  'split-button',
  'modal',
  'drawer',
  'tour',
  'spotlight',
  'mentions',
  'number-keyboard',
  'crop-upload',
  'image-viewer',
  'navigation-menu',
  'menu'
])

export const OVERLAY_DEMO_MIN_HEIGHT = 520
export const DEFAULT_DEMO_MIN_HEIGHT = 120

export function isOverlayDemoRoute(route: string): boolean {
  return OVERLAY_DEMO_ROUTES.has(route)
}

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
  const overlay = isOverlayDemoRoute(route)
  const mode = viewport?.mode ?? 'auto'
  const minHeight = Math.max(
    viewport?.minHeight ?? (overlay ? OVERLAY_DEMO_MIN_HEIGHT : DEFAULT_DEMO_MIN_HEIGHT),
    overlay ? OVERLAY_DEMO_MIN_HEIGHT : 0
  )
  const maxHeight = isChartDemoRoute(route) && mode !== 'fixed' ? undefined : viewport?.maxHeight
  return {
    mode,
    height: viewport?.height,
    minHeight,
    maxHeight
  }
}
