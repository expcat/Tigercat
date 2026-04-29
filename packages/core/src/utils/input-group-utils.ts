/**
 * InputGroup component utilities
 * Shared styles and helpers for InputGroup components
 * @since 0.9.0
 */

import type { InputGroupSize } from '../types/input-group'

/**
 * Base classes for InputGroup container
 */
export const inputGroupBaseClasses = 'inline-flex items-stretch w-full'

/**
 * Compact mode classes — merges borders of adjacent children
 */
export const inputGroupCompactClasses =
  '[&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child)]:-ml-px [&>*:focus]:z-10 [&>*:focus]:relative'

/**
 * Non-compact mode spacing
 */
export const inputGroupSpacedClasses = 'gap-2'

/**
 * Addon base classes
 */
export const inputGroupAddonBaseClasses =
  'inline-flex items-center justify-center border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface-muted,#f9fafb)] text-[var(--tiger-text-muted,#6b7280)] whitespace-nowrap'

/**
 * Addon size classes
 */
export const inputGroupAddonSizeClasses: Record<InputGroupSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
  lg: 'px-4 py-3 text-lg'
}

/**
 * Get InputGroup container classes
 */
export function getInputGroupClasses(compact: boolean, className?: string): string {
  const classes = [
    inputGroupBaseClasses,
    compact ? inputGroupCompactClasses : inputGroupSpacedClasses
  ]
  if (className) classes.push(className)
  return classes.join(' ')
}

/**
 * Get InputGroup addon classes
 */
export function getInputGroupAddonClasses(
  size: InputGroupSize,
  compact: boolean,
  className?: string
): string {
  const classes = [inputGroupAddonBaseClasses, inputGroupAddonSizeClasses[size]]
  if (compact) {
    classes.push('first:rounded-l-md last:rounded-r-md')
  } else {
    classes.push('rounded-[var(--tiger-radius-md,0.5rem)]')
  }
  if (className) classes.push(className)
  return classes.join(' ')
}
