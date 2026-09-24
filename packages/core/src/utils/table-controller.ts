/**
 * Table submitters and derived view.
 *
 * Vue/React bind DOM, controlled props, and locale. They must not copy this
 * state machine.
 */

import type {
  ExpandableConfig,
  FilterRule,
  PaginationConfig,
  RowSelectionConfig,
  SortDirection,
  SortState,
  TableColumn,
  TableExportScope,
  TableFixedPosition
} from '../types/table'
import { devWarn } from './dev-warn'
import { filterDataAdvanced } from './table-filter-utils'
import {
  buildTableGroupBlocks,
  groupDataByColumn,
  resolveGroupCellValue,
  type TableGroupBlock
} from './table-group-utils'
import {
  calculatePagination,
  filterHiddenColumns,
  filterTableData,
  getFixedColumnOffsets,
  getTableColumnDataKey,
  getTableSelectionState,
  hasTableSelectionColumn,
  orderTableFixedColumns,
  paginateData,
  resolveTableRowKeys,
  sortData,
  tableRowKeyId
} from './table-utils'

export const EMPTY_TABLE_RECORDS: Record<string, unknown>[] = []
export const EMPTY_TABLE_FILTER_RULES: FilterRule[] = []
export const EMPTY_TABLE_HIDDEN_KEYS: string[] = []
export const EMPTY_TABLE_SELECTED_KEYS: (string | number)[] = []
export const EMPTY_TABLE_FILTERS: Record<string, unknown> = {}

export const DEFAULT_TABLE_SORT: SortState = { key: null, direction: null }

/**
 * Default pagination when the Table `pagination` prop is omitted.
 *
 * `total` is left unset so `0` from the caller is distinguishable from “not
 * passed”. Pass `pagination={false}` to hide the pager; three rows still
 * paginate unless that is set.
 */
export const DEFAULT_TABLE_PAGINATION: PaginationConfig = {
  defaultCurrent: 1,
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  showSizeChanger: true,
  showTotal: true
}

export type TableKeyList = (string | number)[]

export function mergeTablePagination(
  pagination: PaginationConfig | false | undefined
): PaginationConfig | false {
  if (pagination === false) return false
  if (pagination === undefined) return DEFAULT_TABLE_PAGINATION
  return { ...DEFAULT_TABLE_PAGINATION, ...pagination }
}

/**
 * Key-list control: `undefined` is uncontrolled, an array (including `[]`) is
 * controlled. `null` / non-arrays warn and behave as a controlled empty list.
 */
export function resolveTableKeyList(
  value: unknown,
  warnKey: string
): { controlled: boolean; keys: TableKeyList } {
  if (value === undefined) {
    return { controlled: false, keys: EMPTY_TABLE_SELECTED_KEYS }
  }
  if (Array.isArray(value)) {
    return { controlled: true, keys: value }
  }
  devWarn(`Table.${warnKey}`, `Table ${warnKey} must be an array or undefined; treating as []`)
  return { controlled: true, keys: EMPTY_TABLE_SELECTED_KEYS }
}

export function getNextTableSortState(current: SortState, columnKey: string): SortState {
  let direction: SortDirection = 'asc'
  if (current.key === columnKey) {
    if (current.direction === 'asc') {
      direction = 'desc'
    } else if (current.direction === 'desc') {
      direction = null
    }
  }
  return {
    key: direction ? columnKey : null,
    direction
  }
}

export function mergeTableFilterValue(
  filters: Record<string, unknown>,
  columnKey: string,
  value: unknown
): Record<string, unknown> {
  return { ...filters, [columnKey]: value }
}

export function getNextTableSelectRowKeys(options: {
  selectedRowKeys: TableKeyList
  key: string | number
  checked: boolean
  type?: 'checkbox' | 'radio'
}): TableKeyList {
  const { selectedRowKeys, key, checked, type } = options
  const id = tableRowKeyId(key)
  if (type === 'radio') {
    return checked ? [key] : []
  }
  if (checked) {
    if (selectedRowKeys.some((item) => tableRowKeyId(item) === id)) return selectedRowKeys
    return [...selectedRowKeys, key]
  }
  return selectedRowKeys.filter((item) => tableRowKeyId(item) !== id)
}

