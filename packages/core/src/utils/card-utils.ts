/**
 * Card component utilities
 * Shared styles and helpers for Card components
 */

import type { CardSize, CardVariant } from '../types/card'

/**
 * Base classes for all card variants
 */
export const cardBaseClasses = 'rounded-lg bg-white overflow-hidden transition-all duration-200'

/**
 * Size classes for card padding
 */
export const cardSizeClasses: Record<CardSize, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const

/**
 * Variant classes for card styles
 */
export const cardVariantClasses: Record<CardVariant, string> = {
  default: 'border border-gray-200',
  bordered: 'border-2 border-gray-300',
  shadow: 'border border-gray-200 shadow-md',
  elevated: 'border border-gray-200 shadow-lg',
} as const

/**
 * Hover effect classes
 */
export const cardHoverClasses = 'cursor-pointer hover:shadow-xl hover:scale-[1.02]'

/**
 * Card header classes
 */
export const cardHeaderClasses = 'border-b border-gray-200 pb-3 mb-3'

/**
 * Card body classes (no specific styling, just for structure)
 */
export const cardBodyClasses = ''

/**
 * Card footer classes
 */
export const cardFooterClasses = 'border-t border-gray-200 pt-3 mt-3'

/**
 * Card cover image classes
 */
export const cardCoverClasses = 'w-full h-48 object-cover'

/**
 * Card cover wrapper classes
 */
export const cardCoverWrapperClasses = 'overflow-hidden'

/**
 * Card actions classes (for action buttons area)
 */
export const cardActionsClasses = 'flex gap-2 justify-end'

/**
 * Get card variant classes
 * @param variant - Card variant type
 * @param hoverable - Whether the card is hoverable
 * @returns Combined class string for the card variant
 */
export function getCardClasses(
  variant: CardVariant,
  hoverable: boolean
): string {
  const classes = [
    cardBaseClasses,
    cardVariantClasses[variant],
  ]
  
  if (hoverable) {
    classes.push(cardHoverClasses)
  }
  
  return classes.join(' ')
}
