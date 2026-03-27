/**
 * Resizable component utilities
 * Shared styles and helpers for Resizable components
 */

import type { ResizeHandlePosition, ResizeAxis } from '../types/resizable'

// ─── Style Constants ────────────────────────────────────────────────

export const resizableBaseClasses = 'relative'

export const resizableHandleBaseClasses =
  'absolute z-10 transition-opacity duration-150 opacity-0 hover:opacity-100 group-hover/resizable:opacity-100'

export const resizableHandleDraggingClasses = 'opacity-100'

export const resizableHandleDisabledClasses = 'pointer-events-none opacity-0'

/**
 * Handle position → cursor + placement styles
 */
export const resizableHandlePositionStyles: Record<
  ResizeHandlePosition,
  { cursor: string; classes: string }
> = {
  top: {
    cursor: 'cursor-n-resize',
    classes: 'top-0 left-0 right-0 h-1'
  },
  right: {
    cursor: 'cursor-e-resize',
    classes: 'top-0 right-0 bottom-0 w-1'
  },
  bottom: {
    cursor: 'cursor-s-resize',
    classes: 'bottom-0 left-0 right-0 h-1'
  },
  left: {
    cursor: 'cursor-w-resize',
    classes: 'top-0 left-0 bottom-0 w-1'
  },
  'top-left': {
    cursor: 'cursor-nw-resize',
    classes: 'top-0 left-0 w-3 h-3'
  },
  'top-right': {
    cursor: 'cursor-ne-resize',
    classes: 'top-0 right-0 w-3 h-3'
  },
  'bottom-left': {
    cursor: 'cursor-sw-resize',
    classes: 'bottom-0 left-0 w-3 h-3'
  },
  'bottom-right': {
    cursor: 'cursor-se-resize',
    classes: 'bottom-0 right-0 w-3 h-3'
  }
}

// ─── Default handles ────────────────────────────────────────────────

export const defaultResizeHandles: ResizeHandlePosition[] = ['right', 'bottom', 'bottom-right']

// ─── Pure Functions ─────────────────────────────────────────────────

/**
 * Get handle classes for a given position
 */
export function getResizableHandleClasses(
  position: ResizeHandlePosition,
  isDragging: boolean,
  disabled: boolean
): string {
  const pos = resizableHandlePositionStyles[position]
  const classes = [resizableHandleBaseClasses, pos.cursor, pos.classes]
  if (isDragging) classes.push(resizableHandleDraggingClasses)
  if (disabled) classes.push(resizableHandleDisabledClasses)
  return classes.join(' ')
}

/**
 * Calculate delta based on handle position.
 * Returns { deltaWidth, deltaHeight } indicating how much to change size.
 */
export function calculateResizeDelta(
  handle: ResizeHandlePosition,
  mouseDeltaX: number,
  mouseDeltaY: number,
  axis: ResizeAxis
): { deltaWidth: number; deltaHeight: number } {
  let deltaWidth = 0
  let deltaHeight = 0

  // Horizontal component
  if (axis !== 'vertical') {
    if (handle === 'right' || handle === 'top-right' || handle === 'bottom-right') {
      deltaWidth = mouseDeltaX
    } else if (handle === 'left' || handle === 'top-left' || handle === 'bottom-left') {
      deltaWidth = -mouseDeltaX
    }
  }

  // Vertical component
  if (axis !== 'horizontal') {
    if (handle === 'bottom' || handle === 'bottom-left' || handle === 'bottom-right') {
      deltaHeight = mouseDeltaY
    } else if (handle === 'top' || handle === 'top-left' || handle === 'top-right') {
      deltaHeight = -mouseDeltaY
    }
  }

  return { deltaWidth, deltaHeight }
}

/**
 * Clamp new dimensions within min/max bounds.
 * Returns the clamped { width, height }.
 */
export function clampDimensions(
  width: number,
  height: number,
  minWidth: number,
  minHeight: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  let w = Math.max(width, minWidth)
  let h = Math.max(height, minHeight)
  if (maxWidth !== undefined) w = Math.min(w, maxWidth)
  if (maxHeight !== undefined) h = Math.min(h, maxHeight)
  return { width: w, height: h }
}

/**
 * Apply aspect-ratio lock. Uses the width as the primary axis.
 */
export function applyAspectRatio(
  width: number,
  height: number,
  originalWidth: number,
  originalHeight: number
): { width: number; height: number } {
  if (originalWidth === 0 || originalHeight === 0) return { width, height }
  const ratio = originalWidth / originalHeight
  return { width, height: width / ratio }
}
