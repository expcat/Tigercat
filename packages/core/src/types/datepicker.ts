/**
 * DatePicker component types and interfaces
 */

/**
 * DatePicker size types
 */
export type DatePickerSize = 'sm' | 'md' | 'lg'

/**
 * Date format types
 */
export type DateFormat = 'yyyy-MM-dd' | 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy/MM/dd'

/**
 * Base DatePicker props interface
 */
export interface DatePickerProps {
  /**
   * DatePicker size
   * @default 'md'
   */
  size?: DatePickerSize
  
  /**
   * Selected date value (for controlled mode)
   */
  value?: Date | string | null
  
  /**
   * Default date value (for uncontrolled mode)
   */
  defaultValue?: Date | string | null
  
  /**
   * Date format string
   * @default 'yyyy-MM-dd'
   */
  format?: DateFormat
  
  /**
   * Placeholder text
   * @default 'Select date'
   */
  placeholder?: string
  
  /**
   * Whether the datepicker is disabled
   * @default false
   */
  disabled?: boolean
  
  /**
   * Whether the datepicker is readonly
   * @default false
   */
  readonly?: boolean
  
  /**
   * Whether the datepicker is required
   * @default false
   */
  required?: boolean
  
  /**
   * Minimum selectable date
   */
  minDate?: Date | string | null
  
  /**
   * Maximum selectable date
   */
  maxDate?: Date | string | null
  
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
