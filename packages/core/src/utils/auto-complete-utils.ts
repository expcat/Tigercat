import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import type {
  AutoCompleteFilterOption,
  AutoCompleteOption,
  AutoCompleteValue
} from '../types/auto-complete'
import { classNames } from './class-names'
import { getInitialPickerActiveIndex } from './picker-utils'
import {
  selectBaseClasses,
  selectClearButtonClasses,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  selectDropdownBaseClasses,
  selectEmptyStateClasses,
  selectInGroupClasses,
  selectListboxClasses,
  selectStandaloneClasses,
  selectTrailingSlotClasses
} from './select-utils'

export type AutoCompleteKeyIntent =
  | { type: 'none' }
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'navigate'; key: string }
  | { type: 'select-active' }
  | { type: 'commit-query' }

export interface AutoCompleteCommitResult {
  value: AutoCompleteValue | undefined
  query: string
  option?: AutoCompleteOption
  didCommit: boolean
}

const INPUT_PAD_Y: Record<ComponentSize, string> = {
  sm: 'text-sm py-1.5',
  md: 'text-base py-2',
  lg: 'text-lg py-2.5'
}

const OPTION_PAD_Y: Record<ComponentSize, string> = {
  sm: 'text-sm py-1.5',
  md: 'text-base py-2',
  lg: 'text-lg py-2.5'
}

const STATUS_BORDER: Record<InputStatus, string> = {
  default: 'border-[var(--tiger-border,#d1d5db)]',
  error: 'border-[var(--tiger-error,#dc2626)]',
  success: 'border-[var(--tiger-success,#16a34a)]',
  warning: 'border-[var(--tiger-warning,#d97706)]'
}

export const autoCompleteBaseClasses = selectBaseClasses
export const autoCompleteInGroupClasses = selectInGroupClasses
export const autoCompleteStandaloneClasses = selectStandaloneClasses
export const autoCompleteDropdownClasses = selectDropdownBaseClasses
export const autoCompleteListboxClasses = selectListboxClasses
export const autoCompleteEmptyStateClasses = selectEmptyStateClasses
export const autoCompleteTrailingSlotClasses = selectTrailingSlotClasses
export const autoCompleteClearButtonClasses = selectClearButtonClasses
export const autoCompleteDoneActionClasses = selectDoneActionClasses
export const autoCompleteDoneButtonClasses = selectDoneButtonClasses
export const autoCompleteClearIconClasses = 'w-4 h-4'

export const autoCompleteOptionBaseClasses = 'w-full px-3 text-start truncate'

export function getAutoCompleteRootClasses(inGroup: boolean, className?: string): string {
  return classNames(
    autoCompleteBaseClasses,
    inGroup ? autoCompleteInGroupClasses : autoCompleteStandaloneClasses,
    className
  )
}

export function getAutoCompletePanelStyle(listHeight: number): { maxHeight: string } {
  return { maxHeight: `${listHeight}px` }
}

export function getAutoCompleteInputClasses(options: {
  size?: ComponentSize
  disabled?: boolean
  isOpen?: boolean
  status?: InputStatus
  hasClear?: boolean
}): string {
  const size = options.size ?? 'md'
  const status = options.status ?? 'default'
  return classNames(
    'w-full',
    INPUT_PAD_Y[size],
    options.hasClear ? 'ps-3 pe-10' : 'ps-3 pe-3',
    'bg-[var(--tiger-surface,#ffffff)]',
    'border',
    STATUS_BORDER[status],
    'text-[var(--tiger-text,#111827)] text-start',
    'rounded-[var(--tiger-radius-md,0.5rem)]',
    'placeholder:text-[var(--tiger-text-muted,#9ca3af)]',
    'tiger-motion-aware [transition:var(--tiger-transition-base,color_150ms_ease,border-color_150ms_ease,box-shadow_150ms_ease)]',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40',
    'focus-visible:border-[var(--tiger-primary,#2563eb)]',
    options.disabled &&
      'bg-[var(--tiger-surface-muted,#f3f4f6)] text-[var(--tiger-text-muted,#6b7280)] border-[var(--tiger-border,#e5e7eb)] cursor-not-allowed',
    options.isOpen &&
      'ring-2 ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40 border-[var(--tiger-primary,#2563eb)]'
  )
}

export function getAutoCompleteOptionClasses(options: {
  isSelected?: boolean
  isDisabled?: boolean
  isActive?: boolean
  size?: ComponentSize
}): string {
  const size = options.size ?? 'md'
  return classNames(
    autoCompleteOptionBaseClasses,
    OPTION_PAD_Y[size],
    'tiger-motion-aware [transition:var(--tiger-transition-base,background-color_150ms_ease,color_150ms_ease)]',
    options.isDisabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)]',
    options.isSelected &&
      'bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)] font-medium',
    options.isActive &&
      !options.isDisabled &&
      'ring-2 ring-inset ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
  )
}

export function defaultAutoCompleteFilter(inputValue: string, option: AutoCompleteOption): boolean {
  const needle = inputValue.toLowerCase()
  return (
    option.label.toLowerCase().includes(needle) ||
    String(option.value).toLowerCase().includes(needle)
  )
}

