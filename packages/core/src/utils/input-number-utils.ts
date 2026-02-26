/**
 * InputNumber component styling utilities
 */

import type { InputSize, InputStatus } from '../types/input'
import { classNames } from './class-names'

/**
 * Base input wrapper classes
 */
export function getInputNumberWrapperClasses(disabled?: boolean): string {
  return classNames(
    'inline-flex items-center relative w-full',
    'border rounded-md shadow-sm',
    'bg-[var(--tiger-surface,#ffffff)]',
    'transition-colors',
    disabled
      ? 'bg-[var(--tiger-surface-muted,#f3f4f6)] cursor-not-allowed opacity-60'
      : 'hover:border-[var(--tiger-primary,#2563eb)]'
  )
}

/**
 * Status-based border classes for wrapper
 */
const WRAPPER_STATUS_CLASSES: Record<InputStatus, string> = {
  default: 'border-[var(--tiger-border,#e5e7eb)]',
  error: 'border-red-500',
  success: 'border-green-500',
  warning: 'border-yellow-500'
}

const WRAPPER_FOCUS_STATUS_CLASSES: Record<InputStatus, string> = {
  default: 'ring-[var(--tiger-primary,#2563eb)]',
  error: 'ring-red-500',
  success: 'ring-green-500',
  warning: 'ring-yellow-500'
}

export function getInputNumberStatusClasses(status: InputStatus = 'default'): string {
  return WRAPPER_STATUS_CLASSES[status]
}

export function getInputNumberFocusRingColor(status: InputStatus = 'default'): string {
  return WRAPPER_FOCUS_STATUS_CLASSES[status]
}

/**
 * Size-based wrapper height classes
 */
const WRAPPER_SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12'
}

export function getInputNumberSizeClasses(size: InputSize = 'md'): string {
  return WRAPPER_SIZE_CLASSES[size]
}

/**
 * Inner input element classes (no border, no outline)
 */
const INPUT_SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'text-sm px-2',
  md: 'text-base px-3',
  lg: 'text-lg px-4'
}

export function getInputNumberInputClasses(
  size: InputSize = 'md',
  hasControlsRight?: boolean,
  hasControlsBoth?: boolean
): string {
  return classNames(
    'w-full h-full bg-transparent border-0 outline-none',
    'text-[var(--tiger-text,#111827)]',
    'placeholder:text-[var(--tiger-text-muted,#6b7280)]',
    'disabled:text-[var(--tiger-text-muted,#6b7280)] disabled:cursor-not-allowed',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
    INPUT_SIZE_CLASSES[size],
    hasControlsRight && 'pr-8',
    hasControlsBoth && 'px-8 text-center'
  )
}

/**
 * Step button classes (right-stacked layout)
 */
export function getInputNumberStepButtonClasses(
  position: 'up' | 'down',
  disabled?: boolean
): string {
  return classNames(
    'flex items-center justify-center',
    'w-7 h-1/2',
    'border-l border-[var(--tiger-border,#e5e7eb)]',
    'text-[var(--tiger-text-muted,#6b7280)]',
    'transition-colors cursor-pointer select-none',
    position === 'up' ? 'border-b border-b-[var(--tiger-border,#e5e7eb)]' : '',
    disabled
      ? 'opacity-40 cursor-not-allowed'
      : 'hover:text-[var(--tiger-primary,#2563eb)] hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
  )
}

/**
 * Step button classes (both-sides layout)
 */
export function getInputNumberSideButtonClasses(
  position: 'left' | 'right',
  disabled?: boolean
): string {
  return classNames(
    'flex items-center justify-center',
    'w-8 h-full',
    'text-[var(--tiger-text-muted,#6b7280)]',
    'transition-colors cursor-pointer select-none',
    position === 'left'
      ? 'border-r border-r-[var(--tiger-border,#e5e7eb)] rounded-l-md'
      : 'border-l border-l-[var(--tiger-border,#e5e7eb)] rounded-r-md',
    disabled
      ? 'opacity-40 cursor-not-allowed'
      : 'hover:text-[var(--tiger-primary,#2563eb)] hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
  )
}

/**
 * Right-side controls container (stacked up/down arrows)
 */
export const inputNumberControlsRightClasses = 'absolute right-0 top-0 h-full flex flex-col'

/**
 * Up/Down SVG path data
 */
export const inputNumberUpIconPathD = 'M7 10l5-5 5 5H7z'
export const inputNumberDownIconPathD = 'M7 7l5 5 5-5H7z'
export const inputNumberMinusIconPathD = 'M5 12h14'
export const inputNumberPlusIconPathD = 'M12 5v14M5 12h14'

/**
 * Clamp a number value to [min, max] range
 */
export function clampValue(value: number, min: number = -Infinity, max: number = Infinity): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Step a value up or down, clamping to [min, max]
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
  const raw = direction === 'up' ? base + step : base - step
  const clamped = clampValue(raw, min, max)
  return precision !== undefined ? formatPrecision(clamped, precision) : clamped
}

/**
 * Format a number to a fixed precision
 */
export function formatPrecision(value: number, precision: number): number {
  return Number(value.toFixed(precision))
}

/**
 * Check if value is at min boundary
 */
export function isAtMin(value: number | null | undefined, min: number = -Infinity): boolean {
  if (value === null || value === undefined) return false
  return value <= min
}

/**
 * Check if value is at max boundary
 */
export function isAtMax(value: number | null | undefined, max: number = Infinity): boolean {
  if (value === null || value === undefined) return false
  return value >= max
}
