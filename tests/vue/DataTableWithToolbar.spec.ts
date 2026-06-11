/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { h } from 'vue'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { ConfigProvider, DataTableWithToolbar, Table } from '@expcat/tigercat-vue'
import type { TableColumn } from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils'

interface RowData extends Record<string, unknown> {
  id: number
  name: string
}

const columns: TableColumn<RowData>[] = [{ key: 'name', title: 'Name' }]

describe('DataTableWithToolbar (Vue)', () => {
  it('emits filter and pagination changes', async () => {
    const onFiltersChange = vi.fn()
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()

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
        onPageChange,
        onPageSizeChange
      }
    })

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

    render(DataTableWithToolbar, {
      props: {
        columns,
        dataSource: [{ id: 1, name: 'A' }],
        pagination: { current: 1, pageSize: 10, total: 20, showTotal: true }
      },
      attrs: {
        onPageChange
      }
    })

    expect(screen.getByText('Total 20 items')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(2, 10)
  })

  it('threads responsiveMode, cardBreakpoint and hideInCard through to Table', () => {
    const cardColumns: TableColumn<RowData>[] = [
      { key: 'name', title: 'Name' },
      { key: 'id', title: 'ID', hideInCard: true }
    ]

    const { container } = render(DataTableWithToolbar, {
      props: {
        columns: cardColumns,
        dataSource: [{ id: 1, name: 'A' }],
        responsiveMode: 'card',
        cardBreakpoint: 'lg',
        pagination: false
      }
    })

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

    const { container } = render(DataTableWithToolbar, {
      props: {
        columns: cardColumns,
        dataSource: [{ id: 1, name: 'A' }],
        responsiveMode: 'card',
        pagination: false,
        cardLayout: [{ key: 'id', colSpan: 3, hideLabel: true }]
      }
    })

    const idField = container.querySelector('[data-tiger-table-mobile="card"] .grid-cols-12 > div')!
    expect(idField).toHaveClass('col-span-12', 'sm:col-span-3')
    expect(idField).toHaveTextContent('1')
    expect(idField).not.toHaveTextContent('ID')
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

    expect(screen.getByText('Selected 2 items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '导出' })).toBeInTheDocument()
  })

  it('uses table labels for toolbar text and keeps toolbar overrides first', () => {
    const initial = render(DataTableWithToolbar, {
      props: {
        columns,
        dataSource: [],
        labels: {
          searchPlaceholder: 'Find rows',
          searchButtonText: 'Find',
          selectedText: 'Chosen',
          selectedItemsText: 'rows'
        },
        toolbar: {
          bulkActions: [{ key: 'export', label: 'Export' }],
          selectedKeys: [1],
          defaultSearchValue: ''
        },
        pagination: false
      },
      attrs: { onSearch: vi.fn() }
    })

    expect(screen.getByPlaceholderText('Find rows')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Find' })).toBeInTheDocument()
    expect(screen.getByText('Chosen 1 rows')).toBeInTheDocument()

    initial.unmount()

    render(DataTableWithToolbar, {
      props: {
        columns,
        dataSource: [],
        labels: { searchButtonText: 'Find', selectedText: 'Chosen' },
        toolbar: {
          bulkActions: [{ key: 'export', label: 'Export' }],
          selectedKeys: [1],
          defaultSearchValue: '',
          searchButtonText: 'Go',
          bulkActionsLabel: 'Picked'
        },
        pagination: false
      },
      attrs: { onSearch: vi.fn() }
    })

    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
    expect(screen.getByText('Picked 1 items')).toBeInTheDocument()
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

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
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
    expect(screen.queryByRole('button', { name: 'Search' })).not.toBeInTheDocument()
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
  it('uses ConfigProvider locale for pagination text', () => {
    render({
      render() {
        return h(ConfigProvider, { locale: zhCN }, () =>
          h(DataTableWithToolbar, {
            columns,
            dataSource: [{ id: 1, name: 'A' }],
            pagination: { current: 1, pageSize: 10, total: 20, showTotal: true }
          })
        )
      }
    })

    expect(screen.getByText('共 20 条')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '上一页' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一页' })).toBeInTheDocument()
    expect(screen.getByText('10 条/页')).toBeInTheDocument()
  })

  it('uses ConfigProvider locale for toolbar text', () => {
    render({
      render() {
        return h(ConfigProvider, { locale: zhCN }, () =>
          h(DataTableWithToolbar, {
            columns,
            dataSource: [],
            toolbar: {
              bulkActions: [{ key: 'export', label: '导出' }],
              selectedKeys: [1],
              defaultSearchValue: ''
            },
            pagination: false,
            onSearch: vi.fn()
          })
        )
      }
    })

    expect(screen.getByPlaceholderText('搜索')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '搜索' })).toBeInTheDocument()
    expect(screen.getByText('已选择 1 项')).toBeInTheDocument()
  })

  it('uses Chinese locale for simple pagination text and aria labels', () => {
    render({
      render() {
        return h(ConfigProvider, { locale: zhCN }, () =>
          h(DataTableWithToolbar, {
            columns,
            dataSource: [{ id: 1, name: 'A' }],
            pagination: { current: 1, pageSize: 10, total: 1, showTotal: true }
          })
        )
      }
    })

    expect(screen.getByRole('button', { name: '上一页' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一页' })).toBeDisabled()
    expect(screen.getByText('第 1 页，共 1 页')).toBeInTheDocument()
    expect(screen.getByLabelText('第 1 页，共 1 页')).toBeInTheDocument()
    expect(screen.getByText('10 条/页')).toBeInTheDocument()
  })

  it('lets pagination locale override ConfigProvider locale', () => {
    render({
      render() {
        return h(ConfigProvider, { locale: zhCN }, () =>
          h(DataTableWithToolbar, {
            columns,
            dataSource: [{ id: 1, name: 'A' }],
            pagination: { current: 1, pageSize: 10, total: 20, showTotal: true, locale: enUS }
          })
        )
      }
    })

    expect(screen.getByText('Total 20 items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument()
    expect(screen.getByText('10 / page')).toBeInTheDocument()
  })

  it('can disable pagination i18n and use custom text overrides', () => {
    const { unmount } = render({
      render() {
        return h(ConfigProvider, { locale: zhCN }, () =>
          h(DataTableWithToolbar, {
            columns,
            dataSource: [{ id: 1, name: 'A' }],
            pagination: {
              current: 1,
              pageSize: 10,
              total: 20,
              showTotal: true,
              locale: false,
              prevText: 'Back',
              nextText: 'Forward',
              pageIndicatorText: (cur: number, tot: number) => `P.${cur}/${tot}`,
              pageSizeText: (size: number) => `${size} items/page`
            }
          })
        )
      }
    })
    expect(screen.getByText('Total 20 items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument()
    expect(screen.getByText('P.1/2')).toBeInTheDocument()
    expect(screen.getByText('10 items/page')).toBeInTheDocument()

    unmount()

    render({
      render() {
        return h(ConfigProvider, { locale: zhCN }, () =>
          h(DataTableWithToolbar, {
            columns,
            dataSource: [{ id: 1, name: 'A' }],
            pagination: {
              current: 1,
              pageSize: 10,
              total: 20,
              showTotal: true,
              locale: false,
              totalText: (total: number, range: [number, number]) =>
                `Rows ${range[0]}-${range[1]} / ${total}`
            }
          })
        )
      }
    })
    expect(screen.getByText('Rows 1-10 / 20')).toBeInTheDocument()
  })

  it('uses custom page size option labels without appending locale text', () => {
    render({
      render() {
        return h(ConfigProvider, { locale: zhCN }, () =>
          h(DataTableWithToolbar, {
            columns,
            dataSource: [{ id: 1, name: 'A' }],
            pagination: {
              current: 1,
              pageSize: 10,
              total: 20,
              showTotal: true,
              pageSizeOptions: [{ value: 10, label: '10 条/页（默认）' }]
            }
          })
        )
      }
    })

    expect(screen.getByText('10 条/页（默认）')).toBeInTheDocument()
  })

  it('uses ConfigProvider locale for plain Table pagination text', () => {
    render({
      render() {
        return h(ConfigProvider, { locale: zhCN }, () =>
          h(Table, {
            columns,
            dataSource: [{ id: 1, name: 'A' }],
            pagination: { current: 1, pageSize: 10, total: 20, showTotal: true }
          })
        )
      }
    })

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
      const onHiddenColumnsChange = vi.fn()
      const onUpdateHiddenColumnKeys = vi.fn()

      render(DataTableWithToolbar, {
        props: {
          columns: multiColumns,
          dataSource: [{ id: 1, name: 'A', email: 'a@example.com' }],
          toolbar: { showColumnSettings: true },
          pagination: false
        },
        attrs: {
          onHiddenColumnsChange,
          'onUpdate:hiddenColumnKeys': onUpdateHiddenColumnKeys
        }
      })

      await userEvent.click(screen.getByRole('button', { name: 'Column settings' }))

      const emailCheckbox = screen.getByRole('checkbox', { name: 'Email' })
      expect(emailCheckbox).toBeChecked()

      await userEvent.click(emailCheckbox)
      expect(onHiddenColumnsChange).toHaveBeenCalledWith(['email'])
      expect(onUpdateHiddenColumnKeys).toHaveBeenCalledWith(['email'])
      expect(screen.queryByRole('columnheader', { name: 'Email' })).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('checkbox', { name: 'Email' }))
      expect(onHiddenColumnsChange).toHaveBeenLastCalledWith([])
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
    })

    it('disables checkboxes for non-hideable and locked columns', async () => {
      render(DataTableWithToolbar, {
        props: {
          columns: multiColumns,
          dataSource: [{ id: 1, name: 'A', email: 'a@example.com' }],
          toolbar: {
            showColumnSettings: true,
            columnSettings: { lockedColumnKeys: ['name'] }
          },
          pagination: false
        }
      })

      await userEvent.click(screen.getByRole('button', { name: 'Column settings' }))

      expect(screen.getByRole('checkbox', { name: 'Name' })).toBeDisabled()
      expect(screen.getByRole('checkbox', { name: 'Actions' })).toBeDisabled()
      expect(screen.getByRole('checkbox', { name: 'Email' })).toBeEnabled()
    })

    it('keeps internal state untouched in controlled mode and only emits', async () => {
      const onHiddenColumnsChange = vi.fn()

      render(DataTableWithToolbar, {
        props: {
          columns: multiColumns,
          dataSource: [{ id: 1, name: 'A', email: 'a@example.com' }],
          toolbar: { showColumnSettings: true },
          hiddenColumnKeys: [],
          pagination: false
        },
        attrs: {
          onHiddenColumnsChange
        }
      })

      await userEvent.click(screen.getByRole('button', { name: 'Column settings' }))
      await userEvent.click(screen.getByRole('checkbox', { name: 'Email' }))

      expect(onHiddenColumnsChange).toHaveBeenCalledWith(['email'])
      // Controlled: parent did not update the prop, so the column stays visible
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(DataTableWithToolbar, {
        props: { columns, dataSource: [{ id: 1, name: 'A' }], pagination: false }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
