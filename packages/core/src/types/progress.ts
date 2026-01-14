/**
 * Progress component types and interfaces
 */

/**
 * Progress variant types
 */
export type ProgressVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

/**
 * Progress size types
 */
export type ProgressSize = 'sm' | 'md' | 'lg'

/**
 * Progress type (shape)
 */
export type ProgressType = 'line' | 'circle'

/**
 * Progress status types
 */
export type ProgressStatus = 'normal' | 'success' | 'exception' | 'paused'

/**
 * Base progress props interface
 */
export interface ProgressProps {
  /**
   * Progress variant style
   * @default 'primary'
   */
  variant?: ProgressVariant

  /**
   * Progress size
   * @default 'md'
   */
  size?: ProgressSize

  /**
   * Progress type (shape)
   * @default 'line'
   */
  type?: ProgressType

  /**
   * Current progress percentage (0-100)
   * @default 0
   */
  percentage?: number

  /**
   * Progress status
   * When set, overrides variant color
   * @default 'normal'
   */
  status?: ProgressStatus

  /**
   * Whether to show progress text inside the progress bar
   * @default true for line, false for circle
   */
  showText?: boolean

  /**
   * Custom text to display instead of percentage
   */
  text?: string

  /**
   * Format function for custom text
   */
  format?: (percentage: number) => string

  /**
   * Whether to show striped animation
   * Only applicable for line type
   * @default false
   */
  striped?: boolean

  /**
   * Whether the striped animation should be animated
   * Only applicable when striped is true
   * @default false
   */
  stripedAnimation?: boolean

  /**
   * Stroke width for circle type (in pixels)
   * @default 6
   */
  strokeWidth?: number

  /**
   * Width of the progress bar for line type
   * Auto for responsive, or specific value
   * @default 'auto'
   */
  width?: string | number

  /**
   * Height of the progress bar for line type (in pixels)
   * If not specified, uses size-based height
   */
  height?: number

  /**
   * Additional CSS classes
   */
  className?: string
}
