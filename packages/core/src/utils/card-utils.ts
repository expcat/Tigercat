import type { BaseLayoutProps, CardSize, CardVariant } from '../types'
import { isActivationKey } from './a11y-utils'
import { classNames } from './class-names'
import { isBrowser } from './env'

export const CARD_STYLE_ID = 'tiger-ui-card-styles'

export const CARD_CSS = `
.tiger-card {
  border-radius: var(--tiger-radius-lg, 0.75rem);
  overflow: visible;
}
.tiger-card.tiger-flex-row {
  display: flex;
  flex-direction: row;
}
[dir="rtl"] .tiger-card.tiger-flex-row,
[data-tiger-dir="rtl"] .tiger-card.tiger-flex-row {
  flex-direction: row-reverse;
}
.tiger-card-cover {
  overflow: hidden;
}
.tiger-card-cover-vertical {
  width: 100%;
  height: 12rem;
  border-start-start-radius: inherit;
  border-start-end-radius: inherit;
}
.tiger-card-cover-horizontal {
  flex-shrink: 0;
  width: 12rem;
  align-self: stretch;
  border-start-start-radius: inherit;
  border-end-start-radius: inherit;
}
.tiger-card-cover > img,
.tiger-card-cover > video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tiger-card-variant-default,
.tiger-card-variant-bordered,
.tiger-card-variant-shadow,
.tiger-card-variant-elevated {
  background-color: var(--tiger-surface, #ffffff);
  border-style: solid;
  border-color: var(--tiger-border, #e5e7eb);
}
.tiger-card-variant-default,
.tiger-card-variant-shadow,
.tiger-card-variant-elevated {
  border-width: 1px;
}
.tiger-card-variant-bordered {
  border-width: 2px;
}
.tiger-card-variant-shadow {
  box-shadow: var(--tiger-shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1));
}
.tiger-card-variant-elevated {
  box-shadow: var(--tiger-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1));
}
.tiger-card-variant-transparent {
  background-color: transparent;
  border-width: 0;
  box-shadow: none;
}
`

export function injectCardStyles(): void {
  if (!isBrowser()) return
  if (document.getElementById(CARD_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = CARD_STYLE_ID
  style.textContent = CARD_CSS
  document.head.appendChild(style)
}

export const cardBaseClasses =
  'tiger-card rounded-[var(--tiger-radius-lg,0.75rem)] tiger-motion-aware transition-[box-shadow,transform] duration-200 ease-out'

export const cardSizeClasses: Record<CardSize, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
} as const

const CARD_SHADOW_MD =
  'shadow-[var(--tiger-shadow-md,0_4px_6px_-1px_rgb(0_0_0_/_0.1),0_2px_4px_-2px_rgb(0_0_0_/_0.1))]'
const CARD_SHADOW_LG =
  'shadow-[var(--tiger-shadow-lg,0_10px_15px_-3px_rgb(0_0_0_/_0.1),0_4px_6px_-4px_rgb(0_0_0_/_0.1))]'

export const cardVariantClasses: Record<CardVariant, string> = {
  default: classNames(
    'tiger-card-variant-default bg-[var(--tiger-surface,#ffffff)] border border-[var(--tiger-border,#e5e7eb)]'
  ),
  bordered: classNames(
    'tiger-card-variant-bordered bg-[var(--tiger-surface,#ffffff)] border-2 border-[var(--tiger-border,#e5e7eb)]'
  ),
  shadow: classNames(
    'tiger-card-variant-shadow bg-[var(--tiger-surface,#ffffff)] border border-[var(--tiger-border,#e5e7eb)]',
    CARD_SHADOW_MD
  ),
  elevated: classNames(
    'tiger-card-variant-elevated bg-[var(--tiger-surface,#ffffff)] border border-[var(--tiger-border,#e5e7eb)]',
    CARD_SHADOW_LG
  ),
  transparent: 'tiger-card-variant-transparent bg-transparent border-0 shadow-none'
} as const

/** Visual lift only. Cursor and focus ring attach when the card is actually a control. */
export const cardHoverClasses = classNames(
  'hover:shadow-[var(--tiger-shadow-lg,0_10px_15px_-3px_rgb(0_0_0_/_0.1),0_4px_6px_-4px_rgb(0_0_0_/_0.1))]',
  'hover:-translate-y-1 motion-reduce:hover:translate-y-0'
)

export const cardClickableClasses =
  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40'

export const cardDirectionClasses: Record<NonNullable<BaseLayoutProps['direction']>, string> = {
  vertical: 'flex flex-col',
  horizontal: 'tiger-flex-row flex'
} as const

export const cardHorizontalBodyClasses = 'flex flex-col flex-1 min-w-0'

export const cardHeaderClasses = 'border-b border-[var(--tiger-border,#e5e7eb)] pb-3 mb-3'

export const cardFooterClasses = 'border-t border-[var(--tiger-border,#e5e7eb)] pt-3 mt-3'

/** Cover media fills its wrapper. Wrapper holds the only size. */
export const cardCoverClasses = 'h-full w-full object-cover'

export const cardCoverWrapperClasses = 'tiger-card-cover overflow-hidden'

export const cardCoverVerticalWrapperClasses = 'tiger-card-cover-vertical w-full h-48'

export const cardCoverHorizontalWrapperClasses =
  'tiger-card-cover-horizontal shrink-0 w-48 self-stretch'

export const cardActionsClasses = 'flex gap-2 justify-end'

export function getCardCoverWrapperClasses(horizontal: boolean): string {
  return classNames(
    cardCoverWrapperClasses,
    horizontal ? cardCoverHorizontalWrapperClasses : cardCoverVerticalWrapperClasses
  )
}

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

export function getCardClasses(
  variant: CardVariant,
  hoverable: boolean,
  clickable = false
): string {
  injectCardStyles()
  return classNames(
    cardBaseClasses,
    cardVariantClasses[variant] ?? cardVariantClasses.default,
    hoverable && cardHoverClasses,
    clickable && cardClickableClasses
  )
}

export type CardRootTag = 'div' | 'a'

export interface CardRootResolution {
  tag: CardRootTag
  role?: 'button' | 'link'
  tabIndex?: number
}

export function resolveCardRoot(options: {
  href?: string
  clickable: boolean
  nestedInteractive: boolean
}): CardRootResolution {
  const href = options.href?.trim()
  if (!href && !options.clickable) return { tag: 'div' }
  // Nested buttons/links cannot live inside another control.
  if (options.nestedInteractive) return { tag: 'div' }
  if (href) return { tag: 'a' }
  return { tag: 'div', role: 'button', tabIndex: 0 }
}

export function handleCardActivation(
  event: { key?: string; preventDefault: () => void },
  onActivate?: () => void
): void {
  if (!onActivate || !isActivationKey(event)) return
  event.preventDefault()
  onActivate()
}
