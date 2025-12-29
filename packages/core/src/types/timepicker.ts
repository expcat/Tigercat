/**
 * TimePicker component types and interfaces
 */

/**
 * TimePicker size types
 */
export type TimePickerSize = 'sm' | 'md' | 'lg'

/**
 * Time format types
 */
export type TimeFormat = '12' | '24'

/**
 * Base TimePicker props interface
 */
export interface TimePickerProps {
  /**
   * TimePicker size
   * @default 'md'
   */
  size?: TimePickerSize
  
  /**
   * Selected time value (for controlled mode)
   * Format: 'HH:mm' or 'HH:mm:ss'
   */
  value?: string | null
  
  /**
   * Default time value (for uncontrolled mode)
   * Format: 'HH:mm' or 'HH:mm:ss'
   */
  defaultValue?: string | null
  
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
