import type React from 'react'
import type {
  TimePickerRangeValue as CoreTimePickerRangeValue,
  TimePickerSingleValue,
  TimePickerLabels,
  TimePickerProps as CoreTimePickerProps,
  TigerLocale,
  getTimePeriodLabels
} from '@expcat/tigercat-core'

export type TimePickerRangeValue = CoreTimePickerRangeValue

type NativeDivProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>

type BaseTimePickerProps = Omit<CoreTimePickerProps, 'value' | 'defaultValue' | 'range'> &
  NativeDivProps & {
    onClear?: () => void
  }

export type TimePickerProps =
  | (BaseTimePickerProps & {
      range?: false
      value?: TimePickerSingleValue
      defaultValue?: TimePickerSingleValue
      /**
       * Change event handler
       */
      onChange?: (time: TimePickerSingleValue) => void
    })
  | (BaseTimePickerProps & {
      range: true
      value?: TimePickerRangeValue | null
      defaultValue?: TimePickerRangeValue | null
      /**
       * Change event handler
       */
      onChange?: (time: TimePickerRangeValue) => void
    })

type TimePeriodLabels = ReturnType<typeof getTimePeriodLabels>

/**
 * Internal context produced by {@link useTimePickerState} and consumed by the
 * `TimePicker.tsx` wrapper plus the `render-mobile` / `render-desktop` helpers.
 * Mirrors the `Table/` paradigm (state hook returns a context object).
 */
export interface TimePickerContext {
  // refs
  panelRef: React.RefObject<HTMLDivElement | null>
  inputWrapperRef: React.RefObject<HTMLDivElement | null>
  inputRef: React.RefObject<HTMLInputElement | null>

  // open / part state
  isOpen: boolean
  activePart: 'start' | 'end'
  setActivePart: (part: 'start' | 'end') => void

  // resolved view props
  isRangeMode: boolean
  placeholder: string
  disabled: boolean
  readonly: boolean
  required: boolean
  name?: string
  id?: string
  format: '12' | '24'
  showSeconds: boolean
  locale?: string | Partial<TigerLocale>
  labelsOverrides?: Partial<TimePickerLabels>
  containerClasses: string
  divProps: Record<string, unknown>

  // derived data
  displayValue: string
  showClearButton: boolean
  inputClasses: string
  iconButtonClasses: string
  labels: TimePickerLabels
  periodLabels: TimePeriodLabels
  hoursList: number[]
  minutesList: number[]
  secondsList: number[]
  selectedHours: number
  selectedMinutes: number
  selectedSeconds: number
  selectedPeriod: 'AM' | 'PM'

  // handlers
  togglePanel: () => void
  closePanel: () => void
  handleInputClick: () => void
  clearTime: (event: React.MouseEvent) => void
  setNow: () => void
  handlePanelKeyDown: (event: React.KeyboardEvent) => void
  selectHour: (hour: number) => void
  selectMinute: (minute: number) => void
  selectSecond: (second: number) => void
  selectPeriod: (period: 'AM' | 'PM') => void
  isHourDisabled: (hour: number) => boolean
  isMinuteDisabled: (minute: number) => boolean
  isSecondDisabled: (second: number) => boolean
}
