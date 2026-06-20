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

  it('renders custom toolbar filters and emits object filter values', async () => {
    const onFiltersChange = vi.fn()

    render(
      <DataTableWithToolbar<RowData>
        columns={columns}
        dataSource={[{ id: 1, name: 'A' }]}
        toolbar={{
          filters: [
            {
              key: 'ageRange',
              label: '年龄段',
              render: ({ value, setValue }) => {
                const range =
                  value && typeof value === 'object'
                    ? (value as { min?: string; max?: string })
                    : {}
                return (
                  <div className="flex items-center gap-1">
                    <input
                      aria-label="最小年龄"
                      value={range.min ?? ''}
                      onChange={(event) =>
                        setValue({
                          ...range,
                          min: event.currentTarget.value
                        })
                      }
                    />
                    <input
                      aria-label="最大年龄"
                      value={range.max ?? ''}
                      onChange={(event) =>
                        setValue({
                          ...range,
                          max: event.currentTarget.value
                        })
                      }
                    />
                  </div>
                )
              }
            }
          ],
          onFiltersChange
        }}
        pagination={false}
      />
    )

    await userEvent.type(screen.getByLabelText('最小年龄'), '18')
    await userEvent.type(screen.getByLabelText('最大年龄'), '35')

    expect(onFiltersChange).toHaveBeenLastCalledWith({
      ageRange: { min: '18', max: '35' }
    })
  })

  it('renders filtersExtra and lets it update filters', async () => {
    const onFiltersChange = vi.fn()

    render(
      <DataTableWithToolbar<RowData>
        columns={columns}
        dataSource={[{ id: 1, name: 'A' }]}
        toolbar={{
          filtersExtra: ({ setFilter }) => (
            <input
              aria-label="额外最小年龄"
              onChange={(event) =>
                setFilter('ageRange', {
                  min: event.currentTarget.value
                })
              }
            />
          ),
          onFiltersChange
        }}
        pagination={false}
      />
    )

    await userEvent.type(screen.getByLabelText('额外最小年龄'), '21')

    expect(onFiltersChange).toHaveBeenLastCalledWith({
      ageRange: { min: '21' }
    })
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

  it('threads cardLayout through to the responsive card grid', () => {
    const cardColumns: TableColumn<RowData>[] = [
      { key: 'name', title: 'Name', cardTitle: true },
      { key: 'id', title: 'ID', cardGrid: { colSpan: 6, labelPosition: 'top' } }
    ]

    const { container } = render(
      <DataTableWithToolbar<RowData>
        columns={cardColumns}
        dataSource={[{ id: 1, name: 'A' }]}
        responsiveMode="card"
        pagination={false}
        cardLayout={[{ key: 'id', colSpan: 3, hideLabel: true }]}
      />
    )

    const idField = container.querySelector('[data-tiger-table-mobile="card"] .grid-cols-12 > div')!
    expect(idField).toHaveClass('col-span-12', 'sm:col-span-3')
    expect(idField).toHaveTextContent('1')
    expect(idField).not.toHaveTextContent('ID')
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

  describe('Column Settings', () => {
    const multiColumns: TableColumn<RowData>[] = [
      { key: 'name', title: 'Name' },
      { key: 'email', title: 'Email' },
      { key: 'actions', title: 'Actions', hideable: false }
    ]

    it('renders the column settings entry and toggles column visibility', async () => {
      const user = userEvent.setup()
      const onHiddenColumnKeysChange = vi.fn()

      render(
        <DataTableWithToolbar<RowData>
          columns={multiColumns}
          dataSource={[{ id: 1, name: 'A', email: 'a@example.com' }]}
          toolbar={{ showColumnSettings: true }}
          onHiddenColumnKeysChange={onHiddenColumnKeysChange}
          pagination={false}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Column settings' }))

      const emailCheckbox = screen.getByRole('checkbox', { name: 'Email' })
      expect(emailCheckbox).toBeChecked()

      await user.click(emailCheckbox)
      expect(onHiddenColumnKeysChange).toHaveBeenCalledWith(['email'])
      expect(screen.queryByRole('columnheader', { name: 'Email' })).not.toBeInTheDocument()

      await user.click(screen.getByRole('checkbox', { name: 'Email' }))
      expect(onHiddenColumnKeysChange).toHaveBeenLastCalledWith([])
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
    })

    it('disables checkboxes for non-hideable and locked columns', async () => {
      const user = userEvent.setup()

      render(
        <DataTableWithToolbar<RowData>
          columns={multiColumns}
          dataSource={[{ id: 1, name: 'A', email: 'a@example.com' }]}
          toolbar={{
            showColumnSettings: true,
            columnSettings: { lockedColumnKeys: ['name'] }
          }}
          pagination={false}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Column settings' }))

      expect(screen.getByRole('checkbox', { name: 'Name' })).toBeDisabled()
      expect(screen.getByRole('checkbox', { name: 'Actions' })).toBeDisabled()
      expect(screen.getByRole('checkbox', { name: 'Email' })).toBeEnabled()
    })

    it('renders lock buttons and toggles a column fixed state when columnLockable', async () => {
      const user = userEvent.setup()

      render(
        <DataTableWithToolbar<RowData>
          columns={multiColumns}
          dataSource={[{ id: 1, name: 'A', email: 'a@example.com' }]}
          columnLockable
          pagination={false}
        />
      )

      const lockButton = screen.getByRole('button', { name: 'Lock column Name' })
      expect(lockButton).toBeInTheDocument()

      await user.click(lockButton)
      expect(screen.getByRole('button', { name: 'Unlock column Name' })).toBeInTheDocument()
    })

    it('localizes the lock-column aria-label via labels override', () => {
      render(
        <DataTableWithToolbar<RowData>
          columns={multiColumns}
          dataSource={[{ id: 1, name: 'A', email: 'a@example.com' }]}
          columnLockable
          labels={{ lockColumnAriaLabel: 'Pin {column}', unlockColumnAriaLabel: 'Unpin {column}' }}
          pagination={false}
        />
      )

      expect(screen.getByRole('button', { name: 'Pin Name' })).toBeInTheDocument()
    })

    it('localizes the lock-column aria-label from the active locale', () => {
      render(
        <ConfigProvider locale={zhCN}>
          <DataTableWithToolbar<RowData>
            columns={multiColumns}
            dataSource={[{ id: 1, name: 'A', email: 'a@example.com' }]}
            columnLockable
            pagination={false}
          />
        </ConfigProvider>
      )

      expect(screen.getByRole('button', { name: '锁定Name列' })).toBeInTheDocument()
    })

    it('keeps internal state untouched in controlled mode and only calls back', async () => {
      const user = userEvent.setup()
      const onHiddenColumnKeysChange = vi.fn()

      render(
        <DataTableWithToolbar<RowData>
          columns={multiColumns}
          dataSource={[{ id: 1, name: 'A', email: 'a@example.com' }]}
          toolbar={{ showColumnSettings: true }}
          hiddenColumnKeys={[]}
          onHiddenColumnKeysChange={onHiddenColumnKeysChange}
          pagination={false}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Column settings' }))
      await user.click(screen.getByRole('checkbox', { name: 'Email' }))

      expect(onHiddenColumnKeysChange).toHaveBeenCalledWith(['email'])
      // Controlled: parent did not update the prop, so the column stays visible
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
    })
  })

  describe('Toolbar layout customization', () => {
    it('replaces built-in select filter wrapper classes with itemClass and applies itemStyle', () => {
      const { container } = render(
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[]}
          toolbar={{
            filters: [
              {
                key: 'status',
                label: '状态',
                options: [{ label: '启用', value: 'active' }],
                itemClass: 'custom-filter-item',
                itemStyle: { flexBasis: '9rem' }
              }
            ]
          }}
          pagination={false}
        />
      )

      const wrapper = container.querySelector('.custom-filter-item') as HTMLElement
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).not.toHaveClass('sm:max-w-[180px]', 'w-full')
      expect(wrapper.style.flexBasis).toBe('9rem')
    })

    it('replaces render-based filter wrapper classes with itemClass and applies itemStyle', () => {
      const { container } = render(
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[]}
          toolbar={{
            filters: [
              {
                key: 'ageRange',
                label: '年龄段',
                itemClass: 'age-filter-item',
                itemStyle: { minWidth: '7.5rem' },
                render: () => <input aria-label="最小年龄" />
              }
            ]
          }}
          pagination={false}
        />
      )

      const wrapper = container.querySelector('.age-filter-item') as HTMLElement
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).not.toHaveClass('w-full', 'sm:w-auto')
      expect(wrapper.style.minWidth).toBe('7.5rem')
      expect(screen.getByLabelText('最小年龄')).toBeInTheDocument()
    })

    it('replaces search wrapper sizing classes with searchClassName but keeps structural classes', () => {
      const { container } = render(
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[]}
          toolbar={{ searchPlaceholder: '搜索', searchClassName: 'custom-search w-64' }}
          pagination={false}
        />
      )

      const wrapper = container.querySelector('.custom-search') as HTMLElement
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveClass('flex', 'items-center', 'gap-2', 'w-64')
      expect(wrapper).not.toHaveClass('sm:max-w-[320px]', 'sm:min-w-[220px]')
    })

    it('appends toolbar className and applies toolbar style on the container', () => {
      const { container } = render(
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[]}
          toolbar={{
            searchPlaceholder: '搜索',
            className: 'custom-toolbar',
            style: { padding: '4px' }
          }}
          pagination={false}
        />
      )

      const toolbar = container.querySelector('.tiger-data-table-toolbar') as HTMLElement
      expect(toolbar).toHaveClass('custom-toolbar', 'flex')
      expect(toolbar.style.padding).toBe('4px')
    })

    it('replaces the entire built-in toolbar with toolbar.render and wires the context', async () => {
      const user = userEvent.setup()
      const onFiltersChange = vi.fn()
      const onSearchChange = vi.fn()
      const onSearch = vi.fn()
      const onHiddenColumnKeysChange = vi.fn()

      const { container } = render(
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[{ id: 1, name: 'A' }]}
          pagination={false}
          toolbar={{
            searchPlaceholder: '内置搜索',
            filters: [
              { key: 'status', label: '状态', options: [{ label: '启用', value: 'active' }] }
            ],
            bulkActions: [{ key: 'export', label: '导出' }],
            showColumnSettings: true,
            render: ({
              searchValue,
              setSearch,
              submitSearch,
              setFilter,
              selectedCount,
              setHiddenColumnKeys
            }) => (
              <div data-testid="custom-toolbar">
                <span>selected:{selectedCount}</span>
                <input
                  aria-label="自定义搜索"
                  value={searchValue}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                />
                <button onClick={() => submitSearch()}>提交</button>
                <button onClick={() => setFilter('status', 'active')}>筛选</button>
                <button onClick={() => setHiddenColumnKeys(['name'])}>隐藏列</button>
              </div>
            )
          }}
          onFiltersChange={onFiltersChange}
          onSearchChange={onSearchChange}
          onSearch={onSearch}
          onHiddenColumnKeysChange={onHiddenColumnKeysChange}
        />
      )

      // Built-in toolbar region is fully replaced
      expect(container.querySelector('.tiger-data-table-toolbar')).not.toBeInTheDocument()
      expect(container.querySelector('[role="toolbar"]')).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText('内置搜索')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '导出' })).not.toBeInTheDocument()
      expect(screen.getByTestId('custom-toolbar')).toBeInTheDocument()
      expect(screen.getByText('selected:0')).toBeInTheDocument()

      await user.type(screen.getByLabelText('自定义搜索'), 'a')
      expect(onSearchChange).toHaveBeenCalledWith('a')

      await user.click(screen.getByRole('button', { name: '提交' }))
      expect(onSearch).toHaveBeenCalledWith('a')

      await user.click(screen.getByRole('button', { name: '筛选' }))
      expect(onFiltersChange).toHaveBeenCalledWith({ status: 'active' })

      await user.click(screen.getByRole('button', { name: '隐藏列' }))
      expect(onHiddenColumnKeysChange).toHaveBeenCalledWith(['name'])
      expect(screen.queryByRole('columnheader', { name: 'Name' })).not.toBeInTheDocument()
    })
  })

  describe('Card customization passthrough', () => {
    it('forwards renderCard and cardClassName to the inner Table as public API', () => {
      const { container } = render(
        <DataTableWithToolbar<RowData>
          columns={columns}
          dataSource={[{ id: 1, name: 'A' }]}
          responsiveMode="card"
          pagination={false}
          cardClassName={(record) => (record.id === 1 ? 'custom-card-active' : 'custom-card')}
          renderCard={({ record }) => (
            <div data-testid="custom-card-content">自定义 {String(record.name)}</div>
          )}
        />
      )

      expect(screen.getByTestId('custom-card-content')).toHaveTextContent('自定义 A')
      expect(container.querySelector('.custom-card-active')).toBeInTheDocument()
    })
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
