/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfigProvider, DataTableWithToolbar, Table } from '@expcat/tigercat-react'
import type { TableColumn } from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

interface RowData extends Record<string, unknown> {
  id: number
  name: string
}

const columns: TableColumn<RowData>[] = [{ key: 'name', title: 'Name' }]

describe('DataTableWithToolbar (React)', () => {
  it('emits filter and pagination changes', async () => {
    const onFiltersChange = vi.fn()
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()

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
        onPageSizeChange={onPageSizeChange}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: '状态' }))
    await userEvent.click(screen.getByText('启用'))

    expect(onFiltersChange).toHaveBeenCalledWith({ status: 'active' })

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(2, 10)

    await userEvent.selectOptions(screen.getByRole('combobox'), '20')
    expect(onPageSizeChange).toHaveBeenCalledWith(1, 20)
  })

  it('delegates pagination rendering to Table', async () => {
    const onPageChange = vi.fn()

    render(
      <DataTableWithToolbar<RowData>
        columns={columns}
        dataSource={[{ id: 1, name: 'A' }]}
        pagination={{ current: 1, pageSize: 10, total: 20, showTotal: true }}
        onPageChange={onPageChange}
      />
    )

    expect(screen.getByText('Total 20 items')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(2, 10)
  })

  it('threads responsiveMode, cardBreakpoint and hideInCard through to Table', () => {
    const cardColumns: TableColumn<RowData>[] = [
      { key: 'name', title: 'Name' },
      { key: 'id', title: 'ID', hideInCard: true }
    ]

    const { container } = render(
      <DataTableWithToolbar<RowData>
        columns={cardColumns}
        dataSource={[{ id: 1, name: 'A' }]}
        responsiveMode="card"
        cardBreakpoint="lg"
        pagination={false}
      />
    )

    const cardList = container.querySelector('[data-tiger-table-mobile="card"]')!
    expect(cardList).toHaveClass('max-lg:grid')
    expect(container.querySelector('table')).toHaveClass('max-lg:hidden')
    expect(cardList.textContent).not.toContain('ID')
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

    expect(screen.getByText('Selected 2 items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '导出' })).toBeInTheDocument()
  })

  it('uses table labels for toolbar text and keeps toolbar overrides first', () => {
    const { rerender } = render(
      <DataTableWithToolbar<RowData>
        columns={columns}
        dataSource={[]}
        labels={{
          searchPlaceholder: 'Find rows',
          searchButtonText: 'Find',
          selectedText: 'Chosen',
          selectedItemsText: 'rows'
        }}
        toolbar={{
          bulkActions: [{ key: 'export', label: 'Export' }],
          selectedKeys: [1],
          defaultSearchValue: ''
        }}
        onSearch={vi.fn()}
        pagination={false}
      />
    )

    expect(screen.getByPlaceholderText('Find rows')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Find' })).toBeInTheDocument()
    expect(screen.getByText('Chosen 1 rows')).toBeInTheDocument()

    rerender(
      <DataTableWithToolbar<RowData>
        columns={columns}
        dataSource={[]}
        labels={{ searchButtonText: 'Find', selectedText: 'Chosen' }}
        toolbar={{
          bulkActions: [{ key: 'export', label: 'Export' }],
          selectedKeys: [1],
          defaultSearchValue: '',
          searchButtonText: 'Go',
          bulkActionsLabel: 'Picked'
        }}
        onSearch={vi.fn()}
        pagination={false}
      />
    )

    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
    expect(screen.getByText('Picked 1 items')).toBeInTheDocument()
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

  it('submits search on enter without search button', async () => {
    const onSearch = vi.fn()

    render(
      <DataTableWithToolbar<RowData>
        columns={columns}
        dataSource={[]}
        toolbar={{ searchPlaceholder: '搜索名称', showSearchButton: false }}
        onSearch={onSearch}
        pagination={false}
      />
    )

    const input = screen.getByPlaceholderText('搜索名称') as HTMLInputElement
    await userEvent.type(input, 'Alpha{enter}')

    expect(onSearch).toHaveBeenCalledWith('Alpha')
    expect(screen.queryByRole('button', { name: 'Search' })).not.toBeInTheDocument()
  })

  it('forwards selection change', async () => {
    const onSelectionChange = vi.fn()

    render(
      <DataTableWithToolbar<RowData>
        columns={columns}
        dataSource={[{ id: 1, name: 'A' }]}
        rowSelection={{ selectedRowKeys: [], type: 'checkbox' }}
        onSelectionChange={onSelectionChange}
        pagination={false}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
    await userEvent.click(checkboxes[1])

    expect(onSelectionChange).toHaveBeenCalledWith([1])
  })
  it('uses ConfigProvider locale for pagination text', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[{ id: 1, name: 'A' }]}
          pagination={{ current: 1, pageSize: 10, total: 20, showTotal: true }}
        />
      </ConfigProvider>
    )

    expect(screen.getByText('共 20 条')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上一页' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一页' })).toBeInTheDocument()
    expect(screen.getByText('10 条/页')).toBeInTheDocument()
  })

  it('uses ConfigProvider locale for toolbar text', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[]}
          toolbar={{
            bulkActions: [{ key: 'export', label: '导出' }],
            selectedKeys: [1],
            defaultSearchValue: ''
          }}
          onSearch={vi.fn()}
          pagination={false}
        />
      </ConfigProvider>
    )

    expect(screen.getByPlaceholderText('搜索')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '搜索' })).toBeInTheDocument()
    expect(screen.getByText('已选择 1 项')).toBeInTheDocument()
  })

  it('uses Chinese locale for simple pagination text and aria labels', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[{ id: 1, name: 'A' }]}
          pagination={{ current: 1, pageSize: 10, total: 1, showTotal: true }}
        />
      </ConfigProvider>
    )

    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled()
    expect(screen.getByText('第 1 页，共 1 页')).toBeInTheDocument()
    expect(screen.getByLabelText('第 1 页，共 1 页')).toBeInTheDocument()
    expect(screen.getByText('10 条/页')).toBeInTheDocument()
  })

  it('lets pagination locale override ConfigProvider locale', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[{ id: 1, name: 'A' }]}
          pagination={{ current: 1, pageSize: 10, total: 20, showTotal: true, locale: enUS }}
        />
      </ConfigProvider>
    )

    expect(screen.getByText('Total 20 items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
    expect(screen.getByText('10 / page')).toBeInTheDocument()
  })

  it('can disable pagination i18n and use custom text overrides', () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[{ id: 1, name: 'A' }]}
          pagination={{
            current: 1,
            pageSize: 10,
            total: 20,
            showTotal: true,
            locale: false,
            prevText: 'Back',
            nextText: 'Forward',
            pageIndicatorText: (cur, tot) => `P.${cur}/${tot}`,
            pageSizeText: (size) => `${size} items/page`
          }}
        />
      </ConfigProvider>
    )
    expect(screen.getByText('Total 20 items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument()
    expect(screen.getByText('P.1/2')).toBeInTheDocument()
    expect(screen.getByText('10 items/page')).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={zhCN}>
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[{ id: 1, name: 'A' }]}
          pagination={{
            current: 1,
            pageSize: 10,
            total: 20,
            showTotal: true,
            locale: false,
            totalText: (total, range) => `Rows ${range[0]}-${range[1]} / ${total}`
          }}
        />
      </ConfigProvider>
    )
    expect(screen.getByText('Rows 1-10 / 20')).toBeInTheDocument()
  })

  it('uses custom page size option labels without appending locale text', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[{ id: 1, name: 'A' }]}
          pagination={{
            current: 1,
            pageSize: 10,
            total: 20,
            showTotal: true,
            pageSizeOptions: [{ value: 10, label: '10 条/页（默认）' }]
          }}
        />
      </ConfigProvider>
    )

    expect(screen.getByText('10 条/页（默认）')).toBeInTheDocument()
  })

  it('uses ConfigProvider locale for plain Table pagination text', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <Table<RowData>
          columns={columns}
          dataSource={[{ id: 1, name: 'A' }]}
          pagination={{ current: 1, pageSize: 10, total: 20, showTotal: true }}
        />
      </ConfigProvider>
    )

    expect(screen.getByText('共 20 条')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一页' })).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <DataTableWithToolbar
          columns={columns}
          dataSource={[{ id: 1, name: 'A' }]}
          pagination={false}
        />
      )
      await act(async () => {
        await new Promise((resolve) => requestAnimationFrame(resolve))
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
