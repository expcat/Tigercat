/**
 * Shared arrow geometry for Tooltip, Popover, and Popconfirm.
 */

export const FLOATING_ARROW_SIZE_PX = 8

export type FloatingArrowSide = 'top' | 'bottom' | 'left' | 'right'

export interface FloatingArrowGeometry {
  size: number
  /** Edge of the floating layer the arrow sits against. */
  staticSide: 'top' | 'bottom' | 'left' | 'right'
  /** How far the arrow hangs outside that edge. */
  outside: string
  x?: string
  y?: string
}

export function floatingArrowSide(placement: string): FloatingArrowSide {
  const side = placement.split('-')[0]
  if (side === 'bottom' || side === 'left' || side === 'right') return side
  return 'top'
}

const STATIC_SIDE: Record<FloatingArrowSide, FloatingArrowGeometry['staticSide']> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
}

export function getFloatingArrowGeometry(
  placement: string,
  arrow?: { x?: number; y?: number },
  size = FLOATING_ARROW_SIZE_PX
): FloatingArrowGeometry {
  const side = floatingArrowSide(placement)
  const geometry: FloatingArrowGeometry = {
    size,
    staticSide: STATIC_SIDE[side],
    outside: `${-size / 2}px`
  }
  if (arrow?.x != null && Number.isFinite(arrow.x)) geometry.x = `${arrow.x}px`
  if (arrow?.y != null && Number.isFinite(arrow.y)) geometry.y = `${arrow.y}px`
  return geometry
}

/**
 * Inline position for the rotated caret.
 *
 * The cross axis is always written. Leaving it `auto` uses the static position:
 * a top/bottom caret then sits in the corner radius, and a left/right caret
 * drops onto the next line, clear of the bubble. Middleware `x` / `y` replace
 * the centered fallback so a shifted layer still points at the reference.
 */
export function getFloatingArrowStyle(
  placement: string,
  arrow?: { x?: number; y?: number },
  size = FLOATING_ARROW_SIZE_PX
): Record<string, string> {
  const geometry = getFloatingArrowGeometry(placement, arrow, size)
  const centered = `calc(50% - ${geometry.size / 2}px)`
  const alongHorizontalEdge = geometry.staticSide === 'top' || geometry.staticSide === 'bottom'
  const style: Record<string, string> = {
    position: 'absolute',
    width: `${geometry.size}px`,
    height: `${geometry.size}px`,
    [geometry.staticSide]: geometry.outside
  }
  if (alongHorizontalEdge) style.left = geometry.x ?? centered
  else style.top = geometry.y ?? centered
  return style
}
