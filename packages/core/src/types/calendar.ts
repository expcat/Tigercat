/**
 * Calendar mode
 */
export type CalendarMode = 'month' | 'year'

/**
 * Shared Calendar props (framework-agnostic)
 */
export interface CalendarProps {
  /** Calendar display mode */
  mode?: CalendarMode
  /** Whether the calendar is full-screen or card-style */
  fullscreen?: boolean
  /** Function that determines if a date is disabled */
  disabledDate?: (date: Date) => boolean
  /** Custom class name */
  className?: string
}
