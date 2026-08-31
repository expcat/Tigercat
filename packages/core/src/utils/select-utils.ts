import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import type {
  SelectFilterOption,
  SelectModelValue,
  SelectOption,
  SelectOptionGroup,
  SelectOptions,
  SelectValue,
  SelectValues
} from '../types/select'
import { classNames } from './class-names'
import { devWarn } from './dev-warn'
import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  getPickerNavigationIndex
} from './picker-utils'
import { fixedSizeStrategy } from './virtual-list-utils'

export interface ResolveSelectOptionsOptions {
  searchable?: boolean
  remote?: boolean
  filterOption?: SelectFilterOption
}

export interface ResolveCreatableSelectOptionOptions {
  creatable?: boolean
}

export interface SelectSearchDebouncerOptions {
  delay?: number
  onSearchChange: (query: string) => void
  setTimer?: (callback: () => void, delay: number) => number
  clearTimer?: (handle: number) => void
}

export interface SelectSearchDebouncer {
  schedule: (query: string) => void
  flush: () => void
  cancel: () => void
  isPending: () => boolean
}

export type SelectListRow =
  | { kind: 'group'; key: string; label: string }
  | {
      kind: 'option'
      key: string
      option: SelectOption
      optionIndex: number
      isCreate?: boolean
    }

export type SelectTriggerKeyIntent =
  | { type: 'none' }
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'toggle' }
  | { type: 'select-active' }
  | { type: 'clear' }
  | { type: 'navigate'; key: string }
  | { type: 'typeahead'; character: string }
  | { type: 'prevent-scroll' }

const SELECT_TRIGGER_PAD_Y: Record<ComponentSize, string> = {
  sm: 'text-sm py-1.5',
  md: 'text-base py-2',
  lg: 'text-lg py-2.5'
}

const SELECT_OPTION_PAD_Y: Record<ComponentSize, string> = {
  sm: 'text-sm py-1.5',
  md: 'text-base py-2',
  lg: 'text-lg py-2.5'
}

const SELECT_VIRTUAL_ITEM_HEIGHT: Record<ComponentSize, number> = {
  sm: 32,
  md: 40,
  lg: 48
}

const SELECT_STATUS_BORDER: Record<InputStatus, string> = {
  default: 'border-[var(--tiger-border,#d1d5db)]',
  error: 'border-[var(--tiger-error,#dc2626)]',
  success: 'border-[var(--tiger-success,#16a34a)]',
  warning: 'border-[var(--tiger-warning,#d97706)]'
}

export const selectBaseClasses = 'relative inline-block'
export const selectInGroupClasses = 'flex-1 min-w-0'
export const selectStandaloneClasses = 'w-full'

export const selectDropdownBaseClasses = classNames(
  'bg-[var(--tiger-surface,#ffffff)]',
  'border border-[var(--tiger-border,#e5e7eb)]',
  'rounded-[var(--tiger-radius-lg,0.75rem)]',
  'shadow-[var(--tiger-shadow-lg,0_10px_15px_-3px_rgb(0_0_0_/_0.1),0_4px_6px_-4px_rgb(0_0_0_/_0.1))]',
  'overflow-hidden',
  'flex flex-col',
  'max-sm:rounded-none max-sm:border-0 max-sm:shadow-none',
  'max-sm:pt-[env(safe-area-inset-top)] max-sm:pb-[env(safe-area-inset-bottom)]'
)

export const selectListboxClasses = 'overflow-auto min-h-0 flex-1 max-sm:max-h-none'
export const selectSearchWrapClasses =
  'shrink-0 border-b border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)]'
export const selectEmptyStateClasses =
  'px-3 py-8 text-center text-[var(--tiger-text-muted,#6b7280)] text-sm'
export const selectGroupLabelClasses =
  'px-3 py-2 text-xs font-semibold text-[var(--tiger-text-muted,#6b7280)] uppercase bg-[var(--tiger-surface-muted,#f9fafb)] truncate'
