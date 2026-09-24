/**
 * Tree expand / select / check / filter / load / drop commits.
 * Vue/React bind DOM and controlled props; they must not copy this machine.
 */

import type {
  TreeCheckedState,
  TreeDropPosition,
  TreeFilterFn,
  TreeFilterMode,
  TreeNode,
  TreeNodeKey,
  TreeSelectionMode
} from '../types/tree'
import { devWarn } from './dev-warn'
import {
  buildTreeIndex,
  calculateCheckedState,
  createTreeKeyIdSet,
  filterTreeNodes,
  findNode,
  getAllKeys,
  getAutoExpandKeys,
  getCheckedKeysByStrategy,
  getDescendantKeys,
  getFirstVisibleChildKey,
  getParentKeys,
  getTreeKeyboardAction,
  getVisibleTreeItems,
  handleNodeCheck,
  isTreeAncestor,
  isTreeNodeExpandable,
  nodeHasChildren,
  sameTreeKey,
  treeKeyId,
  uniqueTreeKeys,
  type TreeIndex,
  type TreeKeyboardAction,
  type VisibleTreeItem
} from './tree-utils'

export const EMPTY_TREE_DATA: TreeNode[] = []
export const EMPTY_TREE_KEYS: TreeNodeKey[] = []

export function resolveTreeSelection(options: {
  selectionMode?: TreeSelectionMode
}): { selectable: boolean; multiple: boolean } {
  const mode = options.selectionMode ?? 'single'
  return {
    selectable: mode !== 'none',
    multiple: mode === 'multiple'
  }
}

export function resolveTreeKeyList(value: TreeNodeKey[] | undefined): {
  controlled: boolean
  keys: TreeNodeKey[]
} {
  if (value === undefined) return { controlled: false, keys: EMPTY_TREE_KEYS }
  return { controlled: true, keys: value }
}

export function resolveInitialExpandedKeys(options: {
  treeData: TreeNode[]
  expandedKeys?: TreeNodeKey[]
  defaultExpandedKeys?: TreeNodeKey[]
  defaultExpandAll?: boolean
}): { controlled: boolean; keys: TreeNodeKey[] } {
  if (options.expandedKeys !== undefined) {
    return { controlled: true, keys: options.expandedKeys }
  }
  const keys = [...(options.defaultExpandedKeys ?? EMPTY_TREE_KEYS)]
  if (options.defaultExpandAll) keys.push(...getAllKeys(options.treeData))
  return { controlled: false, keys: uniqueTreeKeys(keys) }
}

export function reconcileUncontrolledExpandedKeys(options: {
  current: readonly TreeNodeKey[]
  treeData: TreeNode[]
  defaultExpandAll: boolean
  userHasToggled: boolean
}): TreeNodeKey[] {
  if (options.defaultExpandAll && !options.userHasToggled) {
    return getAllKeys(options.treeData)
  }
  return [...options.current]
}

export function nextTreeExpandedKeys(
  current: Iterable<TreeNodeKey>,
  key: TreeNodeKey,
  expanded: boolean
): TreeNodeKey[] {
  const ids = createTreeKeyIdSet(current)
  const id = treeKeyId(key)
  if (expanded) {
    if (ids.has(id)) return uniqueTreeKeys(current)
    return [...uniqueTreeKeys(current), key]
  }
  return uniqueTreeKeys(current).filter((item) => treeKeyId(item) !== id)
}

export function nextTreeSelectedKeys(options: {
  current: Iterable<TreeNodeKey>
  key: TreeNodeKey
  multiple: boolean
  allowDeselect: boolean
}): TreeNodeKey[] {
  const current = uniqueTreeKeys(options.current)
  const selected = current.some((item) => sameTreeKey(item, options.key))
  if (options.multiple) {
    if (selected) return current.filter((item) => !sameTreeKey(item, options.key))
    return [...current, options.key]
  }
  if (selected && options.allowDeselect) return EMPTY_TREE_KEYS
  if (selected) return current.length === 1 ? current : [options.key]
  return [options.key]
}

export function nextTreeCheckedState(
  treeData: TreeNode[],
  nodeKey: TreeNodeKey,
  checked: boolean,
  currentChecked: TreeNodeKey[],
  checkStrictly = false
): TreeCheckedState {
  return handleNodeCheck(treeData, nodeKey, checked, currentChecked, checkStrictly)
}

