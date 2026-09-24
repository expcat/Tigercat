/**
 * Resizable component utilities
 * Shared styles and helpers for Resizable components
 */

import type { AspectRatioPrimary, ResizeAxis, ResizeHandlePosition } from '../types/resizable'
import { parseAspectRatio } from './aspect-ratio-utils'

// ─── Style Constants ────────────────────────────────────────────────

export const resizableBaseClasses = 'relative'

export const resizableHandleBaseClasses =
  'absolute z-10 tiger-motion-aware transition-opacity duration-150 opacity-40 hover:opacity-100 focus-visible:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring)] touch-none'

export const resizableHandleDraggingClasses = 'opacity-100 pointer-events-auto'

export const resizableHandleDisabledClasses = 'pointer-events-none opacity-0'

/**
 * Handle position → cursor + placement styles.
 * Horizontal placement uses logical inset so `left` is inline-start.
 */
export const resizableHandlePositionStyles: Record<
  ResizeHandlePosition,
  { cursor: string; classes: string }
> = {
  top: {
    cursor: 'cursor-n-resize',
    classes: 'top-0 inset-inline-0 h-6'
  },
  right: {
    cursor: 'cursor-e-resize rtl:cursor-w-resize',
    classes: 'inset-block-0 end-0 w-6'
  },
  bottom: {
    cursor: 'cursor-s-resize',
    classes: 'bottom-0 inset-inline-0 h-6'
  },
  left: {
    cursor: 'cursor-w-resize rtl:cursor-e-resize',
    classes: 'inset-block-0 start-0 w-6'
  },
  'top-left': {
    cursor: 'cursor-nw-resize rtl:cursor-ne-resize',
    classes: 'top-0 start-0 w-6 h-6'
  },
  'top-right': {
    cursor: 'cursor-ne-resize rtl:cursor-nw-resize',
    classes: 'top-0 end-0 w-6 h-6'
  },
  'bottom-left': {
    cursor: 'cursor-sw-resize rtl:cursor-se-resize',
    classes: 'bottom-0 start-0 w-6 h-6'
  },
  'bottom-right': {
    cursor: 'cursor-se-resize rtl:cursor-sw-resize',
    classes: 'bottom-0 end-0 w-6 h-6'
  }
}

export const RESIZE_HANDLE_HIT_SIZE = 24

// ─── Default handles ────────────────────────────────────────────────

export const defaultResizeHandles: ResizeHandlePosition[] = ['right', 'bottom', 'bottom-right']

const CORNER_HANDLES = new Set<ResizeHandlePosition>([
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right'
])

export function isCornerResizeHandle(handle: ResizeHandlePosition): boolean {
  return CORNER_HANDLES.has(handle)
}

export function resolveVisibleResizeHandles(
  handles: ResizeHandlePosition[] | undefined,
  axis: ResizeAxis
): ResizeHandlePosition[] {
  const list = handles && handles.length > 0 ? handles : defaultResizeHandles
  if (axis === 'both') return list
  if (axis === 'horizontal') return list.filter((handle) => handle !== 'top' && handle !== 'bottom')
  return list.filter((handle) => handle !== 'left' && handle !== 'right')
}

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
 * `left` / `right` are inline-start / inline-end: pass `rtl` so physical
 * mouse deltas map onto that logical axis.
 */
