/**
 * Table component types and interfaces
 */

import type { TigerLocaleInput, TigerLocaleTable } from './locale'
import type { PaginationPageSizeOptionItem } from './pagination'

/**
 * Table size types
 */
export type TableSize = 'sm' | 'md' | 'lg'

export type TableExportFormat = 'csv' | 'excel'

export type TableResponsiveMode = 'card' | 'scroll'

export type TableCardSelectionPosition = 'controls-row' | 'title-inline'

/**
 * Viewport breakpoint below which `responsiveMode="card"` activates.
 * Maps to Tailwind's `sm` (640px), `md` (768px), and `lg` (1024px) widths.
 */
export type TableCardBreakpoint = 'sm' | 'md' | 'lg'

export type TableFixedPosition = 'left' | 'right'

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc' | null

/**
 * Sort state
 */
export interface SortState {
  /**
   * Column key to sort by
   */
  key: string | null

  /**
   * Sort direction
   */
  direction: SortDirection
}

/**
 * Column alignment
 */
export type ColumnAlign = 'left' | 'center' | 'right'

export interface TableFixedHeaderClassNameContext<T = Record<string, unknown>> {
  view: 'table' | 'virtual-table'
  column: TableColumn<T>
  fixed: TableFixedPosition
  stickyHeader: boolean
}

export interface TableFixedCellClassNameContext<T = Record<string, unknown>> {
  view: 'table' | 'virtual-table'
  column: TableColumn<T>
  fixed: TableFixedPosition
  record: T
  rowIndex: number
  striped: boolean
  selected: boolean
  hoverable: boolean
}

export type TableFixedHeaderClassName<T = Record<string, unknown>> =
  | string
  | ((context: TableFixedHeaderClassNameContext<T>) => string | undefined | null | false)

export type TableFixedCellClassName<T = Record<string, unknown>> =
  | string
  | ((context: TableFixedCellClassNameContext<T>) => string | undefined | null | false)

/**
 * Filter type
 */
export type FilterType = 'text' | 'select' | 'custom'

/**
 * Filter option for select filter
 */
export interface FilterOption {
  /**
   * Option label
   */
  label: string

  /**
   * Option value
   */
  value: string | number
}

/**
 * Column filter configuration
 */
export interface ColumnFilter {
  /**
   * Filter type
   * @default 'text'
   */
  type?: FilterType

  /**
   * Filter options (for select type)
   */
  options?: FilterOption[]

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Custom filter function
   * @param value - Cell value
   * @param filterValue - Current filter value
   * @returns Whether the row should be shown
   */
  filterFn?: (value: unknown, filterValue: unknown) => boolean
}

export type TableCardColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
export type TableCardRowSpan = 1 | 2 | 3 | 4 | 5 | 6

export interface TableColumnCardGrid {
  /**
   * Grid column span in card mode (1-12).
   * @default 12
   */
  colSpan?: TableCardColSpan

  /**
   * Grid row span in card mode (1-6).
   */
  rowSpan?: TableCardRowSpan

  /**
   * Whether to hide the field title/label.
   * @default false
   */
  hideLabel?: boolean

  /**
   * Layout direction of the field label and value.
   * @default 'left'
   */
  labelPosition?: 'left' | 'top'

  /**
   * Whether to render a divider above this field in card mode.
   * @default false
   */
  divider?: boolean

  /**
   * Custom CSS class name for the field label in card mode.
   */
  labelClassName?: string

  /**
   * Custom CSS class name for the field value in card mode.
   */
  valueClassName?: string
}

/**
 * Table column configuration
 */
export interface TableColumn<T = Record<string, unknown>> {
  /**
   * Column key (must be unique)
   */
  key: string

  /**
   * Column title/header text
   */
  title: string

  /**
   * Data key to access in row object
   * If not provided, uses `key`
   */
  dataKey?: string

  /**
   * Column width (CSS value)
   */
  width?: string | number

  /**
   * Column alignment
   * @default 'left'
   */
  align?: ColumnAlign

  /**
   * Whether column is sortable
   * @default false
   */
  sortable?: boolean

  /**
   * Custom sort function
   * @param a - First value
   * @param b - Second value
   * @returns Sort comparison result
   */
  sortFn?: (a: unknown, b: unknown) => number

