import type { InputStatus } from './input'
import type { TigerLocale, TigerLocaleNumberKeyboard } from './locale'

export type NumberKeyboardMode = 'number' | 'amount' | 'phone' | 'id-card'

export type NumberKeyboardKeyType =
  'digit' | 'decimal' | 'id-card-x' | 'delete' | 'confirm' | 'empty'

export type NumberKeyboardAction = 'input' | 'delete' | 'confirm'

export interface NumberKeyboardKey {
  type: NumberKeyboardKeyType
  value: string
  label: string
  ariaLabel: string
  disabled?: boolean
}

export interface NumberKeyboardChangePayload {
  value: string
  key: string
  action: NumberKeyboardAction
  mode: NumberKeyboardMode
}

/**
 * Shared NumberKeyboard props. React adds `value`/`onChange`; Vue binds
 * `modelValue` / `update:modelValue`.
 *
 * Typical usage is an Input that shows the value plus this keypad. Pass `open`
 * (or `defaultOpen`) to portal a bottom-sheet into the overlay host. Omit both
 * for an always-visible keypad (PIN pad). Confirm closes a sheet; bind
 * `onConfirm` or set `showConfirm={false}` so the main button is not a no-op.
 *
 * `phone` defaults to 11 digits (mainland China mobile, no `+`). `id-card`
 * defaults to 18 characters with a final `X` (mainland China ID, no checksum).
 * `number` is unsigned digits (leading zeros kept). `amount` is unsigned with
 * a decimal separator.
 */
export interface NumberKeyboardProps {
  value?: string
  defaultValue?: string
  /**
   * @default 'number'
   */
  mode?: NumberKeyboardMode
  maxLength?: number
  /**
   * Fractional digits in `amount` mode.
   * @default 2
   */
  precision?: number
  /**
   * @default '.'
   */
  decimalSeparator?: string
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Focusable; key presses are ignored. Distinct from `disabled`.
   * @default false
   */
  readonly?: boolean
  confirmText?: string
  deleteText?: string
  ariaLabel?: string
  /**
   * @default true
   */
  showConfirm?: boolean
  /**
   * Controlled sheet visibility. Passing `open` or `defaultOpen` selects
   * overlay mode.
   */
  open?: boolean
  defaultOpen?: boolean
  name?: string
  id?: string
  status?: InputStatus
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleNumberKeyboard>
  className?: string
  onChange?: (value: string, payload: NumberKeyboardChangePayload) => void
  onOpenChange?: (open: boolean) => void
}
