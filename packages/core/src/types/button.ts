/**
 * Button component types and interfaces
 */

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'

/**
 * Button size types
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Base button props interface
 */
export interface ButtonProps {
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: ButtonVariant
  
  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean
  
  /**
   * Whether the button is in loading state
   * @default false
   */
  loading?: boolean
}
