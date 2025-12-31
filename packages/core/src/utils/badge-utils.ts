/**
 * Badge component utilities
 * Shared styles and helpers for Badge components
 */

import type { BadgePosition, BadgeSize, BadgeType } from '../types/badge'

/**
 * Base classes for all badge variants
 */
export const badgeBaseClasses = 'inline-flex items-center justify-center font-medium transition-colors'

/**
 * Size classes for badge variants
 */
export const badgeSizeClasses: Record<BadgeSize, string> = {
  sm: 'min-w-4 h-4 text-xs px-1',
  md: 'min-w-5 h-5 text-xs px-1.5',
  lg: 'min-w-6 h-6 text-sm px-2',
} as const

/**
 * Dot size classes
 */
export const dotSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
} as const

/**
 * Badge type specific classes
 */
export const badgeTypeClasses: Record<BadgeType, string> = {
  dot: 'rounded-full',
  number: 'rounded-full',
  text: 'rounded-md',
} as const

/**
 * Wrapper classes when badge is not standalone
 */
export const badgeWrapperClasses = 'relative inline-flex'

/**
 * Position classes for badge when used as wrapper
 */
export const badgePositionClasses: Record<BadgePosition, string> = {
  'top-right': 'absolute -top-1 -right-1',
  'top-left': 'absolute -top-1 -left-1',
  'bottom-right': 'absolute -bottom-1 -right-1',
  'bottom-left': 'absolute -bottom-1 -left-1',
} as const

/**
 * Format badge content for display
 * @param content - Badge content (number or string)
 * @param max - Maximum count to display
 * @param showZero - Whether to show zero count
 * @returns Formatted content string or null if should not display
 */
export function formatBadgeContent(
  content: number | string | undefined,
  max: number = 99,
  showZero: boolean = false
): string | null {
  // If content is undefined or null, don't display
  if (content === undefined || content === null) {
    return null
  }
  
  // If content is a string, return as-is
  if (typeof content === 'string') {
    return content
  }
  
  // If content is a number
  const num = Number(content)
  
  // Don't show zero unless showZero is true
  if (num === 0 && !showZero) {
    return null
  }
  
  // If exceeds max, show 'max+'
  if (num > max) {
    return `${max}+`
  }
  
  return String(num)
}

/**
 * Check if badge should be hidden
 * @param content - Badge content
 * @param type - Badge type
 * @param showZero - Whether to show zero count
 * @returns true if badge should be hidden
 */
export function shouldHideBadge(
  content: number | string | undefined,
  type: BadgeType,
  showZero: boolean
): boolean {
  // Dot badges are always shown
  if (type === 'dot') {
    return false
  }
  
  // For number and text types, check content
  const formattedContent = formatBadgeContent(content, 99, showZero)
  return formattedContent === null || formattedContent === ''
}
