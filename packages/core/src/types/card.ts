/**
 * Card component types and interfaces
 */
import type { BaseLayoutProps } from './base'

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'bordered' | 'shadow' | 'elevated' | 'transparent'

/**
 * Card size types
 */
export type CardSize = 'sm' | 'md' | 'lg'

/**
 * Base card props interface
 */
export interface CardProps {
  /**
   * Card variant style
   * @default 'default'
   */
  variant?: CardVariant

  /**
   * Card size (affects padding)
   * @default 'md'
   */
  size?: CardSize

  /**
   * Padding override for the card content sections. Takes precedence over the
   * `size`-derived padding.
   * - `false` removes the built-in padding entirely.
   * - a string supplies a custom padding utility class (e.g. `'p-8'`).
   * - omitted / `true` keeps the default `size`-based padding.
   */
  padding?: boolean | string

  /**
   * Whether the card is hoverable (shows hover effect)
   * @default false
   */
  hoverable?: boolean

  /**
   * Card layout direction
   * @default 'vertical'
   */
  direction?: BaseLayoutProps['direction']

  /**
   * Additional CSS classes
   */
  className?: string
}
