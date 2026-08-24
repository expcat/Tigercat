import type { ComponentSize } from '../types/base'
import type { TreeNode } from '../types/tree'
import { classNames } from './class-names'

// ============================================================================
// STYLE CLASSES
// ============================================================================

export const treeSelectBaseClasses = 'relative inline-block w-full'

const treeSelectDropdownSurfaceClasses =
  'bg-[var(--tiger-treeselect-dropdown-bg,var(--tiger-surface,#ffffff))] border border-[var(--tiger-treeselect-dropdown-border,var(--tiger-border,#d1d5db))] rounded-[var(--tiger-radius-md,0.5rem)] shadow-lg'

export const treeSelectDropdownClasses = classNames(
  treeSelectDropdownSurfaceClasses,
  'max-h-60 overflow-auto'
)

/** Default virtualized dropdown viewport height (px). Matches Tree `height`. */
export const TREE_SELECT_DEFAULT_HEIGHT = 400

/** Default virtualized tree row height (px). Matches Tree `itemHeight`. */
export const TREE_SELECT_DEFAULT_ITEM_HEIGHT = 32

/**
 * Dropdown surface classes. When `virtual` is true, VirtualList owns scrolling
 * so the panel drops `max-h-60 overflow-auto` to avoid nested scrollers.
 */
export function getTreeSelectDropdownClasses(virtual: boolean = false): string {
  return virtual
    ? classNames(treeSelectDropdownSurfaceClasses, 'overflow-hidden')
    : treeSelectDropdownClasses
}

export const treeSelectSearchClasses =
  'w-full px-3 py-1.5 border-b border-[var(--tiger-treeselect-border,var(--tiger-border,#d1d5db))] text-sm bg-[var(--tiger-treeselect-bg,var(--tiger-surface,#ffffff))] text-[var(--tiger-treeselect-text,var(--tiger-text,#111827))] outline-none placeholder:text-[var(--tiger-treeselect-placeholder,var(--tiger-text-muted,#9ca3af))]'

export const treeSelectEmptyClasses =
  'px-3 py-4 text-center text-[var(--tiger-treeselect-empty-text,var(--tiger-text-muted,#9ca3af))]'

export const treeSelectNodeBaseClasses =
  'flex items-center px-2 py-1.5 cursor-pointer rounded transition-colors'

// ============================================================================
// SIZE HELPERS
// ============================================================================

const triggerSizeClasses: Record<ComponentSize, string> = {
  sm: 'text-sm py-1.5 pl-2 pr-8',
  md: 'text-base py-2 pl-3 pr-10',
  lg: 'text-lg py-2.5 pl-4 pr-12'
}

const nodeSizeClasses: Record<ComponentSize, string> = {
  sm: 'text-sm py-1',
  md: 'text-base py-1.5',
  lg: 'text-lg py-2'
}

// ============================================================================
// STYLE FUNCTIONS
// ============================================================================

export function getTreeSelectTriggerClasses(
  size: ComponentSize = 'md',
  disabled: boolean = false,
  isOpen: boolean = false
): string {
  const base =
    'w-full rounded-[var(--tiger-radius-md,0.5rem)] border outline-none transition-all duration-200 text-left flex items-center'

  const stateClass = disabled
    ? 'bg-[var(--tiger-treeselect-bg-disabled,var(--tiger-outline-bg-disabled,#f3f4f6))] text-[var(--tiger-treeselect-text-disabled,var(--tiger-text-muted,#9ca3af))] border-[var(--tiger-treeselect-border-disabled,var(--tiger-border,#d1d5db))] cursor-not-allowed'
    : isOpen
      ? 'bg-[var(--tiger-treeselect-bg,var(--tiger-surface,#ffffff))] text-[var(--tiger-treeselect-text,var(--tiger-text,#111827))] border-[var(--tiger-treeselect-border-focus,var(--tiger-primary,#2563eb))] ring-2 ring-[var(--tiger-treeselect-ring,var(--tiger-primary,#2563eb))]/20'
      : 'bg-[var(--tiger-treeselect-bg,var(--tiger-surface,#ffffff))] text-[var(--tiger-treeselect-text,var(--tiger-text,#111827))] border-[var(--tiger-treeselect-border,var(--tiger-border,#d1d5db))] hover:border-[var(--tiger-treeselect-border-hover,var(--tiger-primary,#2563eb))] cursor-pointer'

  return classNames(base, triggerSizeClasses[size], stateClass)
}

