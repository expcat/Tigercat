/**
 * Steps component types and interfaces
 */

import type { ComponentSize } from './base'

/**
 * Steps direction/orientation types
 */
export type StepsDirection = 'horizontal' | 'vertical'

/**
 * Step status types
 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error'

/**
 * Step size. Same tokens as {@link ComponentSize}.
 */
export type StepSize = ComponentSize

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
   * Steps direction/orientation.
   * Vertical/horizontal connector geometry ships via the Tailwind plugin
   * (`.tiger-step-tail*`); load `@plugin "@expcat/tigercat-core/tailwind"`.
   * @default 'horizontal'
   */
  direction?: StepsDirection
  /**
   * Step size
   * @default 'md'
   */
  size?: StepSize
  /**
   * Whether to use simple style (no description, smaller icons)
   * @default false
   */
  simple?: boolean
  /**
   * Whether steps are clickable for navigation
   * @default false
   * @since 0.9.0
   */
  clickable?: boolean
  /**
   * Data-driven items. When set, `StepsItem` children are optional.
   */
  items?: StepItem[]
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Additional styles
   */
  style?: Record<string, unknown>
}
