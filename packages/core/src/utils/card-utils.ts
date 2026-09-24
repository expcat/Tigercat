import type { BaseLayoutProps, CardSize, CardVariant } from '../types'
import { isActivationKey } from './a11y-utils'
import { classNames } from './class-names'
import { resolveLinkAddress, type ResolvedLinkAddress } from './link-utils'

/** Card geometry previously injected at runtime. Wire into the tailwind plugin. */
export const cardBaseStyles = {
  '.tiger-card': {
    borderRadius: 'var(--tiger-radius-lg)',
    overflow: 'visible'
  },
  '.tiger-card.tiger-flex-row': {
    display: 'flex',
    flexDirection: 'row'
  },
  '.tiger-card-cover': {
    overflow: 'hidden'
  },
  '.tiger-card-cover-vertical': {
    width: '100%',
    height: '12rem',
    borderStartStartRadius: 'inherit',
    borderStartEndRadius: 'inherit'
  },
  '.tiger-card-cover-horizontal': {
    flexShrink: '0',
    width: '12rem',
    alignSelf: 'stretch',
    borderStartStartRadius: 'inherit',
    borderEndStartRadius: 'inherit'
  },
  '.tiger-card-cover > img, .tiger-card-cover > video': {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  '.tiger-card-variant-default, .tiger-card-variant-bordered, .tiger-card-variant-shadow, .tiger-card-variant-elevated':
    {
      backgroundColor: 'var(--tiger-surface)',
      borderStyle: 'solid',
      borderColor: 'var(--tiger-border)'
    },
  '.tiger-card-variant-default, .tiger-card-variant-shadow, .tiger-card-variant-elevated': {
    borderWidth: '1px'
  },
  '.tiger-card-variant-bordered': {
    borderWidth: '2px'
  },
  '.tiger-card-variant-shadow': {
    boxShadow: 'var(--tiger-shadow-md)'
  },
  '.tiger-card-variant-elevated': {
    boxShadow: 'var(--tiger-shadow-lg)'
  },
  '.tiger-card-variant-transparent': {
    backgroundColor: 'transparent',
    borderWidth: '0',
    boxShadow: 'none'
  },
  '.tiger-card-link': {
    color: 'inherit',
    textDecoration: 'none'
  },
  '.tiger-card-link-stretch::after': {
    content: '""',
    position: 'absolute',
    inset: '0'
  },
  '.tiger-card-actions': {
    position: 'relative',
    zIndex: '1'
  }
} as const

export const cardBaseClasses =
  'tiger-card rounded-[var(--tiger-radius-lg)] tiger-motion-aware transition-[box-shadow,transform] duration-200 ease-out'

export const cardSizeClasses: Record<CardSize, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
} as const

const CARD_SHADOW_MD =
  'shadow-[var(--tiger-shadow-md)]'
const CARD_SHADOW_LG =
  'shadow-[var(--tiger-shadow-lg)]'

export const cardVariantClasses: Record<CardVariant, string> = {
  default: classNames(
    'tiger-card-variant-default bg-[var(--tiger-surface)] border border-[var(--tiger-border)]'
  ),
  bordered: classNames(
    'tiger-card-variant-bordered bg-[var(--tiger-surface)] border-2 border-[var(--tiger-border)]'
  ),
  shadow: classNames(
    'tiger-card-variant-shadow bg-[var(--tiger-surface)] border border-[var(--tiger-border)]',
    CARD_SHADOW_MD
  ),
  elevated: classNames(
    'tiger-card-variant-elevated bg-[var(--tiger-surface)] border border-[var(--tiger-border)]',
    CARD_SHADOW_LG
  ),
  transparent: 'tiger-card-variant-transparent bg-transparent border-0 shadow-none'
} as const

/** Visual lift only. Cursor and focus ring attach when the card is actually a control. */
export const cardHoverClasses = classNames(
  'hover:shadow-[var(--tiger-shadow-lg)]',
  'hover:-translate-y-1 motion-reduce:hover:translate-y-0'
)