  /**
   * Column filter configuration
   */
  filter?: ColumnFilter

  /**
   * Whether column is fixed
   * @default false
   */
  fixed?: TableFixedPosition | false

  /**
   * Hide this column when the table renders as cards (`responsiveMode="card"`).
   * Useful for omitting secondary fields (id, timestamps) on narrow screens.
   * @default false
   */
  hideInCard?: boolean

  /**
   * Whether this column can be hidden via `hiddenColumnKeys` UIs such as the
   * toolbar column-settings panel. Set to false for columns that must stay
   * visible (e.g. action columns).
   * @default true
   */
  hideable?: boolean

  /**
   * Ordering weight in card mode; columns with a lower value render first.
   * Columns without a priority keep their original relative order and sort
   * after prioritized ones.
   */
  cardPriority?: number

  /**
   * Render this column as the card's heading instead of a label/value row.
   * The first visible column with `cardTitle` wins.
   * @default false
   */
  cardTitle?: boolean

  /**
   * Custom grid layout configuration for card mode.
   */
  cardGrid?: TableColumnCardGrid

  /**
   * Custom render function for cell content
   * Framework-specific implementations will handle this differently
   */
  render?: (record: T, index: number) => unknown

  /**
   * Custom render function for header
   */
  renderHeader?: () => unknown

  /**
   * CSS class for column cells
   */
  className?: string

  /**
   * CSS class for fixed column cells, or a resolver based on row state.
   */
  fixedClassName?: TableFixedCellClassName<T>

  /**
   * CSS class for header cell
   */
  headerClassName?: string

  /**
   * CSS class for fixed column header cells, or a resolver for sticky header state.
   */
  fixedHeaderClassName?: TableFixedHeaderClassName<T>
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /**
   * Current page number (1-indexed)
   * @default 1
   */
  current?: number

  /**
   * Default current page number (1-indexed) for uncontrolled mode.
   * Used when `current` is not provided.
   * @default 1
   */
  defaultCurrent?: number

  /**
   * Number of items per page
   * @default 10
   */
  pageSize?: number

  /**
   * Default page size for uncontrolled mode.
   * Used when `pageSize` is not provided.
   * @default 10
   */
  defaultPageSize?: number

  /**
   * Total number of items
   */
  total?: number

  /**
   * Available page size options
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: PaginationPageSizeOptionItem[]

  /**
   * Whether to show page size selector
   * @default true
   */
  showSizeChanger?: boolean

  /**
   * Whether to show total count
   * @default true
   */
  showTotal?: boolean

  /**
   * Custom total text render function
   */
  totalText?: (total: number, range: [number, number]) => string

  /**
   * Locale configuration for pagination text. Set to false to ignore i18n.
   */
  locale?: TigerLocaleInput | false

  /**
   * Custom text for 'Previous' button
   */
  prevText?: string

  /**
   * Custom text for 'Next' button
   */
  nextText?: string

  /**
   * Custom text template for page indicator
   */
  pageIndicatorText?: (current: number, total: number) => string

  /**
   * Custom text template for page size option
   */
  pageSizeText?: (size: number) => string
}

/**
 * Table row selection configuration
 */
export interface RowSelectionConfig<T = Record<string, unknown>> {
  /**
   * Selected row keys
   */
  selectedRowKeys?: (string | number)[]

  /**
   * Default selected row keys for uncontrolled mode.
   * Used when `selectedRowKeys` is not provided.
   */
  defaultSelectedRowKeys?: (string | number)[]

  /**
   * Function to get row key
   * @default (record) => record.id
   */
  getRowKey?: (record: T) => string | number

  /**
   * Whether to show checkbox column
   * @default true
   */
  showCheckbox?: boolean

  /**
   * Selection type
   * @default 'checkbox'
   */
  type?: 'checkbox' | 'radio'

  /**
   * Function to determine if row can be selected
   */
  getCheckboxProps?: (record: T) => { disabled?: boolean }
}

/**
 * Table row expansion configuration
 */
export interface ExpandableConfig<T = Record<string, unknown>> {
  /**
   * Currently expanded row keys (controlled mode).
   * When provided, internal expand state will not be mutated.
   */
  expandedRowKeys?: (string | number)[]

