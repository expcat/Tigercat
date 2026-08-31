import { classNames } from './class-names'
import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import { clampValue, countDecimalPlaces, formatPrecision } from './input-number-utils'

export const stepperBaseClasses = 'inline-flex items-center'

const sizePad: Record<ComponentSize, string> = {
  sm: 'h-7 text-xs',
  md: 'h-9 text-sm',
  lg: 'h-11 text-base'
}

const btnSize: Record<ComponentSize, string> = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11'
}

export function getStepperInputClasses(
  size: ComponentSize,
  disabled = false,
  status: InputStatus = 'default'
): string {
  return classNames(
    'text-center border-y outline-none font-mono tiger-motion-aware',
    '[transition:var(--tiger-transition-base,color_150ms_ease,border-color_150ms_ease)]',
    sizePad[size],
    'w-14',
    'bg-[var(--tiger-surface,#ffffff)]',
    'text-[var(--tiger-text,#111827)]',
    status === 'error'
      ? 'border-[var(--tiger-error,#dc2626)]'
      : 'border-[var(--tiger-border,#d1d5db)]',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]',
    disabled && 'cursor-not-allowed text-[var(--tiger-text-muted,#6b7280)]'
  )
}

export function getStepperButtonClasses(
  size: ComponentSize,
  disabled: boolean,
  position: 'start' | 'end' | 'left' | 'right'
): string {
  const atStart = position === 'start' || position === 'left'
  return classNames(
    'inline-flex items-center justify-center border tiger-motion-aware',
    '[transition:var(--tiger-transition-base,color_150ms_ease,background-color_150ms_ease)]',
    btnSize[size],
    atStart ? 'rounded-s-md' : 'rounded-e-md',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]',
    disabled
      ? 'opacity-50 cursor-not-allowed bg-[var(--tiger-fill,#f3f4f6)]'
      : 'cursor-pointer bg-[var(--tiger-fill,#f3f4f6)] hover:bg-[var(--tiger-surface-muted,#e5e7eb)]',
    'text-[var(--tiger-text,#111827)]',
    'border-[var(--tiger-border,#d1d5db)]'
  )
}

export const minusPathD = 'M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z'
export const plusPathD =
  'M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
export const stepperIconViewBox = '0 0 20 20'

export function clampStepperValue(
  value: number,
  min: number,
  max: number,
  precision?: number,
  step?: number
): number {
  const safeMin = Number.isFinite(min) || min === Number.NEGATIVE_INFINITY ? min : 0
  const safeMax = Number.isFinite(max) || max === Number.POSITIVE_INFINITY ? max : safeMin
  const lower = Math.min(safeMin, safeMax)
  const upper = Math.max(safeMin, safeMax)
  const fallback = Number.isFinite(lower) ? lower : 0
  let v = clampValue(Number.isFinite(value) ? value : fallback, lower, upper)
  if (step !== undefined && Number.isFinite(step) && step > 0) {
    const origin = Number.isFinite(lower) ? lower : 0
    const places = Math.max(countDecimalPlaces(step), countDecimalPlaces(origin), precision ?? 0)
    const factor = 10 ** places
    const stepInt = Math.round(step * factor)
    if (stepInt !== 0) {
      const offsetInt = Math.round((v - origin) * factor)
      v = (Math.round(origin * factor) + Math.round(offsetInt / stepInt) * stepInt) / factor
      v = clampValue(v, lower, upper)
    }
  }
  if (precision !== undefined && Number.isFinite(precision) && precision >= 0) {
    v = formatPrecision(v, Math.floor(precision))
  }
  return v
}
