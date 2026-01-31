/**
 * Carousel component utilities
 * Shared styles and helpers for Carousel components
 */

import type { CarouselDotPosition, CarouselEffect } from '../types/carousel'

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
 * Carousel slide classes for fade effect
 */
export const carouselSlideFadeClasses = 'absolute inset-0 transition-opacity ease-in-out'

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
  const classes = [carouselBaseClasses]
  if (className) {
    classes.push(className)
  }
  return classes.filter(Boolean).join(' ')
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
  const classes = [carouselDotClasses]
  if (isActive) {
    classes.push(carouselDotActiveClasses)
  }
  return classes.filter(Boolean).join(' ')
}

/**
 * Get carousel arrow classes based on type and disabled state
 */
export function getCarouselArrowClasses(type: 'prev' | 'next', disabled: boolean): string {
  const classes = [carouselArrowBaseClasses]
  classes.push(type === 'prev' ? carouselPrevArrowClasses : carouselNextArrowClasses)
  if (disabled) {
    classes.push(carouselArrowDisabledClasses)
  }
  return classes.filter(Boolean).join(' ')
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

/**
 * Prev arrow SVG path
 */
export const carouselPrevArrowPath =
  'M15.75 19.5L8.25 12l7.5-7.5'

/**
 * Next arrow SVG path
 */
export const carouselNextArrowPath =
  'M8.25 4.5l7.5 7.5-7.5 7.5'
