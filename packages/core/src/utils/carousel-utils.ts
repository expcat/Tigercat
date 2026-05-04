/**
 * Carousel component utilities
 * Shared styles and helpers for Carousel components
 */

import type { CarouselDotPosition } from '../types/carousel'

export type CarouselFrameCallback = (timestamp: number) => void

export type CarouselFrameRequest = (callback: CarouselFrameCallback) => number

export type CarouselFrameCancel = (handle: number) => void

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
  return typeof document === 'undefined' ? undefined : document
}

function normalizeAutoplayInterval(interval: number): number {
  return Number.isFinite(interval) && interval > 0 ? interval : 0
}

/**
 * Base carousel container classes
 */
export const carouselBaseClasses = 'relative overflow-hidden w-full'

/**
 * Carousel track base classes for scroll effect
 */
export const carouselTrackScrollClasses = 'flex transition-transform ease-in-out'

/**
 * Carousel track base classes for fade effect
 */
export const carouselTrackFadeClasses = 'relative'

/**
 * Carousel slide base classes
 */
export const carouselSlideBaseClasses = 'flex-shrink-0 w-full'

/**
 * Carousel dots container base classes
 */
export const carouselDotsBaseClasses = 'absolute flex gap-2 z-10'

/**
 * Carousel dots position classes
 */
export const carouselDotsPositionClasses: Record<CarouselDotPosition, string> = {
  top: 'top-4 left-1/2 -translate-x-1/2 flex-row',
  bottom: 'bottom-4 left-1/2 -translate-x-1/2 flex-row',
  left: 'left-4 top-1/2 -translate-y-1/2 flex-col',
  right: 'right-4 top-1/2 -translate-y-1/2 flex-col'
}

/**
 * Carousel dot button base classes
 */
export const carouselDotClasses =
  'w-3 h-3 rounded-full transition-all duration-200 cursor-pointer border-0 p-0 bg-white/50 hover:bg-white/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800'

/**
 * Carousel dot active classes
 */
export const carouselDotActiveClasses = 'bg-white scale-110'

/**
 * Carousel arrow base classes
 */
export const carouselArrowBaseClasses =
  'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/30 text-white cursor-pointer transition-all duration-200 hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white border-0'

/**
 * Carousel prev arrow classes
 */
export const carouselPrevArrowClasses = 'left-4'

/**
 * Carousel next arrow classes
 */
export const carouselNextArrowClasses = 'right-4'

/**
 * Carousel arrow disabled classes
 */
export const carouselArrowDisabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none'

/**
 * Get carousel container classes
 */
export function getCarouselContainerClasses(className?: string): string {
  return className ? `${carouselBaseClasses} ${className}` : carouselBaseClasses
}

/**
 * Get carousel dots container classes based on position
 */
export function getCarouselDotsClasses(position: CarouselDotPosition): string {
  return `${carouselDotsBaseClasses} ${carouselDotsPositionClasses[position]}`
}

/**
 * Get carousel dot classes based on active state
 */
export function getCarouselDotClasses(isActive: boolean): string {
  return isActive ? `${carouselDotClasses} ${carouselDotActiveClasses}` : carouselDotClasses
}

/**
 * Get carousel arrow classes based on type and disabled state
 */
export function getCarouselArrowClasses(type: 'prev' | 'next', disabled: boolean): string {
  const position = type === 'prev' ? carouselPrevArrowClasses : carouselNextArrowClasses
  return disabled
    ? `${carouselArrowBaseClasses} ${position} ${carouselArrowDisabledClasses}`
    : `${carouselArrowBaseClasses} ${position}`
}

/**
 * Calculate the next slide index
 */
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

/**
 * Calculate the previous slide index
 */
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

/**
 * Check if the next button should be disabled
 */
export function isNextDisabled(
  currentIndex: number,
  totalSlides: number,
  infinite: boolean
): boolean {
  if (infinite) return false
  return currentIndex >= totalSlides - 1
}

/**
 * Check if the prev button should be disabled
 */
export function isPrevDisabled(
  currentIndex: number,
  _totalSlides: number,
  infinite: boolean
): boolean {
  if (infinite) return false
  return currentIndex <= 0
}

/**
 * Clamp the slide index to valid range
 */
export function clampSlideIndex(index: number, totalSlides: number): number {
  if (totalSlides <= 0) return 0
  if (index < 0) return 0
  if (index >= totalSlides) return totalSlides - 1
  return index
}

/**
 * Calculate transform offset for scroll effect
 */
export function getScrollTransform(currentIndex: number): string {
  return `translateX(-${currentIndex * 100}%)`
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
    if (timestamp - lastTimestamp >= interval) {
      lastTimestamp = timestamp
      options.onAdvance()
    }

    scheduleFrame()
  }

  const start = (): void => {
    if (running) return
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

/**
 * Prev arrow SVG path
 */
export const carouselPrevArrowPath = 'M15.75 19.5L8.25 12l7.5-7.5'

/**
 * Next arrow SVG path
 */
export const carouselNextArrowPath = 'M8.25 4.5l7.5 7.5-7.5 7.5'
