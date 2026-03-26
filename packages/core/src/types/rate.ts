/**
 * Rate size variants
 */
export type RateSize = 'sm' | 'md' | 'lg'

/**
 * Shared Rate props (framework-agnostic)
 */
export interface RateProps {
  /** Number of stars */
  count?: number
  /** Whether to allow half stars */
  allowHalf?: boolean
  /** Whether the component is disabled / read-only */
  disabled?: boolean
  /** Component size */
  size?: RateSize
  /** Whether to allow clearing by clicking the same value */
  allowClear?: boolean
  /** Custom class name */
  className?: string
  /** Character to use (text or emoji) — renders text instead of star icon */
  character?: string
}
