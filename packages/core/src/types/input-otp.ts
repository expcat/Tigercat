/**
 * InputOTP component types and interfaces
 * @since 2.1.0
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'

/**
 * Allowed character set for InputOTP slots
 */
export type InputOTPType = 'numeric' | 'alphanumeric'

/**
 * Base InputOTP props interface
 */
export interface InputOTPProps {
  /**
   * Input size
   * @default 'md'
   */
  size?: ComponentSize

  /**
   * Validation status
   * @default 'default'
   */
  status?: InputStatus

  /**
   * Error message to display
   */
  errorMessage?: string

  /**
   * Number of character slots
   * @default 6
   */
  length?: number

  /**
   * Value (for controlled mode) — the joined characters, at most `length` long
   */
  value?: string

  /**
   * Default value (for uncontrolled mode)
   * @default ''
   */
  defaultValue?: string

  /**
   * Allowed character set; drives per-character filtering and `inputmode`
   * @default 'numeric'
   */
  type?: InputOTPType

  /**
   * Per-character validation regex; overrides `type` filtering when provided
   */
  pattern?: RegExp

  /**
   * Hide entered characters — each filled slot renders `maskChar` instead
   * @default false
   */
  masked?: boolean

  /**
   * Character shown per filled slot when `masked` is enabled
   * @default '•'
   */
  maskChar?: string

  /**
   * Visual slot grouping, e.g. `[3, 3]`; ignored (with a dev warning) unless
   * the group sizes sum to `length`
   */
  groups?: number[]

  /**
   * Separator string rendered between groups
   * @default '-'
   */
  separator?: string

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the input is readonly
   * @default false
   */
  readonly?: boolean

  /**
   * Whether to autofocus the first empty slot on mount
   * @default false
   */
  autoFocus?: boolean

  /**
   * Name for the hidden input carrying the joined value (form submission)
   */
  name?: string

  /**
   * Id attribute applied to the group element
   */
  id?: string

  /**
   * Accessible label for the slot group; overrides the locale `inputOtp.groupLabel`
   */
  ariaLabel?: string
}
