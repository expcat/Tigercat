import type {
  NumberKeyboardAction,
  NumberKeyboardKey,
  NumberKeyboardKeyType,
  NumberKeyboardMode
} from '../types/number-keyboard'
import { classNames } from './class-names'
import { overlayZIndexClass } from './floating'

export interface NumberKeyboardInputOptions {
  mode?: NumberKeyboardMode
  maxLength?: number
  precision?: number
  decimalSeparator?: string
}

export interface NumberKeyboardLayoutLabels {
  deleteText: string
  confirmText: string
  decimalAriaLabel: string
  idCardXAriaLabel: string
}

export interface NumberKeyboardLayoutOptions {
  mode?: NumberKeyboardMode
  decimalSeparator?: string
  showConfirm?: boolean
  labels: NumberKeyboardLayoutLabels
}

export interface ApplyNumberKeyboardKeyResult {
  nextValue: string
  action: NumberKeyboardAction
  changed: boolean
}

const KEY_LAYOUT =
  'flex min-h-12 select-none items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] border px-3 text-lg font-medium tiger-motion-aware [transition:var(--tiger-transition-base,color_150ms_ease,background-color_150ms_ease)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/30 disabled:cursor-not-allowed disabled:opacity-50'

const KEY_TONE =
  'border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-fill,#f3f4f6)] text-[var(--tiger-text,#111827)] hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)]'

const CONFIRM_TONE =
  'col-span-3 border-[var(--tiger-primary,#2563eb)] bg-[var(--tiger-primary,#2563eb)] text-[var(--tiger-primary-foreground,#ffffff)] hover:bg-[var(--tiger-primary-hover,#1d4ed8)]'

export const numberKeyboardRootClasses = classNames(
  'w-full rounded-[var(--tiger-radius-lg,0.75rem)]',
  'border border-[var(--tiger-border,#d1d5db)]',
  'bg-[var(--tiger-surface,#ffffff)] p-2',
  'shadow-[var(--tiger-shadow-sm,0_1px_2px_rgb(0_0_0_/_0.05))]'
)

export const numberKeyboardGridClasses = 'grid grid-cols-3 gap-2'

export const numberKeyboardEmptyKeyClasses = 'min-h-12'

export const numberKeyboardSheetClasses = classNames(
  'fixed inset-x-0 bottom-0',
  overlayZIndexClass.overlay,
  'w-full',
  'rounded-t-[var(--tiger-radius-lg,0.75rem)]',
  'border-t border-[var(--tiger-border,#d1d5db)]',
  'bg-[var(--tiger-surface,#ffffff)] p-2',
  'pb-[max(0.5rem,env(safe-area-inset-bottom))]',
  'shadow-[var(--tiger-shadow-lg,0_10px_15px_-3px_rgb(0_0_0_/_0.1),0_4px_6px_-4px_rgb(0_0_0_/_0.1))]'
)

export const numberKeyboardScrimClasses = classNames(
  'fixed inset-0',
  overlayZIndexClass.overlay,
  'bg-[color-mix(in_srgb,var(--tiger-text,#111827)_40%,transparent)]'
)

export const numberKeyboardKeyClasses = classNames(KEY_LAYOUT, KEY_TONE)

export const numberKeyboardConfirmKeyClasses = classNames(KEY_LAYOUT, CONFIRM_TONE)