export const selectSearchInputClasses = classNames(
  'w-full px-3 py-2 bg-transparent',
  'text-[var(--tiger-text,#111827)]',
  'placeholder:text-[var(--tiger-text-muted,#9ca3af)]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
  'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
)
export const selectDoneActionClasses =
  'shrink-0 max-sm:block hidden border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] p-2'
export const selectDoneButtonClasses = classNames(
  'w-full rounded-[var(--tiger-radius-md,0.5rem)]',
  'bg-[var(--tiger-primary,#2563eb)] px-3 py-2 text-sm font-medium',
  'text-[var(--tiger-primary-foreground,#ffffff)]',
  'tiger-motion-aware [transition:var(--tiger-transition-base,background-color_150ms_ease)]',
  'hover:bg-[var(--tiger-primary-hover,#1d4ed8)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
)
export const selectTrailingSlotClasses =
  'pointer-events-none absolute inset-y-0 end-3 flex items-center gap-1'
export const selectClearButtonClasses = classNames(
  'pointer-events-auto inline-flex rounded-sm',
  'text-[var(--tiger-text-muted,#9ca3af)]',
  'hover:text-[var(--tiger-text-muted,#6b7280)]',
  'focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
)
export const selectChevronWrapClasses =
  'inline-flex tiger-motion-aware [transition:var(--tiger-transition-base,transform_150ms_ease)]'
export const selectCheckIconClasses = 'w-5 h-5 text-[var(--tiger-primary,#2563eb)]'
export const selectChromeIconClasses = 'w-5 h-5 text-[var(--tiger-text-muted,#9ca3af)]'
export const selectClearIconClasses = 'w-4 h-4'

export function getSelectVirtualItemHeight(size: ComponentSize = 'md'): number {
  return SELECT_VIRTUAL_ITEM_HEIGHT[size] ?? SELECT_VIRTUAL_ITEM_HEIGHT.md
}

export function getSelectTriggerClasses(options: {
  size?: ComponentSize
  disabled?: boolean
  isOpen?: boolean
  status?: InputStatus
  hasClear?: boolean
}): string {
  const size = options.size ?? 'md'
  const status = options.status ?? 'default'
  return classNames(
    'w-full flex items-center justify-between gap-2 ps-3',
    options.hasClear ? 'pe-14' : 'pe-9',
    SELECT_TRIGGER_PAD_Y[size],
    'bg-[var(--tiger-surface,#ffffff)]',
    'border',
    SELECT_STATUS_BORDER[status],
    'text-[var(--tiger-text,#111827)] text-start',
    'rounded-[var(--tiger-radius-md,0.5rem)]',
    options.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    'tiger-motion-aware [transition:var(--tiger-transition-base,color_150ms_ease,border-color_150ms_ease,box-shadow_150ms_ease,transform_150ms_ease)]',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40',
    'focus-visible:border-[var(--tiger-primary,#2563eb)]',
    !options.disabled && 'active:scale-[0.99]',
    options.disabled &&
      'bg-[var(--tiger-surface-muted,#f3f4f6)] text-[var(--tiger-text-muted,#6b7280)] border-[var(--tiger-border,#e5e7eb)]',
    options.isOpen &&
      'ring-2 ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40 border-[var(--tiger-primary,#2563eb)]'
  )
}

export function getSelectOptionClasses(options: {
  isSelected: boolean
  isDisabled: boolean
  isActive: boolean
  size?: ComponentSize
}): string {
  const size = options.size ?? 'md'
  return classNames(
    'w-full px-3 text-start truncate',
    SELECT_OPTION_PAD_Y[size],
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

export function getSelectSizeClasses(size: ComponentSize): string {
  return SELECT_TRIGGER_PAD_Y[size]
}

export function getSelectRootClasses(inGroup: boolean, className?: string): string {
  return classNames(
    selectBaseClasses,
    inGroup ? selectInGroupClasses : selectStandaloneClasses,
    className
  )
}

export function getSelectPanelStyle(listHeight: number): { maxHeight: string } {
  return { maxHeight: `${listHeight}px` }
}

export function isOptionGroup(
  option: SelectOption | SelectOptionGroup | null | undefined
): option is SelectOptionGroup {
  return (
    !!option && typeof option === 'object' && 'options' in option && Array.isArray(option.options)
  )
}

export function flattenSelectOptions(options: SelectOptions = []): SelectOption[] {
  const all: SelectOption[] = []
  for (const item of options) {
    if (isOptionGroup(item)) {
      all.push(...item.options)
    } else {
      all.push(item)
    }
  }
  return all
}

export function defaultSelectFilterOption(query: string, option: SelectOption): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    option.label.toLowerCase().includes(needle) ||
    String(option.value).toLowerCase().includes(needle)
  )
}

