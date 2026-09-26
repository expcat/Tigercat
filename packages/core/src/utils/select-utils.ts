import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import type {
  SelectFilterOption,
  SelectModelValue,
  SelectOption,
  SelectOptionFields,
  SelectOptionGroup,
  SelectOptions,
  SelectValue,
  SelectValues
} from '../types/select'
import { classNames } from './class-names'
import { devWarn } from './dev-warn'
import { getPopupListOptionActiveClasses, popupListOptionActiveClasses } from './interaction-styles'
import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  getPickerNavigationIndex
} from './picker-utils'
import {
  fixedSizeStrategy,
  scrollTopForVirtualAlign,
  variableSizeStrategy
} from './virtual-list-utils'

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
  | { type: 'remove-last' }
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

const SELECT_VIRTUAL_GROUP_HEIGHT: Record<ComponentSize, number> = {
  sm: 24,
  md: 28,
  lg: 32
}

const SELECT_STATUS_BORDER: Record<InputStatus, string> = {
  default: 'border-[var(--tiger-border)]',
  error: 'border-[var(--tiger-error)]',
  success: 'border-[var(--tiger-success)]',
  warning: 'border-[var(--tiger-warning)]'
}

export const selectBaseClasses = 'relative inline-block'
export const selectInGroupClasses = 'flex-1 min-w-0'
export const selectStandaloneClasses = 'w-full'

export const selectDropdownBaseClasses = classNames(
  'bg-[var(--tiger-surface)]',
  'border border-[var(--tiger-border)]',
  'rounded-[var(--tiger-radius-lg)]',
  'shadow-[var(--tiger-shadow-lg)]',
  'overflow-hidden',
  'flex flex-col'
)

export const selectListboxClasses = 'overflow-auto min-h-0 flex-1'

/**
 * Horizontal inset for popup list chrome (Select, Cascader, TreeSelect).
 * Tailwind `px-3` is 0.75rem. That clears `--tiger-radius-lg` (10px) so the
 * first glyph is outside the corner the panel clips with `overflow-hidden`.
 */
export const popupListInlinePaddingClass = 'px-3'
export const POPUP_LIST_INLINE_PADDING = '0.75rem'

export const selectTagListClasses = 'flex min-w-0 flex-1 flex-wrap items-center gap-1'
export const selectTagClasses = classNames(
  'inline-flex max-w-full items-center gap-1 rounded-[var(--tiger-radius-sm)]',
  'bg-[var(--tiger-surface-muted)] px-1.5 py-0.5 text-sm text-[var(--tiger-text)]'
)
export const selectTagRemoveClasses = classNames(
  'inline-flex text-[var(--tiger-text-secondary)]',
  'hover:text-[var(--tiger-text)]'
)
export const selectSearchWrapClasses =
  'shrink-0 border-b border-[var(--tiger-border)] bg-[var(--tiger-surface)]'
export const selectEmptyStateClasses = classNames(
  popupListInlinePaddingClass,
  'py-8 text-center text-[var(--tiger-text-secondary)] text-sm'
)
export const selectGroupLabelClasses = classNames(
  'sticky top-0 z-10 py-2 text-xs font-semibold text-[var(--tiger-text-secondary)] uppercase bg-[var(--tiger-surface-muted)] truncate',
  popupListInlinePaddingClass
)
export const selectSearchInputClasses = classNames(
  'w-full py-2 bg-transparent',
  popupListInlinePaddingClass,
  'text-[var(--tiger-text)]',
  'placeholder:text-[var(--tiger-text-secondary)]',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
  'focus-visible:ring-[var(--tiger-focus-ring)]'
)
export const selectDoneActionClasses =
  'shrink-0 max-sm:block hidden border-t border-[var(--tiger-border)] bg-[var(--tiger-surface)] p-2'
export const selectDoneButtonClasses = classNames(
  'w-full rounded-[var(--tiger-radius-md)]',
  'bg-[var(--tiger-primary)] px-3 py-2 text-sm font-medium',
  'text-[var(--tiger-primary-foreground)]',
  'tiger-motion-aware [transition:var(--tiger-transition-base)]',
  'hover:bg-[var(--tiger-primary-hover)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring)]'
)
export const selectTrailingSlotClasses =
  'pointer-events-none absolute inset-y-0 end-3 flex items-center gap-1'
