import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_TABLE_SORT,
  EMPTY_TABLE_FILTER_RULES,
  EMPTY_TABLE_FILTERS,
  EMPTY_TABLE_HIDDEN_KEYS,
  EMPTY_TABLE_RECORDS,
  applyTableColumnOrder,
  commitTableCellEdit,
  downloadTableExport,
  exportTableData,
  freezeTableColumnWidths,
  getNextTableColumnFixed,
  getNextTableExpandKeys,
  getNextTableSelectAllKeys,
  getNextTableSelectRowKeys,
  getNextTableSortState,
  mergeTableFilterValue,
  mergeTablePagination,
  reorderTableColumnsByKey,
  reorderTableRowsByKey,
  resolveTableKeyList,
  resolveTableRecordKey,
  resolveTableView,
  shouldWarnControlledPageReset,
  type FilterRule,
  type PaginationConfig,
  type SortState,
  type TableColumn,
  type TableExportFormat,
  type TableFixedPosition,
  type ExpandableConfig,
  type RowSelectionConfig
} from '@expcat/tigercat-core'
import { devWarn } from '@expcat/tigercat-core'
import type { TableContext, TableProps } from './types'

/**
 * Inputs consumed by the Table state hook. Mirrors the props that influence
 * derived data + handlers but excludes pure render-only props.
 */
export interface UseTableStateInput {
  columns: TableProps['columns']
  dataSource?: Record<string, unknown>[]
  hiddenColumnKeys?: string[]
  defaultHiddenColumnKeys?: string[]
  sort?: SortState
  defaultSort?: SortState
  filters?: Record<string, unknown>
  defaultFilters?: Record<string, unknown>
  pagination: PaginationConfig | false | undefined
  rowSelection?: RowSelectionConfig
  expandable?: ExpandableConfig
  rowKey: string | ((record: Record<string, unknown>) => string | number)
  editable: boolean
  editableCells?: Record<string, number[]>
  filterMode: 'basic' | 'advanced'
  advancedFilterRules?: FilterRule[]
  groupBy?: string
  exportFormat?: TableExportFormat
  exportFilename: string
  measuredColumnWidths?: Record<string, number>
  containerWidth?: number

  onChange?: TableProps['onChange']
  onRowClick?: (record: Record<string, unknown>, index: number) => void
  onSelectionChange?: TableProps['onSelectionChange']
  onSortChange?: TableProps['onSortChange']
  onFilterChange?: TableProps['onFilterChange']
  onHiddenColumnKeysChange?: TableProps['onHiddenColumnKeysChange']
  onPageChange?: TableProps['onPageChange']
  onExpandChange?: TableProps['onExpandChange']
  onCellChange?: TableProps['onCellChange']
  onColumnOrderChange?: (columns: TableColumn[]) => void
  onColumnFixedChange?: TableProps['onColumnFixedChange']
  onRowOrderChange?: (rows: Record<string, unknown>[]) => void
  onExport?: TableProps['onExport']
}