export function filterOptions(
  options: SelectOptions,
  query: string,
  filterOption: SelectFilterOption = defaultSelectFilterOption
): SelectOptions {
  if (!query.trim()) {
    return options
  }

  const needle = query.trim().toLowerCase()
  return options.reduce<SelectOptions>((filtered, item) => {
    if (isOptionGroup(item)) {
      if (item.label.toLowerCase().includes(needle)) {
        filtered.push(item)
        return filtered
      }
      const nextOptions = item.options.filter((option) => filterOption(query, option))
      if (nextOptions.length > 0) {
        filtered.push({ ...item, options: nextOptions })
      }
      return filtered
    }
    if (filterOption(query, item)) {
      filtered.push(item)
    }
    return filtered
  }, [])
}

export function resolveSelectFilteredOptions(
  options: SelectOptions,
  query: string,
  resolveOptions: ResolveSelectOptionsOptions = {}
): SelectOptions {
  if (!resolveOptions.searchable || !query || resolveOptions.remote) {
    return options
  }
  return filterOptions(options, query, resolveOptions.filterOption)
}

function inferCreatableValue(query: string, options: SelectOptions): SelectValue {
  const trimmed = query.trim()
  const existing = flattenSelectOptions(options)
  if (existing.length === 0) return trimmed
  const allNumbers = existing.every((option) => typeof option.value === 'number')
  if (!allNumbers) return trimmed
  const asNumber = Number(trimmed)
  return Number.isFinite(asNumber) && String(asNumber) === trimmed ? asNumber : trimmed
}

export function createSelectOptionFromQuery(
  query: string,
  options: SelectOptions = []
): SelectOption | null {
  const trimmed = query.trim()
  if (!trimmed) return null
  return {
    label: trimmed,
    value: inferCreatableValue(trimmed, options)
  }
}

function sameSelectIdentity(left: SelectValue, right: SelectValue): boolean {
  return String(left).toLowerCase() === String(right).toLowerCase()
}

export function resolveCreatableSelectOption(
  options: SelectOptions,
  query: string,
  resolveOptions: ResolveCreatableSelectOptionOptions = {}
): SelectOption | null {
  if (!resolveOptions.creatable) return null
  const candidate = createSelectOptionFromQuery(query, options)
  if (!candidate) return null
  const exists = flattenSelectOptions(options).some((option) => {
    return (
      option.label.toLowerCase() === candidate.label.toLowerCase() ||
      sameSelectIdentity(option.value, candidate.value)
    )
  })
  return exists ? null : candidate
}

export function getCreateSelectOptionLabel(
  option: SelectOption,
  createOptionLabel = 'Create "{label}"'
): string {
  if (createOptionLabel.includes('{label}')) {
    return createOptionLabel.replace(/\{label\}/g, option.label)
  }
  return `${createOptionLabel} "${option.label}"`
}

