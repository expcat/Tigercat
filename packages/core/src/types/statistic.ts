import type { ComponentSize } from './base'

/**
 * Shared Statistic props (framework-agnostic)
 */
export interface StatisticProps {
  /** Title / label text */
  title?: string
  /** The numeric or text value */
  value?: string | number
  /** Precision (decimal places) for numeric values */
  precision?: number
  /** Prefix text or symbol before the value */
  prefix?: string
  /** Suffix text or symbol after the value */
  suffix?: string
  /** Whether to show grouping separator (e.g. 1,000) */
  groupSeparator?: boolean
  /** Whether to animate numeric values */
  animated?: boolean
  /** Numeric animation duration in milliseconds */
  animationDuration?: number
  /** Component size */
  size?: ComponentSize
  /** Custom class name */
  className?: string
}
