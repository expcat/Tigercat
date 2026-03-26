import type { TreeNode } from './tree'

/**
 * TreeSelect size variants
 */
export type TreeSelectSize = 'sm' | 'md' | 'lg'

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
  size?: TreeSelectSize
  /** Whether the component is disabled */
  disabled?: boolean
  /** Whether to show clear button */
  clearable?: boolean
  /** Whether to allow multiple selection */
  multiple?: boolean
  /** Whether to show search input in dropdown */
  showSearch?: boolean
  /** Text shown when no results found */
  notFoundText?: string
  /** Whether to expand all tree nodes by default */
  defaultExpandAll?: boolean
  /** Custom class name */
  className?: string
}
