import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'
import type { TreeCheckStrategy, TreeFilterFn, TreeNode } from '../types/tree'
import type { TreeSelectValue } from '../types/tree-select'
import { classNames } from './class-names'
import { getPopupListOptionActiveClasses, popupListOptionActiveClasses } from './interaction-styles'
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
  selectTrailingSlotClasses,
  POPUP_LIST_INLINE_PADDING
} from './select-utils'
import {
  calculateCheckedState,
  filterTreeNodes,
  findNode,
  getAllKeys,
  getAutoExpandKeys,
  getParentKeys,
  getVisibleTreeItems,
  handleNodeCheck,
  resolveOutwardCheckedKeys,
  sameTreeKey,
  TREE_INDENT_SLOT_PX,
  treeKeyId,
  type VisibleTreeItem
} from './tree-utils'

export const TREE_SELECT_DEFAULT_HEIGHT = 256

const EMPTY_TREE_SELECT_MULTIPLE: (string | number)[] = []

export function resolveTreeSelectListHeight(listHeight?: number): number {
  return listHeight ?? TREE_SELECT_DEFAULT_HEIGHT
}

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
  'text-[var(--tiger-text-secondary)]',
  'focus:outline-none focus-visible:ring-2',
  'focus-visible:ring-[var(--tiger-focus-ring)]'
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
    // Flush row. The popup clips the corners; a local radius would disagree with the panel border.
    'flex items-center w-full text-start',
    TREE_SELECT_NODE_PAD_Y[size],
    'tiger-motion-aware [transition:var(--tiger-transition-base)]',
    options.isDisabled
      ? 'text-[var(--tiger-text-secondary)] cursor-not-allowed opacity-50'
      : 'cursor-pointer hover:bg-[var(--tiger-outline-bg-hover)]',
    options.isSelected && classNames(popupListOptionActiveClasses, 'text-[var(--tiger-primary)]'),
    getPopupListOptionActiveClasses({
      active: options.isActive,
      disabled: options.isDisabled,
      selected: options.isSelected
    })
  )
}

/**
 * Floors the panel at the trigger width. The list used to shrink-wrap its
 * labels, so the chevron sat in the clipped corner of a content-sized box.
 */
export function getTreeSelectDropdownMinWidth(): string {
  return 'var(--tiger-overlay-reference-width, 0px)'
}

export function getTreeSelectNodeIndentStyle(level: number): {
  paddingInlineStart: string
  paddingInlineEnd: string
} {
  const depth = Math.max(0, level - 1)
  const paddingInlineStart =
    depth === 0
      ? POPUP_LIST_INLINE_PADDING
      : `calc(${POPUP_LIST_INLINE_PADDING} + ${depth * TREE_INDENT_SLOT_PX}px)`
  return {
    paddingInlineStart,
    paddingInlineEnd: POPUP_LIST_INLINE_PADDING
  }
}

export function getTreeSelectExpandIconClasses(
  expanded: boolean,
  dir: 'ltr' | 'rtl' = 'ltr'
): string {
  return classNames(
    'inline-flex tiger-motion-aware [transition:var(--tiger-transition-base)]',
    expanded && 'rotate-90',
    !expanded && dir === 'rtl' && 'rotate-180'
  )
}

export function getTreeSelectVirtualItemHeight(size: ComponentSize = 'md'): number {
  return getSelectVirtualItemHeight(size)
}

export function isTreeSelectValueEmpty(value: TreeSelectValue, multiple: boolean): boolean {
  if (multiple) {
    if (value == null || value === '') return true
    if (Array.isArray(value)) return value.length === 0
    return false
  }
  return value == null || value === ''
}

export function normalizeTreeSelectValue(
  value: TreeSelectValue,
  multiple: boolean
): TreeSelectValue {
  if (multiple) {
    if (value == null || value === '') return EMPTY_TREE_SELECT_MULTIPLE
    if (Array.isArray(value)) {
      if (value.every((item) => item != null && item !== '')) return value
      const filtered = value.filter((item) => item != null && item !== '')
      return filtered.length === 0 ? EMPTY_TREE_SELECT_MULTIPLE : filtered
    }
    return [value]
  }
  if (value == null || value === '') return null
  if (Array.isArray(value)) {
    const first = value.find((item) => item != null && item !== '')
    return first === undefined ? null : first
  }
  return value
}

