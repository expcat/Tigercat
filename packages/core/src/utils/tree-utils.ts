/**
 * Tree traversal, keyboard, classes, and flatten helpers.
 * Expand / select / check / filter / drop commits live in `tree-controller`.
 */

import type {
  TreeCheckStrategy,
  TreeCheckedState,
  TreeExpandedState,
  TreeFilterFn,
  TreeFilterMode,
  TreeNode,
  TreeNodeKey
} from '../types/tree'
import { classNames } from './class-names'

export type { TreeNodeKey }

export function treeKeyId(key: TreeNodeKey): string {
  return String(key)
}

export function sameTreeKey(
  a: TreeNodeKey | null | undefined,
  b: TreeNodeKey | null | undefined
): boolean {
  if (a == null || b == null) return a === b
  return treeKeyId(a) === treeKeyId(b)
}

export function createTreeKeyIdSet(keys?: Iterable<TreeNodeKey> | null): Set<string> {
  const set = new Set<string>()
  if (!keys) return set
  for (const key of keys) set.add(treeKeyId(key))
  return set
}

export function uniqueTreeKeys(keys: Iterable<TreeNodeKey>): TreeNodeKey[] {
  const seen = new Set<string>()
  const result: TreeNodeKey[] = []
  for (const key of keys) {
    const id = treeKeyId(key)
    if (seen.has(id)) continue
    seen.add(id)
    result.push(key)
  }
  return result
}

export function treeExpandedStateFromKeys(keys: Iterable<TreeNodeKey>): TreeExpandedState {
  const state: TreeExpandedState = {}
  for (const key of keys) state[treeKeyId(key)] = true
  return state
}

export function treeExpandedKeysFromState(state: TreeExpandedState): TreeNodeKey[] {
  return Object.keys(state).filter((key) => state[key])
}

export interface VisibleTreeItem {
  key: TreeNodeKey
  /** 1-based depth. Indent columns = `level - 1`. */
  level: number
  parentKey?: TreeNodeKey
  node: TreeNode
  isLastChild: boolean
  ancestorLast: boolean[]
}

export interface TreeIndexEntry {
  node: TreeNode
  parentKey?: TreeNodeKey
  childrenKeys: TreeNodeKey[]
  level: number
}

export interface TreeIndex {
  byId: Map<string, TreeIndexEntry>
  roots: TreeNodeKey[]
}

export function buildTreeIndex(treeData: TreeNode[]): TreeIndex {
  const byId = new Map<string, TreeIndexEntry>()
  const roots: TreeNodeKey[] = []

  function walk(nodes: TreeNode[], parentKey: TreeNodeKey | undefined, level: number): void {
    for (const node of nodes) {
      const children = node.children ?? []
      byId.set(treeKeyId(node.key), {
        node,
        parentKey,
        childrenKeys: children.map((child) => child.key),
        level
      })
      if (parentKey === undefined) roots.push(node.key)
      if (children.length > 0) walk(children, node.key, level + 1)
    }
  }

  walk(treeData, undefined, 1)
  return { byId, roots }
}

export function lookupTreeNode(index: TreeIndex, key: TreeNodeKey): TreeNode | null {
  return index.byId.get(treeKeyId(key))?.node ?? null
}

/**
 * Whether a node can expand. `isLeaf: true` never expands, even with children.
 * Empty children with `isLeaf !== true` are loadable when `hasLoadData` is set.
 */
export function isTreeNodeExpandable(node: TreeNode, hasLoadData = false): boolean {
  if (node.isLeaf === true) return false
  if (node.children && node.children.length > 0) return true
  return hasLoadData
}

export function nodeHasChildren(node: TreeNode): boolean {
  return Boolean(node.children && node.children.length > 0)
}

