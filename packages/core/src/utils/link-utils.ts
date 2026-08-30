import { type LinkSize, type LinkVariant, type LinkProps } from '../types/link'
import { type ClassValue, classNames } from './class-names'
import { getLinkVariantClasses } from './theme-colors'

/**
 * Link base classes with improved interaction feedback
 * @since 0.2.0 - Changed to focus-visible, added active:opacity
 */
export const linkBaseClasses =
  'inline-flex items-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40 active:opacity-80'

export const linkSizeClasses: Record<LinkSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

export const linkDisabledClasses = 'cursor-not-allowed opacity-60 pointer-events-none'

const BLANK_REL_TOKENS = ['noopener', 'noreferrer'] as const

/**
 * `_blank` always keeps `noopener` and `noreferrer` in the token set.
 * Caller tokens such as `nofollow` are preserved. Other targets are unchanged.
 */
export function getSecureRel(
  target: LinkProps['target'] | undefined,
  rel: string | undefined
): string | undefined {
  if (target !== '_blank') return rel

  const tokens = new Set(
    (rel ?? '')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
  )
  for (const token of BLANK_REL_TOKENS) tokens.add(token)
  return [...tokens].join(' ')
}

export function resolveLinkVariant(variant?: string | null): LinkVariant {
  if (variant === 'primary' || variant === 'secondary' || variant === 'default') return variant
  return 'primary'
}

export function resolveLinkSize(size?: string | null): LinkSize {
  if (size && size in linkSizeClasses) return size as LinkSize
  return 'md'
}

export interface ResolveLinkClassesInput {
  variant?: string
  size?: string
  underline?: boolean
  disabled?: boolean
  className?: ClassValue
}

/**
 * Resolve all Link skin classes. Unknown variant falls back to primary.
 * Disabled keeps cursor-not-allowed only (no cursor-pointer). Underline at rest
 * when `underline` is not false.
 */
export function resolveLinkClasses(input: ResolveLinkClassesInput = {}): string {
  const variant = resolveLinkVariant(input.variant)
  const size = resolveLinkSize(input.size)
  const underline = input.underline !== false

  return classNames(
    linkBaseClasses,
    getLinkVariantClasses(variant, undefined, { disabled: input.disabled }),
    linkSizeClasses[size],
    underline ? 'underline' : 'no-underline',
    input.disabled ? linkDisabledClasses : 'cursor-pointer',
    input.className
  )
}
