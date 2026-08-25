/**
 * Input component styling utilities
 */

import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import { classNames } from './class-names'

/**
 * Field-only classes (padding, type, disabled text). Chrome lives on the
 * group-child root via {@link getInputChromeClasses}.
 */
const INPUT_FIELD_BASE_CLASSES = [
  'w-full',
  'bg-transparent',
  'text-[var(--tiger-text,#111827)]',
  'focus:outline-none',
  'disabled:text-[var(--tiger-text-muted,#6b7280)]',
  'disabled:cursor-not-allowed',
  'placeholder:text-[var(--tiger-text-muted,#6b7280)]'
] as const

/**
 * Border / radius / surface for a chrome node. Native fields that ARE the
 * chrome node (Textarea, MaskInput) keep `focus:`; Input's wrapper uses
 * `focus-within:` because the focused node is nested.
 */
const INPUT_CHROME_BASE_CLASSES = [
  'border',
  'rounded-[var(--tiger-radius-md,0.5rem)]',
  'bg-[var(--tiger-surface,#ffffff)]',
  'transition-colors'
] as const

const NATIVE_CHROME_FOCUS_CLASSES = [
  'focus:ring-2',
  'disabled:bg-[var(--tiger-surface-muted,#f3f4f6)]'
] as const

const WRAPPER_CHROME_FOCUS_CLASSES = [
  'focus-within:ring-2',
  'has-[:disabled]:bg-[var(--tiger-surface-muted,#f3f4f6)]'
] as const

const NATIVE_STATUS_CLASSES: Record<InputStatus, string> = {
  default:
    'border-[var(--tiger-border,#e5e7eb)] focus:ring-[var(--tiger-primary,#2563eb)]/40 focus:border-transparent',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-300',
  success:
    'border-green-500 focus:ring-green-500 focus:border-green-500 text-green-900 placeholder-green-300',
  warning:
    'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500 text-yellow-900 placeholder-yellow-300'
}

const WRAPPER_STATUS_CLASSES: Record<InputStatus, string> = {
  default:
    'border-[var(--tiger-border,#e5e7eb)] focus-within:ring-[var(--tiger-primary,#2563eb)]/40 focus-within:border-transparent',
  error: 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500',
  success: 'border-green-500 focus-within:ring-green-500 focus-within:border-green-500',
  warning: 'border-yellow-500 focus-within:ring-yellow-500 focus-within:border-yellow-500'
}

const FIELD_STATUS_CLASSES: Record<InputStatus, string> = {
  default: '',
  error: 'text-red-900 placeholder-red-300',
  success: 'text-green-900 placeholder-green-300',
  warning: 'text-yellow-900 placeholder-yellow-300'
}

const INPUT_SIZE_CLASSES: Record<ComponentSize, string> = {
  sm: 'py-1 text-sm',
  md: 'py-2 text-base',
  lg: 'py-3 text-lg'
}

const INPUT_PADDING: Record<
  ComponentSize,
  {
    left: string
    right: string
    prefixLeft: string
    suffixRight: string
    dualSuffixRight: string
  }
> = {
  sm: {
    left: 'pl-2',
    right: 'pr-2',
    prefixLeft: 'pl-8',
    suffixRight: 'pr-8',
    dualSuffixRight: 'pr-16'
  },
  md: {
    left: 'pl-3',
    right: 'pr-3',
    prefixLeft: 'pl-10',
    suffixRight: 'pr-10',
    dualSuffixRight: 'pr-20'
  },
  lg: {
    left: 'pl-4',
    right: 'pr-4',
    prefixLeft: 'pl-12',
    suffixRight: 'pr-12',
    dualSuffixRight: 'pr-24'
  }
}

/** One affix-slot inset so a second trailing button sits beside `right-0`. */
const INPUT_SUFFIX_SLOT_INSET: Record<ComponentSize, string> = {
  sm: 'right-8',
  md: 'right-10',
  lg: 'right-12'
}

export interface GetInputClassesOptions {
  size?: ComponentSize
  status?: InputStatus
  hasPrefix?: boolean
  hasSuffix?: boolean
  /** Two trailing actions (clear + password) — double-slot right padding. @default false */
  hasDualSuffix?: boolean
}

