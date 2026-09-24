import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import type {
  AutoCompleteFilterOption,
  AutoCompleteOption,
  AutoCompleteValue
} from '../types/auto-complete'
import { classNames } from './class-names'
import { getInitialPickerActiveIndex } from './picker-utils'
import { getSelectVirtualItemHeight } from './select-utils'
import { fixedSizeStrategy, scrollTopForVirtualAlign, type VirtualRange } from './virtual-list-utils'
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
  | { type: 'commit-query'; allowDefault?: boolean }

/** Shown when an external value cannot be displayed as text or a finite number. */
export const AUTO_COMPLETE_INVALID_VALUE = 'This value can’t be shown.'

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
  default: 'border-[var(--tiger-border)]',
  error: 'border-[var(--tiger-error)]',
  success: 'border-[var(--tiger-success)]',
  warning: 'border-[var(--tiger-warning)]'
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

/** Same row box as Select. The window arithmetic is fixedSizeStrategy. */
export function getAutoCompleteVirtualItemHeight(size: ComponentSize = 'md'): number {
  return getSelectVirtualItemHeight(size)
}

export function shouldVirtualizeAutoCompleteList(
  count: number,
  listHeight: number,
  size: ComponentSize = 'md'
): boolean {
  if (count <= 0 || !(listHeight > 0)) return false
  return count * getAutoCompleteVirtualItemHeight(size) > listHeight
}

export function getAutoCompleteVirtualRange(
  scrollTop: number,
  listHeight: number,
  count: number,
  itemHeight: number,
  overscan = 5
): VirtualRange {
  return fixedSizeStrategy(itemHeight).getRange(scrollTop, listHeight, count, overscan)
}

