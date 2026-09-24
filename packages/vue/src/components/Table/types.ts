import type { ComputedRef, ExtractPropTypes, Ref } from 'vue'
import type {
  TableColumn,
  TableGroupBlock,
  SortState,
  PaginationConfig,
  calculatePagination,
  getFixedColumnOffsets
} from '@expcat/tigercat-core'
import type { tableProps } from './props'

/** Resolved props (post-default) used inside Table internals. */
export type TableInternalProps = ExtractPropTypes<typeof tableProps>

/** Generic Vue emit signature used by Table sub-modules. */
export type TableEmitFn = (event: string, ...args: unknown[]) => void

/** Reactive context shared between state.ts and the render-* modules. */
export interface TableContext {
  // --- Computed: derived from props + uncontrolled refs ---
  paginationConfig: ComputedRef<PaginationConfig | null>
  displayColumns: ComputedRef<TableColumn[]>
  fixedColumnsInfo: ComputedRef<ReturnType<typeof getFixedColumnOffsets>>
  frozenColumnWidths: Ref<Record<string, number>>
  columnByKey: ComputedRef<Record<string, TableColumn>>
  processedData: ComputedRef<Record<string, unknown>[]>
  paginatedData: ComputedRef<Record<string, unknown>[]>
  paginatedRowKeys: ComputedRef<(string | number)[]>
  pageSourceIndices: ComputedRef<number[]>
  selectedRowKeySet: ComputedRef<Set<string>>
  expandedRowKeySet: ComputedRef<Set<string>>
  totalColumnCount: ComputedRef<number>
  paginationInfo: ComputedRef<ReturnType<typeof calculatePagination> | null>
  allSelected: ComputedRef<boolean>
  someSelected: ComputedRef<boolean>
  groupBlocks: ComputedRef<TableGroupBlock<Record<string, unknown>>[] | null>
  processedRowKeys: ComputedRef<(string | number)[]>
  sortState: ComputedRef<SortState>
  filterState: ComputedRef<Record<string, unknown>>
  currentPage: ComputedRef<number>
  currentPageSize: ComputedRef<number>
  hiddenColumnKeys: ComputedRef<string[]>
  selectedRowKeys: ComputedRef<(string | number)[]>
  expandedRowKeys: ComputedRef<(string | number)[]>

  // --- Local refs ---
  editingCell: Ref<{ rowIndex: number; columnKey: string } | null>
  editingValue: Ref<string>
  virtualScrollTop: Ref<number>

  // --- Handlers ---
  toggleColumnLock: (key: string) => void
  handleSetHiddenColumns: (hiddenKeys: string[]) => void
  handleSetSort: (sort: SortState) => void
  handleSort: (columnKey: string) => void
  handleFilter: (columnKey: string, value: unknown) => void
  handlePageChange: (page: number) => void
  handlePageSizeChange: (size: number) => void
  handleRowClick: (record: Record<string, unknown>, index: number, key: string | number) => void
  handleToggleExpand: (key: string | number, record: Record<string, unknown>) => void
  handleSelectRow: (key: string | number, checked: boolean) => void
  handleSelectAll: (checked: boolean) => void
  handleSelectLoaded: (checked?: boolean) => void
  isCellEditable: (columnKey: string, rowIndex: number) => boolean
  startEditing: (rowIndex: number, columnKey: string, currentValue: unknown) => void
  commitEdit: () => void
  cancelEdit: () => void
  handleExport: () => void
  handleDragStart: (columnKey: string) => void
  handleDrop: (targetKey: string) => void
  handleRowDragStart: (rowKey: string | number) => void
  handleRowDrop: (targetKey: string | number) => void
  applyMultiSort: (columnKey: string) => void
  applyColumnWidth: (key: string, width: number) => void
  toggleGroup: (key: string) => void
  replaceSelectedKeys: (keys: (string | number)[]) => void
  multiSort: Ref<{ key: string; direction: 'asc' | 'desc' }[] | undefined>
  widthMap: Ref<Record<string, number>>
  collapsedGroups: Ref<string[]>
  groupCollapseEnabled: ComputedRef<boolean>
  selectionLive: Ref<string>
  dragLive: Ref<string>
  previousSelectionCount: Ref<number | null>
}
