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

export interface CarouselTouchPoint {
  x: number
  y: number
}

export interface CarouselSwipeOptions {
  minSwipeDistance?: number
  dir?: CarouselDir
  maxCrossAxisRatio?: number
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
 * Non-finite / non-positive intervals disable autoplay. Never treat 0 as
 * "every frame".
 */
export function normalizeAutoplayInterval(interval: number): number | null {
  return Number.isFinite(interval) && interval > 0 ? interval : null
}

export function isCarouselAutoplayEnabled(
  autoplay: boolean,
  interval: number,
  reducedMotion = prefersReducedMotion()
): boolean {
  return Boolean(autoplay) && normalizeAutoplayInterval(interval) !== null && !reducedMotion
}

export const carouselBaseClasses = 'relative w-full'

export const carouselViewportClasses = 'relative overflow-hidden w-full touch-pan-y'

export const carouselTrackScrollClasses =
  'flex flex-row [direction:ltr] tiger-motion-aware transition-transform ease-in-out'

export const carouselTrackFadeClasses = 'relative'

export const carouselSlideBaseClasses =
  'min-w-full max-w-full w-full flex-[0_0_100%] overflow-hidden'

export const carouselSlideFadeActiveClasses =
  'relative w-full tiger-motion-aware transition-opacity ease-in-out opacity-100'

export const carouselSlideFadeInactiveClasses =
  'absolute inset-0 w-full overflow-hidden tiger-motion-aware transition-opacity ease-in-out opacity-0'

export const carouselDotsBaseClasses = 'absolute flex gap-1 z-10'

export const carouselDotsPositionClasses: Record<CarouselDotPosition, string> = {
  top: 'top-4 left-1/2 -translate-x-1/2 flex-row',
  bottom: 'bottom-4 left-1/2 -translate-x-1/2 flex-row',
  left: 'start-4 top-1/2 -translate-y-1/2 flex-col',
  right: 'end-4 top-1/2 -translate-y-1/2 flex-col'
}

export const carouselDotClasses =
  'inline-flex items-center justify-center w-6 h-6 p-0 m-0 border-0 bg-transparent cursor-pointer rounded-full tiger-motion-aware transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40'

export const carouselDotMarkClasses =
  'block w-3 h-3 rounded-full pointer-events-none bg-[var(--tiger-text,#111827)]/40 tiger-motion-aware transition-[background-color,transform] duration-200'

export const carouselDotActiveClasses = 'bg-[var(--tiger-text,#111827)] scale-110'

export const carouselArrowBaseClasses =
  'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--tiger-surface,#ffffff)]/90 text-[var(--tiger-text,#111827)] cursor-pointer tiger-motion-aware transition-[background-color,opacity] duration-200 hover:bg-[var(--tiger-surface,#ffffff)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40 border-0'

export const carouselPrevArrowClasses = 'start-4'

export const carouselNextArrowClasses = 'end-4'

export const carouselArrowDisabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

export const carouselPauseButtonClasses =
  'absolute top-4 end-4 z-10 inline-flex items-center justify-center min-h-6 min-w-6 px-2 py-1 rounded-md text-xs font-medium bg-[var(--tiger-surface,#ffffff)]/90 text-[var(--tiger-text,#111827)] cursor-pointer border-0 tiger-motion-aware transition-[background-color,opacity] duration-200 hover:bg-[var(--tiger-surface,#ffffff)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40'

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

export function getScrollTransform(displayIndex: number, dir?: string | null): string {
  const offset = (Number.isFinite(displayIndex) ? displayIndex : 0) * 100
  const sign = isCarouselRtl(dir) ? '' : '-'
  return `translateX(${sign}${offset}%)`
}

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
  const rtl = isCarouselRtl(options.dir)
  if (gesture.direction === 'left') return rtl ? 'prev' : 'next'
  if (gesture.direction === 'right') return rtl ? 'next' : 'prev'
  return null
}

export function isCarouselHorizontalLock(
  startPoint: CarouselTouchPoint | null,
  currentPoint: CarouselTouchPoint | null
): boolean {
  if (!startPoint || !currentPoint) return false
  const deltaX = Math.abs(currentPoint.x - startPoint.x)
  const deltaY = Math.abs(currentPoint.y - startPoint.y)
  return deltaX >= HORIZONTAL_LOCK_DISTANCE && deltaX > deltaY
}

export function isCarouselChromeTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(CAROUSEL_CHROME_SELECTOR))
}

export function isCarouselKeyboardIgnoredTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(CAROUSEL_KEYBOARD_IGNORE_SELECTOR))
}

export function resolveCarouselKeyboardNavigation(
  key: string,
  dir?: string | null
): 'prev' | 'next' | 'first' | 'last' | null {
  const rtl = isCarouselRtl(dir)
  if (key === 'ArrowLeft') return rtl ? 'next' : 'prev'
  if (key === 'ArrowRight') return rtl ? 'prev' : 'next'
  if (key === 'Home') return 'first'
  if (key === 'End') return 'last'
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
