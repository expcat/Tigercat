import type { CardSize, CardVariant, CardDirection } from '../types/card'

export const cardBaseClasses =
  'rounded-[var(--tiger-radius-lg,0.75rem)] bg-[var(--tiger-surface,#ffffff)] overflow-hidden transition-all duration-200 ease-out'

export const cardSizeClasses: Record<CardSize, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
} as const

export const cardVariantClasses: Record<CardVariant, string> = {
  default: 'border border-[var(--tiger-border,#e5e7eb)]',
  bordered: 'border-2 border-[var(--tiger-border,#e5e7eb)]',
  shadow: 'border border-[var(--tiger-border,#e5e7eb)] shadow-md',
  elevated: 'border border-[var(--tiger-border,#e5e7eb)] shadow-lg',
  transparent: 'bg-transparent border-0 shadow-none'
} as const

export const cardHoverClasses = 'cursor-pointer hover:shadow-lg hover:-translate-y-1'

export const cardDirectionClasses: Record<CardDirection, string> = {
  vertical: 'flex flex-col',
  horizontal: 'flex flex-row'
} as const

export const cardHorizontalBodyClasses = 'flex flex-col flex-1 min-w-0'

export const cardHeaderClasses = 'border-b border-[var(--tiger-border,#e5e7eb)] pb-3 mb-3'

export const cardFooterClasses = 'border-t border-[var(--tiger-border,#e5e7eb)] pt-3 mt-3'

export const cardCoverClasses = 'w-full h-48 object-cover'

export const cardCoverWrapperClasses = 'overflow-hidden'

export const cardActionsClasses = 'flex gap-2 justify-end'

/**
 * Resolve the padding utility class for a card section.
 *
 * - `padding === false` → no padding.
 * - `padding` is a string → that custom class.
 * - otherwise → the default `size`-based padding (`cardSizeClasses[size]`).
 */
export function resolveCardPadding(
  size: CardSize,
  padding: boolean | string | undefined
): string | undefined {
  if (padding === false) return undefined
  if (typeof padding === 'string') return padding
  return cardSizeClasses[size]
}

export function getCardClasses(variant: CardVariant, hoverable: boolean): string {
  const classes = [cardBaseClasses, cardVariantClasses[variant]]

  if (hoverable) {
    classes.push(cardHoverClasses)
  }

  return classes.join(' ')
}
