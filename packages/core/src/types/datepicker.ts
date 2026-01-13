/**
 * DatePicker component types and interfaces
 */

export type DatePickerInputDate = Date | string;

export type DatePickerSingleModelValue = DatePickerInputDate | null;

export type DatePickerRangeModelValue = [
  DatePickerInputDate | null,
  DatePickerInputDate | null
];

export type DatePickerModelValue =
  | DatePickerSingleModelValue
  | DatePickerRangeModelValue;

export type DatePickerSingleValue = Date | null;

export type DatePickerRangeValue = [Date | null, Date | null];

export interface DatePickerLabels {
  today: string;
  ok: string;
  calendar: string;
  toggleCalendar: string;
  clearDate: string;
  previousMonth: string;
  nextMonth: string;
}

/**
 * DatePicker size types
 */
export type DatePickerSize = "sm" | "md" | "lg";

/**
 * Date format types
 */
export type DateFormat =
  | "yyyy-MM-dd"
  | "MM/dd/yyyy"
  | "dd/MM/yyyy"
  | "yyyy/MM/dd";

/**
 * Base DatePicker props interface
 */
export interface DatePickerProps {
  /**
   * Locale used for month/day names in the calendar UI.
   * Example: 'zh-CN', 'en-US'
   */
  locale?: string;

  /**
   * UI labels for i18n.
   * When provided, merges with locale-based defaults.
   */
  labels?: Partial<DatePickerLabels>;

  /**
   * DatePicker size
   * @default 'md'
   */
  size?: DatePickerSize;

  /**
   * Selected date value (for controlled mode)
   */
  value?: DatePickerModelValue | null;

  /**
   * Default date value (for uncontrolled mode)
   */
  defaultValue?: DatePickerModelValue | null;

  /**
   * Enable range selection (start/end).
   * When true, value/defaultValue use a tuple: [start, end].
   * @default false
   */
  range?: boolean;

  /**
   * Date format string
   * @default 'yyyy-MM-dd'
   */
  format?: DateFormat;

  /**
   * Placeholder text
   * @default 'Select date'
   */
  placeholder?: string;

  /**
   * Whether the datepicker is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the datepicker is readonly
   * @default false
   */
  readonly?: boolean;

  /**
   * Whether the datepicker is required
   * @default false
   */
  required?: boolean;

  /**
   * Minimum selectable date
   */
  minDate?: DatePickerInputDate | null;

  /**
   * Maximum selectable date
   */
  maxDate?: DatePickerInputDate | null;

  /**
   * Whether to show the clear button
   * @default true
   */
  clearable?: boolean;

  /**
   * Input name attribute
   */
  name?: string;

  /**
   * Input id attribute
   */
  id?: string;
}
