/**
 * Calendar mode
 */

import type { TigerLocale } from './locale'
export type CalendarMode = 'month' | 'year'

/**
 * Shared Calendar props (framework-agnostic)
 */
export interface CalendarProps {
  /** Locale override merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>

  /** Calendar display mode */
  mode?: CalendarMode
  /** Whether the calendar is full-screen or card-style */
  fullscreen?: boolean
  /** Function that determines if a date is disabled */
  disabledDate?: (date: Date) => boolean
  /** Custom class name */
  className?: string
}
