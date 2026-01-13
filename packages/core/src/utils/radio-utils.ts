import { classNames } from './class-names'
import { type RadioSize } from '../types/radio'
import { type RadioColorScheme } from '../theme/colors'

export const radioRootBaseClasses = 'inline-flex items-center'

export const radioVisualBaseClasses =
  'relative inline-flex items-center justify-center rounded-full border-2 cursor-pointer transition-all'

export const radioFocusVisibleClasses =
  'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--tiger-primary,#2563eb)] peer-focus-visible:ring-offset-[var(--tiger-surface,#ffffff)]'

export const radioDotBaseClasses = 'rounded-full transition-all'

export const radioLabelBaseClasses = 'ml-2 cursor-pointer select-none'

export const radioDisabledCursorClasses = 'cursor-not-allowed'

export const radioHoverBorderClasses =
  'hover:border-[var(--tiger-primary,#2563eb)]'

export const radioSizeClasses: Record<
  RadioSize,
  {
    radio: string
    dot: string
    label: string
  }
> = {
  sm: {
    radio: 'w-4 h-4',
    dot: 'w-1.5 h-1.5',
    label: 'text-sm',
  },
  md: {
    radio: 'w-5 h-5',
    dot: 'w-2 h-2',
    label: 'text-base',
  },
  lg: {
    radio: 'w-6 h-6',
    dot: 'w-2.5 h-2.5',
    label: 'text-lg',
  },
} as const

export interface GetRadioVisualClassesOptions {
  size: RadioSize
  checked: boolean
  disabled: boolean
  colors: RadioColorScheme
}

export const getRadioVisualClasses = ({
  size,
  checked,
  disabled,
  colors,
}: GetRadioVisualClassesOptions) =>
  classNames(
    radioVisualBaseClasses,
    radioFocusVisibleClasses,
    radioSizeClasses[size].radio,
    checked ? colors.borderChecked : colors.border,
    checked ? colors.bgChecked : colors.bg,
    disabled && colors.disabled,
    disabled && radioDisabledCursorClasses,
    !disabled && radioHoverBorderClasses
  )

export interface GetRadioDotClassesOptions {
  size: RadioSize
  checked: boolean
  colors: RadioColorScheme
}

export const getRadioDotClasses = ({
  size,
  checked,
  colors,
}: GetRadioDotClassesOptions) =>
  classNames(
    radioDotBaseClasses,
    radioSizeClasses[size].dot,
    colors.innerDot,
    checked ? 'scale-100' : 'scale-0'
  )

export interface GetRadioLabelClassesOptions {
  size: RadioSize
  disabled: boolean
  colors: RadioColorScheme
}

export const getRadioLabelClasses = ({
  size,
  disabled,
  colors,
}: GetRadioLabelClassesOptions) =>
  classNames(
    radioLabelBaseClasses,
    radioSizeClasses[size].label,
    disabled ? colors.textDisabled : 'text-[var(--tiger-text,#111827)]',
    disabled && radioDisabledCursorClasses
  )
