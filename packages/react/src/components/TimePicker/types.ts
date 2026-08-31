import type React from 'react'
import type {
  TimePickerProps as CoreTimePickerProps,
  TimePickerLabels,
  TimePickerRangeTuple
} from '@expcat/tigercat-core'

type TimePickerSingleInputValue = string | null
type TimePickerRangeInputValue = TimePickerRangeTuple | null

type TimePickerDomProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'value' | 'onChange' | 'placeholder'
>

export interface TimePickerBaseProps
  extends
    Omit<CoreTimePickerProps, 'value' | 'defaultValue' | 'range' | 'onChange'>,
    TimePickerDomProps {
  onClear?: () => void
}

export interface TimePickerSingleProps extends TimePickerBaseProps {
  range?: false
  value?: TimePickerSingleInputValue
  defaultValue?: TimePickerSingleInputValue
  onChange?: (time: TimePickerSingleInputValue) => void
}

export interface TimePickerRangeProps extends TimePickerBaseProps {
  range: true
  value?: TimePickerRangeInputValue
  defaultValue?: TimePickerRangeInputValue
  onChange?: (time: TimePickerRangeTuple | null) => void
}

export type TimePickerProps = TimePickerSingleProps | TimePickerRangeProps

export const isRangeTimePicker = (props: TimePickerProps): props is TimePickerRangeProps =>
  props.range === true

export interface TimePickerRef {
  focus: () => void
  open: () => void
  close: () => void
}

export type { TimePickerLabels, TimePickerRangeTuple }
