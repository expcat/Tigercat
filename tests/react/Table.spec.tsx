/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { Table, type TableColumn } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

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

describe('Table', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Table columns={columns} dataSource={dataSource} />)

      const table = container.querySelector('table')
      expect(table).toBeInTheDocument()
    })

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
  })

  describe('Props', () => {
    it('should apply size classes correctly', () => {
      const { container } = render(
        <Table columns={columns} dataSource={dataSource} size="sm" pagination={false} />
      )

      const ths = container.querySelectorAll('th')
      const firstDataHeader = ths[0]
      expect(firstDataHeader).toHaveClass('px-3', 'py-2')
    })

    it('should show border when bordered is true', () => {
      const { container } = render(<Table columns={columns} dataSource={dataSource} bordered />)

      const wrappers = container.querySelectorAll('div')
      const borderWrapper = Array.from(wrappers).find((div) => div.classList.contains('border'))
      expect(borderWrapper).toBeTruthy()
    })

    it('should apply striped classes when striped is true', () => {
      const { container } = render(<Table columns={columns} dataSource={dataSource} striped />)

      const rows = container.querySelectorAll('tbody tr')
      expect(rows[0]).toHaveClass('bg-[var(--tiger-surface-muted,#f9fafb)]/50')
    })

    it('should disable pagination when pagination is false', () => {
      const { container } = render(
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      )

      const pagination = container.querySelector('.flex.items-center.justify-between')
      expect(pagination).not.toBeInTheDocument()
    })
  })

  describe('Fixed Columns', () => {
    it('should apply sticky styles for fixed left and right columns', () => {
      const fixedColumns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 140, fixed: 'left' },
        { key: 'age', title: 'Age', width: 120 },
        { key: 'email', title: 'Email', width: 220 },
        {
          key: 'actions',
          title: 'Actions',
          width: 140,
          fixed: 'right',
          render: () => 'Edit'
        }
      ]

      const { getByText } = render(
        <Table columns={fixedColumns} dataSource={dataSource} pagination={false} />
      )

      const nameHeader = getByText('Name').closest('th')
      expect(nameHeader).toBeInTheDocument()
      expect(nameHeader!).toHaveStyle('position: sticky')
      expect(nameHeader!).toHaveStyle('left: 0px')

      const actionsHeader = getByText('Actions').closest('th')
      expect(actionsHeader).toBeInTheDocument()
      expect(actionsHeader!).toHaveStyle('position: sticky')
      expect(actionsHeader!).toHaveStyle('right: 0px')

      const firstNameCell = getByText('John Doe').closest('td')
      expect(firstNameCell).toBeInTheDocument()
      expect(firstNameCell!).toHaveStyle('position: sticky')
      expect(firstNameCell!).toHaveStyle('left: 0px')
    })
  })

  describe('Column Lock Button', () => {
    it('should toggle fixed state when clicking the header lock button', async () => {
      const lockableColumns: TableColumn[] = [
        { key: 'name', title: 'Name', width: 140 },
        { key: 'age', title: 'Age', width: 120 },
        { key: 'email', title: 'Email', width: 220 }
      ]

      const { getByLabelText, getByText } = render(
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
      expect(emailHeaderLocked).toHaveStyle('left: 260px')

      await fireEvent.click(getByLabelText('Unlock column Email'))

      const emailHeaderUnlocked = getByText('Email').closest('th')!
      expect(emailHeaderUnlocked).not.toHaveStyle('position: sticky')
    })
  })

  describe('Sorting', () => {
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
      await fireEvent.click(nameHeader.closest('th')!)

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

      expect(nameHeader).toHaveAttribute('aria-sort', 'none')

      // First click - asc
      await fireEvent.click(nameHeader)
      expect(onSortChange).toHaveBeenCalledWith({
        key: 'name',
        direction: 'asc'
      })
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')

      // Second click - desc
      await fireEvent.click(nameHeader)
      expect(onSortChange).toHaveBeenCalledWith({
        key: 'name',
        direction: 'desc'
      })
      expect(nameHeader).toHaveAttribute('aria-sort', 'descending')

      // Third click - null (clear sort)
      await fireEvent.click(nameHeader)
      expect(onSortChange).toHaveBeenCalledWith({
        key: null,
        direction: null
      })
      expect(nameHeader).toHaveAttribute('aria-sort', 'none')
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
  })

  describe('Pagination', () => {
    it('should render pagination controls by default', () => {
      const { getByText } = render(<Table columns={columns} dataSource={dataSource} />)

      expect(getByText('Previous')).toBeInTheDocument()
      expect(getByText('Next')).toBeInTheDocument()
    })

    it('should show page size selector', () => {
      const { container } = render(<Table columns={columns} dataSource={dataSource} />)

      const select = container.querySelector('select')
      expect(select).toBeInTheDocument()
    })

    it('should call onPageChange when clicking next button', async () => {
      const onPageChange = vi.fn()

      // Create enough data to have multiple pages
      const largeDataSource = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        age: 20 + i,
        email: `person${i + 1}@example.com`
      }))

      const { getByText } = render(
        <Table columns={columns} dataSource={largeDataSource} onPageChange={onPageChange} />
      )

      const nextButton = getByText('Next')
      await fireEvent.click(nextButton)

      expect(onPageChange).toHaveBeenCalledWith({
        current: 2,
        pageSize: 10
      })
    })

    it('should disable previous button on first page', () => {
      const { getByText } = render(<Table columns={columns} dataSource={dataSource} />)

      const prevButton = getByText('Previous')
      expect(prevButton).toBeDisabled()
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

  describe('Sticky Header', () => {
    it('should apply sticky class when stickyHeader is true', () => {
      const { container } = render(<Table columns={columns} dataSource={dataSource} stickyHeader />)

      const thead = container.querySelector('thead')
      expect(thead).toHaveClass('sticky')
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

      await expectNoA11yViolations(container)
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

    it('should call onChange with combined state', async () => {
      const onChange = vi.fn()

      const sortableColumns: TableColumn[] = [{ key: 'name', title: 'Name', sortable: true }]

      const { getByText } = render(
        <Table columns={sortableColumns} dataSource={dataSource} onChange={onChange} />
      )

      const nameHeader = getByText('Name')
      await fireEvent.click(nameHeader.closest('th')!)

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
    const expandable = {
      expandedRowRender: (record: Record<string, unknown>) => `Details for ${record.name}`
    }

    it('should render expand toggle buttons', () => {
      const { getAllByLabelText } = render(
        <Table columns={columns} dataSource={dataSource} expandable={expandable} />
      )
      const expandButtons = getAllByLabelText('Expand row')
      expect(expandButtons).toHaveLength(3)
    })

    it('should expand a row on button click', async () => {
      const { getAllByLabelText, getByText } = render(
        <Table columns={columns} dataSource={dataSource} expandable={expandable} />
      )

      const expandButtons = getAllByLabelText('Expand row')
      await fireEvent.click(expandButtons[0])
      expect(getByText('Details for John Doe')).toBeInTheDocument()
    })

    it('should collapse an expanded row', async () => {
      const { getAllByLabelText, getByText, queryByText } = render(
        <Table columns={columns} dataSource={dataSource} expandable={expandable} />
      )

      const expandButtons = getAllByLabelText('Expand row')
      await fireEvent.click(expandButtons[0])
      expect(getByText('Details for John Doe')).toBeInTheDocument()

      await fireEvent.click(getAllByLabelText('Collapse row')[0])
      expect(queryByText('Details for John Doe')).toBeNull()
    })

    it('should support defaultExpandedRowKeys', () => {
      const { getByText } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          expandable={{ ...expandable, defaultExpandedRowKeys: [1] }}
        />
      )
      expect(getByText('Details for John Doe')).toBeInTheDocument()
    })

    it('should call onExpandedRowsChange', async () => {
      const onExpandedRowsChange = vi.fn()
      const { getAllByLabelText } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          expandable={expandable}
          onExpandedRowsChange={onExpandedRowsChange}
        />
      )

      await fireEvent.click(getAllByLabelText('Expand row')[0])
      expect(onExpandedRowsChange).toHaveBeenCalledWith([1])
    })

    it('should support rowExpandable to control which rows can expand', () => {
      const { getAllByLabelText } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          expandable={{
            ...expandable,
            rowExpandable: (record) => (record.age as number) > 30
          }}
        />
      )
      // Only Jane (32) and Bob (45) should have expand buttons
      const expandButtons = getAllByLabelText('Expand row')
      expect(expandButtons).toHaveLength(2)
    })

    it('should render expand column at end when expandIconPosition=end', () => {
      const { container } = render(
        <Table
          columns={columns}
          dataSource={dataSource}
          expandable={{ ...expandable, expandIconPosition: 'end' }}
        />
      )
      // The last th in header should be the expand column (empty)
      const headerCells = container.querySelectorAll('thead th')
      const lastTh = headerCells[headerCells.length - 1]
      expect(lastTh.textContent).toBe('')
    })

    it('should render expand column header at start by default', () => {
      const { container } = render(
        <Table columns={columns} dataSource={dataSource} expandable={expandable} />
      )
      const headerCells = container.querySelectorAll('thead th')
      // First th should be the expand column (empty)
      expect(headerCells[0].textContent).toBe('')
      // Second should be "Name"
      expect(headerCells[1].textContent).toContain('Name')
    })
  })
})
