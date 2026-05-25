import type {
  NumberKeyboardKey,
  NumberKeyboardMode,
  NumberKeyboardAction
} from '../types/number-keyboard'
import { classNames } from './class-names'

export interface NumberKeyboardInputOptions {
  mode?: NumberKeyboardMode
  maxLength?: number
  precision?: number
  decimalSeparator?: string
}

export interface NumberKeyboardLayoutOptions {
  mode?: NumberKeyboardMode
  decimalSeparator?: string
  deleteText?: string
  confirmText?: string
  showConfirm?: boolean
}

export const numberKeyboardRootClasses =
  'w-full max-w-sm rounded-[var(--tiger-radius-lg,0.75rem)] border border-[var(--tiger-number-keyboard-border,var(--tiger-border,#d1d5db))] bg-[var(--tiger-number-keyboard-bg,var(--tiger-surface,#ffffff))] p-2 shadow-sm'

export const numberKeyboardGridClasses = 'grid grid-cols-3 gap-2'

export const numberKeyboardKeyClasses =
  'flex min-h-12 select-none items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-number-keyboard-key-border,var(--tiger-border,#d1d5db))] bg-[var(--tiger-number-keyboard-key-bg,var(--tiger-fill,#f3f4f6))] px-3 text-lg font-medium text-[var(--tiger-number-keyboard-key-text,var(--tiger-text,#111827))] transition-colors hover:bg-[var(--tiger-number-keyboard-key-bg-hover,var(--tiger-outline-bg-hover,#eff6ff))] focus:outline-none focus:ring-2 focus:ring-[var(--tiger-number-keyboard-ring,var(--tiger-primary,#2563eb))]/30 disabled:cursor-not-allowed disabled:opacity-50'

export const numberKeyboardConfirmKeyClasses =
  'col-span-3 bg-[var(--tiger-number-keyboard-confirm-bg,var(--tiger-primary,#2563eb))] text-[var(--tiger-number-keyboard-confirm-text,#ffffff)] hover:bg-[var(--tiger-number-keyboard-confirm-bg-hover,var(--tiger-primary-hover,#1d4ed8))]'

export const numberKeyboardEmptyKeyClasses = 'pointer-events-none opacity-0'

export function normalizeNumberKeyboardValue(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

export function getNumberKeyboardMaxLength(
  mode: NumberKeyboardMode = 'number',
  maxLength?: number
): number {
  if (Number.isFinite(maxLength) && Number(maxLength) >= 0) return Math.floor(Number(maxLength))
  if (mode === 'phone') return 11
  if (mode === 'id-card') return 18
  return Infinity
}

export function getNumberKeyboardPrecision(
  mode: NumberKeyboardMode = 'number',
  precision?: number
): number | undefined {
  if (Number.isFinite(precision) && Number(precision) >= 0) return Math.floor(Number(precision))
  return mode === 'amount' ? 2 : undefined
}

function isDigit(key: string): boolean {
  return /^\d$/.test(key)
}

function appendDigit(current: string, digit: string, maxLength: number): string {
  if (current.length >= maxLength) return current
  return current + digit
}

function appendAmountInput(
  current: string,
  key: string,
  options: Required<Pick<NumberKeyboardInputOptions, 'decimalSeparator'>> &
    NumberKeyboardInputOptions
): string {
  const separator = options.decimalSeparator
  const precision = getNumberKeyboardPrecision('amount', options.precision)
  const maxLength = getNumberKeyboardMaxLength('amount', options.maxLength)

  if (key === separator || key === '.') {
    if (current.includes(separator) || current.length >= maxLength) return current
    return current === '' ? `0${separator}` : `${current}${separator}`
  }

  if (!isDigit(key) || current.length >= maxLength) return current

  if (current.includes(separator) && precision !== undefined) {
    const [, fraction = ''] = current.split(separator)
    if (fraction.length >= precision) return current
  }

  if (current === '0' && key !== '0') return key
  if (current === '0' && key === '0') return current
  return current + key
}

function appendIdCardInput(current: string, key: string, maxLength: number): string {
  const normalizedKey = key.toUpperCase()
  if (current.length >= maxLength) return current
  if (current.includes('X')) return current

  if (isDigit(normalizedKey)) return current + normalizedKey
  if (normalizedKey === 'X' && current.length === maxLength - 1) return current + normalizedKey
  return current
}

export function applyNumberKeyboardInput(
  currentValue: unknown,
  key: string,
  options: NumberKeyboardInputOptions = {}
): string {
  const mode = options.mode ?? 'number'
  const current = normalizeNumberKeyboardValue(currentValue)
  const maxLength = getNumberKeyboardMaxLength(mode, options.maxLength)
  const decimalSeparator = options.decimalSeparator || '.'

  if (mode === 'amount') {
    return appendAmountInput(current, key, { ...options, decimalSeparator })
  }

  if (mode === 'id-card') {
    return appendIdCardInput(current, key, maxLength)
  }

  if (!isDigit(key)) return current
  return appendDigit(current, key, maxLength)
}

export function deleteNumberKeyboardValue(value: unknown): string {
  return normalizeNumberKeyboardValue(value).slice(0, -1)
}

export function getNumberKeyboardAction(key: NumberKeyboardKey): NumberKeyboardAction {
  if (key.type === 'delete') return 'delete'
  if (key.type === 'confirm') return 'confirm'
  return 'input'
}

function createDigitKey(value: string): NumberKeyboardKey {
  return { type: 'digit', value, label: value, ariaLabel: value }
}

function createExtraKey(mode: NumberKeyboardMode, decimalSeparator: string): NumberKeyboardKey {
  if (mode === 'amount') {
    return {
      type: 'decimal',
      value: decimalSeparator,
      label: decimalSeparator,
      ariaLabel: 'Decimal'
    }
  }
  if (mode === 'id-card') {
    return { type: 'id-card-x', value: 'X', label: 'X', ariaLabel: 'ID card X' }
  }
  return { type: 'empty', value: '', label: '', ariaLabel: 'Empty', disabled: true }
}

export function getNumberKeyboardKeys(
  options: NumberKeyboardLayoutOptions = {}
): NumberKeyboardKey[] {
  const mode = options.mode ?? 'number'
  const decimalSeparator = options.decimalSeparator || '.'
  const deleteText = options.deleteText || 'Delete'
  const confirmText = options.confirmText || 'Done'
  const keys: NumberKeyboardKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(
    createDigitKey
  )

  keys.push(createExtraKey(mode, decimalSeparator), createDigitKey('0'), {
    type: 'delete',
    value: 'delete',
    label: deleteText,
    ariaLabel: deleteText
  })

  if (options.showConfirm !== false) {
    keys.push({ type: 'confirm', value: 'confirm', label: confirmText, ariaLabel: confirmText })
  }

  return keys
}

export function getNumberKeyboardKeyClasses(key: NumberKeyboardKey, disabled = false): string {
  return classNames(
    numberKeyboardKeyClasses,
    key.type === 'confirm' && numberKeyboardConfirmKeyClasses,
    key.type === 'empty' && numberKeyboardEmptyKeyClasses,
    disabled && 'pointer-events-none'
  )
}
