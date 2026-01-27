/**
 * Theme configuration for Switch component
 */

import { classNames } from '../utils/class-names'
import type { SwitchSize } from '../types/switch'

/**
 * Base classes for Switch component
 * @since 0.2.0 - Changed to focus-visible, added active:scale
 */
export const switchBaseClasses =
  'relative inline-flex items-center rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] active:scale-[0.98]'

/**
 * Switch container size classes
 */
export const switchSizeClasses: Record<SwitchSize, string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
  lg: 'h-7 w-14'
}

/**
 * Switch thumb size classes
 */
export const switchThumbSizeClasses: Record<SwitchSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

/**
 * Switch thumb translate classes for checked state
 */
export const switchThumbTranslateClasses: Record<SwitchSize, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-5',
  lg: 'translate-x-7'
}

/**
 * Get switch container classes based on size and state
 */
export function getSwitchClasses(
  size: SwitchSize = 'md',
  checked: boolean = false,
  disabled: boolean = false
): string {
  const sizeClass = switchSizeClasses[size]

  const bgColor = checked ? 'bg-[var(--tiger-primary,#2563eb)]' : 'bg-[var(--tiger-border,#e5e7eb)]'

  return classNames(
    switchBaseClasses,
    sizeClass,
    bgColor,
    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
  )
}

/**
 * Get switch thumb classes based on size and checked state
 */
export function getSwitchThumbClasses(size: SwitchSize = 'md', checked: boolean = false): string {
  const baseClasses =
    'inline-block transform rounded-full bg-[var(--tiger-surface,#ffffff)] shadow-lg transition-transform'
  const sizeClass = switchThumbSizeClasses[size]
  const translateClass = checked ? switchThumbTranslateClasses[size] : 'translate-x-0.5'

  return classNames(baseClasses, sizeClass, translateClass)
}
