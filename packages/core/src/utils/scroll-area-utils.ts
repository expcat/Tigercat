/**
 * ScrollArea utility functions
 *
 * Geometry is logical: horizontal progress 0 is inline-start.
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
import { classNames } from './class-names'

export const SCROLL_AREA_MIN_THUMB_SIZE = 20

const SCROLL_AREA_EPSILON = 1

export const SCROLL_AREA_THICKNESS_PX: Record<ScrollAreaScrollbarSize, number> = {
  sm: 6,
  md: 10,
  lg: 14
}

export const scrollAreaRootClasses = 'tiger-scroll-area group/scroll-area relative overflow-hidden'

export const scrollAreaViewportBaseClasses =
  'tiger-scroll-area-viewport w-full min-h-0 min-w-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'

export const scrollAreaScrollbarBaseClasses =
  'tiger-scroll-area-scrollbar absolute z-10 select-none rounded-full bg-[var(--tiger-surface-muted,#f9fafb)] tiger-motion-aware transition-opacity duration-200'

export const scrollAreaThumbBaseClasses =
  'tiger-scroll-area-thumb absolute rounded-full bg-[var(--tiger-border,#e5e7eb)] tiger-motion-aware transition-colors hover:bg-[var(--tiger-text-muted,#6b7280)] touch-none'

export const scrollAreaThumbDraggingClasses = 'bg-[var(--tiger-text-muted,#6b7280)]'

export const scrollAreaContentBaseClasses = 'tiger-scroll-area-content'

export const scrollAreaShadowBaseClasses = 'tiger-scroll-area-shadow pointer-events-none absolute'

const VIEWPORT_OVERFLOW_CLASSES: Record<ScrollAreaDirection, string> = {
  vertical: 'overflow-y-auto overflow-x-hidden',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  both: 'overflow-auto'
}

const SCROLLBAR_THICKNESS_CLASSES: Record<ScrollAreaScrollbarSize, { x: string; y: string }> = {
  sm: { x: 'h-1.5', y: 'w-1.5' },
  md: { x: 'h-2.5', y: 'w-2.5' },
  lg: { x: 'h-3.5', y: 'w-3.5' }
}

const THUMB_AXIS_CLASSES: Record<ScrollAreaAxis, string> = {
  x: 'top-0.5 bottom-0.5',
  y: 'inline-start-0.5 inline-end-0.5'
}

const SHADOW_TINT = 'color-mix(in srgb, var(--tiger-text, #111827) 12%, transparent)'

const SHADOW_SIDE_CLASSES: Record<ScrollAreaShadowSide, string> = {
  top: `inset-inline-0 top-0 h-3 bg-[linear-gradient(to_bottom,${SHADOW_TINT},transparent)]`,
  bottom: `inset-inline-0 bottom-0 h-3 bg-[linear-gradient(to_top,${SHADOW_TINT},transparent)]`,
  'inline-start': `inset-block-0 inset-inline-start-0 w-3 bg-[linear-gradient(to_inline-end,${SHADOW_TINT},transparent)]`,
  'inline-end': `inset-block-0 inset-inline-end-0 w-3 bg-[linear-gradient(to_inline-start,${SHADOW_TINT},transparent)]`
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  if (value < min) return min
  if (value > max) return max
  return value
}

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
 * Map a viewport's `scrollLeft` onto logical inline progress (0 = inline-start).
 *
 * Covers: LTR 0→max, RTL negative-start, RTL 0=physical-left.
 */
export function logicalInlineScrollPosition(
  scrollLeft: number,
  scrollWidth: number,
  clientWidth: number,
  direction: 'ltr' | 'rtl'
): number {
  const max = Math.max(scrollWidth - clientWidth, 0)
  if (max <= 0) return 0
  if (direction !== 'rtl') return clamp(scrollLeft, 0, max)
  if (scrollLeft < 0) return clamp(-scrollLeft, 0, max)
  return clamp(max - scrollLeft, 0, max)
}

