/**
 * Badge component types
 */

import type { TigerLocale } from './locale'

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
  /** Locale override merged on top of ConfigProvider locale. */
  locale?: Partial<TigerLocale>
  /** Badge variant style @default 'danger' */
  variant?: BadgeVariant
  /** Badge size @default 'md' */
  size?: BadgeSize
  /** Badge display type @default 'number' */
  type?: BadgeType
  /**
   * Badge content (number or text).
   * Ignored when type='dot'. Empty number/text badges do not render.
   */
  content?: number | string
  /**
   * Maximum count (`type='number'` only). Exceeds shows 'max+'.
   * Text badges are never capped.
   * @default 99
   */
  max?: number
  /**
   * Whether to show a number badge whose value is `0` or `'0'`.
   * @default false
   */
  showZero?: boolean
  /**
   * Overlay position. `right`/`left` follow the reading direction.
   * @default 'top-right'
   */
  position?: BadgePosition
  /**
   * Standalone (inline) or wrapping children. Overlay requires `standalone={false}`.
   * @default true
   */
  standalone?: boolean
  /** Additional CSS classes */
  className?: string
}
