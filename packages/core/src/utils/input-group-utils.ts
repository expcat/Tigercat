/**
 * InputGroup component utilities
 * Shared styles and helpers for InputGroup components
 * @since 0.9.0
 */

import type { ComponentSize } from '../types/base'
import { classNames } from './class-names'
import { getJoinedChromeGroupItemClasses } from './joined-group-utils'

/**
 * Base classes for InputGroup container
 */
export const inputGroupBaseClasses = 'inline-flex items-stretch w-full'

/**
 * Compact mode classes — joins chrome marked `data-tiger-chrome`.
 */
export const inputGroupCompactClasses = getJoinedChromeGroupItemClasses({
  focus: 'focus-within'
})

/**
 * Non-compact mode spacing
 */
export const inputGroupSpacedClasses = 'gap-2'

/**
 * Addon base classes
 */
export const inputGroupAddonBaseClasses =
  'inline-flex items-center justify-center border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text-muted,#6b7280)] whitespace-nowrap rounded-[var(--tiger-radius-md,0.5rem)]'

/**
 * Addon size classes
 */
export const inputGroupAddonSizeClasses: Record<ComponentSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg'
}

/**
 * Get InputGroup container classes
 */
export function getInputGroupClasses(compact: boolean, className?: string): string {
  return classNames(
    inputGroupBaseClasses,
    compact ? inputGroupCompactClasses : inputGroupSpacedClasses,
    className
  )
}

/**
 * Get InputGroup addon classes. Compact first/last radius is the group's job.
 */
export function getInputGroupAddonClasses(
  size: ComponentSize,
  _compact: boolean,
  className?: string
): string {
  return classNames(inputGroupAddonBaseClasses, inputGroupAddonSizeClasses[size], className)
}
