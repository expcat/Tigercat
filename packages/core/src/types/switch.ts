/**
 * Switch component types and interfaces
 */

import type { ComponentSize } from './base'

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
  size?: ComponentSize
}
