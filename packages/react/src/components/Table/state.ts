import { useEffect, useMemo, useState } from 'react'
import {
  sortData,
  filterTableData,
  paginateData,
  calculatePagination,
  createTableRowKeyCache,
  filterDataAdvanced,
  groupDataByColumn,
  getFixedColumnOffsets,
  freezeTableColumnWidths,
  filterHiddenColumns,
  orderTableFixedColumns,
  getNextTableSelectAllKeys,
  getTableSelectionState,
  hasTableSelectionColumn,
  type SortState,
  type PaginationConfig,
  type TableColumn,
  type FilterRule,
  type RowSelectionConfig,
  type ExpandableConfig
} from '@expcat/tigercat-core'
import { exportTableData, downloadTableExport, type TableExportFormat } from '@expcat/tigercat-core'
import type { TableContext, TableProps } from './types'

/**
 * Inputs consumed by the Table state hook. Mirrors the props that influence
 * derived data + handlers but excludes pure render-only props (className, size,
 * etc.) that the render-* modules read directly from props.
 */
export interface UseTableStateInput {
  columns: TableProps['columns']
  dataSource: Record<string, unknown>[]
  hiddenColumnKeys?: string[]
  defaultHiddenColumnKeys?: string[]
  sort?: SortState
  defaultSort?: SortState
  filters?: Record<string, unknown>
  defaultFilters?: Record<string, unknown>
  pagination: PaginationConfig | false
  rowSelection?: RowSelectionConfig
  expandable?: ExpandableConfig
  rowKey: string | ((record: Record<string, unknown>) => string | number)
  editable: boolean
  editableCells?: Map<string, Set<number>>
  filterMode: 'basic' | 'advanced'
  advancedFilterRules: FilterRule[]
  groupBy?: string
  exportFormat: TableExportFormat
  exportFilename: string
  measuredColumnWidths?: Record<string, number>

