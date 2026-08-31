/**
 * InputNumber component styling and stepping utilities
 */

import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import { classNames } from './class-names'

const FOCUS_RING =
  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40'
const ERROR_FOCUS_RING =
  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--tiger-error,#dc2626)]/40'

export interface GetInputNumberWrapperOptions {
  disabled?: boolean
  inGroup?: boolean
  status?: InputStatus
}

/**
 * Base input wrapper classes (chrome root)
 */
export function getInputNumberWrapperClasses(
  disabled?: boolean | GetInputNumberWrapperOptions,
  inGroup?: boolean
): string {
  const options: GetInputNumberWrapperOptions =
    typeof disabled === 'object' && disabled !== null
      ? disabled
      : { disabled: Boolean(disabled), inGroup }
  const isDisabled = Boolean(options.disabled)
  const status = options.status ?? 'default'

  return classNames(
    'inline-flex items-center relative',
    options.inGroup ? 'flex-1 min-w-0' : 'w-full',
    'border rounded-[var(--tiger-radius-md,0.5rem)] shadow-sm',
    isDisabled
      ? 'bg-[var(--tiger-surface-muted,#f3f4f6)] cursor-not-allowed'
      : 'bg-[var(--tiger-surface,#ffffff)] hover:border-[var(--tiger-primary,#2563eb)]',
    'tiger-motion-aware',
    '[transition:var(--tiger-transition-base,color_150ms_ease)]',
    WRAPPER_STATUS_CLASSES[status],
    status === 'error' ? ERROR_FOCUS_RING : FOCUS_RING
  )
}

const WRAPPER_STATUS_CLASSES: Record<InputStatus, string> = {
  default: 'border-[var(--tiger-border,#e5e7eb)]',
  error: 'border-[var(--tiger-error,#dc2626)]',
  success: 'border-[var(--tiger-success,#16a34a)]',
  warning: 'border-[var(--tiger-warning,#d97706)]'
}

export function getInputNumberStatusClasses(status: InputStatus = 'default'): string {
  return WRAPPER_STATUS_CLASSES[status]
}

export function getInputNumberFocusRingColor(status: InputStatus = 'default'): string {
  if (status === 'error') return 'ring-[var(--tiger-error,#dc2626)]'
  if (status === 'success') return 'ring-[var(--tiger-success,#16a34a)]'
  if (status === 'warning') return 'ring-[var(--tiger-warning,#d97706)]'
  return 'ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
}

const WRAPPER_SIZE_CLASSES: Record<ComponentSize, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12'
}

export function getInputNumberSizeClasses(size: ComponentSize = 'md'): string {
  return WRAPPER_SIZE_CLASSES[size]
}

const INPUT_SIZE_PAD: Record<ComponentSize, { start: string; end: string }> = {
  sm: { start: 'ps-2', end: 'pe-2' },
  md: { start: 'ps-3', end: 'pe-3' },
  lg: { start: 'ps-4', end: 'pe-4' }
}

export type InputNumberControlsLayout = 'none' | 'end' | 'both'

/**
 * Inner input element classes (no border, no outline).
 * Padding is one mutually exclusive set based on the controls layout.
 */
export function getInputNumberInputClasses(
  size: ComponentSize = 'md',
  hasControlsRight?: boolean | InputNumberControlsLayout,
  hasControlsBoth?: boolean
): string {
  const layout: InputNumberControlsLayout =
    typeof hasControlsRight === 'string'
      ? hasControlsRight
      : hasControlsBoth
        ? 'both'
        : hasControlsRight
          ? 'end'
          : 'none'
  const pad = INPUT_SIZE_PAD[size]

  return classNames(
    'w-full h-full bg-transparent border-0 outline-none',
    'text-[var(--tiger-text,#111827)]',
    'placeholder:text-[var(--tiger-text-muted,#6b7280)]',
    'disabled:text-[var(--tiger-text-muted,#6b7280)] disabled:cursor-not-allowed',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
    layout === 'both' && 'px-8 text-center',
    layout === 'end' && classNames(pad.start, 'pe-8'),
    layout === 'none' && classNames(pad.start, pad.end)
  )
}

const STEP_BUTTON_FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40'

export function getInputNumberStepButtonClasses(
  position: 'up' | 'down',
  disabled?: boolean
): string {
  return classNames(
    'flex items-center justify-center',
    'w-7 h-1/2',
    'border-s border-[var(--tiger-border,#e5e7eb)]',
    'text-[var(--tiger-text-muted,#6b7280)]',
    'tiger-motion-aware',
    '[transition:var(--tiger-transition-base,color_150ms_ease)] cursor-pointer select-none',
    STEP_BUTTON_FOCUS,
    position === 'up' ? 'border-b border-b-[var(--tiger-border,#e5e7eb)]' : '',
    disabled
      ? 'opacity-40 cursor-not-allowed'
      : 'hover:text-[var(--tiger-primary,#2563eb)] hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
  )
}

export function getInputNumberSideButtonClasses(
  position: 'start' | 'end' | 'left' | 'right',
  disabled?: boolean
): string {
  const atStart = position === 'start' || position === 'left'
  return classNames(
    'flex items-center justify-center',
    'w-8 h-full',
    'text-[var(--tiger-text-muted,#6b7280)]',
    'tiger-motion-aware',
    '[transition:var(--tiger-transition-base,color_150ms_ease)] cursor-pointer select-none',
    STEP_BUTTON_FOCUS,
    atStart
      ? 'border-e border-e-[var(--tiger-border,#e5e7eb)] rounded-s-[var(--tiger-radius-md,0.5rem)]'
      : 'border-s border-s-[var(--tiger-border,#e5e7eb)] rounded-e-[var(--tiger-radius-md,0.5rem)]',
    disabled
      ? 'opacity-40 cursor-not-allowed'
      : 'hover:text-[var(--tiger-primary,#2563eb)] hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
  )
}

