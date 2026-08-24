import type { ComponentSize } from './base'
import type { TreeNode } from './tree'

/**
 * TreeSelect value type
 */
export type TreeSelectValue = string | number | (string | number)[]

/**
 * Shared TreeSelect props (framework-agnostic)
 */
export interface TreeSelectProps {
  /** Tree data */
  treeData?: TreeNode[]
  /** Placeholder text */
  placeholder?: string
  /** Component size */
  size?: ComponentSize
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether to show clear button */
  clearable?: boolean
  /** Whether to allow multiple selection */
  multiple?: boolean
  /** Whether to show search input in dropdown */
  searchable?: boolean
  /** Controlled search input value */
  searchValue?: string
  /** Default search input value */
  defaultSearchValue?: string
  /** Text shown when no results found */
  emptyText?: string
  /** Whether to expand all tree nodes by default */
  defaultExpandAll?: boolean
  /**
   * Enable virtualized rendering of the dropdown tree.
   * Visible flattened rows are rendered through `VirtualList` with fixed item height.
   * Recommended for large trees (> ~200 visible items).
   * @default false
   */
  virtual?: boolean
  /**
   * Pixel height of the virtualized dropdown viewport.
   * Relevant when `virtual` is true. Matches Tree `height`.
   * @default 400
   */
  height?: number
  /**
   * Pixel height of each virtualized tree row.
   * Relevant when `virtual` is true. Matches Tree `itemHeight`.
   * @default 32
   */
  itemHeight?: number
  /** Custom class name */
  className?: string
}
