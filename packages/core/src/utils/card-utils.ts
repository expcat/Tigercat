import type { CardSize, CardVariant } from '../types/card';

export const cardBaseClasses =
  'rounded-lg bg-[var(--tiger-surface,#ffffff)] overflow-hidden transition-all duration-200';

export const cardSizeClasses: Record<CardSize, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

export const cardVariantClasses: Record<CardVariant, string> = {
  default: 'border border-[var(--tiger-border,#e5e7eb)]',
  bordered: 'border-2 border-[var(--tiger-border,#e5e7eb)]',
  shadow: 'border border-[var(--tiger-border,#e5e7eb)] shadow-md',
  elevated: 'border border-[var(--tiger-border,#e5e7eb)] shadow-lg',
} as const;

export const cardHoverClasses =
  'cursor-pointer hover:shadow-xl hover:scale-[1.02]';

export const cardHeaderClasses =
  'border-b border-[var(--tiger-border,#e5e7eb)] pb-3 mb-3';

export const cardBodyClasses = '';

export const cardFooterClasses =
  'border-t border-[var(--tiger-border,#e5e7eb)] pt-3 mt-3';

export const cardCoverClasses = 'w-full h-48 object-cover';

export const cardCoverWrapperClasses = 'overflow-hidden';

export const cardActionsClasses = 'flex gap-2 justify-end';

export function getCardClasses(
  variant: CardVariant,
  hoverable: boolean
): string {
  const classes = [cardBaseClasses, cardVariantClasses[variant]];

  if (hoverable) {
    classes.push(cardHoverClasses);
  }

  return classes.join(' ');
}
