/** TimePicker shared types */
export type TimePickerSize = 'sm' | 'md' | 'lg'

export type TimeFormat = '12' | '24'

export type TimePickerSingleValue = string | null

export type TimePickerRangeValue = [string | null, string | null]

export type TimePickerModelValue = TimePickerSingleValue | TimePickerRangeValue

export interface TimePickerLabels {
  hour: string
  minute: string
  second: string
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

export interface TimePickerProps {
  /**
   * Locale used for UI labels (e.g. AM/PM) and display formatting.
   * Example: 'zh-CN', 'en-US'
   */
  locale?: string

  /**
   * UI labels for i18n.
   * When provided, merges with locale-based defaults.
   */
  labels?: Partial<TimePickerLabels>

  /**
   * TimePicker size
   * @default 'md'
   */
  size?: TimePickerSize

  /** Controlled value. Format: 'HH:mm' or 'HH:mm:ss' */
  value?: TimePickerModelValue

  /** Uncontrolled default value. Format: 'HH:mm' or 'HH:mm:ss' */
  defaultValue?: TimePickerModelValue

  /**
   * Enable range selection (start/end).
   * When true, value/defaultValue use a tuple: [start, end].
   * @default false
   */
  range?: boolean

  /**
   * Time format (12-hour or 24-hour)
   * @default '24'
   */
  format?: TimeFormat

  /**
   * Whether to show seconds
   * @default false
   */
  showSeconds?: boolean

  /**
   * Hour step
   * @default 1
   */
  hourStep?: number

  /**
   * Minute step
   * @default 1
   */
  minuteStep?: number

  /**
   * Second step
   * @default 1
   */
  secondStep?: number

  /**
   * Placeholder text
   * @default 'Select time'
   */
  placeholder?: string

  /**
   * Whether the timepicker is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the timepicker is readonly
   * @default false
   */
  readonly?: boolean

  /**
   * Whether the timepicker is required
   * @default false
   */
  required?: boolean

  /**
   * Minimum selectable time (HH:mm format)
   */
  minTime?: string | null

  /**
   * Maximum selectable time (HH:mm format)
   */
  maxTime?: string | null

  /**
   * Whether to show the clear button
   * @default true
   */
  clearable?: boolean

  /**
   * Input name attribute
   */
  name?: string

  /**
   * Input id attribute
   */
  id?: string
}
