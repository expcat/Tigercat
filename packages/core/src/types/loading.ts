/**
 * Loading/Spinner component types and interfaces
 */

/**
 * Loading spinner variant types - different animation styles
 */
export type LoadingVariant = 'spinner' | 'dots' | 'bars' | 'ring' | 'pulse'

/**
 * Loading size types
 */
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Loading color variants
 */
export type LoadingColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default'

/**
 * Base loading props interface
 */
export interface LoadingProps {
  /**
   * Loading spinner variant - determines animation style
   * @default 'spinner'
   */
  variant?: LoadingVariant

  /**
   * Size of the loading indicator
   * @default 'md'
   */
  size?: LoadingSize

  /**
   * Color variant
   * @default 'primary'
   */
  color?: LoadingColor

  /**
   * Custom text to display below the spinner
   */
  text?: string

  /**
   * Whether to show loading as fullscreen overlay
   * @default false
   */
  fullscreen?: boolean

  /**
   * Delay before showing the loading indicator (ms)
   * Useful to prevent flashing on quick operations
   * @default 0
   */
  delay?: number

  /**
   * Custom background color (for fullscreen mode)
   * @default 'rgba(255, 255, 255, 0.9)'
   */
  background?: string

  /**
   * Custom spinner color (overrides color variant)
   */
  customColor?: string

  /**
   * Additional CSS classes
   */
  className?: string
}