export function physicalInlineScrollFromLogical(
  logical: number,
  scrollWidth: number,
  clientWidth: number,
  direction: 'ltr' | 'rtl',
  sampleScrollLeft: number
): number {
  const max = Math.max(scrollWidth - clientWidth, 0)
  const position = clamp(logical, 0, max)
  if (direction !== 'rtl') return position
  if (sampleScrollLeft < 0) return -position
  return max - position
}

export function computeScrollAreaState(
  metrics: ScrollAreaViewportMetrics,
  minThumbSize: number = SCROLL_AREA_MIN_THUMB_SIZE,
  inlineDirection: 'ltr' | 'rtl' = 'ltr'
): ScrollAreaState {
  return {
    x: computeScrollAreaAxisState(
      logicalInlineScrollPosition(
        metrics.scrollLeft,
        metrics.scrollWidth,
        metrics.clientWidth,
        inlineDirection
      ),
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

export function readInlineDirection(element: Element | null | undefined): 'ltr' | 'rtl' {
  if (!element || typeof getComputedStyle === 'undefined') return 'ltr'
  return getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr'
}

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

export function isScrollAreaAxisEnabled(
  direction: ScrollAreaDirection,
  axis: ScrollAreaAxis
): boolean {
  if (direction === 'both') return true
  return axis === 'y' ? direction === 'vertical' : direction === 'horizontal'
}

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
    if (!state.x.atStart) sides.push('inline-start')
    if (!state.x.atEnd) sides.push('inline-end')
  }

  return sides
}

export function resolveScrollAreaLength(value: number | string | undefined): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : value
}

/** Inline size style for the overflowing viewport. */
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

export function getScrollAreaViewportClasses(
  direction: ScrollAreaDirection,
  className?: string
): string {
  return classNames(scrollAreaViewportBaseClasses, VIEWPORT_OVERFLOW_CLASSES[direction], className)
}

export function getScrollAreaContentClasses(direction: ScrollAreaDirection): string {
  return direction === 'horizontal'
    ? `${scrollAreaContentBaseClasses} min-w-max`
    : scrollAreaContentBaseClasses
}

export function getScrollAreaScrollbarClasses(
  axis: ScrollAreaAxis,
  size: ScrollAreaScrollbarSize,
  visibility: ScrollAreaScrollbarVisibility
): string {
  const thickness = SCROLLBAR_THICKNESS_CLASSES[size][axis]
  const fade =
    visibility === 'hover'
      ? 'opacity-0 pointer-events-none group-hover/scroll-area:opacity-100 group-hover/scroll-area:pointer-events-auto group-focus-within/scroll-area:opacity-100 group-focus-within/scroll-area:pointer-events-auto group-data-[scrolling]/scroll-area:opacity-100 group-data-[scrolling]/scroll-area:pointer-events-auto data-[dragging]:opacity-100 data-[dragging]:pointer-events-auto'
      : 'opacity-100'
  const place =
    axis === 'y'
      ? 'inset-block-start-0 inset-block-end-0 inset-inline-end-0'
      : 'inset-inline-start-0 inset-inline-end-0 bottom-0'
  return classNames(scrollAreaScrollbarBaseClasses, place, thickness, fade)
}

export function getScrollAreaScrollbarPlacementStyle(
  axis: ScrollAreaAxis,
  size: ScrollAreaScrollbarSize,
  otherAxisVisible: boolean
): { insetBlockEnd?: string; insetInlineEnd?: string } {
  if (!otherAxisVisible) return {}
  const thickness = `${SCROLL_AREA_THICKNESS_PX[size]}px`
  if (axis === 'y') return { insetBlockEnd: thickness }
  return { insetInlineEnd: thickness }
}