export function createSelectSearchDebouncer(
  options: SelectSearchDebouncerOptions
): SelectSearchDebouncer {
  const delay = Number.isFinite(options.delay) && (options.delay ?? 0) > 0 ? options.delay! : 0
  const setTimer =
    options.setTimer ?? ((callback, timeout) => globalThis.setTimeout(callback, timeout))
  const clearTimer = options.clearTimer ?? ((handle) => globalThis.clearTimeout(handle))
  let timerHandle: number | undefined
  let pendingQuery = ''

  const cancel = (): void => {
    if (timerHandle === undefined) return
    clearTimer(timerHandle)
    timerHandle = undefined
  }

  const flush = (): void => {
    if (timerHandle !== undefined) {
      cancel()
      options.onSearchChange(pendingQuery)
    }
  }

  const schedule = (query: string): void => {
    pendingQuery = query
    if (delay <= 0) {
      cancel()
      options.onSearchChange(query)
      return
    }
    cancel()
    timerHandle = setTimer(() => {
      timerHandle = undefined
      options.onSearchChange(pendingQuery)
    }, delay)
  }

  return {
    schedule,
    flush,
    cancel,
    isPending: () => timerHandle !== undefined
  }
}

export function isSelectValueEmpty(value: SelectModelValue, multiple: boolean): boolean {
  if (multiple) {
    return !Array.isArray(value) || value.length === 0
  }
  return value === undefined
}

export function normalizeSelectValue(
  value: SelectModelValue,
  multiple: boolean,
  warn = true
): SelectModelValue {
  if (multiple) {
    if (value === undefined) return []
    if (Array.isArray(value)) return value
    if (warn) {
      devWarn(
        'Select.multiple.nonArray',
        'Select `multiple` expected an array value; non-arrays are treated as [].'
      )
    }
    return []
  }
  if (Array.isArray(value)) return value[0]
  return value
}

export function getSelectSelectedValues(value: SelectModelValue, multiple: boolean): SelectValue[] {
  const normalized = normalizeSelectValue(value, multiple, false)
  if (multiple) {
    return Array.isArray(normalized) ? normalized : []
  }
  return normalized === undefined ? [] : [normalized as SelectValue]
}

export function isSelectOptionSelected(
  option: SelectOption,
  value: SelectModelValue,
  multiple: boolean
): boolean {
  const selected = getSelectSelectedValues(value, multiple)
  return selected.includes(option.value)
}

export function shouldShowSelectClear(options: {
  clearable: boolean
  disabled: boolean
  value: SelectModelValue
  multiple: boolean
}): boolean {
  return (
    options.clearable && !options.disabled && !isSelectValueEmpty(options.value, options.multiple)
  )
}

export function rememberSelectOptions(
  cache: ReadonlyMap<SelectValue, SelectOption>,
  options: SelectOption[],
  selectedValues: readonly SelectValue[]
): Map<SelectValue, SelectOption> {
  const next = new Map<SelectValue, SelectOption>()
  for (const option of options) {
    next.set(option.value, option)
  }
  for (const value of selectedValues) {
    const fresh = options.find((option) => option.value === value)
    const cached = cache.get(value)
    if (fresh) next.set(value, fresh)
    else if (cached) next.set(value, cached)
  }
  return next
}

export function pruneCreatedSelectOptions(
  created: SelectOption[],
  options: SelectOptions
): SelectOption[] {
  if (created.length === 0) return created
  const existing = new Set(flattenSelectOptions(options).map((option) => option.value))
  return created.filter((option) => !existing.has(option.value))
}

export function resolveSelectDisplayText(options: {
  value: SelectModelValue
  multiple: boolean
  options: SelectOptions
  createdOptions?: SelectOption[]
  optionCache?: ReadonlyMap<SelectValue, SelectOption>
  placeholder: string
  maxTagCount?: number
  moreCountText?: string
}): string {
  const lookup = [
    ...flattenSelectOptions(options.options),
    ...(options.createdOptions ?? []),
    ...Array.from(options.optionCache?.values() ?? [])
  ]
  const findLabel = (value: SelectValue): string =>
    lookup.find((option) => option.value === value)?.label ?? String(value)

  if (options.multiple) {
    const values = getSelectSelectedValues(options.value, true)
    if (values.length === 0) return options.placeholder
    const labels = values.map(findLabel)
    if (options.maxTagCount !== undefined && labels.length > options.maxTagCount) {
      const visible = labels.slice(0, options.maxTagCount)
      const hidden = labels.length - options.maxTagCount
      const more = (options.moreCountText ?? '+{count} more').replace(/\{count\}/g, String(hidden))
      return `${visible.join(', ')} ${more}`
    }
    return labels.join(', ')
  }

  if (options.value === undefined) return options.placeholder
  return findLabel(options.value as SelectValue)
}

