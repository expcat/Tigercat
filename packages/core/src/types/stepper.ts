import type { ComponentSize } from './base'
import type { InputStatus } from './input'

/**
 * Shared Stepper props (framework-agnostic)
 */
export interface StepperProps {
  /** Controlled value */
  value?: number
  /** Uncontrolled initial value */
  defaultValue?: number
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
   * Whether the stepper is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Component size
   * @default 'md'
   */
  size?: ComponentSize
  /** Precision (decimal places) */
  precision?: number
  /** Accessible label for the increment button */
  incrementAriaLabel?: string
  /** Accessible label for the decrement button */
  decrementAriaLabel?: string
  /** Validation status */
  status?: InputStatus
  /** Custom class name */
  className?: string
}
