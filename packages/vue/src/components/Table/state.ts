import { computed, ref, watch } from 'vue'
import {
  sortData,
  filterData,
  paginateData,
  calculatePagination,
  getRowKey,
  filterDataAdvanced,
  groupDataByColumn,
  exportTableToCsv,
  downloadCsv,
  getFixedColumnOffsets,
  getFixedVirtualRange,
  type TableColumn,
  type SortState,
  type SortDirection,
  type PaginationConfig
} from '@expcat/tigercat-core'
import type { TableContext, TableEmitFn, TableInternalProps } from './types'

/**
 * Owns ALL reactive state, computed values, watchers and handlers for Table.
 * Returned context is consumed by render-* modules.
 *
 * Behavior is intentionally identical to the original monolithic Table setup —
 * this is a structural extraction only.
 */
export function useTableState(props: TableInternalProps, emit: TableEmitFn): TableContext {
  const paginationConfig = computed(() => {
    return props.pagination !== false && typeof props.pagination === 'object'
      ? (props.pagination as PaginationConfig)
      : null
  })

  const isSortControlled = computed(() => props.sort !== undefined)
  const isFiltersControlled = computed(() => props.filters !== undefined)
  const isSelectionControlled = computed(() => props.rowSelection?.selectedRowKeys !== undefined)
  const isExpandControlled = computed(() => props.expandable?.expandedRowKeys !== undefined)

  const uncontrolledSortState = ref<SortState>(props.defaultSort ?? { key: null, direction: null })
  const uncontrolledFilterState = ref<Record<string, unknown>>(props.defaultFilters ?? {})

  const uncontrolledCurrentPage = ref(
    paginationConfig.value?.defaultCurrent ?? paginationConfig.value?.current ?? 1
  )

  const uncontrolledCurrentPageSize = ref(
    paginationConfig.value?.defaultPageSize ?? paginationConfig.value?.pageSize ?? 10
  )

  const uncontrolledSelectedRowKeys = ref<(string | number)[]>(
    props.rowSelection?.defaultSelectedRowKeys ?? props.rowSelection?.selectedRowKeys ?? []
  )

  const uncontrolledExpandedRowKeys = ref<(string | number)[]>(
    props.expandable?.defaultExpandedRowKeys ?? props.expandable?.expandedRowKeys ?? []
  )

  const sortState = computed(() => props.sort ?? uncontrolledSortState.value)
  const filterState = computed(() => props.filters ?? uncontrolledFilterState.value)
  const currentPage = computed(() => {
    return paginationConfig.value?.current ?? uncontrolledCurrentPage.value
  })
  const currentPageSize = computed(() => {
    return paginationConfig.value?.pageSize ?? uncontrolledCurrentPageSize.value
  })
  const selectedRowKeys = computed(() => {
    return props.rowSelection?.selectedRowKeys ?? uncontrolledSelectedRowKeys.value
  })
  const expandedRowKeys = computed(() => {
    return props.expandable?.expandedRowKeys ?? uncontrolledExpandedRowKeys.value
  })

  watch(
    () => props.sort,
    (next) => {
      if (next !== undefined) {
        uncontrolledSortState.value = next
      }
    }
  )

  watch(
    () => props.filters,
    (next) => {
      if (next !== undefined) {
        uncontrolledFilterState.value = next
      }
    }
  )

  watch(
    () => paginationConfig.value?.current,
    (next) => {
      if (next !== undefined) {
        uncontrolledCurrentPage.value = next
      }
    }
  )

  watch(
    () => paginationConfig.value?.pageSize,
    (next) => {
      if (next !== undefined) {
        uncontrolledCurrentPageSize.value = next
      }
    }
  )

  watch(
    () => props.rowSelection?.selectedRowKeys,
    (next) => {
      if (next !== undefined) {
        uncontrolledSelectedRowKeys.value = next
      }
    }
  )

  watch(
    () => props.expandable?.expandedRowKeys,
    (next) => {
      if (next !== undefined) {
        uncontrolledExpandedRowKeys.value = next
      }
    }
  )

  const fixedOverrides = ref<Record<string, 'left' | 'right' | false>>({})

  const displayColumns = computed<TableColumn[]>(() => {
    return props.columns.map((column) => {
      const hasOverride = column.key in fixedOverrides.value
      return {
        ...column,
        fixed: hasOverride ? fixedOverrides.value[column.key] : column.fixed
      }
    })
  })

  const fixedColumnsInfo = computed(() => {
    return getFixedColumnOffsets(displayColumns.value)
  })

  const columnByKey = computed<Record<string, TableColumn>>(() => {
    const map: Record<string, TableColumn> = {}
    for (const column of displayColumns.value) {
      map[column.key] = column
    }
    return map
  })

  function toggleColumnLock(columnKey: string) {
    const original = props.columns.find((c) => c.key === columnKey)?.fixed
    const hasOverride = columnKey in fixedOverrides.value
    const current = hasOverride ? fixedOverrides.value[columnKey] : original
    const isLocked = current === 'left' || current === 'right'
    fixedOverrides.value[columnKey] = isLocked ? false : 'left'
  }

  const processedData = computed(() => {
    let data = props.dataSource ?? []

    if (props.filterMode === 'advanced' && (props.advancedFilterRules?.length ?? 0) > 0) {
      data = filterDataAdvanced(data, props.advancedFilterRules ?? [])
    } else {
      data = filterData(data, filterState.value)
    }

    if (sortState.value.key && sortState.value.direction) {
      const column = columnByKey.value[sortState.value.key]
      data = sortData(data, sortState.value.key, sortState.value.direction, column?.sortFn)
    }

    return data
  })

  const paginatedData = computed(() => {
    if (props.pagination === false) {
      return processedData.value
    }
    return paginateData(processedData.value, currentPage.value, currentPageSize.value)
  })

  const paginatedRowKeys = computed(() => {
    return paginatedData.value.map((record, index) => getRowKey(record, props.rowKey, index))
  })

  const selectedRowKeySet = computed(() => {
    return new Set<string | number>(selectedRowKeys.value)
  })

  const expandedRowKeySet = computed(() => {
    return new Set<string | number>(expandedRowKeys.value)
  })

  const totalColumnCount = computed(() => {
    let count = displayColumns.value.length
    if (props.rowSelection) count += 1
    if (props.expandable) count += 1
    return count
  })

  const paginationInfo = computed(() => {
    if (props.pagination === false) {
      return null
    }
    const total = processedData.value.length
    return calculatePagination(total, currentPage.value, currentPageSize.value)
  })

  function handleSort(columnKey: string) {
    const column = displayColumns.value.find((col) => col.key === columnKey)
    if (!column || !column.sortable) {
      return
    }

    let newDirection: SortDirection = 'asc'

    if (sortState.value.key === columnKey) {
      if (sortState.value.direction === 'asc') {
        newDirection = 'desc'
      } else if (sortState.value.direction === 'desc') {
        newDirection = null
      }
    }

    const nextSortState: SortState = {
      key: newDirection ? columnKey : null,
      direction: newDirection
    }

    if (!isSortControlled.value) {
      uncontrolledSortState.value = nextSortState
    }

    emit('sort-change', nextSortState)
    emit('change', {
      sort: nextSortState,
      filters: filterState.value,
      pagination:
        props.pagination !== false
          ? {
              current: currentPage.value,
              pageSize: currentPageSize.value
            }
          : null
    })
  }

  function handleFilter(columnKey: string, value: unknown) {
    const nextFilterState = {
      ...filterState.value,
      [columnKey]: value
    }

    if (!isFiltersControlled.value) {
      uncontrolledFilterState.value = nextFilterState
    }

    uncontrolledCurrentPage.value = 1

    emit('filter-change', nextFilterState)
    emit('change', {
      sort: sortState.value,
      filters: nextFilterState,
      pagination:
        props.pagination !== false
          ? {
              current: 1,
              pageSize: currentPageSize.value
            }
          : null
    })
  }

  function handlePageChange(page: number) {
    uncontrolledCurrentPage.value = page

    emit('page-change', { current: page, pageSize: currentPageSize.value })
    emit('change', {
      sort: sortState.value,
      filters: filterState.value,
      pagination: {
        current: page,
        pageSize: currentPageSize.value
      }
    })
  }

  function handlePageSizeChange(pageSize: number) {
    uncontrolledCurrentPageSize.value = pageSize
    uncontrolledCurrentPage.value = 1

    emit('page-change', { current: 1, pageSize })
    emit('change', {
      sort: sortState.value,
      filters: filterState.value,
      pagination: {
        current: 1,
        pageSize
      }
    })
  }

  function handleToggleExpand(key: string | number, record: Record<string, unknown>) {
    const isExpanded = expandedRowKeySet.value.has(key)
    const newKeys = isExpanded
      ? expandedRowKeys.value.filter((k) => k !== key)
      : [...expandedRowKeys.value, key]

    if (!isExpandControlled.value) {
      uncontrolledExpandedRowKeys.value = newKeys
    }
    emit('expand-change', newKeys, record, !isExpanded)
  }

  function handleRowClick(record: Record<string, unknown>, index: number) {
    emit('row-click', record, index)

    if (props.expandable?.expandRowByClick) {
      const key = getRowKey(record, props.rowKey, index)
      const isExpandable = props.expandable?.rowExpandable
        ? props.expandable.rowExpandable(record)
        : true
      if (isExpandable) {
        handleToggleExpand(key, record)
      }
    }
  }

  function handleSelectRow(key: string | number, checked: boolean) {
    let newKeys: (string | number)[]

    if (props.rowSelection?.type === 'radio') {
      newKeys = checked ? [key] : []
    } else {
      if (checked) {
        newKeys = [...selectedRowKeys.value, key]
      } else {
        newKeys = selectedRowKeys.value.filter((k) => k !== key)
      }
    }

    if (!isSelectionControlled.value) {
      uncontrolledSelectedRowKeys.value = newKeys
    }
    emit('selection-change', newKeys)
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      const nextKeys = paginatedRowKeys.value
      if (!isSelectionControlled.value) {
        uncontrolledSelectedRowKeys.value = nextKeys
      }
      emit('selection-change', nextKeys)
    } else {
      if (!isSelectionControlled.value) {
        uncontrolledSelectedRowKeys.value = []
      }
      emit('selection-change', [])
    }
  }

  const allSelected = computed(() => {
    if (paginatedRowKeys.value.length === 0) {
      return false
    }
    return paginatedRowKeys.value.every((key) => selectedRowKeySet.value.has(key))
  })

  const someSelected = computed(() => {
    return selectedRowKeys.value.length > 0 && !allSelected.value
  })

  // --- v0.6.0: editable cell state ---
  const editingCell = ref<{ rowIndex: number; columnKey: string } | null>(null)
  const editingValue = ref<string>('')

  function isCellEditable(columnKey: string, rowIndex: number): boolean {
    if (!props.editable) return false
    if (!props.editableCells) return true
    return !!props.editableCells.get(columnKey)?.has(rowIndex)
  }

  function startEditing(rowIndex: number, columnKey: string, currentValue: unknown) {
    editingCell.value = { rowIndex, columnKey }
    editingValue.value = String(currentValue ?? '')
  }

  function commitEdit() {
    if (editingCell.value) {
      emit(
        'cell-change',
        editingCell.value.rowIndex,
        editingCell.value.columnKey,
        editingValue.value
      )
      editingCell.value = null
    }
  }

  function cancelEdit() {
    editingCell.value = null
  }

  // --- v0.6.0: export ---
  function handleExport() {
    const csv = exportTableToCsv(displayColumns.value, processedData.value)
    downloadCsv(csv, props.exportFilename)
    emit('export', csv)
  }

  // --- v0.6.0: column drag ---
  const dragColumnKey = ref<string | null>(null)

  function handleDragStart(columnKey: string) {
    dragColumnKey.value = columnKey
  }

  function handleDrop(targetKey: string) {
    if (!dragColumnKey.value || dragColumnKey.value === targetKey) return
    const cols = [...displayColumns.value]
    const fromIdx = cols.findIndex((c) => c.key === dragColumnKey.value)
    const toIdx = cols.findIndex((c) => c.key === targetKey)
    if (fromIdx >= 0 && toIdx >= 0) {
      const [moved] = cols.splice(fromIdx, 1)
      cols.splice(toIdx, 0, moved)
      emit('column-order-change', cols)
    }
    dragColumnKey.value = null
  }

  // --- v0.6.0: virtual scroll ---
  const virtualScrollTop = ref(0)

  // Note: getFixedVirtualRange currently used only for future tree-shake/virtual fast path.
  // Keep reference alive to avoid unused-import warnings in ts strict builds.
  void getFixedVirtualRange

  // --- v0.6.0: grouping ---
  const groupedData = computed(() => {
    if (!props.groupBy) return null
    return groupDataByColumn(paginatedData.value, props.groupBy)
  })

  return {
    paginationConfig,
    displayColumns,
    fixedColumnsInfo,
    columnByKey,
    processedData,
    paginatedData,
    paginatedRowKeys,
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
    selectedRowKeys,
    expandedRowKeys,
    editingCell,
    editingValue,
    virtualScrollTop,
    toggleColumnLock,
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
    handleDrop
  }
}