export function getVisibleTreeItems(
  treeData: TreeNode[],
  expandedKeys: Iterable<TreeNodeKey> = [],
  matchedKeys?: Iterable<TreeNodeKey>
): VisibleTreeItem[] {
  const expandedIds = createTreeKeyIdSet(expandedKeys)
  const matchedIds = matchedKeys ? createTreeKeyIdSet(matchedKeys) : null
  const isFiltered = Boolean(matchedIds && matchedIds.size > 0)
  const result: VisibleTreeItem[] = []

  function traverse(
    nodes: TreeNode[],
    level: number,
    parentKey: TreeNodeKey | undefined,
    ancestorLast: boolean[]
  ): void {
    const lastIndex = nodes.length - 1
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (isFiltered && matchedIds && !matchedIds.has(treeKeyId(node.key))) continue

      const isLastChild = i === lastIndex
      result.push({
        key: node.key,
        level,
        parentKey,
        node,
        isLastChild,
        ancestorLast
      })

      if (nodeHasChildren(node) && expandedIds.has(treeKeyId(node.key))) {
        traverse(node.children!, level + 1, node.key, [...ancestorLast, isLastChild])
      }
    }
  }

  traverse(treeData, 1, undefined, [])
  return result
}

export function getFirstVisibleChildKey(
  visibleItems: VisibleTreeItem[],
  parentKey: TreeNodeKey
): TreeNodeKey | undefined {
  const index = visibleItems.findIndex((item) => sameTreeKey(item.key, parentKey))
  if (index < 0) return undefined

  const base = visibleItems[index]
  for (let i = index + 1; i < visibleItems.length; i++) {
    const item = visibleItems[i]
    if (item.level <= base.level) break
    if (sameTreeKey(item.parentKey, parentKey) && !item.node.disabled) return item.key
  }

  return undefined
}

export type TreeKeyboardAction =
  | { type: 'none' }
  | { type: 'focus'; key: TreeNodeKey }
  | { type: 'toggleExpand'; key: TreeNodeKey }
  | { type: 'select'; key: TreeNodeKey }
  | { type: 'check'; key: TreeNodeKey; checked: boolean }
  | { type: 'collapseAndFocus'; collapseKey: TreeNodeKey | undefined; focusKey: TreeNodeKey }

export interface TreeKeyboardContext {
  key: string
  nodeKey: TreeNodeKey
  currentKey: TreeNodeKey
  focusableKeys: readonly TreeNodeKey[]
  parentKey?: TreeNodeKey
  firstChildKey?: TreeNodeKey
  isExpandable: boolean
  isExpanded: boolean
  isParentExpanded: boolean
  isChecked: boolean
  selectable: boolean
  checkable: boolean
  dir?: 'ltr' | 'rtl'
}

export function getTreeKeyboardAction(ctx: TreeKeyboardContext): TreeKeyboardAction | null {
  const {
    key,
    nodeKey,
    currentKey,
    focusableKeys,
    parentKey,
    firstChildKey,
    isExpandable,
    isExpanded,
    isParentExpanded,
    isChecked,
    selectable,
    checkable,
    dir = 'ltr'
  } = ctx

  const currentIndex = focusableKeys.findIndex((item) => sameTreeKey(item, currentKey))
  const focusAt = (index: number): TreeKeyboardAction => ({
    type: 'focus',
    key: focusableKeys[index] ?? currentKey
  })
  const intoKey = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const outKey = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

  switch (key) {
    case 'ArrowDown':
      return focusAt(currentIndex + 1)
    case 'ArrowUp':
      return focusAt(currentIndex - 1)
    case 'Home':
      return focusAt(0)
    case 'End':
      return focusAt(focusableKeys.length - 1)
    case intoKey:
      if (isExpandable && !isExpanded) return { type: 'toggleExpand', key: nodeKey }
      if (isExpandable && isExpanded) return { type: 'focus', key: firstChildKey ?? currentKey }
      return { type: 'none' }
    case outKey:
      if (isExpandable && isExpanded) return { type: 'toggleExpand', key: nodeKey }
      return { type: 'focus', key: parentKey ?? currentKey }
    case 'Escape':
      if (isExpandable && isExpanded) return { type: 'toggleExpand', key: nodeKey }
      if (parentKey !== undefined) {
        return {
          type: 'collapseAndFocus',
          collapseKey: isParentExpanded ? parentKey : undefined,
          focusKey: parentKey
        }
      }
      return { type: 'none' }
    case 'Enter':
      if (selectable) return { type: 'select', key: nodeKey }
      if (isExpandable) return { type: 'toggleExpand', key: nodeKey }
      return { type: 'none' }
    case ' ':
      if (checkable) return { type: 'check', key: nodeKey, checked: !isChecked }
      if (isExpandable) return { type: 'toggleExpand', key: nodeKey }
      return { type: 'none' }
    default:
      return null
  }
}