export function useTableState(input: UseTableStateInput): TableContext {
  const {
    columns,
    dataSource,
    hiddenColumnKeys,
    defaultHiddenColumnKeys,
    sort,
    defaultSort,
    filters,
    defaultFilters,
    pagination,
    rowSelection,
    expandable,
    rowKey,
    editable,
    editableCells,
    filterMode,
    advancedFilterRules,
    groupBy,
    exportFilename,
    measuredColumnWidths,
    containerWidth,
    onChange,
    onRowClick,
    onSelectionChange,
    onSortChange,
    onFilterChange,
    onHiddenColumnKeysChange,
    onPageChange,
    onExpandChange,
    onCellChange,
    onColumnOrderChange,
    onColumnFixedChange,
    onRowOrderChange,
    onExport
  } = input

  const sourceData = dataSource ?? EMPTY_TABLE_RECORDS
  const [internalData, setInternalData] = useState<Record<string, unknown>[] | null>(null)
  const prevSourceData = useRef(sourceData)
  if (prevSourceData.current !== sourceData) {
    prevSourceData.current = sourceData
    if (internalData !== null) {
      setInternalData(null)
    }
  }
  const effectiveData = internalData ?? sourceData

  const isSortControlled = sort !== undefined
  const isFiltersControlled = filters !== undefined
  const isHiddenColumnsControlled = hiddenColumnKeys !== undefined

  const paginationMerged = mergeTablePagination(pagination)
  const paginationConfig: PaginationConfig | null =
    paginationMerged === false ? null : paginationMerged
  const isCurrentPageControlled = paginationConfig?.current !== undefined
  const isPageSizeControlled = paginationConfig?.pageSize !== undefined

  const selectionControl = resolveTableKeyList(
    rowSelection?.selectedRowKeys,
    'rowSelection.selectedRowKeys'
  )
  const expandControl = resolveTableKeyList(
    expandable?.expandedRowKeys,
    'expandable.expandedRowKeys'
  )

  const [uncontrolledSortState, setUncontrolledSortState] = useState<SortState>(
    defaultSort ?? DEFAULT_TABLE_SORT
  )
  const [uncontrolledHiddenColumnKeys, setUncontrolledHiddenColumnKeys] = useState<string[]>(
    defaultHiddenColumnKeys ?? hiddenColumnKeys ?? EMPTY_TABLE_HIDDEN_KEYS
  )
  const [uncontrolledFilterState, setUncontrolledFilterState] = useState<Record<string, unknown>>(
    defaultFilters ?? EMPTY_TABLE_FILTERS
  )
  const [uncontrolledCurrentPage, setUncontrolledCurrentPage] = useState(
    () => paginationConfig?.defaultCurrent ?? paginationConfig?.current ?? 1
  )
  const [uncontrolledCurrentPageSize, setUncontrolledCurrentPageSize] = useState(
    () => paginationConfig?.defaultPageSize ?? paginationConfig?.pageSize ?? 10
  )
  const [uncontrolledSelectedRowKeys, setUncontrolledSelectedRowKeys] = useState<
    (string | number)[]
  >(rowSelection?.defaultSelectedRowKeys ?? [])
  const [uncontrolledExpandedRowKeys, setUncontrolledExpandedRowKeys] = useState<
    (string | number)[]
  >(expandable?.defaultExpandedRowKeys ?? [])
  const [columnOrder, setColumnOrder] = useState<string[] | null>(null)
  const [fixedOverrides, setFixedOverrides] = useState<Record<string, TableFixedPosition | false>>(
    {}
  )

  const sortState = isSortControlled ? (sort as SortState) : uncontrolledSortState
  const effectiveHiddenColumnKeys = isHiddenColumnsControlled
    ? (hiddenColumnKeys as string[])
    : uncontrolledHiddenColumnKeys
  const filterState = isFiltersControlled
    ? (filters as Record<string, unknown>)
    : uncontrolledFilterState
  const currentPage = isCurrentPageControlled
    ? (paginationConfig!.current as number)
    : uncontrolledCurrentPage
  const currentPageSize = isPageSizeControlled
    ? (paginationConfig!.pageSize as number)
    : uncontrolledCurrentPageSize
  const selectedRowKeys = selectionControl.controlled
    ? selectionControl.keys
    : uncontrolledSelectedRowKeys
  const expandedRowKeys = expandControl.controlled
    ? expandControl.keys
    : uncontrolledExpandedRowKeys

  const prevColumnKeys = useRef(columns.map((column) => column.key).join('\0'))
  const columnKeysSignature = columns.map((column) => column.key).join('\0')
  if (prevColumnKeys.current !== columnKeysSignature) {
    prevColumnKeys.current = columnKeysSignature
    if (columnOrder !== null) {
      setColumnOrder(null)
    }
  }

  const view = useMemo(
    () =>
      resolveTableView({
        columns,
        dataSource: effectiveData,
        hiddenColumnKeys: effectiveHiddenColumnKeys,
        columnOrder: columnOrder ?? undefined,
        fixedOverrides,
        filters: filterState,
        sort: sortState,
        filterMode,
        advancedFilterRules: advancedFilterRules ?? EMPTY_TABLE_FILTER_RULES,
        groupBy,
        pagination: paginationMerged,
        currentPage,
        currentPageSize,
        rowKey,
        getRowKey: rowSelection?.getRowKey,
        rowSelection,
        expandable,
        selectedRowKeys,
        measuredColumnWidths,
        containerWidth
      }),
    [
      columns,
      effectiveData,
      effectiveHiddenColumnKeys,
      columnOrder,
      fixedOverrides,
      filterState,
      sortState,
      filterMode,
      advancedFilterRules,
      groupBy,
      paginationMerged,
      currentPage,
      currentPageSize,
      rowKey,
      rowSelection,
      expandable,
      selectedRowKeys,
      measuredColumnWidths,
      containerWidth
    ]
  )

  const selectedRowKeySet = useMemo(
    () => new Set<string | number>(selectedRowKeys),
    [selectedRowKeys]
  )
  const expandedRowKeySet = useMemo(
    () => new Set<string | number>(expandedRowKeys),
    [expandedRowKeys]
  )

  const [frozenColumnWidths, setFrozenColumnWidths] = useState<Record<string, number>>({})

  useEffect(() => {
    setFrozenColumnWidths((prev) =>
      freezeTableColumnWidths(view.displayColumns, measuredColumnWidths ?? {}, prev)
    )
  }, [view.displayColumns, measuredColumnWidths])

  function emitChange(next: {
    sort?: SortState
    filters?: Record<string, unknown>
    pagination?: { current: number; pageSize: number } | null
  }) {
    onChange?.({
      sort: next.sort ?? sortState,
      filters: next.filters ?? filterState,
      pagination:
        next.pagination !== undefined
          ? next.pagination
          : paginationMerged !== false
            ? { current: currentPage, pageSize: currentPageSize }
            : null
    })
  }

  function handleSetHiddenColumns(hiddenKeys: string[]) {
    if (!isHiddenColumnsControlled) {
      setUncontrolledHiddenColumnKeys(hiddenKeys)
    }
    onHiddenColumnKeysChange?.(hiddenKeys)
  }

  function toggleColumnLock(columnKey: string) {
    const original = columns.find((column) => column.key === columnKey)?.fixed
    const current = Object.prototype.hasOwnProperty.call(fixedOverrides, columnKey)
      ? fixedOverrides[columnKey]
      : original
    const nextFixed = getNextTableColumnFixed(current, original)
    const nextOverrides = { ...fixedOverrides, [columnKey]: nextFixed }
    setFixedOverrides(nextOverrides)
    const fullColumns = applyTableColumnOrder(columns, columnOrder ?? undefined).map((column) =>
      column.key === columnKey ? { ...column, fixed: nextFixed } : column
    )
    onColumnFixedChange?.(columnKey, nextFixed, fullColumns)
  }

  function handleSetSort(newSortState: SortState) {
    if (!isSortControlled) {
      setUncontrolledSortState(newSortState)
    }
    onSortChange?.(newSortState)
    emitChange({ sort: newSortState })
  }

  function handleSort(columnKey: string) {
    const column = view.displayColumns.find((item) => item.key === columnKey)
    if (!column || !column.sortable) return
    handleSetSort(getNextTableSortState(sortState, columnKey))
  }

  function handleFilter(columnKey: string, value: unknown) {
    const newFilterState = mergeTableFilterValue(filterState, columnKey, value)
    if (!isFiltersControlled) {
      setUncontrolledFilterState(newFilterState)
    }
    if (!isCurrentPageControlled) {
      setUncontrolledCurrentPage(1)
    } else if (shouldWarnControlledPageReset(true, currentPage)) {
      devWarn(
        'Table.filter.page',
        'Table filter reset pagination.current to 1; the controlled current page was not written back'
      )
    }
    onFilterChange?.(newFilterState)
    if (paginationMerged !== false) {
      onPageChange?.({ current: 1, pageSize: currentPageSize })
    }
    emitChange({
      filters: newFilterState,
      pagination: paginationMerged !== false ? { current: 1, pageSize: currentPageSize } : null
    })
  }

  function handlePageChange(page: number) {
    if (!isCurrentPageControlled) {
      setUncontrolledCurrentPage(page)
    }
    onPageChange?.({ current: page, pageSize: currentPageSize })
    emitChange({ pagination: { current: page, pageSize: currentPageSize } })
  }

  function handlePageSizeChange(pageSize: number) {
    if (!isPageSizeControlled) {
      setUncontrolledCurrentPageSize(pageSize)
    }
    if (!isCurrentPageControlled) {
      setUncontrolledCurrentPage(1)
    }
    onPageChange?.({ current: 1, pageSize })
    emitChange({ pagination: { current: 1, pageSize } })
  }

  function handleToggleExpand(key: string | number, record: Record<string, unknown>) {
    const next = getNextTableExpandKeys(expandedRowKeys, key)
    if (!expandControl.controlled) {
      setUncontrolledExpandedRowKeys(next.keys)
    }
    onExpandChange?.(next.keys, record, next.expanded)
  }

  function handleRowClick(record: Record<string, unknown>, index: number, key: string | number) {
    onRowClick?.(record, index)
    if (expandable?.expandRowByClick) {
      const isExpandableRow = expandable?.rowExpandable ? expandable.rowExpandable(record) : true
      if (isExpandableRow) {
        handleToggleExpand(key, record)
      }
    }
  }

  function handleSelectRow(key: string | number, checked: boolean) {
    const newKeys = getNextTableSelectRowKeys({
      selectedRowKeys,
      key,
      checked,
      type: rowSelection?.type
    })
    if (!selectionControl.controlled) {
      setUncontrolledSelectedRowKeys(newKeys)
    }
    onSelectionChange?.(newKeys)
  }

  function handleSelectAll(checked: boolean) {
    const newKeys = getNextTableSelectAllKeys(selectedRowKeys, view.selectableRowKeys, checked)
    if (!selectionControl.controlled) {
      setUncontrolledSelectedRowKeys(newKeys)
    }
    onSelectionChange?.(newKeys)
  }

  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(
    null
  )
  const [editingValue, setEditingValue] = useState('')

  function isCellEditable(columnKey: string, rowIndex: number): boolean {
    if (!editable) return false
    if (!editableCells) return true
    return editableCells[columnKey]?.includes(rowIndex) === true
  }

  function startEditing(rowIndex: number, columnKey: string, currentValue: unknown) {
    setEditingCell({ rowIndex, columnKey })
    setEditingValue(String(currentValue ?? ''))
  }

  function commitEdit() {
    if (!editingCell) return
    const column = columns.find((item) => item.key === editingCell.columnKey)
    const nextData = commitTableCellEdit(effectiveData, editingCell.rowIndex, column, editingValue)
    setInternalData(nextData)
    onCellChange?.(editingCell.rowIndex, editingCell.columnKey, editingValue)
    setEditingCell(null)
  }

  function cancelEdit() {
    setEditingCell(null)
  }

  function handleExport() {
    const content = exportTableData(view.displayColumns, view.processedData)
    downloadTableExport(content, exportFilename)
    onExport?.(content)
  }

  const [dragColumnKey, setDragColumnKey] = useState<string | null>(null)

  function handleDragStart(columnKey: string) {
    setDragColumnKey(columnKey)
  }

  function handleDrop(targetKey: string) {
    if (!dragColumnKey || dragColumnKey === targetKey) return
    const fullColumns = applyTableColumnOrder(columns, columnOrder ?? undefined)
    const nextColumns = reorderTableColumnsByKey(fullColumns, dragColumnKey, targetKey)
    setColumnOrder(nextColumns.map((column) => column.key))
    onColumnOrderChange?.(nextColumns)
    setDragColumnKey(null)
  }

  const [dragRowKey, setDragRowKey] = useState<string | number | null>(null)

  function handleRowDragStart(rowKeyValue: string | number) {
    setDragRowKey(rowKeyValue)
  }

  function handleRowDrop(targetKey: string | number) {
    if (dragRowKey === null || dragRowKey === targetKey) return
    const nextRows = reorderTableRowsByKey(
      effectiveData,
      dragRowKey,
      targetKey,
      (record, sourceIndex) =>
        resolveTableRecordKey(record, sourceIndex, rowKey, rowSelection?.getRowKey)
    )
    setInternalData(nextRows)
    onRowOrderChange?.(nextRows)
    setDragRowKey(null)
  }

  return {
    paginationConfig: view.paginationConfig ?? paginationConfig,
    displayColumns: view.displayColumns,
    fixedColumnsInfo: view.fixedColumnsInfo,
    frozenColumnWidths,
    processedData: view.processedData,
    paginatedData: view.paginatedData,
    pageRowKeys: view.pageRowKeys,
    pageSourceIndices: view.pageSourceIndices,
    selectedRowKeySet,
    expandedRowKeySet,
    totalColumnCount: view.totalColumnCount,
    paginationInfo: view.paginationInfo,
    allSelected: view.allSelected,
    someSelected: view.someSelected,
    groupedData: view.groupedData,
    sortState,
    filterState,
    currentPage,
    currentPageSize,
    hiddenColumnKeys: effectiveHiddenColumnKeys,
    editingCell,
    editingValue,
    setEditingValue,
    toggleColumnLock,
    handleSetHiddenColumns,
    handleSort,
    handleFilter,
    handlePageChange,
    handlePageSizeChange,
    handleSetSort,
    handleRowClick,
    handleToggleExpand,
    handleSelectRow,
    handleSelectAll,
    isCellEditable,
    startEditing,
    commitEdit,
    cancelEdit,
    handleExport,
    handleDragStart,
    handleDrop,
    handleRowDragStart,
    handleRowDrop
  }
}
