import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import type { TreeCheckStrategy, TreeFilterFn, TreeNode } from '../types/tree'
import type { TreeSelectValue } from '../types/tree-select'
import { classNames } from './class-names'
import {
  getSelectTriggerClasses,
  getSelectVirtualItemHeight,
  selectBaseClasses,
  selectDoneActionClasses,
  selectDoneButtonClasses,
  selectDropdownBaseClasses,
  selectEmptyStateClasses,
  selectInGroupClasses,
  selectSearchInputClasses,
  selectSearchWrapClasses,
  selectStandaloneClasses,
  selectTrailingSlotClasses
} from './select-utils'
import {
  filterTreeNodes,
  findNode,
  getAllKeys,
  getAutoExpandKeys,
  getCheckedKeysByStrategy,
  getParentKeys,
  getVisibleTreeItems,
  handleNodeCheck,
  type VisibleTreeItem
} from './tree-utils'

export const TREE_SELECT_DEFAULT_HEIGHT = 256

export const treeSelectBaseClasses = selectBaseClasses
export const treeSelectDropdownClasses = classNames(selectDropdownBaseClasses, 'min-w-0')
export const treeSelectSearchClasses = selectSearchInputClasses
export const treeSelectSearchWrapClasses = selectSearchWrapClasses
export const treeSelectEmptyClasses = selectEmptyStateClasses
export const treeSelectDoneActionClasses = selectDoneActionClasses
export const treeSelectDoneButtonClasses = selectDoneButtonClasses
export const treeSelectTrailingSlotClasses = selectTrailingSlotClasses

export const treeSelectTreeClasses = 'overflow-auto min-h-0 flex-1 max-sm:max-h-none'
export const treeSelectExpandButtonClasses = classNames(
  'inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-sm',
  'text-[var(--tiger-text-muted,#9ca3af)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
)

const TREE_SELECT_NODE_PAD_Y: Record<ComponentSize, string> = {
  sm: 'text-sm py-1',
  md: 'text-base py-1.5',
  lg: 'text-lg py-2'
}

export type TreeSelectTriggerKeyIntent =
  | { type: 'none' }
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'clear' }
  | { type: 'select-active' }
  | { type: 'prevent-scroll' }
  | { type: 'tree-key'; key: string }

export function getTreeSelectRootClasses(inGroup: boolean, className?: string): string {
  return classNames(
    treeSelectBaseClasses,
    inGroup ? selectInGroupClasses : selectStandaloneClasses,
    className
  )
}

export function getTreeSelectDropdownClasses(_virtual = false): string {
  return treeSelectDropdownClasses
}

export function getTreeSelectTriggerClasses(options: {
  size?: ComponentSize
  disabled?: boolean
  isOpen?: boolean
  status?: InputStatus
  hasClear?: boolean
}): string {
  return getSelectTriggerClasses(options)
}

export function getTreeSelectNodeClasses(options: {
  isSelected?: boolean
  isDisabled?: boolean
  isActive?: boolean
  size?: ComponentSize
}): string {
  const size = options.size ?? 'md'
  return classNames(
    'flex items-center w-full rounded text-start',
    TREE_SELECT_NODE_PAD_Y[size],
    'tiger-motion-aware [transition:var(--tiger-transition-base,background-color_150ms_ease,color_150ms_ease)]',
    options.isDisabled
      ? 'text-[var(--tiger-text-muted,#9ca3af)] cursor-not-allowed opacity-50'
      : 'cursor-pointer hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)]',
    options.isSelected &&
      'bg-[var(--tiger-outline-bg-active,#dbeafe)] text-[var(--tiger-primary,#2563eb)]',
    options.isActive &&
      !options.isDisabled &&
      'ring-2 ring-inset ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'
  )
}

export function getTreeSelectNodeIndentStyle(level: number): {
  paddingInlineStart: string
} {
  return { paddingInlineStart: `${Math.max(0, level - 1) * 20 + 8}px` }
}

export function getTreeSelectExpandIconClasses(
  expanded: boolean,
  dir: 'ltr' | 'rtl' = 'ltr'
): string {
  return classNames(
    'inline-flex tiger-motion-aware [transition:var(--tiger-transition-base,transform_150ms_ease)]',
    expanded && 'rotate-90',
    !expanded && dir === 'rtl' && 'rotate-180'
  )
}

export function getTreeSelectVirtualItemHeight(size: ComponentSize = 'md'): number {
  return getSelectVirtualItemHeight(size)
}

export function isTreeSelectValueEmpty(value: TreeSelectValue, multiple: boolean): boolean {
  if (multiple) return !Array.isArray(value) || value.length === 0
  return value === undefined
}

export function normalizeTreeSelectValue(
  value: TreeSelectValue,
  multiple: boolean
): TreeSelectValue {
  if (multiple) {
    if (value === undefined) return []
    if (Array.isArray(value)) return value
    return [value]
  }
  if (Array.isArray(value)) return value[0]
  return value
}

export function getTreeSelectSelectedKeys(
  value: TreeSelectValue,
  multiple: boolean
): (string | number)[] {
  const normalized = normalizeTreeSelectValue(value, multiple)
  if (multiple) return Array.isArray(normalized) ? normalized : []
  return normalized === undefined ? [] : [normalized as string | number]
}