export function getTreeSelectNodeClasses(
  isSelected: boolean = false,
  isDisabled: boolean = false,
  size: ComponentSize = 'md'
): string {
  const stateClass = isDisabled
    ? 'text-[var(--tiger-treeselect-node-text-disabled,var(--tiger-text-muted,#9ca3af))] cursor-not-allowed opacity-50'
    : isSelected
      ? 'bg-[var(--tiger-treeselect-node-bg-selected,var(--tiger-outline-bg-active,#dbeafe))] text-[var(--tiger-treeselect-node-text-selected,var(--tiger-primary,#2563eb))]'
      : 'text-[var(--tiger-treeselect-node-text,var(--tiger-text,#111827))] hover:bg-[var(--tiger-treeselect-node-bg-hover,var(--tiger-outline-bg-hover,#eff6ff))]'

  return classNames(treeSelectNodeBaseClasses, nodeSizeClasses[size], stateClass)
}

// ============================================================================
// LOGIC FUNCTIONS
// ============================================================================

/**
 * Find a node in tree data by key
 */
export function findTreeSelectNode(data: TreeNode[], key: string | number): TreeNode | undefined {
  for (const node of data) {
    if (node.key === key) return node
    if (node.children) {
      const found = findTreeSelectNode(node.children, key)
      if (found) return found
    }
  }
  return undefined
}

/**
 * Get display label for selected value(s)
 */
export function getTreeSelectDisplayLabel(
  data: TreeNode[],
  value: string | number | (string | number)[] | undefined
): string {
  if (value === undefined || value === null) return ''

  if (Array.isArray(value)) {
    return value.map((v) => findTreeSelectNode(data, v)?.label ?? String(v)).join(', ')
  }

  return findTreeSelectNode(data, value)?.label ?? String(value)
}

/**
 * Get all keys from tree data
 */
export function getAllTreeSelectKeys(data: TreeNode[]): (string | number)[] {
  const keys: (string | number)[] = []
  function collect(nodes: TreeNode[]) {
    for (const node of nodes) {
      keys.push(node.key)
      if (node.children) collect(node.children)
    }
  }
  collect(data)
  return keys
}

/**
 * Flatten tree data for rendering with indent levels
 */
export interface FlatTreeSelectNode {
  node: TreeNode
  level: number
  hasChildren: boolean
  isExpanded: boolean
}

export function flattenTreeSelectNodes(
  data: TreeNode[],
  expandedKeys: Set<string | number>,
  level: number = 0
): FlatTreeSelectNode[] {
  const result: FlatTreeSelectNode[] = []
  for (const node of data) {
    const hasChildren = !!(node.children && node.children.length > 0)
    const isExpanded = expandedKeys.has(node.key)
    result.push({ node, level, hasChildren, isExpanded })
    if (hasChildren && isExpanded) {
      result.push(...flattenTreeSelectNodes(node.children!, expandedKeys, level + 1))
    }
  }
  return result
}

/**
 * Filter tree nodes by search query, returns matching node keys
 */
export function filterTreeSelectNodes(data: TreeNode[], query: string): Set<string | number> {
  const matchedKeys = new Set<string | number>()
  const lowerQuery = query.toLowerCase()

  function search(nodes: TreeNode[], ancestorKeys: (string | number)[]) {
    for (const node of nodes) {
      const currentPath = [...ancestorKeys, node.key]
      if (node.label.toLowerCase().includes(lowerQuery)) {
        // Add node and all ancestors
        for (const k of currentPath) matchedKeys.add(k)
      }
      if (node.children) {
        search(node.children, currentPath)
      }
    }
  }

  search(data, [])
  return matchedKeys
}

/**
 * Index of the first selected node in a flattened visible list.
 * Returns -1 when nothing is selected or the selection is not currently visible.
 */
export function getTreeSelectVisibleIndex(
  nodes: FlatTreeSelectNode[],
  value: string | number | (string | number)[] | undefined
): number {
  if (value === undefined || value === null || value === '') return -1
  if (Array.isArray(value)) {
    if (value.length === 0) return -1
    const selected = new Set(value)
    return nodes.findIndex((item) => selected.has(item.node.key))
  }
  return nodes.findIndex((item) => item.node.key === value)
}

/**
 * Next `scrollTop` that keeps `index` inside the virtual window.
 * Returns `scrollTop` unchanged when `index` is out of range.
 */
export function getTreeSelectVirtualAlignScrollTop(
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

/**
 * Apply aligned `scrollTop` on a VirtualList container and dispatch `scroll`
 * so the list's internal window recomputes.
 */
export function alignTreeSelectVirtualScroll(
  el: HTMLElement | null | undefined,
  index: number,
  itemHeight: number,
  viewportHeight: number
): number {
  if (!el || index < 0) return el?.scrollTop ?? 0
  const next = getTreeSelectVirtualAlignScrollTop(el.scrollTop, index, itemHeight, viewportHeight)
  if (el.scrollTop !== next) {
    el.scrollTop = next
    el.dispatchEvent(new Event('scroll'))
  }
  return next
}
