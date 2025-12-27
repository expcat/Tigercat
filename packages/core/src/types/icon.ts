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
   * Uses Tailwind's text color classes or custom color value
   * @example 'text-blue-500' | 'currentColor'
   */
  color?: string
  
  /**
   * Additional CSS classes
   */
  className?: string
}
