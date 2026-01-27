import { type LinkSize, type LinkProps } from '../types/link'

/**
 * Link base classes with improved interaction feedback
 * @since 0.2.0 - Changed to focus-visible, added active:opacity
 */
export const linkBaseClasses =
  'inline-flex items-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] cursor-pointer no-underline active:opacity-80'

export const linkSizeClasses: Record<LinkSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

export const linkDisabledClasses = 'cursor-not-allowed opacity-60 pointer-events-none'

export function getSecureRel(
  target: LinkProps['target'] | undefined,
  rel: string | undefined
): string | undefined {
  if (target === '_blank' && !rel) return 'noopener noreferrer'
  return rel
}