  /**
   * Default expanded row keys for uncontrolled mode.
   * Used when `expandedRowKeys` is not provided.
   */
  defaultExpandedRowKeys?: (string | number)[]

  /**
   * Render function for expanded row content.
   * Framework-specific implementations may also support slots/children.
   */
  expandedRowRender?: (record: T, index: number) => unknown

  /**
   * Determine whether a row is expandable.
   * Return false to hide the expand icon for that row.
   * @default () => true
   */
  rowExpandable?: (record: T) => boolean

  /**
   * Whether clicking the entire row toggles expand state.
   * When false, only clicking the expand icon triggers expansion.
   * @default false
   */
  expandRowByClick?: boolean

  /**
   * Position of the expand toggle column.
   * @default 'start'
   */
  expandIconPosition?: 'start' | 'end'
}

export interface TableCardRenderContext<T = Record<string, unknown>> {
  record: T
  index: number
  columns: TableColumn<T>[]
  selected: boolean
  expanded: boolean
  toggleExpand: () => void
  selectRow: (checked: boolean) => void
}

export interface TableCardLayoutItem {
  /**
   * Target column key.
   */
  key: string

  /**
   * Grid column span in card mode (1-12).
   */
  colSpan?: TableCardColSpan

  /**
   * Grid row span in card mode (1-6).
   */
  rowSpan?: TableCardRowSpan

  /**
   * Whether to hide the field title/label.
   */
  hideLabel?: boolean

  /**
   * Layout direction of the field label and value.
   */
  labelPosition?: 'left' | 'top'

  /**
   * Whether to render a divider above this field in card mode.
   */
  divider?: boolean

  /**
   * Custom CSS class name for the field label in card mode.
   */
  labelClassName?: string

  /**
   * Custom CSS class name for the field value in card mode.
   */
  valueClassName?: string

  /**
   * Custom CSS class name for card item container.
   */
  className?: string
}

/**
 * Base table props interface
 */
export interface TableProps<T = Record<string, unknown>> {
  /**
   * Table columns configuration
   */
  columns: TableColumn<T>[]

  /**
   * Whether to show a lock button in each column header.
   * Clicking the lock toggles the column into the compact left fixed area.
   * @default false
   */
  columnLockable?: boolean

  /**
   * Table data source
   * @default []
   */
  dataSource?: T[]

  /**
   * Controlled hidden column keys (matched against `columns[].key`).
   * When provided, internal hidden-column state will not be mutated.
   */
  hiddenColumnKeys?: string[]

  /**
   * Default hidden column keys for uncontrolled mode.
   */
  defaultHiddenColumnKeys?: string[]

  /**
   * Controlled sort state.
   * When provided, internal sort state will not be mutated.
   */
  sort?: SortState

  /**
   * Default sort state for uncontrolled mode.
   */
  defaultSort?: SortState

  /**
   * Controlled filters.
   * When provided, internal filter state will not be mutated.
   */
  filters?: Record<string, unknown>

  /**
   * Default filters for uncontrolled mode.
   */
  defaultFilters?: Record<string, unknown>

  /**
   * Table size
   * @default 'md'
   */
  size?: TableSize

  /**
   * Whether to show border
   * @default false
   */
  bordered?: boolean

  /**
   * Whether to show striped rows
   * @default false
   */
  striped?: boolean

  /**
   * Whether to highlight row on hover
   * @default true
   */
  hoverable?: boolean

  /**
   * Loading state
   * @default false
   */
  loading?: boolean

  /**
   * Locale configuration for table text.
   */
  locale?: TigerLocaleInput

  /**
   * Flat table text overrides for this instance.
   */
  labels?: Partial<TigerLocaleTable>

  /**
   * Empty state text
   * @default 'No data'
   */
  emptyText?: string

  /**
   * Pagination configuration
   * Set to false to disable pagination
   */
  pagination?: PaginationConfig | false

  /**
   * Row selection configuration
   */
  rowSelection?: RowSelectionConfig<T>

  /**
   * Row expansion configuration.
   * Adds an expand toggle column and renders expanded content below each row.
   */
  expandable?: ExpandableConfig<T>

  /**
   * Function to get row key
   * @default (record) => record.id
   */
  rowKey?: string | ((record: T) => string | number)