export function getNextTableExpandKeys(
  expandedRowKeys: TableKeyList,
  key: string | number
): { keys: TableKeyList; expanded: boolean } {
  const id = tableRowKeyId(key)
  const expanded = !expandedRowKeys.some((item) => tableRowKeyId(item) === id)
  return {
    expanded,
    keys: expanded
      ? [...expandedRowKeys, key]
      : expandedRowKeys.filter((item) => tableRowKeyId(item) !== id)
  }
}

/**
 * Lock button: a locked column unlocks; an unlocked column relocks to its
 * original edge (`end` stays end) or `start` when it had no original edge.
 */
export function getNextTableColumnFixed(
  current: TableFixedPosition | false | undefined,
  original?: TableFixedPosition | false
): TableFixedPosition | false {
  if (current === 'start' || current === 'end') return false
  return original === 'end' ? 'end' : 'start'
}

export function applyTableColumnOrder<T>(
  columns: TableColumn<T>[],
  order: string[] | undefined
): TableColumn<T>[] {
  if (!order || order.length === 0) return columns
  const byKey = new Map(columns.map((column) => [column.key, column]))
  const seen = new Set<string>()
  const next: TableColumn<T>[] = []
  for (const key of order) {
    const column = byKey.get(key)
    if (column) {
      next.push(column)
      seen.add(key)
    }
  }
  for (const column of columns) {
    if (!seen.has(column.key)) next.push(column)
  }
  return next
}

export function reorderTableColumnsByKey<T>(
  columns: TableColumn<T>[],
  fromKey: string,
  toKey: string
): TableColumn<T>[] {
  if (fromKey === toKey) return columns
  const next = [...columns]
  const fromIdx = next.findIndex((column) => column.key === fromKey)
  const toIdx = next.findIndex((column) => column.key === toKey)
  if (fromIdx < 0 || toIdx < 0) return columns
  const [moved] = next.splice(fromIdx, 1)
  next.splice(toIdx, 0, moved)
  return next
}

export function reorderTableRowsByKey<T>(
  data: T[],
  fromKey: string | number,
  toKey: string | number,
  getKey: (record: T, sourceIndex: number) => string | number
): T[] {
  if (fromKey === toKey) return data
  const keys = data.map((record, index) => getKey(record, index))
  const fromIdx = keys.indexOf(fromKey)
  const toIdx = keys.indexOf(toKey)
  if (fromIdx < 0 || toIdx < 0) return data
  const next = [...data]
  const [moved] = next.splice(fromIdx, 1)
  next.splice(toIdx, 0, moved)
  return next
}

/**
 * Resolve one row. Prefer {@link resolveTableRowKeys} for a list so fallbacks
 * cannot collide with `0` or another numeric id.
 */
export function resolveTableRecordKey<T>(
  record: T,
  sourceIndex: number,
  rowKey: string | ((record: T) => string | number) = 'id',
  getRowKey?: (record: T) => string | number
): string | number {
  return resolveTableRowKeys([record], rowKey, getRowKey, sourceIndex)[0]!
}

export function coerceTableEditValue(original: unknown, raw: string): unknown {
  if (typeof original !== 'number') return raw
  const trimmed = raw.trim()
  if (trimmed === '') return original
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : raw
}

export function getTableCellValue<T>(
  record: T,
  column: Pick<TableColumn<T>, 'key' | 'dataKey'>
): unknown {
  return (record as Record<string, unknown>)[getTableColumnDataKey(column)]
}

export function isTableCellEditable(
  editable: boolean,
  editableCells: Record<string, number[]> | undefined,
  columnKey: string,
  sourceIndex: number
): boolean {
  if (!editable) return false
  if (!editableCells) return true
  return editableCells[columnKey]?.includes(sourceIndex) === true
}

