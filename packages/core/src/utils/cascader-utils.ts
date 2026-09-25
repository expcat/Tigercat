import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import type {
  CascaderFlattenedOption,
  CascaderModelValue,
  CascaderOption,
  CascaderSearchConfig,
  CascaderValue
} from '../types/cascader'
import type { VirtualRange } from '../types/virtual-list'
import { classNames } from './class-names'
import { getPopupListOptionActiveClasses, popupListOptionActiveClasses } from './interaction-styles'
import { findFirstEnabledIndex, getPickerNavigationIndex } from './picker-utils'
import {
  getSelectTriggerClasses,
  getSelectVirtualItemHeight,
  selectBaseClasses,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  selectDropdownBaseClasses,
  selectEmptyStateClasses,
  selectInGroupClasses,
  selectListboxClasses,
  selectSearchInputClasses,
  selectSearchWrapClasses,
  selectStandaloneClasses,
  selectTrailingSlotClasses
} from './select-utils'
import { fixedSizeStrategy, scrollTopForVirtualAlign } from './virtual-list-utils'
import {
  gateBranchLoad,
  isTreeNodeExpandable,
  sameTreeKey,
  treeKeyId,
  type BranchLoadGate
} from './tree-utils'

export const CASCADER_DEFAULT_LIST_HEIGHT = 256
export const CASCADER_DEFAULT_SEARCH_LIMIT = 50
export const CASCADER_DEFAULT_SEPARATOR = ' / '

const EMPTY_CASCADER_PATH: CascaderValue = []

const CASCADER_VIRTUAL_OVERSCAN = 5

const CASCADER_OPTION_PAD_Y: Record<ComponentSize, string> = {
  sm: 'text-sm py-1.5',
  md: 'text-base py-2',
  lg: 'text-lg py-2.5'
}

export const cascaderBaseClasses = selectBaseClasses
export const cascaderDropdownClasses = classNames(selectDropdownBaseClasses, 'min-w-0', 'w-max')
export const cascaderSearchInputClasses = selectSearchInputClasses
export const cascaderSearchWrapClasses = selectSearchWrapClasses
export const cascaderEmptyStateClasses = selectEmptyStateClasses
export const cascaderListboxClasses = selectListboxClasses
export const cascaderDoneActionClasses = selectDoneActionClasses
export const cascaderDoneButtonClasses = selectDoneButtonClasses
export const cascaderTrailingSlotClasses = selectTrailingSlotClasses

export const cascaderColumnsClasses = 'flex min-w-0 max-sm:block'
export const cascaderBackButtonClasses = classNames(
  'hidden max-sm:flex items-center gap-1 shrink-0 px-3 py-2 text-sm',
  'text-start text-[var(--tiger-text)]',
  'border-b border-[var(--tiger-border)]',
  'bg-[var(--tiger-surface)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring)]'
)

export type CascaderTriggerKeyIntent =
  | { type: 'none' }
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'clear' }
  | { type: 'navigate'; key: string }
  | { type: 'into' }
  | { type: 'out' }
  | { type: 'select-active' }
  | { type: 'prevent-scroll' }

export type CascaderColumn = {
  options: CascaderOption[]
  selectedValue?: string | number
}

export function getCascaderRootClasses(inGroup: boolean, className?: string): string {
  return classNames(
    cascaderBaseClasses,
    inGroup ? selectInGroupClasses : selectStandaloneClasses,
    className
  )
}

export function getCascaderTriggerClasses(options: {
  size?: ComponentSize
  disabled?: boolean
  isOpen?: boolean
  status?: InputStatus
  hasClear?: boolean
}): string {
  return getSelectTriggerClasses(options)
}

