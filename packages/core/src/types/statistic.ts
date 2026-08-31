import type { ComponentSize } from './base'
import type { TigerLocale } from './locale'

/**
 * Shared Statistic props (framework-agnostic)
 */
export interface StatisticProps {
  /**
   * Title / label of the metric. Not the native HTML tooltip.
   */
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
  /** Locale override merged on top of ConfigProvider locale. */
  locale?: Partial<TigerLocale>
  /** Custom class name */
  className?: string
}