export function commitTableCellEdit<T extends Record<string, unknown>>(
  dataSource: T[],
  sourceIndex: number,
  column: Pick<TableColumn<T>, 'key' | 'dataKey'> | undefined,
  value: unknown
): T[] {
  if (!column || sourceIndex < 0 || sourceIndex >= dataSource.length) return dataSource
  const next = [...dataSource]
  next[sourceIndex] = {
    ...dataSource[sourceIndex],
    [getTableColumnDataKey(column)]: value
  }
  return next
}

export function resolveTablePaginationTotal(
  pagination: PaginationConfig | false,
  processedLength: number
): number {
  if (pagination === false) return processedLength
  if (pagination.remote) {
    return pagination.total ?? 0
  }
  return pagination.total !== undefined ? pagination.total : processedLength
}

export function shouldSkipTableLocalProcessing(pagination: PaginationConfig | false): boolean {
  return pagination !== false && pagination.remote === true && pagination.localProcessing !== true
}

export function applyTableFixedOverrides<T>(
  columns: TableColumn<T>[],
  overrides: Record<string, TableFixedPosition | false>
): TableColumn<T>[] {
  return columns.map((column) => {
    if (!Object.prototype.hasOwnProperty.call(overrides, column.key)) return column
    return { ...column, fixed: overrides[column.key] }
  })
}

export function resolveTableDisplayColumns<T>(options: {
  columns: TableColumn<T>[]
  columnOrder?: string[]
  hiddenColumnKeys?: string[]
  fixedOverrides?: Record<string, TableFixedPosition | false>
}): TableColumn<T>[] {
  const ordered = applyTableColumnOrder(options.columns, options.columnOrder)
  const withFixed = applyTableFixedOverrides(ordered, options.fixedOverrides ?? {})
  return orderTableFixedColumns(
    filterHiddenColumns(withFixed, options.hiddenColumnKeys ?? EMPTY_TABLE_HIDDEN_KEYS)
  )
}

/**
 * Filter, page size, and sort share this page. A controlled page stays on
 * screen until the parent writes it back, so the event must not advertise 1.
 */
export function resolveTableQueryPage(pageControlled: boolean, currentPage: number): number {
  return pageControlled ? currentPage : 1
}

export function resolveTableExportRecords<T>(options: {
  scope: TableExportScope
  pageRecords: T[]
  processedRecords: T[]
  processedKeys: (string | number)[]
  selectedKeys: (string | number)[]
}): T[] {
  if (options.scope === 'page') return options.pageRecords
  if (options.scope === 'selected') {
    const selected = new Set(options.selectedKeys.map((key) => tableRowKeyId(key)))
    return options.processedRecords.filter((record, index) => {
      const key = options.processedKeys[index]
      return key !== undefined && selected.has(tableRowKeyId(key))
    })
  }
  return options.processedRecords
}

/**
 * Loaded-row select. Remote mode does not pretend the other pages are local.
 */
export function resolveTableSelectLoadedKeys(options: {
  remote: boolean
  selectedKeys: TableKeyList
  loadedSelectableKeys: TableKeyList
  checked: boolean
}): { keys: TableKeyList; emitOnly: boolean } {
  if (options.remote) return { keys: options.selectedKeys, emitOnly: true }
  return {
    keys: getNextTableSelectAllKeys(
      options.selectedKeys,
      options.loadedSelectableKeys,
      options.checked
    ),
    emitOnly: false
  }
}

export interface TableIndexedRow<T> {
  record: T
  sourceIndex: number
}

export function indexTableDataSource<T>(dataSource: T[]): TableIndexedRow<T>[] {
  return dataSource.map((record, sourceIndex) => ({ record, sourceIndex }))
}

function lookupSourceIndex<T>(dataSource: T[], record: T): number {
  const index = dataSource.indexOf(record)
  return index >= 0 ? index : 0
}

