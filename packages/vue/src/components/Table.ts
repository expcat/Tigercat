import { defineComponent, computed, ref, watch, h, PropType, type VNodeChild } from 'vue'
import {
  classNames,
  getTableWrapperClasses,
  getTableHeaderClasses,
  getTableHeaderCellClasses,
  getTableRowClasses,
  getTableCellClasses,
  getFixedColumnOffsets,
  getSortIconClasses,
  getCheckboxCellClasses,
  getExpandIconCellClasses,
  getExpandIconClasses,
  getExpandedRowClasses,
  getExpandedRowContentClasses,
  tableBaseClasses,
  tableEmptyStateClasses,
  tableLoadingOverlayClasses,
  getSpinnerSVG,
  normalizeSvgAttrs,
  getLoadingOverlaySpinnerClasses,
  tableSummaryRowClasses,
  getEditableCellClasses,
  editableCellInputClasses,
  tableExportButtonClasses,
  // Icon constants
  icon16ViewBox,
  icon24ViewBox,
  sortAscIcon16PathD,
  sortDescIcon16PathD,
  sortBothIcon16PathD,
  expandChevronIcon16PathD,
  lockClosedIcon24PathD,
  lockOpenIcon24PathD,
  sortData,
  filterData,
  paginateData,
  calculatePagination,
  getRowKey,
  filterDataAdvanced,
  groupDataByColumn,
  tableGroupHeaderClasses,
  getGroupHeaderCellClasses,
  exportTableToCsv,
  downloadCsv,
  getFixedVirtualRange,
  // Simple pagination style utilities
  getSimplePaginationContainerClasses,
  getSimplePaginationTotalClasses,
  getSimplePaginationControlsClasses,
  getSimplePaginationSelectClasses,
  getSimplePaginationButtonClasses,
  getSimplePaginationPageIndicatorClasses,
  getSimplePaginationButtonsWrapperClasses,
  type TableColumn,
  type TableSize,
  type SortDirection,
  type SortState,
  type PaginationConfig,
  type RowSelectionConfig,
  type ExpandableConfig,
  type FilterRule
} from '@expcat/tigercat-core'

const spinnerSvg = getSpinnerSVG('spinner')

export interface VueTableProps {
  columns: TableColumn[]
  columnLockable?: boolean
  dataSource?: Record<string, unknown>[]
  sort?: SortState
  defaultSort?: SortState
  filters?: Record<string, unknown>
  defaultFilters?: Record<string, unknown>
  size?: TableSize
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  loading?: boolean
  emptyText?: string
  pagination?: PaginationConfig | false
  rowSelection?: RowSelectionConfig
  expandable?: ExpandableConfig
  rowKey?: string | ((record: Record<string, unknown>) => string | number)
  rowClassName?: string | ((record: Record<string, unknown>, index: number) => string)
  stickyHeader?: boolean
  maxHeight?: string | number
  // v0.6.0
  virtual?: boolean
  virtualHeight?: number
  virtualItemHeight?: number
  editable?: boolean
  editableCells?: Map<string, Set<number>>
  filterMode?: 'basic' | 'advanced'
  advancedFilterRules?: FilterRule[]
  columnDraggable?: boolean
  summaryRow?: { show: boolean; data: Record<string, unknown> }
  groupBy?: string
  exportable?: boolean
  exportFilename?: string
}

// Sort icon
const SortIcon = (direction: SortDirection) => {
  const active = direction !== null
  const pathD =
    direction === 'asc'
      ? sortAscIcon16PathD
      : direction === 'desc'
        ? sortDescIcon16PathD
        : sortBothIcon16PathD

  return h(
    'svg',
    {
      class: getSortIconClasses(active),
      width: '16',
      height: '16',
      viewBox: icon16ViewBox,
      fill: 'currentColor'
    },
    [h('path', { d: pathD })]
  )
}

const LockIcon = (locked: boolean) => {
  return h(
    'svg',
    {
      width: '14',
      height: '14',
      viewBox: icon24ViewBox,
      fill: 'currentColor',
      'aria-hidden': 'true'
    },
    [h('path', { d: locked ? lockClosedIcon24PathD : lockOpenIcon24PathD })]
  )
}

