/**
 * Input component styling utilities
 */

import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import { classNames } from './class-names'
import { devWarn } from './dev-warn'
import { mixStatusTowardText, mixStatusTowardTextClass } from './status-mix'

const errorTextClass = mixStatusTowardTextClass('text', '--tiger-error', '#dc2626')
const successTextClass = mixStatusTowardTextClass('text', '--tiger-success', '#16a34a')
const warningTextClass = mixStatusTowardTextClass('text', '--tiger-warning', '#d97706')
const errorPlaceholderClass = `placeholder:text-[${mixStatusTowardText('--tiger-error', '#dc2626')}]`
const successPlaceholderClass = `placeholder:text-[${mixStatusTowardText('--tiger-success', '#16a34a')}]`
const warningPlaceholderClass = `placeholder:text-[${mixStatusTowardText('--tiger-warning', '#d97706')}]`

const FOCUS_RING =
  'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40'
const ERROR_FOCUS_RING = 'focus-visible:ring-2 focus-visible:ring-[var(--tiger-error,#dc2626)]/40'

/**
 * Field-only classes (padding, type, disabled text). Chrome lives on the
 * group-child root via {@link getInputChromeClasses}.
 */
const INPUT_FIELD_BASE_CLASSES = [
  'bg-transparent',
  'text-[var(--tiger-text,#111827)]',
  'focus:outline-none',
  FOCUS_RING,
  'disabled:text-[var(--tiger-text-muted,#6b7280)]',
  'disabled:cursor-not-allowed',
  'placeholder:text-[var(--tiger-text-muted,#6b7280)]'
] as const

/**
 * Border / radius / surface for a chrome node. Native fields that ARE the
 * chrome node (Textarea, MaskInput) keep `focus-visible`; Input's wrapper
 * does not paint a ring — the nested field does.
 */
const INPUT_CHROME_BASE_CLASSES = [
  'border',
  'rounded-[var(--tiger-radius-md,0.5rem)]',
  'bg-[var(--tiger-surface,#ffffff)]',
  'tiger-motion-aware',
  '[transition:var(--tiger-transition-base,color_150ms_ease)]'
] as const

const NATIVE_CHROME_FOCUS_CLASSES = ['disabled:bg-[var(--tiger-surface-muted,#f3f4f6)]'] as const

const WRAPPER_CHROME_FOCUS_CLASSES = [
  'has-[:disabled]:bg-[var(--tiger-surface-muted,#f3f4f6)]'
] as const

const NATIVE_STATUS_CLASSES: Record<InputStatus, string> = {
  default: 'border-[var(--tiger-border,#e5e7eb)] focus-visible:border-transparent',
  error: classNames(
    'border-[var(--tiger-error,#dc2626)]',
    ERROR_FOCUS_RING,
    errorTextClass,
    errorPlaceholderClass
  ),
  success: classNames(
    'border-[var(--tiger-success,#16a34a)]',
    successTextClass,
    successPlaceholderClass
  ),
  warning: classNames(
    'border-[var(--tiger-warning,#d97706)]',
    warningTextClass,
    warningPlaceholderClass
  )
}

const WRAPPER_STATUS_CLASSES: Record<InputStatus, string> = {
  default: 'border-[var(--tiger-border,#e5e7eb)]',
  error: 'border-[var(--tiger-error,#dc2626)]',
  success: 'border-[var(--tiger-success,#16a34a)]',
  warning: 'border-[var(--tiger-warning,#d97706)]'
}

const FIELD_STATUS_CLASSES: Record<InputStatus, string> = {
  default: '',
  error: classNames(errorTextClass, errorPlaceholderClass, ERROR_FOCUS_RING),
  success: classNames(successTextClass, successPlaceholderClass),
  warning: classNames(warningTextClass, warningPlaceholderClass)
}

const INPUT_SIZE_CLASSES: Record<ComponentSize, string> = {
  sm: 'py-1 text-sm',
  md: 'py-2 text-base',
  lg: 'py-3 text-lg'
}

const INPUT_PADDING: Record<
  ComponentSize,
  {
    start: string
    end: string
    prefixStart: string
    suffixEnd: string
    dualSuffixEnd: string
    tripleSuffixEnd: string
  }