export function getCascaderOptionClasses(options: {
  isSelected: boolean
  isDisabled: boolean
  isActive: boolean
  size?: ComponentSize
}): string {
  const size = options.size ?? 'md'
  return classNames(
    'w-full px-3 flex items-center justify-between gap-2 text-start',
    CASCADER_OPTION_PAD_Y[size],
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

export function getCascaderColumnClasses(focused: boolean): string {
  return classNames(
    'min-w-[160px] overflow-auto border-e last:border-e-0',
    'border-[var(--tiger-border)]',
    'max-sm:min-w-0 max-sm:w-full max-sm:border-e-0',
    !focused && 'max-sm:hidden'
  )
}

export function getCascaderPanelStyle(listHeight: number): { maxHeight: string } {
  return { maxHeight: `${listHeight}px` }
}

export function getCascaderColumnStyle(listHeight: number): {
  height: string
  maxHeight: string
} {
  return { height: `${listHeight}px`, maxHeight: `${listHeight}px` }
}

export function getCascaderVirtualItemHeight(size: ComponentSize = 'md'): number {
  return getSelectVirtualItemHeight(size)
}

export function getCascaderOptionKey(option: CascaderOption, index: number): string {
  return `${index}-${String(option.value)}`
}

export function isCascaderOptionExpandable(option: CascaderOption, hasLoadData = false): boolean {
  return isTreeNodeExpandable(
    {
      key: option.value,
      label: option.label,
      isLeaf: option.isLeaf,
      disabled: option.disabled,
      children: option.children?.map((child) => ({
        key: child.value,
        label: child.label,
        isLeaf: child.isLeaf
      }))
    },
    hasLoadData
  )
}

export function findCascaderOption(
  options: CascaderOption[],
  value: string | number
): CascaderOption | undefined {
  return options.find((opt) => String(opt.value) === String(value))
}

export function cascaderPathId(valuePath: CascaderValue): string {
  return valuePath.map((value) => treeKeyId(value)).join('/')
}

export function gateCascaderLoad(
  option: CascaderOption,
  hasLoadData: boolean,
  loaded: boolean,
  loading: boolean
): BranchLoadGate {
  return gateBranchLoad({
    disabled: option.disabled,
    isLeaf: option.isLeaf,
    hasChildren: Boolean(option.children && option.children.length > 0),
    hasLoadData,
    loaded,
    loading
  })
}

export function getCascaderOptionPath(
  options: CascaderOption[],
  valuePath: CascaderValue
): CascaderOption[] {
  const result: CascaderOption[] = []
  let currentOptions = options

  for (const value of valuePath) {
    const option = findCascaderOption(currentOptions, value)
    if (!option) break
    result.push(option)
    currentOptions = option.children ?? []
  }

  return result
}

export function cascaderPathKey(valuePath: CascaderValue): string {
  return valuePath.map(String).join('\0')
}

export function rememberCascaderLabel(
  cache: Map<string, string>,
  valuePath: CascaderValue,
  label: string
): void {
  if (valuePath.length === 0 || !label) return
  cache.set(cascaderPathKey(valuePath), label)
}

export function getCascaderDisplaySegments(
  options: CascaderOption[],
  valuePath: CascaderValue
): { segments: string[]; resolved: number } {
  const segments: string[] = []
  let current = options
  let resolved = 0
  let blocked = false
  for (const value of valuePath) {
    if (blocked) {
      segments.push(String(value))
      continue
    }
    const option = findCascaderOption(current, value)
    if (!option) {
      segments.push(String(value))
      blocked = true
      continue
    }
    segments.push(option.label)
    resolved += 1
    current = option.children ?? []
  }
  return { segments, resolved }
}

export function getCascaderDisplayLabel(
  options: CascaderOption[],
  valuePath: CascaderModelValue | null | '',
  separator: string = CASCADER_DEFAULT_SEPARATOR,
  cache?: Map<string, string>
): string {
  if (valuePath == null || valuePath === '' || valuePath.length === 0) return ''
  const { segments, resolved } = getCascaderDisplaySegments(options, valuePath)
  if (resolved === valuePath.length) return segments.join(separator)
  if (resolved === 0) {
    const cached = cache?.get(cascaderPathKey(valuePath))
    if (cached) return cached
  }
  return segments.join(separator)
}

export function isCascaderValueEmpty(value: CascaderModelValue | null | ''): boolean {
  if (value == null || value === '') return true
  return value.length === 0
}

export function normalizeCascaderValue(value: CascaderModelValue | null | ''): CascaderModelValue {
  if (value === undefined) return undefined
  if (value == null || value === '' || value.length === 0) return EMPTY_CASCADER_PATH
  return value
}

export function cascaderValuesEqual(
  left: CascaderModelValue | null | '',
  right: CascaderModelValue | null | ''
): boolean {
  const a = Array.isArray(left) ? left : []
  const b = Array.isArray(right) ? right : []
  if (a.length !== b.length) return false
  return a.every((item, index) => sameTreeKey(item, b[index]))
}

export function shouldShowCascaderClear(options: {
  clearable: boolean
  disabled: boolean
  readOnly?: boolean
  value: CascaderModelValue | null | ''
}): boolean {
  return (
    options.clearable &&
    !options.disabled &&
    !options.readOnly &&
    !isCascaderValueEmpty(options.value)
  )
}

/** Empty named value submits one explicit empty field (`''`), not an omitted input. */
export function serializeCascaderFormValue(value: CascaderModelValue | null | ''): string {
  if (isCascaderValueEmpty(value) || !value) return ''
  return JSON.stringify(value)
}

export function coerceCascaderFormValue(value: unknown): CascaderModelValue {
  if (value === undefined) return undefined
  if (value === null || value === '') return EMPTY_CASCADER_PATH
  if (Array.isArray(value)) {
    return normalizeCascaderValue(value as CascaderValue) ?? EMPTY_CASCADER_PATH
  }
  if (typeof value === 'string' && value.startsWith('[')) {
    try {
      const parsed = JSON.parse(value) as unknown
      if (Array.isArray(parsed))
        return normalizeCascaderValue(parsed as CascaderValue) ?? EMPTY_CASCADER_PATH
    } catch {
      return EMPTY_CASCADER_PATH
    }
  }
  return EMPTY_CASCADER_PATH
}

export function shouldSeedCascaderFormDefault(options: {
  alreadySeeded: boolean
  fieldName?: string
  controlledValue: CascaderModelValue
  formValue: unknown
  defaultValue: CascaderModelValue
}): boolean {
  if (options.alreadySeeded) return false
  if (!options.fieldName) return false
  if (options.controlledValue !== undefined) return false
  if (options.defaultValue === undefined) return false
  return options.formValue === '' || options.formValue == null
}

export function getCascaderOptionsAtLevel(
  options: CascaderOption[],
  selectedPath: CascaderValue,
  level: number
): CascaderOption[] {
  return getCascaderColumns(options, selectedPath.slice(0, level))[level]?.options ?? []
}

export function flattenCascaderOptions(
  options: CascaderOption[],
  parentPath: CascaderOption[] = [],
  parentValuePath: CascaderValue = [],
  changeOnSelect = false,
  separator: string = CASCADER_DEFAULT_SEPARATOR
): CascaderFlattenedOption[] {
  const result: CascaderFlattenedOption[] = []

  for (const option of options) {
    const currentPath = [...parentPath, option]
    const currentValuePath = [...parentValuePath, option.value]
    const expandable = isCascaderOptionExpandable(option)
    const isDisabled = currentPath.some((item) => item.disabled)

    if (!expandable || changeOnSelect) {
      result.push({
        path: currentPath,
        valuePath: currentValuePath,
        label: currentPath.map((item) => item.label).join(separator),
        disabled: isDisabled
      })
    }

    if (expandable && option.children) {
      result.push(
        ...flattenCascaderOptions(
          option.children,
          currentPath,
          currentValuePath,
          changeOnSelect,
          separator
        )
      )
    }
  }

  return result
}

export function defaultCascaderFilter(inputValue: string, path: CascaderOption[]): boolean {
  const searchLower = inputValue.toLowerCase()
  return path.some((option) => option.label.toLowerCase().includes(searchLower))
}

export function resolveCascaderSearchLimit(searchable?: boolean | CascaderSearchConfig): number {
  if (typeof searchable === 'object' && typeof searchable.limit === 'number') {
    return searchable.limit
  }
  return CASCADER_DEFAULT_SEARCH_LIMIT
}

export function filterCascaderOptions(
  flattenedOptions: CascaderFlattenedOption[],
  inputValue: string,
  searchable?: boolean | CascaderSearchConfig
): CascaderFlattenedOption[] {
  if (!inputValue) return flattenedOptions

  const filterFn =
    typeof searchable === 'object' && searchable.filter ? searchable.filter : defaultCascaderFilter
  const limit = resolveCascaderSearchLimit(searchable)
  return flattenedOptions.filter((item) => filterFn(inputValue, item.path)).slice(0, limit)
}

export function getCascaderColumns(
  options: CascaderOption[],
  activePath: CascaderValue,
  hasLoadData = false
): CascaderColumn[] {
  if (!options.length) return []

  const columns: CascaderColumn[] = [{ options, selectedValue: activePath[0] }]
  let currentOptions = options

  for (let i = 0; i < activePath.length; i++) {
    const option = findCascaderOption(currentOptions, activePath[i])
    if (!option || !isCascaderOptionExpandable(option, hasLoadData)) break
    if (!option.children || option.children.length === 0) break
    currentOptions = option.children
    columns.push({
      options: currentOptions,
      selectedValue: activePath[i + 1]
    })
  }

  return columns
}

export function setCascaderOptionChildren(
  options: CascaderOption[],
  valuePath: CascaderValue,
  children: CascaderOption[]
): CascaderOption[] {
  if (valuePath.length === 0) return children

  const [head, ...rest] = valuePath
  return options.map((option) => {
    if (!sameTreeKey(option.value, head)) return option
    if (rest.length === 0) {
      return { ...option, children }
    }
    return {
      ...option,
      children: setCascaderOptionChildren(option.children ?? [], rest, children)
    }
  })
}

export function getCascaderInlineNav(
  key: string,
  dir: 'ltr' | 'rtl' = 'ltr'
): 'into' | 'out' | null {
  const into = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const out = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
  if (key === into) return 'into'
  if (key === out) return 'out'
  return null
}

export function getCascaderTriggerKeyIntent(options: {
  key: string
  open: boolean
  searchable: boolean
  searchMode?: boolean
  clearable: boolean
  hasValue: boolean
  fromSearchInput?: boolean
  dir?: 'ltr' | 'rtl'
}): CascaderTriggerKeyIntent {
  const { key, open, searchable, searchMode, fromSearchInput, dir = 'ltr' } = options
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
  if (!searchMode) {
    const inline = getCascaderInlineNav(key, dir)
    if (inline === 'into') return { type: 'into' }
    if (inline === 'out') return { type: 'out' }
  }
  if (key === 'Enter' || (key === ' ' && !fromSearchInput && !searchable)) {
    return { type: 'select-active' }
  }
  return { type: 'none' }
}

export function navigateCascaderColumnIndex(
  items: readonly CascaderOption[],
  current: number,
  key: string
): number {
  return getPickerNavigationIndex(items, current, key, (item) => Boolean(item.disabled))
}

export function getCascaderColumnOptionId(
  listboxId: string,
  colIndex: number,
  optionIndex: number
): string {
  return `${listboxId}-col${colIndex}-opt${optionIndex}`
}

export function resolveCascaderActivePath(value: CascaderModelValue | null | ''): CascaderValue {
  return Array.isArray(value) ? value : []
}

/**
 * Browse path initializes from the committed value only on the closed → open
 * transition. Options identity, search config identity, and merged children
 * must not pull it back while the panel stays open.
 */
export function nextCascaderBrowsePath(options: {
  open: boolean
  previousOpen: boolean
  activePath: CascaderValue
  committed: CascaderModelValue | null | ''
}): CascaderValue {
  if (options.open && !options.previousOpen) {
    return resolveCascaderActivePath(options.committed)
  }
  return options.activePath
}

export function selectedIndexInColumn(
  options: CascaderOption[],
  selectedValue: string | number | undefined
): number {
  if (selectedValue === undefined) return -1
  return options.findIndex((option) => sameTreeKey(option.value, selectedValue))
}

export function initialCascaderColumnActiveIndices(columns: CascaderColumn[]): number[] {
  return columns.map((column) => {
    const selected = selectedIndexInColumn(column.options, column.selectedValue)
    if (selected >= 0 && !column.options[selected]?.disabled) return selected
    return findFirstEnabledIndex(column.options, (item) => Boolean(item.disabled))
  })
}

export function getCascaderVirtualRange(
  scrollTop: number,
  listHeight: number,
  itemCount: number,
  itemHeight: number,
  overscan: number = CASCADER_VIRTUAL_OVERSCAN
): VirtualRange {
  const range = fixedSizeStrategy(itemHeight).getRange(scrollTop, listHeight, itemCount, overscan)
  if (range.endIndex < 0 || range.startIndex <= range.endIndex) return range
  return {
    ...range,
    startIndex: range.endIndex,
    offsetTop: range.endIndex * itemHeight
  }
}

export function getCascaderVirtualAlignScrollTop(
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
