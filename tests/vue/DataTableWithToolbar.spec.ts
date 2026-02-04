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
        pagination: { current: 1, pageSize: 10, total: 20, showTotal: true },
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
})
