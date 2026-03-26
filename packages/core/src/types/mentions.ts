/**
 * Mentions size options
 */
export type MentionsSize = 'sm' | 'md' | 'lg'

/**
 * A single mention option
 */
export interface MentionOption {
  /** Unique value / key */
  value: string
  /** Display label */
  label: string
  /** Whether this option is disabled */
  disabled?: boolean
}

/**
 * Shared Mentions props (framework-agnostic)
 */
export interface MentionsProps {
  /** Trigger character */
  prefix?: string
  /** Available mention options */
  options?: MentionOption[]
  /** Placeholder text */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: MentionsSize
  /** Number of visible rows */
  rows?: number
  /** Custom class name */
  className?: string
}