export const TREE_INDENT_SLOT_PX = 24

export const treeBaseClasses =
  'w-full bg-[var(--tiger-tree-bg,var(--tiger-surface,#ffffff))] text-[var(--tiger-text,#111827)] rounded-[var(--tiger-radius-md,0.5rem)]'

export const treeNodeWrapperClasses = 'select-none'

export const treeNodeContentClasses =
  'flex items-center px-2 py-1.5 rounded tiger-motion-aware transition-colors duration-200 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]'

export const treeNodeHoverClasses =
  'hover:bg-[var(--tiger-tree-node-hover,var(--tiger-surface-muted,#f9fafb))]'

export const treeNodeSelectedClasses =
  'bg-[color-mix(in_srgb,var(--tiger-primary,#2563eb)_10%,transparent)] text-[var(--tiger-primary,#2563eb)]'

export const treeNodeActiveClasses = 'bg-[var(--tiger-surface-muted,#f3f4f6)]'

export const treeNodeDisabledClasses = 'opacity-50 cursor-not-allowed'

export const treeNodeIndentClasses = 'inline-flex shrink-0 w-6 h-full box-border'

export const treeNodeExpandIconClasses =
  'inline-flex items-center justify-center w-6 h-6 min-w-6 min-h-6 p-0 border-0 bg-transparent text-current tiger-motion-aware transition-transform duration-200 motion-reduce:transition-none'

export const treeNodeExpandIconExpandedClasses = 'rotate-90'

export const treeNodeExpandIconRtlClasses = 'rtl:rotate-180'

export const treeNodeCheckboxClasses = 'me-2 shrink-0'

export const treeNodeIconClasses = 'me-2 flex-shrink-0'

export const treeNodeLabelClasses = 'flex-1 truncate'

export const treeNodeLabelMatchedClasses = 'font-semibold text-[var(--tiger-primary,#2563eb)]'

export const treeNodeChildrenClasses = 'ms-6'

export const treeLoadingClasses = 'inline-block ms-2 animate-spin h-4 w-4'

export const treeEmptyStateClasses = 'py-8 text-center text-[var(--tiger-text-secondary,#6b7280)]'

export const treeLineClasses = 'border-s border-[var(--tiger-border,#e5e7eb)]'

export const treeSearchInputClasses =
  'w-full mb-2 px-2 py-1 text-sm border border-[var(--tiger-border,#e5e7eb)] rounded bg-[var(--tiger-surface,#ffffff)] focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--tiger-primary,#2563eb)]'

export const treeDropBeforeClasses =
  'before:absolute before:inset-x-2 before:top-0 before:h-0.5 before:bg-[var(--tiger-primary,#2563eb)]'
export const treeDropAfterClasses =
  'after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[var(--tiger-primary,#2563eb)]'
export const treeDropInsideClasses =
  'outline outline-2 outline-[var(--tiger-primary,#2563eb)] outline-offset-[-2px]'

export function getTreeNodeClasses(
  selected: boolean,
  disabled: boolean,
  blockNode = false,
  options?: { active?: boolean; interactive?: boolean }
): string {
  const interactive = options?.interactive !== false && !disabled
  const active = Boolean(options?.active) && !selected && !disabled
  return classNames(
    treeNodeContentClasses,
    'relative',
    interactive ? 'cursor-pointer' : disabled ? treeNodeDisabledClasses : 'cursor-default',
    interactive && treeNodeHoverClasses,
    selected && treeNodeSelectedClasses,
    active && treeNodeActiveClasses,
    disabled && treeNodeDisabledClasses,
    blockNode && 'w-full'
  )
}

