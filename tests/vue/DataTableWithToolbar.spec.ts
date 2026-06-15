/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { h } from 'vue'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { ConfigProvider, DataTableWithToolbar, Table } from '@expcat/tigercat-vue'
import type { TableColumn, TableToolbarFilterValue } from '@expcat/tigercat-core'
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

  it('renders custom toolbar filters and emits object filter values', async () => {
    const onFiltersChange = vi.fn()

    render(DataTableWithToolbar, {
      props: {
        columns,
        dataSource: [{ id: 1, name: 'A' }],
        toolbar: {
          filters: [
            {
              key: 'ageRange',
              label: '年龄段',
              render: ({ value, setValue }) => {
                const range =
                  value && typeof value === 'object'
                    ? (value as { min?: string; max?: string })
                    : {}
                return h('div', { class: 'flex items-center gap-1' }, [
                  h('input', {
                    'aria-label': '最小年龄',
                    value: range.min ?? '',
                    onInput: (event: Event) =>
                      setValue({
                        ...range,
                        min: (event.target as HTMLInputElement).value
                      })
                  }),
                  h('input', {
                    'aria-label': '最大年龄',
                    value: range.max ?? '',
                    onInput: (event: Event) =>
                      setValue({
                        ...range,
                        max: (event.target as HTMLInputElement).value
                      })
                  })
                ])
              }
            }
          ]
        },
        pagination: false
      },
      attrs: {
        onFiltersChange
      }
    })

    await userEvent.type(screen.getByLabelText('最小年龄'), '18')
    await userEvent.type(screen.getByLabelText('最大年龄'), '35')

    expect(onFiltersChange).toHaveBeenLastCalledWith({
      ageRange: { min: '18', max: '35' }
    })
  })

  it('renders filters-extra slot and lets it update filters', async () => {
    const onFiltersChange = vi.fn()

    render({
      render() {
        return h(
          DataTableWithToolbar,
          {
            columns,
            dataSource: [{ id: 1, name: 'A' }],
            pagination: false,
            onFiltersChange
          },
          {
            'filters-extra': ({
              setFilter
            }: {
              setFilter: (key: string, value: TableToolbarFilterValue) => void
            }) =>
              h('input', {
                'aria-label': '额外最小年龄',
                onInput: (event: Event) =>
                  setFilter('ageRange', {
                    min: (event.target as HTMLInputElement).value
                  })
              })
          }
        )
      }
    })

    await userEvent.type(screen.getByLabelText('额外最小年龄'), '21')

    expect(onFiltersChange).toHaveBeenLastCalledWith({
      ageRange: { min: '21' }
    })
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

    it('renders lock buttons and toggles a column fixed state when columnLockable', async () => {
      render(DataTableWithToolbar, {
        props: {
          columns: multiColumns,
          dataSource: [{ id: 1, name: 'A', email: 'a@example.com' }],
          columnLockable: true,
          pagination: false
        }
      })

      const lockButton = screen.getByRole('button', { name: 'Lock column Name' })
      expect(lockButton).toBeInTheDocument()

      await userEvent.click(lockButton)
      expect(screen.getByRole('button', { name: 'Unlock column Name' })).toBeInTheDocument()
    })

    it('localizes the lock-column aria-label via labels override', () => {
      render(DataTableWithToolbar, {
        props: {
          columns: multiColumns,
          dataSource: [{ id: 1, name: 'A', email: 'a@example.com' }],
          columnLockable: true,
          labels: { lockColumnAriaLabel: 'Pin {column}', unlockColumnAriaLabel: 'Unpin {column}' },
          pagination: false
        }
      })

      expect(screen.getByRole('button', { name: 'Pin Name' })).toBeInTheDocument()
    })

    it('localizes the lock-column aria-label from the active locale', () => {
      render({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhCN }, () =>
              h(DataTableWithToolbar, {
                columns: multiColumns,
                dataSource: [{ id: 1, name: 'A', email: 'a@example.com' }],
                columnLockable: true,
                pagination: false
              })
            )
        }
      })

      expect(screen.getByRole('button', { name: '锁定Name列' })).toBeInTheDocument()
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

  describe('Toolbar layout customization', () => {
    it('replaces built-in select filter wrapper classes with itemClass and applies itemStyle', () => {
      const { container } = render(DataTableWithToolbar, {
        props: {
          columns,
          dataSource: [],
          toolbar: {
            filters: [
              {
                key: 'status',
                label: '状态',
                options: [{ label: '启用', value: 'active' }],
                itemClass: 'custom-filter-item',
                itemStyle: { flexBasis: '9rem' }
              }
            ]
          },
          pagination: false
        }
      })

      const wrapper = container.querySelector('.custom-filter-item') as HTMLElement
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).not.toHaveClass('sm:max-w-[180px]', 'w-full')
      expect(wrapper.style.flexBasis).toBe('9rem')
    })

    it('replaces render-based filter wrapper classes with itemClass and applies itemStyle', () => {
      const { container } = render(DataTableWithToolbar, {
        props: {
          columns,
          dataSource: [],
          toolbar: {
            filters: [
              {
                key: 'ageRange',
                label: '年龄段',
                itemClass: 'age-filter-item',
                itemStyle: { minWidth: '7.5rem' },
                render: () => h('input', { 'aria-label': '最小年龄' })
              }
            ]
          },
          pagination: false
        }
      })

      const wrapper = container.querySelector('.age-filter-item') as HTMLElement
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).not.toHaveClass('w-full', 'sm:w-auto')
      expect(wrapper.style.minWidth).toBe('7.5rem')
      expect(screen.getByLabelText('最小年龄')).toBeInTheDocument()
    })

    it('replaces search wrapper sizing classes with searchClassName but keeps structural classes', () => {
      const { container } = render(DataTableWithToolbar, {
        props: {
          columns,
          dataSource: [],
          toolbar: { searchPlaceholder: '搜索', searchClassName: 'custom-search w-64' },
          pagination: false
        }
      })

      const wrapper = container.querySelector('.custom-search') as HTMLElement
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveClass('flex', 'items-center', 'gap-2', 'w-64')
      expect(wrapper).not.toHaveClass('sm:max-w-[320px]', 'sm:min-w-[220px]')
    })

    it('appends toolbar className and applies toolbar style on the container', () => {
      const { container } = render(DataTableWithToolbar, {
        props: {
          columns,
          dataSource: [],
          toolbar: {
            searchPlaceholder: '搜索',
            className: 'custom-toolbar',
            style: { padding: '4px' }
          },
          pagination: false
        }
      })

      const toolbar = container.querySelector('.tiger-data-table-toolbar') as HTMLElement
      expect(toolbar).toHaveClass('custom-toolbar', 'flex')
      expect(toolbar.style.padding).toBe('4px')
    })

    it('replaces the entire built-in toolbar with the #toolbar slot and wires the context', async () => {
      const onFiltersChange = vi.fn()
      const onSearchChange = vi.fn()
      const onSearch = vi.fn()
      const onHiddenColumnsChange = vi.fn()

      const { container } = render({
        render() {
          return h(
            DataTableWithToolbar,
            {
              columns,
              dataSource: [{ id: 1, name: 'A' }],
              pagination: false,
              toolbar: {
                searchPlaceholder: '内置搜索',
                filters: [
                  { key: 'status', label: '状态', options: [{ label: '启用', value: 'active' }] }
                ],
                bulkActions: [{ key: 'export', label: '导出' }],
                showColumnSettings: true
              },
              onFiltersChange,
              onSearchChange,
              onSearch,
              onHiddenColumnsChange
            },
            {
              toolbar: ({
                searchValue,
                setSearch,
                submitSearch,
                setFilter,
                selectedCount,
                setHiddenColumnKeys
              }: {
                searchValue: string
                setSearch: (value: string) => void
                submitSearch: () => void
                setFilter: (key: string, value: TableToolbarFilterValue) => void
                selectedCount: number
                setHiddenColumnKeys: (keys: string[]) => void
              }) =>
                h('div', { 'data-testid': 'custom-toolbar' }, [
                  h('span', `selected:${selectedCount}`),
                  h('input', {
                    'aria-label': '自定义搜索',
                    value: searchValue,
                    onInput: (event: Event) => setSearch((event.target as HTMLInputElement).value)
                  }),
                  h('button', { onClick: () => submitSearch() }, '提交'),
                  h('button', { onClick: () => setFilter('status', 'active') }, '筛选'),
                  h('button', { onClick: () => setHiddenColumnKeys(['name']) }, '隐藏列')
                ])
            }
          )
        }
      })

      // Built-in toolbar region is fully replaced
      expect(container.querySelector('.tiger-data-table-toolbar')).not.toBeInTheDocument()
      expect(container.querySelector('[role="toolbar"]')).not.toBeInTheDocument()
      expect(screen.queryByPlaceholderText('内置搜索')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '导出' })).not.toBeInTheDocument()
      expect(screen.getByTestId('custom-toolbar')).toBeInTheDocument()
      expect(screen.getByText('selected:0')).toBeInTheDocument()

      await userEvent.type(screen.getByLabelText('自定义搜索'), 'a')
      expect(onSearchChange).toHaveBeenCalledWith('a')

      await userEvent.click(screen.getByRole('button', { name: '提交' }))
      expect(onSearch).toHaveBeenCalledWith('a')

      await userEvent.click(screen.getByRole('button', { name: '筛选' }))
      expect(onFiltersChange).toHaveBeenCalledWith({ status: 'active' })

      await userEvent.click(screen.getByRole('button', { name: '隐藏列' }))
      expect(onHiddenColumnsChange).toHaveBeenCalledWith(['name'])
      expect(screen.queryByRole('columnheader', { name: 'Name' })).not.toBeInTheDocument()
    })
  })

  describe('Card customization passthrough', () => {
    it('forwards declared renderCard and cardClassName props to the inner Table', () => {
      const { container } = render(DataTableWithToolbar, {
        props: {
          columns,
          dataSource: [{ id: 1, name: 'A' }],
          responsiveMode: 'card',
          pagination: false,
          cardClassName: (record: Record<string, unknown>) =>
            record.id === 1 ? 'custom-card-active' : 'custom-card',
          renderCard: ({ record }: { record: Record<string, unknown> }) =>
            h('div', { 'data-testid': 'custom-card-content' }, `自定义 ${record.name}`)
        }
      })

      expect(screen.getByTestId('custom-card-content')).toHaveTextContent('自定义 A')
      expect(container.querySelector('.custom-card-active')).toBeInTheDocument()
    })

    it('forwards the #card slot through DataTableWithToolbar and prefers it over renderCard', () => {
      render({
        render() {
          return h(
            DataTableWithToolbar,
            {
              columns,
              dataSource: [{ id: 1, name: 'A' }],
              responsiveMode: 'card',
              pagination: false,
              renderCard: () => h('div', 'prop 卡片')
            },
            {
              card: ({ record }: { record: Record<string, unknown> }) =>
                h('div', { 'data-testid': 'slot-card' }, `插槽 ${record.name}`)
            }
          )
        }
      })

      expect(screen.getByTestId('slot-card')).toHaveTextContent('插槽 A')
      expect(screen.queryByText('prop 卡片')).not.toBeInTheDocument()
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
