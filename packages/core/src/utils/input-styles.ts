/**
 * Input component styling utilities
 */

import type { InputSize, InputStatus } from '../types/input'
import { classNames } from './class-names'

/**
 * Base input classes that apply to all inputs
 */
const BASE_INPUT_CLASSES = [
  'w-full',
  'border',
  'rounded-md',
  'shadow-sm',
  'bg-[var(--tiger-surface,#ffffff)]',
  'text-[var(--tiger-text,#111827)]',
  'focus:outline-none',
  'focus:ring-2',
  'transition-colors',
  'disabled:bg-[var(--tiger-surface-muted,#f3f4f6)]',
  'disabled:text-[var(--tiger-text-muted,#6b7280)]',
  'disabled:cursor-not-allowed',
  'placeholder:text-[var(--tiger-text-muted,#6b7280)]'
] as const

const STATUS_CLASSES: Record<InputStatus, string> = {
  default:
    'border-[var(--tiger-border,#e5e7eb)] focus:ring-[var(--tiger-primary,#2563eb)] focus:border-transparent',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-300',
  success:
    'border-green-500 focus:ring-green-500 focus:border-green-500 text-green-900 placeholder-green-300',
  warning:
    'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500 text-yellow-900 placeholder-yellow-300'
}

const INPUT_SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'py-1 text-sm',
  md: 'py-2 text-base',
  lg: 'py-3 text-lg'
}

const INPUT_PADDING: Record<
  InputSize,
  { left: string; right: string; prefixLeft: string; suffixRight: string }
> = {
  sm: { left: 'pl-2', right: 'pr-2', prefixLeft: 'pl-8', suffixRight: 'pr-8' },
  md: { left: 'pl-3', right: 'pr-3', prefixLeft: 'pl-10', suffixRight: 'pr-10' },
  lg: { left: 'pl-4', right: 'pr-4', prefixLeft: 'pl-12', suffixRight: 'pr-12' }
}

export interface GetInputClassesOptions {
  size?: InputSize
  status?: InputStatus
  hasPrefix?: boolean
  hasSuffix?: boolean
}

/**
 * Get complete input class string
 */
export function getInputClasses(options: GetInputClassesOptions = {}): string {
  const { size = 'md', status = 'default', hasPrefix, hasSuffix } = options
  const pad = INPUT_PADDING[size]

  return classNames(
    ...BASE_INPUT_CLASSES,
    INPUT_SIZE_CLASSES[size],
    STATUS_CLASSES[status],
    hasPrefix ? pad.prefixLeft : pad.left,
    hasSuffix ? pad.suffixRight : pad.right
  )
}

export function getInputWrapperClasses(): string {
  return 'relative w-full'
}

export function getInputAffixClasses(
  position: 'prefix' | 'suffix',
  size: InputSize = 'md'
): string {
  const base = 'absolute top-0 bottom-0 flex items-center justify-center text-gray-500'
  const posClass = position === 'prefix' ? 'left-0' : 'right-0'
  const widthClass = {
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-12'
  }[size]

  return classNames(base, posClass, widthClass)
}

export function getInputErrorClasses(size: InputSize = 'md'): string {
  return classNames(
    'absolute inset-y-0 right-0 flex items-center pointer-events-none',
    INPUT_PADDING[size].right,
    'text-red-500 text-sm'
  )
}

/**
 * Extract value from an input element.
 * Returns the numeric value for number inputs (if valid), otherwise the string value.
 */
export function parseInputValue(target: HTMLInputElement, type: string): string | number {
  if (type === 'number') {
    return Number.isNaN(target.valueAsNumber) ? target.value : target.valueAsNumber
  }
  return target.value
}