export function filterAutoCompleteOptions(
  options: AutoCompleteOption[],
  inputValue: string,
  filterOption?: AutoCompleteFilterOption
): AutoCompleteOption[] {
  if (filterOption === false) return options
  if (!inputValue) return options

  const filterFn = typeof filterOption === 'function' ? filterOption : defaultAutoCompleteFilter

  return options.filter((opt) => filterFn(inputValue, opt))
}

/**
 * Resolve the display text for a committed AutoComplete value.
 * First option with String(option.value) === String(value) wins (option.label).
 * Nullish values use fallback. Unmatched values (including '') stay as String(value).
 * Numeric 0 is not treated as empty.
 */
export function resolveAutoCompleteDisplayValue(
  value: AutoCompleteValue | null | undefined,
  options: AutoCompleteOption[] | null | undefined = [],
  fallback: string | number | null | undefined = ''
): string {
  if (value === undefined || value === null) {
    return String(fallback ?? '')
  }

  const match = (options ?? []).find((option) => String(option.value) === String(value))
  if (match) {
    return match.label
  }

  return String(value)
}

export function isSameAutoCompleteValue(
  left: AutoCompleteValue | undefined,
  right: AutoCompleteValue | undefined
): boolean {
  if (left === undefined || right === undefined) return left === right
  return String(left) === String(right)
}

export function coerceAutoCompleteFormValue(value: unknown): AutoCompleteValue | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'string' || typeof value === 'number') return value
  return String(value)
}

export function getAutoCompleteOptionKey(option: AutoCompleteOption, index: number): string {
  return option.id ?? `${index}-${String(option.value)}`
}

export function findAutoCompleteOption(
  options: readonly AutoCompleteOption[],
  query: string
): AutoCompleteOption | undefined {
  const needle = query.toLowerCase()
  return options.find(
    (option) =>
      !option.disabled &&
      (option.label.toLowerCase() === needle || String(option.value).toLowerCase() === needle)
  )
}

export function resolveAutoCompleteInitialQuery(options: {
  searchValue?: string
  defaultSearchValue?: string
  committed?: AutoCompleteValue
  optionList?: AutoCompleteOption[]
}): string {
  if (options.searchValue !== undefined) return options.searchValue
  if (options.committed !== undefined) {
    return resolveAutoCompleteDisplayValue(options.committed, options.optionList, '')
  }
  return options.defaultSearchValue ?? ''
}

export function resolveAutoCompleteIdleQuery(
  committed: AutoCompleteValue | undefined,
  optionList: AutoCompleteOption[] | null | undefined = []
): string {
  if (committed === undefined) return ''
  return resolveAutoCompleteDisplayValue(committed, optionList, '')
}

/**
 * Blur / Enter-without-highlight commit. Does not consume the highlighted option.
 */
export function resolveAutoCompleteBlurCommit(options: {
  query: string
  committed: AutoCompleteValue | undefined
  optionList: readonly AutoCompleteOption[]
  allowFreeInput: boolean
}): AutoCompleteCommitResult {
  const match = findAutoCompleteOption(options.optionList, options.query)
  if (match) {
    return {
      value: match.value,
      query: match.label,
      option: match,
      didCommit: !isSameAutoCompleteValue(match.value, options.committed)
    }
  }

  if (options.allowFreeInput) {
    if (options.query === '') {
      return {
        value: undefined,
        query: '',
        didCommit: options.committed !== undefined
      }
    }
    return {
      value: options.query,
      query: options.query,
      didCommit: !isSameAutoCompleteValue(options.query, options.committed)
    }
  }

  return {
    value: options.committed,
    query: resolveAutoCompleteIdleQuery(
      options.committed,
      options.optionList as AutoCompleteOption[]
    ),
    didCommit: false
  }
}

export function getAutoCompleteKeyIntent(
  key: string,
  isOpen: boolean,
  activeIndex: number
): AutoCompleteKeyIntent {
  if (!isOpen) {
    if (key === 'ArrowDown' || key === 'ArrowUp') return { type: 'open' }
    return { type: 'none' }
  }

  switch (key) {
    case 'ArrowDown':
    case 'ArrowUp':
    case 'Home':
    case 'End':
      return { type: 'navigate', key }
    case 'Enter':
      return activeIndex >= 0 ? { type: 'select-active' } : { type: 'commit-query' }
    case 'Escape':
      return { type: 'close' }
    default:
      return { type: 'none' }
  }
}

export function resolveAutoCompleteActiveIndex(
  items: readonly AutoCompleteOption[],
  current: number,
  activeFirst: boolean
): number {
  if (items.length === 0) return -1
  if (activeFirst) return getInitialPickerActiveIndex(items, true)
  if (current >= items.length) return -1
  return current
}

export function shouldShowAutoCompleteClear(options: {
  clearable?: boolean
  disabled?: boolean
  query?: string
  committed?: AutoCompleteValue
}): boolean {
  if (!options.clearable || options.disabled) return false
  return (options.query ?? '') !== '' || options.committed !== undefined
}
