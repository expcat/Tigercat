/**
 * TableToolbar and DataTableWithToolbar composite component types
 */

import type { ButtonVariant } from './button'
import type { FilterOption, PaginationConfig, TableProps } from './table'

/**
 * Toolbar filter value
 */
export type TableToolbarFilterObjectValue = Record<string, unknown>

export type TableToolbarFilterValue = string | number | TableToolbarFilterObjectValue | null

export interface TableToolbarFilterRenderContext {
  filter: TableToolbarFilter
  value: TableToolbarFilterValue
  filters: Record<string, TableToolbarFilterValue>
  setValue: (value: TableToolbarFilterValue) => void
  setFilter: (key: string, value: TableToolbarFilterValue) => void
}

export interface TableToolbarFiltersExtraContext {
  filters: Record<string, TableToolbarFilterValue>
  setFilter: (key: string, value: TableToolbarFilterValue) => void
}

/**
 * Context passed to the full toolbar replacement renderer
 * (Vue `#toolbar` slot / React `toolbar.render`).
 */
export interface TableToolbarRenderContext {
  /**
   * Current search value
   */
  searchValue: string
  /**
   * Update the search value (updates uncontrolled state and fires `onSearchChange`)
   */
  setSearch: (value: string) => void
  /**
   * Submit the current search value (fires `onSearch`)
   */
  submitSearch: () => void
  /**
   * Current filter values
   */
  filters: Record<string, TableToolbarFilterValue>
  /**
   * Update a filter value (updates uncontrolled state and fires `onFiltersChange`)
   */
  setFilter: (key: string, value: TableToolbarFilterValue) => void
  /**
   * Selected row keys
   */
  selectedKeys: (string | number)[]
  /**
   * Selected row count
   */
  selectedCount: number
  /**
   * Currently hidden column keys
   */
  hiddenColumnKeys: string[]
  /**
   * Update hidden column keys (updates uncontrolled state and fires the
   * hidden-columns change callback)
   */
  setHiddenColumnKeys: (keys: string[]) => void
}

/**
 * Table toolbar filter definition
 */
export interface TableToolbarFilter {
  /**
   * Filter key
   */
  key: string
  /**
   * Filter label
   */
  label: string
  /**
   * Filter options. When omitted, provide `render` to render a custom filter control.
   */
  options?: FilterOption[]
  /**
   * Placeholder text for the trigger
   */
  placeholder?: string
  /**
   * Whether the filter can be cleared
   * @default true
   */
  clearable?: boolean
  /**
   * Label for the clear option
   * @default '全部'
   */
  clearLabel?: string
  /**
   * Controlled filter value
   */
  value?: TableToolbarFilterValue
  /**
   * Default filter value (uncontrolled)
   */
  defaultValue?: TableToolbarFilterValue
  /**
   * Custom filter renderer.
   */
  render?: (context: TableToolbarFilterRenderContext) => unknown
  /**
   * Class for the filter item wrapper. When provided it REPLACES the default
   * wrapper width classes (`w-full sm:w-auto sm:min-w-[120px] sm:max-w-[180px]`
   * for built-in selects, `w-full sm:w-auto` for `render`-based filters), so
   * re-include any defaults you still want.
   */
  itemClass?: string
  /**
   * Inline style for the filter item wrapper
   */
  itemStyle?: Record<string, string | number>
}

/**
 * Table toolbar bulk action
 */
export interface TableToolbarAction {
  /**
   * Action key
   */
  key: string | number
  /**
   * Action label
   */
  label: string
  /**
   * Button variant
   * @default 'outline'
   */
  variant?: ButtonVariant
  /**
   * Whether the action is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Click handler
   */
  onClick?: (selectedKeys: (string | number)[]) => void
}

/**
 * Table toolbar props
 */