export function treeSelectValuesEqual(
  left: TreeSelectValue,
  right: TreeSelectValue,
  multiple: boolean
): boolean {
  const a = normalizeTreeSelectValue(left, multiple)
  const b = normalizeTreeSelectValue(right, multiple)
  if (multiple) {
    const leftKeys = Array.isArray(a) ? a : []
    const rightKeys = Array.isArray(b) ? b : []
    if (leftKeys.length !== rightKeys.length) return false
    return leftKeys.every((key, index) => sameTreeKey(key, rightKeys[index]))
  }
  if (a == null && b == null) return true
  if (a == null || b == null) return false
  return sameTreeKey(a as string | number, b as string | number)
}

export function getTreeSelectSelectedKeys(
  value: TreeSelectValue,
  multiple: boolean
): (string | number)[] {
  const normalized = normalizeTreeSelectValue(value, multiple)
  if (multiple) return Array.isArray(normalized) ? normalized : []
  if (normalized == null || normalized === '') return []
  return [normalized as string | number]
}

export function shouldShowTreeSelectClear(options: {
  clearable: boolean
  disabled: boolean
  readOnly?: boolean
  value: TreeSelectValue
  multiple: boolean
}): boolean {
  return (
    options.clearable &&
    !options.disabled &&
    !options.readOnly &&
    !isTreeSelectValueEmpty(options.value, options.multiple)
  )
}

/** One explicit empty field when nothing is selected. Disabled callers omit the input. */
export function serializeTreeSelectFormValues(value: TreeSelectValue, multiple: boolean): string[] {
  const keys = getTreeSelectSelectedKeys(value, multiple)
  if (keys.length === 0) return ['']
  return keys.map(String)
}

export function coerceTreeSelectFormValue(value: unknown, multiple: boolean): TreeSelectValue {
  if (value === undefined) return undefined
  if (multiple) {
    if (value === '' || value === null) return EMPTY_TREE_SELECT_MULTIPLE
    if (Array.isArray(value)) {
      const filtered = (value as unknown[]).filter(
        (item): item is string | number =>
          (typeof item === 'string' || typeof item === 'number') && item !== ''
      )
      return filtered.length === 0 ? EMPTY_TREE_SELECT_MULTIPLE : filtered
    }
    if (typeof value === 'string' || typeof value === 'number') return [value]
    return []
  }
  if (value === '' || value === null) return null
  if (Array.isArray(value)) {
    const first = value.find(
      (item) => (typeof item === 'string' || typeof item === 'number') && item !== ''
    )
    return (first as string | number | undefined) ?? null
  }
  if (typeof value === 'string' || typeof value === 'number') return value
  return null
}

/** Named field is missing when FormItem passes `''` (or null / undefined). */
export function shouldSeedTreeSelectFormDefault(options: {
  alreadySeeded: boolean
  fieldName?: string
  controlledValue: TreeSelectValue
  formValue: unknown
  defaultValue: TreeSelectValue
}): boolean {
  if (options.alreadySeeded) return false
  if (!options.fieldName) return false
  if (options.controlledValue !== undefined) return false
  if (options.defaultValue === undefined) return false
  return options.formValue === '' || options.formValue == null
}

export function rememberTreeSelectLabel(
  cache: Map<string | number, string>,
  key: string | number,
  label: string
): void {
  cache.set(treeKeyId(key), label)
}

function readTreeSelectCachedLabel(
  cache: Map<string | number, string> | undefined,
  key: string | number
): string | undefined {
  if (!cache) return undefined
  return cache.get(treeKeyId(key)) ?? cache.get(key)
}

export function getTreeSelectDisplayLabel(
  data: TreeNode[],
  value: TreeSelectValue,
  cache?: Map<string | number, string>
): string {
  if (isTreeSelectValueEmpty(value, Array.isArray(value))) return ''
  if (Array.isArray(value)) {
    return value
      .map(
        (key) => findNode(data, key)?.label ?? readTreeSelectCachedLabel(cache, key) ?? String(key)
      )
      .join(', ')
  }
  if (value == null) return ''
  return findNode(data, value)?.label ?? readTreeSelectCachedLabel(cache, value) ?? String(value)
}

