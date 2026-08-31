/** TimePicker shared types */
import type { ComponentSize } from './base'
import type { InputStatus } from './input'
import type { FloatingPlacement } from '../utils/floating'
import type { TigerLocale } from './locale'

export type TimeFormat = '12' | '24'

export type TimePickerRangeTuple = [string | null, string | null]

export type TimePickerModelValue = string | null | TimePickerRangeTuple

export interface TimePickerLabels {
  hour: string
  minute: string
  second: string
  period: string
  now: string
  ok: string
  start: string
  end: string
  clear: string
  toggle: string
  dialog: string
  selectTime: string
  selectTimeRange: string
}

/**
 * Shared TimePicker props. React adds `value`/`onChange`; Vue binds
 * `modelValue` / `update:modelValue` and `open` / `update:open`.
 *
 * The stored value is always 24-hour `'HH:mm'` or `'HH:mm:ss'` (`showSeconds`).
 * `format` is display and typed parse only — it is never written back to `value`.
 * Empty single is `null`. Empty range is `null`. A complete range is `[start, end]`.
 * `name` submits the formatted display string.
 *
 * Column clicks edit a panel draft. Footer OK commits the draft and closes.
 * Escape / outside dismiss drops the draft. `Now` commits the clock time.
 */
export interface TimePickerProps {
  /** Locale object merged on top of ConfigProvider. Do not pass a language id string. */
  locale?: Partial<TigerLocale>
  labels?: Partial<TimePickerLabels>
  /**
   * @default 'md'
   */
  size?: ComponentSize
  value?: TimePickerModelValue | null
  defaultValue?: TimePickerModelValue | null
  /**
   * @default false
   */
  range?: boolean
  /**
   * Display / typed-parse clock. Stored value stays 24-hour.
   * @default '24'
   */
  format?: TimeFormat
  /**
   * @default false
   */
  showSeconds?: boolean
  /**
   * @default 1
   */
  hourStep?: number
  /**
   * @default 1
   */
  minuteStep?: number
  /**
   * @default 1
   */
  secondStep?: number
  placeholder?: string
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * When true, the field cannot be typed and the panel cannot open.
   * @default false
   */
  readonly?: boolean
  /**
   * @default false
   */
  required?: boolean
  minTime?: string | null
  maxTime?: string | null
  disabledTime?: (time: string) => boolean
  now?: Date
  /**
   * @default true
   */
  clearable?: boolean
  name?: string
  id?: string
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
  onChange?: (value: string | null | TimePickerRangeTuple) => void
  onClear?: () => void
  onOpenChange?: (open: boolean) => void
  className?: string
}