export function shouldShowTreeSelectClear(options: {
  clearable: boolean
  disabled: boolean
  value: TreeSelectValue
  multiple: boolean
}): boolean {
  return (
    options.clearable &&
    !options.disabled &&
    !isTreeSelectValueEmpty(options.value, options.multiple)
  )
}

export function serializeTreeSelectFormValues(value: TreeSelectValue, multiple: boolean): string[] {
  return getTreeSelectSelectedKeys(value, multiple).map(String)
}

export function coerceTreeSelectFormValue(value: unknown, multiple: boolean): TreeSelectValue {
  if (value === undefined || value === null) return undefined
  if (multiple) {
    if (Array.isArray(value)) return value as (string | number)[]
    return [value as string | number]
  }
  if (Array.isArray(value)) return value[0] as string | number | undefined
  if (typeof value === 'string' || typeof value === 'number') return value
  return undefined
}

export function rememberTreeSelectLabel(
  cache: Map<string | number, string>,
  key: string | number,
  label: string
): void {
  cache.set(key, label)
}

export function getTreeSelectDisplayLabel(
  data: TreeNode[],
  value: TreeSelectValue,
  cache?: Map<string | number, string>
): string {
  if (value === undefined) return ''
  if (Array.isArray(value)) {
    return value
      .map((key) => findNode(data, key)?.label ?? cache?.get(key) ?? String(key))
      .join(', ')
  }
  return findNode(data, value)?.label ?? cache?.get(value) ?? String(value)
}

export function getTreeSelectVisibleIndex(
  items: VisibleTreeItem[],
  value: TreeSelectValue
): number {
  if (value === undefined) return -1
  if (Array.isArray(value)) {
    if (value.length === 0) return -1
    const selected = new Set(value)
    return items.findIndex((item) => selected.has(item.key))
  }
  return items.findIndex((item) => item.key === value)
}

export function resolveTreeSelectVisibleItems(options: {
  treeData: TreeNode[]
  expandedKeys: Set<string | number>
  searchQuery: string
  filterFn?: TreeFilterFn
}): VisibleTreeItem[] {
  const matched = options.searchQuery
    ? filterTreeNodes(options.treeData, options.searchQuery, options.filterFn)
    : undefined
  const expanded = matched
    ? new Set([...options.expandedKeys, ...getAutoExpandKeys(options.treeData, matched)])
    : options.expandedKeys
  return getVisibleTreeItems(options.treeData, expanded, matched)
}

export function getTreeSelectOpenExpandedKeys(options: {
  treeData: TreeNode[]
  selectedKeys: (string | number)[]
  defaultExpandAll: boolean
  expandedKeys: Iterable<string | number>
}): Set<string | number> {
  const next = new Set(options.expandedKeys)
  if (options.defaultExpandAll) {
    for (const key of getAllKeys(options.treeData)) next.add(key)
  }
  for (const key of options.selectedKeys) {
    for (const parent of getParentKeys(options.treeData, key)) next.add(parent)
  }
  return next
}

export function toggleTreeSelectExpandedKey(
  expanded: Iterable<string | number>,
  key: string | number
): Set<string | number> {
  const next = new Set(expanded)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  return next
}

export function commitTreeSelectNode(options: {
  treeData: TreeNode[]
  key: string | number
  value: TreeSelectValue
  multiple: boolean
  checkStrictly: boolean
  checkStrategy: TreeCheckStrategy
}): TreeSelectValue {
  const { treeData, key, multiple, checkStrictly, checkStrategy } = options
  if (!multiple) return key
  const current = getTreeSelectSelectedKeys(options.value, true)
  const checked = current.includes(key)
  const state = handleNodeCheck(treeData, key, !checked, current, checkStrictly)
  return getCheckedKeysByStrategy(state, treeData, checkStrategy)
}

export function getTreeSelectTriggerKeyIntent(options: {
  key: string
  open: boolean
  searchable: boolean
  clearable: boolean
  hasValue: boolean
  fromSearchInput?: boolean
}): TreeSelectTriggerKeyIntent {
  const { key, open, searchable, fromSearchInput } = options
  if (key === 'Escape') {
    return open ? { type: 'tree-key', key } : { type: 'none' }
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
  if (key === 'Enter' || (key === ' ' && !fromSearchInput && !searchable)) {
    return { type: 'select-active' }
  }
  if (key === ' ' && fromSearchInput) {
    return { type: 'none' }
  }
  return { type: 'tree-key', key }
}

export function getTreeSelectTreeItemId(treeId: string, key: string | number): string {
  return `${treeId}-item-${String(key)}`
}

export function getTreeSelectTreeItemAria(options: {
  selected: boolean
  disabled: boolean
  level: number
  expanded?: boolean
  expandable: boolean
}): {
  role: 'treeitem'
  'aria-selected': boolean
  'aria-disabled': boolean | undefined
  'aria-level': number
  'aria-expanded': boolean | undefined
} {
  return {
    role: 'treeitem',
    'aria-selected': options.selected,
    'aria-disabled': options.disabled || undefined,
    'aria-level': options.level,
    'aria-expanded': options.expandable ? Boolean(options.expanded) : undefined
  }
}

export {
  getTreeVirtualAlignScrollTop as getTreeSelectVirtualAlignScrollTop,
  alignTreeVirtualScroll as alignTreeSelectVirtualScroll,
  isTreeNodeExpandable,
  getVisibleTreeItems,
  findNode,
  getAllKeys,
  getParentKeys
} from './tree-utils'
