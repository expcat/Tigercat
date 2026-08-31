/**
 * Switch component types and interfaces
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'

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
   * Default checked state (uncontrolled mode)
   * @default false
   */
  defaultChecked?: boolean

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

  /**
   * Native form name (hidden checkbox)
   */
  name?: string

  /**
   * Native form value when checked
   * @default 'on'
   */
  value?: string

  /**
   * Validation status
   * @default 'default'
   */
  status?: InputStatus
}
