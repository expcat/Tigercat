/**
 * Theme configuration for Slider component
 */

import type { SliderSize } from '../types/slider'

/**
 * Base classes for Slider component
 */
export const sliderBaseClasses = 'relative w-full'

/**
 * Slider track classes
 */
export const sliderTrackClasses = 'bg-[var(--tiger-border,#e5e7eb)] rounded-full'

/**
 * Slider range (filled portion) classes
 */
export const sliderRangeClasses = 'bg-[var(--tiger-primary,#2563eb)] rounded-full absolute h-full'

/**
 * Slider thumb classes
 */
export const sliderThumbClasses =
  'bg-[var(--tiger-surface,#ffffff)] border-2 border-[var(--tiger-primary,#2563eb)] rounded-full absolute top-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--tiger-primary,#2563eb)]'

/**
 * Slider disabled classes
 */
export const sliderDisabledClasses = 'opacity-50 cursor-not-allowed'

/**
 * Slider tooltip classes
 */
export const sliderTooltipClasses =
  'absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--tiger-text,#111827)] text-[var(--tiger-surface,#ffffff)] rounded whitespace-nowrap pointer-events-none'

/**
 * Slider size-specific classes
 */
export const sliderSizeClasses: Record<
  SliderSize,
  {
    track: string
    thumb: string
    tooltip: string
  }
> = {
  sm: {
    track: 'h-1',
    thumb: 'h-3 w-3',
    tooltip: 'text-xs px-1.5 py-0.5'
  },
  md: {
    track: 'h-1.5',
    thumb: 'h-4 w-4',
    tooltip: 'text-sm px-2 py-1'
  },
  lg: {
    track: 'h-2',
    thumb: 'h-5 w-5',
    tooltip: 'text-base px-2.5 py-1.5'
  }
}

/**
 * Get slider track classes based on size and state
 */
export function getSliderTrackClasses(size: SliderSize = 'md', disabled: boolean = false): string {
  const sizeClass = sliderSizeClasses[size].track
  const disabledClass = disabled ? sliderDisabledClasses : ''

  return [sliderTrackClasses, sizeClass, disabledClass].filter(Boolean).join(' ')
}

/**
 * Get slider thumb classes based on size and state
 */
export function getSliderThumbClasses(size: SliderSize = 'md', disabled: boolean = false): string {
  const sizeClass = sliderSizeClasses[size].thumb
  const disabledClass = disabled ? sliderDisabledClasses : ''

  return [sliderThumbClasses, sizeClass, disabledClass].filter(Boolean).join(' ')
}

/**
 * Get slider tooltip classes based on size
 */
export function getSliderTooltipClasses(size: SliderSize = 'md'): string {
  const sizeClass = sliderSizeClasses[size].tooltip

  return [sliderTooltipClasses, sizeClass].filter(Boolean).join(' ')
}
