/**
 * Carousel utilities
 *
 * Track geometry, swipe, autoplay, and chrome classes shared by Vue/React.
 * Infinite scroll clones the first/last slides and snaps after the wrap
 * frame so the track never rewinds through the middle pages.
 */

import type { CarouselDotPosition, CarouselEffect } from '../types/carousel'
import { isBrowser } from './env'
import { getGestureTouchPoint, resolveSwipeGesture } from './gesture-utils'
import type { GesturePoint } from './gesture-utils'
import { prefersReducedMotion } from './transition'

export type CarouselFrameCallback = (timestamp: number) => void

export type CarouselFrameRequest = (callback: CarouselFrameCallback) => number

export type CarouselFrameCancel = (handle: number) => void

export type CarouselSwipeDirection = 'prev' | 'next'

export type CarouselDir = 'ltr' | 'rtl' | (string & {})

export type CarouselAxis = 'horizontal' | 'vertical'

export interface CarouselTouchPoint {
  x: number
  y: number
}

export interface CarouselSwipeOptions {
  minSwipeDistance?: number
  dir?: CarouselDir
  maxCrossAxisRatio?: number
  axis?: CarouselAxis
}

export interface CarouselLoopTarget {
  displayIndex: number
  logicalIndex: number
  needsSnap: boolean
}

export interface CarouselRegion {
  role?: 'region' | 'group'
  ariaLabel?: string
}

export interface CarouselVisibilityDocument {
  readonly hidden: boolean
  addEventListener: Document['addEventListener']
  removeEventListener: Document['removeEventListener']
}

export interface CarouselAutoplayControllerOptions {
  interval: number
  onAdvance: () => void
  requestFrame?: CarouselFrameRequest
  cancelFrame?: CarouselFrameCancel
  getCurrentTime?: () => number
  getDocument?: () => CarouselVisibilityDocument | undefined
}

export interface CarouselAutoplayController {
  start: () => void
  stop: () => void
  restart: () => void
  isRunning: () => boolean
}

const MIN_SWIPE_CROSS_AXIS_RATIO = 0.6
const HORIZONTAL_LOCK_DISTANCE = 8
const CAROUSEL_CHROME_SELECTOR = '[data-tiger-carousel-chrome]'
const CAROUSEL_KEYBOARD_IGNORE_SELECTOR =
  'input, textarea, select, option, [contenteditable]:not([contenteditable="false"])'

function requestDefaultFrame(callback: CarouselFrameCallback): number {
  if (globalThis.requestAnimationFrame) {
    return globalThis.requestAnimationFrame(callback)
  }

  return globalThis.setTimeout(() => callback(getDefaultCurrentTime()), 16)
}

function cancelDefaultFrame(handle: number): void {
  if (globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame(handle)
    return
  }

  globalThis.clearTimeout(handle)
}

function getDefaultCurrentTime(): number {
  return globalThis.performance?.now?.() ?? Date.now()
}

function getDefaultVisibilityDocument(): CarouselVisibilityDocument | undefined {
  return !isBrowser() ? undefined : document
}

export function resolveCarouselDir(dir?: string | null): 'ltr' | 'rtl' {
  return dir === 'rtl' ? 'rtl' : 'ltr'
}

export function isCarouselRtl(dir?: string | null): boolean {
  return resolveCarouselDir(dir) === 'rtl'
}

/**
 * Effective reading direction of a carousel root. An explicit root dir
 * attribute wins over the provider direction so DOM order, transforms,
 * keyboard, and gestures all read the same direction. SSR-safe: no DOM read.
 */
export function resolveCarouselRootDir(rootDir: unknown, configDir?: string | null): 'ltr' | 'rtl' {
  if (rootDir === 'rtl' || rootDir === 'ltr') return rootDir
  return resolveCarouselDir(configDir)
}

/**
 * Non-finite / non-positive intervals disable autoplay. Never treat 0 as
 * "every frame".
 */
export function normalizeAutoplayInterval(interval: number): number | null {
  return Number.isFinite(interval) && interval > 0 ? interval : null
}

/** Pause control visibility. Ignores reduced motion so server and client agree. */
export function isCarouselAutoplayRequested(autoplay: boolean, interval: number): boolean {
  return Boolean(autoplay) && normalizeAutoplayInterval(interval) !== null
}