export function getTreeNodeExpandIconClasses(expanded: boolean): string {
  return classNames(
    treeNodeExpandIconClasses,
    expanded ? treeNodeExpandIconExpandedClasses : treeNodeExpandIconRtlClasses
  )
}

export interface TreeIndentSlot {
  key: string
  showLine: boolean
  truncate: boolean
}

export function getTreeIndentSlots(item: VisibleTreeItem, showLine: boolean): TreeIndentSlot[] {
  const count = Math.max(0, item.level - 1)
  const slots: TreeIndentSlot[] = []
  for (let i = 0; i < count; i++) {
    const isParentCol = i === count - 1
    const ancestorIsLast = item.ancestorLast[i] === true
    const draw = showLine && (isParentCol || !ancestorIsLast)
    slots.push({
      key: `indent-${i}`,
      showLine: draw,
      truncate: Boolean(showLine && isParentCol && item.isLastChild)
    })
  }
  return slots
}

export function getTreeIndentSlotClasses(slot: TreeIndentSlot): string {
  return classNames(
    treeNodeIndentClasses,
    slot.showLine && treeLineClasses,
    slot.truncate && 'self-start h-1/2'
  )
}

export function getAllKeys(treeData: TreeNode[]): TreeNodeKey[] {
  const keys: TreeNodeKey[] = []

  function traverse(nodes: TreeNode[]): void {
    for (const node of nodes) {
      keys.push(node.key)
      if (node.children && node.children.length > 0) traverse(node.children)
    }
  }

  traverse(treeData)
  return keys
}

export function getLeafKeys(treeData: TreeNode[]): TreeNodeKey[] {
  const keys: TreeNodeKey[] = []

  function traverse(nodes: TreeNode[]): void {
    for (const node of nodes) {
      if (node.isLeaf === true || !node.children || node.children.length === 0) {
        keys.push(node.key)
      } else {
        traverse(node.children)
      }
    }
  }

  traverse(treeData)
  return keys
}

export function findNode(treeData: TreeNode[], key: TreeNodeKey): TreeNode | null {
  for (const node of treeData) {
    if (sameTreeKey(node.key, key)) return node
    if (node.children && node.children.length > 0) {
      const found = findNode(node.children, key)
      if (found) return found
    }
  }
  return null
}

export function getParentKeys(treeData: TreeNode[], key: TreeNodeKey): TreeNodeKey[] {
  const parents: TreeNodeKey[] = []

  function traverse(nodes: TreeNode[], path: TreeNodeKey[]): boolean {
    for (const node of nodes) {
      if (sameTreeKey(node.key, key)) {
        parents.push(...path)
        return true
      }
      if (node.children && node.children.length > 0) {
        if (traverse(node.children, [...path, node.key])) return true
      }
    }
    return false
  }

  traverse(treeData, [])
  return parents
}

export function getDescendantKeys(
  node: TreeNode,
  options?: { skipDisabled?: boolean }
): TreeNodeKey[] {
  const keys: TreeNodeKey[] = []
  const skipDisabled = options?.skipDisabled === true

  function traverse(current: TreeNode): void {
    if (!current.children || current.children.length === 0) return
    for (const child of current.children) {
      if (skipDisabled && child.disabled) continue
      keys.push(child.key)
      traverse(child)
    }
  }

  traverse(node)
  return keys
}

export function isTreeAncestor(
  treeData: TreeNode[],
  ancestorKey: TreeNodeKey,
  nodeKey: TreeNodeKey
): boolean {
  return getParentKeys(treeData, nodeKey).some((key) => sameTreeKey(key, ancestorKey))
}

function countableChildren(node: TreeNode): TreeNode[] {
  return (node.children ?? []).filter((child) => !child.disabled)
}

