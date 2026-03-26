/**
 * Stepper size variants
 */
export type StepperSize = 'sm' | 'md' | 'lg'

/**
 * Shared Stepper props (framework-agnostic)
 */
export interface StepperProps {
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Step increment */
  step?: number
  /** Whether the stepper is disabled */
  disabled?: boolean
  /** Component size */
  size?: StepperSize
  /** Precision (decimal places) */
  precision?: number
  /** Custom class name */
  className?: string
}
