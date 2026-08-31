import { computed, ref, watch } from 'vue'
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
  type TableColumn,
  type TableFixedPosition
} from '@expcat/tigercat-core'
import { devWarn } from '@expcat/tigercat-core'
import type { TableContext, TableEmitFn, TableInternalProps } from './types'

/**
 * Owns reactive state for Table. Submitters and the derived view live in core.
 */
export function useTableState(
  props: TableInternalProps,
  emit: TableEmitFn,
  measuredColumnWidths: { value: Record<string, number> },
  containerSize?: { value: { width: number; height: number } }
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

  const internalData = ref<Record<string, unknown>[] | null>(null)
  watch(
    () => props.dataSource,
    () => {
      internalData.value = null
    }
  )
  const effectiveData = computed(
    () => internalData.value ?? props.dataSource ?? EMPTY_TABLE_RECORDS
  )

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
      columnOrder.value = null
    }
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

  const view = computed(() =>
    resolveTableView({
      columns: props.columns,
      dataSource: effectiveData.value,
      hiddenColumnKeys: hiddenColumnKeys.value,
      columnOrder: columnOrder.value ?? undefined,
      fixedOverrides: fixedOverrides.value,
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
      rowSelection: props.rowSelection,
      expandable: props.expandable,
      selectedRowKeys: selectedRowKeys.value,
      measuredColumnWidths: measuredColumnWidths.value,
      containerWidth: containerSize?.value.width
    })
  )

  const displayColumns = computed(() => view.value.displayColumns)
  const fixedColumnsInfo = computed(() => view.value.fixedColumnsInfo)
  const processedData = computed(() => view.value.processedData)
  const paginatedData = computed(() => view.value.paginatedData)
  const paginatedRowKeys = computed(() => view.value.pageRowKeys)
  const pageSourceIndices = computed(() => view.value.pageSourceIndices)
  const groupedData = computed(() => view.value.groupedData)
  const paginationInfo = computed(() => view.value.paginationInfo)
  const totalColumnCount = computed(() => view.value.totalColumnCount)
  const allSelected = computed(() => view.value.allSelected)
  const someSelected = computed(() => view.value.someSelected)

  const selectedRowKeySet = computed(() => new Set<string | number>(selectedRowKeys.value))
  const expandedRowKeySet = computed(() => new Set<string | number>(expandedRowKeys.value))

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
    const current = Object.prototype.hasOwnProperty.call(fixedOverrides.value, columnKey)
      ? fixedOverrides.value[columnKey]
      : original
    const nextFixed = getNextTableColumnFixed(current, original)
    fixedOverrides.value = { ...fixedOverrides.value, [columnKey]: nextFixed }
    const fullColumns = applyTableColumnOrder(props.columns, columnOrder.value ?? undefined).map(
      (column) => (column.key === columnKey ? { ...column, fixed: nextFixed } : column)
    )
    emit('column-fixed-change', columnKey, nextFixed, fullColumns)
  }

  function handleSetSort(nextSortState: (typeof sortState)['value']) {
    if (!isSortControlled.value) {
      uncontrolledSortState.value = nextSortState
    }
    emit('sort-change', nextSortState)
    emitChange({ sort: nextSortState })
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
    if (!isCurrentPageControlled.value) {
      uncontrolledCurrentPage.value = 1
    } else if (shouldWarnControlledPageReset(true, currentPage.value)) {
      devWarn(
        'Table.filter.page',
        'Table filter reset pagination.current to 1; the controlled current page was not written back'
      )
    }
    emit('filter-change', nextFilterState)
    if (paginationMerged.value !== false) {
      emit('page-change', { current: 1, pageSize: currentPageSize.value })
    }
    emitChange({
      filters: nextFilterState,
      pagination:
        paginationMerged.value !== false ? { current: 1, pageSize: currentPageSize.value } : null
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
    if (!isCurrentPageControlled.value) {
      uncontrolledCurrentPage.value = 1
    }
    emit('page-change', { current: 1, pageSize })
    emitChange({ pagination: { current: 1, pageSize } })
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
    const nextData = commitTableCellEdit(
      effectiveData.value,
      editingCell.value.rowIndex,
      column,
      editingValue.value
    )
    internalData.value = nextData
    emit('cell-change', editingCell.value.rowIndex, editingCell.value.columnKey, editingValue.value)
    editingCell.value = null
  }

  function cancelEdit() {
    editingCell.value = null
  }

  function handleExport() {
    const content = exportTableData(displayColumns.value, processedData.value)
    downloadTableExport(content, props.exportFilename)
    emit('export', content)
  }

  const dragColumnKey = ref<string | null>(null)

  function handleDragStart(columnKey: string) {
    dragColumnKey.value = columnKey
  }

  function handleDrop(targetKey: string) {
    if (!dragColumnKey.value || dragColumnKey.value === targetKey) return
    const fullColumns = applyTableColumnOrder(props.columns, columnOrder.value ?? undefined)
    const nextColumns = reorderTableColumnsByKey(fullColumns, dragColumnKey.value, targetKey)
    columnOrder.value = nextColumns.map((column) => column.key)
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
      effectiveData.value,
      dragRowKey.value,
      targetKey,
      (record, sourceIndex) =>
        resolveTableRecordKey(record, sourceIndex, props.rowKey, props.rowSelection?.getRowKey)
    )
    internalData.value = nextRows
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
    groupedData,
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
