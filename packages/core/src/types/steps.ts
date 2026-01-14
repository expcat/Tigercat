/**
 * Steps component types and interfaces
 */

/**
 * Steps direction/orientation types
 */
export type StepsDirection = 'horizontal' | 'vertical'

/**
 * Step status types
 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error'

/**
 * Step size types
 */
export type StepSize = 'small' | 'default'

/**
 * Step item interface
 */
export interface StepItem {
  /**
   * Unique key for the step item
   */
  key?: string | number
  /**
   * Step title
   */
  title: string
  /**
   * Step description
   */
  description?: string
  /**
   * Step icon (custom icon element)
   */
  icon?: unknown
  /**
   * Step status (overrides automatic status)
   */
  status?: StepStatus
  /**
   * Whether the step is disabled
   */
  disabled?: boolean
  /**
   * Custom data
   */
  [key: string]: unknown
}

/**
 * Base steps props interface
 */
export interface StepsProps {
  /**
   * Current step index (0-based)
   * @default 0
   */
  current?: number
  /**
   * Step status (for current step)
   * @default 'process'
   */
  status?: StepStatus
  /**
   * Steps direction/orientation
   * @default 'horizontal'
   */
  direction?: StepsDirection
  /**
   * Step size
   * @default 'default'
   */
  size?: StepSize
  /**
   * Whether to use simple style (no description, smaller icons)
   * @default false
   */
  simple?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Additional styles
   */
  style?: Record<string, unknown>
}