const ExpandIcon = (expanded: boolean) => {
  return h(
    'svg',
    {
      class: getExpandIconClasses(expanded),
      width: '16',
      height: '16',
      viewBox: icon16ViewBox,
      fill: 'currentColor',
      'aria-hidden': 'true'
    },
    [h('path', { d: expandChevronIcon16PathD })]
  )
}

// Loading spinner
const LoadingSpinner = () => {
  return h(
    'svg',
    {
      class: getLoadingOverlaySpinnerClasses(),
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: spinnerSvg.viewBox
    },
    spinnerSvg.elements.map((el) => h(el.type, normalizeSvgAttrs(el.attrs)))
  )
}

export const Table = defineComponent({
  name: 'TigerTable',
  props: {
    /**
     * Table columns configuration
     */
    columns: {
      type: Array as PropType<TableColumn[]>,
      required: true
    },

    /**
     * Whether to show a lock button in each column header.
     */
    columnLockable: {
      type: Boolean,
      default: false
    },
    /**
     * Table data source
     */
    dataSource: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => []
    },

    /**
     * Controlled sort state.
     */
    sort: {
      type: Object as PropType<SortState>
    },

    /**
     * Default sort state for uncontrolled mode.
     */
    defaultSort: {
      type: Object as PropType<SortState>,
      default: () => ({
        key: null,
        direction: null
      })
    },

    /**
     * Controlled filters.
     */
    filters: {
      type: Object as PropType<Record<string, unknown>>
    },

    /**
     * Default filters for uncontrolled mode.
     */
    defaultFilters: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({})
    },
    /**
     * Table size
     */
    size: {
      type: String as PropType<TableSize>,
      default: 'md' as TableSize
    },
    /**
     * Whether to show border
     */
    bordered: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to show striped rows
     */
    striped: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to highlight row on hover
     */
    hoverable: {
      type: Boolean,
      default: true
    },
    /**
     * Loading state
     */
    loading: {
      type: Boolean,
      default: false
    },
    /**
     * Empty state text
     */
    emptyText: {
      type: String,
      default: 'No data'
    },
    /**
     * Pagination configuration
     */
    pagination: {
      type: [Object, Boolean] as PropType<PaginationConfig | false>,
      default: () => ({
        current: 1,
        pageSize: 10,
        total: 0,
        pageSizeOptions: [10, 20, 50, 100],
        showSizeChanger: true,
        showTotal: true
      })
    },
    /**
     * Row selection configuration
     */
    rowSelection: {
      type: Object as PropType<RowSelectionConfig>
    },
    /**
     * Row expansion configuration
     */
    expandable: {
      type: Object as PropType<ExpandableConfig>
    },
    /**
     * Function to get row key
     */
    rowKey: {
      type: [String, Function] as PropType<
        string | ((record: Record<string, unknown>) => string | number)
      >,
      default: 'id'
    },
    /**
     * Custom row class name
     */
    rowClassName: {
      type: [String, Function] as PropType<
        string | ((record: Record<string, unknown>, index: number) => string)
      >
    },
    /**
     * Whether table head is sticky
     */
    stickyHeader: {
      type: Boolean,
      default: false
    },
    /**
     * Max height for scrollable table
     */
    maxHeight: {
      type: [String, Number] as PropType<string | number>
    },
    /**
     * Table layout algorithm
     */
    tableLayout: {
      type: String as PropType<'auto' | 'fixed'>,
      default: 'auto'
    },
    // --- v0.6.0 props ---
    virtual: { type: Boolean, default: false },
    virtualHeight: { type: Number, default: 400 },
    virtualItemHeight: { type: Number, default: 40 },
    editable: { type: Boolean, default: false },
    editableCells: { type: Object as PropType<Map<string, Set<number>>> },
    filterMode: { type: String as PropType<'basic' | 'advanced'>, default: 'basic' },
    advancedFilterRules: { type: Array as PropType<FilterRule[]>, default: () => [] },
    columnDraggable: { type: Boolean, default: false },
    summaryRow: { type: Object as PropType<{ show: boolean; data: Record<string, unknown> }> },
    groupBy: { type: String },
    exportable: { type: Boolean, default: false },
    exportFilename: { type: String, default: 'export' }
  },
  emits: [
    'change',
    'row-click',
    'selection-change',
    'sort-change',
    'filter-change',
    'page-change',
    'expand-change',
    'cell-change',
    'column-order-change',
    'export'
  ],
  setup(props, { emit, slots }) {
    const paginationConfig = computed(() => {
      return props.pagination !== false && typeof props.pagination === 'object'
        ? props.pagination
        : null
    })

    const isSortControlled = computed(() => props.sort !== undefined)
    const isFiltersControlled = computed(() => props.filters !== undefined)
    const _isCurrentPageControlled = computed(() => paginationConfig.value?.current !== undefined)
    const _isPageSizeControlled = computed(() => paginationConfig.value?.pageSize !== undefined)
    const isSelectionControlled = computed(() => props.rowSelection?.selectedRowKeys !== undefined)
    const isExpandControlled = computed(() => props.expandable?.expandedRowKeys !== undefined)

    const uncontrolledSortState = ref<SortState>(props.defaultSort)
    const uncontrolledFilterState = ref<Record<string, unknown>>(props.defaultFilters)

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

    const displayColumns = computed(() => {
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

    const columnByKey = computed(() => {
      const map: Record<string, (typeof displayColumns.value)[number]> = {}
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

    // Process data with sorting, filtering, and pagination
    const processedData = computed(() => {
      let data = props.dataSource

      // Apply filters (basic or advanced)
      if (props.filterMode === 'advanced' && props.advancedFilterRules.length > 0) {
        data = filterDataAdvanced(data, props.advancedFilterRules)
      } else {
        data = filterData(data, filterState.value)
      }

      // Apply sorting
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

      // Reset to first page when filtering
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

    function handleRowClick(record: Record<string, unknown>, index: number) {
      emit('row-click', record, index)

      // Toggle expand on row click if expandRowByClick is enabled
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
    const _virtualRange = computed(() => {
      if (!props.virtual) return null
      return getFixedVirtualRange(
        virtualScrollTop.value,
        props.virtualHeight,
        props.virtualItemHeight,
        paginatedData.value.length,
        5
      )
    })

    // --- v0.6.0: grouping ---
    const groupedData = computed(() => {
      if (!props.groupBy) return null
      return groupDataByColumn(paginatedData.value, props.groupBy)
    })

    function renderSummaryRow() {
      if (!props.summaryRow?.show) return null
      const emptyCells = []
      if (props.rowSelection) {
        emptyCells.push(h('td', { class: getTableCellClasses(props.size, 'left') }))
      }
      if (props.expandable) {
        emptyCells.push(h('td', { class: getTableCellClasses(props.size, 'left') }))
      }
      const dataCells = displayColumns.value.map((col) => {
        const dataKey = col.dataKey || col.key
        const val = props.summaryRow!.data[dataKey]
        return h(
          'td',
          {
            key: col.key,
            class: getTableCellClasses(props.size, col.align || 'left', col.className)
          },
          val != null ? String(val) : ''
        )
      })
      return h('tfoot', [h('tr', { class: tableSummaryRowClasses }, [...emptyCells, ...dataCells])])
    }

    function renderTableHeader() {
      const headerCells = []
      const expandAtStart = props.expandable && props.expandable.expandIconPosition !== 'end'
      const expandAtEnd = props.expandable && props.expandable.expandIconPosition === 'end'
      const expandHeaderTh = props.expandable
        ? h('th', {
            class: getExpandIconCellClasses(props.size),
            'aria-label': 'Expand'
          })
        : null

      // Expand column header (start position - default)
      if (expandAtStart && expandHeaderTh) {
        headerCells.push(expandHeaderTh)
      }

      // Selection checkbox column
      if (
        props.rowSelection &&
        props.rowSelection.showCheckbox !== false &&
        props.rowSelection.type !== 'radio'
      ) {
        headerCells.push(
          h(
            'th',
            {
              class: getCheckboxCellClasses(props.size)
            },
            [
              h('input', {
                type: 'checkbox',
                class:
                  'rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]',
                checked: allSelected.value,
                indeterminate: someSelected.value,
                onChange: (e: Event) => handleSelectAll((e.target as HTMLInputElement).checked)
              })
            ]
          )
        )
      }

      // Column headers
      displayColumns.value.forEach((column) => {
        const isSorted = sortState.value.key === column.key
        const sortDirection = isSorted ? sortState.value.direction : null

        const ariaSort = column.sortable
          ? sortDirection === 'asc'
            ? 'ascending'
            : sortDirection === 'desc'
              ? 'descending'
              : 'none'
          : undefined

        const isFixedLeft = column.fixed === 'left'
        const isFixedRight = column.fixed === 'right'
        const fixedStyle = isFixedLeft
          ? {
              position: 'sticky',
              left: `${fixedColumnsInfo.value.leftOffsets[column.key] || 0}px`,
              zIndex: 15
            }
          : isFixedRight
            ? {
                position: 'sticky',
                right: `${fixedColumnsInfo.value.rightOffsets[column.key] || 0}px`,
                zIndex: 15
              }
            : undefined

        const widthStyle = column.width
          ? {
              width: typeof column.width === 'number' ? `${column.width}px` : column.width
            }
          : undefined

        const style = fixedStyle ? { ...widthStyle, ...fixedStyle } : widthStyle

        const headerContent: VNodeChild[] = []

        const slotContent = slots[`header-${column.key}`]?.()
        if (slotContent && slotContent.length > 0) {
          headerContent.push(...slotContent)
        } else if (column.renderHeader) {
          headerContent.push(column.renderHeader() as VNodeChild)
        } else {
          headerContent.push(column.title)
        }

        if (props.columnLockable) {
          headerContent.push(
            h(
              'button',
              {
                type: 'button',
                class: classNames(
                  'inline-flex items-center',
                  column.fixed === 'left' || column.fixed === 'right'
                    ? 'text-[var(--tiger-primary,#2563eb)]'
                    : 'text-gray-400 hover:text-gray-700'
                ),
                'aria-label':
                  column.fixed === 'left' || column.fixed === 'right'
                    ? `Unlock column ${column.title}`
                    : `Lock column ${column.title}`,
                onClick: (e: Event) => {
                  e.stopPropagation()
                  toggleColumnLock(column.key)
                }
              },
              [LockIcon(column.fixed === 'left' || column.fixed === 'right')]
            )
          )
        }

        if (column.sortable) {
          headerContent.push(SortIcon(sortDirection))
        }

        headerCells.push(
          h(
            'th',
            {
              key: column.key,
              'aria-sort': ariaSort,
              class: classNames(
                getTableHeaderCellClasses(
                  props.size,
                  column.align || 'left',
                  !!column.sortable,
                  column.headerClassName
                ),
                (isFixedLeft || isFixedRight) && 'bg-[var(--tiger-surface-muted,#f9fafb)]'
              ),
              style,
              draggable: props.columnDraggable ? 'true' : undefined,
              onDragstart: props.columnDraggable ? () => handleDragStart(column.key) : undefined,
              onDragover: props.columnDraggable ? (e: DragEvent) => e.preventDefault() : undefined,
              onDrop: props.columnDraggable ? () => handleDrop(column.key) : undefined,
              onClick: column.sortable ? () => handleSort(column.key) : undefined
            },
            [
              h('div', { class: 'flex items-center gap-2' }, headerContent),
              // Filter input
              ...(column.filter
                ? [
                    h('div', { class: 'mt-2' }, [
                      column.filter.type === 'select' && column.filter.options
                        ? h(
                            'select',
                            {
                              class: 'w-full px-2 py-1 text-sm border border-gray-300 rounded',
                              onChange: (e: Event) =>
                                handleFilter(column.key, (e.target as HTMLSelectElement).value),
                              onClick: (e: Event) => e.stopPropagation()
                            },
                            [
                              h('option', { value: '' }, 'All'),
                              ...column.filter.options.map((opt) =>
                                h('option', { value: opt.value }, opt.label)
                              )
                            ]
                          )
                        : h('input', {
                            type: 'text',
                            class: 'w-full px-2 py-1 text-sm border border-gray-300 rounded',
                            placeholder: column.filter.placeholder || 'Filter...',
                            onInput: (e: Event) =>
                              handleFilter(column.key, (e.target as HTMLInputElement).value),
                            onClick: (e: Event) => e.stopPropagation()
                          })
                    ])
                  ]
                : [])
            ]
          )
        )
      })

      // Expand column header (end position)
      if (expandAtEnd && expandHeaderTh) {
        headerCells.push(expandHeaderTh)
      }

      return h('thead', { class: getTableHeaderClasses(props.stickyHeader) }, [
        h('tr', headerCells)
      ])
    }

    function renderTableBody() {
      if (props.loading) {
        return null
      }

      if (paginatedData.value.length === 0) {
        return h('tbody', [
          h('tr', [
            h(
              'td',
              {
                colspan: totalColumnCount.value,
                class: tableEmptyStateClasses
              },
              [
                h(
                  'div',
                  {
                    role: 'status',
                    'aria-live': 'polite'
                  },
                  props.emptyText
                )
              ]
            )
          ])
        ])
      }

      // Render a single data row with all features (selection, expand, editable, fixed columns)
      function renderDataRow(record: Record<string, unknown>, index: number) {
        const key = getRowKey(record, props.rowKey, index)
        const isSelected = selectedRowKeySet.value.has(key)
        const isExpanded = expandedRowKeySet.value.has(key)
        const isRowExpandable = props.expandable
          ? props.expandable.rowExpandable
            ? props.expandable.rowExpandable(record)
            : true
          : false
        const rowClass =
          typeof props.rowClassName === 'function'
            ? props.rowClassName(record, index)
            : props.rowClassName

        const cells = []
        const expandAtStart = props.expandable && props.expandable.expandIconPosition !== 'end'

        const expandToggleCell = props.expandable
          ? h(
              'td',
              {
                class: getExpandIconCellClasses(props.size)
              },
              isRowExpandable
                ? [
                    h(
                      'button',
                      {
                        type: 'button',
                        class: 'inline-flex items-center justify-center',
                        'aria-label': isExpanded ? 'Collapse row' : 'Expand row',
                        'aria-expanded': isExpanded,
                        onClick: (e: Event) => {
                          e.stopPropagation()
                          handleToggleExpand(key, record)
                        }
                      },
                      [ExpandIcon(isExpanded)]
                    )
                  ]
                : []
            )
          : null

        // Expand toggle cell (start position - default)
        if (expandAtStart && expandToggleCell) {
          cells.push(expandToggleCell)
        }

        // Selection checkbox cell
        if (props.rowSelection && props.rowSelection.showCheckbox !== false) {
          const checkboxProps = props.rowSelection?.getCheckboxProps?.(record) || {}

          cells.push(
            h(
              'td',
              {
                class: getCheckboxCellClasses(props.size)
              },
              [
                h('input', {
                  type: props.rowSelection?.type === 'radio' ? 'radio' : 'checkbox',
                  class:
                    props.rowSelection?.type === 'radio'
                      ? 'border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]'
                      : 'rounded border-gray-300 text-[var(--tiger-primary,#2563eb)] focus:ring-[var(--tiger-primary,#2563eb)]',
                  checked: isSelected,
                  disabled: checkboxProps.disabled,
                  onClick: (e: Event) => e.stopPropagation(),
                  onChange: (e: Event) =>
                    handleSelectRow(key, (e.target as HTMLInputElement).checked)
                })
              ]
            )
          )
        }

        // Data cells
        displayColumns.value.forEach((column) => {
          const dataKey = column.dataKey || column.key
          const cellValue = record[dataKey]

          const isFixedLeft = column.fixed === 'left'
          const isFixedRight = column.fixed === 'right'
          const fixedStyle = isFixedLeft
            ? {
                position: 'sticky',
                left: `${fixedColumnsInfo.value.leftOffsets[column.key] || 0}px`,
                zIndex: 10
              }
            : isFixedRight
              ? {
                  position: 'sticky',
                  right: `${fixedColumnsInfo.value.rightOffsets[column.key] || 0}px`,
                  zIndex: 10
                }
              : undefined

          const widthStyle = column.width
            ? {
                width: typeof column.width === 'number' ? `${column.width}px` : column.width
              }
            : undefined

          const style = fixedStyle ? { ...widthStyle, ...fixedStyle } : widthStyle

          const stickyBgClass =
            props.striped && index % 2 === 0
              ? 'bg-[var(--tiger-surface-muted,#f9fafb)]/50'
              : 'bg-[var(--tiger-surface,#ffffff)]'
          const stickyCellClass =
            isFixedLeft || isFixedRight
              ? classNames(
                  stickyBgClass,
                  props.hoverable && 'group-hover:bg-[var(--tiger-surface-muted,#f9fafb)]'
                )
              : undefined

          const isEditing =
            editingCell.value?.rowIndex === index && editingCell.value?.columnKey === column.key
          const isEditableCell = isCellEditable(column.key, index)

          const cellContent = isEditing
            ? h('input', {
                type: 'text',
                class: editableCellInputClasses,
                value: editingValue.value,
                autofocus: true,
                onInput: (e: Event) => {
                  editingValue.value = (e.target as HTMLInputElement).value
                },
                onBlur: () => commitEdit(),
                onKeydown: (e: KeyboardEvent) => {
                  if (e.key === 'Enter') commitEdit()
                  if (e.key === 'Escape') cancelEdit()
                }
              })
            : (slots[`cell-${column.key}`]?.({ record, index }) ??
              (column.render ? (column.render(record, index) as string) : (cellValue as string)))

          cells.push(
            h(
              'td',
              {
                key: column.key,
                class: classNames(
                  getTableCellClasses(props.size, column.align || 'left', column.className),
                  stickyCellClass,
                  isEditableCell && !isEditing && getEditableCellClasses(false)
                ),
                style,
                onDblclick:
                  isEditableCell && !isEditing
                    ? () => startEditing(index, column.key, cellValue)
                    : undefined
              },
              [cellContent]
            )
          )
        })

        // Expand toggle cell (end position)
        if (!expandAtStart && expandToggleCell) {
          cells.push(expandToggleCell)
        }

        const rowNode = h(
          'tr',
          {
            key,
            class: classNames(
              getTableRowClasses(props.hoverable, props.striped, index % 2 === 0, rowClass),
              fixedColumnsInfo.value.hasFixedColumns && 'group'
            ),
            onClick: () => handleRowClick(record, index)
          },
          cells
        )

        // Expanded row content
        if (props.expandable && isExpanded && isRowExpandable) {
          const expandedContent =
            slots['expanded-row']?.({ record, index }) ||
            (props.expandable.expandedRowRender
              ? props.expandable.expandedRowRender(record, index)
              : null)

          const expandedRow = h(
            'tr',
            {
              key: `${key}-expanded`,
              class: getExpandedRowClasses()
            },
            [
              h(
                'td',
                {
                  colspan: totalColumnCount.value,
                  class: getExpandedRowContentClasses(props.size)
                },
                [expandedContent as VNodeChild]
              )
            ]
          )

          return [rowNode, expandedRow]
        }

        return rowNode
      }

      // Grouping support
      if (groupedData.value) {
        const groupRows: VNodeChild[] = []
        for (const [groupKey, groupItems] of groupedData.value) {
          groupRows.push(
            h('tr', { key: `group-${groupKey}`, class: tableGroupHeaderClasses }, [
              h(
                'td',
                {
                  colspan: totalColumnCount.value,
                  class: getGroupHeaderCellClasses(props.size)
                },
                `${props.groupBy}: ${groupKey} (${groupItems.length})`
              )
            ])
          )
          groupItems.forEach((record, i) => {
            const globalIndex = paginatedData.value.indexOf(record)
            const result = renderDataRow(record, globalIndex >= 0 ? globalIndex : i)
            if (Array.isArray(result)) {
              groupRows.push(...result)
            } else {
              groupRows.push(result)
            }
          })
        }
        return h('tbody', groupRows)
      }

      const rows = paginatedData.value.flatMap((record, index) => renderDataRow(record, index))

      return h('tbody', rows)
    }

    function renderPagination() {
      if (props.pagination === false || !paginationInfo.value) {
        return null
      }

      const { totalPages, startIndex, endIndex, hasNext, hasPrev } = paginationInfo.value
      const total = processedData.value.length
      const paginationConfig = props.pagination as PaginationConfig

      return h('div', { class: getSimplePaginationContainerClasses() }, [
        // Total info
        paginationConfig.showTotal !== false &&
          h(
            'div',
            { class: getSimplePaginationTotalClasses() },
            paginationConfig.totalText
              ? paginationConfig.totalText(total, [startIndex, endIndex])
              : `Showing ${startIndex} to ${endIndex} of ${total} results`
          ),

        // Pagination controls
        h('div', { class: getSimplePaginationControlsClasses() }, [
          // Page size selector
          paginationConfig.showSizeChanger !== false &&
            h(
              'select',
              {
                class: getSimplePaginationSelectClasses(),
                value: currentPageSize.value,
                onChange: (e: Event) =>
                  handlePageSizeChange(Number((e.target as HTMLSelectElement).value))
              },
              (paginationConfig.pageSizeOptions || [10, 20, 50, 100]).map((size) =>
                h('option', { value: size }, `${size} / page`)
              )
            ),

          // Page buttons
          h('div', { class: getSimplePaginationButtonsWrapperClasses() }, [
            // Previous button
            h(
              'button',
              {
                class: getSimplePaginationButtonClasses(!hasPrev),
                disabled: !hasPrev,
                onClick: () => handlePageChange(currentPage.value - 1)
              },
              'Previous'
            ),

            // Current page indicator
            h(
              'span',
              { class: getSimplePaginationPageIndicatorClasses() },
              `Page ${currentPage.value} of ${totalPages}`
            ),

            // Next button
            h(
              'button',
              {
                class: getSimplePaginationButtonClasses(!hasNext),
                disabled: !hasNext,
                onClick: () => handlePageChange(currentPage.value + 1)
              },
              'Next'
            )
          ])
        ])
      ])
    }

    return () => {
      const wrapperStyle = props.maxHeight
        ? {
            maxHeight:
              typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
          }
        : undefined

      const tableChildren = [renderTableHeader(), renderTableBody(), renderSummaryRow()]

      // Virtual scroll wrapper
      const tableContent = props.virtual
        ? h(
            'div',
            {
              style: { height: `${props.virtualHeight}px`, overflow: 'auto' },
              onScroll: (e: Event) => {
                virtualScrollTop.value = (e.target as HTMLElement).scrollTop
              }
            },
            [
              h(
                'table',
                {
                  class: classNames(
                    tableBaseClasses,
                    props.tableLayout === 'fixed' ? 'table-fixed' : 'table-auto'
                  ),
                  style:
                    fixedColumnsInfo.value.hasFixedColumns && fixedColumnsInfo.value.minTableWidth
                      ? { minWidth: `${fixedColumnsInfo.value.minTableWidth}px` }
                      : undefined
                },
                tableChildren
              )
            ]
          )
        : h(
            'table',
            {
              class: classNames(
                tableBaseClasses,
                props.tableLayout === 'fixed' ? 'table-fixed' : 'table-auto'
              ),
              style:
                fixedColumnsInfo.value.hasFixedColumns && fixedColumnsInfo.value.minTableWidth
                  ? { minWidth: `${fixedColumnsInfo.value.minTableWidth}px` }
                  : undefined
            },
            tableChildren
          )

      return h(
        'div',
        {
          class: getTableWrapperClasses(props.bordered, props.maxHeight),
          style: wrapperStyle,
          'aria-busy': props.loading
        },
        [
          // Export button
          props.exportable &&
            h('div', { class: 'flex justify-end p-2' }, [
              h(
                'button',
                {
                  type: 'button',
                  class: tableExportButtonClasses,
                  onClick: handleExport,
                  'aria-label': 'Export to CSV'
                },
                'Export CSV'
              )
            ]),

          tableContent,

          // Loading overlay
          props.loading &&
            h(
              'div',
              {
                class: tableLoadingOverlayClasses,
                role: 'status',
                'aria-live': 'polite',
                'aria-label': 'Loading'
              },
              [LoadingSpinner(), h('span', { class: 'sr-only' }, 'Loading')]
            ),

          // Pagination
          renderPagination()
        ]
      )
    }
  }
})

export default Table
