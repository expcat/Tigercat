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
  /** Whether the component is disabled */
  disabled?: boolean
  /**
   * Read-only: stays in tab order and exposes the value, but does not change it.
   * @default false
   */
  readOnly?: boolean
  /**
   * Component size
   * @default 'md'
   */
  size?: RateSize
  /**
   * Whether to allow clearing by clicking the same value
   * @default true
   */
  allowClear?: boolean
  /** Custom class name */
  className?: string
  /** Character to use (text or emoji) — renders text instead of star icon */
  character?: string
}
