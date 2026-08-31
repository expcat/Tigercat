import type {
  TableProps as CoreTableProps,
  SortState,
  PaginationConfig,
  TableColumn,
  calculatePagination,
  getFixedColumnOffsets
} from '@expcat/tigercat-core'

/**
 * Public React Table prop interface — core contract plus className.
 */
export interface TableProps<T = Record<string, unknown>> extends CoreTableProps<T> {
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
  frozenColumnWidths: Record<string, number>
  processedData: Record<string, unknown>[]
  paginatedData: Record<string, unknown>[]
  pageRowKeys: (string | number)[]
  pageSourceIndices: number[]
  selectedRowKeySet: Set<string | number>
  expandedRowKeySet: Set<string | number>
  totalColumnCount: number
  paginationInfo: ReturnType<typeof calculatePagination> | null
  allSelected: boolean
  someSelected: boolean
  groupedData: Map<string, Record<string, unknown>[]> | null
  sortState: SortState
  filterState: Record<string, unknown>
  currentPage: number
  currentPageSize: number
  hiddenColumnKeys: string[]

  // editable state
  editingCell: { rowIndex: number; columnKey: string } | null
  editingValue: string
  setEditingValue: (value: string) => void

  // handlers
  toggleColumnLock: (key: string) => void
  handleSetHiddenColumns: (hiddenKeys: string[]) => void
  handleSort: (columnKey: string) => void
  handleFilter: (columnKey: string, value: unknown) => void
  handlePageChange: (page: number) => void
  handlePageSizeChange: (size: number) => void
  handleSetSort: (sort: SortState) => void
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
  handleRowDragStart: (rowKey: string | number) => void
  handleRowDrop: (targetKey: string | number) => void
}
