/**
 * Tag component utilities
 * Shared styles and helpers for Tag components
 */

/**
 * Base classes for all tag variants
 */
export const tagBaseClasses = 'inline-flex items-center gap-1 rounded-md border font-medium transition-colors'

/**
 * Size classes for tag variants
 */
export const tagSizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
} as const

/**
 * Close button base classes
 */
export const tagCloseButtonBaseClasses = 'inline-flex items-center justify-center rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-1'

/**
 * Close icon SVG path data
 */
export const tagCloseIconPath = 'M6 18L18 6M6 6l12 12'
