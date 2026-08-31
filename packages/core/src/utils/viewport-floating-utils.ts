import type { ViewportOffset, ViewportPlacement } from '../types/viewport'

import { overlayZIndexClass } from './floating'

export const viewportFloatingBaseClasses = `fixed ${overlayZIndexClass.viewport}`

/** Default inset for viewport chrome (BackTop). */
export const VIEWPORT_FLOATING_DEFAULT_OFFSET = 24

/**
 * FloatButton / Group default inset. Block axis sits one chrome control
 * (40px BackTop) plus a 12px gap above the default BackTop corner so the
 * two never occupy the same pixel.
 */
export const VIEWPORT_FLOATING_FAB_OFFSET: { x: number; y: number } = {
  x: VIEWPORT_FLOATING_DEFAULT_OFFSET,
  y: VIEWPORT_FLOATING_DEFAULT_OFFSET + 40 + 12
}

export const viewportPlacementClasses: Record<ViewportPlacement, string> = {
  'top-left': 'top-0 start-0',
  'top-right': 'top-0 end-0',
  'bottom-left': 'bottom-0 start-0',
  'bottom-right': 'bottom-0 end-0'
}

function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

function resolveAxisOffset(offset: ViewportOffset | undefined): {
  x: number | string
  y: number | string
} {
  if (offset === undefined) {
    return { x: VIEWPORT_FLOATING_DEFAULT_OFFSET, y: VIEWPORT_FLOATING_DEFAULT_OFFSET }
  }

  if (typeof offset === 'number' || typeof offset === 'string') {
    return { x: offset, y: offset }
  }

  return {
    x: offset.x ?? VIEWPORT_FLOATING_DEFAULT_OFFSET,
    y: offset.y ?? VIEWPORT_FLOATING_DEFAULT_OFFSET
  }
}

export function getViewportOffsetStyle(
  placement: ViewportPlacement,
  offset?: ViewportOffset
): Record<string, string> {
  const { x, y } = resolveAxisOffset(offset)
  const style: Record<string, string> = {}

  if (placement.startsWith('top')) {
    style.insetBlockStart = toCssLength(y)
  } else {
    style.insetBlockEnd = toCssLength(y)
  }

  if (placement.endsWith('left')) {
    style.insetInlineStart = toCssLength(x)
  } else {
    style.insetInlineEnd = toCssLength(x)
  }

  return style
}
