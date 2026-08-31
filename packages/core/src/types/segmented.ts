import type { ComponentSize } from './base'

/**
 * Segmented option
 */
export interface SegmentedOption {
  /** Option value */
  value: string | number
  /** Display label */
  label: string
  /** Whether the option is disabled */
  disabled?: boolean
  /** Optional icon (SVG path d) */
  icon?: string
}

/**
 * Shared Segmented props (framework-agnostic)
 */
export interface SegmentedProps {
  /** Available options */
  options?: SegmentedOption[]
  /** Whether the whole control is disabled */
  disabled?: boolean
  /** Component size */
  size?: ComponentSize
  /**
   * Whether the control fills full width
   * @default false
   */
  block?: boolean
  /** Native form name. Writes a hidden input with the selected value. */
  name?: string
  /** Custom class name */
  className?: string
}