export function resolveCheckedInput(
  treeData: TreeNode[],
  checkedKeys: TreeNodeKey[] | undefined,
  defaultCheckedKeys: TreeNodeKey[] | undefined,
  checkStrictly: boolean
): TreeCheckedState {
  const source = checkedKeys ?? defaultCheckedKeys ?? EMPTY_TREE_KEYS
  return calculateCheckedState(treeData, source, checkStrictly)
}

/** Filter ancestors to show before a controlled `expandedKeys` write-back. */
export function resolveDisplayedExpandedKeys(options: {
  expandedKeys: readonly TreeNodeKey[]
  autoExpandKeys: readonly TreeNodeKey[]
}): TreeNodeKey[] {
  if (options.autoExpandKeys.length === 0) return uniqueTreeKeys(options.expandedKeys)
  return uniqueTreeKeys([...options.expandedKeys, ...options.autoExpandKeys])
}

export function applyTreeFilter(options: {
  treeData: TreeNode[]
  query: string
  filterFn?: TreeFilterFn
  filterMode?: TreeFilterMode
  autoExpandParent: boolean
  currentExpanded: readonly TreeNodeKey[]
  /** Expansion captured before the current non-empty query. Null when not searching. */
  savedExpanded?: readonly TreeNodeKey[] | null
}): {
  /** `undefined` when the query is empty (no search). An empty set is zero hits. */
  matchedKeys: Set<TreeNodeKey> | undefined
  autoExpandKeys: TreeNodeKey[]
  nextExpandedKeys: TreeNodeKey[]
  savedExpanded: TreeNodeKey[] | null
} {
  if (!options.query) {
    const restored = options.savedExpanded
      ? uniqueTreeKeys(options.savedExpanded)
      : uniqueTreeKeys(options.currentExpanded)
    return {
      matchedKeys: undefined,
      autoExpandKeys: [],
      nextExpandedKeys: restored,
      savedExpanded: null
    }
  }

  const matchedKeys = filterTreeNodes(
    options.treeData,
    options.query,
    options.filterFn,
    options.filterMode ?? 'subtree'
  )
  const savedExpanded = options.savedExpanded
    ? uniqueTreeKeys(options.savedExpanded)
    : uniqueTreeKeys(options.currentExpanded)
  const autoExpandKeys = options.autoExpandParent
    ? [...getAutoExpandKeys(options.treeData, matchedKeys)]
    : []
  const nextExpandedKeys = uniqueTreeKeys([...options.currentExpanded, ...autoExpandKeys])
  return { matchedKeys, autoExpandKeys, nextExpandedKeys, savedExpanded }
}

export function shouldLoadTreeNode(options: {
  node: TreeNode
  hasLoadData: boolean
  loadedIds: Set<string>
  loadingIds: Set<string>
}): boolean {
  const { node, hasLoadData, loadedIds, loadingIds } = options
  if (!hasLoadData) return false
  if (!isTreeNodeExpandable(node, true)) return false
  if (nodeHasChildren(node)) return false
  const id = treeKeyId(node.key)
  if (loadedIds.has(id) || loadingIds.has(id)) return false
  return true
}

export function mergeLoadedChildren(
  treeData: TreeNode[],
  loaded: ReadonlyMap<string, TreeNode[]>
): TreeNode[] {
  if (loaded.size === 0) return treeData

  function walk(nodes: TreeNode[]): TreeNode[] {
    let changed = false
    const next = nodes.map((node) => {
      const overlay = loaded.get(treeKeyId(node.key))
      const children = nodeHasChildren(node)
        ? walk(node.children!)
        : overlay
          ? overlay
          : node.children
      if (children === node.children) return node
      changed = true
      return { ...node, children }
    })
    return changed ? next : nodes
  }

  return walk(treeData)
}

export function applyLoadedChildren(
  treeData: TreeNode[],
  key: TreeNodeKey,
  children: TreeNode[]
): TreeNode[] {
  let found = false

  function walk(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((node) => {
      if (sameTreeKey(node.key, key)) {
        found = true
        return { ...node, children }
      }
      if (!node.children || node.children.length === 0) return node
      const nextChildren = walk(node.children)
      if (nextChildren === node.children) return node
      return { ...node, children: nextChildren }
    })
  }

  const next = walk(treeData)
  return found ? next : treeData
}

