/**
 * InputNumber component styling and stepping utilities
 */

import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import { classNames } from './class-names'

const FOCUS_RING =
  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--tiger-focus-ring)]/40'
const ERROR_FOCUS_RING =
  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--tiger-error)]/40'

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
    'border rounded-[var(--tiger-radius-md)] shadow-sm',
    isDisabled
      ? 'bg-[var(--tiger-surface-muted)] cursor-not-allowed'
      : 'bg-[var(--tiger-surface)] hover:border-[var(--tiger-primary)]',
    'tiger-motion-aware',
    '[transition:var(--tiger-transition-base)]',
    WRAPPER_STATUS_CLASSES[status],
    status === 'error' ? ERROR_FOCUS_RING : FOCUS_RING
  )
}

const WRAPPER_STATUS_CLASSES: Record<InputStatus, string> = {
  default: 'border-[var(--tiger-border)]',
  error: 'border-[var(--tiger-error)]',
  success: 'border-[var(--tiger-success)]',
  warning: 'border-[var(--tiger-warning)]'
}

export function getInputNumberStatusClasses(status: InputStatus = 'default'): string {
  return WRAPPER_STATUS_CLASSES[status]
}

export function getInputNumberFocusRingColor(status: InputStatus = 'default'): string {
  if (status === 'error') return 'ring-[var(--tiger-error)]'
  if (status === 'success') return 'ring-[var(--tiger-success)]'
  if (status === 'warning') return 'ring-[var(--tiger-warning)]'
  return 'ring-[var(--tiger-focus-ring)]'
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
    'text-[var(--tiger-text)]',
    'placeholder:text-[var(--tiger-text-secondary)]',
    'disabled:text-[var(--tiger-text-secondary)] disabled:cursor-not-allowed',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
    layout === 'both' && 'px-8 text-center',
    layout === 'end' && classNames(pad.start, 'pe-8'),
    layout === 'none' && classNames(pad.start, pad.end)
  )
}

const STEP_BUTTON_FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40'

export function getInputNumberStepButtonClasses(
  position: 'up' | 'down',
  disabled?: boolean
): string {
  return classNames(
    'flex items-center justify-center',
    'w-7 h-1/2',
    'border-s border-[var(--tiger-border)]',
    'text-[var(--tiger-text-secondary)]',
    'tiger-motion-aware',
    '[transition:var(--tiger-transition-base)] cursor-pointer select-none',
    STEP_BUTTON_FOCUS,
    position === 'up' ? 'border-b border-b-[var(--tiger-border)]' : '',
    disabled
      ? 'opacity-40 cursor-not-allowed'
      : 'hover:text-[var(--tiger-primary)] hover:bg-[var(--tiger-surface-muted)]'
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
    'text-[var(--tiger-text-secondary)]',
    'tiger-motion-aware',
    '[transition:var(--tiger-transition-base)] cursor-pointer select-none',
    STEP_BUTTON_FOCUS,
    atStart
      ? 'border-e border-e-[var(--tiger-border)] rounded-s-[var(--tiger-radius-md)]'
      : 'border-s border-s-[var(--tiger-border)] rounded-e-[var(--tiger-radius-md)]',
    disabled
      ? 'opacity-40 cursor-not-allowed'
      : 'hover:text-[var(--tiger-primary)] hover:bg-[var(--tiger-surface-muted)]'
  )
}

/**
 * End-side stacked controls (logical trailing edge).
 *
 * `end-0` is the inset Tailwind v4 emits. `inset-inline-end-0` is not, so the
 * column stayed at the flex static position — the inline start — and its
 * divider cut through the value. Width is fixed so the divider cannot grow
 * with the field.
 */
export const inputNumberControlsRightClasses = 'absolute end-0 top-0 z-[1] flex h-full w-7 flex-col'

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

export type InputNumberModel = number | string | null

const DECIMAL_STRING = /^-?\d+(\.\d+)?$/

