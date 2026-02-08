/**
 * Badge component utilities
 */

import type { BadgePosition, BadgeSize, BadgeType } from '../types/badge'

/** Base classes for all badge variants */
export const badgeBaseClasses =
  'inline-flex items-center justify-center font-medium transition-colors'

/** Size classes for badge content (number/text) */
export const badgeSizeClasses: Record<BadgeSize, string> = {
  sm: 'min-w-4 h-4 text-xs px-1',
  md: 'min-w-5 h-5 text-xs px-1.5',
  lg: 'min-w-6 h-6 text-sm px-2'
} as const

/** Size classes for dot badges */
export const dotSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3'
} as const

/** Shape classes per badge type */
export const badgeTypeClasses: Record<BadgeType, string> = {
  dot: 'rounded-full',
  number: 'rounded-full',
  text: 'rounded-md'
} as const

/** Wrapper classes for non-standalone badge */
export const badgeWrapperClasses = 'relative inline-flex'

/** Position classes for non-standalone badge */
export const badgePositionClasses: Record<BadgePosition, string> = {
  'top-right': 'absolute -top-1 -right-1',
  'top-left': 'absolute -top-1 -left-1',
  'bottom-right': 'absolute -bottom-1 -right-1',
  'bottom-left': 'absolute -bottom-1 -left-1'
} as const

/**
 * Format badge content for display.
 * Returns null when badge should not display (e.g. zero without showZero).
 */
export function formatBadgeContent(
  content: number | string | undefined,
  max: number = 99,
  showZero: boolean = false
): string | null {
  if (content === undefined || content === null) return null
  if (typeof content === 'string') return content
  if (content === 0 && !showZero) return null
  if (content > max) return `${max}+`
  return String(content)
}

/**
 * Check if badge should be hidden.
 * Dot badges are always visible; number/text badges hide when content is empty or zero.
 */
export function shouldHideBadge(
  content: number | string | undefined,
  type: BadgeType,
  showZero: boolean
): boolean {
  if (type === 'dot') return false
  if (content === undefined || content === null) return true
  if (typeof content === 'string') return content === ''
  return content === 0 && !showZero
}