/** End-side stacked controls (logical trailing edge). */
export const inputNumberControlsRightClasses =
  'absolute inset-inline-end-0 top-0 h-full flex flex-col'

export const inputNumberUpIconPathD = 'M7 10l5-5 5 5H7z'
export const inputNumberDownIconPathD = 'M7 7l5 5 5-5H7z'
export const inputNumberMinusIconPathD = 'M5 12h14'
export const inputNumberPlusIconPathD = 'M12 5v14M5 12h14'

export function clampValue(value: number, min: number = -Infinity, max: number = Infinity): number {
  return Math.min(Math.max(value, min), max)
}

export function countDecimalPlaces(value: number): number {
  if (!Number.isFinite(value)) return 0
  const str = String(value)
  const expMatch = str.match(/e([+-]?\d+)$/i)
  if (expMatch) {
    const exp = Number(expMatch[1])
    const mantissa = str.split(/e/i)[0]
    const dec = mantissa.includes('.') ? mantissa.split('.')[1].length : 0
    return Math.max(0, dec - exp)
  }
  const index = str.indexOf('.')
  return index === -1 ? 0 : str.length - index - 1
}

/**
 * Step a value up or down using decimal integer arithmetic so 0.1+0.2 stays 0.3.
 */
export function stepValue(
  current: number | null | undefined,
  step: number,
  direction: 'up' | 'down',
  min: number = -Infinity,
  max: number = Infinity,
  precision?: number
): number {
  const base = current ?? 0
  const safeStep = Number.isFinite(step) && step !== 0 ? Math.abs(step) : 1
  const places = Math.max(countDecimalPlaces(base), countDecimalPlaces(safeStep), precision ?? 0)
  const factor = 10 ** places
  const signed = direction === 'up' ? 1 : -1
  const raw = (Math.round(base * factor) + signed * Math.round(safeStep * factor)) / factor
  const clamped = clampValue(raw, min, max)
  return precision !== undefined ? formatPrecision(clamped, precision) : clamped
}

export function formatPrecision(value: number, precision: number): number {
  return Number(value.toFixed(precision))
}

export function isAtMin(value: number | null | undefined, min: number = -Infinity): boolean {
  if (value === null || value === undefined) return false
  return value <= min
}

export function isAtMax(value: number | null | undefined, max: number = Infinity): boolean {
  if (value === null || value === undefined) return false
  return value >= max
}

export function formatInputNumberDisplay(
  value: number | null | undefined,
  options: { formatter?: (value: number | undefined) => string; precision?: number } = {}
): string {
  if (value === null || value === undefined) return ''
  if (options.formatter) return options.formatter(value)
  if (options.precision !== undefined) return value.toFixed(options.precision)
  return String(value)
}

/** Unformatted editing buffer while focused. */
export function formatInputNumberEditingDisplay(
  value: number | null | undefined,
  precision?: number
): string {
  if (value === null || value === undefined) return ''
  if (precision !== undefined) return value.toFixed(precision)
  return String(value)
}

export function parseInputNumberValue(
  str: string,
  options: { parser?: (displayValue: string) => number | null } = {}
): number | null {
  if (str === '' || str === '-') return null
  if (options.parser) {
    const parsed = options.parser(str)
    return parsed == null || Number.isNaN(parsed) ? null : parsed
  }
  const num = Number(str)
  return Number.isNaN(num) ? null : num
}

export interface CommitInputNumberOptions {
  min?: number
  max?: number
  precision?: number
}

export function commitInputNumberValue(
  raw: number | null,
  current: number | null,
  options: CommitInputNumberOptions = {}
): { value: number | null; changed: boolean } {
  const min = options.min ?? -Infinity
  const max = options.max ?? Infinity
  let next = raw
  if (next !== null) {
    if (!Number.isFinite(next)) {
      next = null
    } else {
      next = clampValue(next, min, max)
      if (options.precision !== undefined) {
        next = formatPrecision(next, options.precision)
      }
    }
  }
  const changed = next !== current
  return { value: next, changed }
}

export interface InputNumberKeyboardOptions {
  min?: number
  max?: number
  step?: number
  precision?: number
  keyboard?: boolean
}

/**
 * Next committed value for a key, or `undefined` if the key is not handled.
 * Same value at a bound is still returned — callers skip emit via `changed`.
 */
export function getInputNumberKeyboardNextValue(
  key: string,
  current: number | null,
  options: InputNumberKeyboardOptions = {}
): number | undefined {
  if (options.keyboard === false) return undefined
  const min = options.min ?? -Infinity
  const max = options.max ?? Infinity
  const step = options.step ?? 1
  const precision = options.precision
  const largeStep = step * 10

  switch (key) {
    case 'ArrowUp':
      return stepValue(current, step, 'up', min, max, precision)
    case 'ArrowDown':
      return stepValue(current, step, 'down', min, max, precision)
    case 'PageUp':
      return stepValue(current, largeStep, 'up', min, max, precision)
    case 'PageDown':
      return stepValue(current, largeStep, 'down', min, max, precision)
    case 'Home':
      if (!Number.isFinite(min)) return undefined
      return precision !== undefined ? formatPrecision(min, precision) : min
    case 'End':
      if (!Number.isFinite(max)) return undefined
      return precision !== undefined ? formatPrecision(max, precision) : max
    default:
      return undefined
  }
}

export function resolveInputNumberControlsLayout(
  controls: boolean | undefined,
  controlsPosition: 'right' | 'both' | undefined
): InputNumberControlsLayout {
  if (!controls) return 'none'
  return controlsPosition === 'both' ? 'both' : 'end'
}
