/**
 * Theme configuration for Slider component
 */

import type { ComponentSize } from '../types/base'
import { classNames } from './class-names'

export const sliderBaseClasses = 'relative w-full'

export const sliderTrackClasses = 'relative w-full rounded-full bg-[var(--tiger-border,#e5e7eb)]'

export const sliderHitAreaClasses = 'relative w-full py-2 min-h-6'

export const sliderRangeClasses =
  'bg-[var(--tiger-primary,#2563eb)] rounded-full absolute inset-y-0'

export const sliderThumbClasses =
  'bg-[var(--tiger-surface,#ffffff)] border-2 border-[var(--tiger-primary,#2563eb)] rounded-full absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer tiger-motion-aware hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'

export const sliderThumbDraggingClasses = '[transition:none] hover:scale-100'

export const sliderDisabledClasses = 'opacity-50 cursor-not-allowed'

export const sliderTooltipClasses =
  'absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--tiger-text,#111827)] text-[var(--tiger-surface,#ffffff)] rounded whitespace-nowrap pointer-events-none'

export const sliderSizeClasses: Record<
  ComponentSize,
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

export function getSliderTrackClasses(
  size: ComponentSize = 'md',
  disabled: boolean = false
): string {
  return classNames(
    sliderTrackClasses,
    sliderSizeClasses[size].track,
    disabled ? 'cursor-not-allowed' : 'cursor-pointer'
  )
}

export function getSliderThumbClasses(
  size: ComponentSize = 'md',
  disabled: boolean = false,
  dragging: boolean = false
): string {
  return classNames(
    sliderThumbClasses,
    sliderSizeClasses[size].thumb,
    dragging && sliderThumbDraggingClasses,
    disabled && 'cursor-not-allowed'
  )
}

export function getSliderTooltipClasses(size: ComponentSize = 'md'): string {
  return classNames(sliderTooltipClasses, sliderSizeClasses[size].tooltip)
}

export function getSliderRootClasses(disabled: boolean = false, className?: string): string {
  return classNames(sliderBaseClasses, disabled && sliderDisabledClasses, className)
}
