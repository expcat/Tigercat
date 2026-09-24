import { type LinkSize, type LinkVariant, type LinkProps } from '../types/link'
import { type ClassValue, classNames } from './class-names'
import { getLinkVariantClasses } from './theme-colors'

/**
 * Link base classes with improved interaction feedback
 * @since 0.2.0 - Changed to focus-visible, added active:opacity
 */
export const linkBaseClasses =
  'inline-flex items-center [transition:var(--tiger-transition-quick)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring)]/40 active:opacity-80'

export const linkSizeClasses: Record<LinkSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

export const linkDisabledClasses = 'cursor-not-allowed opacity-60 pointer-events-none'

const BLANK_REL_TOKENS = ['noopener', 'noreferrer'] as const

/**
 * Protocols a navigation address may use.
 * Relative paths, queries, and in-document hashes have no protocol and are allowed.
 * `javascript:`, `data:`, and `vbscript:` are not on this list. Bitmap `data:` is not an exception.
 */
export const LINK_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'] as const

export type LinkUrlProtocol = (typeof LINK_URL_PROTOCOLS)[number]

const ALLOWED_LINK_PROTOCOLS = new Set<string>(LINK_URL_PROTOCOLS)

/**
 * Characters browsers ignore while parsing a URL scheme.
 * Stripping them before the protocol check closes `java\nscript:` and `java\tscript:`.
 */
function stripSchemeNoise(value: string): string {
  return value.replace(/[\u0000-\u0020\u007F\\]+/g, '')
}

function schemeName(value: string): string | null {
  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(value)
  return match ? match[1].toLowerCase() : null
}

/**
 * True when `value` is a relative path, query, hash, or an allowlisted protocol.
 * Protocol-relative `//` URLs are rejected. Empty strings are rejected.
 */
export function isAllowedLinkUrl(value: string | null | undefined): boolean {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  const normalized = stripSchemeNoise(trimmed)
  if (!normalized || normalized.startsWith('//')) return false
  const scheme = schemeName(normalized)
  if (!scheme) return true
  return ALLOWED_LINK_PROTOCOLS.has(`${scheme}:`)
}

/**
 * Site-internal path: a relative address with no scheme.
 * External links stay on `href` and use {@link isAllowedLinkUrl}.
 */
export function isInternalLinkPath(value: string | null | undefined): boolean {
  if (!isAllowedLinkUrl(value)) return false
  const normalized = stripSchemeNoise(value!.trim())
  return schemeName(normalized) == null
}

/**
 * Href written to the DOM. Disabled controls and rejected addresses omit it.
 */
export function resolveLinkHref(
  href: string | null | undefined,
  options: { disabled?: boolean } = {}
): string | undefined {
  if (options.disabled) return undefined
  if (!isAllowedLinkUrl(href)) return undefined
  return href!.trim()
}

/**
 * `_blank` always keeps `noopener` and `noreferrer` in the token set.
 * Caller tokens such as `nofollow` are preserved. Other targets are unchanged.
 */
export function getSecureRel(
  target: LinkProps['target'] | string | null | undefined,
  rel: string | null | undefined
): string | undefined {
  if (target !== '_blank') return rel ?? undefined

  const tokens = new Set(
    (rel ?? '')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
  )
  for (const token of BLANK_REL_TOKENS) tokens.add(token)
  return [...tokens].join(' ')
}

export interface ResolvedLinkAddress {
  href?: string
  target?: string
  rel?: string
}

/**
 * Single navigation address gate. Callers do not keep a second protocol list.
 */
export function resolveLinkAddress(input: {
  href?: string | null
  target?: string | null
  rel?: string | null
  disabled?: boolean
}): ResolvedLinkAddress {
  const href = resolveLinkHref(input.href, { disabled: input.disabled })
  if (!href) return {}
  const rel = getSecureRel(input.target, input.rel)
  return {
    href,
    ...(input.target ? { target: input.target } : {}),
    ...(rel ? { rel } : {})
  }
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