export function calculateCheckedState(
  treeData: TreeNode[],
  checkedKeys: TreeNodeKey[],
  checkStrictly = false
): TreeCheckedState {
  if (checkStrictly) {
    return { checked: uniqueTreeKeys(checkedKeys), halfChecked: [] }
  }

  const checkedSet = createTreeKeyIdSet(checkedKeys)
  const halfCheckedSet = new Set<string>()
  const canonical = new Map<string, TreeNodeKey>()

  function remember(node: TreeNode): void {
    const id = treeKeyId(node.key)
    if (!canonical.has(id)) canonical.set(id, node.key)
  }

  function markSubtreeChecked(node: TreeNode): void {
    remember(node)
    checkedSet.add(treeKeyId(node.key))
    halfCheckedSet.delete(treeKeyId(node.key))
    for (const child of node.children ?? []) {
      if (child.disabled) continue
      markSubtreeChecked(child)
    }
  }

  function checkNode(node: TreeNode): { checked: boolean; halfChecked: boolean } {
    remember(node)
    if (checkedSet.has(treeKeyId(node.key))) {
      markSubtreeChecked(node)
      return { checked: true, halfChecked: false }
    }

    const children = countableChildren(node)
    if (children.length === 0) {
      const checked = checkedSet.has(treeKeyId(node.key))
      return { checked, halfChecked: false }
    }

    let checkedCount = 0
    for (const child of children) {
      const childState = checkNode(child)
      if (childState.checked) checkedCount++
      else if (childState.halfChecked) halfCheckedSet.add(treeKeyId(node.key))
    }

    if (checkedCount === children.length) {
      checkedSet.add(treeKeyId(node.key))
      halfCheckedSet.delete(treeKeyId(node.key))
      return { checked: true, halfChecked: false }
    }
    if (checkedCount > 0 || halfCheckedSet.has(treeKeyId(node.key))) {
      halfCheckedSet.add(treeKeyId(node.key))
      checkedSet.delete(treeKeyId(node.key))
      return { checked: false, halfChecked: true }
    }

    checkedSet.delete(treeKeyId(node.key))
    halfCheckedSet.delete(treeKeyId(node.key))
    return { checked: false, halfChecked: false }
  }

  treeData.forEach((node) => checkNode(node))

  const checked: TreeNodeKey[] = []
  const halfChecked: TreeNodeKey[] = []
  for (const id of checkedSet) {
    const key = canonical.get(id)
    if (key !== undefined) checked.push(key)
  }
  for (const id of halfCheckedSet) {
    const key = canonical.get(id)
    if (key !== undefined) halfChecked.push(key)
  }

  return { checked, halfChecked }
}

export function handleNodeCheck(
  treeData: TreeNode[],
  nodeKey: TreeNodeKey,
  checked: boolean,
  currentChecked: TreeNodeKey[],
  checkStrictly = false
): TreeCheckedState {
  const node = findNode(treeData, nodeKey)
  if (!node) {
    return calculateCheckedState(treeData, currentChecked, checkStrictly)
  }

  const currentIds = createTreeKeyIdSet(currentChecked)
  let next = currentChecked.filter((key) => currentIds.has(treeKeyId(key)))

  if (checkStrictly) {
    if (checked) {
      if (!currentIds.has(treeKeyId(nodeKey))) next = [...next, node.key]
    } else {
      next = next.filter((key) => !sameTreeKey(key, nodeKey))
    }
  } else {
    const descendantKeys = getDescendantKeys(node, { skipDisabled: true })
    if (checked) {
      if (!currentIds.has(treeKeyId(nodeKey))) next = [...next, node.key]
      const nextIds = createTreeKeyIdSet(next)
      for (const key of descendantKeys) {
        if (!nextIds.has(treeKeyId(key))) {
          next.push(key)
          nextIds.add(treeKeyId(key))
        }
      }
    } else {
      const removeIds = createTreeKeyIdSet([nodeKey, ...descendantKeys])
      next = next.filter((key) => !removeIds.has(treeKeyId(key)))
    }
  }

  return calculateCheckedState(treeData, next, checkStrictly)
}

