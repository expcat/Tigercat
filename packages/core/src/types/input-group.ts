/**
 * InputGroup component types and interfaces
 * @since 0.9.0
 */

import type { ComponentSize } from './base'

/**
 * Base InputGroup props interface
 */
export interface InputGroupProps {
  /**
   * Size applied to all children in the group
   * @default 'md'
   */
  size?: ComponentSize

  /**
   * Whether to use compact mode (merged borders)
   * @default false
   */
  compact?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * InputGroup addon props interface
 */
export interface InputGroupAddonProps {
  /**
   * Addon type
   * @default 'text'
   */
  type?: 'text' | 'icon'

  /**
   * Additional CSS classes
   */
  className?: string
}