export interface TableToolbarProps {
  /**
   * Search value (controlled)
   */
  searchValue?: string
  /**
   * Default search value (uncontrolled)
   */
  defaultSearchValue?: string
  /**
   * Search input placeholder
   */
  searchPlaceholder?: string
  /**
   * Search button text
   * @default '搜索'
   */
  searchButtonText?: string
  /**
   * Whether to show search button
   * @default true
   */
  showSearchButton?: boolean
  /**
   * Search value change callback
   */
  onSearchChange?: (value: string) => void
  /**
   * Search submit callback
   */
  onSearch?: (value: string) => void
  /**
   * Filter definitions
   */
  filters?: TableToolbarFilter[]
  /**
   * Filters change callback
   */
  onFiltersChange?: (filters: Record<string, TableToolbarFilterValue>) => void
  /**
   * Extra content rendered after configured filters.
   */
  filtersExtra?: unknown | ((context: TableToolbarFiltersExtraContext) => unknown)
  /**
   * Bulk actions
   */
  bulkActions?: TableToolbarAction[]
  /**
   * Selected row keys
   */
  selectedKeys?: (string | number)[]
  /**
   * Selected row count
   */
  selectedCount?: number
  /**
   * Bulk actions label prefix
   * @default '已选择'
   */
  bulkActionsLabel?: string
  /**
   * Bulk action click callback
   */
  onBulkAction?: (action: TableToolbarAction, selectedKeys: (string | number)[]) => void
  /**
   * Whether to show the column-settings entry (a popover with checkboxes
   * toggling column visibility via the table's `hiddenColumnKeys`).
   * @default false
   */
  showColumnSettings?: boolean
  /**
   * Column-settings panel configuration
   */
  columnSettings?: TableToolbarColumnSettings
  /**
   * Extra class appended to the toolbar container
   */
  className?: string
  /**
   * Inline style for the toolbar container
   */
  style?: Record<string, string | number>
  /**
   * Class for the search input wrapper. When provided it REPLACES the default
   * sizing classes (`w-full sm:w-auto sm:min-w-[220px] sm:max-w-[320px]`);
   * the structural `flex items-center gap-2` classes are always kept.
   */
  searchClassName?: string
  /**
   * Full toolbar replacement. When provided, the built-in toolbar region
   * (search, filters, bulk actions, column settings and their container,
   * including its `role="toolbar"`) is not rendered; table, pagination and
   * selection wiring stay untouched. Consumers should add `role="toolbar"`
   * and an aria-label on their own container.
   * Vue uses the `#toolbar` scoped slot instead of this option.
   */
  render?: unknown | ((context: TableToolbarRenderContext) => unknown)
}

/**
 * Column-settings panel configuration for the table toolbar
 */
export interface TableToolbarColumnSettings {
  /**
   * Panel title; defaults to the locale's `columnSettingsText`
   */
  title?: string
  /**
   * Columns that cannot be hidden from the panel.
   * Takes precedence over `column.hideable`.
   */
  lockedColumnKeys?: string[]
}

/**
 * Data table with toolbar props.
 *
 * Business callbacks (search / filters / bulk actions) are configured on the
 * `toolbar` object (React `toolbar.onSearchChange` / `toolbar.onSearch` /
 * `toolbar.onFiltersChange` / `toolbar.onBulkAction`; Vue `@search-change` /
 * `@search` / `@filters-change` / `@bulk-action` events). Everything else is a
 * passthrough to the inner Table plus pagination wiring.
 */
export interface DataTableWithToolbarProps<T = Record<string, unknown>> extends Omit<
  TableProps<T>,
  'pagination'
> {
  /**
   * Toolbar configuration
   */
  toolbar?: TableToolbarProps
  /**
   * Pagination configuration
   * Set to false to disable
   */
  pagination?: PaginationConfig | false
  /**
   * Page change callback
   */
  onPageChange?: (current: number, pageSize: number) => void
  /**
   * Page size change callback
   */
  onPageSizeChange?: (current: number, pageSize: number) => void
  /**
   * Class applied to the inner table element.
   */
  tableClassName?: string
}