> = {
  sm: {
    start: 'ps-2',
    end: 'pe-2',
    prefixStart: 'ps-8',
    suffixEnd: 'pe-8',
    dualSuffixEnd: 'pe-16',
    tripleSuffixEnd: 'pe-24'
  },
  md: {
    start: 'ps-3',
    end: 'pe-3',
    prefixStart: 'ps-10',
    suffixEnd: 'pe-10',
    dualSuffixEnd: 'pe-20',
    tripleSuffixEnd: 'pe-[7.5rem]'
  },
  lg: {
    start: 'ps-4',
    end: 'pe-4',
    prefixStart: 'ps-12',
    suffixEnd: 'pe-12',
    dualSuffixEnd: 'pe-24',
    tripleSuffixEnd: 'pe-36'
  }
}

const INPUT_INLINE_END_INSET: Record<ComponentSize, readonly [string, string, string]> = {
  sm: ['end-0', 'end-8', 'end-16'],
  md: ['end-0', 'end-10', 'end-20'],
  lg: ['end-0', 'end-12', 'end-24']
}

export interface GetInputClassesOptions {
  size?: ComponentSize
  status?: InputStatus
  hasPrefix?: boolean
  hasSuffix?: boolean
  /** Two trailing slots (clear + password, or suffix + one action). @default false */
  hasDualSuffix?: boolean
  /** Three trailing slots (suffix + clear + password). @default false */
  hasTripleSuffix?: boolean
  /** Group child uses remaining flex space instead of 100% of the group. */
  inGroup?: boolean
}

export interface GetInputTrailingButtonOptions {
  /** How many end-side slots sit closer to the inline end than this button. */
  offsetSlots?: number
}

export interface InputTrailingLayout {
  showClear: boolean
  showPasswordToggle: boolean
  showCustomSuffix: boolean
  slotCount: number
  clearOffsetSlots: number
  passwordOffsetSlots: number
  suffixOffsetSlots: number
  hasSuffix: boolean
  hasDualSuffix: boolean
  hasTripleSuffix: boolean
}

export function resolveInputTrailingLayout(input: {
  clearable?: boolean
  showPassword?: boolean
  type?: string
  disabled?: boolean
  readOnly?: boolean
  valueLength: number
  hasCustomSuffix?: boolean
}): InputTrailingLayout {
  const showClear = Boolean(
    input.clearable && !input.disabled && !input.readOnly && input.valueLength > 0
  )
  const showPasswordToggle = Boolean(
    input.showPassword && input.type === 'password' && !input.disabled
  )
  const showCustomSuffix = Boolean(input.hasCustomSuffix)
  const buttonCount = Number(showClear) + Number(showPasswordToggle)
  const slotCount = buttonCount + Number(showCustomSuffix)

  return {
    showClear,
    showPasswordToggle,
    showCustomSuffix,
    slotCount,
    passwordOffsetSlots: 0,
    clearOffsetSlots: showPasswordToggle ? 1 : 0,
    suffixOffsetSlots: buttonCount,
    hasSuffix: slotCount >= 1,
    hasDualSuffix: slotCount >= 2,
    hasTripleSuffix: slotCount >= 3
  }
}

export function resolveReadOnlyFlag(readonly?: boolean, readOnly?: boolean): boolean {
  if (typeof readonly === 'boolean' && typeof readOnly === 'boolean' && readonly !== readOnly) {
    devWarn(
      'Input.readOnly',
      'Both `readonly` and `readOnly` were passed and they disagree; using `readonly`.'
    )
    return readonly
  }
  return Boolean(readonly ?? readOnly)
}

function getInputWidthClass(inGroup?: boolean): string {
  return inGroup ? 'flex-1 min-w-0' : 'w-full'
}

