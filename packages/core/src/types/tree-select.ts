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
  /** Custom class name */
  className?: string
}
