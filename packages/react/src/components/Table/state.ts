import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_TABLE_SORT,
  EMPTY_TABLE_FILTER_RULES,
  EMPTY_TABLE_FILTERS,
  EMPTY_TABLE_HIDDEN_KEYS,
  EMPTY_TABLE_RECORDS,
  applyTableColumnOrder,
  commitTableCellEdit,
  freezeTableColumnWidths,
  getNextTableColumnFixed,
  getNextTableExpandKeys,
  getNextTableSelectAllKeys,
  getNextTableSelectRowKeys,
  getNextTableSortState,
  mergeTableFilterValue,
  mergeTablePagination,
  commitValidatedCellEdit,
  dragMoveAnnouncement,
  nextMultiSort,
  reorderByHandle,
  resolveFormattedExportRows,
  toggleCollapsedKey,
  coerceTableEditValue,
  getTableCellValue,
  getTableSelectionState,
  resolveTableExportRecords,
  resolveTableKeyList,
  resolveTableQueryPage,
  resolveTableRowKeys,
  resolveTableSelectLoadedKeys,
  resolveTableView,
  shouldSkipTableLocalProcessing,
  tableRowKeyId,
  type FilterRule,
  type PaginationConfig,
  type SortState,
  type TableColumn,
  type TableExportScope,
  type TableFixedPosition,
  type ExpandableConfig,
  type RowSelectionConfig
} from '@expcat/tigercat-core'
import { downloadTableExport, exportTableData } from '@expcat/tigercat-core/utils/table-export'
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
  sorts?: { key: string; direction: 'asc' | 'desc' }[]
  columnWidths?: Record<string, number>
  collapsedGroupKeys?: string[]
  exportScope?: TableExportScope
  exportFilename: string
  columnOrder?: string[]
  columnFixed?: Record<string, TableFixedPosition | false>
  sortLocale?: string
  rowDraggable?: boolean
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
  onSelectLoaded?: () => void
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
    sorts,
    columnWidths,
    collapsedGroupKeys,
    exportScope = 'all',
    exportFilename,
    columnOrder: columnOrderProp,
    columnFixed: columnFixedProp,
    sortLocale,
    rowDraggable,
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
    onExport,
    onSelectLoaded
  } = input

  const sourceData = dataSource ?? EMPTY_TABLE_RECORDS

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
  const [multiSort, setMultiSort] = useState(sorts)
  const [widthMap, setWidthMap] = useState<Record<string, number>>(() => ({
    ...(columnWidths ?? {})
  }))
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>(() => [
    ...(collapsedGroupKeys ?? [])
  ])
  const [selectionLive, setSelectionLive] = useState('')
  const [dragLive, setDragLive] = useState('')
  const [previousSelectionCount, setPreviousSelectionCount] = useState<number | null>(null)
  useEffect(() => {
    setMultiSort(sorts)
  }, [sorts])
  useEffect(() => {
    if (columnWidths) setWidthMap({ ...columnWidths })
  }, [columnWidths])
  useEffect(() => {
    if (collapsedGroupKeys) setCollapsedGroups([...collapsedGroupKeys])
  }, [collapsedGroupKeys])
  const groupCollapseEnabled = collapsedGroupKeys !== undefined
  const [columnOrder, setColumnOrder] = useState<string[] | null>(null)
  const [fixedOverrides, setFixedOverrides] = useState<Record<string, TableFixedPosition | false>>(
    {}
  )
  const isColumnOrderControlled = columnOrderProp !== undefined
  const isColumnFixedControlled = columnFixedProp !== undefined

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
    if (!isColumnOrderControlled && columnOrder !== null) {
      setColumnOrder(null)
    }
  }

  const parentFixedRef = useRef<Record<string, TableFixedPosition | false | undefined>>({})
  if (!isColumnFixedControlled) {
    const dropped: string[] = []
    for (const column of columns) {
      const previous = parentFixedRef.current[column.key]
      if (
        previous !== undefined &&
        previous !== column.fixed &&
        Object.prototype.hasOwnProperty.call(fixedOverrides, column.key)
      ) {
        dropped.push(column.key)
      }
    }
    if (dropped.length > 0) {
      const next = { ...fixedOverrides }
      for (const key of dropped) delete next[key]
      setFixedOverrides(next)
    }
  }
  parentFixedRef.current = Object.fromEntries(columns.map((column) => [column.key, column.fixed]))

  const effectiveColumnOrder = isColumnOrderControlled
    ? columnOrderProp
    : (columnOrder ?? undefined)
  const effectiveFixedOverrides = isColumnFixedControlled ? (columnFixedProp ?? {}) : fixedOverrides

  const sourceRowKeys = useMemo(
    () => resolveTableRowKeys(sourceData, rowKey, rowSelection?.getRowKey),
    [sourceData, rowKey, rowSelection]
  )

  const view = useMemo(
    () =>
      resolveTableView({
        columns,
        dataSource: sourceData,
        hiddenColumnKeys: effectiveHiddenColumnKeys,
        columnOrder: effectiveColumnOrder,
        fixedOverrides: effectiveFixedOverrides,
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
        sourceRowKeys,
        rowSelection,
        expandable,
        selectedRowKeys,
        measuredColumnWidths,
        containerWidth,
        sortLocale,
        rowDraggable,
        sorts: multiSort
      }),
    [
      columns,
      sourceData,
      effectiveHiddenColumnKeys,
      effectiveColumnOrder,
      effectiveFixedOverrides,
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
      sourceRowKeys,
      expandable,
      selectedRowKeys,
      measuredColumnWidths,
      containerWidth,
      sortLocale,
      rowDraggable,
      multiSort
    ]
  )

  const selectedRowKeySet = useMemo(
    () => new Set(selectedRowKeys.map((key) => tableRowKeyId(key))),
    [selectedRowKeys]
  )
  const expandedRowKeySet = useMemo(
    () => new Set(expandedRowKeys.map((key) => tableRowKeyId(key))),
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
    const current = isColumnFixedControlled
      ? Object.prototype.hasOwnProperty.call(columnFixedProp ?? {}, columnKey)
        ? columnFixedProp?.[columnKey]
        : original
      : Object.prototype.hasOwnProperty.call(fixedOverrides, columnKey)
        ? fixedOverrides[columnKey]
        : original
    const nextFixed = getNextTableColumnFixed(current, original)
    if (!isColumnFixedControlled) {
      setFixedOverrides({ ...fixedOverrides, [columnKey]: nextFixed })
    }
    const fullColumns = applyTableColumnOrder(columns, effectiveColumnOrder).map((column) =>
      column.key === columnKey ? { ...column, fixed: nextFixed } : column
    )
    onColumnFixedChange?.(columnKey, nextFixed, fullColumns)
  }

  function queryPage(): number {
    const nextPage = resolveTableQueryPage(isCurrentPageControlled, currentPage)
    if (!isCurrentPageControlled && nextPage !== currentPage) {
      setUncontrolledCurrentPage(nextPage)
    }
    return nextPage
  }

  function handleSetSort(newSortState: SortState) {
    if (!isSortControlled) {
      setUncontrolledSortState(newSortState)
    }
    const nextPage = queryPage()
    onSortChange?.(newSortState)
    emitChange({
      sort: newSortState,
      pagination:
        paginationMerged !== false ? { current: nextPage, pageSize: currentPageSize } : null
    })
    if (paginationMerged !== false && nextPage !== currentPage) {
      onPageChange?.({ current: nextPage, pageSize: currentPageSize })
    }
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
    const nextPage = queryPage()
    onFilterChange?.(newFilterState)
    if (paginationMerged !== false) {
      onPageChange?.({ current: nextPage, pageSize: currentPageSize })
    }
    emitChange({
      filters: newFilterState,
      pagination: paginationMerged !== false ? { current: nextPage, pageSize: currentPageSize } : null
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
    const nextPage = queryPage()
    onPageChange?.({ current: nextPage, pageSize })
    emitChange({ pagination: { current: nextPage, pageSize } })
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
    if (rowSelection && rowSelection.showCheckbox === false) {
      const selected = selectedRowKeys.some((item) => tableRowKeyId(item) === tableRowKeyId(key))
      handleSelectRow(key, !selected)
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

  function handleSelectLoaded(checked = true) {
    const remote = shouldSkipTableLocalProcessing(paginationMerged)
    const loaded = getTableSelectionState({
      records: view.processedData,
      rowKeys: view.processedRowKeys,
      selectedRowKeys,
      getCheckboxProps: rowSelection?.getCheckboxProps
    })
    const result = resolveTableSelectLoadedKeys({
      remote,
      selectedKeys: selectedRowKeys,
      loadedSelectableKeys: loaded.selectableRowKeys,
      checked
    })
    if (result.emitOnly) {
      onSelectLoaded?.()
      return
    }
    if (!selectionControl.controlled) {
      setUncontrolledSelectedRowKeys(result.keys)
    }
    onSelectionChange?.(result.keys)
  }

  const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnKey: string } | null>(
    null
  )
  const [editingValue, setEditingValue] = useState('')

  function isCellEditable(columnKey: string, rowIndex: number): boolean {
    const column = columns.find((item) => item.key === columnKey)
    if (column?.edit) return true
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
    if (column?.edit || column?.validate) {
      const result = commitValidatedCellEdit({
        data: sourceData as Record<string, unknown>[],
        rowIndex: editingCell.rowIndex,
        column,
        raw: editingValue
      })
      if (!result.ok) return
      onCellChange?.(editingCell.rowIndex, editingCell.columnKey, result.value, result.nextData)
      setEditingCell(null)
      return
    }
    const original = column
      ? getTableCellValue(sourceData[editingCell.rowIndex] ?? {}, column)
      : undefined
    const value = coerceTableEditValue(original, editingValue)
    const nextData = commitTableCellEdit(sourceData, editingCell.rowIndex, column, value)
    onCellChange?.(editingCell.rowIndex, editingCell.columnKey, value, nextData)
    setEditingCell(null)
  }

  function cancelEdit() {
    setEditingCell(null)
  }

  function handleExport() {
    const formatted = resolveFormattedExportRows({
      scope: exportScope === 'page' ? 'page' : exportScope === 'selected' ? 'selected' : 'all',
      pageRecords: view.paginatedData,
      processedRecords: view.processedData,
      processedKeys: view.processedRowKeys,
      selectedKeys: selectedRowKeys,
      columns: view.displayColumns
    })
    const rows = resolveTableExportRecords({
      scope: exportScope,
      pageRecords: view.paginatedData,
      processedRecords: view.processedData,
      processedKeys: view.processedRowKeys,
      selectedKeys: selectedRowKeys
    })
    const content = view.displayColumns.some((column) => column.cellFormatter)
      ? exportTableData(
          view.displayColumns,
          formatted.rows.map((row) => {
            const record: Record<string, unknown> = {}
            view.displayColumns.forEach((column, index) => {
              record[column.dataKey || column.key] = row[index] ?? ''
            })
            return record
          })
        )
      : exportTableData(view.displayColumns, rows)
    downloadTableExport(content, exportFilename)
    onExport?.(content)
  }

  const [dragColumnKey, setDragColumnKey] = useState<string | null>(null)

  function handleDragStart(columnKey: string) {
    setDragColumnKey(columnKey)
  }

  function applyMultiSort(columnKey: string) {
    const next = nextMultiSort(multiSort ?? [], columnKey)
    setMultiSort(next)
    onSortChange?.(next[0] ?? null)
  }

  function applyColumnWidth(key: string, width: number) {
    setWidthMap((current) => ({ ...current, [key]: width }))
  }

  function toggleGroup(key: string) {
    setCollapsedGroups((current) => toggleCollapsedKey(current, key))
  }

  function replaceSelectedKeys(keys: (string | number)[]) {
    if (!selectionControl.controlled) setUncontrolledSelectedRowKeys(keys)
    onSelectionChange?.(keys)
  }

  function handleDrop(targetKey: string) {
    if (!dragColumnKey || dragColumnKey === targetKey) return
    const fullColumns = applyTableColumnOrder(columns, effectiveColumnOrder)
    const from = fullColumns.findIndex((column) => column.key === dragColumnKey)
    const to = fullColumns.findIndex((column) => column.key === targetKey)
    const nextColumns = reorderByHandle(fullColumns, from, to)
    setDragLive(dragMoveAnnouncement(from, to))
    if (!isColumnOrderControlled) {
      setColumnOrder(nextColumns.map((column) => column.key))
    }
    onColumnOrderChange?.(nextColumns)
    setDragColumnKey(null)
  }

  const [dragRowKey, setDragRowKey] = useState<string | number | null>(null)

  function handleRowDragStart(rowKeyValue: string | number) {
    setDragRowKey(rowKeyValue)
  }

  function handleRowDrop(targetKey: string | number) {
    if (dragRowKey === null || dragRowKey === targetKey) return
    const from = sourceRowKeys.findIndex(
      (key) => tableRowKeyId(key) === tableRowKeyId(dragRowKey)
    )
    const to = sourceRowKeys.findIndex((key) => tableRowKeyId(key) === tableRowKeyId(targetKey))
    const nextRows = reorderByHandle(sourceData, from, to)
    setDragLive(dragMoveAnnouncement(from, to))
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
    groupBlocks: view.groupBlocks,
    processedRowKeys: view.processedRowKeys,
    sortState,
    filterState,
    currentPage,
    currentPageSize,
    hiddenColumnKeys: effectiveHiddenColumnKeys,
    selectedRowKeys,
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
    handleSelectLoaded,
    isCellEditable,
    startEditing,
    commitEdit,
    cancelEdit,
    handleExport,
    handleDragStart,
    handleDrop,
    handleRowDragStart,
    handleRowDrop,
    applyMultiSort,
    applyColumnWidth,
    toggleGroup,
    replaceSelectedKeys,
    multiSort,
    widthMap,
    collapsedGroups,
    groupCollapseEnabled,
    selectionLive,
    dragLive,
    setPreviousSelectionCount,
    previousSelectionCount,
    setSelectionLive
  }
}
