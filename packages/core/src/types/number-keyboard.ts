import type { TigerLocale } from './locale'

export type NumberKeyboardMode = 'number' | 'amount' | 'phone' | 'id-card'

export type NumberKeyboardKeyType =
  | 'digit'
  | 'decimal'
  | 'id-card-x'
  | 'delete'
  | 'confirm'
  | 'empty'

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

export interface NumberKeyboardProps {
  value?: string
  defaultValue?: string
  mode?: NumberKeyboardMode
  maxLength?: number
  precision?: number
  decimalSeparator?: string
  disabled?: boolean
  readonly?: boolean
  confirmText?: string
  deleteText?: string
  ariaLabel?: string
  showConfirm?: boolean
  locale?: Partial<TigerLocale>
  className?: string
}
