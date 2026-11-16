/**
 * Space component types and interfaces
 */
import type { BaseLayoutProps } from './base'

/**
 * Space size types
 * Can be a preset size or a custom number (in pixels)
 */
export type SpaceSize = 'sm' | 'md' | 'lg' | number

/**
 * Base space props interface
 */
export interface SpaceProps extends Pick<BaseLayoutProps, 'orientation' | 'align' | 'wrap'> {
  /**
   * Space orientation
   * @default 'horizontal'
   */
  orientation?: BaseLayoutProps['orientation']

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
  align?: BaseLayoutProps['align']

  /**
   * Whether to wrap items
   * @default false
   */
  wrap?: BaseLayoutProps['wrap']

  /**
   * Vertical gap in pixels. When omitted, preset and numeric `size` both apply
   * on the two axes. A numeric `size` is the CSS `gap` shorthand:
   * `getSpaceStyle(40)` outputs `gap:40px`. This prop overrides only the row gap.
   */
  verticalSize?: number
}