export function resolveTreeDropPosition(
  clientY: number,
  top: number,
  height: number,
  canDropInside: boolean
): TreeDropPosition {
  if (!(height > 0)) return canDropInside ? 'inside' : 'after'
  const ratio = (clientY - top) / height
  if (ratio <= 0.25) return 'before'
  if (ratio >= 0.75) return 'after'
  if (canDropInside) return 'inside'
  return ratio < 0.5 ? 'before' : 'after'
}

function removeTreeNode(
  nodes: TreeNode[],
  key: TreeNodeKey
): { next: TreeNode[]; removed: TreeNode | null } {
  let removed: TreeNode | null = null
  let changed = false
  const next: TreeNode[] = []
  for (const node of nodes) {
    if (sameTreeKey(node.key, key)) {
      removed = node
      changed = true
      continue
    }
    if (node.children && node.children.length > 0) {
      const nested = removeTreeNode(node.children, key)
      if (nested.removed) {
        removed = nested.removed
        next.push({ ...node, children: nested.next })
        changed = true
        continue
      }
    }
    next.push(node)
  }
  return { next: changed ? next : nodes, removed }
}

function insertTreeNode(
  nodes: TreeNode[],
  dropKey: TreeNodeKey,
  position: TreeDropPosition,
  node: TreeNode
): TreeNode[] | null {
  for (let i = 0; i < nodes.length; i++) {
    const current = nodes[i]
    if (sameTreeKey(current.key, dropKey)) {
      if (position === 'before') {
        const next = nodes.slice()
        next.splice(i, 0, node)
        return next
      }
      if (position === 'after') {
        const next = nodes.slice()
        next.splice(i + 1, 0, node)
        return next
      }
      const children = current.children ? current.children.slice() : []
      children.push(node)
      const next = nodes.slice()
      next[i] = { ...current, children }
      return next
    }
    if (current.children && current.children.length > 0) {
      const nested = insertTreeNode(current.children, dropKey, position, node)
      if (nested) {
        const next = nodes.slice()
        next[i] = { ...current, children: nested }
        return next
      }
    }
  }
  return null
}

export function applyTreeDrop(options: {
  treeData: TreeNode[]
  dragKey: TreeNodeKey
  dropKey: TreeNodeKey
  position: TreeDropPosition
}): TreeNode[] | null {
  if (sameTreeKey(options.dragKey, options.dropKey)) return null
  if (isTreeAncestor(options.treeData, options.dragKey, options.dropKey)) return null

  const removed = removeTreeNode(options.treeData, options.dragKey)
  if (!removed.removed) return null
  const inserted = insertTreeNode(removed.next, options.dropKey, options.position, removed.removed)
  return inserted
}

export interface TreeViewInput {
  treeData: TreeNode[]
  expandedKeys: Iterable<TreeNodeKey>
  selectedKeys: Iterable<TreeNodeKey>
  checkedState: TreeCheckedState
  matchedKeys?: Iterable<TreeNodeKey>
  loadingKeys?: Iterable<TreeNodeKey>
  activeKey?: TreeNodeKey
  checkable: boolean
  selectable: boolean
  hasLoadData: boolean
}

export interface TreeRowView {
  item: VisibleTreeItem
  expandable: boolean
  expanded: boolean
  selected: boolean
  checked: boolean
  halfChecked: boolean
  loading: boolean
  matched: boolean
  disabled: boolean
  posinset: number
  setsize: number
}

export interface TreeView {
  treeData: TreeNode[]
  index: TreeIndex
  visibleItems: VisibleTreeItem[]
  rows: TreeRowView[]
  focusableKeys: TreeNodeKey[]
  defaultActiveKey: TreeNodeKey | undefined
}

