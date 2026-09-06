/**
 * Icon component types and interfaces
 */

import type { IconDefinition, IconName } from '../utils/icons/registry'

/**
 * Icon size types
 */
export type IconSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Base icon props interface
 */
export interface IconProps {
  /**
   * Built-in or app-registered icon name (`registerIcon` on the icons/registry
   * subpath). When provided (and no custom SVG children are given), the
   * component renders the matching glyph. Custom children always take
   * precedence.
   */
  name?: IconName | (string & {})

  /**
   * Custom icon definition (viewBox + path data), e.g. an application logo.
   * Define it once as a constant and reuse it anywhere without registering a
   * global name. Takes precedence over `name`; custom SVG children take
   * precedence over both.
   */
  icon?: IconDefinition

  /**
   * Icon size
   * @default 'md'
   */
  size?: IconSize

  /**
   * Icon color written onto the wrapper. Omitted values inherit CSS `color`
   * (including `style.color`). An explicit `color` wins over `style.color`.
   * @example '#2563eb' | 'currentColor'
   */
  color?: string

  /**
   * Additional CSS classes
   */
  className?: string
}