export function isCarouselAutoplayEnabled(
  autoplay: boolean,
  interval: number,
  reducedMotion = prefersReducedMotion()
): boolean {
  return isCarouselAutoplayRequested(autoplay, interval) && !reducedMotion
}

export const carouselBaseClasses = 'relative w-full'

export const carouselViewportClasses = 'relative overflow-hidden w-full touch-pan-y'

export const carouselTrackScrollClasses =
  'tiger-carousel-track flex flex-row tiger-motion-aware ease-in-out'

/** Viewport chrome for the main axis. Vertical lets the page pan horizontally. */
export function getCarouselViewportClasses(axis: CarouselAxis = 'horizontal'): string {
  return axis === 'vertical'
    ? 'relative overflow-hidden w-full h-full touch-pan-x'
    : carouselViewportClasses
}

/** Track layout for the main axis. Vertical stacks slides in a full-height column. */
export function getCarouselTrackScrollClasses(axis: CarouselAxis = 'horizontal'): string {
  return axis === 'vertical'
    ? 'tiger-carousel-track flex h-full flex-col tiger-motion-aware ease-in-out'
    : carouselTrackScrollClasses
}

export const carouselTrackInstantClasses = 'tiger-carousel-track-instant'

/** Track motion. Reduced motion wins over a custom duration variable. */
export const carouselBaseStyles = {
  '.tiger-carousel-track': {
    transitionProperty: 'transform',
    transitionDuration: 'var(--tiger-carousel-duration, var(--tiger-motion-duration-base))',
    transitionTimingFunction: 'var(--tiger-motion-ease-standard)'
  },
  '.tiger-carousel-track-instant': {
    // property: none cancels a transition already in flight; a bare 0ms
    // duration only affects transitions that start after the class applies.
    transitionProperty: 'none',
    transitionDuration: '0ms'
  },
  '.tiger-carousel-track-instant > .tiger-carousel-slide': {
    // Fade slides carry the opacity transition; under an instant track the
    // same property removal cancels a crossfade already in flight. Direct
    // children only, so a nested carousel keeps its own motion.
    transitionProperty: 'none',
    transitionDuration: '0ms'
  },
  '.tiger-carousel-slide': {
    transitionProperty: 'opacity',
    transitionDuration: 'var(--tiger-carousel-duration, var(--tiger-motion-duration-base))',
    transitionTimingFunction: 'var(--tiger-motion-ease-standard)'
  },
  // Vertical carousels need a definite main-axis size; a user height on the
  // root (inline style or utility class) wins over this zero-specificity default.
  ':where([data-tiger-carousel][data-axis=vertical])': {
    height: '16rem'
  },
  '@media (prefers-reduced-motion: reduce)': {
    '.tiger-carousel-track, .tiger-carousel-slide': {
      // property: none cancels a transition already in flight; a bare 0ms
      // duration only affects transitions that start after the change.
      transitionProperty: 'none',
      transitionDuration: '0ms',
      transitionDelay: '0ms'
    }
  }
} as const

export const carouselTrackFadeClasses = 'relative'

export const carouselSlideBaseClasses =
  'min-w-full max-w-full w-full flex-[0_0_100%] overflow-hidden'

export const carouselSlideFadeActiveClasses =
  'relative w-full tiger-motion-aware tiger-carousel-slide ease-in-out opacity-100'

export const carouselSlideFadeInactiveClasses =
  'absolute inset-0 w-full overflow-hidden tiger-motion-aware tiger-carousel-slide ease-in-out opacity-0'

export const carouselDotsBaseClasses = 'absolute flex gap-1 z-10'

export const carouselDotsPositionClasses: Record<CarouselDotPosition, string> = {
  top: 'top-4 left-1/2 -translate-x-1/2 flex-row',
  bottom: 'bottom-4 left-1/2 -translate-x-1/2 flex-row',
  left: 'start-4 top-1/2 -translate-y-1/2 flex-col',
  right: 'end-4 top-1/2 -translate-y-1/2 flex-col'
}

export const carouselDotClasses =
  'inline-flex items-center justify-center w-6 h-6 p-0 m-0 border-0 bg-transparent cursor-pointer rounded-full tiger-motion-aware transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring)]/40'

export const carouselDotMarkClasses =
  'block w-3 h-3 rounded-full pointer-events-none bg-[var(--tiger-text)]/40 tiger-motion-aware transition-[background-color,transform] duration-200'

