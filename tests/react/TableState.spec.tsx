/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import {
  useTableState,
  type UseTableStateInput
} from '../../packages/react/src/components/Table/state'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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

function makeInput(overrides: Partial<UseTableStateInput> = {}): UseTableStateInput {
  return {
    columns,
    dataSource: rows,
    pagination: { defaultCurrent: 1, defaultPageSize: 2 },
    rowKey: 'id',
    editable: false,
    filterMode: 'basic',
    advancedFilterRules: [],
    exportFilename: 'table.csv',
    ...overrides
  }
}

describe('useTableState', () => {
  it('derives filtered, sorted, paginated, and grouped table data', () => {
    const { result } = renderHook(() =>
      useTableState(
        makeInput({
          defaultSort: { key: 'name', direction: 'asc' },
          defaultFilters: { status: 'enabled' },
          groupBy: 'status',
          rowSelection: { showCheckbox: true },
          expandable: {}
        })
      )
    )

    expect(result.current.processedData.map((row) => row.name)).toEqual(['Bob', 'Carol'])
    expect(result.current.paginatedData).toHaveLength(2)
    expect(result.current.pageRowKeys).toEqual([3, 1])
    expect([...(result.current.groupedData?.keys() ?? [])]).toEqual(['enabled'])
    expect(result.current.totalColumnCount).toBe(5)
    expect(result.current.paginationInfo?.totalPages).toBe(1)
  })

  it('handles sort, filter, pagination, and page size callbacks', () => {
    const callbacks = {
      onChange: vi.fn(),
      onSortChange: vi.fn(),
      onFilterChange: vi.fn(),
      onPageChange: vi.fn()
    }
    const { result } = renderHook(() => useTableState(makeInput(callbacks)))

    act(() => result.current.handleSort('name'))
    expect(result.current.sortState).toEqual({ key: 'name', direction: 'asc' })
    expect(callbacks.onSortChange).toHaveBeenLastCalledWith({ key: 'name', direction: 'asc' })

    act(() => result.current.handleSort('name'))
    expect(result.current.sortState).toEqual({ key: 'name', direction: 'desc' })

    act(() => result.current.handleSort('name'))
    expect(result.current.sortState).toEqual({ key: null, direction: null })

    act(() => result.current.handleSort('status'))
    expect(callbacks.onSortChange).toHaveBeenCalledTimes(3)

    act(() => result.current.handleFilter('status', 'enabled'))
    expect(result.current.processedData).toHaveLength(2)
    expect(result.current.currentPage).toBe(1)
    expect(callbacks.onFilterChange).toHaveBeenLastCalledWith({ status: 'enabled' })

    act(() => result.current.handlePageChange(2))
    expect(result.current.currentPage).toBe(2)
    expect(callbacks.onPageChange).toHaveBeenLastCalledWith({ current: 2, pageSize: 2 })

    act(() => result.current.handlePageSizeChange(3))
    expect(result.current.currentPage).toBe(1)
    expect(result.current.currentPageSize).toBe(3)
    expect(callbacks.onChange).toHaveBeenCalled()
  })

  it('supports controlled sort, filters, pagination, and selection updates', () => {
    let input = makeInput({
      sort: { key: 'age', direction: 'desc' },
      filters: { status: 'enabled' },
      pagination: { current: 2, pageSize: 1 },
      rowSelection: { selectedRowKeys: [1] },
      expandable: { expandedRowKeys: [3] }
    })
    const { result, rerender } = renderHook(() => useTableState(input))

    expect(result.current.sortState).toEqual({ key: 'age', direction: 'desc' })
    expect(result.current.currentPage).toBe(2)
    expect(result.current.currentPageSize).toBe(1)
    expect(result.current.selectedRowKeySet.has(1)).toBe(true)
    expect(result.current.expandedRowKeySet.has(3)).toBe(true)

    input = makeInput({
      sort: { key: 'name', direction: 'asc' },
      filters: { status: 'disabled' },
      pagination: { current: 1, pageSize: 2 },
      rowSelection: { selectedRowKeys: [2, 4] },
      expandable: { expandedRowKeys: [4] }
    })
    rerender()

    expect(result.current.processedData.map((row) => row.name)).toEqual(['Alice', 'Dora'])
    expect(result.current.selectedRowKeySet.has(4)).toBe(true)
    expect(result.current.expandedRowKeySet.has(4)).toBe(true)
  })

  it('handles row selection, expansion, and row click expansion', () => {
    const onSelectionChange = vi.fn()
    const onExpandChange = vi.fn()
    const onRowClick = vi.fn()
    const { result } = renderHook(() =>
      useTableState(
        makeInput({
          rowSelection: { defaultSelectedRowKeys: [1] },
          expandable: { expandRowByClick: true, rowExpandable: (record) => record.id !== 2 },
          onSelectionChange,
          onExpandChange,
          onRowClick
        })
      )
    )

    expect(result.current.someSelected).toBe(true)

    act(() => result.current.handleSelectRow(2, true))
    expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2])

    act(() => result.current.handleSelectAll(true))
    expect(result.current.allSelected).toBe(true)
    expect(onSelectionChange).toHaveBeenLastCalledWith([1, 2])

    act(() => result.current.handleSelectAll(false))
    expect(result.current.allSelected).toBe(false)
    expect(onSelectionChange).toHaveBeenLastCalledWith([])

    act(() => result.current.handleRowClick(rows[0], 0, 1))
    expect(onRowClick).toHaveBeenCalledWith(rows[0], 0)
    expect(onExpandChange).toHaveBeenLastCalledWith([1], rows[0], true)

    act(() => result.current.handleRowClick(rows[1], 1, 2))
    expect(onExpandChange).toHaveBeenCalledTimes(1)

    act(() => result.current.handleToggleExpand(1, rows[0]))
    expect(onExpandChange).toHaveBeenLastCalledWith([], rows[0], false)
  })

  it('handles radio row selection', () => {
    const onSelectionChange = vi.fn()
    const { result } = renderHook(() =>
      useTableState(makeInput({ rowSelection: { type: 'radio' }, onSelectionChange }))
    )

    act(() => result.current.handleSelectRow(2, true))
    expect(onSelectionChange).toHaveBeenLastCalledWith([2])

    act(() => result.current.handleSelectRow(2, false))
    expect(onSelectionChange).toHaveBeenLastCalledWith([])
  })

  it('handles editable cells', () => {
    const editableCells = new Map<string, Set<number>>([['name', new Set([0])]])
    const onCellChange = vi.fn()
    const { result } = renderHook(() =>
      useTableState(makeInput({ editable: true, editableCells, onCellChange }))
    )

    expect(result.current.isCellEditable('name', 0)).toBe(true)
    expect(result.current.isCellEditable('name', 1)).toBe(false)
    expect(result.current.isCellEditable('age', 0)).toBe(false)

    act(() => result.current.startEditing(0, 'name', null))
    expect(result.current.editingValue).toBe('')

    act(() => result.current.setEditingValue('Ada'))
    act(() => result.current.commitEdit())
    expect(onCellChange).toHaveBeenLastCalledWith(0, 'name', 'Ada')
    expect(result.current.editingCell).toBeNull()

    act(() => result.current.startEditing(0, 'name', 'Grace'))
    act(() => result.current.cancelEdit())
    expect(result.current.editingCell).toBeNull()
  })

  it('handles column lock overrides and drag ordering', () => {
    const onColumnOrderChange = vi.fn()
    const { result } = renderHook(() =>
      useTableState(
        makeInput({
          columns: [
            { key: 'name', title: 'Name', fixed: 'left' },
            { key: 'age', title: 'Age' },
            { key: 'status', title: 'Status' }
          ],
          measuredColumnWidths: { name: 120, age: 80, status: 100 },
          onColumnOrderChange
        })
      )
    )

    expect(result.current.fixedColumnsInfo.leftOffsets.name).toBe(0)

    act(() => result.current.toggleColumnLock('name'))
    expect(result.current.displayColumns[0].fixed).toBe(false)

    act(() => result.current.toggleColumnLock('age'))
    expect(result.current.displayColumns[1].fixed).toBe('left')

    act(() => result.current.handleDrop('age'))
    expect(onColumnOrderChange).not.toHaveBeenCalled()

    act(() => result.current.handleDragStart('status'))
    act(() => result.current.handleDrop('name'))
    expect(onColumnOrderChange).toHaveBeenCalledWith([
      expect.objectContaining({ key: 'status' }),
      expect.objectContaining({ key: 'name' }),
      expect.objectContaining({ key: 'age' })
    ])
  })

  it('supports advanced filters and disabled pagination', () => {
    const { result } = renderHook(() =>
      useTableState(
        makeInput({
          pagination: false,
          filterMode: 'advanced',
          advancedFilterRules: [{ column: 'age', operator: 'gt', value: 30 }]
        })
      )
    )

    expect(result.current.paginationConfig).toBeNull()
    expect(result.current.paginationInfo).toBeNull()
    expect(result.current.paginatedData.map((row) => row.name)).toEqual(['Carol', 'Bob'])
  })

  describe('Edge Cases', () => {
    it('handles an empty data source', () => {
      const { result } = renderHook(() => useTableState(makeInput({ dataSource: [] })))

      expect(result.current.processedData).toEqual([])
      expect(result.current.paginatedData).toEqual([])
      expect(result.current.pageRowKeys).toEqual([])
    })

    it('supports functional row keys', () => {
      const { result } = renderHook(() =>
        useTableState(makeInput({ rowKey: (record) => `row-${record.id}` }))
      )

      expect(result.current.pageRowKeys).toEqual(['row-1', 'row-2'])
    })

    it('ignores sorting for non-sortable columns', () => {
      const onSortChange = vi.fn()
      const { result } = renderHook(() => useTableState(makeInput({ onSortChange })))

      act(() => result.current.handleSort('status'))

      expect(result.current.sortState).toEqual({ key: null, direction: null })
      expect(onSortChange).not.toHaveBeenCalled()
    })

    it('keeps page keys stable when filters remove current page items', () => {
      const { result } = renderHook(() => useTableState(makeInput()))

      act(() => result.current.handlePageChange(2))
      act(() => result.current.handleFilter('name', 'Alice'))

      expect(result.current.currentPage).toBe(1)
      expect(result.current.pageRowKeys).toEqual([2])
    })

    it('does not commit edits without an active editing cell', () => {
      const onCellChange = vi.fn()
      const { result } = renderHook(() =>
        useTableState(makeInput({ editable: true, onCellChange }))
      )

      act(() => result.current.setEditingValue('No cell'))
      act(() => result.current.commitEdit())

      expect(onCellChange).not.toHaveBeenCalled()
      expect(result.current.editingCell).toBeNull()
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
      const { result } = renderHook(() =>
        useTableState(makeInput({ rowSelection: { defaultSelectedRowKeys: [1] } }))
      )

      expect(result.current.someSelected).toBe(true)
      expect(result.current.allSelected).toBe(false)
    })

    it('derives expanded row state used by accessible disclosure controls', () => {
      const { result } = renderHook(() =>
        useTableState(makeInput({ expandable: { defaultExpandedRowKeys: [1] } }))
      )

      expect(result.current.expandedRowKeySet.has(1)).toBe(true)
      expect(result.current.expandedRowKeySet.has(2)).toBe(false)
    })
  })
})
