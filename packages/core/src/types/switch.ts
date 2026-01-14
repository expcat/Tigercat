/**
 * Switch component types and interfaces
 */

/**
 * Switch size types
 */
export type SwitchSize = 'sm' | 'md' | 'lg'

/**
 * Base switch props interface
 */
export interface SwitchProps {
  /**
   * Whether the switch is checked
   * @default false
   */
  checked?: boolean

  /**
   * Whether the switch is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Switch size
   * @default 'md'
   */
  size?: SwitchSize
}