export const carouselDotActiveClasses = 'bg-[var(--tiger-text)] scale-110'

export const carouselArrowBaseClasses =
  'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--tiger-surface)]/90 text-[var(--tiger-text)] cursor-pointer tiger-motion-aware transition-[background-color,opacity] duration-200 hover:bg-[var(--tiger-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring)]/40 border-0'

export const carouselPrevArrowClasses = 'start-4'

export const carouselNextArrowClasses = 'end-4'

export const carouselArrowDisabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

export const carouselPauseButtonClasses =
  'absolute top-4 end-4 z-10 inline-flex items-center justify-center min-h-6 min-w-6 px-2 py-1 rounded-md text-xs font-medium bg-[var(--tiger-surface)]/90 text-[var(--tiger-text)] cursor-pointer border-0 tiger-motion-aware transition-[background-color,opacity] duration-200 hover:bg-[var(--tiger-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring)]/40'

export function getCarouselContainerClasses(className?: string): string {
  return className ? `${carouselBaseClasses} ${className}` : carouselBaseClasses
}

export function getCarouselDotsClasses(position: CarouselDotPosition): string {
  return `${carouselDotsBaseClasses} ${carouselDotsPositionClasses[position]}`
}

export function getCarouselDotClasses(_isActive?: boolean): string {
  return carouselDotClasses
}

export function getCarouselDotMarkClasses(isActive: boolean): string {
  return isActive ? `${carouselDotMarkClasses} ${carouselDotActiveClasses}` : carouselDotMarkClasses
}

export function getCarouselArrowClasses(type: 'prev' | 'next', disabled: boolean): string {
  const position = type === 'prev' ? carouselPrevArrowClasses : carouselNextArrowClasses
  return disabled
    ? `${carouselArrowBaseClasses} ${position} ${carouselArrowDisabledClasses}`
    : `${carouselArrowBaseClasses} ${position}`
}

export function getCarouselSlideClasses(input: {
  effect: CarouselEffect
  active: boolean
}): string {
  if (input.effect === 'fade') {
    return input.active ? carouselSlideFadeActiveClasses : carouselSlideFadeInactiveClasses
  }
  return carouselSlideBaseClasses
}

export function getNextSlideIndex(
  currentIndex: number,
  totalSlides: number,
  infinite: boolean
): number {
  if (totalSlides <= 0) return 0
  const nextIndex = currentIndex + 1
  if (nextIndex >= totalSlides) {
    return infinite ? 0 : currentIndex
  }
  return nextIndex
}

export function getPrevSlideIndex(
  currentIndex: number,
  totalSlides: number,
  infinite: boolean
): number {
  if (totalSlides <= 0) return 0
  const prevIndex = currentIndex - 1
  if (prevIndex < 0) {
    return infinite ? totalSlides - 1 : currentIndex
  }
  return prevIndex
}

export function isNextDisabled(
  currentIndex: number,
  totalSlides: number,
  infinite: boolean
): boolean {
  if (infinite) return false
  return currentIndex >= totalSlides - 1
}

export function isPrevDisabled(
  currentIndex: number,
  _totalSlides: number,
  infinite: boolean
): boolean {
  if (infinite) return false
  return currentIndex <= 0
}

export function clampSlideIndex(index: number, totalSlides: number): number {
  if (totalSlides <= 0) return 0
  if (!Number.isFinite(index) || index < 0) return 0
  if (index >= totalSlides) return totalSlides - 1
  return index
}

export function shouldLoopCarousel(
  infinite: boolean,
  slideCount: number,
  effect: CarouselEffect = 'scroll'
): boolean {
  return infinite && effect === 'scroll' && slideCount > 1
}

export function getCarouselDisplayIndex(
  logicalIndex: number,
  slideCount: number,
  looping: boolean
): number {
  const index = clampSlideIndex(logicalIndex, slideCount)
  return looping ? index + 1 : index
}

export function resolveCarouselLoopSnap(displayIndex: number, slideCount: number): number | null {
  if (slideCount <= 1) return null
  if (displayIndex === 0) return slideCount
  if (displayIndex === slideCount + 1) return 1
  return null
}

/**
 * Next/prev wrapping animates onto a clone, then snaps to the real slide.
 * Direct `goTo` jumps (non-adjacent) land on the real index without rewind.
 */
