import { type ButtonSize } from '../types/button'

/**
 * Button base classes with improved interaction feedback
 * - Uses focus-visible for keyboard navigation only (no distracting rings on click)
 * - Adds active:scale for natural press feedback
 * @since 0.2.0 - Improved interaction effects
 */
export const buttonBaseClasses =
  'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] active:scale-[0.98]'

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}

export const buttonDisabledClasses = 'cursor-not-allowed opacity-60'
