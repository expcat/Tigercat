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
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
}

export const buttonDisabledClasses = 'cursor-not-allowed opacity-60'

/**
 * Danger mode color overrides per variant.
 * Applied when `danger` prop is true, overriding the variant's default colors.
 * @since 0.5.0
 */
export const buttonDangerClasses: Record<string, string> = {
  primary:
    'bg-[var(--tiger-error,#dc2626)] hover:bg-[var(--tiger-error-hover,#b91c1c)] text-white focus:ring-[var(--tiger-error,#dc2626)] disabled:bg-[var(--tiger-error-disabled,#fca5a5)]',
  secondary:
    'bg-[var(--tiger-error,#dc2626)] hover:bg-[var(--tiger-error-hover,#b91c1c)] text-white focus:ring-[var(--tiger-error,#dc2626)] disabled:bg-[var(--tiger-error-disabled,#fca5a5)]',
  outline:
    'bg-transparent hover:bg-[var(--tiger-error-bg-hover,#fef2f2)] text-[var(--tiger-error,#dc2626)] border-2 border-[var(--tiger-error,#dc2626)] focus:ring-[var(--tiger-error,#dc2626)] disabled:border-[var(--tiger-error-disabled,#fca5a5)] disabled:text-[var(--tiger-error-disabled,#fca5a5)]',
  ghost:
    'bg-transparent hover:bg-[var(--tiger-error-bg-hover,#fef2f2)] text-[var(--tiger-error,#dc2626)] focus:ring-[var(--tiger-error,#dc2626)] disabled:text-[var(--tiger-error-disabled,#fca5a5)]',
  link: 'bg-transparent hover:underline text-[var(--tiger-error,#dc2626)] focus:ring-[var(--tiger-error,#dc2626)] disabled:text-[var(--tiger-error-disabled,#fca5a5)]'
}

/**
 * ButtonGroup base classes
 * @since 0.5.0
 */
export const buttonGroupBaseClasses = 'inline-flex'

export const buttonGroupVerticalClasses = 'flex-col'

export const buttonGroupHorizontalClasses = 'flex-row'

/**
 * Classes to merge adjacent button borders in a horizontal group
 */
export const buttonGroupItemClasses =
  '[&:not(:first-child):not(:last-child)]:rounded-none [&:first-child]:rounded-r-none [&:last-child]:rounded-l-none [&:not(:first-child)]:-ml-px'

/**
 * Classes to merge adjacent button borders in a vertical group
 */
export const buttonGroupItemVerticalClasses =
  '[&:not(:first-child):not(:last-child)]:rounded-none [&:first-child]:rounded-b-none [&:last-child]:rounded-t-none [&:not(:first-child)]:-mt-px'
