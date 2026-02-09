/**
 * Tree component utilities
 * Shared styles and helpers for Tree components
 */

import type { TreeNode, TreeCheckedState, TreeCheckStrategy, TreeFilterFn } from '../types/tree'
import { classNames } from './class-names'

export interface VisibleTreeItem {
  key: string | number
  level: number
  parentKey?: string | number
  node: TreeNode
}

export function getVisibleTreeItems(
  treeData: TreeNode[],
  expandedKeys: Set<string | number> = new Set(),
  matchedKeys?: Set<string | number>
): VisibleTreeItem[] {
  const isFiltered = !!matchedKeys && matchedKeys.size > 0
  const result: VisibleTreeItem[] = []

  function traverse(nodes: TreeNode[], level: number, parentKey?: string | number) {
    for (const node of nodes) {
      const isVisible = !isFiltered || matchedKeys!.has(node.key)
      if (!isVisible) continue

      result.push({ key: node.key, level, parentKey, node })

      if (node.children && node.children.length > 0 && expandedKeys.has(node.key)) {
        traverse(node.children, level + 1, node.key)
      }
    }
  }

  traverse(treeData, 1)
  return result
}

/**
 * Base classes for tree container
 */
export const treeBaseClasses = 'w-full bg-white rounded-lg'

/**
 * Tree node wrapper classes
 */
export const treeNodeWrapperClasses = 'select-none'

/**
 * Tree node content classes
 */
export const treeNodeContentClasses =
  'flex items-center px-2 py-1.5 cursor-pointer rounded transition-colors duration-200'

/**
 * Tree node hover classes
 */
export const treeNodeHoverClasses = 'hover:bg-gray-50'

/**
 * Tree node selected classes
 */
export const treeNodeSelectedClasses =
  'bg-[color-mix(in_srgb,var(--tiger-primary,#2563eb)_10%,transparent)] text-[var(--tiger-primary,#2563eb)]'

/**
 * Tree node disabled classes
 */
export const treeNodeDisabledClasses = 'opacity-50 cursor-not-allowed'

/**
 * Tree node indent classes
 */
export const treeNodeIndentClasses = 'inline-block w-6'

/**
 * Tree node expand icon classes
 */
export const treeNodeExpandIconClasses =
  'inline-flex items-center justify-center w-6 h-6 transition-transform duration-200'

/**
 * Tree node expand icon expanded classes
 */
export const treeNodeExpandIconExpandedClasses = 'transform rotate-90'

/**
 * Tree node checkbox classes
 */
export const treeNodeCheckboxClasses =
  'mr-2 rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]'

/**
 * Tree node icon classes
 */
export const treeNodeIconClasses = 'mr-2 flex-shrink-0'

/**
 * Tree node label classes
 */
export const treeNodeLabelClasses = 'flex-1 truncate'

/**
 * Tree node children container classes
 */
export const treeNodeChildrenClasses = 'ml-6'

/**
 * Tree loading classes
 */
export const treeLoadingClasses = 'inline-block ml-2 animate-spin h-4 w-4'

/**
 * Tree empty state classes
 */
export const treeEmptyStateClasses = 'py-8 text-center text-gray-500'

/**
 * Tree line classes
 */
export const treeLineClasses = 'border-l border-gray-300'

/**
 * Get tree node classes
 * @param selected - Whether the node is selected
 * @param disabled - Whether the node is disabled
 * @param blockNode - Whether to use block node style
 * @returns Combined class string for tree node
 */
export function getTreeNodeClasses(
  selected: boolean,
  disabled: boolean,
  blockNode = false
): string {
  return classNames(
    treeNodeContentClasses,
    !disabled && treeNodeHoverClasses,
    selected && treeNodeSelectedClasses,
    disabled && treeNodeDisabledClasses,
    blockNode && 'w-full'
  )
}

/**
 * Get tree node expand icon classes
 * @param expanded - Whether the node is expanded
 * @returns Combined class string for expand icon
 */
export function getTreeNodeExpandIconClasses(expanded: boolean): string {
  return classNames(treeNodeExpandIconClasses, expanded && treeNodeExpandIconExpandedClasses)
}

/**
 * Get all keys from tree data
 * @param treeData - Tree data
 * @returns Array of all node keys
 */