export function getCarouselLoopTarget(
  fromLogical: number,
  toLogical: number,
  slideCount: number,
  looping: boolean
): CarouselLoopTarget {
  const from = clampSlideIndex(fromLogical, slideCount)
  const to = clampSlideIndex(toLogical, slideCount)
  if (!looping) {
    return { displayIndex: to, logicalIndex: to, needsSnap: false }
  }
  if (from === slideCount - 1 && to === 0) {
    return { displayIndex: slideCount + 1, logicalIndex: 0, needsSnap: true }
  }
  if (from === 0 && to === slideCount - 1) {
    return { displayIndex: 0, logicalIndex: slideCount - 1, needsSnap: true }
  }
  return { displayIndex: to + 1, logicalIndex: to, needsSnap: false }
}

/**
 * Slides visible along the main axis. Never exceeds the slide count.
 */
export function getCarouselSlidesPerView(perView: number | undefined, total: number): number {
  if (!Number.isFinite(perView) || (perView ?? 0) < 1) return 1
  return Math.min(total || 1, Math.floor(perView as number))
}

/**
 * First slide of the visible window. Looping windows start at the current
 * index and wrap cyclically; finite windows clamp so the tail never shows
 * empty space.
 */
export function getCarouselWindowStart(
  logicalIndex: number,
  count: number,
  perView = 1,
  looping = false
): number {
  const index = clampSlideIndex(logicalIndex, count)
  if (looping) return index
  const span = count - getCarouselSlidesPerView(perView, count)
  return Math.min(index, Math.max(0, span))
}

/**
 * Whether a real slide sits inside the visible window. Only visible slides
 * stay focusable; everything else is aria-hidden and inert.
 */
export function isCarouselSlideVisible(
  logicalIndex: number,
  windowStart: number,
  count: number,
  perView = 1,
  looping = false
): boolean {
  if (count <= 0) return false
  const size = getCarouselSlidesPerView(perView, count)
  const distance = looping
    ? (logicalIndex - windowStart + count) % count
    : logicalIndex - windowStart
  return distance >= 0 && distance < size
}

/**
 * Real slide indexes in display order for the given rotation base. The slide
 * at the base renders first along the main axis, so DOM reading and tab
 * order match the visible window and boundary windows keep the same real
 * component instances instead of clones.
 */
export function resolveCarouselSlideOrder(count: number, base: number): number[] {
  const size = Math.max(0, Math.floor(count))
  if (size === 0) return []
  const start = clampSlideIndex(base, size)
  return Array.from({ length: size }, (_, position) => (start + position) % size)
}

/**
 * Live track state at the moment a transition is planned: the rotation base
 * and the rendered offset in slide slots. Steady state is always offset 0;
 * a mid-animation input passes the sampled offset so the next plan resumes
 * from the visible position instead of jumping to a stale start.
 */
export interface CarouselWindowTrackState {
  base: number
  offset: number
}

/**
 * Track position for one window transition. The base selects the slide
 * rendered first; the offset is measured in slide slots along the main
 * axis. Forward plans keep the current base and normalize to the target
 * window after the transition ends; backward plans pre-apply the target
 * base with an instant offset, then animate back to zero.
 */
export interface CarouselWindowTransition {
  base: number
  fromOffset: number
  toOffset: number
  windowStart: number
  normalizeAfter: boolean
}

