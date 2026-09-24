/**
 * Checkbox visual classes and group value helpers.
 */

import type { ComponentSize } from '../types/base'
import type { CheckboxGroupValue, CheckboxValue } from '../types/checkbox'
import type { InputStatus } from '../types/input'
import { classNames } from './class-names'

export const checkboxRootBaseClasses = 'inline-flex items-center'

export const checkboxVisualBaseClasses =
  'relative inline-flex items-center justify-center rounded border-2 tiger-motion-aware [transition:var(--tiger-transition-base)] peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--tiger-focus-ring)] peer-focus-visible:ring-offset-[var(--tiger-surface)]'

export const checkboxSizeClasses: Record<ComponentSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}

export const checkboxIconSizeClasses: Record<ComponentSize, string> = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5'
}

export const checkboxLabelSizeClasses: Record<ComponentSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
}

export const checkboxCheckPathD = 'M3.8 8.3l2.6 2.6 5.8-5.8'
export const checkboxIndeterminatePathD = 'M4 8h8'
export const checkboxIconViewBox = '0 0 16 16'

export interface GetCheckboxVisualClassesOptions {
  size?: ComponentSize
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  status?: InputStatus
}

export function getCheckboxVisualClasses({
  size = 'md',
  checked = false,
  indeterminate = false,
  disabled = false,
  status = 'default'
}: GetCheckboxVisualClassesOptions = {}): string {
  const filled = checked || indeterminate
  const error = status === 'error' && !disabled
  return classNames(
    checkboxVisualBaseClasses,
    checkboxSizeClasses[size],
    disabled
      ? 'cursor-not-allowed border-[var(--tiger-border)] bg-[var(--tiger-surface-muted)] text-[var(--tiger-text-secondary)]'
      : filled
        ? 'cursor-pointer border-[var(--tiger-primary)] bg-[var(--tiger-primary)] text-[var(--tiger-on-primary)]'
        : error
          ? 'cursor-pointer border-[var(--tiger-error)] bg-[var(--tiger-surface)]'
          : 'cursor-pointer border-[var(--tiger-border)] bg-[var(--tiger-surface)]'
  )
}

export function getCheckboxLabelClasses(
  size: ComponentSize = 'md',
  disabled: boolean = false
): string {
  return classNames(
    checkboxRootBaseClasses,
    checkboxLabelSizeClasses[size],
    disabled ? 'cursor-not-allowed' : 'cursor-pointer select-none'
  )
}

export function getCheckboxLabelTextClasses(
  size: ComponentSize = 'md',
  disabled: boolean = false
): string {
  return classNames(
    'ms-2 select-none',
    checkboxLabelSizeClasses[size],
    disabled
      ? 'text-[var(--tiger-text-secondary)] cursor-not-allowed'
      : 'text-[var(--tiger-text)] cursor-pointer'
  )
}

export function checkboxValuesEqual(a: CheckboxValue, b: CheckboxValue): boolean {
  if (Object.is(a, b)) return true
  if (typeof a === 'boolean' || typeof b === 'boolean') return false
  return String(a) === String(b)
}

export function checkboxGroupIncludes(
  values: readonly CheckboxValue[],
  val: CheckboxValue
): boolean {
  return values.some((item) => checkboxValuesEqual(item, val))
}

export function toggleCheckboxGroupValue(
  current: readonly CheckboxValue[],
  val: CheckboxValue,
  checked: boolean
): CheckboxGroupValue {
  const exists = checkboxGroupIncludes(current, val)
  if (checked) {
    if (exists) return current as CheckboxGroupValue
    return [...current, val]
  }
  if (!exists) return current as CheckboxGroupValue
  return current.filter((item) => !checkboxValuesEqual(item, val))
}
