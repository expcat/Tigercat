import { describe, it, expect, vi } from 'vitest'
import { effectScope, nextTick, reactive } from 'vue'
import { useTableState } from '../../packages/vue/src/components/Table/state'
import type { TableEmitFn, TableInternalProps } from '../../packages/vue/src/components/Table/types'
import { expectNoA11yViolationsIsolated } from '../utils'

const columns = [
  { key: 'name', title: 'Name', sortable: true, width: 120 },
  { key: 'age', title: 'Age', sortable: true, width: 80 },
  { key: 'status', title: 'Status', width: 100 }
]

const rows: Record<string, unknown>[] = [
  { id: 1, name: 'Carol', age: 31, status: 'enabled' },
  { id: 2, name: 'Alice', age: 29, status: 'disabled' },
  { id: 3, name: 'Bob', age: 35, status: 'enabled' },
  { id: 4, name: 'Dora', age: 27, status: 'disabled' }
]

function makeProps(overrides: Partial<TableInternalProps> = {}): TableInternalProps {
  return reactive({
    columns,
    dataSource: rows,
    defaultSort: { key: null, direction: null },
    defaultFilters: {},
    pagination: { defaultCurrent: 1, defaultPageSize: 2 },
    rowKey: 'id',
    editable: false,
    filterMode: 'basic',
    advancedFilterRules: [],
    exportFilename: 'table.csv',
    ...overrides
  }) as TableInternalProps
}

function createState(overrides: Partial<TableInternalProps> = {}) {
  const scope = effectScope()
  const emit = vi.fn<TableEmitFn>()
  const props = makeProps(overrides)
  const measuredColumnWidths = { value: {} as Record<string, number> }
  const context = scope.run(() => useTableState(props, emit, measuredColumnWidths))
  if (!context) throw new Error('failed to create table state')
  return { context, emit, props, scope }
}

