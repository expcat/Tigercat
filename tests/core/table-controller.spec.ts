import { describe, expect, it, vi } from 'vitest'
import {
  commitTableCellEdit,
  getNextTableColumnFixed,
  getNextTableSelectRowKeys,
  getNextTableSortState,
  mergeTablePagination,
  paginateData,
  calculatePagination,
  reorderTableColumnsByKey,
  reorderTableRowsByKey,
  resolveTableKeyList,
  resolveTablePaginationTotal,
  resolveTableRecordKey,
  resolveTableView,
  shouldSkipTableLocalProcessing,
  DEFAULT_TABLE_PAGINATION,
  type TableColumn
} from '@expcat/tigercat-core'

const columns: TableColumn[] = [
  { key: 'nameCol', title: 'Name', dataKey: 'name', sortable: true },
  { key: 'dept', title: 'Dept', dataKey: 'department' },
  { key: 'age', title: 'Age' }
]

const rows = [
  { id: 1, name: 'Carol', department: 'Engineering', age: 31 },
  { id: 2, name: 'Alice', department: 'Design', age: 29 },
  { id: 3, name: 'Bob', department: 'Engineering', age: 35 },
  { id: 4, name: 'Dora', department: 'Design', age: 27 }
]

describe('table controller', () => {
  it('cycles sort null → asc → desc → null', () => {
    const first = getNextTableSortState({ key: null, direction: null }, 'nameCol')
    expect(first).toEqual({ key: 'nameCol', direction: 'asc' })
    const second = getNextTableSortState(first, 'nameCol')
    expect(second).toEqual({ key: 'nameCol', direction: 'desc' })
    expect(getNextTableSortState(second, 'nameCol')).toEqual({ key: null, direction: null })
  })

  it('treats undefined key lists as uncontrolled and null as empty controlled', () => {
    expect(resolveTableKeyList(undefined, 'selectedRowKeys')).toEqual({
      controlled: false,
      keys: []
    })
    expect(resolveTableKeyList([], 'selectedRowKeys')).toEqual({
      controlled: true,
      keys: []
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(resolveTableKeyList(null, 'selectedRowKeys')).toEqual({
      controlled: true,
      keys: []
    })
    warn.mockRestore()
  })

  it('does not append a key that is already selected', () => {
    expect(
      getNextTableSelectRowKeys({
        selectedRowKeys: [1, 2],
        key: 2,
        checked: true
      })
    ).toEqual([1, 2])
  })

  it('lets radio selection clear', () => {
    expect(
      getNextTableSelectRowKeys({
        selectedRowKeys: [2],
        key: 2,
        checked: false,
        type: 'radio'
      })
    ).toEqual([])
  })

  it('falls back to the dataSource index instead of a page offset', () => {
    const record = { name: 'No id' }
    expect(resolveTableRecordKey(record, 11, 'id')).toBe(11)
    expect(resolveTableRecordKey({ id: 7 }, 11, 'id')).toBe(7)
    expect(resolveTableRecordKey({ id: 7 }, 11, 'id', (row) => `k-${row.id}`)).toBe('k-7')
  })

  it('keeps page-2 identity distinct when records have no id', () => {
    const data = [{ name: 'a' }, { name: 'b' }]
    const view = resolveTableView({
      columns: [{ key: 'name', title: 'Name' }],
      dataSource: data,
      pagination: { current: 2, pageSize: 1 },
      currentPage: 2,
      currentPageSize: 1,
      rowKey: 'id'
    })
    expect(view.pageRowKeys).toEqual([1])
    expect(view.pageSourceIndices).toEqual([1])
  })

  it('groups the full processed set before paginating', () => {
    const data = Array.from({ length: 15 }, (_, index) => ({
      id: index + 1,
      name: `E${index}`,
      department: 'Engineering'
    }))
    const view = resolveTableView({
      columns,
      dataSource: data,
      groupBy: 'dept',
      pagination: { current: 2, pageSize: 10 },
      currentPage: 2,
      currentPageSize: 10,
      rowKey: 'id'
    })
    expect(view.paginatedData).toHaveLength(5)
    expect([...(view.groupedData?.keys() ?? [])]).toEqual(['Engineering'])
    expect(view.groupedData?.get('Engineering')).toHaveLength(5)
  })

  it('reads advanced filters and groups through dataKey', () => {
    const filtered = resolveTableView({
      columns,
      dataSource: rows,
      filterMode: 'advanced',
      advancedFilterRules: [{ column: 'nameCol', operator: 'equals', value: 'Alice' }],
      pagination: false,
      currentPage: 1,
      currentPageSize: 10,
      rowKey: 'id'
    })
    expect(filtered.processedData.map((row) => row.name)).toEqual(['Alice'])

    const grouped = resolveTableView({
      columns,
      dataSource: rows,
      groupBy: 'dept',
      pagination: false,
      currentPage: 1,
      currentPageSize: 10,
      rowKey: 'id'
    })
    expect([...(grouped.groupedData?.keys() ?? [])].sort()).toEqual(['Design', 'Engineering'])
  })

  it('does not fall back to column filters when advanced rules are empty', () => {
    const view = resolveTableView({
      columns,
      dataSource: rows,
      filters: { nameCol: 'Alice' },
      filterMode: 'advanced',
      advancedFilterRules: [],
      pagination: false,
      currentPage: 1,
      currentPageSize: 10,
      rowKey: 'id'
    })
    expect(view.processedData).toHaveLength(4)
  })

  it('skips local filter/sort/group in remote mode', () => {
    const view = resolveTableView({
      columns,
      dataSource: rows,
      filters: { nameCol: 'Alice' },
      sort: { key: 'nameCol', direction: 'asc' },
      groupBy: 'dept',
      pagination: { remote: true, total: 0, current: 1, pageSize: 10 },
      currentPage: 1,
      currentPageSize: 10,
      rowKey: 'id'
    })
    expect(view.paginatedData.map((row) => row.name)).toEqual(['Carol', 'Alice', 'Bob', 'Dora'])
    expect(view.groupedData).toBeNull()
    expect(view.paginationInfo?.total).toBe(0)
    expect(view.paginationInfo?.totalPages).toBe(0)
  })

  it('treats remote total 0 as a real total even with leftover rows', () => {
    expect(resolveTablePaginationTotal({ remote: true, total: 0 }, 8)).toBe(0)
    expect(resolveTablePaginationTotal({ total: 0 }, 8)).toBe(0)
    expect(resolveTablePaginationTotal({}, 8)).toBe(8)
  })

  it('merges pagination objects with table defaults and leaves total unset', () => {
    expect(DEFAULT_TABLE_PAGINATION.total).toBeUndefined()
    const merged = mergeTablePagination({ pageSize: 20 })
    expect(merged).toMatchObject({
      pageSize: 20,
      showSizeChanger: true,
      showTotal: true,
      defaultPageSize: 10
    })
    expect(shouldSkipTableLocalProcessing(merged)).toBe(false)
  })

  it('reorders the full column list, including hidden columns', () => {
    const full: TableColumn[] = [
      { key: 'hidden', title: 'Hidden' },
      { key: 'name', title: 'Name' },
      { key: 'age', title: 'Age' }
    ]
    const next = reorderTableColumnsByKey(full, 'age', 'name')
    expect(next.map((column) => column.key)).toEqual(['hidden', 'age', 'name'])
  })

  it('reorders the full dataSource by row key', () => {
    const next = reorderTableRowsByKey(rows, 4, 1, (record) => record.id as number)
    expect(next.map((row) => row.id)).toEqual([4, 1, 2, 3])
  })

  it('writes edits into the dataSource index', () => {
    const next = commitTableCellEdit(rows, 1, columns[0], 'Ada')
    expect(next[1].name).toBe('Ada')
    expect(rows[1].name).toBe('Alice')
  })

  it('relocks a right-fixed column back to the right', () => {
    expect(getNextTableColumnFixed('right', 'right')).toBe(false)
    expect(getNextTableColumnFixed(false, 'right')).toBe('right')
    expect(getNextTableColumnFixed(undefined, undefined)).toBe('left')
  })

  it('clamps paginate current and pageSize', () => {
    expect(paginateData([1, 2, 3], 0, 2)).toEqual([1, 2])
    expect(paginateData([1, 2, 3], 1, 0)).toEqual([1])
    expect(calculatePagination(10, 1, 0).totalPages).toBe(10)
    expect(calculatePagination(0, 1, 10)).toMatchObject({
      total: 0,
      totalPages: 0,
      hasNext: false
    })
  })
})