export function getScrollAreaGutterStyle(
  size: ScrollAreaScrollbarSize,
  visibleX: boolean,
  visibleY: boolean
): { paddingInlineEnd?: string; paddingBlockEnd?: string } {
  const thickness = `${SCROLL_AREA_THICKNESS_PX[size]}px`
  const style: { paddingInlineEnd?: string; paddingBlockEnd?: string } = {}
  if (visibleY) style.paddingInlineEnd = thickness
  if (visibleX) style.paddingBlockEnd = thickness
  return style
}

export function getScrollAreaThumbClasses(axis: ScrollAreaAxis, dragging: boolean): string {
  return classNames(
    scrollAreaThumbBaseClasses,
    THUMB_AXIS_CLASSES[axis],
    dragging && scrollAreaThumbDraggingClasses
  )
}

export function getScrollAreaThumbStyle(
  axis: ScrollAreaAxis,
  axisState: ScrollAreaAxisState
): ScrollAreaThumbStyle {
  if (axis === 'y') {
    return { height: `${axisState.thumbSize}px`, top: `${axisState.thumbOffset}px` }
  }
  return { width: `${axisState.thumbSize}px`, insetInlineStart: `${axisState.thumbOffset}px` }
}

export function getScrollAreaShadowClasses(side: ScrollAreaShadowSide): string {
  return `${scrollAreaShadowBaseClasses} ${SHADOW_SIDE_CLASSES[side]}`
}

export function applyScrollAreaWheel(
  event: { deltaX: number; deltaY: number; ctrlKey?: boolean; preventDefault: () => void },
  viewport: { scrollTop: number; scrollLeft: number }
): void {
  if (event.ctrlKey) return
  viewport.scrollTop += event.deltaY
  viewport.scrollLeft += event.deltaX
  event.preventDefault()
}

const LINE_SCROLL = 40

export function computeScrollAreaKeyboardDelta(
  key: string,
  direction: ScrollAreaDirection,
  client: { width: number; height: number },
  inlineDirection: 'ltr' | 'rtl'
): { axis: ScrollAreaAxis; delta: number } | { to: 'start' | 'end'; axis: ScrollAreaAxis } | null {
  const rtl = inlineDirection === 'rtl' ? -1 : 1
  switch (key) {
    case 'ArrowDown':
      if (!isScrollAreaAxisEnabled(direction, 'y')) return null
      return { axis: 'y', delta: LINE_SCROLL }
    case 'ArrowUp':
      if (!isScrollAreaAxisEnabled(direction, 'y')) return null
      return { axis: 'y', delta: -LINE_SCROLL }
    case 'ArrowRight':
      if (!isScrollAreaAxisEnabled(direction, 'x')) return null
      return { axis: 'x', delta: LINE_SCROLL * rtl }
    case 'ArrowLeft':
      if (!isScrollAreaAxisEnabled(direction, 'x')) return null
      return { axis: 'x', delta: -LINE_SCROLL * rtl }
    case 'PageDown':
      if (!isScrollAreaAxisEnabled(direction, 'y')) return null
      return { axis: 'y', delta: client.height }
    case 'PageUp':
      if (!isScrollAreaAxisEnabled(direction, 'y')) return null
      return { axis: 'y', delta: -client.height }
    case 'Home':
      return {
        to: 'start',
        axis: isScrollAreaAxisEnabled(direction, 'y') ? 'y' : 'x'
      }
    case 'End':
      return {
        to: 'end',
        axis: isScrollAreaAxisEnabled(direction, 'y') ? 'y' : 'x'
      }
    default:
      return null
  }
}

export function resolveScrollAreaViewportTabIndex(options: {
  overflow: boolean
  hasFocusable: boolean
  userTabIndex?: number
}): number | undefined {
  if (options.userTabIndex !== undefined) return options.userTabIndex
  if (options.overflow && !options.hasFocusable) return 0
  return undefined
}

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

const FOCUSABLE = 'a[href],button,input,select,textarea,iframe,[tabindex]:not([tabindex="-1"])'

export function scrollAreaHasFocusable(root: Element | null | undefined): boolean {
  if (!root) return false
  return root.querySelector(FOCUSABLE) !== null
}
