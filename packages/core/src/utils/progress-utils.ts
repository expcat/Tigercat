/**
 * Progress component utilities
 * Shared styles and helpers for Progress components
 */

import type { ProgressSize, ProgressStatus } from '../types/progress'

/**
 * Base classes for line progress bar
 */
export const progressLineBaseClasses = 'relative overflow-hidden rounded-full'

/**
 * Base classes for line progress bar inner
 */
export const progressLineInnerClasses = 'h-full rounded-full transition-all duration-300 ease-in-out flex items-center justify-end'

/**
 * Base classes for progress text
 */
export const progressTextBaseClasses = 'text-gray-700 font-medium ml-2'

/**
 * Base classes for circle progress
 */
export const progressCircleBaseClasses = 'relative inline-flex items-center justify-center'

/**
 * Size classes for line progress height
 */
export const progressLineSizeClasses: Record<ProgressSize, string> = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
} as const

/**
 * Size classes for circle progress
 */
export const progressCircleSizeClasses: Record<ProgressSize, number> = {
  sm: 80,
  md: 120,
  lg: 160,
} as const

/**
 * Size classes for progress text
 */
export const progressTextSizeClasses: Record<ProgressSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const

/**
 * Striped background classes
 */
export const progressStripedClasses = 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:2rem_2rem]'

/**
 * Animated striped classes
 */
export const progressStripedAnimationClasses = 'animate-[progress-stripes_1s_linear_infinite]'

/**
 * Get status-based variant
 * Status takes precedence over variant
 * @param status - Progress status
 * @returns Variant name
 */
export function getStatusVariant(status: ProgressStatus): string {
  const statusVariantMap: Record<ProgressStatus, string> = {
    normal: '',
    success: 'success',
    exception: 'danger',
    paused: 'warning',
  }
  return statusVariantMap[status] || ''
}

/**
 * Format progress text
 * @param percentage - Progress percentage
 * @param customText - Custom text to display
 * @param formatFn - Custom format function
 * @returns Formatted text
 */
export function formatProgressText(
  percentage: number,
  customText?: string,
  formatFn?: (percentage: number) => string
): string {
  if (customText !== undefined) {
    return customText
  }
  
  if (formatFn) {
    return formatFn(percentage)
  }
  
  return `${Math.round(percentage)}%`
}

/**
 * Clamp percentage value between 0 and 100
 * @param percentage - Progress percentage
 * @returns Clamped percentage
 */
export function clampPercentage(percentage: number): number {
  return Math.max(0, Math.min(100, percentage))
}

/**
 * Calculate circle path properties
 * @param radius - Circle radius
 * @param strokeWidth - Stroke width
 * @param percentage - Progress percentage
 * @returns Circle path properties
 */
export function calculateCirclePath(
  radius: number,
  strokeWidth: number,
  percentage: number
): {
  circumference: number
  strokeDasharray: string
  strokeDashoffset: number
} {
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  
  return {
    circumference,
    strokeDasharray: `${circumference}`,
    strokeDashoffset: offset,
  }
}

/**
 * Get circle size properties
 * @param size - Progress size
 * @param strokeWidth - Stroke width
 * @returns Circle dimensions
 */
export function getCircleSize(size: ProgressSize, strokeWidth: number): {
  width: number
  height: number
  radius: number
  cx: number
  cy: number
} {
  const width = progressCircleSizeClasses[size]
  const height = width
  const radius = (width - strokeWidth) / 2
  const cx = width / 2
  const cy = height / 2
  
  return { width, height, radius, cx, cy }
}

/**
 * Get background color class for track
 */
export const progressTrackBgClasses = 'bg-gray-200'

/**
 * Get text position classes for circle
 */
export const progressCircleTextClasses = 'absolute inset-0 flex items-center justify-center'
