/**
 * Icon component types and interfaces
 */

/**
 * Icon size types
 */
export type IconSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Base icon props interface
 */
export interface IconProps {
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