export const selectClearButtonClasses = classNames(
  'pointer-events-auto inline-flex rounded-sm',
  'focus:outline-none',
  'text-[var(--tiger-text-secondary)]',
  'hover:text-[var(--tiger-text-secondary)]',
  'focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring)]'
)
export const selectChevronWrapClasses =
  'inline-flex tiger-motion-aware [transition:var(--tiger-transition-base)]'
export const selectCheckIconClasses = 'w-5 h-5 text-[var(--tiger-primary)]'
export const selectChromeIconClasses = 'w-5 h-5 text-[var(--tiger-text-secondary)]'
export const selectClearIconClasses = 'w-4 h-4'

export function getSelectVirtualItemHeight(size: ComponentSize = 'md'): number {
  return SELECT_VIRTUAL_ITEM_HEIGHT[size] ?? SELECT_VIRTUAL_ITEM_HEIGHT.md
}

export function getSelectVirtualRowHeight(
  size: ComponentSize = 'md',
  kind: SelectListRow['kind'] = 'option'
): number {
  if (kind === 'group') return SELECT_VIRTUAL_GROUP_HEIGHT[size] ?? SELECT_VIRTUAL_GROUP_HEIGHT.md
  return getSelectVirtualItemHeight(size)
}

/** Virtualize once the option list is taller than the panel. */
export function shouldVirtualizeSelectList(options: {
  rowCount: number
  listHeight: number
  size?: ComponentSize
  rows?: readonly SelectListRow[]
}): boolean {
  if (options.rowCount <= 0) return false
  const size = options.size ?? 'md'
  const total = options.rows
    ? options.rows.reduce((sum, row) => sum + getSelectVirtualRowHeight(size, row.kind), 0)
    : options.rowCount * getSelectVirtualItemHeight(size)
  return total > options.listHeight
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
    'bg-[var(--tiger-surface)]',
    'border',
    SELECT_STATUS_BORDER[status],
    'text-[var(--tiger-text)] text-start',
    'rounded-[var(--tiger-radius-md)]',
    options.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    'tiger-motion-aware [transition:var(--tiger-transition-base)]',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40',
    'focus-visible:border-[var(--tiger-primary)]',
    !options.disabled && 'active:scale-[0.99]',
    options.disabled &&
      'bg-[var(--tiger-surface-muted)] text-[var(--tiger-text-secondary)] border-[var(--tiger-border)]',
    options.isOpen && 'ring-2 ring-[var(--tiger-focus-ring)]/40 border-[var(--tiger-primary)]'
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
    'w-full text-start truncate',
    popupListInlinePaddingClass,
    SELECT_OPTION_PAD_Y[size],
    'tiger-motion-aware [transition:var(--tiger-transition-base)]',
    options.isDisabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer hover:bg-[var(--tiger-outline-bg-hover)]',
    options.isSelected &&
      classNames(popupListOptionActiveClasses, 'text-[var(--tiger-primary)] font-medium'),
    getPopupListOptionActiveClasses({
      active: options.isActive,
      disabled: options.isDisabled,
      selected: options.isSelected
    })
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

export function sameSelectValue(left: SelectValue, right: SelectValue): boolean {
  return Object.is(left, right)
}

function exactSelectQueryMatch(option: SelectOption, query: string): boolean {
  if (option.label === query) return true
  if (typeof option.value === 'string') return option.value === query
  if (typeof option.value === 'number') return String(option.value) === query
  return false
}

export function resolveCreatableSelectOption(
  options: SelectOptions,
  query: string,
  resolveOptions: ResolveCreatableSelectOptionOptions = {}
): SelectOption | null {
  if (!resolveOptions.creatable) return null
  const candidate = createSelectOptionFromQuery(query, options)
  if (!candidate) return null
  const exists = flattenSelectOptions(options).some((option) =>
    exactSelectQueryMatch(option, candidate.label)
  )
  return exists ? null : candidate
}

/** Enter creates the current query when nothing in the list is an exact match. */
export function shouldCreateSelectQuery(options: {
  creatable: boolean
  query: string
  items: readonly SelectOption[]
}): boolean {
  if (!options.creatable) return false
  const query = options.query.trim()
  if (!query) return false
  return !options.items.some((item) => exactSelectQueryMatch(item, query))
}

export function withCreatedSelectOptions(
  options: SelectOptions,
  created: readonly SelectOption[]
): SelectOptions {
  const pending = pruneCreatedSelectOptions([...created], options)
  if (pending.length === 0) return options
  return [...options, ...pending]
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
  return value === undefined || value === null
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
  return selected.some((item) => sameSelectValue(item, option.value))
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

  if (options.value === undefined || options.value === null) return options.placeholder
  return findLabel(options.value as SelectValue)
}

export function commitSelectOption(options: {
  option: SelectOption
  value: SelectModelValue
  multiple: boolean
  maxCount?: number
  readOnly?: boolean
}): SelectModelValue {
  if (options.readOnly || options.option.disabled) {
    return options.value
  }
  if (options.multiple) {
    const current = getSelectSelectedValues(options.value, true)
    const exists = current.some((item) => sameSelectValue(item, options.option.value))
    if (exists) return current.filter((item) => !sameSelectValue(item, options.option.value))
    if (options.maxCount !== undefined && current.length >= options.maxCount) return current
    return [...current, options.option.value]
  }
  return options.option.value
}

/** Select every enabled option in the current filtered list, up to `maxCount`. */
export function selectAllSelectValues(options: {
  value: SelectModelValue
  options: SelectOptions
  maxCount?: number
  readOnly?: boolean
}): SelectValue[] {
  const current = getSelectSelectedValues(options.value, true)
  if (options.readOnly) return current
  const next = [...current]
  for (const option of flattenSelectOptions(options.options)) {
    if (option.disabled) continue
    if (next.some((item) => sameSelectValue(item, option.value))) continue
    if (options.maxCount !== undefined && next.length >= options.maxCount) break
    next.push(option.value)
  }
  return next
}

function readOptionField(
  record: Record<string, unknown>,
  key: string | undefined,
  fallback: string
): unknown {
  const name = key || fallback
  return record[name]
}

function mapSelectRecord(
  record: Record<string, unknown>,
  fields: SelectOptionFields
): SelectOption | SelectOptionGroup | null {
  const groupKey = fields.options || 'options'
  const nested = record[groupKey]
  if (Array.isArray(nested)) {
    const label = readOptionField(record, fields.label, 'label')
    const options = nested
      .map((item) =>
        item && typeof item === 'object'
          ? mapSelectRecord(item as Record<string, unknown>, fields)
          : null
      )
      .filter((item): item is SelectOption => !!item && !isOptionGroup(item))
    return { label: label == null ? '' : String(label), options }
  }
  const value = readOptionField(record, fields.value, 'value')
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const label = readOptionField(record, fields.label, 'label')
  const description = readOptionField(record, fields.description, 'description')
  const disabled = readOptionField(record, fields.disabled, 'disabled')
  const option: SelectOption = {
    value,
    label: label == null ? String(value) : String(label)
  }
  if (typeof description === 'string' && description) option.description = description
  if (disabled === true) option.disabled = true
  return option
}

/** Read options from caller data. Without `optionFields`, records pass through. */
export function normalizeSelectOptions(
  options: readonly unknown[] | undefined,
  fields?: SelectOptionFields
): SelectOptions {
  if (!options) return []
  if (!fields) return options as SelectOptions
  return options
    .map((item) =>
      item && typeof item === 'object'
        ? mapSelectRecord(item as Record<string, unknown>, fields)
        : null
    )
    .filter((item): item is SelectOption | SelectOptionGroup => item !== null)
}

export function clearSelectValue(multiple: boolean): SelectModelValue {
  return multiple ? [] : null
}

export function removeLastSelectValue(value: SelectModelValue): SelectValue[] {
  const current = getSelectSelectedValues(value, true)
  return current.slice(0, -1)
}

export function removeSelectValue(value: SelectModelValue, target: SelectValue): SelectValue[] {
  return getSelectSelectedValues(value, true).filter((item) => !sameSelectValue(item, target))
}

export interface SelectTagItem {
  value: SelectValue
  label: string
  key: string
}

export interface SelectTagPresentation {
  tags: SelectTagItem[]
  collapsedCount: number
  collapsedLabel: string
  /** Names of the tags hidden by `maxTagCount`. */
  collapsedItems: SelectTagItem[]
}

export function resolveSelectTags(options: {
  value: SelectModelValue
  options: SelectOptions
  createdOptions?: SelectOption[]
  optionCache?: ReadonlyMap<SelectValue, SelectOption>
  maxTagCount?: number
  moreCountText?: string
}): SelectTagPresentation {
  const lookup = [
    ...flattenSelectOptions(options.options),
    ...(options.createdOptions ?? []),
    ...Array.from(options.optionCache?.values() ?? [])
  ]
  const values = getSelectSelectedValues(options.value, true)
  const items = values.map((value, index) => {
    const match = lookup.find((option) => sameSelectValue(option.value, value))
    return {
      value,
      label: match?.label ?? String(value),
      key: `${index}-${String(value)}`
    }
  })
  const limit = options.maxTagCount
  if (limit === undefined || items.length <= limit) {
    return { tags: items, collapsedCount: 0, collapsedLabel: '', collapsedItems: [] }
  }
  const collapsedItems = items.slice(limit)
  const collapsedLabel = (options.moreCountText ?? '+{count}').replace(
    /\{count\}/g,
    String(collapsedItems.length)
  )
  return {
    tags: items.slice(0, limit),
    collapsedCount: collapsedItems.length,
    collapsedLabel,
    collapsedItems
  }
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
  multiple?: boolean
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
    if ((key === 'Backspace' || key === 'Delete') && options.multiple && options.hasValue) {
      return { type: 'remove-last' }
    }
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
  return scrollTopForVirtualAlign({
    scrollTop: options.scrollTop,
    viewport: options.listHeight,
    offset: options.rowIndex * options.itemHeight,
    size: options.itemHeight,
    align: 'auto'
  })
}

export function serializeSelectFormValues(value: SelectModelValue, multiple: boolean): string[] {
  return getSelectSelectedValues(value, multiple).map((item) => String(item))
}

export function coerceSelectFormValue(
  raw: unknown,
  options: SelectOptions,
  multiple: boolean
): SelectModelValue | null | undefined {
  if (raw === undefined) return undefined
  if (multiple) {
    if (Array.isArray(raw)) return raw as SelectValues
    if (raw === '' || raw === null) return []
    return undefined
  }
  if (raw === '') {
    return flattenSelectOptions(options).some((option) => option.value === '') ? '' : null
  }
  if (raw === null) return null
  if (typeof raw === 'string' || typeof raw === 'number') return raw
  return null
}

export function selectRowGroupLabel(
  rows: readonly SelectListRow[],
  index: number
): string | undefined {
  for (let cursor = index; cursor >= 0; cursor -= 1) {
    const row = rows[cursor]
    if (row?.kind === 'group') return row.label
  }
  return undefined
}

export interface SelectVirtualWindow {
  startIndex: number
  endIndex: number
  offsetTop: number
  totalHeight: number
}

/** Variable-height window that always keeps the active row mounted. */
export function getSelectVirtualWindow(options: {
  rows: readonly SelectListRow[]
  scrollTop: number
  listHeight: number
  size?: ComponentSize
  activeRowIndex?: number
  overscan?: number
}): SelectVirtualWindow {
  const size = options.size ?? 'md'
  const count = options.rows.length
  if (count === 0) return { startIndex: 0, endIndex: -1, offsetTop: 0, totalHeight: 0 }
  const strategy = variableSizeStrategy(
    (index) => getSelectVirtualRowHeight(size, options.rows[index]?.kind),
    count
  )
  const range = strategy.getRange(
    options.scrollTop,
    options.listHeight,
    count,
    options.overscan ?? 5
  )
  let startIndex = range.startIndex
  let endIndex = range.endIndex
  const active = options.activeRowIndex ?? -1
  if (active >= 0 && active < count) {
    startIndex = Math.min(startIndex, active)
    endIndex = Math.max(endIndex, active)
  }
  return {
    startIndex,
    endIndex,
    offsetTop: strategy.getItemOffset(startIndex),
    totalHeight: strategy.getItemOffset(count)
  }
}

export function focusAfterPaint(read: () => HTMLElement | null | undefined): void {
  const focus = () => {
    const node = read()
    node?.focus()
  }
  if (typeof requestAnimationFrame !== 'function') {
    queueMicrotask(focus)
    return
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(focus)
  })
}

export function createSelectScrollScheduler(apply: (scrollTop: number) => void): {
  onScroll: (scrollTop: number) => void
  cancel: () => void
} {
  let frame: number | undefined
  let latest = 0
  const requestFrame =
    typeof requestAnimationFrame === 'function'
      ? (callback: () => void) => requestAnimationFrame(callback)
      : (callback: () => void) => setTimeout(callback, 16) as unknown as number
  const cancelFrame =
    typeof cancelAnimationFrame === 'function'
      ? (id: number) => cancelAnimationFrame(id)
      : (id: number) => clearTimeout(id)
  return {
    onScroll(scrollTop: number) {
      latest = scrollTop
      if (frame !== undefined) return
      frame = requestFrame(() => {
        frame = undefined
        apply(latest)
      })
    },
    cancel() {
      if (frame === undefined) return
      cancelFrame(frame)
      frame = undefined
    }
  }
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
