/**
 * InputGroup component types and interfaces
 * @since 0.9.0
 */

/**
 * InputGroup size types
 */
export type InputGroupSize = 'sm' | 'md' | 'lg'

/**
 * Base InputGroup props interface
 */
export interface InputGroupProps {
  /**
   * Size applied to all children in the group
   * @default 'md'
   */
  size?: InputGroupSize

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
