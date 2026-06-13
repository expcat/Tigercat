/**
 * Icon component types and interfaces
 */

import type { IconName } from '../utils/icons/registry'

/**
 * Icon size types
 */
export type IconSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Base icon props interface
 */
export interface IconProps {
  /**
   * Built-in icon name. When provided (and no custom SVG children are given),
   * the component renders the matching glyph from the built-in icon set.
   * Custom children always take precedence for backward compatibility.
   */
  name?: IconName

  /**
   * Icon size
   * @default 'md'
   */
  size?: IconSize

  /**
   * Icon color
   * Uses CSS color value
   * @example '#2563eb' | 'currentColor'
   */
  color?: string

  /**
   * Additional CSS classes
   */
  className?: string
}