  // event callbacks
  onChange?: TableProps['onChange']
  onRowClick?: (record: Record<string, unknown>, index: number) => void
  onSelectionChange?: TableProps['onSelectionChange']
  onSortChange?: TableProps['onSortChange']
  onFilterChange?: TableProps['onFilterChange']
  onHiddenColumnKeysChange?: TableProps['onHiddenColumnKeysChange']
  onPageChange?: TableProps['onPageChange']
  onExpandChange?: (
    expandedKeys: (string | number)[],
    record: Record<string, unknown>,
    expanded: boolean
  ) => void
  onCellChange?: TableProps['onCellChange']
  onColumnOrderChange?: (columns: TableColumn[]) => void
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
    exportFormat,
    exportFilename,
    measuredColumnWidths,
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
    onRowOrderChange,
    onExport
  } = input

  const isSortControlled = sort !== undefined
  const isFiltersControlled = filters !== undefined
  const isHiddenColumnsControlled = hiddenColumnKeys !== undefined

  const paginationConfig: PaginationConfig | null =
    pagination !== false && typeof pagination === 'object' ? pagination : null
  const isCurrentPageControlled = paginationConfig?.current !== undefined
  const isPageSizeControlled = paginationConfig?.pageSize !== undefined

  const isSelectionControlled =
    rowSelection?.selectedRowKeys !== undefined && Array.isArray(rowSelection.selectedRowKeys)

  const isExpandControlled =
    expandable?.expandedRowKeys !== undefined && Array.isArray(expandable.expandedRowKeys)

  const [uncontrolledSortState, setUncontrolledSortState] = useState<SortState>(
    defaultSort ?? { key: null, direction: null }
  )

  const [uncontrolledHiddenColumnKeys, setUncontrolledHiddenColumnKeys] = useState<string[]>(
    defaultHiddenColumnKeys ?? hiddenColumnKeys ?? []
  )

  const [uncontrolledFilterState, setUncontrolledFilterState] = useState<Record<string, unknown>>(
    defaultFilters ?? {}
  )

  const [uncontrolledCurrentPage, setUncontrolledCurrentPage] = useState(
    () => paginationConfig?.defaultCurrent ?? paginationConfig?.current ?? 1
  )

  const [uncontrolledCurrentPageSize, setUncontrolledCurrentPageSize] = useState(
    () => paginationConfig?.defaultPageSize ?? paginationConfig?.pageSize ?? 10
  )

  const [uncontrolledSelectedRowKeys, setUncontrolledSelectedRowKeys] = useState<
    (string | number)[]
  >(rowSelection?.defaultSelectedRowKeys ?? rowSelection?.selectedRowKeys ?? [])

  const [uncontrolledExpandedRowKeys, setUncontrolledExpandedRowKeys] = useState<
    (string | number)[]
  >(expandable?.defaultExpandedRowKeys ?? expandable?.expandedRowKeys ?? [])

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
  const selectedRowKeys = isSelectionControlled
    ? (rowSelection!.selectedRowKeys as (string | number)[])
    : uncontrolledSelectedRowKeys
  const expandedRowKeys = isExpandControlled
    ? (expandable!.expandedRowKeys as (string | number)[])
    : uncontrolledExpandedRowKeys

  useEffect(() => {
    if (isSortControlled && sort) {
      setUncontrolledSortState(sort)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSortControlled, sort?.key, sort?.direction])

  useEffect(() => {
    if (isFiltersControlled && filters) {
      setUncontrolledFilterState(filters)
    }
  }, [isFiltersControlled, filters])

  useEffect(() => {
    if (isCurrentPageControlled) {
      setUncontrolledCurrentPage(paginationConfig!.current as number)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentPageControlled, paginationConfig?.current])

  useEffect(() => {
    if (isPageSizeControlled) {
      setUncontrolledCurrentPageSize(paginationConfig!.pageSize as number)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPageSizeControlled, paginationConfig?.pageSize])

  useEffect(() => {
    if (isSelectionControlled) {
      setUncontrolledSelectedRowKeys((rowSelection?.selectedRowKeys as (string | number)[]) ?? [])
    }
  }, [isSelectionControlled, rowSelection?.selectedRowKeys])

  useEffect(() => {
    if (isHiddenColumnsControlled && hiddenColumnKeys) {
      setUncontrolledHiddenColumnKeys(hiddenColumnKeys)
    }
  }, [isHiddenColumnsControlled, hiddenColumnKeys])

  useEffect(() => {
    if (isExpandControlled) {
      setUncontrolledExpandedRowKeys((expandable?.expandedRowKeys as (string | number)[]) ?? [])
    }
  }, [isExpandControlled, expandable?.expandedRowKeys])

  const [fixedOverrides, setFixedOverrides] = useState<Record<string, 'left' | 'right' | false>>({})

  const displayColumns = useMemo<TableColumn[]>(() => {
    const mapped = columns.map((column) => {
      const hasOverride = Object.prototype.hasOwnProperty.call(fixedOverrides, column.key)
      return {
        ...column,
        fixed: hasOverride ? fixedOverrides[column.key] : column.fixed
      }
    })
    return orderTableFixedColumns(filterHiddenColumns(mapped, effectiveHiddenColumnKeys))
  }, [columns, fixedOverrides, effectiveHiddenColumnKeys])

  const totalColumnCount = useMemo(() => {
    let count = displayColumns.length
    if (hasTableSelectionColumn(rowSelection)) count++
    if (expandable) count++
    return count
  }, [displayColumns.length, rowSelection, expandable])

  const columnByKey = useMemo(() => {
    const map: Record<string, TableColumn> = {}
    for (const column of displayColumns) {
      map[column.key] = column
    }
    return map
  }, [displayColumns])

  const fixedColumnsInfo = useMemo(
    () => getFixedColumnOffsets(displayColumns, measuredColumnWidths),
    [displayColumns, measuredColumnWidths]
  )

  // Freeze each auto-sized column's first measured width so the `<colgroup>` can
  // pin it — keeps lock toggling from reflowing column widths.
  const [frozenColumnWidths, setFrozenColumnWidths] = useState<Record<string, number>>({})

  useEffect(() => {
    setFrozenColumnWidths((prev) =>
      freezeTableColumnWidths(displayColumns, measuredColumnWidths ?? {}, prev)
    )
  }, [displayColumns, measuredColumnWidths])

  function handleSetHiddenColumns(hiddenKeys: string[]) {
    if (!isHiddenColumnsControlled) {
      setUncontrolledHiddenColumnKeys(hiddenKeys)
    }
    onHiddenColumnKeysChange?.(hiddenKeys)
  }

  function toggleColumnLock(columnKey: string) {
    setFixedOverrides((prev) => {
      const original = columns.find((c) => c.key === columnKey)?.fixed
      const current = Object.prototype.hasOwnProperty.call(prev, columnKey)
        ? prev[columnKey]
        : original
      const isLocked = current === 'left' || current === 'right'
      return {
        ...prev,
        [columnKey]: isLocked ? false : 'left'
      }
    })
  }

  const processedData = useMemo(() => {
    let data = dataSource
    if (filterMode === 'advanced' && advancedFilterRules.length > 0) {
      data = filterDataAdvanced(data, advancedFilterRules)
    } else {
      data = filterTableData(data, columns, filterState)
    }
    if (sortState.key && sortState.direction) {
      const column = columnByKey[sortState.key]
      data = sortData(data, sortState.key, sortState.direction, column?.sortFn)
    }
    return data
  }, [dataSource, columns, filterState, sortState, columnByKey, filterMode, advancedFilterRules])

  const paginatedData = useMemo(() => {
    if (pagination === false) {
      return processedData
    }
    // Remote mode: dataSource already holds only the current page — no slicing.
    if (paginationConfig?.remote) {
      return processedData
    }
    return paginateData(processedData, currentPage, currentPageSize)
  }, [processedData, currentPage, currentPageSize, pagination, paginationConfig?.remote])

  const pageRowKeys = useMemo(
    () => createTableRowKeyCache<Record<string, unknown>>(rowKey).getMany(paginatedData),
    [paginatedData, rowKey]
  )

  const selectedRowKeySet = useMemo(
    () => new Set<string | number>(selectedRowKeys),
    [selectedRowKeys]
  )

  const expandedRowKeySet = useMemo(
    () => new Set<string | number>(expandedRowKeys),
    [expandedRowKeys]
  )

  const paginationInfo = useMemo(() => {
    if (pagination === false) {
      return null
    }
    const total =
      paginationConfig?.total !== undefined && paginationConfig.total > 0
        ? paginationConfig.total
        : processedData.length
    return calculatePagination(total, currentPage, currentPageSize)
  }, [processedData.length, currentPage, currentPageSize, pagination, paginationConfig?.total])

  function handleSetSort(newSortState: SortState) {
    if (!isSortControlled) {
      setUncontrolledSortState(newSortState)
    }
    onSortChange?.(newSortState)
    onChange?.({
      sort: newSortState,
      filters: filterState,
      pagination: pagination !== false ? { current: currentPage, pageSize: currentPageSize } : null
    })
  }

  function handleSort(columnKey: string) {
    const column = columnByKey[columnKey]
    if (!column || !column.sortable) return

    let newDirection: 'asc' | 'desc' | null = 'asc'
    if (sortState.key === columnKey) {
      if (sortState.direction === 'asc') {
        newDirection = 'desc'
      } else if (sortState.direction === 'desc') {
        newDirection = null
      }
    }

    handleSetSort({
      key: newDirection ? columnKey : null,
      direction: newDirection
    })
  }

  function handleFilter(columnKey: string, value: unknown) {
    const newFilterState = { ...filterState, [columnKey]: value }
    if (!isFiltersControlled) {
      setUncontrolledFilterState(newFilterState)
    }
    setUncontrolledCurrentPage(1)
    onFilterChange?.(newFilterState)
    onChange?.({
      sort: sortState,
      filters: newFilterState,
      pagination: pagination !== false ? { current: 1, pageSize: currentPageSize } : null
    })
  }

  function handlePageChange(page: number) {
    setUncontrolledCurrentPage(page)
    onPageChange?.({ current: page, pageSize: currentPageSize })
    onChange?.({
      sort: sortState,
      filters: filterState,
      pagination: { current: page, pageSize: currentPageSize }
    })
  }

  function handlePageSizeChange(pageSize: number) {
    setUncontrolledCurrentPageSize(pageSize)
    setUncontrolledCurrentPage(1)
    onPageChange?.({ current: 1, pageSize })
    onChange?.({
      sort: sortState,
      filters: filterState,
      pagination: { current: 1, pageSize }
    })
  }

  function handleToggleExpand(key: string | number, record: Record<string, unknown>) {
    const isExpanded = expandedRowKeySet.has(key)
    const newKeys = isExpanded
      ? expandedRowKeys.filter((k) => k !== key)
      : [...expandedRowKeys, key]
    if (!isExpandControlled) {
      setUncontrolledExpandedRowKeys(newKeys)
    }
    onExpandChange?.(newKeys, record, !isExpanded)
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
    let newKeys: (string | number)[]
    if (rowSelection?.type === 'radio') {
      newKeys = checked ? [key] : []
    } else {
      if (checked) {
        newKeys = [...selectedRowKeys, key]
      } else {
        newKeys = selectedRowKeys.filter((k) => k !== key)
      }
    }
    if (!isSelectionControlled) {
      setUncontrolledSelectedRowKeys(newKeys)
    }
    onSelectionChange?.(newKeys)
  }

  const selectionState = useMemo(
    () =>
      getTableSelectionState({
        records: paginatedData,
        rowKeys: pageRowKeys,
        selectedRowKeys,
        getCheckboxProps: rowSelection?.getCheckboxProps
      }),
    [paginatedData, pageRowKeys, selectedRowKeys, rowSelection]
  )

  function handleSelectAll(checked: boolean) {
    const newKeys = getNextTableSelectAllKeys(
      selectedRowKeys,
      selectionState.selectableRowKeys,
      checked
    )
    if (!isSelectionControlled) {
      setUncontrolledSelectedRowKeys(newKeys)
    }
    onSelectionChange?.(newKeys)
  }

  const allSelected = selectionState.allSelected
  const someSelected = selectionState.someSelected

  // editable cell state
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(
    null
  )
  const [editingValue, setEditingValue] = useState('')

  function isCellEditable(columnKey: string, rowIndex: number): boolean {
    if (!editable) return false
    if (!editableCells) return true
    return !!editableCells.get(columnKey)?.has(rowIndex)
  }

  function startEditing(rowIndex: number, columnKey: string, currentValue: unknown) {
    setEditingCell({ rowIndex, columnKey })
    setEditingValue(String(currentValue ?? ''))
  }

  function commitEdit() {
    if (editingCell) {
      onCellChange?.(editingCell.rowIndex, editingCell.columnKey, editingValue)
      setEditingCell(null)
    }
  }

  function cancelEdit() {
    setEditingCell(null)
  }

  function handleExport() {
    const content = exportTableData(displayColumns, processedData, exportFormat)
    downloadTableExport(content, exportFilename, exportFormat)
    onExport?.(content)
  }

  // column drag
  const [dragColumnKey, setDragColumnKey] = useState<string | null>(null)

  function handleDragStart(columnKey: string) {
    setDragColumnKey(columnKey)
  }

  function handleDrop(targetKey: string) {
    if (!dragColumnKey || dragColumnKey === targetKey) return
    const cols = [...displayColumns]
    const fromIdx = cols.findIndex((c) => c.key === dragColumnKey)
    const toIdx = cols.findIndex((c) => c.key === targetKey)
    if (fromIdx >= 0 && toIdx >= 0) {
      const [moved] = cols.splice(fromIdx, 1)
      cols.splice(toIdx, 0, moved)
      onColumnOrderChange?.(cols)
    }
    setDragColumnKey(null)
  }

  const [dragRowKey, setDragRowKey] = useState<string | number | null>(null)

  function handleRowDragStart(rowKeyValue: string | number) {
    setDragRowKey(rowKeyValue)
  }

  function handleRowDrop(targetKey: string | number) {
    if (dragRowKey === null || dragRowKey === targetKey) return
    const rows = [...paginatedData]
    const fromIdx = pageRowKeys.findIndex((key) => key === dragRowKey)
    const toIdx = pageRowKeys.findIndex((key) => key === targetKey)
    if (fromIdx >= 0 && toIdx >= 0) {
      const [moved] = rows.splice(fromIdx, 1)
      rows.splice(toIdx, 0, moved)
      onRowOrderChange?.(rows)
    }
    setDragRowKey(null)
  }

  // grouping
  const groupedData = useMemo(() => {
    if (!groupBy) return null
    return groupDataByColumn(paginatedData, groupBy)
  }, [groupBy, paginatedData])

  return {
    paginationConfig,
    displayColumns,
    fixedColumnsInfo,
    frozenColumnWidths,
    processedData,
    paginatedData,
    pageRowKeys,
    selectedRowKeySet,
    expandedRowKeySet,
    totalColumnCount,
    paginationInfo,
    allSelected,
    someSelected,
    groupedData,
    sortState,
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