/** Plain `"12"` stays a number. Integers past `MAX_SAFE_INTEGER` stay strings. */
export function parseInputNumberModel(str: string): InputNumberModel {
  const trimmed = str.trim()
  if (trimmed === '' || trimmed === '-' || trimmed === '.') return null
  if (!DECIMAL_STRING.test(trimmed)) {
    const num = Number(trimmed)
    return Number.isFinite(num) ? num : null
  }
  const integer = trimmed.replace(/^-/, '').split('.')[0]
  if (integer.length > 15 || Math.abs(Number(trimmed)) > Number.MAX_SAFE_INTEGER) {
    return trimmed
  }
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

function splitDecimal(value: string): { sign: -1 | 1; digits: string; scale: number } | null {
  if (!DECIMAL_STRING.test(value)) return null
  const sign: -1 | 1 = value.startsWith('-') ? -1 : 1
  const body = value.replace(/^-/, '')
  const [whole, frac = ''] = body.split('.')
  return { sign, digits: `${whole}${frac}`.replace(/^0+(?=\d)/, ''), scale: frac.length }
}

/** Expand a finite number into plain decimal text so `1e-7` can be scaled by BigInt. */
function toDecimalString(value: number): string {
  if (!Number.isFinite(value)) return '0'
  const text = String(value)
  if (!text.includes('e') && !text.includes('E')) return text
  const negative = text.startsWith('-')
  const body = negative ? text.slice(1) : text
  const [mantissa, exponentText] = body.split(/e/i)
  const exponent = Number(exponentText)
  const [whole, frac = ''] = mantissa.split('.')
  const digits = `${whole}${frac}`.replace(/^0+(?=\d)/, '') || '0'
  const point = whole.length + exponent
  let expanded: string
  if (point <= 0) {
    expanded = `0.${'0'.repeat(-point)}${digits}`
  } else if (point >= digits.length) {
    expanded = `${digits}${'0'.repeat(point - digits.length)}`
  } else {
    expanded = `${digits.slice(0, point)}.${digits.slice(point)}`
  }
  return negative ? `-${expanded}` : expanded
}

function compareDecimalStrings(left: string, right: string): number {
  const a = splitDecimal(left)
  const b = splitDecimal(right)
  if (!a || !b) return 0
  if (a.sign !== b.sign) return a.sign < b.sign ? -1 : 1
  const scale = Math.max(a.scale, b.scale)
  const leftInt = BigInt(a.digits || '0') * 10n ** BigInt(scale - a.scale)
  const rightInt = BigInt(b.digits || '0') * 10n ** BigInt(scale - b.scale)
  const magnitude = leftInt === rightInt ? 0 : leftInt < rightInt ? -1 : 1
  return a.sign < 0 ? -magnitude : magnitude
}

/**
 * Clamp a decimal string to finite bounds. A clamped value returns the numeric
 * bound itself; unclamped values keep their exact string form.
 */
function clampDecimalModel(value: string, min: number, max: number): string | number {
  if (Number.isFinite(min) && compareDecimalStrings(value, toDecimalString(min)) < 0) return min
  if (Number.isFinite(max) && compareDecimalStrings(value, toDecimalString(max)) > 0) return max
  return value
}

function clampDecimalResult(value: string | number, min: number, max: number): string | number {
  return typeof value === 'number'
    ? clampValue(value, min, max)
    : clampDecimalModel(value, min, max)
}

function snapDecimalModelToStep(
  value: string | number,
  min: number,
  step: number,
  precision?: number
): string | number {
  return typeof value === 'number'
    ? snapInputNumberToStep(value, min, step, precision)
    : snapDecimalStringToStep(value, min, step, precision)
}

function formatDecimalModelPrecision(value: string | number, precision: number): string {
  return addDecimalString(typeof value === 'number' ? toDecimalString(value) : value, 0, precision)
}

function floorDivBigInt(numerator: bigint, denominator: bigint): bigint {
  const quotient = numerator / denominator
  return numerator % denominator !== 0n && numerator < 0n !== denominator < 0n
    ? quotient - 1n
    : quotient
}

/** Snap a decimal string onto the same grid as `snapInputNumberToStep`. */
function snapDecimalStringToStep(
  value: string,
  min: number,
  step: number,
  precision?: number
): string {
  const origin = Number.isFinite(min) ? min : 0
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1
  const base = splitDecimal(value)
  const originParts = splitDecimal(toDecimalString(origin))
  const stepParts = splitDecimal(toDecimalString(safeStep))
  if (!base || !originParts || !stepParts) return value
  const places = Math.max(base.scale, originParts.scale, stepParts.scale, precision ?? 0)
  const toScaled = (parts: { sign: -1 | 1; digits: string; scale: number }): bigint =>
    BigInt(parts.digits || '0') * 10n ** BigInt(places - parts.scale) * BigInt(parts.sign)
  const stepInt = toScaled(stepParts)
  if (stepInt === 0n) return value
  const originInt = toScaled(originParts)
  const offset = toScaled(base) - originInt
  const rounded = floorDivBigInt(offset * 2n + stepInt, stepInt * 2n)
  const snapped = originInt + rounded * stepInt
  const sign: -1 | 1 = snapped < 0n ? -1 : 1
  return formatDecimalParts(sign, (snapped < 0n ? -snapped : snapped).toString(), places)
}

function formatDecimalParts(
  sign: -1 | 1,
  digits: string,
  scale: number,
  precision?: number
): string {
  let nextScale = scale
  let nextDigits = digits.replace(/^0+(?=\d)/, '') || '0'
  if (precision !== undefined) {
    if (nextScale < precision) {
      nextDigits = nextDigits.padEnd(nextDigits.length + (precision - nextScale), '0')
      nextScale = precision
    } else if (nextScale > precision) {
      const cut = nextDigits.length - (nextScale - precision)
      const kept = nextDigits.slice(0, cut) || '0'
      const roundDigit = nextDigits[cut] ?? '0'
      nextDigits = kept
      nextScale = precision
      if (roundDigit >= '5') {
        const bumped = (BigInt(nextDigits || '0') + 1n).toString()
        nextDigits = bumped
      }
    }
  }
  nextDigits = nextDigits.replace(/^0+(?=\d)/, '') || '0'
  const wholeLen = Math.max(nextDigits.length - nextScale, 1)
  const padded = nextDigits.padStart(wholeLen + nextScale, '0')
  const whole = padded.slice(0, padded.length - nextScale) || '0'
  const frac = nextScale > 0 ? padded.slice(padded.length - nextScale) : ''
  const body = frac ? `${whole}.${frac}` : whole
  return sign < 0 && body !== '0' ? `-${body}` : body
}

/** Add `delta` (a finite step) onto a decimal string. */
export function addDecimalString(current: string, delta: number, precision?: number): string {
  const base = splitDecimal(current)
  if (!base) return current
  const deltaText = toDecimalString(delta)
  const step = splitDecimal(deltaText)
  if (!step) return current
  const scale = Math.max(base.scale, step.scale, precision ?? 0)
  const left = BigInt(base.digits || '0') * 10n ** BigInt(scale - base.scale) * BigInt(base.sign)
  const right = BigInt(step.digits || '0') * 10n ** BigInt(scale - step.scale) * BigInt(step.sign)
  const sum = left + right
  const sign: -1 | 1 = sum < 0n ? -1 : 1
  return formatDecimalParts(sign, (sum < 0n ? -sum : sum).toString(), scale, precision)
}

export function stepInputNumberModel(
  current: InputNumberModel,
  step: number,
  direction: 'up' | 'down',
  min: number = -Infinity,
  max: number = Infinity,
  precision?: number
): InputNumberModel {
  if (typeof current === 'string') {
    const delta = direction === 'up' ? Math.abs(step || 1) : -Math.abs(step || 1)
    let next: string | number = clampDecimalModel(addDecimalString(current, delta), min, max)
    if (precision !== undefined) next = formatDecimalModelPrecision(next, precision)
    return next
  }
  return stepValue(current, step, direction, min, max, precision)
}

export function commitInputNumberModel(
  raw: InputNumberModel,
  current: InputNumberModel,
  options: CommitInputNumberOptions = {}
): { value: InputNumberModel; changed: boolean } {
  if (typeof raw === 'string') {
    const min = options.min ?? -Infinity
    const max = options.max ?? Infinity
    let next: string | number = clampDecimalModel(raw, min, max)
    if (options.snapToStep) {
      next = clampDecimalResult(
        snapDecimalModelToStep(next, min, options.step ?? 1, options.precision),
        min,
        max
      )
    }
    if (options.precision !== undefined) next = formatDecimalModelPrecision(next, options.precision)
    return { value: next, changed: next !== current }
  }
  const numericCurrent = typeof current === 'number' ? current : null
  const committed = commitInputNumberValue(raw, numericCurrent, options)
  return committed
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
  step?: number
  /** When true, blur and Enter snap onto the step grid. Buttons always step. */
  snapToStep?: boolean
}

/** Snap onto the step grid. Origin is `min` when it is finite, otherwise 0. */
export function snapInputNumberToStep(
  value: number,
  min: number,
  step: number,
  precision?: number
): number {
  const origin = Number.isFinite(min) ? min : 0
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1
  const places = Math.max(
    countDecimalPlaces(safeStep),
    countDecimalPlaces(origin),
    precision ?? 0,
    countDecimalPlaces(value)
  )
  const factor = 10 ** places
  const stepInt = Math.round(safeStep * factor)
  if (stepInt === 0) return value
  const offsetInt = Math.round((value - origin) * factor)
  return (Math.round(origin * factor) + Math.round(offsetInt / stepInt) * stepInt) / factor
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
      if (options.snapToStep) {
        next = snapInputNumberToStep(next, min, options.step ?? 1, options.precision)
        next = clampValue(next, min, max)
      }
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
 * Number callers keep the original `number | undefined` static contract via
 * the first overload; the string model steps exactly without Number coercion.
 */
export function getInputNumberKeyboardNextValue(
  key: string,
  current: number | null,
  options?: InputNumberKeyboardOptions
): number | undefined
export function getInputNumberKeyboardNextValue(
  key: string,
  current: InputNumberModel,
  options?: InputNumberKeyboardOptions
): InputNumberModel | undefined
export function getInputNumberKeyboardNextValue(
  key: string,
  current: InputNumberModel,
  options: InputNumberKeyboardOptions = {}
): InputNumberModel | undefined {
  if (options.keyboard === false) return undefined
  const min = options.min ?? -Infinity
  const max = options.max ?? Infinity
  const step = options.step ?? 1
  const precision = options.precision
  const largeStep = step * 10

  switch (key) {
    case 'ArrowUp':
      return stepInputNumberModel(current, step, 'up', min, max, precision)
    case 'ArrowDown':
      return stepInputNumberModel(current, step, 'down', min, max, precision)
    case 'PageUp':
      return stepInputNumberModel(current, largeStep, 'up', min, max, precision)
    case 'PageDown':
      return stepInputNumberModel(current, largeStep, 'down', min, max, precision)
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
