/**
 * Theme color configuration for Checkbox component
 */

import type { CheckboxSize } from '../types/checkbox'

/**
 * Checkbox size classes
 */
export const checkboxSizeClasses: Record<CheckboxSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

/**
 * Checkbox label size classes
 */
export const checkboxLabelSizeClasses: Record<CheckboxSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

/**
 * Get checkbox classes based on size and state
 */
export function getCheckboxClasses(
  size: CheckboxSize = 'md',
  disabled: boolean = false
): string {
  const baseClasses = 'rounded border-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2'
  const sizeClass = checkboxSizeClasses[size]
  const colorClasses = [
    'border-[var(--tiger-primary,#2563eb)]',
    'text-white',
    'checked:bg-[var(--tiger-primary,#2563eb)]',
    'checked:border-[var(--tiger-primary,#2563eb)]',
    'focus:ring-[var(--tiger-primary,#2563eb)]',
  ].join(' ')
  
  const disabledClasses = disabled
    ? 'cursor-not-allowed opacity-50 disabled:bg-gray-100 disabled:border-gray-300'
    : ''
  
  return [baseClasses, sizeClass, colorClasses, disabledClasses]
    .filter(Boolean)
    .join(' ')
}

/**
 * Get checkbox label classes based on size and state
 */
export function getCheckboxLabelClasses(
  size: CheckboxSize = 'md',
  disabled: boolean = false
): string {
  const baseClasses = 'inline-flex items-center cursor-pointer select-none'
  const sizeClass = checkboxLabelSizeClasses[size]
  const disabledClasses = disabled ? 'cursor-not-allowed opacity-50' : ''
  
  return [baseClasses, sizeClass, disabledClasses]
    .filter(Boolean)
    .join(' ')
}