  /**
   * Custom row class name
   */
  rowClassName?: string | ((record: T, index: number) => string)

  /**
   * Whether table head is sticky
   * @default false
   */
  stickyHeader?: boolean

  /**
   * Max height for scrollable table
   */
  maxHeight?: string | number

  /**
   * Table layout algorithm
   * @default 'auto'
   */
  tableLayout?: 'auto' | 'fixed'

  /**
   * Mobile layout below the `cardBreakpoint` width (640px by default).
   * `scroll` keeps the table horizontally scrollable; `card` renders each row
   * as a stacked card list.
   * @default 'scroll'
   */
  responsiveMode?: TableResponsiveMode

  /**
   * Viewport breakpoint below which `responsiveMode="card"` activates.
   * `sm` = 640px, `md` = 768px, `lg` = 1024px.
   * @default 'sm'
   */
  cardBreakpoint?: TableCardBreakpoint

  /**
   * Additional class for mobile card rows, or a resolver per record.
   */
  cardClassName?: string | ((record: T, index: number) => string)

  /**
   * Custom mobile card renderer for `responsiveMode="card"`.
   */
  renderCard?: (context: TableCardRenderContext<T>) => unknown

  /**
   * Dedicated layout definitions for card grid mode.
   */
  cardLayout?: TableCardLayoutItem[]

  /**
   * Position of row selection controls in default card rendering.
   * @default 'controls-row'
   */
  cardSelectionPosition?: TableCardSelectionPosition

  /**
   * Padding class for default card containers. Set to false to remove the
   * built-in padding.
   * @default 'p-3'
   */
  cardPadding?: string | false

  /**
   * Gap utility class applied between fields in the default `cardLayout` grid.
   * Provide a full Tailwind gap class (e.g. `'gap-2'`, `'gap-y-4'`) since the
   * class string must be statically present for the JIT compiler.
   * @default 'gap-3'
   */
  cardFieldGap?: string

  // --- v0.6.0 additions ---

  /**
   * Enable virtual scrolling for large datasets
   * @default false
   */
  virtual?: boolean

  /**
   * Automatically enable Table's virtual scroll container for very large data sets.
   * @default true
   */
  autoVirtual?: boolean

  /**
   * Virtual scroll viewport height (px)
   * @default 400
   */
  virtualHeight?: number

  /**
   * Virtual scroll row height (px)
   * @default 40
   */
  virtualItemHeight?: number

  /**
   * Row count at which Table enables virtual mode automatically when `autoVirtual` is true.
   * @default 10000
   */
  autoVirtualThreshold?: number

  /**
   * Row count at which Table marks virtual rendering as recommended.
   * Table does not enable virtualization automatically; use this signal to
   * switch to `virtual` or the dedicated `VirtualTable` component.
   * @default 1000
   */
  virtualThreshold?: number

  /**
   * Enable cell editing
   * @default false
   */
  editable?: boolean

  /**
   * Set of editable cells: Map<columnKey, Set<rowIndex>>
   * If not provided and editable=true, all cells are editable
   */
  editableCells?: Map<string, Set<number>>

  /**
   * Filter mode
   * @default 'basic'
   */
  filterMode?: 'basic' | 'advanced'

  /**
   * Advanced filter rules (used when filterMode='advanced')
   */
  advancedFilterRules?: FilterRule[]

  /**
   * Enable column drag reorder
   * @default false
   */
  columnDraggable?: boolean

  /**
   * Enable row drag reorder.
   * @default false
   */
  rowDraggable?: boolean

  /**
   * Summary row configuration
   */
  summaryRow?: { show: boolean; data: Record<string, unknown> }

  /**
   * Group rows by column key
   */
  groupBy?: string

  /**
   * Enable table export
   * @default false
   */
  exportable?: boolean

  /**
   * Export format.
   * @default 'csv'
   */
  exportFormat?: TableExportFormat

  /**
   * Export filename (without extension)
   * @default 'export'
   */
  exportFilename?: string
}

/**
 * Filter rule for advanced filtering
 */
export interface FilterRule {
  column: string
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between' | 'notEquals'
  value: unknown
  valueTo?: unknown // for 'between' operator
  logic?: 'and' | 'or'
}
