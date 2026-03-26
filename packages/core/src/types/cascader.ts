/**
 * Cascader component types and interfaces
 */

/**
 * Cascader option data structure
 */
export interface CascaderOption {
  /** Display label */
  label: string
  /** Option value */
  value: string | number
  /** Child options */
  children?: CascaderOption[]
  /** Whether the option is disabled */
  disabled?: boolean
  /** Whether the option is a leaf node (no children) */
  isLeaf?: boolean
}

/**
 * Cascader value type (path of selected values)
 */
export type CascaderValue = (string | number)[]

/**
 * Cascader size types
 */
export type CascaderSize = 'sm' | 'md' | 'lg'

/**
 * Expand trigger type
 */
export type CascaderExpandTrigger = 'click' | 'hover'

/**
 * Custom filter function for search mode
 */
export type CascaderFilterFn = (inputValue: string, path: CascaderOption[]) => boolean

/**
 * Show search configuration
 */
export interface CascaderShowSearch {
  /** Custom filter function */
  filter?: CascaderFilterFn
  /** Whether to render matched options in search result */
  render?: (inputValue: string, path: CascaderOption[]) => string
  /** Max number of results to display */
  limit?: number
}

/**
 * Flattened option path for search results
 */
export interface CascaderFlattenedOption {
  /** Full path of options from root to leaf */
  path: CascaderOption[]
  /** Full path of values */
  valuePath: CascaderValue
  /** Combined display label */
  label: string
  /** Whether any option in the path is disabled */
  disabled: boolean
}

/**
 * Base cascader props interface
 */
export interface CascaderProps {
  /**
   * Cascader options data
   */
  options?: CascaderOption[]

  /**
   * Placeholder text
   * @default 'Please select'
   */
  placeholder?: string

  /**
   * Component size
   * @default 'md'
   */
  size?: CascaderSize

  /**
   * Whether the cascader is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether to allow clearing the selection
   * @default true
   */
  clearable?: boolean

  /**
   * Whether to allow search/filter
   * @default false
   */
  showSearch?: boolean | CascaderShowSearch

  /**
   * Trigger type for expanding sub-options
   * @default 'click'
   */
  expandTrigger?: CascaderExpandTrigger

  /**
   * Whether to select value on each level (not just leaf)
   * @default false
   */
  changeOnSelect?: boolean

  /**
   * Separator for display text
   * @default ' / '
   */
  separator?: string

  /**
   * Text to display when no options match search
   * @default 'No results found'
   */
  notFoundText?: string

  /**
   * Additional CSS classes
   */
  className?: string
}