export function normalizeNumberKeyboardValue(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

export function postNumberKeyboardValue(
  value: unknown,
  mode: NumberKeyboardMode = 'number'
): string {
  const normalized = normalizeNumberKeyboardValue(value)
  return mode === 'id-card' ? normalized.toUpperCase() : normalized
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

  if (key === separator) {
    if (precision === 0) return current
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
  const normalizedCurrent = current.toUpperCase()
  const normalizedKey = key.toUpperCase()
  if (normalizedCurrent.length >= maxLength) return normalizedCurrent
  if (normalizedCurrent.includes('X')) return normalizedCurrent

  if (isDigit(normalizedKey)) return normalizedCurrent + normalizedKey
  if (normalizedKey === 'X' && normalizedCurrent.length === maxLength - 1) {
    return normalizedCurrent + normalizedKey
  }
  return normalizedCurrent
}

export function applyNumberKeyboardInput(
  currentValue: unknown,
  key: string,
  options: NumberKeyboardInputOptions = {}
): string {
  const mode = options.mode ?? 'number'
  const current = postNumberKeyboardValue(currentValue, mode)
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

export function deleteNumberKeyboardValue(
  value: unknown,
  mode: NumberKeyboardMode = 'number'
): string {
  return postNumberKeyboardValue(value, mode).slice(0, -1)
}

export function getNumberKeyboardAction(key: NumberKeyboardKey): NumberKeyboardAction {
  if (key.type === 'delete') return 'delete'
  if (key.type === 'confirm') return 'confirm'
  return 'input'
}

export function applyNumberKeyboardKey(
  current: unknown,
  key: Pick<NumberKeyboardKey, 'type' | 'value'> | string,
  options: NumberKeyboardInputOptions = {}
): ApplyNumberKeyboardKeyResult {
  const mode = options.mode ?? 'number'
  const currentValue = postNumberKeyboardValue(current, mode)
  const resolved =
    typeof key === 'string'
      ? resolveNumberKeyboardPhysicalKey(key, options)
      : { type: key.type, value: key.value }

  if (!resolved || resolved.type === 'empty') {
    return { nextValue: currentValue, action: 'input', changed: false }
  }

  if (resolved.type === 'confirm') {
    return { nextValue: currentValue, action: 'confirm', changed: false }
  }

  const nextValue =
    resolved.type === 'delete'
      ? deleteNumberKeyboardValue(currentValue, mode)
      : applyNumberKeyboardInput(currentValue, resolved.value, options)

  return {
    nextValue,
    action: resolved.type === 'delete' ? 'delete' : 'input',
    changed: nextValue !== currentValue
  }
}

export function resolveNumberKeyboardPhysicalKey(
  eventKey: string,
  options: NumberKeyboardInputOptions = {}
): { type: NumberKeyboardKeyType; value: string } | null {
  const mode = options.mode ?? 'number'
  const decimalSeparator = options.decimalSeparator || '.'

  if (eventKey === 'Backspace' || eventKey === 'Delete') {
    return { type: 'delete', value: 'delete' }
  }
  if (eventKey === 'Enter') {
    return { type: 'confirm', value: 'confirm' }
  }
  if (isDigit(eventKey)) {
    return { type: 'digit', value: eventKey }
  }
  if (mode === 'amount' && eventKey === decimalSeparator) {
    return { type: 'decimal', value: decimalSeparator }
  }
  if (mode === 'id-card' && eventKey.toUpperCase() === 'X') {
    return { type: 'id-card-x', value: 'X' }
  }
  return null
}

function createDigitKey(value: string): NumberKeyboardKey {
  return { type: 'digit', value, label: value, ariaLabel: value }
}

function createExtraKey(
  mode: NumberKeyboardMode,
  decimalSeparator: string,
  labels: NumberKeyboardLayoutLabels
): NumberKeyboardKey {
  if (mode === 'amount') {
    return {
      type: 'decimal',
      value: decimalSeparator,
      label: decimalSeparator,
      ariaLabel: labels.decimalAriaLabel
    }
  }
  if (mode === 'id-card') {
    return { type: 'id-card-x', value: 'X', label: 'X', ariaLabel: labels.idCardXAriaLabel }
  }
  return { type: 'empty', value: '', label: '', ariaLabel: '' }
}

export function getNumberKeyboardKeys(options: NumberKeyboardLayoutOptions): NumberKeyboardKey[] {
  const mode = options.mode ?? 'number'
  const decimalSeparator = options.decimalSeparator || '.'
  const keys: NumberKeyboardKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(
    createDigitKey
  )

  keys.push(createExtraKey(mode, decimalSeparator, options.labels), createDigitKey('0'), {
    type: 'delete',
    value: 'delete',
    label: options.labels.deleteText,
    ariaLabel: options.labels.deleteText
  })

  if (options.showConfirm !== false) {
    keys.push({
      type: 'confirm',
      value: 'confirm',
      label: options.labels.confirmText,
      ariaLabel: options.labels.confirmText
    })
  }

  return keys
}

export function getNumberKeyboardKeyClasses(key: NumberKeyboardKey, disabled = false): string {
  if (key.type === 'empty') return numberKeyboardEmptyKeyClasses
  return classNames(
    KEY_LAYOUT,
    key.type === 'confirm' ? CONFIRM_TONE : KEY_TONE,
    disabled && 'pointer-events-none'
  )
}

export function getNumberKeyboardInteractiveIndexes(keys: readonly NumberKeyboardKey[]): number[] {
  return keys.map((key, index) => (key.type === 'empty' ? -1 : index)).filter((index) => index >= 0)
}

export function moveNumberKeyboardIndex(
  keys: readonly NumberKeyboardKey[],
  activeIndex: number,
  key: string,
  columns = 3
): number {
  const interactive = getNumberKeyboardInteractiveIndexes(keys)
  if (interactive.length === 0) return activeIndex
  const currentPos = interactive.indexOf(activeIndex)
  const fallback = interactive[0]
  const pos = currentPos < 0 ? 0 : currentPos

  if (key === 'Home') return interactive[0] ?? fallback
  if (key === 'End') return interactive[interactive.length - 1] ?? fallback

  const index = interactive[pos] ?? fallback
  const row = Math.floor(index / columns)
  const col = index % columns
  let nextRow = row
  let nextCol = col

  if (key === 'ArrowLeft') nextCol -= 1
  else if (key === 'ArrowRight') nextCol += 1
  else if (key === 'ArrowUp') nextRow -= 1
  else if (key === 'ArrowDown') nextRow += 1
  else return index

  const nextIndex = nextRow * columns + nextCol
  if (interactive.includes(nextIndex)) return nextIndex

  const nearest = interactive.reduce((best, candidate) => {
    const bestDist =
      Math.abs(Math.floor(best / columns) - nextRow) + Math.abs((best % columns) - nextCol)
    const nextDist =
      Math.abs(Math.floor(candidate / columns) - nextRow) +
      Math.abs((candidate % columns) - nextCol)
    return nextDist < bestDist ? candidate : best
  }, interactive[pos] ?? fallback)
  return nearest
}
