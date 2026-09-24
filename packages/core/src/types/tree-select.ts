import type { ComponentSize } from './base'
import type { InputStatus } from './input'
import type { TigerLocale, TigerLocaleSelect, TigerLocaleTreeSelect } from './locale'
import type { TreeCheckStrategy, TreeFilterFn, TreeLoadDataFn, TreeNode } from './tree'
import type { FloatingPlacement } from '../utils/floating'

/**
 * Single-select key. `0` is a legal key. `''` is empty, not a key.
 */
export type TreeSelectSingleValue = string | number

export type TreeSelectMultipleValue = (string | number)[]

/**
 * Selected key(s). `undefined` is uncontrolled.
 * Single empty is `null`. Multiple empty is `[]`. `''` is empty, not a key.
 */
export type TreeSelectValue = TreeSelectSingleValue | TreeSelectMultipleValue | null | undefined

/**
 * Shared TreeSelect props (framework-agnostic)
 */
export interface TreeSelectProps {
  /** Tree data */
  treeData?: TreeNode[]
  /**
   * Selected key(s). `undefined` is uncontrolled.
   * Single empty is `null`. Multiple empty is `[]`. `''` is empty, not a key.
   */
  value?: TreeSelectValue
  /**
   * Initial value when `value` is omitted.
   */
  defaultValue?: TreeSelectValue
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
   * Fired when the dropdown opens or closes.
   */
  onOpenChange?: (open: boolean) => void
  /**
   * Placeholder text when nothing is selected.
   * Defaults to ConfigProvider locale `select.placeholder`.
   */
  placeholder?: string
  /** Component size */
  size?: ComponentSize
  /** Whether the component is disabled */
  disabled?: boolean
  /**
   * Focusable and submitted, but the value cannot change.
   * `readonly` is not a prop.
   */
  readOnly?: boolean
  /**
   * Whether to show clear button. Same default as Select / Cascader.
   * @default true
   */
  clearable?: boolean
  /**
   * Multiple selection with checkboxes.
   * Parent/child cascade follows `checkStrictly` / `checkStrategy`.
   * @default false
   */
  multiple?: boolean
  /**
   * When true, checking a node does not cascade to parent/children.
   * @default false
   */
  checkStrictly?: boolean
  /**
   * Which keys to emit when `multiple` and not `checkStrictly`.
   * @default 'all'
   */
  checkStrategy?: TreeCheckStrategy
  /** Whether to show search input in the trigger when open */
  searchable?: boolean
  /** Controlled search input value */
  searchValue?: string
  /** Default search input value */
  defaultSearchValue?: string
  /**
   * Clear the search query after selecting in multiple mode.
   * @default true
   */
  autoClearSearchValue?: boolean
  /**
   * Text shown when the tree is empty or search has no matches.
   * Defaults to ConfigProvider locale `empty.noResults`.
   */
  emptyText?: string
  /** Whether to expand all tree nodes by default */
  defaultExpandAll?: boolean
  /** Controlled expanded keys */
  expandedKeys?: (string | number)[]
  /** Initial expanded keys when `expandedKeys` is omitted */
  defaultExpandedKeys?: (string | number)[]
  /**
   * Enable virtualized rendering of the dropdown tree.
   * @default false
   */
  virtual?: boolean
  /**
   * Pixel height of the tree content area (virtual and non-virtual).
   * Same job as Select/Cascader `listHeight`.
   * @default 256
   */
  listHeight?: number
  /**
   * Pixel height of each virtualized tree row.
   * Defaults to the rendered size map (sm/md/lg).
   */
  itemHeight?: number
  /**
   * Remote-loading flag. Empty trees show `select.loadingText`.
   * @default false
   */
  loading?: boolean
  /**
   * Load children for a non-leaf with empty `children`.
   */
  loadData?: TreeLoadDataFn
  /**
   * Custom node filter. Default matches label (case-insensitive).
   */
  filterFn?: TreeFilterFn
  /**
   * Validation status. Also read from FormItem when omitted.
   * @default 'default'
   */
  status?: InputStatus
  /**
   * Native form field name. Serialized through hidden inputs.
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
  labels?: Partial<TigerLocaleSelect & TigerLocaleTreeSelect>
  /** Custom class name */
  className?: string
}
