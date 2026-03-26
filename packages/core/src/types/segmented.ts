/**
 * Segmented size variants
 */
export type SegmentedSize = 'sm' | 'md' | 'lg'

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
  size?: SegmentedSize
  /** Whether the control fills full width */
  block?: boolean
  /** Custom class name */
  className?: string
}