export const cardClickableClasses =
  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring)]/40'

export const cardDirectionClasses: Record<NonNullable<BaseLayoutProps['orientation']>, string> = {
  vertical: 'flex flex-col',
  horizontal: 'tiger-flex-row flex'
} as const

export const cardHorizontalBodyClasses = 'flex flex-col flex-1 min-w-0'

export const cardHeaderClasses = 'border-b border-[var(--tiger-border)] pb-3 mb-3'

export const cardFooterClasses = 'border-t border-[var(--tiger-border)] pt-3 mt-3'

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
  return classNames(
    cardBaseClasses,
    cardVariantClasses[variant] ?? cardVariantClasses.default,
    hoverable && cardHoverClasses,
    clickable && cardClickableClasses
  )
}

const INTERACTIVE_CARD_TAGS = new Set([
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  'audio',
  'video'
])

/** Intrinsic controls, and nodes that already expose a button or link role. */
export function cardElementTypeIsInteractive(
  type: unknown,
  props?: Record<string, unknown> | null
): boolean {
  if (typeof type === 'string' && INTERACTIVE_CARD_TAGS.has(type)) return true
  if (!props) return false
  const role = props.role
  if (role === 'button' || role === 'link' || role === 'checkbox' || role === 'switch') return true
  if (typeof props.href === 'string' && props.href.trim()) return true
  const tab = props.tabIndex ?? props.tabindex
  if (typeof tab === 'number' && tab >= 0) return true
  return false
}

export const cardTitleLinkClasses =
  'tiger-card-link inline text-inherit no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring)]/40'

export const cardStretchLinkClasses = classNames(
  cardTitleLinkClasses,
  'tiger-card-link-stretch block'
)

export const cardActionsRaisedClasses = 'tiger-card-actions relative z-[1]'

export interface CardActivation {
  /** Root is the navigation or button control. */
  rootInteractive: boolean
  rootTag: 'div' | 'a'
  rootRole?: 'button'
  rootTabIndex?: number
  href?: string
  target?: string
  rel?: string
  /** Present when a separate link (title or stretch) navigates. */
  link: (ResolvedLinkAddress & { stretch: boolean }) | null
}

/**
 * One activation surface. Inner controls keep the root static.
 * A valid href then lives on the root, or on a title / stretched link
 * that does not wrap those controls. Rejected hrefs are omitted.
 */
export function resolveCardActivation(options: {
  href?: string | null
  target?: string | null
  rel?: string | null
  clickable?: boolean
  hasActions?: boolean
  hasForeignControls?: boolean
}): CardActivation {
  const nested = Boolean(options.hasActions) || Boolean(options.hasForeignControls)
  const address = resolveLinkAddress({
    href: options.href,
    target: options.target,
    rel: options.rel
  })
  if (address.href && !nested) {
    return {
      rootInteractive: true,
      rootTag: 'a',
      link: null,
      ...address
    }
  }
  if (!address.href && options.clickable && !nested) {
    return {
      rootInteractive: true,
      rootTag: 'div',
      rootRole: 'button',
      rootTabIndex: 0,
      link: null
    }
  }
  if (address.href && nested) {
    return {
      rootInteractive: false,
      rootTag: 'div',
      link: {
        ...address,
        stretch: Boolean(options.hasActions) && !options.hasForeignControls
      }
    }
  }
  return { rootInteractive: false, rootTag: 'div', link: null }
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
  target?: string | null
  rel?: string | null
  hasForeignControls?: boolean
}): CardRootResolution {
  const activation = resolveCardActivation({
    href: options.href,
    target: options.target,
    rel: options.rel,
    clickable: options.clickable,
    hasActions: options.nestedInteractive,
    hasForeignControls: options.hasForeignControls
  })
  if (!activation.rootInteractive) return { tag: 'div' }
  if (activation.rootTag === 'a') return { tag: 'a' }
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
