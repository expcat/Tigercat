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
import { fixedSizeStrategy } from './virtual-list-utils'

export const CASCADER_DEFAULT_LIST_HEIGHT = 256
export const CASCADER_DEFAULT_SEARCH_LIMIT = 50
export const CASCADER_DEFAULT_SEPARATOR = ' / '

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
  'text-start text-[var(--tiger-text,#111827)]',
  'border-b border-[var(--tiger-border,#e5e7eb)]',
  'bg-[var(--tiger-surface,#ffffff)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
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

export function getCascaderColumnClasses(focused: boolean): string {
  return classNames(
    'min-w-[160px] overflow-auto border-e last:border-e-0',
    'border-[var(--tiger-border,#e5e7eb)]',
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
  if (option.isLeaf === true) return false
  if (option.children && option.children.length > 0) return true
  return hasLoadData && option.isLeaf === false
}

export function findCascaderOption(
  options: CascaderOption[],
  value: string | number
): CascaderOption | undefined {
  return options.find((opt) => opt.value === value)
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

export function getCascaderDisplayLabel(
  options: CascaderOption[],
  valuePath: CascaderModelValue,
  separator: string = CASCADER_DEFAULT_SEPARATOR,
  cache?: Map<string, string>
): string {
  if (!valuePath || valuePath.length === 0) return ''
  const path = getCascaderOptionPath(options, valuePath)
  if (path.length === valuePath.length) {
    return path.map((opt) => opt.label).join(separator)
  }
  return cache?.get(cascaderPathKey(valuePath)) ?? path.map((opt) => opt.label).join(separator)
}

export function isCascaderValueEmpty(value: CascaderModelValue): boolean {
  return value === undefined || value.length === 0
}

export function normalizeCascaderValue(value: CascaderModelValue): CascaderModelValue {
  if (value === undefined || value.length === 0) return undefined
  return value
}

export function shouldShowCascaderClear(options: {
  clearable: boolean
  disabled: boolean
  value: CascaderModelValue
}): boolean {
  return options.clearable && !options.disabled && !isCascaderValueEmpty(options.value)
}

export function serializeCascaderFormValue(value: CascaderModelValue): string | undefined {
  if (isCascaderValueEmpty(value) || !value) return undefined
  return JSON.stringify(value)
}

export function coerceCascaderFormValue(value: unknown): CascaderModelValue {
  if (value === undefined || value === null) return undefined
  if (Array.isArray(value)) {
    return normalizeCascaderValue(value as CascaderValue)
  }
  if (typeof value === 'string' && value.startsWith('[')) {
    try {
      const parsed = JSON.parse(value) as unknown
      if (Array.isArray(parsed)) return normalizeCascaderValue(parsed as CascaderValue)
    } catch {
      return undefined
    }
  }
  return undefined
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
    if (option.value !== head) return option
    if (rest.length === 0) {
      return { ...option, children, isLeaf: children.length === 0 ? true : option.isLeaf }
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

export function resolveCascaderActivePath(value: CascaderModelValue): CascaderValue {
  return value ?? []
}

export function selectedIndexInColumn(
  options: CascaderOption[],
  selectedValue: string | number | undefined
): number {
  if (selectedValue === undefined) return -1
  return options.findIndex((option) => option.value === selectedValue)
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
  const top = index * itemHeight
  if (top < scrollTop) return top
  if (top + itemHeight > scrollTop + listHeight) return top + itemHeight - listHeight
  return scrollTop
}
