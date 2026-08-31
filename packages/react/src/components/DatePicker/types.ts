import type React from 'react'
import type {
  DatePickerInputDate,
  DatePickerProps as CoreDatePickerProps,
  DatePickerShortcut,
  DatePickerLabels
} from '@expcat/tigercat-core'

type DatePickerSingleInputValue = DatePickerInputDate | null
type DatePickerRangeInputValue = [DatePickerInputDate | null, DatePickerInputDate | null]
export type DatePickerRangeResolvedValue = [Date | null, Date | null]

type DatePickerDomProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'value' | 'onChange' | 'placeholder'
>

export interface DatePickerBaseProps
  extends
    Omit<CoreDatePickerProps, 'value' | 'defaultValue' | 'range' | 'onChange'>,
    DatePickerDomProps {
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

export interface DatePickerRef {
  focus: () => void
  open: () => void
  close: () => void
}

export type { DatePickerShortcut, DatePickerLabels }