export function getCheckedKeysByStrategy(
  checkedState: TreeCheckedState,
  treeData: TreeNode[],
  strategy: TreeCheckStrategy = 'all'
): TreeNodeKey[] {
  if (strategy === 'all') return checkedState.checked

  const checkedIds = createTreeKeyIdSet(checkedState.checked)
  const result: TreeNodeKey[] = []

  function isFullyChecked(node: TreeNode): boolean {
    return checkedIds.has(treeKeyId(node.key))
  }

  function walk(nodes: TreeNode[]): void {
    for (const node of nodes) {
      const hasChildren = nodeHasChildren(node)
      if (strategy === 'parent') {
        if (isFullyChecked(node)) {
          result.push(node.key)
          continue
        }
        if (hasChildren) walk(node.children!)
        continue
      }

      if (!hasChildren) {
        if (isFullyChecked(node)) result.push(node.key)
        continue
      }
      walk(node.children!)
    }
  }

  walk(treeData)
  return result
}

export function filterTreeNodes(
  treeData: TreeNode[],
  filterValue: string,
  filterFn?: TreeFilterFn,
  filterMode: TreeFilterMode = 'subtree'
): Set<TreeNodeKey> {
  const matchedKeys = new Set<TreeNodeKey>()
  if (!filterValue) return matchedKeys

  const defaultFilterFn: TreeFilterFn = (value, node) =>
    node.label.toLowerCase().includes(value.toLowerCase())
  const fn = filterFn || defaultFilterFn

  function addSubtree(node: TreeNode): void {
    matchedKeys.add(node.key)
    node.children?.forEach(addSubtree)
  }

  function traverse(nodes: TreeNode[]): boolean {
    let any = false
    for (const node of nodes) {
      const isMatched = fn(filterValue, node)
      const childMatched =
        node.children && node.children.length > 0 ? traverse(node.children) : false
      if (isMatched) {
        if (filterMode === 'subtree') addSubtree(node)
        else matchedKeys.add(node.key)
        any = true
      } else if (childMatched) {
        matchedKeys.add(node.key)
        any = true
      }
    }
    return any
  }

  traverse(treeData)
  return matchedKeys
}

export function getAutoExpandKeys(
  treeData: TreeNode[],
  matchedKeys: Iterable<TreeNodeKey>
): Set<TreeNodeKey> {
  const expandKeys = new Set<TreeNodeKey>()
  const seen = new Set<string>()
  for (const key of matchedKeys) {
    for (const parent of getParentKeys(treeData, key)) {
      const id = treeKeyId(parent)
      if (seen.has(id)) continue
      seen.add(id)
      expandKeys.add(parent)
    }
  }
  return expandKeys
}

export function checkedSetsFromState(state: TreeCheckedState): {
  checkedSet: Set<TreeNodeKey>
  halfCheckedSet: Set<TreeNodeKey>
} {
  return {
    checkedSet: new Set(state.checked),
    halfCheckedSet: new Set(state.halfChecked)
  }
}

export function getTreeVirtualAlignScrollTop(
  scrollTop: number,
  index: number,
  itemHeight: number,
  viewportHeight: number
): number {
  if (index < 0 || itemHeight <= 0 || viewportHeight <= 0) return scrollTop
  const top = index * itemHeight
  if (top < scrollTop) return top
  if (top + itemHeight > scrollTop + viewportHeight) return top + itemHeight - viewportHeight
  return scrollTop
}

export function alignTreeVirtualScroll(
  el: HTMLElement | null | undefined,
  index: number,
  itemHeight: number,
  viewportHeight: number
): number {
  if (!el || index < 0) return el?.scrollTop ?? 0
  const next = getTreeVirtualAlignScrollTop(el.scrollTop, index, itemHeight, viewportHeight)
  if (el.scrollTop !== next) {
    el.scrollTop = next
    el.dispatchEvent(new Event('scroll'))
  }
  return next
}

export function treeItemKeyAttr(key: TreeNodeKey): string {
  return String(key)
}
