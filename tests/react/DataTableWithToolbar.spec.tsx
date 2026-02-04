/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTableWithToolbar } from '@expcat/tigercat-react'
import type { TableColumn } from '@expcat/tigercat-core'

interface RowData extends Record<string, unknown> {
  id: number
  name: string
}

const columns: TableColumn<RowData>[] = [{ key: 'name', title: 'Name' }]

describe('DataTableWithToolbar (React)', () => {
  it('emits filter and pagination changes', async () => {
    const onFiltersChange = vi.fn()
    const onPageChange = vi.fn()

    render(
      <DataTableWithToolbar<RowData>
        columns={columns}
        dataSource={[{ id: 1, name: 'A' }]}
        toolbar={{
          filters: [
            {
              key: 'status',
              label: '状态',
              options: [
                { label: '启用', value: 'active' },
                { label: '禁用', value: 'disabled' }
              ]
            }
          ],
          onFiltersChange
        }}
        pagination={{ current: 1, pageSize: 10, total: 20, showTotal: true }}
        onPageChange={onPageChange}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: '状态' }))
    await userEvent.click(screen.getByText('启用'))

    expect(onFiltersChange).toHaveBeenCalledWith({ status: 'active' })

    await userEvent.click(screen.getByLabelText('Page 2'))
    expect(onPageChange).toHaveBeenCalledWith(2, 10)
  })

  it('renders bulk actions with selected count', () => {
    render(
      <DataTableWithToolbar<RowData>
        columns={columns}
        dataSource={[]}
        toolbar={{
          bulkActions: [{ key: 'export', label: '导出' }],
          selectedKeys: [1, 2]
        }}
        pagination={false}
      />
    )

    expect(screen.getByText('已选择 2 项')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '导出' })).toBeInTheDocument()
  })

  it('updates search value on change', async () => {
    const onSearchChange = vi.fn()
    render(
      <DataTableWithToolbar<RowData>
        columns={columns}
        dataSource={[]}
        toolbar={{
          searchPlaceholder: '搜索名称',
          onSearchChange
        }}
        pagination={false}
      />
    )

    const input = screen.getByPlaceholderText('搜索名称') as HTMLInputElement
    await userEvent.type(input, 'Alpha')

    expect(onSearchChange).toHaveBeenCalled()
  })
})
