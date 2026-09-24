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
   * Visual lift on hover. Does not make the card a control; pass `onClick` or `href` for that.
   * @default false
   */
  hoverable?: boolean

  /**
   * Card layout orientation
   * @default 'vertical'
   */
  orientation?: BaseLayoutProps['orientation']

  /**
   * Visual header text. Slot / `header` node wins when both are set.
   * Native HTML tooltip is `htmlTitle`.
   */
  title?: string

  /**
   * Native HTML `title` tooltip. Not a visual header.
   */
  htmlTitle?: string

  /**
   * Cover image URL. Framework layers also accept a custom node / `#cover` slot.
   */
  cover?: string

  /**
   * Accessible name for a URL cover. Empty by default (decorative).
   * @default ''
   */
  coverAlt?: string

  /**
   * When set, the root is a link (`<a>` unless nested actions force a role).
   */
  href?: string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Heading level for the visible title. Defaults to 2 so the card does not take the page h1.
   * @default 2
   */
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6
}
