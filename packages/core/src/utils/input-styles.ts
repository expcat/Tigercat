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

const PADDING_LEFT: Record<InputSize, string> = {
  sm: 'pl-2',
  md: 'pl-3',
  lg: 'pl-4'
}

const PADDING_RIGHT: Record<InputSize, string> = {
  sm: 'pr-2',
  md: 'pr-3',
  lg: 'pr-4'
}

const PREFIX_PADDING: Record<InputSize, string> = {
  sm: 'pl-8',
  md: 'pl-10',
  lg: 'pl-12'
}

const SUFFIX_PADDING: Record<InputSize, string> = {
  sm: 'pr-8',
  md: 'pr-10',
  lg: 'pr-12'
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
export function getInputClasses(options: GetInputClassesOptions | InputSize = 'md'): string {
  const opts: GetInputClassesOptions =
    typeof options === 'string'
      ? { size: options, status: 'default' }
      : { size: 'md', status: 'default', ...options }

  const { size = 'md', status = 'default', hasPrefix, hasSuffix } = opts

  return classNames(
    ...BASE_INPUT_CLASSES,
    INPUT_SIZE_CLASSES[size],
    STATUS_CLASSES[status],
    hasPrefix ? PREFIX_PADDING[size] : PADDING_LEFT[size],
    hasSuffix ? SUFFIX_PADDING[size] : PADDING_RIGHT[size]
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
  // Try to align it to the right, inside the input.
  const padding = {
    sm: 'pr-2',
    md: 'pr-3',
    lg: 'pr-4'
  }[size]

  return classNames(
    'absolute inset-y-0 right-0 flex items-center pointer-events-none',
    padding,
    'text-red-500 text-sm'
  )
}
