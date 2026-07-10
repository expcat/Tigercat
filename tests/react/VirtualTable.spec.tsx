import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { VirtualTable } from '@expcat/tigercat-react'
import type { TableColumn } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const columns = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: 'Name' }
]

const tableHeaderBgClass =
  'bg-[var(--tiger-table-header-bg,var(--tiger-component-table-header-bg,var(--tiger-surface-muted,#f9fafb)))]'
const tableFixedStripeBgClass =
  'bg-[color-mix(in_srgb,var(--tiger-table-stripe-bg,var(--tiger-component-table-stripe-bg,var(--tiger-surface-muted,#f9fafb)))_50%,var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-surface,#ffffff))))]'
const tableFixedSelectedBgClass =
  'bg-[color-mix(in_srgb,var(--tiger-primary,#2563eb)_5%,var(--tiger-table-bg,var(--tiger-component-table-bg,var(--tiger-bg,var(--tiger-surface,#ffffff)))))]'

function makeData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Row ${i + 1}`
  }))
}

describe('VirtualTable (React)', () => {
  it('renders the grid', () => {
    const { getByRole, getByText } = render(
      <VirtualTable
        dataSource={makeData(10)}
        columns={columns}
        virtualHeight={400}
        virtualItemHeight={40}
      />
    )
    expect(getByRole('grid')).toBeTruthy()
    expect(getByText('ID')).toBeTruthy()
    expect(getByText('Name')).toBeTruthy()
  })

  it('renders column headers', () => {
    const { getAllByRole } = render(<VirtualTable dataSource={makeData(5)} columns={columns} />)
    const ths = getAllByRole('columnheader')
    expect(ths.length).toBe(2)
    expect(ths[0].textContent).toBe('ID')
  })

  it('shows empty text when no data', () => {
    const { getByText } = render(
      <VirtualTable dataSource={[]} columns={columns} emptyText="No records" />
    )
    expect(getByText('No records')).toBeTruthy()
  })

  it('shows default empty text', () => {
    const { getByText } = render(<VirtualTable dataSource={[]} columns={columns} />)
    expect(getByText('No data')).toBeTruthy()
  })

  it('shows loading overlay', () => {
    const { getByText } = render(
      <VirtualTable dataSource={makeData(5)} columns={columns} loading />
    )
    expect(getByText('Loading...')).toBeTruthy()
  })

  it('does not show loading when false', () => {
    const { queryByText } = render(
      <VirtualTable dataSource={makeData(5)} columns={columns} loading={false} />
    )
    expect(queryByText('Loading...')).toBeNull()
  })

  it('renders visible row data', () => {
    const { getByText } = render(
      <VirtualTable
        dataSource={makeData(3)}
        columns={columns}
        virtualItemHeight={40}
        virtualHeight={400}
      />
    )
    expect(getByText('Row 1')).toBeTruthy()
    expect(getByText('Row 2')).toBeTruthy()
  })

  it('calls onRowClick', () => {
    const onRowClick = vi.fn()
    const { getAllByRole } = render(
      <VirtualTable
        dataSource={makeData(3)}
        columns={columns}
        virtualItemHeight={40}
        virtualHeight={400}
        onRowClick={onRowClick}
      />
    )
    const rows = getAllByRole('row')
    const dataRows = rows.filter(
      (r) =>
        !r.querySelector('th') &&
        r.getAttribute('aria-hidden') !== 'true' &&
        r.getAttribute('aria-hidden') !== ''
    )
    if (dataRows.length > 0) {
      fireEvent.click(dataRows[0])
      expect(onRowClick).toHaveBeenCalledOnce()
    }
  })

  it('calls onSelectionChange when rowSelection is enabled', () => {
    const onSelectionChange = vi.fn()
    const { getAllByRole } = render(
      <VirtualTable
        dataSource={makeData(3)}
        columns={columns}
        virtualItemHeight={40}
        virtualHeight={400}
        rowSelection={{ getRowKey: (row) => row.id }}
        onSelectionChange={onSelectionChange}
      />
    )
    const rows = getAllByRole('row')
    const dataRows = rows.filter(
      (r) =>
        !r.querySelector('th') &&
        r.getAttribute('aria-hidden') !== 'true' &&
        r.getAttribute('aria-hidden') !== ''
    )
    if (dataRows.length > 0) {
      fireEvent.click(dataRows[0])
      expect(onSelectionChange).toHaveBeenCalledWith([1])
    }
  })

  it('makes interactive rows keyboard-activable with aria (C23-3)', () => {
    const onRowClick = vi.fn()
    const onSelectionChange = vi.fn()
    const { getAllByRole } = render(
      <VirtualTable
        dataSource={makeData(3)}
        columns={columns}
        virtualItemHeight={40}
        virtualHeight={400}
        rowSelection={{ selectedRowKeys: [1] }}
        rowKey="id"
        onRowClick={onRowClick}
        onSelectionChange={onSelectionChange}
      />
    )
    const dataRows = getAllByRole('row').filter((r) => r.querySelector('td'))
    const first = dataRows[0]
    expect(first).toHaveAttribute('tabindex', '0')
    expect(first).toHaveAttribute('aria-rowindex', '2')
    expect(first).toHaveAttribute('aria-selected', 'true')
    expect(dataRows[1]).toHaveAttribute('aria-selected', 'false')
    // cells carry aria-colindex
    expect(first.querySelectorAll('td')[0]).toHaveAttribute('aria-colindex', '1')
    expect(first.querySelectorAll('td')[1]).toHaveAttribute('aria-colindex', '2')

    fireEvent.keyDown(first, { key: 'Enter' })
    expect(onRowClick).toHaveBeenCalledOnce()
    expect(onSelectionChange).toHaveBeenCalledWith([])
    fireEvent.keyDown(first, { key: ' ' })
    expect(onRowClick).toHaveBeenCalledTimes(2)
  })

  it('does not make rows focusable when non-interactive', () => {
    const { getAllByRole } = render(
      <VirtualTable
        dataSource={makeData(3)}
        columns={columns}
        virtualItemHeight={40}
        virtualHeight={400}
      />
    )
    const dataRows = getAllByRole('row').filter((r) => r.querySelector('td'))
    expect(dataRows[0]).not.toHaveAttribute('tabindex')
    expect(dataRows[0]).not.toHaveAttribute('aria-selected')
  })

  it('sets aria-rowcount', () => {
    const data = makeData(200)
    const { getByRole } = render(
      <VirtualTable
        dataSource={data}
        columns={columns}
        virtualItemHeight={40}
        virtualHeight={200}
      />
    )
    expect(getByRole('grid').getAttribute('aria-rowcount')).toBe('200')
  })

  it('applies virtualHeight style', () => {
    const { getByRole } = render(
      <VirtualTable dataSource={makeData(5)} columns={columns} virtualHeight={600} />
    )
    expect(getByRole('grid').style.height).toBe('600px')
  })

  it('applies bordered class', () => {
    const { getByRole } = render(
      <VirtualTable dataSource={makeData(3)} columns={columns} bordered />
    )
    expect(getByRole('grid').className).toContain('border')
  })

  it('applies custom className', () => {
    const { getByRole } = render(
      <VirtualTable dataSource={makeData(3)} columns={columns} className="my-vt" />
    )
    expect(getByRole('grid').className).toContain('my-vt')
  })

  it('renders only visible rows for large dataset', () => {
    const { getAllByRole } = render(
      <VirtualTable
        dataSource={makeData(1000)}
        columns={columns}
        virtualItemHeight={40}
        virtualHeight={200}
        overscan={5}
      />
    )
    const allRows = getAllByRole('row')
    const dataRows = allRows.filter(
      (r) =>
        !r.querySelector('th') &&
        r.getAttribute('aria-hidden') !== 'true' &&
        r.getAttribute('aria-hidden') !== ''
    )
    expect(dataRows.length).toBeLessThan(30)
    expect(dataRows.length).toBeGreaterThan(0)
  })

  it('uses renderCell for custom rendering', () => {
    const renderCell = (value: unknown) => `[${value}]`
    const { getByText } = render(
      <VirtualTable dataSource={makeData(2)} columns={columns} renderCell={renderCell} />
    )
    expect(getByText('[1]')).toBeTruthy()
    expect(getByText('[Row 1]')).toBeTruthy()
  })

  it('uses column render and renderHeader while keeping renderCell precedence', () => {
    const rows = [{ id: 1, name: 'Alice' }]
    const columns: TableColumn<(typeof rows)[number]>[] = [
      {
        key: 'displayName',
        dataKey: 'name',
        title: 'Fallback',
        renderHeader: () => <strong>Custom header</strong>,
        render: (row) => <span>Column: {row.name}</span>
      }
    ]
    const { getByText, queryByText, rerender } = render(
      <VirtualTable dataSource={rows} columns={columns} />
    )

    expect(getByText('Custom header')).toBeInTheDocument()
    expect(getByText('Column: Alice')).toBeInTheDocument()

    rerender(
      <VirtualTable
        dataSource={rows}
        columns={columns}
        renderCell={(value) => <span>Override: {String(value)}</span>}
      />
    )
    expect(getByText('Override: Alice')).toBeInTheDocument()
    expect(queryByText('Column: Alice')).not.toBeInTheDocument()
  })

  it('applies column width', () => {
    const cols = [
      { key: 'id', title: 'ID', width: 120 },
      { key: 'name', title: 'Name', width: '250px' }
    ]
    const { getAllByRole } = render(<VirtualTable dataSource={makeData(3)} columns={cols} />)
    const ths = getAllByRole('columnheader')
    expect(ths[0].style.width).toBe('120px')
    expect(ths[1].style.width).toBe('250px')
  })

  describe('Sticky Columns', () => {
    const fixedColumns = [
      { key: 'id', title: 'ID', width: 80, fixed: 'left' as const },
      { key: 'name', title: 'Name', width: 150 },
      { key: 'action', title: 'Action', width: 100, fixed: 'right' as const }
    ]

    function makeFixedData(count: number) {
      return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Row ${i + 1}`,
        action: 'Edit'
      }))
    }

    it('applies sticky left style to fixed-left header cell', () => {
      const { getByText } = render(
        <VirtualTable dataSource={makeFixedData(5)} columns={fixedColumns} />
      )
      const th = getByText('ID').closest('th')!
      expect(th.style.position).toBe('sticky')
      expect(th.style.left).toBe('0px')
      expect(th).toHaveClass(tableHeaderBgClass)
    })

    it('pins fixed-column widths with a colgroup', () => {
      const { container } = render(
        <VirtualTable dataSource={makeFixedData(5)} columns={fixedColumns} />
      )
      const widths = Array.from(container.querySelectorAll('table > colgroup col')).map(
        (col) => (col as HTMLElement).style.width
      )
      expect(widths).toEqual(['80px', '150px', '100px'])
      expect(container.querySelector('table')?.className).toContain('border-separate')
    })

    it('applies sticky right style to fixed-right header cell', () => {
      const { getByText } = render(
        <VirtualTable dataSource={makeFixedData(5)} columns={fixedColumns} />
      )
      const th = getByText('Action').closest('th')!
      expect(th.style.position).toBe('sticky')
      expect(th.style.right).toBe('0px')
      expect(th).toHaveClass(tableHeaderBgClass)
    })

    it('does not apply sticky style to non-fixed header cell', () => {
      const { getByText } = render(
        <VirtualTable dataSource={makeFixedData(5)} columns={fixedColumns} />
      )
      const th = getByText('Name').closest('th')!
      expect(th.style.position).not.toBe('sticky')
    })

    it('applies sticky left style to fixed-left body cell', () => {
      const { getAllByRole } = render(
        <VirtualTable
          dataSource={makeFixedData(3)}
          columns={fixedColumns}
          virtualItemHeight={40}
          virtualHeight={400}
        />
      )
      const rows = getAllByRole('row')
      const dataRows = rows.filter(
        (r) =>
          !r.querySelector('th') &&
          r.getAttribute('aria-hidden') !== 'true' &&
          r.getAttribute('aria-hidden') !== ''
      )
      if (dataRows.length > 0) {
        const firstCell = dataRows[0].querySelectorAll('td')[0]
        expect(firstCell.style.position).toBe('sticky')
        expect(firstCell.style.left).toBe('0px')
      }
    })

    it('applies sticky right style to fixed-right body cell', () => {
      const { getAllByRole } = render(
        <VirtualTable
          dataSource={makeFixedData(3)}
          columns={fixedColumns}
          virtualItemHeight={40}
          virtualHeight={400}
        />
      )
      const rows = getAllByRole('row')
      const dataRows = rows.filter(
        (r) =>
          !r.querySelector('th') &&
          r.getAttribute('aria-hidden') !== 'true' &&
          r.getAttribute('aria-hidden') !== ''
      )
      if (dataRows.length > 0) {
        const lastCell = dataRows[0].querySelectorAll('td')[2]
        expect(lastCell.style.position).toBe('sticky')
        expect(lastCell.style.right).toBe('0px')
      }
    })

    it('keeps striped background on fixed body cells', () => {
      const { getAllByRole } = render(
        <VirtualTable
          dataSource={makeFixedData(3)}
          columns={fixedColumns}
          striped
          virtualItemHeight={40}
          virtualHeight={400}
        />
      )
      const rows = getAllByRole('row')
      const dataRows = rows.filter(
        (r) =>
          !r.querySelector('th') &&
          r.getAttribute('aria-hidden') !== 'true' &&
          r.getAttribute('aria-hidden') !== ''
      )

      if (dataRows.length > 1) {
        expect(dataRows[1].querySelectorAll('td')[0]).toHaveClass(tableFixedStripeBgClass)
      }
    })

    it('supports fixedClassName and fixedHeaderClassName overrides', () => {
      const styledColumns = [
        {
          key: 'id',
          title: 'ID',
          width: 80,
          fixed: 'left' as const,
          fixedHeaderClassName: 'custom-fixed-header',
          fixedClassName: ({
            selected,
            view,
            fixed
          }: {
            selected: boolean
            view: string
            fixed: string
          }) => (selected ? `${view}-${fixed}-selected` : 'custom-fixed-cell')
        },
        { key: 'name', title: 'Name', width: 150 }
      ]

      const { getByText, getAllByRole } = render(
        <VirtualTable
          dataSource={makeFixedData(3)}
          columns={styledColumns}
          virtualItemHeight={40}
          virtualHeight={240}
          rowSelection={{ selectedRowKeys: [0] }}
        />
      )

      expect(getByText('ID').closest('th')).toHaveClass('custom-fixed-header')
      const dataRows = getAllByRole('row').filter((row) => row.querySelector('td'))
      expect(dataRows[0].querySelectorAll('td')[0]).toHaveClass('virtual-table-left-selected')
      expect(dataRows[0].querySelectorAll('td')[0]).toHaveClass(tableFixedSelectedBgClass)
    })

    it('supports sticky header + sticky columns simultaneously', () => {
      const { getByText } = render(
        <VirtualTable dataSource={makeFixedData(5)} columns={fixedColumns} stickyHeader />
      )
      const thead = getByText('ID').closest('thead')!
      expect(thead.className).toContain('sticky')
      const th = getByText('ID').closest('th')!
      expect(th.style.position).toBe('sticky')
      expect(th.style.left).toBe('0px')
    })
  })

  describe('Edge cases', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <VirtualTable
          dataSource={makeData(3)}
          columns={columns}
          virtualHeight={240}
          virtualItemHeight={40}
        />
      )

      await expectNoA11yViolationsIsolated(container)
    })

    it('renders with empty data and columns', () => {
      const { getByRole, getByText } = render(<VirtualTable dataSource={[]} columns={[]} />)
      expect(getByRole('grid')).toBeTruthy()
      expect(getByText('No data')).toBeTruthy()
    })

    it('renders with single column', () => {
      const singleCol = [{ key: 'id', title: 'ID' }]
      const { getAllByRole } = render(<VirtualTable dataSource={makeData(3)} columns={singleCol} />)
      expect(getAllByRole('columnheader').length).toBe(1)
    })

    it('renders striped rows correctly', () => {
      const { getAllByRole } = render(
        <VirtualTable
          dataSource={makeData(5)}
          columns={columns}
          striped
          virtualItemHeight={40}
          virtualHeight={400}
        />
      )
      const rows = getAllByRole('row')
      const dataRows = rows.filter(
        (r) =>
          !r.querySelector('th') &&
          r.getAttribute('aria-hidden') !== 'true' &&
          r.getAttribute('aria-hidden') !== ''
      )
      if (dataRows.length > 1) {
        expect(dataRows[1].className).toContain('bg-')
      }
    })

    it('renders selected row with highlight', () => {
      const { getAllByRole } = render(
        <VirtualTable
          dataSource={makeData(3)}
          columns={columns}
          virtualItemHeight={40}
          virtualHeight={400}
          rowSelection={{ selectedRowKeys: [0] }}
        />
      )
      const rows = getAllByRole('row')
      const dataRows = rows.filter(
        (r) =>
          !r.querySelector('th') &&
          r.getAttribute('aria-hidden') !== 'true' &&
          r.getAttribute('aria-hidden') !== ''
      )
      if (dataRows.length > 0) {
        expect(dataRows[0].className).toContain('bg-')
      }
    })

    it('handles function rowKey', () => {
      const data = makeData(3)
      const { getByText } = render(
        <VirtualTable
          dataSource={data}
          columns={columns}
          rowKey={(row: Record<string, unknown>) => `key-${row.id}`}
        />
      )
      expect(getByText('Row 1')).toBeTruthy()
    })

    it('renders with loading and empty data simultaneously', () => {
      const { getByText, queryByText } = render(
        <VirtualTable dataSource={[]} columns={columns} loading />
      )
      expect(getByText('Loading...')).toBeTruthy()
      expect(queryByText('No data')).toBeNull()
    })

    it('handles large overscan value', () => {
      const { getAllByRole } = render(
        <VirtualTable
          dataSource={makeData(10)}
          columns={columns}
          virtualItemHeight={40}
          virtualHeight={200}
          overscan={100}
        />
      )
      const rows = getAllByRole('row')
      const dataRows = rows.filter(
        (r) =>
          !r.querySelector('th') &&
          r.getAttribute('aria-hidden') !== 'true' &&
          r.getAttribute('aria-hidden') !== ''
      )
      expect(dataRows.length).toBe(10)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<VirtualTable />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