export function getTreeSelectVisibleIndex(
  items: VisibleTreeItem[],
  value: TreeSelectValue
): number {
  if (isTreeSelectValueEmpty(value, Array.isArray(value))) return -1
  if (Array.isArray(value)) {
    if (value.length === 0) return -1
    return items.findIndex((item) => value.some((key) => sameTreeKey(key, item.key)))
  }
  if (value == null) return -1
  return items.findIndex((item) => sameTreeKey(item.key, value))
}

export function resolveTreeSelectVisibleItems(options: {
  treeData: TreeNode[]
  expandedKeys: Iterable<string | number>
  searchQuery: string
  filterFn?: TreeFilterFn
}): VisibleTreeItem[] {
  if (!options.searchQuery) {
    return getVisibleTreeItems(options.treeData, options.expandedKeys, undefined)
  }
  const matched = filterTreeNodes(options.treeData, options.searchQuery, options.filterFn)
  const expanded = new Set<string | number>([
    ...options.expandedKeys,
    ...getAutoExpandKeys(options.treeData, matched)
  ])
  return getVisibleTreeItems(options.treeData, expanded, matched)
}

export function countTreeNodes(treeData: TreeNode[]): number {
  let count = 0
  const walk = (nodes: TreeNode[]): void => {
    for (const node of nodes) {
      count += 1
      if (node.children && node.children.length > 0) walk(node.children)
    }
  }
  walk(treeData)
  return count
}

/** `defaultExpandAll` runs only when the tree goes from empty to non-empty. */
export function shouldApplyTreeSelectDefaultExpandAll(
  previousNodeCount: number,
  nextNodeCount: number,
  defaultExpandAll: boolean
): boolean {
  return defaultExpandAll && previousNodeCount === 0 && nextNodeCount > 0
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

export function treeSetHas(keys: Iterable<string | number>, key: string | number): boolean {
  const id = treeKeyId(key)
  for (const item of keys) {
    if (treeKeyId(item) === id) return true
  }
  return false
}

export function toggleTreeSelectExpandedKey(
  expanded: Iterable<string | number>,
  key: string | number
): Set<string | number> {
  const next = new Set(expanded)
  const id = treeKeyId(key)
  let found: string | number | undefined
  for (const item of next) {
    if (treeKeyId(item) === id) {
      found = item
      break
    }
  }
  if (found !== undefined) next.delete(found)
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
  if (!multiple) return key === '' ? null : key
  const current = getTreeSelectSelectedKeys(options.value, true)
  const visual = calculateCheckedState(treeData, current, checkStrictly)
  const fully = visual.checked.some((item) => sameTreeKey(item, key))
  const half = visual.halfChecked.some((item) => sameTreeKey(item, key))
  const nextChecked = half ? true : !fully
  const state = handleNodeCheck(treeData, key, nextChecked, visual.checked, checkStrictly)
  return resolveOutwardCheckedKeys(state, treeData, checkStrategy, checkStrictly)
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
  isLeaf?: boolean
  checkable?: boolean
  checked?: boolean
  halfChecked?: boolean
}): {
  role: 'treeitem'
  'aria-selected': boolean | undefined
  'aria-checked': boolean | 'mixed' | undefined
  'aria-disabled': boolean | undefined
  'aria-level': number
  'aria-expanded': boolean | undefined
} {
  const opened = Boolean(options.expanded)
  const reportsExpanded = options.isLeaf !== true && (options.expandable || opened)
  return {
    role: 'treeitem',
    'aria-selected': options.checkable ? undefined : options.selected,
    'aria-checked': options.checkable
      ? options.halfChecked
        ? 'mixed'
        : Boolean(options.checked)
      : undefined,
    'aria-disabled': options.disabled || undefined,
    'aria-level': options.level,
    'aria-expanded': reportsExpanded ? opened : undefined
  }
}

export {
  getTreeVirtualAlignScrollTop as getTreeSelectVirtualAlignScrollTop,
  alignTreeVirtualScroll as alignTreeSelectVirtualScroll
} from './tree-utils'
