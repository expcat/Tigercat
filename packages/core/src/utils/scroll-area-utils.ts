/**
 * ScrollArea utility functions
 *
 * Pure geometry helpers plus Tailwind class builders shared by the Vue and
 * React ScrollArea implementations. The custom scrollbar is overlaid on the
 * viewport edge, so the track length always equals the viewport client size
 * along that axis.
 */

import type {
  ScrollAreaAxis,
  ScrollAreaAxisState,
  ScrollAreaBoxStyle,
  ScrollAreaDirection,
  ScrollAreaScrollbarSize,
  ScrollAreaScrollbarVisibility,
  ScrollAreaShadowSide,
  ScrollAreaState,
  ScrollAreaThumbStyle,
  ScrollAreaViewportMetrics
} from '../types/scroll-area'

/** Default minimum thumb length in px */
export const SCROLL_AREA_MIN_THUMB_SIZE = 20

/** Sub-pixel tolerance for "content overflows" and edge detection */
const SCROLL_AREA_EPSILON = 1

// ─── Tailwind class constants ─────────────────────────────────────

export const scrollAreaRootClasses = 'tiger-scroll-area group/scroll-area relative overflow-hidden'

export const scrollAreaViewportBaseClasses =
  'tiger-scroll-area-viewport h-full w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--tiger-primary,#2563eb)]'

export const scrollAreaScrollbarBaseClasses =
  'tiger-scroll-area-scrollbar absolute z-10 touch-none select-none rounded-full bg-[var(--tiger-surface-muted,#f3f4f6)] transition-opacity duration-200'

export const scrollAreaThumbBaseClasses =
  'tiger-scroll-area-thumb absolute rounded-full bg-[var(--tiger-border,#d1d5db)] transition-colors hover:bg-[var(--tiger-text-muted,#9ca3af)] touch-none'

export const scrollAreaThumbDraggingClasses = 'bg-[var(--tiger-text-muted,#9ca3af)]'

export const scrollAreaContentBaseClasses = 'tiger-scroll-area-content'

export const scrollAreaShadowBaseClasses = 'tiger-scroll-area-shadow pointer-events-none absolute'

/** Viewport overflow per direction */
const VIEWPORT_OVERFLOW_CLASSES: Record<ScrollAreaDirection, string> = {
  vertical: 'overflow-y-auto overflow-x-hidden',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  both: 'overflow-auto'
}

/** Scrollbar thickness per size token */
const SCROLLBAR_THICKNESS_CLASSES: Record<ScrollAreaScrollbarSize, { x: string; y: string }> = {
  sm: { x: 'h-1.5', y: 'w-1.5' },
  md: { x: 'h-2.5', y: 'w-2.5' },
  lg: { x: 'h-3.5', y: 'w-3.5' }
}

/** Track placement per axis */
const SCROLLBAR_PLACEMENT_CLASSES: Record<ScrollAreaAxis, string> = {
  x: 'bottom-0 left-0 right-0',
  y: 'right-0 top-0 bottom-0'
}

/** Thumb cross-axis sizing */
const THUMB_AXIS_CLASSES: Record<ScrollAreaAxis, string> = {
  x: 'top-0.5 bottom-0.5',
  y: 'left-0.5 right-0.5'
}

/** Gradient shadow per edge */
const SHADOW_SIDE_CLASSES: Record<ScrollAreaShadowSide, string> = {
  top: 'inset-x-0 top-0 h-3 bg-gradient-to-b from-black/10 to-transparent',
  bottom: 'inset-x-0 bottom-0 h-3 bg-gradient-to-t from-black/10 to-transparent',
  left: 'inset-y-0 left-0 w-3 bg-gradient-to-r from-black/10 to-transparent',
  right: 'inset-y-0 right-0 w-3 bg-gradient-to-l from-black/10 to-transparent'
}

// ─── Geometry ─────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  if (value < min) return min
  if (value > max) return max
  return value
}

/**
 * Derive the scrollbar geometry for one axis.
 *
 * The track length equals `clientSize` because the scrollbar is overlaid on
 * the viewport edge.
 */
