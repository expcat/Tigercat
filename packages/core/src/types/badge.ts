/**
 * Badge component types
 */

/** Badge variant types */
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

/** Badge size types */
export type BadgeSize = 'sm' | 'md' | 'lg'

/** Badge display types */
export type BadgeType = 'dot' | 'number' | 'text'

/** Badge position types (for non-standalone mode) */
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

/** Base badge props interface */
export interface BadgeProps {
  /** Badge variant style @default 'danger' */
  variant?: BadgeVariant
  /** Badge size @default 'md' */
  size?: BadgeSize
  /** Badge display type @default 'number' */
  type?: BadgeType
  /**
   * Badge content (number or text).
   * Ignored when type='dot'.
   */
  content?: number | string
  /** Maximum count (type='number' only). Exceeds shows 'max+'. @default 99 */
  max?: number
  /** Whether to show zero count @default false */
  showZero?: boolean
  /** Badge position in non-standalone mode @default 'top-right' */
  position?: BadgePosition
  /** Standalone (inline) or wrapping children @default true */
  standalone?: boolean
  /** Additional CSS classes */
  className?: string
}