export function getAllKeys(treeData: TreeNode[]): (string | number)[] {
  const keys: (string | number)[] = []

  function traverse(nodes: TreeNode[]) {
    nodes.forEach((node) => {
      keys.push(node.key)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }

  traverse(treeData)
  return keys
}

/**
 * Get all leaf node keys from tree data
 * @param treeData - Tree data
 * @returns Array of leaf node keys
 */
export function getLeafKeys(treeData: TreeNode[]): (string | number)[] {
  const keys: (string | number)[] = []

  function traverse(nodes: TreeNode[]) {
    nodes.forEach((node) => {
      if (!node.children || node.children.length === 0 || node.isLeaf) {
        keys.push(node.key)
      } else {
        traverse(node.children)
      }
    })
  }

  traverse(treeData)
  return keys
}

/**
 * Find node by key
 * @param treeData - Tree data
 * @param key - Node key
 * @returns Found node or null
 */
export function findNode(treeData: TreeNode[], key: string | number): TreeNode | null {
  for (const node of treeData) {
    if (node.key === key) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const found = findNode(node.children, key)
      if (found) {
        return found
      }
    }
  }
  return null
}

/**
 * Get parent keys of a node
 * @param treeData - Tree data
 * @param key - Node key
 * @returns Array of parent keys from root to direct parent
 */
export function getParentKeys(treeData: TreeNode[], key: string | number): (string | number)[] {
  const parents: (string | number)[] = []

  function traverse(nodes: TreeNode[], path: (string | number)[] = []): boolean {
    for (const node of nodes) {
      if (node.key === key) {
        parents.push(...path)
        return true
      }
      if (node.children && node.children.length > 0) {
        if (traverse(node.children, [...path, node.key])) {
          return true
        }
      }
    }
    return false
  }

  traverse(treeData)
  return parents
}

/**
 * Get all descendant keys of a node
 * @param node - Tree node
 * @returns Array of all descendant keys
 */
export function getDescendantKeys(node: TreeNode): (string | number)[] {
  const keys: (string | number)[] = []

  function traverse(n: TreeNode) {
    if (n.children && n.children.length > 0) {
      n.children.forEach((child) => {
        keys.push(child.key)
        traverse(child)
      })
    }
  }

  traverse(node)
  return keys
}

/**
 * Calculate checked state based on selected keys
 * @param treeData - Tree data
 * @param checkedKeys - Checked node keys
 * @param checkStrictly - Whether parent and children are independent
 * @returns Checked state with checked and half-checked keys
 */
export function calculateCheckedState(
  treeData: TreeNode[],
  checkedKeys: (string | number)[],
  checkStrictly = false
): TreeCheckedState {
  if (checkStrictly) {
    return { checked: checkedKeys, halfChecked: [] }
  }

  const checkedSet = new Set(checkedKeys)
  const halfCheckedSet = new Set<string | number>()

  function markSubtreeChecked(node: TreeNode) {
    checkedSet.add(node.key)
    halfCheckedSet.delete(node.key)
    node.children?.forEach(markSubtreeChecked)
  }

  function checkNode(node: TreeNode): {
    checked: boolean
    halfChecked: boolean
  } {
    // Treat explicitly-checked parent keys as selecting the whole subtree.
    if (checkedSet.has(node.key)) {
      markSubtreeChecked(node)
      return { checked: true, halfChecked: false }
    }

    if (!node.children || node.children.length === 0) {
      return { checked: checkedSet.has(node.key), halfChecked: false }
    }

    let checkedCount = 0
    let totalCount = 0

    node.children.forEach((child) => {
      const childState = checkNode(child)
      totalCount++

      if (childState.checked) {
        checkedCount++
      } else if (childState.halfChecked) {
        halfCheckedSet.add(node.key)
      }
    })

    if (checkedCount === totalCount) {
      checkedSet.add(node.key)
      halfCheckedSet.delete(node.key)
      return { checked: true, halfChecked: false }
    } else if (checkedCount > 0 || halfCheckedSet.has(node.key)) {
      halfCheckedSet.add(node.key)
      checkedSet.delete(node.key)
      return { checked: false, halfChecked: true }
    }

    checkedSet.delete(node.key)
    halfCheckedSet.delete(node.key)
    return { checked: false, halfChecked: false }
  }

  treeData.forEach((node) => checkNode(node))

  return {
    checked: Array.from(checkedSet),
    halfChecked: Array.from(halfCheckedSet)
  }
}

/**
 * Handle node check/uncheck with cascade
 * @param treeData - Tree data
 * @param nodeKey - Node key to check/uncheck
 * @param checked - Whether to check or uncheck
 * @param currentChecked - Current checked keys
 * @param checkStrictly - Whether parent and children are independent
 * @returns New checked state
 */
export function handleNodeCheck(
  treeData: TreeNode[],
  nodeKey: string | number,
  checked: boolean,
  currentChecked: (string | number)[],
  checkStrictly = false
): TreeCheckedState {
  const node = findNode(treeData, nodeKey)
  if (!node) {
    return calculateCheckedState(treeData, currentChecked, checkStrictly)
  }

  let newCheckedKeys = [...currentChecked]

  if (checkStrictly) {
    if (checked) {
      if (!newCheckedKeys.includes(nodeKey)) {
        newCheckedKeys.push(nodeKey)
      }
    } else {
      newCheckedKeys = newCheckedKeys.filter((k) => k !== nodeKey)
    }
  } else {
    // Get all descendant keys
    const descendantKeys = getDescendantKeys(node)

    if (checked) {
      // Add node and all descendants
      if (!newCheckedKeys.includes(nodeKey)) {
        newCheckedKeys.push(nodeKey)
      }
      descendantKeys.forEach((key) => {
        if (!newCheckedKeys.includes(key)) {
          newCheckedKeys.push(key)
        }
      })
    } else {
      // Remove node and all descendants
      newCheckedKeys = newCheckedKeys.filter((k) => k !== nodeKey && !descendantKeys.includes(k))
    }
  }

  return calculateCheckedState(treeData, newCheckedKeys, checkStrictly)
}

/**
 * Filter checked keys based on check strategy
 * @param checkedState - Current checked state
 * @param treeData - Tree data
 * @param strategy - Check strategy
 * @returns Filtered checked keys
 */
export function getCheckedKeysByStrategy(
  checkedState: TreeCheckedState,
  treeData: TreeNode[],
  strategy: TreeCheckStrategy = 'all'
): (string | number)[] {
  if (strategy === 'all') {
    return checkedState.checked
  }

  const allKeys = new Set(checkedState.checked)
  const result: (string | number)[] = []

  function traverse(nodes: TreeNode[]) {
    nodes.forEach((node) => {
      if (allKeys.has(node.key)) {
        const hasChildren = node.children && node.children.length > 0
        const allChildrenChecked =
          hasChildren && node.children!.every((child) => allKeys.has(child.key))

        if (strategy === 'parent') {
          // Return parent if all children are checked
          if (hasChildren && allChildrenChecked) {
            result.push(node.key)
            // Don't traverse children
            return
          } else if (!hasChildren) {
            result.push(node.key)
          }
        } else if (strategy === 'child') {
          // Return leaf nodes only
          if (!hasChildren || !allChildrenChecked) {
            result.push(node.key)
          }
        }

        if (hasChildren) {
          traverse(node.children!)
        }
      }
    })
  }

  traverse(treeData)
  return result
}

/**
 * Filter tree nodes based on filter function
 * @param treeData - Tree data
 * @param filterValue - Filter value
 * @param filterFn - Filter function
 * @returns Set of matched node keys
 */
export function filterTreeNodes(
  treeData: TreeNode[],
  filterValue: string,
  filterFn?: TreeFilterFn
): Set<string | number> {
  const matchedKeys = new Set<string | number>()

  if (!filterValue) {
    return matchedKeys
  }

  const defaultFilterFn: TreeFilterFn = (value, node) => {
    return node.label.toLowerCase().includes(value.toLowerCase())
  }

  const fn = filterFn || defaultFilterFn

  function traverse(nodes: TreeNode[]): boolean {
    let hasMatchedChild = false

    nodes.forEach((node) => {
      const isMatched = fn(filterValue, node)
      let childMatched = false

      if (node.children && node.children.length > 0) {
        childMatched = traverse(node.children)
      }

      if (isMatched || childMatched) {
        matchedKeys.add(node.key)
        hasMatchedChild = true
      }
    })

    return hasMatchedChild
  }

  traverse(treeData)
  return matchedKeys
}

/**
 * Get expanded keys for auto-expand when filtering
 * @param treeData - Tree data
 * @param matchedKeys - Matched node keys
 * @returns Set of keys to expand
 */
export function getAutoExpandKeys(
  treeData: TreeNode[],
  matchedKeys: Set<string | number>
): Set<string | number> {
  const expandKeys = new Set<string | number>()

  matchedKeys.forEach((key) => {
    const parentKeys = getParentKeys(treeData, key)
    parentKeys.forEach((pk) => expandKeys.add(pk))
  })

  return expandKeys
}

/**
 * Create Set-based lookup from TreeCheckedState for O(1) per-node checks.
 * Use this in render loops instead of Array.includes() for better performance.
 */
export function checkedSetsFromState(state: TreeCheckedState): {
  checkedSet: Set<string | number>
  halfCheckedSet: Set<string | number>
} {
  return {
    checkedSet: new Set(state.checked),
    halfCheckedSet: new Set(state.halfChecked)
  }
}
