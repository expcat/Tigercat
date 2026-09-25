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
 * Padding for messages taken out of the flex line (`data-tiger-field-extra`).
 * The count stays under the chrome without stretching the addon to that line.
 * Values are CSS idents so the class name does not contain quotes.
 */
export const inputGroupFieldExtraReserveClasses =
  'has-[[data-tiger-field-extra=line]]:pb-8 has-[[data-tiger-field-extra=stack]]:pb-16'

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
  'inline-flex items-center justify-center border border-[var(--tiger-border)] bg-[var(--tiger-surface-muted)] text-[var(--tiger-text-secondary)] whitespace-nowrap rounded-[var(--tiger-radius-md)]'

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
    inputGroupFieldExtraReserveClasses,
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
