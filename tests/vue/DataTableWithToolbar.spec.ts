/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { DataTableWithToolbar } from '@expcat/tigercat-vue'
import type { TableColumn } from '@expcat/tigercat-core'

interface RowData extends Record<string, unknown> {
  id: number
  name: string
}

const columns: TableColumn<RowData>[] = [{ key: 'name', title: 'Name' }]

describe('DataTableWithToolbar (Vue)', () => {
  it('emits filter and pagination changes', async () => {
    const onFiltersChange = vi.fn()
    const onPageChange = vi.fn()

    render(DataTableWithToolbar, {
      props: {
        columns,
        dataSource: [{ id: 1, name: 'A' }],
        toolbar: {
          filters: [
            {
              key: 'status',
              label: '状态',
              options: [
                { label: '启用', value: 'active' },
                { label: '禁用', value: 'disabled' }
              ]
            }
          ]
        },
        pagination: { current: 1, pageSize: 10, total: 20, showTotal: true }
      },
      attrs: {
        onFiltersChange,
        onPageChange
      }
    })

    await userEvent.click(screen.getByRole('button', { name: '状态' }))
    await userEvent.click(screen.getByText('启用'))

    expect(onFiltersChange).toHaveBeenCalledWith({ status: 'active' })

    await userEvent.click(screen.getByLabelText('Page 2'))
    expect(onPageChange).toHaveBeenCalledWith(2, 10)
  })

  it('renders bulk actions with selected count', () => {
    render(DataTableWithToolbar, {
      props: {
        columns,
        dataSource: [],
        toolbar: {
          bulkActions: [{ key: 'export', label: '导出' }],
          selectedKeys: [1, 2]
        },
        pagination: false
      }
    })

    expect(screen.getByText('已选择 2 项')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '导出' })).toBeInTheDocument()
  })

  it('renders search input when only search-change listener is provided', () => {
    const onSearchChange = vi.fn()

    render(DataTableWithToolbar, {
      props: {
        columns,
        dataSource: [],
        toolbar: {}
      },
      attrs: {
        onSearchChange
      }
    })

    expect(screen.getByPlaceholderText('搜索')).toBeInTheDocument()
  })

  it('submits search on enter without search button', async () => {
    const onSearch = vi.fn()

    render(DataTableWithToolbar, {
      props: {
        columns,
        dataSource: [],
        toolbar: { searchPlaceholder: '搜索名称', showSearchButton: false }
      },
      attrs: {
        onSearch
      }
    })

    const input = screen.getByPlaceholderText('搜索名称') as HTMLInputElement
    await userEvent.type(input, 'Alpha{enter}')

    expect(onSearch).toHaveBeenCalledWith('Alpha')
    expect(screen.queryByRole('button', { name: '搜索' })).not.toBeInTheDocument()
  })

  it('forwards selection-change event', async () => {
    const onSelectionChange = vi.fn()

    render(DataTableWithToolbar, {
      props: {
        columns,
        dataSource: [{ id: 1, name: 'A' }],
        rowSelection: {
          selectedRowKeys: [],
          type: 'checkbox'
        },
        pagination: false
      },
      attrs: {
        onSelectionChange
      }
    })

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
    await userEvent.click(checkboxes[1])

    expect(onSelectionChange).toHaveBeenCalledWith([1])
  })
})
