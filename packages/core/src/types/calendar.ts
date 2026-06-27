/**
 * Calendar mode
 */

import type { TigerLocale } from './locale'
export type CalendarMode = 'month' | 'year'

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

  /** Currently selected date (controlled) */
  value?: Date
  /** Calendar display mode */
  mode?: CalendarMode
  /** Whether the calendar is full-screen or card-style */
  fullscreen?: boolean
  /** Function that determines if a date is disabled */
  disabledDate?: (date: Date) => boolean
  /** Called when a date is selected */
  onChange?: (date: Date) => void
  /** Called when the visible panel (month/year) changes */
  onPanelChange?: (date: Date, mode: CalendarMode) => void
  /** Custom class name */
  className?: string
}
