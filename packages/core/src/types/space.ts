/**
 * Space component types and interfaces
 */

/**
 * Space direction types
 */
export type SpaceDirection = 'horizontal' | 'vertical'

/**
 * Space size types
 * Can be a preset size or a custom number (in pixels)
 */
export type SpaceSize = 'sm' | 'md' | 'lg' | number

/**
 * Space align types
 */
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch'

/**
 * Base space props interface
 */
export interface SpaceProps {
  /**
   * Space direction
   * @default 'horizontal'
   */
  direction?: SpaceDirection

  /**
   * Space size between items
   * Can be a preset size ('sm' | 'md' | 'lg') or a custom number (in pixels)
   * @default 'md'
   */
  size?: SpaceSize

  /**
   * Align items in the space
   * @default 'start'
   */
  align?: SpaceAlign

  /**
   * Whether to wrap items
   * @default false
   */
  wrap?: boolean
}