export interface TableViewInput<T = Record<string, unknown>> {
  columns: TableColumn<T>[]
  dataSource: T[]
  hiddenColumnKeys?: string[]
  columnOrder?: string[]
  fixedOverrides?: Record<string, TableFixedPosition | false>
  filters?: Record<string, unknown>
  sort?: SortState
  filterMode?: 'basic' | 'advanced'
  advancedFilterRules?: FilterRule[]
  groupBy?: string
  pagination?: PaginationConfig | false
  currentPage: number
  currentPageSize: number
  rowKey?: string | ((record: T) => string | number)
  getRowKey?: (record: T) => string | number
  /** Pre-resolved dataSource keys. Width and page updates must not re-run rowKey. */
  sourceRowKeys?: (string | number)[]
  rowSelection?: RowSelectionConfig<T>
  expandable?: ExpandableConfig<T>
  selectedRowKeys?: TableKeyList
  measuredColumnWidths?: Record<string, number>
  containerWidth?: number
  sortLocale?: string
  rowDraggable?: boolean
  sorts?: { key: string; direction: 'asc' | 'desc' }[]
}

export interface TableView<T = Record<string, unknown>> {
  displayColumns: TableColumn<T>[]
  processedData: T[]
  paginatedData: T[]
  pageRowKeys: TableKeyList
  processedRowKeys: TableKeyList
  pageSourceIndices: number[]
  groupBlocks: TableGroupBlock<T>[] | null
  paginationInfo: ReturnType<typeof calculatePagination> | null
  paginationConfig: PaginationConfig | null
  allSelected: boolean
  someSelected: boolean
  selectableRowKeys: TableKeyList
  totalColumnCount: number
  fixedColumnsInfo: ReturnType<typeof getFixedColumnOffsets>
}

function toIndexedRows<T>(dataSource: T[], records: T[]): TableIndexedRow<T>[] {
  return records.map((record) => ({
    record,
    sourceIndex: lookupSourceIndex(dataSource, record)
  }))
}

export function resolveTableProcessedRows<T>(options: {
  dataSource: T[]
  columns: TableColumn<T>[]
  filters: Record<string, unknown>
  sort: SortState
  filterMode: 'basic' | 'advanced'
  advancedFilterRules: FilterRule[]
  skipLocalProcessing: boolean
  sortLocale?: string
  sorts?: { key: string; direction: 'asc' | 'desc' }[]
}): TableIndexedRow<T>[] {
  const { dataSource, columns } = options
  if (options.skipLocalProcessing) {
    return indexTableDataSource(dataSource)
  }

  let records: T[]
  if (options.filterMode === 'advanced') {
    records = filterDataAdvanced(dataSource, options.advancedFilterRules, columns)
  } else {
    records = filterTableData(dataSource, columns, options.filters)
  }

  const levels =
    options.sorts && options.sorts.length > 0
      ? options.sorts
      : options.sort.key && options.sort.direction
        ? [{ key: options.sort.key, direction: options.sort.direction }]
        : []
  for (let level = levels.length - 1; level >= 0; level--) {
    const sortLevel = levels[level]
    const column = columns.find((item) => item.key === sortLevel.key)
    records = sortData(
      records,
      sortLevel.key,
      sortLevel.direction,
      column?.sortFn,
      columns,
      options.sortLocale
    )
  }

  return toIndexedRows(dataSource, records)
}