export function resolveTreeView(input: TreeViewInput): TreeView {
  const index = buildTreeIndex(input.treeData)
  const expandedIds = createTreeKeyIdSet(input.expandedKeys)
  const selectedIds = createTreeKeyIdSet(input.selectedKeys)
  const checkedIds = createTreeKeyIdSet(input.checkedState.checked)
  const halfIds = createTreeKeyIdSet(input.checkedState.halfChecked)
  const matchedIds =
    input.matchedKeys != null ? createTreeKeyIdSet(input.matchedKeys) : new Set<string>()
  const loadingIds = createTreeKeyIdSet(input.loadingKeys)
  const visibleItems = getVisibleTreeItems(input.treeData, input.expandedKeys, input.matchedKeys)
  const siblingGroups = new Map<string, VisibleTreeItem[]>()
  for (const item of visibleItems) {
    const parentId = item.parentKey === undefined ? '' : treeKeyId(item.parentKey)
    const group = siblingGroups.get(parentId)
    if (group) group.push(item)
    else siblingGroups.set(parentId, [item])
  }
  const siblingMeta = new Map<string, { posinset: number; setsize: number }>()
  for (const group of siblingGroups.values()) {
    group.forEach((item, index) => {
      siblingMeta.set(treeKeyId(item.key), { posinset: index + 1, setsize: group.length })
    })
  }
  const rows: TreeRowView[] = visibleItems.map((item) => {
    const id = treeKeyId(item.key)
    const expandable = isTreeNodeExpandable(item.node, input.hasLoadData)
    const opened = expandedIds.has(id)
    const sibling = siblingMeta.get(id)
    return {
      item,
      expandable,
      // Stay expanded after an empty or failed child list. Do not require visible children.
      expanded: item.node.isLeaf !== true && opened,
      selected: input.selectable && selectedIds.has(id),
      checked: checkedIds.has(id),
      halfChecked: halfIds.has(id),
      loading: loadingIds.has(id),
      matched: matchedIds.has(id),
      disabled: Boolean(item.node.disabled),
      posinset: sibling?.posinset ?? 1,
      setsize: sibling?.setsize ?? 1
    }
  })
  const focusableKeys = rows.filter((row) => !row.disabled).map((row) => row.item.key)
  return {
    treeData: input.treeData,
    index,
    visibleItems,
    rows,
    focusableKeys,
    defaultActiveKey: focusableKeys[0]
  }
}

export function applyTreeKeyboard(action: TreeKeyboardAction | null): {
  preventDefault: boolean
  activeKey?: TreeNodeKey
  expandKey?: TreeNodeKey
  selectKey?: TreeNodeKey
  checkKey?: TreeNodeKey
  checkChecked?: boolean
} {
  if (!action) return { preventDefault: false }
  if (action.type === 'none') return { preventDefault: true }
  if (action.type === 'focus') return { preventDefault: true, activeKey: action.key }
  if (action.type === 'toggleExpand') return { preventDefault: true, expandKey: action.key }
  if (action.type === 'select') return { preventDefault: true, selectKey: action.key }
  if (action.type === 'check') {
    return { preventDefault: true, checkKey: action.key, checkChecked: action.checked }
  }
  return {
    preventDefault: true,
    expandKey: action.collapseKey,
    activeKey: action.focusKey
  }
}

export function resolveTreeKeyboardAction(options: {
  key: string
  nodeKey: TreeNodeKey
  view: TreeView
  expandedKeys: Iterable<TreeNodeKey>
  activeKey?: TreeNodeKey
  checkable: boolean
  selectable: boolean
  hasLoadData: boolean
  dir?: 'ltr' | 'rtl'
}): TreeKeyboardAction | null {
  const entry = options.view.index.byId.get(treeKeyId(options.nodeKey))
  const node = entry?.node
  if (!node || node.disabled) return null
  const expandedIds = createTreeKeyIdSet(options.expandedKeys)
  const row = options.view.rows.find((item) => sameTreeKey(item.item.key, options.nodeKey))
  const parentKey = entry.parentKey
  return getTreeKeyboardAction({
    key: options.key,
    nodeKey: options.nodeKey,
    currentKey: options.activeKey ?? options.view.defaultActiveKey ?? options.nodeKey,
    focusableKeys: options.view.focusableKeys,
    parentKey,
    firstChildKey: getFirstVisibleChildKey(options.view.visibleItems, options.nodeKey),
    isExpandable: isTreeNodeExpandable(node, options.hasLoadData),
    isExpanded: Boolean(row?.expanded),
    isParentExpanded: parentKey !== undefined && expandedIds.has(treeKeyId(parentKey)),
    isChecked: Boolean(row?.checked) && !row?.halfChecked,
    selectable: options.selectable,
    checkable: options.checkable,
    dir: options.dir
  })
}

export function warnControlledExpandedFilter(emitted: boolean): void {
  if (!emitted) return
  devWarn(
    'Tree.filterExpand',
    'Tree filter needs ancestor keys in expandedKeys. Write the emitted keys back, or the matches stay hidden.'
  )
}

export { getCheckedKeysByStrategy, getDescendantKeys, findNode, getParentKeys }