function getInputLayoutClasses(options: GetInputClassesOptions = {}): string {
  const { size = 'md', hasPrefix, hasSuffix, hasDualSuffix, hasTripleSuffix } = options
  const pad = INPUT_PADDING[size]
  const endPad = hasTripleSuffix
    ? pad.tripleSuffixEnd
    : hasDualSuffix
      ? pad.dualSuffixEnd
      : hasSuffix
        ? pad.suffixEnd
        : pad.end

  return classNames(INPUT_SIZE_CLASSES[size], hasPrefix ? pad.prefixStart : pad.start, endPad)
}

function insetInlineEndClass(size: ComponentSize, offsetSlots = 0): string {
  const slots = INPUT_INLINE_END_INSET[size]
  const index = Math.min(Math.max(offsetSlots, 0), slots.length - 1)
  return slots[index]
}

/**
 * Chrome (border / radius / surface / status) for a group-child root.
 * Focus ring lives on the native field (`:focus-visible`).
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
  const { status = 'default', inGroup } = options
  return classNames(
    getInputWidthClass(inGroup),
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
  const { status = 'default', inGroup } = options

  return classNames(
    getInputWidthClass(inGroup),
    ...INPUT_CHROME_BASE_CLASSES,
    'text-[var(--tiger-text,#111827)]',
    'focus:outline-none',
    status === 'error' ? ERROR_FOCUS_RING : FOCUS_RING,
    ...NATIVE_CHROME_FOCUS_CLASSES,
    'disabled:text-[var(--tiger-text-muted,#6b7280)]',
    'disabled:cursor-not-allowed',
    'placeholder:text-[var(--tiger-text-muted,#6b7280)]',
    NATIVE_STATUS_CLASSES[status],
    getInputLayoutClasses(options)
  )
}

export function getInputWrapperClasses(
  status?: InputStatus,
  options: { inGroup?: boolean } = {}
): string {
  return classNames(
    'relative',
    getInputWidthClass(options.inGroup),
    status !== undefined ? getInputChromeClasses(status) : undefined
  )
}

export function getInputAffixClasses(
  position: 'prefix' | 'suffix',
  size: ComponentSize = 'md',
  options: { offsetSlots?: number } = {}
): string {
  const base =
    'absolute top-0 bottom-0 flex items-center justify-center text-[var(--tiger-text-muted,#6b7280)]'
  const posClass =
    position === 'prefix' ? 'start-0' : insetInlineEndClass(size, options.offsetSlots)
  const widthClass = {
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-12'
  }[size]

  return classNames(base, posClass, widthClass)
}

/**
 * Error message classes — below the field (not an in-field overlay).
 * `size` is unused; kept so existing callers do not break.
 */
export function getInputErrorClasses(_size: ComponentSize = 'md'): string {
  return classNames('text-[var(--tiger-error,#dc2626)] text-sm mt-1 text-start break-words')
}

function getInputTrailingButtonPositionClasses(size: ComponentSize, offsetSlots = 0): string {
  return classNames(
    'absolute inset-y-0 flex items-center cursor-pointer',
    'focus:outline-none',
    FOCUS_RING,
    insetInlineEndClass(size, offsetSlots),
    'text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-text,#111827)]',
    INPUT_PADDING[size].end
  )
}

/**
 * Clear button classes — positioned inside the input on the inline end
 * @since 0.5.0
 */
export function getInputClearButtonClasses(
  size: ComponentSize = 'md',
  options: GetInputTrailingButtonOptions = {}
): string {
  return getInputTrailingButtonPositionClasses(size, options.offsetSlots)
}

/**
 * Password toggle button classes
 * @since 0.5.0
 */
export function getInputPasswordToggleClasses(
  size: ComponentSize = 'md',
  options: GetInputTrailingButtonOptions = {}
): string {
  return getInputTrailingButtonPositionClasses(size, options.offsetSlots)
}

/**
 * Character count classes — below the input
 * @since 0.5.0
 */
export function getInputCountClasses(isOverLimit: boolean = false): string {
  return classNames(
    'text-xs mt-1 text-end',
    isOverLimit ? 'text-[var(--tiger-error,#dc2626)]' : 'text-[var(--tiger-text-muted,#6b7280)]'
  )
}

export function formatInputCountText(count: number, maxLength?: number): string {
  return maxLength !== undefined ? `${count} / ${maxLength}` : `${count}`
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