export function computeScrollAreaAxisState(
  scrollPos: number,
  scrollSize: number,
  clientSize: number,
  minThumbSize: number = SCROLL_AREA_MIN_THUMB_SIZE
): ScrollAreaAxisState {
  const maxScroll = scrollSize - clientSize
  const scrollable = clientSize > 0 && maxScroll > SCROLL_AREA_EPSILON

  if (!scrollable) {
    return {
      scrollable: false,
      thumbSize: clientSize > 0 ? clientSize : 0,
      thumbOffset: 0,
      progress: 0,
      atStart: true,
      atEnd: true
    }
  }

  const thumbSize = clamp((clientSize / scrollSize) * clientSize, minThumbSize, clientSize)
  const position = clamp(scrollPos, 0, maxScroll)
  const progress = position / maxScroll
  const thumbOffset = (clientSize - thumbSize) * progress

  return {
    scrollable: true,
    thumbSize,
    thumbOffset,
    progress,
    atStart: position <= SCROLL_AREA_EPSILON,
    atEnd: maxScroll - position <= SCROLL_AREA_EPSILON
  }
}

/**
 * Derive the scrollbar geometry for both axes from raw viewport metrics.
 */
export function computeScrollAreaState(
  metrics: ScrollAreaViewportMetrics,
  minThumbSize: number = SCROLL_AREA_MIN_THUMB_SIZE
): ScrollAreaState {
  return {
    x: computeScrollAreaAxisState(
      Math.abs(metrics.scrollLeft),
      metrics.scrollWidth,
      metrics.clientWidth,
      minThumbSize
    ),
    y: computeScrollAreaAxisState(
      metrics.scrollTop,
      metrics.scrollHeight,
      metrics.clientHeight,
      minThumbSize
    )
  }
}

/**
 * Empty state used before the viewport has been measured.
 */
export function createEmptyScrollAreaState(): ScrollAreaState {
  const axis: ScrollAreaAxisState = {
    scrollable: false,
    thumbSize: 0,
    thumbOffset: 0,
    progress: 0,
    atStart: true,
    atEnd: true
  }
  return { x: { ...axis }, y: { ...axis } }
}

/**
 * Read the metrics the scroll state derives from off a DOM element.
 */
export function readScrollAreaMetrics(element: {
  scrollTop: number
  scrollLeft: number
  scrollHeight: number
  scrollWidth: number
  clientHeight: number
  clientWidth: number
}): ScrollAreaViewportMetrics {
  return {
    scrollTop: element.scrollTop,
    scrollLeft: element.scrollLeft,
    scrollHeight: element.scrollHeight,
    scrollWidth: element.scrollWidth,
    clientHeight: element.clientHeight,
    clientWidth: element.clientWidth
  }
}

/**
 * Convert a thumb offset (px from the track start) back to a scroll offset.
 */
export function computeScrollFromThumbOffset(
  thumbOffset: number,
  trackSize: number,
  thumbSize: number,
  scrollSize: number,
  clientSize: number
): number {
  const maxThumbOffset = trackSize - thumbSize
  const maxScroll = Math.max(scrollSize - clientSize, 0)
  if (maxThumbOffset <= 0 || maxScroll <= 0) return 0
  return clamp(thumbOffset / maxThumbOffset, 0, 1) * maxScroll
}

/**
 * Convert a pointer position on the track to the scroll offset that centers
 * the thumb under it — the behavior of a click on the empty track.
 */
export function computeScrollFromTrackPoint(
  point: number,
  trackSize: number,
  thumbSize: number,
  scrollSize: number,
  clientSize: number
): number {
  return computeScrollFromThumbOffset(
    point - thumbSize / 2,
    trackSize,
    thumbSize,
    scrollSize,
    clientSize
  )
}

/**
 * Whether the given axis may scroll under the configured direction.
 */
export function isScrollAreaAxisEnabled(
  direction: ScrollAreaDirection,
  axis: ScrollAreaAxis
): boolean {
  if (direction === 'both') return true
  return axis === 'y' ? direction === 'vertical' : direction === 'horizontal'
}

/**
 * Whether the custom scrollbar element should be rendered for an axis.
 */
export function shouldRenderScrollAreaScrollbar(
  visibility: ScrollAreaScrollbarVisibility,
  direction: ScrollAreaDirection,
  axis: ScrollAreaAxis,
  axisState: ScrollAreaAxisState
): boolean {
  if (visibility === 'hidden') return false
  if (!isScrollAreaAxisEnabled(direction, axis)) return false
  if (visibility === 'always') return true
  return axisState.scrollable
}

/**
 * Edges that currently have content scrolled past them.
 */
export function getScrollAreaShadowSides(
  state: ScrollAreaState,
  direction: ScrollAreaDirection
): ScrollAreaShadowSide[] {
  const sides: ScrollAreaShadowSide[] = []

  if (isScrollAreaAxisEnabled(direction, 'y') && state.y.scrollable) {
    if (!state.y.atStart) sides.push('top')
    if (!state.y.atEnd) sides.push('bottom')
  }
  if (isScrollAreaAxisEnabled(direction, 'x') && state.x.scrollable) {
    if (!state.x.atStart) sides.push('left')
    if (!state.x.atEnd) sides.push('right')
  }

  return sides
}

