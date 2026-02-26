/**
 * InputNumber component types and interfaces
 */

import type { InputSize, InputStatus } from './input'

/**
 * InputNumber props interface
 */
export interface InputNumberProps {
  /**
   * Input size
   * @default 'md'
   */
  size?: InputSize

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
   * Position of step controls
   * @default 'right'
   */
  controlsPosition?: 'right' | 'both'

  /**
   * Format the display value
   */
  formatter?: (value: number | undefined) => string

  /**
   * Parse the displayed string back to number
   */
  parser?: (displayValue: string) => number

  /**
   * Whether to auto-focus on mount
   * @default false
   */
  autoFocus?: boolean
}
