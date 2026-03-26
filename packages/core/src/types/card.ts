/**
 * Card component types and interfaces
 */

/**
 * Card variant types
 */
export type CardVariant = 'default' | 'bordered' | 'shadow' | 'elevated'

/**
 * Card size types
 */
export type CardSize = 'sm' | 'md' | 'lg'

/**
 * Card layout direction
 */
export type CardDirection = 'vertical' | 'horizontal'

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
   * Whether the card is hoverable (shows hover effect)
   * @default false
   */
  hoverable?: boolean

  /**
   * Card layout direction
   * @default 'vertical'
   */
  direction?: CardDirection

  /**
   * Additional CSS classes
   */
  className?: string
}