export function calculateResizeDelta(
  handle: ResizeHandlePosition,
  mouseDeltaX: number,
  mouseDeltaY: number,
  axis: ResizeAxis,
  rtl = false
): { deltaWidth: number; deltaHeight: number } {
  let deltaWidth = 0
  let deltaHeight = 0
  const logicalX = rtl ? -mouseDeltaX : mouseDeltaX

  if (axis !== 'vertical') {
    if (handle === 'right' || handle === 'top-right' || handle === 'bottom-right') {
      deltaWidth = logicalX
    } else if (handle === 'left' || handle === 'top-left' || handle === 'bottom-left') {
      deltaWidth = -logicalX
    }
  }

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
 * Layout shift so the grabbed start edge moves and the opposite edge stays.
 * Values are logical margin deltas (inline-start / block-start), not a transform.
 */
export function getResizeOriginShift(
  handle: ResizeHandlePosition,
  deltaWidth: number,
  deltaHeight: number,
  _rtl = false
): { offsetX: number; offsetY: number } {
  const fromStart = handle === 'left' || handle === 'top-left' || handle === 'bottom-left'
  const fromTop = handle === 'top' || handle === 'top-left' || handle === 'top-right'
  const inline = fromStart ? -deltaWidth : 0
  return {
    offsetX: _rtl ? -inline : inline,
    offsetY: fromTop ? -deltaHeight : 0
  }
}

/**
 * Default step (in px) applied per arrow-key press during keyboard resize.
 */
export const RESIZE_KEYBOARD_STEP = 10

/**
 * Map an arrow key to an equivalent pointer delta for keyboard resizing.
 * Arrow keys are physical; pass `rtl` into {@link calculateResizeDelta}.
 */
export function getResizeKeyboardDelta(
  key: string,
  step: number = RESIZE_KEYBOARD_STEP
): { deltaX: number; deltaY: number } | null {
  switch (key) {
    case 'ArrowRight':
      return { deltaX: step, deltaY: 0 }
    case 'ArrowLeft':
      return { deltaX: -step, deltaY: 0 }
    case 'ArrowDown':
      return { deltaX: 0, deltaY: step }
    case 'ArrowUp':
      return { deltaX: 0, deltaY: -step }
    default:
      return null
  }
}

/**
 * ARIA orientation for a resize handle acting as a `role="separator"`.
 * Edge handles map to a single orientation; corner handles have none.
 */
export function getResizeHandleOrientation(
  handle: ResizeHandlePosition
): 'horizontal' | 'vertical' | undefined {
  if (handle === 'left' || handle === 'right') return 'vertical'
  if (handle === 'top' || handle === 'bottom') return 'horizontal'
  return undefined
}

export function getAspectRatioPrimary(
  handle: ResizeHandlePosition,
  deltaWidth: number,
  deltaHeight: number
): AspectRatioPrimary {
  if (handle === 'left' || handle === 'right') return 'width'
  if (handle === 'top' || handle === 'bottom') return 'height'
  return Math.abs(deltaWidth) >= Math.abs(deltaHeight) ? 'width' : 'height'
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
 * Apply aspect-ratio lock. `primary` selects which axis the handle drives;
 * `auto` follows the larger proposed delta from the original size.
 */
export function applyAspectRatio(
  width: number,
  height: number,
  originalWidth: number,
  originalHeight: number,
  primary: AspectRatioPrimary = 'auto'
): { width: number; height: number } {
  if (originalWidth === 0 || originalHeight === 0) return { width, height }
  const ratio = originalWidth / originalHeight
  const axis =
    primary === 'auto'
      ? Math.abs(width - originalWidth) >= Math.abs(height - originalHeight)
        ? 'width'
        : 'height'
      : primary
  if (axis === 'width') return { width, height: width / ratio }
  return { width: height * ratio, height }
}

/**
 * Clamp a ratio-locked size so both axes stay in bounds and width/height
 * still match the original ratio (error well under 1px at typical sizes).
 */
export function clampDimensionsWithRatio(
  width: number,
  height: number,
  originalWidth: number,
  originalHeight: number,
  minWidth: number,
  minHeight: number,
  maxWidth?: number,
  maxHeight?: number
): { width: number; height: number } {
  if (originalWidth === 0 || originalHeight === 0) {
    return clampDimensions(width, height, minWidth, minHeight, maxWidth, maxHeight)
  }
  const ratio = originalWidth / originalHeight
  const minBound = Math.max(minWidth, minHeight * ratio)
  let maxBound = Infinity
  if (maxWidth !== undefined) maxBound = Math.min(maxBound, maxWidth)
  if (maxHeight !== undefined) maxBound = Math.min(maxBound, maxHeight * ratio)

  let w = width
  if (w < minBound) w = minBound
  if (Number.isFinite(maxBound) && w > maxBound) w = maxBound
  if (Number.isFinite(maxBound) && minBound > maxBound) w = maxBound
  return { width: w, height: w / ratio }
}

export function applyResizeSize(
  handle: ResizeHandlePosition,
  startWidth: number,
  startHeight: number,
  mouseDeltaX: number,
  mouseDeltaY: number,
  axis: ResizeAxis,
  options: {
    rtl?: boolean
    lockAspectRatio?: boolean
    /** Parsed width/height. Presets such as `16/9` supply this. */
    aspectRatio?: number
    minWidth: number
    minHeight: number
    maxWidth?: number
    maxHeight?: number
  }
): { width: number; height: number; offsetX: number; offsetY: number } {
  const { deltaWidth, deltaHeight } = calculateResizeDelta(
    handle,
    mouseDeltaX,
    mouseDeltaY,
    axis,
    options.rtl
  )
  let nextWidth = startWidth + deltaWidth
  let nextHeight = startHeight + deltaHeight
  const lockedRatio =
    options.aspectRatio && options.aspectRatio > 0
      ? options.aspectRatio
      : options.lockAspectRatio && startWidth > 0 && startHeight > 0
        ? startWidth / startHeight
        : 0
  if (lockedRatio > 0) {
    const primary = getAspectRatioPrimary(handle, deltaWidth, deltaHeight)
    const locked = applyAspectRatio(nextWidth, nextHeight, lockedRatio, 1, primary)
    const clamped = clampDimensionsWithRatio(
      locked.width,
      locked.height,
      startWidth,
      startHeight,
      options.minWidth,
      options.minHeight,
      options.maxWidth,
      options.maxHeight
    )
    nextWidth = clamped.width
    nextHeight = clamped.height
  } else {
    const clamped = clampDimensions(
      nextWidth,
      nextHeight,
      options.minWidth,
      options.minHeight,
      options.maxWidth,
      options.maxHeight
    )
    nextWidth = clamped.width
    nextHeight = clamped.height
  }
  const shift = getResizeOriginShift(
    handle,
    nextWidth - startWidth,
    nextHeight - startHeight,
    options.rtl
  )
  return { width: nextWidth, height: nextHeight, ...shift }
}

export function applyResizeJump(
  key: string,
  handle: ResizeHandlePosition,
  startWidth: number,
  startHeight: number,
  axis: ResizeAxis,
  options: {
    rtl?: boolean
    lockAspectRatio?: boolean
    /** Parsed width/height. Presets such as `16/9` supply this. */
    aspectRatio?: number
    minWidth: number
    minHeight: number
    maxWidth?: number
    maxHeight?: number
  }
): { width: number; height: number; offsetX: number; offsetY: number } | null {
  if (key !== 'Home' && key !== 'End') return null
  const toMin = key === 'Home'
  const horizontal =
    handle === 'left' ||
    handle === 'right' ||
    handle === 'top-left' ||
    handle === 'top-right' ||
    handle === 'bottom-left' ||
    handle === 'bottom-right'
  const vertical =
    handle === 'top' ||
    handle === 'bottom' ||
    handle === 'top-left' ||
    handle === 'top-right' ||
    handle === 'bottom-left' ||
    handle === 'bottom-right'
  let width = startWidth
  let height = startHeight
  if (axis !== 'vertical' && horizontal) {
    width = toMin ? options.minWidth : (options.maxWidth ?? startWidth)
  }
  if (axis !== 'horizontal' && vertical) {
    height = toMin ? options.minHeight : (options.maxHeight ?? startHeight)
  }
  const jumpRatio =
    options.aspectRatio && options.aspectRatio > 0
      ? options.aspectRatio
      : options.lockAspectRatio && startWidth > 0 && startHeight > 0
        ? startWidth / startHeight
        : 0
  if (jumpRatio > 0) {
    const primary = getAspectRatioPrimary(handle, width - startWidth, height - startHeight)
    const locked = applyAspectRatio(width, height, jumpRatio, 1, primary)
    const clamped = clampDimensionsWithRatio(
      locked.width,
      locked.height,
      startWidth,
      startHeight,
      options.minWidth,
      options.minHeight,
      options.maxWidth,
      options.maxHeight
    )
    width = clamped.width
    height = clamped.height
  } else {
    const clamped = clampDimensions(
      width,
      height,
      options.minWidth,
      options.minHeight,
      options.maxWidth,
      options.maxHeight
    )
    width = clamped.width
    height = clamped.height
  }
  const shift = getResizeOriginShift(handle, width - startWidth, height - startHeight, options.rtl)
  return { width, height, ...shift }
}

function addCssLength(existing: string | number | undefined, delta: number): string {
  if (!delta) return existing == null ? '0px' : String(existing)
  if (existing == null || existing === '') return `${delta}px`
  if (typeof existing === 'number' && Number.isFinite(existing)) return `${existing + delta}px`
  const matched = /^(-?\d+(?:\.\d+)?)px$/.exec(String(existing).trim())
  if (matched) return `${Number(matched[1]) + delta}px`
  return `calc(${existing} + ${delta}px)`
}

/**
 * Width, height, and logical start live on the layout box.
 * The caller's `transform` is left untouched.
 */
export function mergeResizableBoxStyle(
  userStyle: Record<string, string | number> | undefined,
  width: number | undefined,
  height: number | undefined,
  offsetX: number,
  offsetY: number
): Record<string, string | number> {
  const next: Record<string, string | number> = { ...(userStyle ?? {}) }
  if (width != null) next.width = `${width}px`
  if (height != null) next.height = `${height}px`
  if (offsetX !== 0) {
    next.marginInlineStart = addCssLength(userStyle?.marginInlineStart, offsetX)
  }
  if (offsetY !== 0) {
    next.marginTop = addCssLength(userStyle?.marginTop, offsetY)
  }
  return next
}

/** `true` keeps the current box. A preset string uses the AspectRatio parser (`16/9`, `16:9`). */
export function resolveResizableAspectRatio(
  lock: boolean | string | undefined,
  width: number,
  height: number
): number | undefined {
  if (lock === true) {
    if (width > 0 && height > 0) return width / height
    return undefined
  }
  if (typeof lock === 'string' && lock.trim()) return parseAspectRatio(lock)
  return undefined
}

export function formatResizableLiveText(width: number, height: number, template: string): string {
  return template.replace('{width}', String(Math.round(width))).replace('{height}', String(Math.round(height)))
}