// ─── Styles ───────────────────────────────────────────────────────

/**
 * Normalize a CSS length prop — numbers become px, strings pass through.
 */
export function resolveScrollAreaLength(value: number | string | undefined): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : value
}

/**
 * Build the root box sizing style from the dimension props.
 */
export function getScrollAreaBoxStyle(options: {
  height?: number | string
  maxHeight?: number | string
  width?: number | string
  maxWidth?: number | string
}): ScrollAreaBoxStyle {
  const style: ScrollAreaBoxStyle = {}
  const height = resolveScrollAreaLength(options.height)
  const maxHeight = resolveScrollAreaLength(options.maxHeight)
  const width = resolveScrollAreaLength(options.width)
  const maxWidth = resolveScrollAreaLength(options.maxWidth)

  if (height !== undefined) style.height = height
  if (maxHeight !== undefined) style.maxHeight = maxHeight
  if (width !== undefined) style.width = width
  if (maxWidth !== undefined) style.maxWidth = maxWidth

  return style
}

/**
 * Viewport classes — overflow per direction plus native scrollbar hiding.
 */
export function getScrollAreaViewportClasses(
  direction: ScrollAreaDirection,
  className?: string
): string {
  return [scrollAreaViewportBaseClasses, VIEWPORT_OVERFLOW_CLASSES[direction], className]
    .filter(Boolean)
    .join(' ')
}

/**
 * Content wrapper classes. Horizontal-capable directions let the wrapper grow
 * past the viewport so inline content produces real horizontal overflow.
 */
export function getScrollAreaContentClasses(direction: ScrollAreaDirection): string {
  return direction === 'vertical'
    ? scrollAreaContentBaseClasses
    : `${scrollAreaContentBaseClasses} min-w-max`
}

/**
 * Scrollbar track classes for an axis.
 */
export function getScrollAreaScrollbarClasses(
  axis: ScrollAreaAxis,
  size: ScrollAreaScrollbarSize,
  visibility: ScrollAreaScrollbarVisibility
): string {
  const thickness = SCROLLBAR_THICKNESS_CLASSES[size][axis]
  const fade =
    visibility === 'hover'
      ? 'opacity-0 group-hover/scroll-area:opacity-100 group-focus-within/scroll-area:opacity-100'
      : 'opacity-100'
  return [scrollAreaScrollbarBaseClasses, SCROLLBAR_PLACEMENT_CLASSES[axis], thickness, fade].join(
    ' '
  )
}

/**
 * Thumb classes for an axis.
 */
export function getScrollAreaThumbClasses(axis: ScrollAreaAxis, dragging: boolean): string {
  return [
    scrollAreaThumbBaseClasses,
    THUMB_AXIS_CLASSES[axis],
    dragging ? scrollAreaThumbDraggingClasses : ''
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Inline thumb geometry for an axis.
 */
export function getScrollAreaThumbStyle(
  axis: ScrollAreaAxis,
  axisState: ScrollAreaAxisState
): ScrollAreaThumbStyle {
  if (axis === 'y') {
    return { height: `${axisState.thumbSize}px`, top: `${axisState.thumbOffset}px` }
  }
  return { width: `${axisState.thumbSize}px`, left: `${axisState.thumbOffset}px` }
}

/**
 * Gradient shadow classes for an edge.
 */
export function getScrollAreaShadowClasses(side: ScrollAreaShadowSide): string {
  return `${scrollAreaShadowBaseClasses} ${SHADOW_SIDE_CLASSES[side]}`
}

// ─── Observation ──────────────────────────────────────────────────

/**
 * Watch the viewport and its content wrapper for size changes.
 *
 * `ResizeObserver` is the only way to notice that the content grew — a scroll
 * listener alone never fires for that. Returns a teardown; when the API is
 * unavailable (SSR, older browsers) the teardown is a no-op and callers keep
 * their scroll-event driven updates.
 */
export function observeScrollAreaSize(
  targets: Array<Element | null | undefined>,
  onResize: () => void
): () => void {
  if (typeof ResizeObserver === 'undefined') return () => undefined

  const observed = targets.filter((target): target is Element => Boolean(target))
  if (observed.length === 0) return () => undefined

  const observer = new ResizeObserver(() => onResize())
  for (const target of observed) {
    observer.observe(target)
  }

  return () => observer.disconnect()
}
