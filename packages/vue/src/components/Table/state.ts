import { computed, ref, watch } from 'vue'
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
  reorderTableColumnsByKey,
  reorderTableRowsByKey,
  coerceTableEditValue,
  getTableCellValue,
  getTableSelectionState,
  resolveTableExportRecords,
  resolveTableKeyList,
  resolveTableQueryPage,
  resolveTableRecordKey,
  resolveTableRowKeys,
  resolveTableSelectLoadedKeys,
  resolveTableView,
  shouldSkipTableLocalProcessing,
  tableRowKeyId,
  type TableColumn,
  type TableFixedPosition
} from '@expcat/tigercat-core'
import { downloadTableExport, exportTableData } from '@expcat/tigercat-core/utils/table-export'
import type { TableContext, TableEmitFn, TableInternalProps } from './types'

/**
 * Owns reactive state for Table. Submitters and the derived view live in core.
 */
export function useTableState(
  props: TableInternalProps,
  emit: TableEmitFn,
  measuredColumnWidths: { value: Record<string, number> },
  containerSize?: { value: { width: number; height: number } },
  sortLocale?: { value: string | undefined }
): TableContext {
  const paginationMerged = computed(() => mergeTablePagination(props.pagination))
  const paginationConfig = computed(() => {
    const merged = paginationMerged.value
    return merged === false ? null : merged
  })

  const isSortControlled = computed(() => props.sort !== undefined)
  const isHiddenColumnsControlled = computed(() => props.hiddenColumnKeys !== undefined)
  const isFiltersControlled = computed(() => props.filters !== undefined)
  const isCurrentPageControlled = computed(() => paginationConfig.value?.current !== undefined)
  const isPageSizeControlled = computed(() => paginationConfig.value?.pageSize !== undefined)

  const selectionControl = computed(() =>
    resolveTableKeyList(props.rowSelection?.selectedRowKeys, 'rowSelection.selectedRowKeys')
  )
  const expandControl = computed(() =>
    resolveTableKeyList(props.expandable?.expandedRowKeys, 'expandable.expandedRowKeys')
  )

  const sourceData = computed(() => props.dataSource ?? EMPTY_TABLE_RECORDS)
  const isColumnOrderControlled = computed(() => props.columnOrder !== undefined)
  const isColumnFixedControlled = computed(() => props.columnFixed !== undefined)

  const uncontrolledSortState = ref(props.defaultSort ?? DEFAULT_TABLE_SORT)
  const uncontrolledHiddenColumnKeys = ref(
    props.defaultHiddenColumnKeys ?? props.hiddenColumnKeys ?? EMPTY_TABLE_HIDDEN_KEYS
  )
  const uncontrolledFilterState = ref(props.defaultFilters ?? EMPTY_TABLE_FILTERS)
  const uncontrolledCurrentPage = ref(
    paginationConfig.value?.defaultCurrent ?? paginationConfig.value?.current ?? 1
  )
  const uncontrolledCurrentPageSize = ref(
    paginationConfig.value?.defaultPageSize ?? paginationConfig.value?.pageSize ?? 10
  )
  const uncontrolledSelectedRowKeys = ref<(string | number)[]>(
    props.rowSelection?.defaultSelectedRowKeys ?? []
  )
  const uncontrolledExpandedRowKeys = ref<(string | number)[]>(
    props.expandable?.defaultExpandedRowKeys ?? []
  )
  const columnOrder = ref<string[] | null>(null)
  const fixedOverrides = ref<Record<string, TableFixedPosition | false>>({})

  watch(
    () => props.columns.map((column) => column.key).join('\0'),
    () => {
      if (!isColumnOrderControlled.value) columnOrder.value = null
    }
  )

  const parentFixed = ref<Record<string, TableFixedPosition | false | undefined>>({})
  watch(
    () => props.columns.map((column) => `${column.key}\u0001${column.fixed ?? ''}`).join('\0'),
    () => {
      if (isColumnFixedControlled.value) {
        parentFixed.value = Object.fromEntries(props.columns.map((column) => [column.key, column.fixed]))
        return
      }
      const next = { ...fixedOverrides.value }
      let changed = false
      for (const column of props.columns) {
        const previous = parentFixed.value[column.key]
        if (
          previous !== undefined &&
          previous !== column.fixed &&
          Object.prototype.hasOwnProperty.call(next, column.key)
        ) {
          delete next[column.key]
          changed = true
        }
      }
      if (changed) fixedOverrides.value = next
      parentFixed.value = Object.fromEntries(props.columns.map((column) => [column.key, column.fixed]))
    },
    { immediate: true }
  )

  const sortState = computed(() => props.sort ?? uncontrolledSortState.value)
  const hiddenColumnKeys = computed(
    () => props.hiddenColumnKeys ?? uncontrolledHiddenColumnKeys.value
  )
  const filterState = computed(() => props.filters ?? uncontrolledFilterState.value)
  const currentPage = computed(
    () => paginationConfig.value?.current ?? uncontrolledCurrentPage.value
  )
  const currentPageSize = computed(
    () => paginationConfig.value?.pageSize ?? uncontrolledCurrentPageSize.value
  )
  const selectedRowKeys = computed(() =>
    selectionControl.value.controlled
      ? selectionControl.value.keys
      : uncontrolledSelectedRowKeys.value
  )
  const expandedRowKeys = computed(() =>
    expandControl.value.controlled ? expandControl.value.keys : uncontrolledExpandedRowKeys.value
  )

  const effectiveColumnOrder = computed(() =>
    isColumnOrderControlled.value ? props.columnOrder : (columnOrder.value ?? undefined)
  )
  const effectiveFixedOverrides = computed(() =>
    isColumnFixedControlled.value ? (props.columnFixed ?? {}) : fixedOverrides.value
  )

  const sourceRowKeys = computed(() =>
    resolveTableRowKeys(sourceData.value, props.rowKey, props.rowSelection?.getRowKey)
  )

  const view = computed(() =>
    resolveTableView({
      columns: props.columns,
      dataSource: sourceData.value,
      hiddenColumnKeys: hiddenColumnKeys.value,
      columnOrder: effectiveColumnOrder.value,
      fixedOverrides: effectiveFixedOverrides.value,
      filters: filterState.value,
      sort: sortState.value,
      filterMode: props.filterMode,
      advancedFilterRules: props.advancedFilterRules ?? EMPTY_TABLE_FILTER_RULES,
      groupBy: props.groupBy,
      pagination: paginationMerged.value,
      currentPage: currentPage.value,
      currentPageSize: currentPageSize.value,
      rowKey: props.rowKey,
      getRowKey: props.rowSelection?.getRowKey,
      sourceRowKeys: sourceRowKeys.value,
      rowSelection: props.rowSelection,
      expandable: props.expandable,
      selectedRowKeys: selectedRowKeys.value,
      measuredColumnWidths: measuredColumnWidths.value,
      containerWidth: containerSize?.value.width,
      sortLocale: sortLocale?.value,
      rowDraggable: props.rowDraggable
    })
  )

  const displayColumns = computed(() => view.value.displayColumns)
  const fixedColumnsInfo = computed(() => view.value.fixedColumnsInfo)
  const processedData = computed(() => view.value.processedData)
  const paginatedData = computed(() => view.value.paginatedData)
  const paginatedRowKeys = computed(() => view.value.pageRowKeys)
  const pageSourceIndices = computed(() => view.value.pageSourceIndices)
  const groupBlocks = computed(() => view.value.groupBlocks)
  const processedRowKeys = computed(() => view.value.processedRowKeys)
  const paginationInfo = computed(() => view.value.paginationInfo)
  const totalColumnCount = computed(() => view.value.totalColumnCount)
  const allSelected = computed(() => view.value.allSelected)
  const someSelected = computed(() => view.value.someSelected)

  const selectedRowKeySet = computed(
    () => new Set(selectedRowKeys.value.map((key) => tableRowKeyId(key)))
  )
  const expandedRowKeySet = computed(
    () => new Set(expandedRowKeys.value.map((key) => tableRowKeyId(key)))
  )

  const columnByKey = computed<Record<string, TableColumn>>(() => {
    const map: Record<string, TableColumn> = {}
    for (const column of displayColumns.value) {
      map[column.key] = column
    }
    return map
  })

  const frozenColumnWidths = ref<Record<string, number>>({})
  watch(
    [() => measuredColumnWidths.value, displayColumns],
    () => {
      frozenColumnWidths.value = freezeTableColumnWidths(
        displayColumns.value,
        measuredColumnWidths.value,
        frozenColumnWidths.value
      )
    },
    { immediate: true }
  )

  function emitChange(next: {
    sort?: (typeof sortState)['value']
    filters?: Record<string, unknown>
    pagination?: { current: number; pageSize: number } | null
  }) {
    emit('change', {
      sort: next.sort ?? sortState.value,
      filters: next.filters ?? filterState.value,
      pagination:
        next.pagination !== undefined
          ? next.pagination
          : paginationMerged.value !== false
            ? { current: currentPage.value, pageSize: currentPageSize.value }
            : null
    })
  }

  function handleSetHiddenColumns(hiddenKeys: string[]) {
    if (!isHiddenColumnsControlled.value) {
      uncontrolledHiddenColumnKeys.value = hiddenKeys
    }
    emit('update:hiddenColumnKeys', hiddenKeys)
    emit('hidden-column-keys-change', hiddenKeys)
  }

  function toggleColumnLock(columnKey: string) {
    const original = props.columns.find((column) => column.key === columnKey)?.fixed
    const controlledMap = props.columnFixed ?? {}
    const current = isColumnFixedControlled.value
      ? Object.prototype.hasOwnProperty.call(controlledMap, columnKey)
        ? controlledMap[columnKey]
        : original
      : Object.prototype.hasOwnProperty.call(fixedOverrides.value, columnKey)
        ? fixedOverrides.value[columnKey]
        : original
    const nextFixed = getNextTableColumnFixed(current, original)
    if (!isColumnFixedControlled.value) {
      fixedOverrides.value = { ...fixedOverrides.value, [columnKey]: nextFixed }
    }
    const fullColumns = applyTableColumnOrder(props.columns, effectiveColumnOrder.value).map(
      (column) => (column.key === columnKey ? { ...column, fixed: nextFixed } : column)
    )
    emit('column-fixed-change', columnKey, nextFixed, fullColumns)
  }

  function queryPage(): number {
    const nextPage = resolveTableQueryPage(isCurrentPageControlled.value, currentPage.value)
    if (!isCurrentPageControlled.value && nextPage !== currentPage.value) {
      uncontrolledCurrentPage.value = nextPage
    }
    return nextPage
  }

  function handleSetSort(nextSortState: (typeof sortState)['value']) {
    if (!isSortControlled.value) {
      uncontrolledSortState.value = nextSortState
    }
    const nextPage = queryPage()
    emit('sort-change', nextSortState)
    emitChange({
      sort: nextSortState,
      pagination:
        paginationMerged.value !== false
          ? { current: nextPage, pageSize: currentPageSize.value }
          : null
    })
    if (paginationMerged.value !== false && nextPage !== currentPage.value) {
      emit('page-change', { current: nextPage, pageSize: currentPageSize.value })
    }
  }

  function handleSort(columnKey: string) {
    const column = displayColumns.value.find((item) => item.key === columnKey)
    if (!column || !column.sortable) return
    handleSetSort(getNextTableSortState(sortState.value, columnKey))
  }

  function handleFilter(columnKey: string, value: unknown) {
    const nextFilterState = mergeTableFilterValue(filterState.value, columnKey, value)
    if (!isFiltersControlled.value) {
      uncontrolledFilterState.value = nextFilterState
    }
    const nextPage = queryPage()
    emit('filter-change', nextFilterState)
    if (paginationMerged.value !== false) {
      emit('page-change', { current: nextPage, pageSize: currentPageSize.value })
    }
    emitChange({
      filters: nextFilterState,
      pagination:
        paginationMerged.value !== false
          ? { current: nextPage, pageSize: currentPageSize.value }
          : null
    })
  }

  function handlePageChange(page: number) {
    if (!isCurrentPageControlled.value) {
      uncontrolledCurrentPage.value = page
    }
    emit('page-change', { current: page, pageSize: currentPageSize.value })
    emitChange({ pagination: { current: page, pageSize: currentPageSize.value } })
  }

  function handlePageSizeChange(pageSize: number) {
    if (!isPageSizeControlled.value) {
      uncontrolledCurrentPageSize.value = pageSize
    }
    const nextPage = queryPage()
    emit('page-change', { current: nextPage, pageSize })
    emitChange({ pagination: { current: nextPage, pageSize } })
  }

  function handleToggleExpand(key: string | number, record: Record<string, unknown>) {
    const next = getNextTableExpandKeys(expandedRowKeys.value, key)
    if (!expandControl.value.controlled) {
      uncontrolledExpandedRowKeys.value = next.keys
    }
    emit('expand-change', next.keys, record, next.expanded)
  }

  function handleRowClick(record: Record<string, unknown>, index: number, key: string | number) {
    emit('row-click', record, index)
    if (props.expandable?.expandRowByClick) {
      const isExpandable = props.expandable?.rowExpandable
        ? props.expandable.rowExpandable(record)
        : true
      if (isExpandable) {
        handleToggleExpand(key, record)
      }
    }
  }

  function handleSelectRow(key: string | number, checked: boolean) {
    const newKeys = getNextTableSelectRowKeys({
      selectedRowKeys: selectedRowKeys.value,
      key,
      checked,
      type: props.rowSelection?.type
    })
    if (!selectionControl.value.controlled) {
      uncontrolledSelectedRowKeys.value = newKeys
    }
    emit('selection-change', newKeys)
  }

  function handleSelectAll(checked: boolean) {
    const nextKeys = getNextTableSelectAllKeys(
      selectedRowKeys.value,
      view.value.selectableRowKeys,
      checked
    )
    if (!selectionControl.value.controlled) {
      uncontrolledSelectedRowKeys.value = nextKeys
    }
    emit('selection-change', nextKeys)
  }

  function handleSelectLoaded(checked = true) {
    const remote = shouldSkipTableLocalProcessing(paginationMerged.value)
    const loaded = getTableSelectionState({
      records: view.value.processedData,
      rowKeys: view.value.processedRowKeys,
      selectedRowKeys: selectedRowKeys.value,
      getCheckboxProps: props.rowSelection?.getCheckboxProps
    })
    const result = resolveTableSelectLoadedKeys({
      remote,
      selectedKeys: selectedRowKeys.value,
      loadedSelectableKeys: loaded.selectableRowKeys,
      checked
    })
    if (result.emitOnly) {
      emit('select-loaded')
      return
    }
    if (!selectionControl.value.controlled) {
      uncontrolledSelectedRowKeys.value = result.keys
    }
    emit('selection-change', result.keys)
  }

  const editingCell = ref<{ rowIndex: number; columnKey: string } | null>(null)
  const editingValue = ref('')

  function isCellEditable(columnKey: string, rowIndex: number): boolean {
    if (!props.editable) return false
    if (!props.editableCells) return true
    return props.editableCells[columnKey]?.includes(rowIndex) === true
  }

  function startEditing(rowIndex: number, columnKey: string, currentValue: unknown) {
    editingCell.value = { rowIndex, columnKey }
    editingValue.value = String(currentValue ?? '')
  }

  function commitEdit() {
    if (!editingCell.value) return
    const column = props.columns.find((item) => item.key === editingCell.value?.columnKey)
    const original = column
      ? getTableCellValue(sourceData.value[editingCell.value.rowIndex] ?? {}, column)
      : undefined
    const value = coerceTableEditValue(original, editingValue.value)
    const nextData = commitTableCellEdit(
      sourceData.value,
      editingCell.value.rowIndex,
      column,
      value
    )
    emit(
      'cell-change',
      editingCell.value.rowIndex,
      editingCell.value.columnKey,
      value,
      nextData
    )
    editingCell.value = null
  }

  function cancelEdit() {
    editingCell.value = null
  }

  function handleExport() {
    const rows = resolveTableExportRecords({
      scope: props.exportScope,
      pageRecords: paginatedData.value,
      processedRecords: processedData.value,
      processedKeys: processedRowKeys.value,
      selectedKeys: selectedRowKeys.value
    })
    const content = exportTableData(displayColumns.value, rows)
    downloadTableExport(content, props.exportFilename)
    emit('export', content)
  }

  const dragColumnKey = ref<string | null>(null)

  function handleDragStart(columnKey: string) {
    dragColumnKey.value = columnKey
  }

  function handleDrop(targetKey: string) {
    if (!dragColumnKey.value || dragColumnKey.value === targetKey) return
    const fullColumns = applyTableColumnOrder(props.columns, effectiveColumnOrder.value)
    const nextColumns = reorderTableColumnsByKey(fullColumns, dragColumnKey.value, targetKey)
    if (!isColumnOrderControlled.value) {
      columnOrder.value = nextColumns.map((column) => column.key)
    }
    emit('column-order-change', nextColumns)
    dragColumnKey.value = null
  }

  const dragRowKey = ref<string | number | null>(null)

  function handleRowDragStart(rowKeyValue: string | number) {
    dragRowKey.value = rowKeyValue
  }

  function handleRowDrop(targetKey: string | number) {
    if (dragRowKey.value === null || dragRowKey.value === targetKey) return
    const nextRows = reorderTableRowsByKey(
      sourceData.value,
      dragRowKey.value,
      targetKey,
      (record, sourceIndex) =>
        resolveTableRecordKey(record, sourceIndex, props.rowKey, props.rowSelection?.getRowKey)
    )
    emit('row-order-change', nextRows)
    dragRowKey.value = null
  }

  const virtualScrollTop = ref(0)

  return {
    paginationConfig,
    displayColumns,
    fixedColumnsInfo,
    frozenColumnWidths,
    columnByKey,
    processedData,
    paginatedData,
    paginatedRowKeys,
    pageSourceIndices,
    selectedRowKeySet,
    expandedRowKeySet,
    totalColumnCount,
    paginationInfo,
    allSelected,
    someSelected,
    groupBlocks,
    processedRowKeys,
    sortState,
    filterState,
    currentPage,
    currentPageSize,
    hiddenColumnKeys,
    selectedRowKeys,
    expandedRowKeys,
    editingCell,
    editingValue,
    virtualScrollTop,
    toggleColumnLock,
    handleSetHiddenColumns,
    handleSetSort,
    handleSort,
    handleFilter,
    handlePageChange,
    handlePageSizeChange,
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
    handleRowDrop
  }
}
