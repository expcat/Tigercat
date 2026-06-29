import type React from 'react'
import type {
  DatePickerInputDate,
  DatePickerProps as CoreDatePickerProps,
  DatePickerShortcut,
  DatePickerLabels
} from '@expcat/tigercat-core'

type DatePickerSingleInputValue = DatePickerInputDate | null
type DatePickerRangeInputValue = [DatePickerInputDate | null, DatePickerInputDate | null]
type DatePickerRangeResolvedValue = [Date | null, Date | null]

type DatePickerDivProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'value' | 'onChange'
>

export interface DatePickerBaseProps
  extends Omit<CoreDatePickerProps, 'value' | 'defaultValue' | 'range'>, DatePickerDivProps {
  className?: string

  onClear?: () => void
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
  range?: false
  value?: DatePickerSingleInputValue
  defaultValue?: DatePickerSingleInputValue
  onChange?: (date: Date | null) => void
}

export interface DatePickerRangeProps extends DatePickerBaseProps {
  range: true
  value?: DatePickerRangeInputValue | null
  defaultValue?: DatePickerRangeInputValue | null
  onChange?: (range: DatePickerRangeResolvedValue) => void
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps

export const isRangeDatePicker = (props: DatePickerProps): props is DatePickerRangeProps =>
  props.range === true

/**
 * Internal context produced by {@link useDatePickerState} and consumed by the
 * `DatePicker.tsx` wrapper plus the `render-calendar` / `render-mobile`
 * helpers. Mirrors the `Table/` paradigm (state hook returns a context object).
 */
export interface DatePickerContext {
  // refs
  inputWrapperRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>
  calendarRef: React.RefObject<HTMLDivElement | null>
  mobileCalendarRef: React.RefObject<HTMLDivElement | null>

  // open / focus state
  isOpen: boolean
  activeRangePart: 'start' | 'end'
  setActiveRangePart: (part: 'start' | 'end') => void
  activeDateIso: string | null
  setActiveDateIso: (iso: string | null) => void

  // resolved view props
  isRangeMode: boolean
  placeholder: string
  disabled: boolean
  readonly: boolean
  required: boolean
  name?: string
  id?: string
  shortcuts?: DatePickerShortcut[]
  containerClasses: string
  divProps: Record<string, unknown>

  // derived data
  displayValue: string
  showClearButton: boolean
  inputClasses: string
  iconButtonClasses: string
  labels: DatePickerLabels
  localeCode: string | undefined
  isRtl: boolean
  dayNames: string[]
  calendarDays: Array<Date | null>
  selectedDate: Date | null
  selectedRange: DatePickerRangeResolvedValue
  viewingMonth: number
  viewingYear: number
  mobileDate: Date
  mobileYears: number[]
  mobileDays: number[]

  // handlers
  toggleCalendar: () => void
  closeCalendar: () => void
  clearDate: (event: React.MouseEvent) => void
  selectDate: (date: Date | null) => void
  setToday: () => void
  handleShortcut: (shortcut: DatePickerShortcut) => void
  handleCalendarKeyDown: (event: React.KeyboardEvent) => void
  previousMonth: () => void
  nextMonth: () => void
  updateMobileDate: (part: 'year' | 'month' | 'day', value: number) => void
  isCurrentMonth: (date: Date | null) => boolean
  isDateDisabled: (date: Date | null) => boolean
}