export function resolveCarouselWindowTransition(input: {
  from: number
  to: number
  count: number
  perView?: number
  looping?: boolean
  source?: 'step' | 'goto'
  start?: CarouselWindowTrackState
}): CarouselWindowTransition {
  const count = Math.max(0, input.count)
  const perView = getCarouselSlidesPerView(input.perView, count)
  const looping = Boolean(input.looping) && count > 1
  const from = clampSlideIndex(input.from, count)
  const to = clampSlideIndex(input.to, count)
  const maxOffset = count - perView
  const windowStart = getCarouselWindowStart(to, count, perView, looping)
  // A live base stays valid through the same clamp a steady base passes, so
  // an invalid base left by a layout change re-clamps to a steady window.
  const previousStart = getCarouselWindowStart(input.start?.base ?? from, count, perView, looping)
  const startOffset =
    input.start && Number.isFinite(input.start.offset)
      ? Math.min(Math.max(input.start.offset, 0), Math.max(0, maxOffset))
      : 0
  const snap: CarouselWindowTransition = {
    base: windowStart,
    fromOffset: 0,
    toOffset: 0,
    windowStart,
    normalizeAfter: false
  }
  if (windowStart === previousStart) {
    // Same window: glide back to the origin from a mid-flight offset.
    return startOffset > 0
      ? {
          base: previousStart,
          fromOffset: startOffset,
          toOffset: 0,
          windowStart,
          normalizeAfter: false
        }
      : snap
  }

  let forward: boolean
  let distance: number
  if (!looping) {
    forward = windowStart > previousStart
    distance = Math.abs(windowStart - previousStart)
  } else if (input.source === 'step') {
    forward = to === (from + 1) % count
    distance = forward
      ? (windowStart - previousStart + count) % count
      : (previousStart - windowStart + count) % count
  } else {
    const forwardDistance = (windowStart - previousStart + count) % count
    forward = windowStart > previousStart
    distance = forward ? forwardDistance : count - forwardDistance
  }
  if (looping && (forward ? distance > maxOffset : distance + startOffset > maxOffset)) {
    // The logical direction crosses the cyclic edge or cannot carry the
    // in-flight offset through the window; take the short way.
    forward = !forward
    distance = count - distance
  }
  if (distance <= 0 || distance > maxOffset) return snap

  if (forward) {
    return {
      base: previousStart,
      fromOffset: startOffset,
      toOffset: distance,
      windowStart,
      normalizeAfter: true
    }
  }
  return {
    base: windowStart,
    fromOffset: distance + startOffset,
    toOffset: 0,
    windowStart,
    normalizeAfter: false
  }
}

/**
 * Move the track along the main axis by offset slide slots. The track
 * follows dir, so RTL flips the horizontal sign without forcing LTR, and
 * the next page enters along the reading direction.
 */
export function getCarouselAxisTransform(
  displayIndex: number,
  axis: 'horizontal' | 'vertical' = 'horizontal',
  perView = 1,
  dir?: string | null
): string {
  const span = Math.max(1, perView)
  const offset = ((Number.isFinite(displayIndex) ? displayIndex : 0) * 100) / span
  if (axis === 'vertical') return `translate3d(0, ${-offset}%, 0)`
  const signed = isCarouselRtl(dir) ? offset : -offset
  return `translate3d(${signed}%, 0, 0)`
}

/** Horizontal track transform. RTL flips the sign: the flex track lays
 * slides toward inline-start, so the next page enters along dir. */
export function getScrollTransform(displayIndex: number, dir?: string | null): string {
  const offset = (Number.isFinite(displayIndex) ? displayIndex : 0) * 100
  return isCarouselRtl(dir) ? `translateX(${offset}%)` : `translateX(-${offset}%)`
}

/**
 * Rendered track offset in slide slots, sampled from the computed transform
 * so an interrupted animation resumes from the visible position instead of a
 * stale state target. Returns 0 when there is nothing to measure (SSR, test
 * renderers without layout, or no running transform).
 */
export function getCarouselTrackRenderedOffset(
  track: HTMLElement | null | undefined,
  axis: CarouselAxis = 'horizontal',
  perView = 1,
  dir?: string | null
): number {
  if (!track || typeof getComputedStyle !== 'function') return 0
  const match = /^matrix(3d)?\((.+)\)$/.exec(getComputedStyle(track).transform)
  if (!match) return 0
  const parts = match[2].split(',').map((value) => Number.parseFloat(value.trim()))
  const tx = parts[match[1] ? 12 : 4] || 0
  const ty = parts[match[1] ? 13 : 5] || 0
  const rect = track.getBoundingClientRect()
  const size = axis === 'vertical' ? rect.height : rect.width
  if (!Number.isFinite(size) || size <= 0) return 0
  // The translate percentage is relative to the track's own main-axis size,
  // so a fraction of it spans perView slide slots.
  const px = axis === 'vertical' ? -ty : isCarouselRtl(dir) ? tx : -tx
  return (px / size) * Math.max(1, perView)
}

/**
 * Main-axis size of one slide. Horizontal slides keep content-driven
 * height; vertical slides share the definite viewport height.
 */
export function getCarouselSlideSizeStyle(axis: CarouselAxis, perView = 1): Record<string, string> {
  const size = `${100 / Math.max(1, perView)}%`
  if (axis === 'vertical') {
    return { flex: `0 0 ${size}`, height: size, minHeight: size, maxHeight: size }
  }
  return { flex: `0 0 ${size}`, width: size, minWidth: size, maxWidth: size }
}

