/**
 * DatePicker component types and interfaces
 */

import type { ComponentSize } from './base'
import type { WeekStartsOn } from './calendar'
import type { InputStatus } from './input'
import type { FloatingPlacement } from '../utils/floating'
import type { TigerLocale } from './locale'

export type DatePickerInputDate = Date | string

export type DatePickerModelValue =
  DatePickerInputDate | null | [DatePickerInputDate | null, DatePickerInputDate | null]

export interface DatePickerLabels {
  placeholder: string
  rangePlaceholder: string
  today: string
  ok: string
  calendar: string
  toggleCalendar: string
  clearDate: string
  previousMonth: string
  nextMonth: string
  year: string
  month: string
  day: string
  start: string
  end: string
}

export interface DatePickerLocalePreset {
  locale: string
  labels: Partial<DatePickerLabels>
}

export interface DatePickerLocaleConfig {
  datePicker?: Partial<DatePickerLocalePreset>
}

export type DateFormat = 'yyyy-MM-dd' | 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy/MM/dd'

export interface DatePickerShortcut {
  label: string
  value: DatePickerModelValue | (() => DatePickerModelValue)
}

/**
 * Shared DatePicker props. React adds `value`/`onChange`; Vue binds
 * `modelValue` / `update:modelValue` and `open` / `update:open`.
 *
 * Dates are calendar days (local midnight). A UTC-midnight `Date` such as
 * `new Date('2024-01-15')` is that calendar day in every timezone.
 * `format` is the input display and typed parse. Display may use a locale
 * calendar and digits; `name` submits one Gregorian `YYYY-MM-DD`
 * (a range uses `start|end`). Empty submits `''`.
 * Empty range is `null`. A partial range is a `[start, end]` tuple.
 */
export interface DatePickerProps {
  /** Locale object merged on top of ConfigProvider. Do not pass a language id string. */
  locale?: Partial<TigerLocale>
  labels?: Partial<DatePickerLabels>
  /**
   * @default 'md'
   */
  size?: ComponentSize
  value?: DatePickerModelValue | null
  defaultValue?: DatePickerModelValue | null
  /**
   * @default false
   */
  range?: boolean
  /**
   * @default 'yyyy-MM-dd'
   */
  format?: DateFormat
  placeholder?: string
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * When true, the field can focus and submit but cannot change or open to edit.
   * @default false
   */
  readOnly?: boolean
  /**
   * @default false
   */
  required?: boolean
  minDate?: DatePickerInputDate | null
  maxDate?: DatePickerInputDate | null
  disabledDate?: (date: Date) => boolean
  weekStartsOn?: WeekStartsOn
  now?: Date
  /**
   * @default true
   */
  clearable?: boolean
  name?: string
  id?: string
  shortcuts?: DatePickerShortcut[]
  open?: boolean
  /**
   * @default false
   */
  defaultOpen?: boolean
  status?: InputStatus
  /**
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement
  /**
   * @default 4
   */
  offset?: number
  dropdownClassName?: string
  getPopupContainer?: () => HTMLElement | null
  onChange?: (value: Date | null | [Date | null, Date | null]) => void
  onClear?: () => void
  onOpenChange?: (open: boolean) => void
  className?: string
}
