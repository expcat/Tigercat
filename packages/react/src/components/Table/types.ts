import type {
  TableProps as CoreTableProps,
  SortState,
  PaginationConfig,
  TableColumn,
  calculatePagination,
  getFixedColumnOffsets
} from '@expcat/tigercat-core'

/**
 * Public React Table prop interface — extends shared core contract with
 * React-style event callbacks and className support.
 */
export interface TableProps<T = Record<string, unknown>> extends CoreTableProps<T> {
  onChange?: (params: {
    sort: SortState
    filters: Record<string, unknown>
    pagination: { current: number; pageSize: number } | null
  }) => void
  onRowClick?: (record: T, index: number) => void
  onSelectionChange?: (selectedKeys: (string | number)[]) => void
  onSortChange?: (sort: SortState) => void
  onFilterChange?: (filters: Record<string, unknown>) => void
  onPageChange?: (page: { current: number; pageSize: number }) => void
  onExpandChange?: (expandedKeys: (string | number)[], record: T, expanded: boolean) => void
  onCellChange?: (rowIndex: number, columnKey: string, newValue: string) => void
  onColumnOrderChange?: (columns: CoreTableProps<T>['columns']) => void
  onExport?: (csv: string) => void
  className?: string
}

/**
 * Internal context returned by `useTableState` and consumed by render-* modules.
 *
 * Records are typed as `Record<string, unknown>` here for ergonomic state-hook
 * implementation; the public `TableProps<T>` API restores generic typing at
 * the wrapper level via narrow casts.
 */
export interface TableContext {
  // computed-equivalent values
  paginationConfig: PaginationConfig | null
  displayColumns: TableColumn[]
  fixedColumnsInfo: ReturnType<typeof getFixedColumnOffsets>
  processedData: Record<string, unknown>[]
  paginatedData: Record<string, unknown>[]
  pageRowKeys: (string | number)[]
  selectedRowKeySet: Set<string | number>
  expandedRowKeySet: Set<string | number>
  totalColumnCount: number
  paginationInfo: ReturnType<typeof calculatePagination> | null
  allSelected: boolean
  someSelected: boolean
  groupedData: Map<string, Record<string, unknown>[]> | null
  sortState: SortState
  currentPage: number
  currentPageSize: number

  // editable state
  editingCell: { rowIndex: number; columnKey: string } | null
  editingValue: string
  setEditingValue: (value: string) => void

  // handlers
  toggleColumnLock: (key: string) => void
  handleSort: (columnKey: string) => void
  handleFilter: (columnKey: string, value: unknown) => void
  handlePageChange: (page: number) => void
  handlePageSizeChange: (size: number) => void
  handleRowClick: (record: Record<string, unknown>, index: number, key: string | number) => void
  handleToggleExpand: (key: string | number, record: Record<string, unknown>) => void
  handleSelectRow: (key: string | number, checked: boolean) => void
  handleSelectAll: (checked: boolean) => void
  isCellEditable: (columnKey: string, rowIndex: number) => boolean
  startEditing: (rowIndex: number, columnKey: string, currentValue: unknown) => void
  commitEdit: () => void
  cancelEdit: () => void
  handleExport: () => void
  handleDragStart: (columnKey: string) => void
  handleDrop: (targetKey: string) => void
}
