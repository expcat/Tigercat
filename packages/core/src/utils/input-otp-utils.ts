import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import type { InputOTPType } from '../types/input-otp'
import { classNames } from './class-names'

export interface InputOTPCharOptions {
  type?: InputOTPType
  pattern?: RegExp
}

export interface InputOTPApplyResult {
  value: string
  /** Slot index that should receive focus after the update */
  nextIndex: number
}

const OTP_TYPE_PATTERNS: Record<InputOTPType, RegExp> = {
  numeric: /^[0-9]$/,
  alphanumeric: /^[a-zA-Z0-9]$/
}

function getOtpCharPattern(options: InputOTPCharOptions): RegExp {
  const pattern = options.pattern
  if (!pattern) return OTP_TYPE_PATTERNS[options.type ?? 'numeric']
  // Strip stateful flags so repeated .test() calls stay deterministic
  return pattern.global || pattern.sticky
    ? new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''))
    : pattern
}

/**
 * Filter a string down to the characters accepted by the OTP configuration.
 */
export function sanitizeOtpInput(raw: string, options: InputOTPCharOptions = {}): string {
  const pattern = getOtpCharPattern(options)
  let result = ''
  for (const char of raw) {
    if (pattern.test(char)) result += char
  }
  return result
}

/**
 * Normalize an externally provided value (controlled prop / default value):
 * filter invalid characters and truncate to `length`.
 */
export function normalizeOtpValue(
  raw: string,
  length: number,
  options: InputOTPCharOptions = {}
): string {
  return sanitizeOtpInput(raw, options).slice(0, length)
}

/**
 * Distribute pasted text across the slots: filter, truncate, overwrite from
 * slot 0. Returns `null` when nothing valid remains (the paste is ignored).
 */
export function distributeOtpPaste(
  pasted: string,
  length: number,
  options: InputOTPCharOptions = {}
): InputOTPApplyResult | null {
  const sanitized = sanitizeOtpInput(pasted, options)
  if (!sanitized) return null
  const value = sanitized.slice(0, length)
  return { value, nextIndex: Math.min(value.length, length - 1) }
}

/**
 * Apply characters typed into the slot at `index`. Multi-character input
 * (mobile OTP autofill types the whole code into one slot) is distributed
 * from slot 0 like a paste. Values stay contiguous: typing past the filled
 * range appends at the first empty slot instead of leaving gaps.
 */
export function applyOtpCharInput(
  current: string,
  index: number,
  chars: string,
  length: number,
  options: InputOTPCharOptions = {}
): InputOTPApplyResult {
  const sanitized = sanitizeOtpInput(chars, options)
  if (!sanitized) return { value: current, nextIndex: index }

  if (sanitized.length > 1) {
    return distributeOtpPaste(sanitized, length, options) ?? { value: current, nextIndex: index }
  }

  const effectiveIndex = Math.min(index, current.length, length - 1)
  const value = (
    current.slice(0, effectiveIndex) +
    sanitized +
    current.slice(effectiveIndex + 1)
  ).slice(0, length)
  return { value, nextIndex: Math.min(effectiveIndex + 1, length - 1) }
}

/**
 * Backspace behaviour: a filled slot is cleared in place (later characters
 * shift left); an empty slot clears the previous slot and moves focus back.
 */
export function applyOtpBackspace(current: string, index: number): InputOTPApplyResult {
  if (index < current.length) {
    return { value: current.slice(0, index) + current.slice(index + 1), nextIndex: index }
  }
  if (index > 0) {
    return { value: current.slice(0, index - 1) + current.slice(index), nextIndex: index - 1 }
  }
  return { value: current, nextIndex: 0 }
}

/**
 * Delete key behaviour: clear the character at `index` (if any) and stay.
 */
export function applyOtpDelete(current: string, index: number): InputOTPApplyResult {
  if (index < current.length) {
    return { value: current.slice(0, index) + current.slice(index + 1), nextIndex: index }
  }
  return { value: current, nextIndex: index }
}

export function isOtpComplete(value: string, length: number): boolean {
  return length > 0 && value.length >= length
}

/**
 * Indices of slots after which a group separator is rendered. Returns an
 * empty array when `groups` is missing or does not sum to `length`.
 */
export function getOtpSeparatorIndices(length: number, groups?: number[]): number[] {
  if (!groups || groups.length === 0) return []
  const indices: number[] = []
  let sum = 0
  for (const group of groups) {
    if (!Number.isInteger(group) || group <= 0) return []
    sum += group
    if (sum < length) indices.push(sum - 1)
  }
  return sum === length ? indices : []
}

/**
 * Format a slot aria-label template. Supports `{index}` (1-based) and `{total}`.
 */
export function formatOtpSlotLabel(template: string, index: number, total: number): string {
  return template.replace('{index}', String(index)).replace('{total}', String(total))
}

const OTP_CONTAINER_GAP: Record<ComponentSize, string> = {
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-3'
}

export function getOtpContainerClasses(size: ComponentSize = 'md'): string {
  return classNames('inline-flex items-center', OTP_CONTAINER_GAP[size])
}

const OTP_TEXT_SIZE_CLASSES: Record<ComponentSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

const OTP_SLOT_SIZE_CLASSES: Record<ComponentSize, string> = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg'
}

const OTP_SLOT_STATUS_CLASSES: Record<InputStatus, string> = {
  default:
    'border-[var(--tiger-border,#e5e7eb)] focus:ring-[var(--tiger-primary,#2563eb)]/40 focus:border-transparent',
  error: 'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-900',
  success: 'border-green-500 focus:ring-green-500 focus:border-green-500 text-green-900',
  warning: 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500 text-yellow-900'
}

export interface GetOtpSlotClassesOptions {
  disabled?: boolean
  readonly?: boolean
}

export function getOtpSlotClasses(
  size: ComponentSize = 'md',
  status: InputStatus = 'default',
  options: GetOtpSlotClassesOptions = {}
): string {
  return classNames(
    'text-center border rounded-[var(--tiger-radius-md,0.5rem)]',
    'bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text,#111827)]',
    'focus:outline-none focus:ring-2 transition-colors',
    'disabled:bg-[var(--tiger-surface-muted,#f3f4f6)] disabled:text-[var(--tiger-text-muted,#6b7280)] disabled:cursor-not-allowed',
    OTP_SLOT_SIZE_CLASSES[size],
    OTP_SLOT_STATUS_CLASSES[status],
    options.readonly && 'cursor-default'
  )
}

export function getOtpSeparatorClasses(size: ComponentSize = 'md'): string {
  return classNames(
    'select-none text-[var(--tiger-text-muted,#6b7280)]',
    OTP_TEXT_SIZE_CLASSES[size]
  )
}

export function getOtpErrorClasses(): string {
  return 'mt-1 text-sm text-[var(--tiger-error,#dc2626)]'
}
