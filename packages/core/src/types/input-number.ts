/**
 * InputNumber component types and interfaces
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'

/**
 * InputNumber props interface
 */
export interface InputNumberProps {
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
   * Current value (controlled mode)
   */
  value?: number | null

  /**
   * Default value (uncontrolled mode)
   */
  defaultValue?: number | null

  /**
   * Minimum value
   * @default -Infinity
   */
  min?: number

  /**
   * Maximum value
   * @default Infinity
   */
  max?: number

  /**
   * Step increment
   * @default 1
   */
  step?: number

  /**
   * Number of decimal places
   */
  precision?: number

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the input is read-only
   * @default false
   */
  readonly?: boolean

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Input name attribute
   */
  name?: string

  /**
   * Input id attribute
   */
  id?: string

  /**
   * Whether to enable keyboard up/down arrow stepping
   * @default true
   */
  keyboard?: boolean

  /**
   * Whether to show +/- step buttons
   * @default true
   */
  controls?: boolean

  /**
   * Position of step controls. `'right'` is the inline-end stack (trailing side).
   * @default 'right'
   */
  controlsPosition?: 'right' | 'both'

  /**
   * Format the display value (applied when the field is not focused)
   */
  formatter?: (value: number | undefined) => string

  /**
   * Parse the displayed string back to number. Return `null` for empty/invalid.
   */
  parser?: (displayValue: string) => number | null

  /**
   * Whether to auto-focus on mount
   * @default false
   */
  autoFocus?: boolean

  /**
   * Accessible label for the increment button
   * @default 'Increase'
   */
  incrementAriaLabel?: string

  /**
   * Accessible label for the decrement button
   * @default 'Decrease'
   */
  decrementAriaLabel?: string
}