export function getAutoCompleteAlignScrollTop(
  scrollTop: number,
  index: number,
  itemHeight: number,
  listHeight: number
): number {
  if (index < 0 || itemHeight <= 0 || listHeight <= 0) return scrollTop
  return scrollTopForVirtualAlign({
    scrollTop,
    viewport: listHeight,
    offset: index * itemHeight,
    size: itemHeight,
    align: 'auto'
  })
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
    'bg-[var(--tiger-surface)]',
    'border',
    STATUS_BORDER[status],
    'text-[var(--tiger-text)] text-start',
    'rounded-[var(--tiger-radius-md)]',
    'placeholder:text-[var(--tiger-text-secondary)]',
    'tiger-motion-aware [transition:var(--tiger-transition-base)]',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40',
    'focus-visible:border-[var(--tiger-primary)]',
    options.disabled &&
      'bg-[var(--tiger-surface-muted)] text-[var(--tiger-text-secondary)] border-[var(--tiger-border)] cursor-not-allowed',
    options.isOpen &&
      'ring-2 ring-[var(--tiger-focus-ring)]/40 border-[var(--tiger-primary)]'
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
    'tiger-motion-aware [transition:var(--tiger-transition-base)]',
    options.isDisabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer hover:bg-[var(--tiger-outline-bg-hover)]',
    options.isSelected &&
      'bg-[var(--tiger-outline-bg-hover)] text-[var(--tiger-primary)] font-medium',
    options.isActive &&
      !options.isDisabled &&
      'ring-2 ring-inset ring-[var(--tiger-focus-ring)]'
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

export function isAutoCompleteEmptyValue(
  value: unknown
): value is null | undefined | '' {
  return value === undefined || value === null || value === ''
}

export function isSameAutoCompleteValue(
  left: AutoCompleteValue | null | undefined,
  right: AutoCompleteValue | null | undefined
): boolean {
  const normalizedLeft = isAutoCompleteEmptyValue(left) ? undefined : left
  const normalizedRight = isAutoCompleteEmptyValue(right) ? undefined : right
  if (normalizedLeft === undefined || normalizedRight === undefined) {
    return normalizedLeft === normalizedRight
  }
  return String(normalizedLeft) === String(normalizedRight)
}

/**
 * External values are empty or a string/finite number.
 * `''`, `null`, and a missing key are not committed. Anything else is unusable.
 */
export function sanitizeAutoCompleteExternalValue(value: unknown): {
  value: AutoCompleteValue | undefined
  invalid: boolean
} {
  if (isAutoCompleteEmptyValue(value)) return { value: undefined, invalid: false }
  if (typeof value === 'string') return { value, invalid: false }
  if (typeof value === 'number' && Number.isFinite(value)) return { value, invalid: false }
  return { value: undefined, invalid: true }
}

export function coerceAutoCompleteFormValue(value: unknown): AutoCompleteValue | undefined {
  return sanitizeAutoCompleteExternalValue(value).value
}

export function getAutoCompleteOptionKey(option: AutoCompleteOption, index: number): string {
  return option.id ?? `${index}-${String(option.value)}`
}

export function findAutoCompleteOption(
  options: readonly AutoCompleteOption[],
  query: string
): AutoCompleteOption | undefined {
  if (query === '') return undefined
  const needle = query.toLowerCase()
  return options.find(
    (option) =>
      !option.disabled &&
      (option.label.toLowerCase() === needle || String(option.value).toLowerCase() === needle)
  )
}

export function autoCompleteOptionIdentity(option: AutoCompleteOption): string {
  return option.id ?? String(option.value)
}

/**
 * Keep the highlight on the same option when the suggestion list changes.
 * An index that would now point at a different option is recomputed.
 */
export function syncAutoCompleteHighlight(
  items: readonly AutoCompleteOption[],
  activeKey: string | undefined,
  activeFirst: boolean
): { index: number; key: string | undefined } {
  if (items.length === 0) return { index: -1, key: undefined }
  if (activeKey) {
    const found = items.findIndex((item) => autoCompleteOptionIdentity(item) === activeKey)
    if (found >= 0) return { index: found, key: activeKey }
  }
  const index = getInitialPickerActiveIndex(items, activeFirst)
  return {
    index,
    key: index >= 0 ? autoCompleteOptionIdentity(items[index]) : undefined
  }
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
  committed: AutoCompleteValue | null | undefined
  optionList: readonly AutoCompleteOption[]
  allowFreeInput: boolean
}): AutoCompleteCommitResult {
  const committed = isAutoCompleteEmptyValue(options.committed) ? undefined : options.committed
  const match = findAutoCompleteOption(options.optionList, options.query)
  if (match) {
    const value = isAutoCompleteEmptyValue(match.value) ? undefined : match.value
    return {
      value,
      query: value === undefined ? '' : match.label,
      option: match,
      didCommit: !isSameAutoCompleteValue(value, committed)
    }
  }

  if (options.allowFreeInput) {
    if (options.query === '') {
      return {
        value: undefined,
        query: '',
        didCommit: committed !== undefined
      }
    }
    return {
      value: options.query,
      query: options.query,
      didCommit: !isSameAutoCompleteValue(options.query, committed)
    }
  }

  return {
    value: committed,
    query: resolveAutoCompleteIdleQuery(committed, options.optionList as AutoCompleteOption[]),
    didCommit: false
  }
}

export function getAutoCompleteKeyIntent(
  key: string,
  isOpen: boolean,
  activeIndex: number,
  optionCount?: number
): AutoCompleteKeyIntent {
  const noOptions = optionCount === 0
  if (!isOpen) {
    if (key === 'ArrowDown' || key === 'ArrowUp') return { type: 'open' }
    if (key === 'Enter' && noOptions) return { type: 'commit-query', allowDefault: true }
    return { type: 'none' }
  }

  switch (key) {
    case 'ArrowDown':
    case 'ArrowUp':
    case 'Home':
    case 'End':
      return { type: 'navigate', key }
    case 'Enter':
      if (noOptions) return { type: 'commit-query', allowDefault: true }
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
  return (options.query ?? '') !== '' || !isAutoCompleteEmptyValue(options.committed)
}
