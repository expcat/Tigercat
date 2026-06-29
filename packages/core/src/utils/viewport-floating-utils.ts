import type { ViewportOffset, ViewportPlacement } from '../types/viewport'

export const viewportFloatingBaseClasses = 'fixed z-50'

export const viewportPlacementClasses: Record<ViewportPlacement, string> = {
  'top-left': 'top-0 left-0',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'bottom-right': 'bottom-0 right-0'
}

function toCssLength(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}

function resolveAxisOffset(offset: ViewportOffset | undefined): {
  x: number | string
  y: number | string
} {
  if (offset === undefined) {
    return { x: 24, y: 24 }
  }

  if (typeof offset === 'number' || typeof offset === 'string') {
    return { x: offset, y: offset }
  }

  return {
    x: offset.x ?? 24,
    y: offset.y ?? 24
  }
}

export function getViewportOffsetStyle(
  placement: ViewportPlacement,
  offset?: ViewportOffset
): Record<string, string> {
  const { x, y } = resolveAxisOffset(offset)
  const style: Record<string, string> = {}

  if (placement.startsWith('top')) {
    style.top = toCssLength(y)
  } else {
    style.bottom = toCssLength(y)
  }

  if (placement.endsWith('left')) {
    style.left = toCssLength(x)
  } else {
    style.right = toCssLength(x)
  }

  return style
}