export function commitSelectOption(options: {
  option: SelectOption
  value: SelectModelValue
  multiple: boolean
}): SelectModelValue {
  if (options.option.disabled) {
    return options.value
  }
  if (options.multiple) {
    const current = getSelectSelectedValues(options.value, true)
    return current.includes(options.option.value)
      ? current.filter((item) => item !== options.option.value)
      : [...current, options.option.value]
  }
  return options.option.value
}

export function clearSelectValue(multiple: boolean): SelectModelValue {
  return multiple ? [] : undefined
}

export function resolveSelectActiveIndex(options: {
  items: readonly SelectOption[]
  previousIndex: number
  previousValue?: SelectValue
  selectedValues: readonly SelectValue[]
  reason: 'open' | 'filter' | 'select'
  selectedIndex?: number
}): number {
  const isDisabled = (item: SelectOption) => Boolean(item.disabled)
  if (options.items.length === 0) return -1

  if (options.reason === 'select' && options.selectedIndex !== undefined) {
    return options.selectedIndex
  }

  if (options.reason === 'filter') {
    const previousValue =
      options.previousValue ??
      (options.previousIndex >= 0 ? options.items[options.previousIndex]?.value : undefined)
    if (previousValue !== undefined) {
      const still = options.items.findIndex(
        (item) => item.value === previousValue && !item.disabled
      )
      if (still >= 0) return still
    }
  }

  const selectedIndex = options.items.findIndex(
    (item) => options.selectedValues.includes(item.value) && !item.disabled
  )
  if (selectedIndex >= 0) return selectedIndex
  return findFirstEnabledIndex(options.items, isDisabled)
}

export function findSelectTypeaheadIndex(
  items: readonly SelectOption[],
  query: string,
  fromIndex: number
): number {
  const needle = query.toLowerCase()
  if (!needle || items.length === 0) return -1
  const start = fromIndex >= 0 ? fromIndex + 1 : 0
  for (let offset = 0; offset < items.length; offset++) {
    const index = (start + offset) % items.length
    const item = items[index]
    if (item.disabled) continue
    if (item.label.toLowerCase().startsWith(needle)) return index
  }
  return -1
}

export function isSelectTypeaheadCharacter(
  key: string,
  modifiers: { altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }
): boolean {
  if (modifiers.altKey || modifiers.ctrlKey || modifiers.metaKey) return false
  if (key.length !== 1) return false
  const code = key.charCodeAt(0)
  return code > 32
}

export function getSelectTriggerKeyIntent(options: {
  key: string
  open: boolean
  searchable: boolean
  clearable: boolean
  hasValue: boolean
  fromSearchInput?: boolean
}): SelectTriggerKeyIntent {
  const { key, open, searchable, fromSearchInput } = options
  if (key === 'Escape') {
    return open ? { type: 'close' } : { type: 'none' }
  }
  if (key === 'Tab') {
    return open ? { type: 'close' } : { type: 'none' }
  }
  if (!open) {
    if ((key === 'Backspace' || key === 'Delete') && options.clearable && options.hasValue) {
      return { type: 'clear' }
    }
    if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
      return { type: 'open' }
    }
    if (key === 'Home' || key === 'End') {
      return { type: 'prevent-scroll' }
    }
    return { type: 'none' }
  }
  if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
    return { type: 'navigate', key }
  }
  if (key === 'Enter' || (key === ' ' && !fromSearchInput && !searchable)) {
    return { type: 'select-active' }
  }
  if (key === ' ' && fromSearchInput) {
    return { type: 'none' }
  }
  return { type: 'none' }
}

export function navigateSelectActiveIndex(
  items: readonly SelectOption[],
  current: number,
  key: string
): number {
  return getPickerNavigationIndex(items, current, key, (item) => Boolean(item.disabled))
}