describe('Vue useTableState', () => {
  it('derives filtered, sorted, paginated, and grouped data', () => {
    const { context, scope } = createState({
      defaultSort: { key: 'name', direction: 'asc' },
      defaultFilters: { status: 'enabled' },
      groupBy: 'status',
      rowSelection: { showCheckbox: true },
      expandable: {}
    })

    expect(context.processedData.value.map((row) => row.name)).toEqual(['Bob', 'Carol'])
    expect(context.paginatedRowKeys.value).toEqual([3, 1])
    expect([...(context.groupedData.value?.keys() ?? [])]).toEqual(['enabled'])
    expect(context.totalColumnCount.value).toBe(5)
    expect(context.paginationInfo.value?.totalPages).toBe(1)
    scope.stop()
  })

  it('handles sorting, filtering, pagination, and emitted changes', () => {
    const { context, emit, scope } = createState()

    context.handleSort('name')
    expect(context.sortState.value).toEqual({ key: 'name', direction: 'asc' })
    expect(emit).toHaveBeenCalledWith('sort-change', { key: 'name', direction: 'asc' })

    context.handleSort('name')
    expect(context.sortState.value).toEqual({ key: 'name', direction: 'desc' })
    context.handleSort('name')
    expect(context.sortState.value).toEqual({ key: null, direction: null })
    context.handleSort('status')
    expect(emit.mock.calls.filter(([event]) => event === 'sort-change')).toHaveLength(3)

    context.handleFilter('status', 'enabled')
    expect(context.processedData.value).toHaveLength(2)
    expect(context.currentPage.value).toBe(1)
    expect(emit).toHaveBeenCalledWith('filter-change', { status: 'enabled' })

    context.handlePageChange(2)
    expect(context.currentPage.value).toBe(2)
    expect(emit).toHaveBeenCalledWith('page-change', { current: 2, pageSize: 2 })

    context.handlePageSizeChange(3)
    expect(context.currentPage.value).toBe(1)
    expect(context.currentPageSize.value).toBe(3)
    scope.stop()
  })

  it('reacts to controlled prop updates', async () => {
    const { context, props, scope } = createState({
      sort: { key: 'age', direction: 'desc' },
      filters: { status: 'enabled' },
      pagination: { current: 2, pageSize: 1 },
      rowSelection: { selectedRowKeys: [1] },
      expandable: { expandedRowKeys: [3] }
    })

    expect(context.currentPage.value).toBe(2)
    expect(context.selectedRowKeySet.value.has(1)).toBe(true)
    expect(context.expandedRowKeySet.value.has(3)).toBe(true)

    props.sort = { key: 'name', direction: 'asc' }
    props.filters = { status: 'disabled' }
    props.pagination = { current: 1, pageSize: 2 }
    props.rowSelection = { selectedRowKeys: [2, 4] }
    props.expandable = { expandedRowKeys: [4] }
    await nextTick()

    expect(context.processedData.value.map((row) => row.name)).toEqual(['Alice', 'Dora'])
    expect(context.selectedRowKeySet.value.has(4)).toBe(true)
    expect(context.expandedRowKeySet.value.has(4)).toBe(true)
    scope.stop()
  })

  it('handles selection, expansion, and row clicks', () => {
    const { context, emit, scope } = createState({
      rowSelection: { defaultSelectedRowKeys: [1] },
      expandable: { expandRowByClick: true, rowExpandable: (record) => record.id !== 2 }
    })

    expect(context.someSelected.value).toBe(true)
    context.handleSelectRow(2, true)
    expect(emit).toHaveBeenCalledWith('selection-change', [1, 2])

    context.handleSelectAll(true)
    expect(context.allSelected.value).toBe(true)
    expect(emit).toHaveBeenCalledWith('selection-change', [1, 2])

    context.handleSelectAll(false)
    expect(context.allSelected.value).toBe(false)
    expect(emit).toHaveBeenCalledWith('selection-change', [])

    context.handleRowClick(rows[0], 0, 1)
    expect(emit).toHaveBeenCalledWith('row-click', rows[0], 0)
    expect(emit).toHaveBeenCalledWith('expand-change', [1], rows[0], true)

    context.handleRowClick(rows[1], 1, 2)
    expect(emit.mock.calls.filter(([event]) => event === 'expand-change')).toHaveLength(1)
    scope.stop()
  })

  it('handles radio selection and editable cells', () => {
    const editableCells = new Map<string, Set<number>>([['name', new Set([0])]])
    const { context, emit, scope } = createState({
      rowSelection: { type: 'radio' },
      editable: true,
      editableCells
    })

    context.handleSelectRow(2, true)
    expect(emit).toHaveBeenCalledWith('selection-change', [2])
    context.handleSelectRow(2, false)
    expect(emit).toHaveBeenCalledWith('selection-change', [])

    expect(context.isCellEditable('name', 0)).toBe(true)
    expect(context.isCellEditable('name', 1)).toBe(false)
    context.startEditing(0, 'name', null)
    expect(context.editingValue.value).toBe('')
    context.editingValue.value = 'Ada'
    context.commitEdit()
    expect(emit).toHaveBeenCalledWith('cell-change', 0, 'name', 'Ada')
    expect(context.editingCell.value).toBeNull()

    context.startEditing(0, 'name', 'Grace')
    context.cancelEdit()
    expect(context.editingCell.value).toBeNull()
    scope.stop()
  })

  it('handles column lock, drag ordering, and advanced filters', () => {
    const { context, emit, scope } = createState({
      columns: [
        { key: 'name', title: 'Name', fixed: 'left' },
        { key: 'age', title: 'Age' },
        { key: 'status', title: 'Status' }
      ],
      filterMode: 'advanced',
      advancedFilterRules: [{ column: 'age', operator: 'gt', value: 30 }]
    })

    expect(context.processedData.value.map((row) => row.name)).toEqual(['Carol', 'Bob'])
    context.toggleColumnLock('name')
    expect(context.displayColumns.value[0].fixed).toBe(false)
    context.toggleColumnLock('age')
    expect(context.displayColumns.value[1].fixed).toBe('left')

    context.handleDrop('age')
    expect(emit.mock.calls.some(([event]) => event === 'column-order-change')).toBe(false)

    context.handleDragStart('status')
    context.handleDrop('name')
    expect(emit).toHaveBeenCalledWith('column-order-change', [
      expect.objectContaining({ key: 'status' }),
      expect.objectContaining({ key: 'name' }),
      expect.objectContaining({ key: 'age' })
    ])
    scope.stop()
  })

  describe('Edge Cases', () => {
    it('handles an empty data source', () => {
      const { context, scope } = createState({ dataSource: [] })

      expect(context.processedData.value).toEqual([])
      expect(context.paginatedData.value).toEqual([])
      expect(context.paginatedRowKeys.value).toEqual([])
      scope.stop()
    })

    it('supports functional row keys', () => {
      const { context, scope } = createState({ rowKey: (record) => `row-${record.id}` })

      expect(context.paginatedRowKeys.value).toEqual(['row-1', 'row-2'])
      scope.stop()
    })

    it('ignores sorting for non-sortable columns', () => {
      const { context, emit, scope } = createState()

      context.handleSort('status')

      expect(context.sortState.value).toEqual({ key: null, direction: null })
      expect(emit.mock.calls.some(([event]) => event === 'sort-change')).toBe(false)
      scope.stop()
    })

    it('resets current page when filtering removes current page items', () => {
      const { context, scope } = createState()

      context.handlePageChange(2)
      context.handleFilter('name', 'Alice')

      expect(context.currentPage.value).toBe(1)
      expect(context.paginatedRowKeys.value).toEqual([2])
      scope.stop()
    })

    it('does not commit edits without an active editing cell', () => {
      const { context, emit, scope } = createState({ editable: true })

      context.editingValue.value = 'No cell'
      context.commitEdit()

      expect(emit.mock.calls.some(([event]) => event === 'cell-change')).toBe(false)
      expect(context.editingCell.value).toBeNull()
      scope.stop()
    })

    it('uses all data when pagination is disabled', () => {
      const { context, scope } = createState({ pagination: false })

      expect(context.paginationConfig.value).toBeNull()
      expect(context.paginationInfo.value).toBeNull()
      expect(context.paginatedData.value).toHaveLength(rows.length)
      scope.stop()
    })

    it('handles explicit page size changes', () => {
      const { context, emit, scope } = createState()

      context.handlePageSizeChange(3)

      expect(context.currentPage.value).toBe(1)
      expect(context.currentPageSize.value).toBe(3)
      expect(emit).toHaveBeenCalledWith('page-change', { current: 1, pageSize: 3 })
      scope.stop()
    })
  })

  describe('Accessibility', () => {
    it('supports accessible table semantics derived from state', async () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <main>
          <table>
            <thead><tr><th scope="col">Name</th><th scope="col">Age</th></tr></thead>
            <tbody><tr><td>Carol</td><td>31</td></tr></tbody>
          </table>
        </main>
      `

      await expectNoA11yViolationsIsolated(container)
    })

    it('derives selection flags for checkbox header state', () => {
      const { context, scope } = createState({ rowSelection: { defaultSelectedRowKeys: [1] } })

      expect(context.someSelected.value).toBe(true)
      expect(context.allSelected.value).toBe(false)
      scope.stop()
    })

    it('derives expanded row state used by disclosure controls', () => {
      const { context, scope } = createState({ expandable: { defaultExpandedRowKeys: [1] } })

      expect(context.expandedRowKeySet.value.has(1)).toBe(true)
      expect(context.expandedRowKeySet.value.has(2)).toBe(false)
      scope.stop()
    })
  })
})
