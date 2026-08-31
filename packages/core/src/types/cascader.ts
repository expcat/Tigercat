/**
 * Cascader component types and interfaces
 */

import type { ComponentSize } from './base'
import type { InputStatus } from './input'
import type { TigerLocale, TigerLocaleSelect } from './locale'
import type { FloatingPlacement } from '../utils/floating'

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
  /**
   * Whether the option is a leaf. `true` never expands, even with children.
   * `false` with empty children is loadable when `loadData` is set.
   */
  isLeaf?: boolean
}

/**
 * Selected path. `undefined` is empty / uncontrolled; `[]` is an empty path.
 */
export type CascaderValue = (string | number)[]

export type CascaderModelValue = CascaderValue | undefined

/**
 * Expand trigger type
 */
export type CascaderExpandTrigger = 'click' | 'hover'

/**
 * Custom filter function for search mode
 */
export type CascaderFilterFn = (inputValue: string, path: CascaderOption[]) => boolean

/**
 * Lazy-load children for a non-leaf option.
 */
export type CascaderLoadDataFn = (option: CascaderOption) => Promise<CascaderOption[]>

/**
 * Search configuration
 */
export interface CascaderSearchConfig {
  /** Custom filter function */
  filter?: CascaderFilterFn
  /** Whether to render matched options in search result */
  render?: (inputValue: string, path: CascaderOption[]) => string
  /**
   * Max number of results to display.
   * @default 50
   */
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
   * Selected path. `undefined` is empty / uncontrolled.
   */
  value?: CascaderModelValue

  /**
   * Initial path when `value` is omitted.
   */
  defaultValue?: CascaderModelValue

  /**
   * Controlled open state. `undefined` is uncontrolled.
   */
  open?: boolean

  /**
   * Initial open state when `open` is omitted.
   * @default false
   */
  defaultOpen?: boolean

  /**
   * Placeholder text when nothing is selected.
   * Defaults to ConfigProvider locale `select.placeholder`.
   */
  placeholder?: string

  /**
   * Component size
   * @default 'md'
   */
  size?: ComponentSize

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
  searchable?: boolean | CascaderSearchConfig

  /**
   * Controlled search input value
   */
  searchValue?: string

  /**
   * Default search input value
   */
  defaultSearchValue?: string

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
   * Separator for display text (trigger and search rows)
   * @default ' / '
   */
  separator?: string

  /**
   * Text to display when no options match search, or options are empty.
   * Defaults to ConfigProvider locale `empty.noResults`.
   */
  emptyText?: string

  /**
   * Whether to use virtual scrolling for large column / search lists.
   * @default false
   */
  virtual?: boolean

  /**
   * Height of each column panel (and the searchable flat list) in pixels.
   * Applies to virtual and non-virtual lists.
   * @default 256
   */
  listHeight?: number

  /**
   * Remote-loading flag. Empty lists show `select.loadingText` instead of empty.
   * @default false
   */
  loading?: boolean

  /**
   * Load children for a non-leaf with empty `children`.
   * Do not treat the option as a leaf until loading finishes with no children.
   */
  loadData?: CascaderLoadDataFn

  /**
   * Validation status. Also read from FormItem when omitted.
   * @default 'default'
   */
  status?: InputStatus

  /**
   * Native form field name. Serialized through a hidden input.
   */
  name?: string

  /**
   * Overlay placement.
   * @default 'bottom-start'
   */
  placement?: FloatingPlacement

  /**
   * Overlay offset in pixels.
   * @default 4
   */
  offset?: number

  /**
   * Extra class names for the dropdown panel.
   */
  dropdownClassName?: string

  /**
   * Portal container. Defaults to the overlay-host → ConfigProvider → body chain.
   */
  getPopupContainer?: () => HTMLElement | null

  /**
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>

  /**
   * UI labels for custom text. Takes precedence over `locale` and ConfigProvider text.
   */
  labels?: Partial<TigerLocaleSelect>

  /**
   * Additional CSS classes
   */
  className?: string
}