export function formatCarouselSlideStatus(template: string, index: number, total: number): string {
  return template.replace(/\{index\}/g, String(index + 1)).replace(/\{total\}/g, String(total))
}

export const carouselStatusClasses = 'sr-only'

export function getCarouselTouchPoint(
  touches: ArrayLike<{ clientX: number; clientY: number }> | null | undefined
): CarouselTouchPoint | null {
  const point = getGestureTouchPoint(touches)
  return point ? { x: point.x, y: point.y } : null
}

export function getCarouselPointerPoint(
  event: { clientX: number; clientY: number } | null | undefined
): CarouselTouchPoint | null {
  if (!event || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return null
  return { x: event.clientX, y: event.clientY }
}

export function resolveCarouselSwipeDirection(
  startPoint: CarouselTouchPoint | null,
  endPoint: CarouselTouchPoint | null,
  options: CarouselSwipeOptions = {}
): CarouselSwipeDirection | null {
  const gesture = resolveSwipeGesture(
    startPoint as GesturePoint | null,
    endPoint as GesturePoint | null,
    {
      minDistance: options.minSwipeDistance,
      maxCrossAxisRatio: options.maxCrossAxisRatio ?? MIN_SWIPE_CROSS_AXIS_RATIO
    }
  )

  if (!gesture) return null
  if (options.axis === 'vertical') {
    if (gesture.direction === 'up') return 'next'
    if (gesture.direction === 'down') return 'prev'
    return null
  }
  const rtl = isCarouselRtl(options.dir)
  if (gesture.direction === 'left') return rtl ? 'prev' : 'next'
  if (gesture.direction === 'right') return rtl ? 'next' : 'prev'
  return null
}

/** Pointer lock along the main axis once the gesture dominates it. */
export function isCarouselAxisLock(
  startPoint: CarouselTouchPoint | null,
  currentPoint: CarouselTouchPoint | null,
  axis: CarouselAxis = 'horizontal'
): boolean {
  if (!startPoint || !currentPoint) return false
  const deltaX = Math.abs(currentPoint.x - startPoint.x)
  const deltaY = Math.abs(currentPoint.y - startPoint.y)
  if (axis === 'vertical') {
    return deltaY >= HORIZONTAL_LOCK_DISTANCE && deltaY > deltaX
  }
  return deltaX >= HORIZONTAL_LOCK_DISTANCE && deltaX > deltaY
}

export function isCarouselHorizontalLock(
  startPoint: CarouselTouchPoint | null,
  currentPoint: CarouselTouchPoint | null
): boolean {
  return isCarouselAxisLock(startPoint, currentPoint, 'horizontal')
}

export function isCarouselChromeTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(CAROUSEL_CHROME_SELECTOR))
}

export function isCarouselKeyboardIgnoredTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(CAROUSEL_KEYBOARD_IGNORE_SELECTOR))
}

export function resolveCarouselKeyboardNavigation(
  key: string,
  dir?: string | null,
  axis: CarouselAxis = 'horizontal'
): 'prev' | 'next' | 'first' | 'last' | null {
  if (key === 'Home') return 'first'
  if (key === 'End') return 'last'
  if (axis === 'vertical') {
    if (key === 'ArrowUp') return 'prev'
    if (key === 'ArrowDown') return 'next'
    return null
  }
  const rtl = isCarouselRtl(dir)
  if (key === 'ArrowLeft') return rtl ? 'next' : 'prev'
  if (key === 'ArrowRight') return rtl ? 'prev' : 'next'
  return null
}

export function resolveCarouselTabKeyboardNavigation(
  key: string,
  orientation: 'horizontal' | 'vertical',
  dir?: string | null
): 'prev' | 'next' | 'first' | 'last' | null {
  if (key === 'Home') return 'first'
  if (key === 'End') return 'last'
  const rtl = isCarouselRtl(dir)
  if (orientation === 'vertical') {
    if (key === 'ArrowUp') return 'prev'
    if (key === 'ArrowDown') return 'next'
    return null
  }
  if (key === 'ArrowLeft') return rtl ? 'next' : 'prev'
  if (key === 'ArrowRight') return rtl ? 'prev' : 'next'
  return null
}

