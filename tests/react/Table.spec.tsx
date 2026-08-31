/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, render, fireEvent } from '@testing-library/react'
import React from 'react'
import { Table } from '@expcat/tigercat-react/Table'
import type { TableColumn } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'
import { MockResizeObserver } from '../utils/mock-observers'

const columns: TableColumn[] = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
  { key: 'email', title: 'Email' }
]

const dataSource = [
  { id: 1, name: 'John Doe', age: 28, email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', age: 32, email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com' }
]

const tableHeaderBgClass =
  'bg-[var(--tiger-table-header-bg,var(--tiger-component-table-header-bg,var(--tiger-surface-muted,#f9fafb)))]'
const tableStripeBgClass =
  'bg-[var(--tiger-table-stripe-bg,var(--tiger-component-table-stripe-bg,var(--tiger-surface-muted,#f9fafb)))]/50'
const tableFixedStripeBgClass =
  'bg-[color-mix(in_srgb,var(--tiger-table-stripe-bg,var(--tiger-component-table-stripe-bg,var(--tiger-surface-muted,#f9fafb)))_50%,var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-surface,#ffffff))))]'

function stubCardViewport(isCard: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: isCard && query.includes('max-width'),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
    onchange: null
  })) as typeof window.matchMedia
}

describe('Table', () => {
  describe('Rendering', () => {
    it('should render column headers', () => {
      const { getByText } = render(<Table columns={columns} dataSource={dataSource} />)

      expect(getByText('Name')).toBeInTheDocument()
      expect(getByText('Age')).toBeInTheDocument()
      expect(getByText('Email')).toBeInTheDocument()
    })

    it('should render data rows', () => {
      const { getByText } = render(<Table columns={columns} dataSource={dataSource} />)

      expect(getByText('John Doe')).toBeInTheDocument()
      expect(getByText('Jane Smith')).toBeInTheDocument()
      expect(getByText('Bob Johnson')).toBeInTheDocument()
    })

    it('should render empty state when no data', () => {
      const { getByText } = render(<Table columns={columns} dataSource={[]} />)

      expect(getByText('No data')).toBeInTheDocument()
    })

    it('should render custom empty text', () => {
      const { getByText } = render(
        <Table columns={columns} dataSource={[]} emptyText="No records found" />
      )

      expect(getByText('No records found')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <Table columns={columns} dataSource={dataSource} className="custom-table" />
      )

      expect(container.querySelector('.custom-table')).toBeInTheDocument()
    })

    it('observes geometry only for fixed, lockable, or virtual tables', () => {
      MockResizeObserver.reset()
      vi.stubGlobal('ResizeObserver', MockResizeObserver)

      const { rerender } = render(
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      )
      expect(MockResizeObserver.instances).toHaveLength(0)

      rerender(
        <Table columns={columns} dataSource={dataSource} columnLockable pagination={false} />
      )
      expect(MockResizeObserver.instances).toHaveLength(1)

      vi.unstubAllGlobals()
    })

    it('renders mobile card markup when responsiveMode is card', () => {
      stubCardViewport(true)
      const { container, getAllByText } = render(
        <Table
          columns={columns}
          dataSource={[dataSource[0]]}
          responsiveMode="card"
          pagination={false}
        />
      )

      const cardList = container.querySelector('[data-tiger-table-mobile="card"]')
      expect(cardList).toBeInTheDocument()
      expect(container.querySelector('[data-tiger-table-layout="card"]')).toBeInTheDocument()
      expect(container.querySelector('table')).not.toBeInTheDocument()
      expect(getAllByText('Name')).toHaveLength(1)
    })

    it('keeps a single accessible table tree on the desktop card breakpoint', () => {
      stubCardViewport(false)
      const { container, getAllByText } = render(
        <Table columns={columns} dataSource={dataSource} responsiveMode="card" pagination={false} />
      )

      expect(container.querySelector('table')).toBeInTheDocument()
      expect(container.querySelector('[data-tiger-table-mobile="card"]')).not.toBeInTheDocument()
      expect(getAllByText('Name')).toHaveLength(1)
    })

    it('hides hideInCard columns in card mode while keeping them in the table', () => {
      stubCardViewport(true)
      const cardColumns: TableColumn[] = [
        { key: 'name', title: 'Name' },
        { key: 'age', title: 'Age', hideInCard: true }
      ]
      const { container } = render(
        <Table
          columns={cardColumns}
          dataSource={dataSource}
          responsiveMode="card"
          pagination={false}
        />
      )

      const cardList = container.querySelector('[data-tiger-table-mobile="card"]')!
      expect(cardList.textContent).not.toContain('Age')
      expect(cardList.textContent).toContain('Name')
    })

    it('orders card body columns by cardPriority', () => {
      stubCardViewport(true)
      const cardColumns: TableColumn[] = [
        { key: 'name', title: 'Name', cardPriority: 2 },
        { key: 'age', title: 'Age', cardPriority: 1 }
      ]
      const { container } = render(
        <Table
          columns={cardColumns}
          dataSource={[dataSource[0]]}
          responsiveMode="card"
          pagination={false}
        />
      )

      const labels = Array.from(
        container.querySelectorAll('[data-tiger-table-mobile="card"] .uppercase')
      ).map((node) => node.textContent)
      expect(labels).toEqual(['Age', 'Name'])
    })

    it('renders a cardTitle column as the card heading instead of a row', () => {
      stubCardViewport(true)
      const cardColumns: TableColumn[] = [
        { key: 'name', title: 'Name', cardTitle: true },
        { key: 'age', title: 'Age' }
      ]
      const { container } = render(
        <Table
          columns={cardColumns}
          dataSource={[dataSource[0]]}
          responsiveMode="card"
          pagination={false}
        />
      )

      const card = container.querySelector('[data-tiger-table-mobile="card"] > div')!
      const heading = card.querySelector('.font-semibold')
      expect(heading?.textContent).toBe('John Doe')
      // The title column must not also appear as a label/value row.
      const labels = Array.from(card.querySelectorAll('.uppercase')).map((n) => n.textContent)
      expect(labels).toEqual(['Age'])
    })

    it('respects a configurable cardBreakpoint', () => {
      stubCardViewport(true)
      const { container } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          responsiveMode="card"
          cardBreakpoint="md"
          pagination={false}
        />
      )

      expect(container.querySelector('[data-tiger-table-layout="card"]')).toBeInTheDocument()
      expect(container.querySelector('[data-tiger-table-mobile="card"]')).toBeInTheDocument()
      expect(container.querySelector('table')).not.toBeInTheDocument()
    })

    it('renders configured card fields in a responsive grid layout', () => {
      stubCardViewport(true)
      const cardColumns: TableColumn[] = [
        { key: 'name', title: 'Name', cardTitle: true },
        { key: 'email', title: 'Email', cardGrid: { colSpan: 6, labelPosition: 'top' } },
        { key: 'age', title: 'Age', cardGrid: { colSpan: 4, hideLabel: true } }
      ]
      const { container } = render(
        <Table
          columns={cardColumns}
          dataSource={[dataSource[0]]}
          responsiveMode="card"
          pagination={false}
        />
      )

      const grid = container.querySelector('[data-tiger-table-mobile="card"] .grid-cols-12')!
      const [emailField, ageField] = Array.from(grid.children) as HTMLElement[]

      expect(grid).toHaveClass('grid', 'grid-cols-12')
      expect(emailField).toHaveClass('col-span-12', 'sm:col-span-6')
      expect(emailField.querySelector('.mb-1')).toHaveTextContent('Email')
      expect(ageField).toHaveClass('col-span-12', 'sm:col-span-4')
      expect(ageField).toHaveTextContent('28')
      expect(ageField).not.toHaveTextContent('Age')
    })

    it('uses cardLayout ahead of column-level cardGrid options', () => {
      stubCardViewport(true)
      const cardColumns: TableColumn[] = [
        { key: 'name', title: 'Name', cardTitle: true },
        {
          key: 'email',
          title: 'Email',
          cardGrid: {
            colSpan: 6,
            labelPosition: 'top',
            labelClassName: 'column-label',
            valueClassName: 'column-value'
          }
        }
      ]
      const { container } = render(
        <Table
          columns={cardColumns}
          dataSource={[dataSource[0]]}
          responsiveMode="card"
          pagination={false}
          cardLayout={[
            {
              key: 'email',
              colSpan: 3,
              rowSpan: 2,
              labelPosition: 'top',
              divider: true,
              labelClassName: 'layout-label',
              valueClassName: 'layout-value'
            }
          ]}
        />
      )

      const emailField = container.querySelector(
        '[data-tiger-table-mobile="card"] .grid-cols-12 > div'
      )!
      expect(emailField).toHaveClass(
        'col-span-12',
        'sm:col-span-3',
        'row-span-2',
        'border-t',
        'pt-3'
      )
      expect(emailField).toHaveTextContent('john@example.com')
      expect(emailField.querySelector('.layout-label')).toHaveTextContent('Email')
      expect(emailField.querySelector('.layout-value')).toHaveTextContent('john@example.com')
      expect(emailField.querySelector('.column-label')).not.toBeInTheDocument()
    })

    it('supports inline selection controls and configurable card padding', () => {
      stubCardViewport(true)
      const { container, getByLabelText } = render(
        <Table
          columns={[
            { key: 'name', title: 'Name', cardTitle: true },
            { key: 'age', title: 'Age' }
          ]}
          dataSource={[dataSource[0]]}
          responsiveMode="card"
          pagination={false}
          rowSelection={{ type: 'checkbox' }}
          cardSelectionPosition="title-inline"
          cardPadding={false}
          labels={{ selectRowAriaLabel: 'Pick row {row}' }}
        />
      )

      const card = container.querySelector('[data-tiger-table-mobile="card"] > div:nth-child(2)')!
      const title = card.querySelector('.font-semibold')!
      expect(card).not.toHaveClass('p-3')
      expect(title).toHaveClass('flex', 'items-center')
      expect(title).toContainElement(getByLabelText('Pick row 1'))
    })

    it('uses custom card padding classes', () => {
      stubCardViewport(true)
      const { container } = render(
        <Table
          columns={columns}
          dataSource={[dataSource[0]]}
          responsiveMode="card"
          pagination={false}
          cardPadding="p-4"
        />
      )

      const card = container.querySelector('[data-tiger-table-mobile="card"] > div')!
      expect(card).toHaveClass('p-4')
      expect(card).not.toHaveClass('p-3')
    })

    it('uses table labels and themed selection controls in card mode', async () => {
      stubCardViewport(true)
      const onSelectionChange = vi.fn()
      const { getByText, getByLabelText, container } = render(
        <Table
          columns={columns}
          dataSource={[dataSource[0]]}
          responsiveMode="card"
          pagination={false}
          rowSelection={{ type: 'checkbox' }}
          expandable={{ expandedRowRender: () => <div>Expanded details</div> }}
          labels={{
            expandText: 'More',
            collapseText: 'Less',
            selectAllText: 'All rows',
            selectRowAriaLabel: 'Pick row {row}'
          }}
          onSelectionChange={onSelectionChange}
        />
      )

      expect(getByText('All rows')).toBeInTheDocument()
      expect(getByText('More')).toBeInTheDocument()
      expect(getByLabelText('Pick row 1')).toBeInTheDocument()
      expect(
        container.querySelector('[data-tiger-table-mobile="card"] input[type="checkbox"]')
      ).toBeTruthy()

      await fireEvent.click(getByText('All rows'))
      expect(onSelectionChange).toHaveBeenCalledWith([1])

      await fireEvent.click(getByText('More'))
      expect(getByText('Less')).toBeInTheDocument()
    })

    it('renders Empty and custom cards in card mode', () => {
      stubCardViewport(true)
      const empty = render(
        <Table
          columns={columns}
          dataSource={[]}
          responsiveMode="card"
          pagination={false}
          labels={{ emptyText: 'Nothing here' }}
        />
      )
      expect(empty.getAllByText('Nothing here')).toHaveLength(1)
      empty.unmount()

      const { getByTestId } = render(
        <Table
          columns={columns}
          dataSource={[dataSource[0]]}
          responsiveMode="card"
          pagination={false}
          cardClassName="custom-card"
          renderCard={({ record }) => <div data-testid="custom-card">{record.name}</div>}
        />
      )
      expect(getByTestId('custom-card')).toHaveTextContent('John Doe')
      expect(getByTestId('custom-card').closest('.custom-card')).toBeInTheDocument()
    })

    it('exposes a card-mode sort selector', async () => {
      stubCardViewport(true)
      const onSortChange = vi.fn()
      const sortableColumns: TableColumn[] = [
        { key: 'name', title: 'Name', sortable: true },
        { key: 'age', title: 'Age', sortable: true }
      ]
      const { container, getByText } = render(
        <Table
          columns={sortableColumns}
          dataSource={dataSource}
          responsiveMode="card"
          pagination={false}
          onSortChange={onSortChange}
        />
      )

      const sortTrigger = container.querySelector(
        '[data-tiger-table-mobile="card"] [role="combobox"]'
      )!
      expect(sortTrigger).toHaveAttribute('aria-label', 'Sort')
      expect(sortTrigger).toHaveTextContent('Clear sort')
      await fireEvent.click(sortTrigger)
      await fireEvent.click(getByText('Sort by Age ↓'))

      expect(onSortChange).toHaveBeenCalledWith({ key: 'age', direction: 'desc' })
    })
  })

  describe('Props', () => {
    it('should show border when bordered is true', () => {
      const { container } = render(<Table columns={columns} dataSource={dataSource} bordered />)

      const wrappers = container.querySelectorAll('div')
      const borderWrapper = Array.from(wrappers).find((div) => div.classList.contains('border'))
      expect(borderWrapper).toBeTruthy()
    })
    it('should disable pagination when pagination is false', () => {
      const { container } = render(
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      )

      const pagination = container.querySelector('.flex.items-center.justify-between')
      expect(pagination).not.toBeInTheDocument()
    })

    it('marks large non-virtual data sets with a virtual recommendation', () => {
      const largeData = Array.from({ length: 4 }, (_, index) => ({
        id: index,
        name: `User ${index}`,
        age: index,
        email: `user${index}@example.com`
      }))

      const { container } = render(
        <Table
          columns={columns}
          dataSource={largeData}
          pagination={false}
          autoVirtual={false}
          virtualThreshold={4}
        />
      )

      expect(container.querySelector('[data-tiger-virtual-recommended="true"]')).toHaveAttribute(
        'data-tiger-virtual-threshold',
        '4'
      )
    })

    it('does not auto-enable virtual mode unless autoVirtual is set', () => {
      const largeData = Array.from({ length: 4 }, (_, index) => ({
        id: index,
        name: `User ${index}`,
        age: index,
        email: `user${index}@example.com`
      }))

      const { container } = render(
        <Table columns={columns} dataSource={largeData} pagination={false} virtualThreshold={4} />
      )

      expect(container.querySelector('[data-tiger-virtual="enabled"]')).not.toBeInTheDocument()
      expect(container.querySelector('[data-tiger-virtual-recommended="true"]')).toBeInTheDocument()
    })

    it('auto-enables virtual mode when autoVirtual is true', () => {
      const largeData = Array.from({ length: 4 }, (_, index) => ({
        id: index,
        name: `User ${index}`,
        age: index,
        email: `user${index}@example.com`
      }))

      const { container } = render(
        <Table
          columns={columns}
          dataSource={largeData}
          pagination={false}
          autoVirtual
          virtualThreshold={4}
        />
      )

      expect(container.querySelector('[data-tiger-virtual="enabled"]')).toBeInTheDocument()
    })

    it('keeps virtual overflow on an inner scroller around the table, not export or Pagination', () => {
      const rows = Array.from({ length: 15 }, (_, index) => ({
        id: index,
        name: `User ${index}`,
        age: index,
        email: `user${index}@example.com`
      }))

      const { container, getByText } = render(
        <Table columns={columns} dataSource={rows} virtual virtualHeight={320} exportable />
      )

      const wrapper = container.querySelector('[data-tiger-virtual="enabled"]') as HTMLElement
      expect(wrapper).toBeTruthy()
      expect(wrapper.style.overflow).not.toMatch(/^(auto|scroll)$/)
      expect(wrapper.style.height).not.toBe('320px')
      expect(wrapper.className.split(/\s+/)).not.toContain('overflow-y-auto')

      const table = wrapper.querySelector('table')
      expect(table).toBeTruthy()
      const scroller = table!.parentElement as HTMLElement
      expect(scroller).not.toBe(wrapper)
      expect(scroller.style.height).toBe('320px')
      expect(scroller.style.overflow).toBe('auto')
      expect(scroller.contains(table)).toBe(true)

      const exportButton = getByText('Export CSV')
      expect(wrapper.contains(exportButton)).toBe(true)
      expect(scroller.contains(exportButton)).toBe(false)

      const pagination = wrapper.querySelector('nav[role="navigation"]')
      expect(pagination).toBeTruthy()
      expect(wrapper.contains(pagination)).toBe(true)
      expect(scroller.contains(pagination)).toBe(false)
    })
  })

  describe('Fixed Columns', () => {
    it('keeps striped background on fixed body cells', () => {
      const fixedColumns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 140, fixed: 'left' },
        { key: 'age', title: 'Age', width: 120 },
        { key: 'email', title: 'Email', width: 220 }
      ]

      const { getByText } = render(
        <Table columns={fixedColumns} dataSource={dataSource} striped pagination={false} />
      )

      expect(getByText('John Doe').closest('td')).toHaveClass(tableFixedStripeBgClass)
    })

    it('supports fixedClassName and fixedHeaderClassName overrides', () => {
      const fixedColumns: TableColumn[] = [
        {
          key: 'name',
          title: 'Name',
          width: 140,
          fixed: 'left',
          fixedHeaderClassName: 'custom-fixed-header',
          fixedClassName: ({ selected, view, fixed }) =>
            selected ? `${view}-${fixed}-selected` : 'custom-fixed-cell'
        },
        { key: 'age', title: 'Age', width: 120 }
      ]

      const { getByText } = render(
        <Table
          columns={fixedColumns}
          dataSource={dataSource}
          pagination={false}
          rowSelection={{ selectedRowKeys: [1], type: 'checkbox' }}
        />
      )

      expect(getByText('Name').closest('th')).toHaveClass('custom-fixed-header')
      expect(getByText('John Doe').closest('td')).toHaveClass('table-left-selected')
    })
  })

  describe('Hidden Columns', () => {
    it('hides columns listed in defaultHiddenColumnKeys (uncontrolled)', () => {
      const { queryByText, getByText } = render(
        <Table columns={columns} dataSource={dataSource} defaultHiddenColumnKeys={['email']} />
      )

      expect(getByText('Name')).toBeInTheDocument()
      expect(queryByText('Email')).not.toBeInTheDocument()
      expect(queryByText('john@example.com')).not.toBeInTheDocument()
    })

    it('hides columns via the controlled hiddenColumnKeys prop and reacts to updates', () => {
      const { queryByText, getByText, rerender } = render(
        <Table columns={columns} dataSource={dataSource} hiddenColumnKeys={['age']} />
      )

      expect(queryByText('Age')).not.toBeInTheDocument()
      expect(getByText('Name')).toBeInTheDocument()

      rerender(<Table columns={columns} dataSource={dataSource} hiddenColumnKeys={[]} />)
      expect(getByText('Age')).toBeInTheDocument()
    })

    it('recalculates fixed column offsets based on visible columns only', () => {
      const fixedColumns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 140, fixed: 'left' },
        { key: 'age', title: 'Age', width: 120, fixed: 'left' },
        { key: 'email', title: 'Email', width: 220 }
      ]

      const { getByText } = render(
        <Table
          columns={fixedColumns}
          dataSource={dataSource}
          pagination={false}
          hiddenColumnKeys={['name']}
        />
      )

      const ageHeader = getByText('Age').closest('th')
      expect(ageHeader!).toHaveStyle('position: sticky')
      expect(ageHeader!).toHaveStyle('left: 0px')
    })

    it('renders portaled dropdown menus from fixed action columns into document.body', async () => {
      const { Dropdown, DropdownMenu, DropdownItem } = await import('@expcat/tigercat-react')
      const fixedColumns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 140 },
        {
          key: 'actions',
          title: 'Actions',
          width: 140,
          fixed: 'right',
          render: () => (
            <Dropdown trigger="click" showArrow={false}>
              <button>Open menu</button>
              <DropdownMenu>
                <DropdownItem>Edit</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )
        }
      ]

      const { getAllByText } = render(
        <Table columns={fixedColumns} dataSource={dataSource} pagination={false} />
      )

      await fireEvent.click(getAllByText('Open menu')[0])
      const menuWrapper = document.querySelector('[data-tiger-dropdown-menu]:not([hidden])')
      expect(menuWrapper).not.toBeNull()
      expect(menuWrapper!.closest('[data-tiger-overlay-layer]')?.parentElement).toBe(document.body)
    })
  })

  describe('Column Lock Button', () => {
    it('should toggle fixed state when clicking the header lock button', async () => {
      const lockableColumns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 140 },
        { key: 'age', title: 'Age', width: 120 },
        { key: 'email', title: 'Email', width: 220 }
      ]

      const { container, getByLabelText, getByText } = render(
        <Table
          columns={lockableColumns}
          dataSource={dataSource}
          pagination={false}
          columnLockable
        />
      )

      await fireEvent.click(getByLabelText('Lock column Email'))

      const emailHeaderLocked = getByText('Email').closest('th')!
      expect(emailHeaderLocked).toHaveStyle('position: sticky')
      expect(emailHeaderLocked).toHaveStyle('left: 0px')
      expect(emailHeaderLocked).toHaveClass(tableHeaderBgClass)
      expect(
        Array.from(container.querySelectorAll('thead th')).map((th) => th.textContent?.trim())
      ).toEqual(['Email', 'Name', 'Age'])

      await fireEvent.click(getByLabelText('Unlock column Email'))

      const emailHeaderUnlocked = getByText('Email').closest('th')!
      expect(emailHeaderUnlocked).not.toHaveStyle('position: sticky')
    })

    it('pins column widths via a colgroup that is stable across lock toggles', async () => {
      const lockableColumns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 140 },
        { key: 'age', title: 'Age', width: 120 },
        { key: 'email', title: 'Email', width: 220 }
      ]

      const { container, getByLabelText } = render(
        <Table
          columns={lockableColumns}
          dataSource={dataSource}
          pagination={false}
          columnLockable
        />
      )

      const colsBefore = Array.from(container.querySelectorAll('table > colgroup col'))
      expect(colsBefore).toHaveLength(3)
      const widthsBefore = colsBefore.map((col) => (col as HTMLElement).style.width)
      expect(widthsBefore).toEqual(['140px', '120px', '220px'])

      await fireEvent.click(getByLabelText('Lock column Email'))

      const widthsAfter = Array.from(container.querySelectorAll('table > colgroup col')).map(
        (col) => (col as HTMLElement).style.width
      )
      expect(widthsAfter).toEqual(['220px', '140px', '120px'])
      expect(widthsAfter.sort()).toEqual(widthsBefore.sort())
    })

    it('moves a newly locked middle column into the compact left fixed area', async () => {
      const lockableColumns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 200, fixed: 'left' },
        { key: 'email', title: 'Email', width: 400 },
        { key: 'age', title: 'Age', width: 200 },
        { key: 'role', title: 'Role', width: 240 }
      ]

      const { container, getByLabelText, getByText } = render(
        <Table
          columns={lockableColumns}
          dataSource={dataSource}
          pagination={false}
          columnLockable
        />
      )

      await fireEvent.click(getByLabelText('Lock column Age'))

      expect(
        Array.from(container.querySelectorAll('thead th')).map((th) => th.textContent?.trim())
      ).toEqual(['Name', 'Age', 'Email', 'Role'])

      const ageHeaderLocked = getByText('Age').closest('th')!
      const emailHeader = getByText('Email').closest('th')!
      expect(ageHeaderLocked).toHaveStyle('position: sticky')
      expect(ageHeaderLocked).toHaveStyle('left: 200px')
      expect(emailHeader).not.toHaveStyle('position: sticky')
    })

    it('does not render a colgroup for a plain table without fixed or lockable columns', () => {
      const { container } = render(
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      )

      expect(container.querySelector('table > colgroup')).toBeNull()
    })
  })

  describe('Sorting', () => {
    it('renders a real sort button on sortable headers for keyboard access', () => {
      const sortableColumns: TableColumn[] = [
        { key: 'name', title: 'Name', sortable: true },
        { key: 'age', title: 'Age' }
      ]

      const { getByText } = render(<Table columns={sortableColumns} dataSource={dataSource} />)

      const nameHeaderCell = getByText('Name').closest('th')!
      const sortButton = nameHeaderCell.querySelector<HTMLButtonElement>(
        'button[type="button"][data-tiger-table-sort]'
      )
      expect(sortButton).not.toBeNull()
      expect(sortButton).not.toBeDisabled()
      expect(sortButton).not.toHaveAttribute('tabindex', '-1')
      expect(nameHeaderCell).toHaveAttribute('aria-sort', 'none')
      expect(nameHeaderCell).toHaveAttribute('data-tiger-table-column-key', 'name')

      const ageHeaderCell = getByText('Age').closest('th')!
      expect(ageHeaderCell.querySelector('[data-tiger-table-sort]')).toBeNull()
    })

    it('should call onSortChange when clicking sortable column', async () => {
      const sortableColumns: TableColumn[] = [
        { key: 'name', title: 'Name', sortable: true },
        { key: 'age', title: 'Age' }
      ]

      const onSortChange = vi.fn()

      const { getByText } = render(
        <Table columns={sortableColumns} dataSource={dataSource} onSortChange={onSortChange} />
      )

      const nameHeader = getByText('Name')
      await fireEvent.click(nameHeader.closest('th')!.querySelector('[data-tiger-table-sort]')!)

      expect(onSortChange).toHaveBeenCalledWith({
        key: 'name',
        direction: 'asc'
      })
    })

    it('should toggle sort direction on multiple clicks', async () => {
      const sortableColumns: TableColumn[] = [{ key: 'name', title: 'Name', sortable: true }]

      const onSortChange = vi.fn()

      const { getByText } = render(
        <Table columns={sortableColumns} dataSource={dataSource} onSortChange={onSortChange} />
      )

      const nameHeader = getByText('Name').closest('th')!
      const sortButton = nameHeader.querySelector('[data-tiger-table-sort]')!

      expect(nameHeader).toHaveAttribute('aria-sort', 'none')

      // First click - asc
      await fireEvent.click(sortButton)
      expect(onSortChange).toHaveBeenCalledWith({
        key: 'name',
        direction: 'asc'
      })
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')

      // Second click - desc
      await fireEvent.click(sortButton)
      expect(onSortChange).toHaveBeenCalledWith({
        key: 'name',
        direction: 'desc'
      })
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending')

      // Third click - null (clear sort)
      await fireEvent.click(sortButton)
      expect(onSortChange).toHaveBeenCalledWith({
        key: null,
        direction: null
      })
      expect(nameHeader).toHaveAttribute('aria-sort', 'none')
    })

    it('sorts and filters by dataKey when it differs from key', async () => {
      const splitColumns: TableColumn[] = [
        { key: 'nameCol', title: 'Name', dataKey: 'name', sortable: true },
        { key: 'ageCol', title: 'Age', dataKey: 'age', filter: { type: 'text' } }
      ]

      const { container, getByText } = render(
        <Table columns={splitColumns} dataSource={dataSource} pagination={false} />
      )

      const nameHeaderCell = getByText('Name').closest('th')!
      const sortButton = nameHeaderCell.querySelector('[data-tiger-table-sort]')!
      await fireEvent.click(sortButton)

      const firstCell = container.querySelector('tbody tr td')
      expect(firstCell).toHaveTextContent('Bob Johnson')

      const filterInput = container.querySelector('thead input[type="text"]') as HTMLInputElement
      await fireEvent.change(filterInput, { target: { value: '32' } })

      const rows = container.querySelectorAll('tbody tr')
      expect(rows).toHaveLength(1)
      expect(rows[0]).toHaveTextContent('Jane Smith')
    })
  })

  describe('Filtering', () => {
    it('should render filter input for columns with filter config', () => {
      const filterColumns: TableColumn[] = [
        {
          key: 'name',
          title: 'Name',
          filter: { type: 'text', placeholder: 'Search...' }
        },
        { key: 'age', title: 'Age' }
      ]

      const { container } = render(<Table columns={filterColumns} dataSource={dataSource} />)

      const filterInput = container.querySelector('input[type="text"]')
      expect(filterInput).toBeInTheDocument()
      expect(filterInput).toHaveAttribute('placeholder', 'Search...')
    })

    it('should render filter select for select type filter', () => {
      const filterColumns: TableColumn[] = [
        {
          key: 'status',
          title: 'Status',
          filter: {
            type: 'select',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        }
      ]

      const { container } = render(
        <Table
          columns={filterColumns}
          dataSource={[
            { id: 1, status: 'active' },
            { id: 2, status: 'inactive' }
          ]}
        />
      )

      const filterSelect = container.querySelector('select')
      expect(filterSelect).toBeInTheDocument()
    })

    it('binds controlled filters and names the filter control', () => {
      const filterColumns: TableColumn[] = [
        { key: 'name', title: 'Name', filter: { type: 'text' } }
      ]
      const { container, getByLabelText } = render(
        <Table
          columns={filterColumns}
          dataSource={dataSource}
          filters={{ name: 'Jane' }}
          pagination={false}
        />
      )

      const filterInput = getByLabelText('Filter Name') as HTMLInputElement
      expect(filterInput).toHaveValue('Jane')
      expect(container.querySelector('thead [data-tiger-table-filter]')).toBeInTheDocument()
    })

    it('sorts when the header cell is clicked', async () => {
      const onSortChange = vi.fn()
      const sortableColumns: TableColumn[] = [{ key: 'name', title: 'Name', sortable: true }]
      const { getByText } = render(
        <Table
          columns={sortableColumns}
          dataSource={dataSource}
          pagination={false}
          onSortChange={onSortChange}
        />
      )

      await fireEvent.click(getByText('Name').closest('th')!)
      expect(onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' })
    })
  })

  describe('Pagination', () => {
    it('should call onPageChange when clicking next button', async () => {
      const onPageChange = vi.fn()

      // Create enough data to have multiple pages
      const largeDataSource = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        age: 20 + i,
        email: `person${i + 1}@example.com`
      }))

      const { getByRole, getByText, queryByText } = render(
        <Table columns={columns} dataSource={largeDataSource} onPageChange={onPageChange} />
      )

      expect(getByText('Person 1')).toBeInTheDocument()
      expect(queryByText('Person 11')).not.toBeInTheDocument()

      const nextButton = getByRole('button', { name: 'Next page' })
      await fireEvent.click(nextButton)

      expect(onPageChange).toHaveBeenCalledWith({
        current: 2,
        pageSize: 10
      })
      expect(getByText('Person 11')).toBeInTheDocument()
      expect(queryByText('Person 1')).not.toBeInTheDocument()
    })

    it('should show all rows when default page size is changed via the size select', async () => {
      const largeDataSource = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        age: 20 + i,
        email: `person${i + 1}@example.com`
      }))

      const { getByLabelText, getByText, queryByText } = render(
        <Table columns={columns} dataSource={largeDataSource} />
      )

      expect(getByText('Person 1')).toBeInTheDocument()
      expect(queryByText('Person 11')).not.toBeInTheDocument()

      await fireEvent.change(getByLabelText('/ page'), {
        target: { value: '20' }
      })

      expect(getByText('Person 1')).toBeInTheDocument()
      expect(getByText('Person 11')).toBeInTheDocument()
      expect(getByText('Person 15')).toBeInTheDocument()
    })
    it('should respect controlled pagination on rerender', () => {
      const { rerender, getByText, queryByText } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ current: 1, pageSize: 1, showSizeChanger: false }}
        />
      )

      expect(getByText('John Doe')).toBeInTheDocument()

      rerender(
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ current: 2, pageSize: 1, showSizeChanger: false }}
        />
      )

      expect(queryByText('John Doe')).not.toBeInTheDocument()
      expect(getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should render dataSource as-is and derive page count from total in remote mode', () => {
      // Server-side pagination: dataSource holds only the current page (page 2 of 48 items)
      const pageTwoRows = Array.from({ length: 10 }, (_, i) => ({
        id: i + 11,
        name: `Person ${i + 11}`,
        age: 20 + i,
        email: `person${i + 11}@example.com`
      }))

      const { container, getByText, getByRole, getByLabelText } = render(
        <Table
          columns={columns}
          dataSource={pageTwoRows}
          pagination={{ remote: true, current: 2, pageSize: 10, total: 48 }}
        />
      )

      expect(container.querySelectorAll('tbody tr')).toHaveLength(10)
      expect(getByText('Person 11')).toBeInTheDocument()
      expect(getByText('Person 20')).toBeInTheDocument()
      // More than 3 pages: page-number buttons plus quick jumper
      expect(getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
      expect(getByRole('button', { name: 'Page 5' })).toBeInTheDocument()
      expect(getByLabelText('Go to')).toBeInTheDocument()
      expect(getByText('Total 48 items')).toBeInTheDocument()
    })
  })

  describe('Row Selection', () => {
    it('should render checkbox column when rowSelection is provided', () => {
      const { container } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          rowSelection={{
            selectedRowKeys: []
          }}
        />
      )

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      // Should have one checkbox in header + one for each row
      expect(checkboxes.length).toBe(dataSource.length + 1)
    })

    it('should call onSelectionChange when selecting row', async () => {
      const onSelectionChange = vi.fn()

      const { container } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          rowSelection={{
            selectedRowKeys: []
          }}
          onSelectionChange={onSelectionChange}
        />
      )

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      const firstRowCheckbox = checkboxes[1] // Skip header checkbox

      await fireEvent.click(firstRowCheckbox)

      expect(onSelectionChange).toHaveBeenCalled()
    })

    it('should support radio selection', () => {
      const { container } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          rowSelection={{
            selectedRowKeys: [],
            type: 'radio'
          }}
        />
      )

      const radios = container.querySelectorAll('input[type="radio"]')
      expect(radios.length).toBe(dataSource.length)
      expect(container.querySelectorAll('thead th')).toHaveLength(columns.length + 1)
      expect(container.querySelectorAll('tbody tr:first-child td')).toHaveLength(columns.length + 1)
      expect(radios[0]).toHaveAttribute('name')
      expect(radios[0]).toHaveAttribute('aria-label')
    })

    it('keeps radio, expand, and summary chrome in the same order', () => {
      const { container } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowSelection={{ type: 'radio' }}
          expandable={{ expandedRowRender: () => <div>more</div> }}
          summaryRow={{ show: true, data: { name: 'Total', age: '', email: '' } }}
        />
      )

      expect(container.querySelectorAll('thead tr:first-child > *')).toHaveLength(
        columns.length + 2
      )
      expect(container.querySelectorAll('tbody tr:first-child > *')).toHaveLength(
        columns.length + 2
      )
      expect(container.querySelectorAll('tfoot tr:first-child > *')).toHaveLength(
        columns.length + 2
      )
    })

    it('should respect controlled selectedRowKeys on rerender', () => {
      const { container, rerender } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowSelection={{
            selectedRowKeys: []
          }}
        />
      )

      const firstRowCheckbox = container.querySelectorAll('input[type="checkbox"]')[1]
      expect(firstRowCheckbox).not.toBeChecked()

      rerender(
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          rowSelection={{
            selectedRowKeys: [1]
          }}
        />
      )

      const firstRowCheckboxAfter = container.querySelectorAll('input[type="checkbox"]')[1]
      expect(firstRowCheckboxAfter).toBeChecked()
    })
  })

  describe('Loading State', () => {
    it('should show loading overlay when loading is true', () => {
      const { container } = render(<Table columns={columns} dataSource={dataSource} loading />)

      const loadingSpinner = container.querySelector('.animate-spin')
      expect(loadingSpinner).toBeInTheDocument()
    })
  })

  describe('Custom Rendering', () => {
    it('should render custom cell content', () => {
      const customColumns: TableColumn[] = [
        {
          key: 'name',
          title: 'Name',
          render: (record) => <strong>{record.name}</strong>
        }
      ]

      const { container } = render(<Table columns={customColumns} dataSource={dataSource} />)

      const strongElements = container.querySelectorAll('strong')
      expect(strongElements.length).toBe(dataSource.length)
    })

    it('should render custom header content', () => {
      const customColumns: TableColumn[] = [
        {
          key: 'name',
          title: 'Name',
          renderHeader: () => <span className="custom-header">Custom Name</span>
        }
      ]

      const { container } = render(<Table columns={customColumns} dataSource={dataSource} />)

      const customHeader = container.querySelector('.custom-header')
      expect(customHeader).toBeInTheDocument()
      expect(customHeader).toHaveTextContent('Custom Name')
    })
  })

  describe('Accessibility', () => {
    it('should have no a11y violations', async () => {
      const { container } = render(
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      )

      await act(async () => {
        await Promise.resolve()
      })

      await expectNoA11yViolationsIsolated(container)
    })

    it('should have proper table structure', () => {
      const { container } = render(
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      )

      expect(container.querySelector('table')).toBeInTheDocument()
      expect(container.querySelector('thead')).toBeInTheDocument()
      expect(container.querySelector('tbody')).toBeInTheDocument()
      expect(container.querySelectorAll('th').length).toBe(columns.length)
    })
  })

  describe('Events', () => {
    it('should call onRowClick when clicking a row', async () => {
      const onRowClick = vi.fn()

      const { container } = render(
        <Table columns={columns} dataSource={dataSource} onRowClick={onRowClick} />
      )

      const firstRow = container.querySelector('tbody tr')!
      await fireEvent.click(firstRow)

      expect(onRowClick).toHaveBeenCalledWith(dataSource[0], 0)
    })

    it('makes rows keyboard-activable when onRowClick is provided (C21)', async () => {
      const onRowClick = vi.fn()
      const { container } = render(
        <Table columns={columns} dataSource={dataSource} onRowClick={onRowClick} />
      )
      const firstRow = container.querySelector('tbody tr')! as HTMLElement
      expect(firstRow).toHaveAttribute('tabindex', '0')
      fireEvent.keyDown(firstRow, { key: 'Enter' })
      expect(onRowClick).toHaveBeenCalledWith(dataSource[0], 0)
      fireEvent.keyDown(firstRow, { key: ' ' })
      expect(onRowClick).toHaveBeenCalledTimes(2)
    })

    it('exposes aria-selected on rows and leaves non-interactive rows unfocusable (C21)', () => {
      const { container, rerender } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          rowSelection={{ type: 'checkbox', selectedRowKeys: [1] }}
        />
      )
      const rows = container.querySelectorAll('tbody tr')
      expect(rows[0]).toHaveAttribute('aria-selected', 'true')
      expect(rows[1]).toHaveAttribute('aria-selected', 'false')
      expect(rows[0]).not.toHaveAttribute('tabindex')

      rerender(<Table columns={columns} dataSource={dataSource} />)
      const plainRow = container.querySelector('tbody tr')!
      expect(plainRow).not.toHaveAttribute('tabindex')
      expect(plainRow).not.toHaveAttribute('aria-selected')
    })

    it('should call onChange with combined state', async () => {
      const onChange = vi.fn()

      const sortableColumns: TableColumn[] = [{ key: 'name', title: 'Name', sortable: true }]

      const { getByText } = render(
        <Table columns={sortableColumns} dataSource={dataSource} onChange={onChange} />
      )

      const nameHeader = getByText('Name')
      await fireEvent.click(nameHeader.closest('th')!.querySelector('[data-tiger-table-sort]')!)

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: expect.objectContaining({
            key: 'name',
            direction: 'asc'
          })
        })
      )
    })
  })

  describe('Expandable Rows', () => {
    const expandableConfig = {
      expandedRowRender: (record: Record<string, unknown>) => (
        <div className="expanded-content">Details for {record.name as string}</div>
      )
    }
    it('should expand row on clicking expand button', async () => {
      const { getAllByRole, getByText } = render(
        <Table columns={columns} dataSource={dataSource} expandable={expandableConfig} />
      )

      const expandButtons = getAllByRole('button', { name: /expand row/i })
      await fireEvent.click(expandButtons[0])

      expect(getByText('Details for John Doe')).toBeInTheDocument()
    })
    it('should support controlled expandedRowKeys', () => {
      const { getByText, queryByText } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          expandable={{
            ...expandableConfig,
            expandedRowKeys: [2]
          }}
        />
      )

      expect(queryByText('Details for John Doe')).not.toBeInTheDocument()
      expect(getByText('Details for Jane Smith')).toBeInTheDocument()
    })

    it('should call onExpandChange callback', async () => {
      const onExpandChange = vi.fn()

      const { getAllByRole } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          expandable={expandableConfig}
          onExpandChange={onExpandChange}
        />
      )

      const expandButtons = getAllByRole('button', { name: /expand row/i })
      await fireEvent.click(expandButtons[0])

      expect(onExpandChange).toHaveBeenCalledWith(
        [1],
        expect.objectContaining({ id: 1, name: 'John Doe' }),
        true
      )
    })

    it('should respect rowExpandable function', () => {
      const { getAllByRole } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          expandable={{
            ...expandableConfig,
            rowExpandable: (record) => (record.age as number) !== 32
          }}
        />
      )

      // Only 2 out of 3 rows should have expand buttons (Jane age=32 excluded)
      const expandButtons = getAllByRole('button', { name: /expand row/i })
      expect(expandButtons.length).toBe(2)
    })

    it('should expand row by clicking entire row when expandRowByClick is true', async () => {
      const { getByText } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          expandable={{
            ...expandableConfig,
            expandRowByClick: true
          }}
        />
      )

      // Click the row (via a cell)
      await fireEvent.click(getByText('John Doe'))

      expect(getByText('Details for John Doe')).toBeInTheDocument()
    })

    it('should reuse cached row keys when expanding by row click', async () => {
      const rowKey = vi.fn((record: Record<string, unknown>) => record.id as number)

      const { getByText } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey={rowKey}
          pagination={false}
          expandable={{
            ...expandableConfig,
            expandRowByClick: true
          }}
        />
      )

      expect(rowKey).toHaveBeenCalledTimes(dataSource.length)

      await fireEvent.click(getByText('John Doe'))

      expect(getByText('Details for John Doe')).toBeInTheDocument()
      expect(rowKey).toHaveBeenCalledTimes(dataSource.length)
    })
    it('should set aria-expanded attribute on expand button', async () => {
      const { getAllByRole } = render(
        <Table columns={columns} dataSource={dataSource} expandable={expandableConfig} />
      )

      const expandButtons = getAllByRole('button', { name: /expand row/i })
      expect(expandButtons[0].getAttribute('aria-expanded')).toBe('false')

      await fireEvent.click(expandButtons[0])

      const collapseButton = getAllByRole('button', { name: /collapse row/i })[0]
      expect(collapseButton.getAttribute('aria-expanded')).toBe('true')
    })
  })

  // --- v0.6.0 Table upgrade tests ---

  describe('v0.6.0 - Advanced Filtering', () => {
    it('should filter data with advanced rules', () => {
      const { queryByText } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          filterMode="advanced"
          advancedFilterRules={[{ column: 'name', operator: 'equals', value: 'John Doe' }]}
          pagination={false}
        />
      )

      expect(queryByText('John Doe')).toBeInTheDocument()
      expect(queryByText('Jane Smith')).not.toBeInTheDocument()
      expect(queryByText('Bob Johnson')).not.toBeInTheDocument()
    })
  })

  describe('v0.6.0 - Editable Cells', () => {
    it('should enter edit mode on double-click', () => {
      const { container, getByText } = render(
        <Table columns={columns} dataSource={dataSource} editable={true} pagination={false} />
      )

      const cell = getByText('John Doe')
      fireEvent.doubleClick(cell.closest('td')!)

      const input = container.querySelector('input[class]')
      expect(input).toBeInTheDocument()
      expect((input as HTMLInputElement).value).toBe('John Doe')
    })
  })

  describe('v0.6.0 - Summary Row', () => {
    it('should render summary row when summaryRow.show is true', () => {
      const { container } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          summaryRow={{ show: true, data: { name: 'Total', age: '105', email: '-' } }}
          pagination={false}
        />
      )

      const tfoot = container.querySelector('tfoot')
      expect(tfoot).toBeInTheDocument()
      expect(tfoot!.textContent).toContain('Total')
    })
  })

  describe('v0.6.0 - Row Grouping', () => {
    const groupData = [
      { id: 1, name: 'Alice', age: 25, email: 'a@test.com', dept: 'Engineering' },
      { id: 2, name: 'Bob', age: 30, email: 'b@test.com', dept: 'Design' },
      { id: 3, name: 'Charlie', age: 35, email: 'c@test.com', dept: 'Engineering' }
    ]

    const groupColumns: TableColumn[] = [
      { key: 'name', title: 'Name' },
      { key: 'dept', title: 'Dept' }
    ]

    it('should render group headers when groupBy is set', () => {
      const { container } = render(
        <Table columns={groupColumns} dataSource={groupData} groupBy="dept" pagination={false} />
      )

      const tbody = container.querySelector('tbody')
      expect(tbody).toBeInTheDocument()
      expect(tbody!.textContent).toContain('Engineering')
      expect(tbody!.textContent).toContain('Design')
    })
  })

  describe('v0.6.0 - Export', () => {
    it('should render export button when exportable is true', () => {
      const { getByText } = render(
        <Table columns={columns} dataSource={dataSource} exportable={true} pagination={false} />
      )

      expect(getByText('Export CSV')).toBeInTheDocument()
    })
  })

  describe('v0.6.0 - Column Draggable', () => {
    it('should set draggable attribute on headers when columnDraggable is true', () => {
      const { container } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          columnDraggable={true}
          pagination={false}
        />
      )

      const headers = container.querySelectorAll('thead th')
      headers.forEach((th) => {
        expect(th.getAttribute('draggable')).toBe('true')
      })
    })
  })

  describe('v0.6.0 - Row Draggable', () => {
    it('should emit reordered rows when dropping a row', () => {
      const onRowOrderChange = vi.fn()
      const { container } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          rowDraggable={true}
          pagination={false}
          onRowOrderChange={onRowOrderChange}
        />
      )

      const rows = container.querySelectorAll('tbody tr')
      expect(rows[0]).toHaveAttribute('draggable', 'true')

      fireEvent.dragStart(rows[0])
      fireEvent.dragOver(rows[2])
      fireEvent.drop(rows[2])

      expect(onRowOrderChange).toHaveBeenCalledWith([dataSource[1], dataSource[2], dataSource[0]])
    })
  })
})