export function getSelectClosedHomeEndIndex(
  items: readonly SelectOption[],
  key: 'Home' | 'End'
): number {
  return key === 'Home'
    ? findFirstEnabledIndex(items, (item) => Boolean(item.disabled))
    : findLastEnabledIndex(items, (item) => Boolean(item.disabled))
}

export function getSelectOptionKey(option: SelectOption, index: number): string {
  if (option.id) return option.id
  return `${index}-${String(option.value)}`
}

export function buildSelectListRows(
  filteredOptions: SelectOptions,
  creatableOption: SelectOption | null
): SelectListRow[] {
  const rows: SelectListRow[] = []
  let optionIndex = -1
  filteredOptions.forEach((item, groupIndex) => {
    if (isOptionGroup(item)) {
      rows.push({ kind: 'group', key: `group-${groupIndex}-${item.label}`, label: item.label })
      item.options.forEach((option) => {
        optionIndex += 1
        rows.push({
          kind: 'option',
          key: getSelectOptionKey(option, optionIndex),
          option,
          optionIndex
        })
      })
      return
    }
    optionIndex += 1
    rows.push({
      kind: 'option',
      key: getSelectOptionKey(item, optionIndex),
      option: item,
      optionIndex
    })
  })
  if (creatableOption) {
    optionIndex += 1
    rows.push({
      kind: 'option',
      key: getSelectOptionKey(creatableOption, optionIndex),
      option: creatableOption,
      optionIndex,
      isCreate: true
    })
  }
  return rows
}

export function getSelectRowIndexForOption(
  rows: readonly SelectListRow[],
  optionIndex: number
): number {
  return rows.findIndex((row) => row.kind === 'option' && row.optionIndex === optionIndex)
}

export function getSelectVirtualRange(
  scrollTop: number,
  listHeight: number,
  rowCount: number,
  itemHeight: number,
  overscan = 5
) {
  return fixedSizeStrategy(itemHeight).getRange(scrollTop, listHeight, rowCount, overscan)
}

export function getSelectActiveAlignScrollTop(options: {
  scrollTop: number
  listHeight: number
  rowIndex: number
  itemHeight: number
}): number {
  if (options.rowIndex < 0) return options.scrollTop
  const top = options.rowIndex * options.itemHeight
  if (top < options.scrollTop) return top
  if (top + options.itemHeight > options.scrollTop + options.listHeight) {
    return top + options.itemHeight - options.listHeight
  }
  return options.scrollTop
}

export function serializeSelectFormValues(value: SelectModelValue, multiple: boolean): string[] {
  return getSelectSelectedValues(value, multiple).map((item) => String(item))
}

export function coerceSelectFormValue(
  raw: unknown,
  options: SelectOptions,
  multiple: boolean
): SelectModelValue | undefined {
  if (raw === undefined) return undefined
  if (multiple) {
    return Array.isArray(raw) ? (raw as SelectValues) : undefined
  }
  if (raw === '' && !flattenSelectOptions(options).some((option) => option.value === '')) {
    return undefined
  }
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return undefined
}

export function createSelectTypeaheadBuffer(options: {
  timeout?: number
  onQuery: (query: string) => void
  setTimer?: (callback: () => void, delay: number) => number
  clearTimer?: (handle: number) => void
}): { push: (character: string) => void; reset: () => void } {
  const timeout = options.timeout ?? 500
  const setTimer = options.setTimer ?? ((callback, delay) => globalThis.setTimeout(callback, delay))
  const clearTimer = options.clearTimer ?? ((handle) => globalThis.clearTimeout(handle))
  let buffer = ''
  let handle: number | undefined
  const reset = (): void => {
    buffer = ''
    if (handle !== undefined) {
      clearTimer(handle)
      handle = undefined
    }
  }
  return {
    push: (character: string) => {
      buffer += character
      options.onQuery(buffer)
      if (handle !== undefined) clearTimer(handle)
      handle = setTimer(() => {
        handle = undefined
        buffer = ''
      }, timeout)
    },
    reset
  }
}
