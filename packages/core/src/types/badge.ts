/**
 * Badge component types and interfaces
 */

/**
 * Badge variant types
 */
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

/**
 * Badge size types
 */
export type BadgeSize = 'sm' | 'md' | 'lg'

/**
 * Badge display types
 */
export type BadgeType = 'dot' | 'number' | 'text'

/**
 * Badge position types (for positioning badge on wrapper)
 */
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

/**
 * Base badge props interface
 */
export interface BadgeProps {
  /**
   * Badge variant style
   * @default 'danger'
   */
  variant?: BadgeVariant

  /**
   * Badge size
   * @default 'md'
   */
  size?: BadgeSize

  /**
   * Badge display type
   * @default 'number'
   */
  type?: BadgeType

  /**
   * Badge content (number or text)
   * For type='number', this should be a number or string
   * For type='text', this should be a string
   * For type='dot', this prop is ignored
   */
  content?: number | string

  /**
   * Maximum count to display (only for type='number')
   * When content exceeds max, displays 'max+' (e.g., '99+')
   * @default 99
   */
  max?: number

  /**
   * Whether to show zero count
   * @default false
   */
  showZero?: boolean

  /**
   * Badge position when used as wrapper (standalone mode)
   * @default 'top-right'
   */
  position?: BadgePosition

  /**
   * Whether badge is standalone or wrapping content
   * When true, badge is displayed inline
   * When false, badge wraps children and positions badge absolutely
   * @default true
   */
  standalone?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}