export function resolveTableView<T>(input: TableViewInput<T>): TableView<T> {
  const columns = input.columns
  const dataSource = input.dataSource
  const pagination = mergeTablePagination(input.pagination)
  const paginationConfig = pagination === false ? null : pagination
  const skipLocal = shouldSkipTableLocalProcessing(pagination)
  const filters = input.filters ?? EMPTY_TABLE_FILTERS
  const sort = input.sort ?? DEFAULT_TABLE_SORT
  const filterMode = input.filterMode ?? 'basic'
  const advancedFilterRules = input.advancedFilterRules ?? EMPTY_TABLE_FILTER_RULES
  const rowKey = input.rowKey ?? 'id'
  const selectedRowKeys = input.selectedRowKeys ?? EMPTY_TABLE_SELECTED_KEYS

  const displayColumns = resolveTableDisplayColumns({
    columns,
    columnOrder: input.columnOrder,
    hiddenColumnKeys: input.hiddenColumnKeys,
    fixedOverrides: input.fixedOverrides
  })

  let processedRows = resolveTableProcessedRows({
    dataSource,
    columns,
    filters,
    sort,
    filterMode,
    advancedFilterRules,
    skipLocalProcessing: skipLocal,
    sortLocale: input.sortLocale,
    sorts: input.sorts
  })

  if (input.groupBy && !skipLocal) {
    const grouped = groupDataByColumn(
      processedRows.map((row) => row.record),
      input.groupBy,
      columns
    )
    const flattened: TableIndexedRow<T>[] = []
    for (const groupRows of grouped.values()) {
      for (const record of groupRows) {
        flattened.push({
          record,
          sourceIndex: lookupSourceIndex(dataSource, record)
        })
      }
    }
    processedRows = flattened
  }

  const processedData = processedRows.map((row) => row.record)
  const sourceKeys =
    input.sourceRowKeys && input.sourceRowKeys.length === dataSource.length
      ? input.sourceRowKeys
      : resolveTableRowKeys(dataSource, rowKey, input.getRowKey)
  const processedRowKeys = processedRows.map((row) => sourceKeys[row.sourceIndex] ?? row.sourceIndex)

  let pageStart = 0
  let pageRows = processedRows
  if (pagination !== false && !pagination.remote) {
    const size = Math.max(1, input.currentPageSize)
    const page = Math.max(1, input.currentPage)
    pageStart = (page - 1) * size
    pageRows = paginateData(processedRows, input.currentPage, input.currentPageSize)
  }

  const paginatedData = pageRows.map((row) => row.record)
  const pageSourceIndices = pageRows.map((row) => row.sourceIndex)
  const pageRowKeys = pageRows.map((row) => sourceKeys[row.sourceIndex] ?? row.sourceIndex)

  const groupBlocks =
    input.groupBy && !skipLocal
      ? buildTableGroupBlocks({
          rows: processedData,
          groupKeys: processedData.map((record) =>
            resolveGroupCellValue(record, input.groupBy as string, columns)
          ),
          pageStart,
          pageEnd: pageStart + pageRows.length
        })
      : null

  const total = resolveTablePaginationTotal(pagination, processedData.length)
  const paginationInfo =
    pagination === false
      ? null
      : calculatePagination(total, input.currentPage, input.currentPageSize)

  const selectionState = getTableSelectionState({
    records: paginatedData,
    rowKeys: pageRowKeys,
    selectedRowKeys,
    getCheckboxProps: input.rowSelection?.getCheckboxProps
  })

  let totalColumnCount = displayColumns.length
  if (hasTableSelectionColumn(input.rowSelection)) totalColumnCount += 1
  if (input.expandable) totalColumnCount += 1
  if (input.rowDraggable) totalColumnCount += 1

  return {
    displayColumns,
    processedData,
    paginatedData,
    pageRowKeys,
    processedRowKeys,
    pageSourceIndices,
    groupBlocks,
    paginationInfo,
    paginationConfig,
    allSelected: selectionState.allSelected,
    someSelected: selectionState.someSelected,
    selectableRowKeys: selectionState.selectableRowKeys,
    totalColumnCount,
    fixedColumnsInfo: getFixedColumnOffsets(
      displayColumns,
      input.measuredColumnWidths,
      input.containerWidth
    )
  }
}

export * from './w9-data'

export function resolveTablePageRow<T>(
  pageSourceIndices: number[],
  paginatedData: T[],
  pageRowKeys: TableKeyList,
  sourceIndex: number
): { pageIndex: number; record: T; key: string | number; sourceIndex: number } | null {
  const pageIndex = pageSourceIndices.indexOf(sourceIndex)
  if (pageIndex < 0) return null
  const record = paginatedData[pageIndex]
  const key = pageRowKeys[pageIndex]
  if (!record || key === undefined) return null
  return { pageIndex, record, key, sourceIndex }
}