export interface GetInputTrailingButtonOptions {
  /** Shift one affix-slot left of `right-0`. @default false */
  offset?: boolean
}

function getInputLayoutClasses(options: GetInputClassesOptions = {}): string {
  const { size = 'md', hasPrefix, hasSuffix, hasDualSuffix } = options
  const pad = INPUT_PADDING[size]

  return classNames(
    INPUT_SIZE_CLASSES[size],
    hasPrefix ? pad.prefixLeft : pad.left,
    hasDualSuffix ? pad.dualSuffixRight : hasSuffix ? pad.suffixRight : pad.right
  )
}

/**
 * Chrome (border / radius / surface / status / focus ring) for a group-child
 * root. Uses `focus-within` so a nested native field still raises the ring.
 */
export function getInputChromeClasses(status: InputStatus = 'default'): string {
  return classNames(
    ...INPUT_CHROME_BASE_CLASSES,
    ...WRAPPER_CHROME_FOCUS_CLASSES,
    WRAPPER_STATUS_CLASSES[status]
  )
}

/**
 * Native field classes without border / radius / ring. Padding, type color,
 * placeholder, and disabled text stay here.
 */
export function getInputFieldClasses(options: GetInputClassesOptions = {}): string {
  const { status = 'default' } = options
  return classNames(
    ...INPUT_FIELD_BASE_CLASSES,
    FIELD_STATUS_CLASSES[status],
    getInputLayoutClasses(options)
  )
}

/**
 * Complete classes when the native control IS the chrome node (Textarea,
 * MaskInput). Input uses {@link getInputChromeClasses} on the wrapper plus
 * {@link getInputFieldClasses} on the `<input>`.
 */
export function getInputClasses(options: GetInputClassesOptions = {}): string {
  const { status = 'default' } = options

  return classNames(
    'w-full',
    ...INPUT_CHROME_BASE_CLASSES,
    'text-[var(--tiger-text,#111827)]',
    'focus:outline-none',
    ...NATIVE_CHROME_FOCUS_CLASSES,
    'disabled:text-[var(--tiger-text-muted,#6b7280)]',
    'disabled:cursor-not-allowed',
    'placeholder:text-[var(--tiger-text-muted,#6b7280)]',
    NATIVE_STATUS_CLASSES[status],
    getInputLayoutClasses(options)
  )
}

export function getInputWrapperClasses(status?: InputStatus): string {
  return classNames(
    'relative w-full',
    status !== undefined ? getInputChromeClasses(status) : undefined
  )
}

export function getInputAffixClasses(
  position: 'prefix' | 'suffix',
  size: ComponentSize = 'md'
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

export function getInputErrorClasses(size: ComponentSize = 'md'): string {
  return classNames(
    'absolute inset-y-0 right-0 flex items-center pointer-events-none',
    INPUT_PADDING[size].right,
    'text-red-500 text-sm'
  )
}

function getInputTrailingButtonClasses(size: ComponentSize, rightClass: string): string {
  return classNames(
    'absolute inset-y-0 flex items-center cursor-pointer',
    rightClass,
    'text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-text,#111827)]',
    INPUT_PADDING[size].right
  )
}

/**
 * Clear button classes — positioned inside the input on the right
 * @since 0.5.0
 */
export function getInputClearButtonClasses(
  size: ComponentSize = 'md',
  options: GetInputTrailingButtonOptions = {}
): string {
  const rightClass = options.offset ? INPUT_SUFFIX_SLOT_INSET[size] : 'right-0'
  return getInputTrailingButtonClasses(size, rightClass)
}

/**
 * Password toggle button classes
 * @since 0.5.0
 */
export function getInputPasswordToggleClasses(size: ComponentSize = 'md'): string {
  return getInputTrailingButtonClasses(size, 'right-0')
}

/**
 * Character count classes — below the input
 * @since 0.5.0
 */
export function getInputCountClasses(isOverLimit: boolean = false): string {
  return classNames(
    'text-xs mt-1 text-right',
    isOverLimit ? 'text-[var(--tiger-error,#dc2626)]' : 'text-[var(--tiger-text-muted,#6b7280)]'
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
