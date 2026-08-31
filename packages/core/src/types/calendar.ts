/**
 * Calendar mode
 */

import type { TigerLocale } from './locale'

export type CalendarMode = 'month' | 'year'

/** First column of the week. 0 = Sunday … 6 = Saturday. */
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Shared Calendar props (framework-agnostic single source of truth).
 *
 * React extends this directly (`value` + `onChange`/`onPanelChange` callbacks);
 * Vue binds the selected date with `v-model` (`modelValue`) and the same events
 * as emits, so it reuses everything here except `value`/callbacks.
 */
export interface CalendarProps {
  /** Locale override merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Currently selected date (controlled). Invalid Date is treated as empty. */
  value?: Date | string | null
  /** Initial selected date when `value` is omitted */
  defaultValue?: Date | string | null
  /**
   * Calendar display mode.
   * @default 'month'
   */
  mode?: CalendarMode
  /**
   * Initial mode when `mode` is omitted.
   * @default 'month'
   */
  defaultMode?: CalendarMode
  /** Whether the calendar is full-screen or card-style */
  fullscreen?: boolean
  /** Function that determines if a date is disabled */
  disabledDate?: (date: Date) => boolean
  /**
   * First column of the week. Defaults to the locale week start
   * (en-US Sunday, zh/de Monday, ar-SA Saturday).
   */
  weekStartsOn?: WeekStartsOn
  /**
   * Clock snapshot for “today” and the default panel month.
   * Omit on the client to use the wall clock after mount; omit during SSR
   * so the first HTML does not paint a today highlight.
   */
  now?: Date
  /**
   * Range highlight used by DatePicker. Calendar still emits one clicked date.
   */
  rangeValue?: [Date | null, Date | null]
  /** Called when a date is selected */
  onChange?: (date: Date) => void
  /**
   * Called when the visible panel (month/year) changes.
   * The `mode` argument is the mode that will be drawn next.
   */
  onPanelChange?: (date: Date, mode: CalendarMode) => void
  /** Custom class name */
  className?: string
}
