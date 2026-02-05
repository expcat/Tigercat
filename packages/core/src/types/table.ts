/**
 * Table component types and interfaces
 */

/**
 * Table size types
 */
export type TableSize = 'sm' | 'md' | 'lg'

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
  fixed?: 'left' | 'right' | false

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
   * CSS class for header cell
   */
  headerClassName?: string
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
  pageSizeOptions?: number[]

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
 * Base table props interface
 */
export interface TableProps<T = Record<string, unknown>> {
  /**
   * Table columns configuration
   */
  columns: TableColumn<T>[]

  /**
   * Whether to show a lock button in each column header.
   * Clicking the lock toggles the column fixed state.
   * @default false
   */
  columnLockable?: boolean

  /**
   * Table data source
   * @default []
   */
  dataSource?: T[]

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
}