export function getCarouselDotsOrientation(
  position: CarouselDotPosition
): 'horizontal' | 'vertical' {
  return position === 'left' || position === 'right' ? 'vertical' : 'horizontal'
}

export function resolveCarouselRegion(
  input: {
    ariaLabel?: string | null
    labelledBy?: string | null
  } = {}
): CarouselRegion {
  const labelledBy =
    typeof input.labelledBy === 'string' && input.labelledBy.trim()
      ? input.labelledBy.trim()
      : undefined
  const ariaLabel =
    typeof input.ariaLabel === 'string' && input.ariaLabel.trim()
      ? input.ariaLabel.trim()
      : undefined
  if (ariaLabel) return { role: 'region', ariaLabel }
  if (labelledBy) return { role: 'region' }
  return { role: 'group' }
}

export function isCarouselPaused(input: {
  userPaused?: boolean
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
  hovered?: boolean
  focused?: boolean
}): boolean {
  if (input.userPaused) return true
  return (
    (input.pauseOnHover !== false && Boolean(input.hovered)) ||
    (input.pauseOnFocus !== false && Boolean(input.focused))
  )
}

export function isCarouselFocusInside(
  root: EventTarget | null,
  related: EventTarget | null
): boolean {
  return root instanceof Node && related instanceof Node && root.contains(related)
}

export function getCarouselCloneAttributes(): {
  'data-tiger-carousel-clone': ''
  'aria-hidden': true
  inert: true
} {
  return {
    'data-tiger-carousel-clone': '',
    'aria-hidden': true,
    inert: true
  }
}

export function createCarouselAutoplayController(
  options: CarouselAutoplayControllerOptions
): CarouselAutoplayController {
  const requestFrame = options.requestFrame ?? requestDefaultFrame
  const cancelFrame = options.cancelFrame ?? cancelDefaultFrame
  const getCurrentTime = options.getCurrentTime ?? getDefaultCurrentTime
  const getDocument = options.getDocument ?? getDefaultVisibilityDocument

  let running = false
  let frameHandle: number | undefined
  let lastTimestamp = 0
  let visibilityDocument: CarouselVisibilityDocument | undefined
  let listeningForVisibility = false

  const cancelPendingFrame = (): void => {
    if (frameHandle === undefined) return
    cancelFrame(frameHandle)
    frameHandle = undefined
  }

  const isDocumentHidden = (): boolean => Boolean(visibilityDocument?.hidden)

  const scheduleFrame = (): void => {
    if (!running || frameHandle !== undefined || isDocumentHidden()) return
    frameHandle = requestFrame(tick)
  }

  const handleVisibilityChange = (): void => {
    if (!running) return
    lastTimestamp = getCurrentTime()

    if (isDocumentHidden()) {
      cancelPendingFrame()
      return
    }

    scheduleFrame()
  }

  const attachVisibilityListener = (): void => {
    visibilityDocument = getDocument()
    if (!visibilityDocument || listeningForVisibility) return
    visibilityDocument.addEventListener('visibilitychange', handleVisibilityChange)
    listeningForVisibility = true
  }

  const detachVisibilityListener = (): void => {
    if (!visibilityDocument || !listeningForVisibility) return
    visibilityDocument.removeEventListener('visibilitychange', handleVisibilityChange)
    listeningForVisibility = false
    visibilityDocument = undefined
  }

  const tick = (timestamp: number): void => {
    frameHandle = undefined
    if (!running || isDocumentHidden()) return

    const interval = normalizeAutoplayInterval(options.interval)
    if (interval === null) {
      return
    }
    if (timestamp - lastTimestamp >= interval) {
      lastTimestamp = timestamp
      options.onAdvance()
    }

    scheduleFrame()
  }

  const start = (): void => {
    if (running) return
    if (normalizeAutoplayInterval(options.interval) === null) return
    running = true
    lastTimestamp = getCurrentTime()
    attachVisibilityListener()
    scheduleFrame()
  }

  const stop = (): void => {
    if (!running) return
    running = false
    cancelPendingFrame()
    detachVisibilityListener()
  }

  const restart = (): void => {
    stop()
    start()
  }

  return {
    start,
    stop,
    restart,
    isRunning: () => running
  }
}

export const carouselPrevArrowPath = 'M15.75 19.5L8.25 12l7.5-7.5'

export const carouselNextArrowPath = 'M8.25 4.5l7.5 7.5-7.5 7.5'
