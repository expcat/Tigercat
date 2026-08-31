/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen, act } from '@testing-library/react'
import React, { useState } from 'react'
import { VirtualTable } from '@expcat/tigercat-react/VirtualTable'
import type { TableColumn } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils/react'

const columns: TableColumn[] = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: 'Name' }
]

function makeData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Row ${i + 1}`
  }))
}

function dataRowsOf(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll('tbody tr')).filter(
    (row) => row.getAttribute('aria-hidden') !== 'true'
  ) as HTMLElement[]
}

describe('VirtualTable (React)', () => {
  it('renders headers and visible rows as a native table', () => {
    const { container } = render(
      <VirtualTable
        dataSource={makeData(10)}
        columns={columns}
        virtualHeight={400}
        virtualItemHeight={40}
        data-testid="vt"
      />
    )
    expect(screen.getByTestId('vt').querySelector('table')).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument()
    expect(screen.getByText('Row 1')).toBeInTheDocument()
    expect(container.querySelector('table')?.getAttribute('aria-rowcount')).toBe('11')
  })

  it('shows empty and loading text', () => {
    const { rerender } = render(
      <VirtualTable dataSource={[]} columns={columns} emptyText="No records" />
    )
    expect(screen.getByText('No records')).toBeInTheDocument()
    rerender(<VirtualTable dataSource={makeData(2)} columns={columns} loading />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Loading...').closest('[aria-busy="true"]')).toBeTruthy()
  })

  it('windows large datasets and pins row height', () => {
    const { container } = render(
      <VirtualTable
        dataSource={makeData(1000)}
        columns={columns}
        virtualItemHeight={40}
        virtualHeight={200}
        overscan={5}
      />
    )
    const rows = dataRowsOf(container)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(30)
    expect(rows[0].style.height).toBe('40px')
    expect(container.querySelector('[data-tiger-table-virtual-spacer] td')).toBeTruthy()
  })

  it('calls onRowClick from click and keyboard without rowSelection', () => {
    const onRowClick = vi.fn()
    const { container } = render(
      <VirtualTable
        dataSource={makeData(3)}
        columns={columns}
        virtualItemHeight={40}
        virtualHeight={400}
        onRowClick={onRowClick}
      />
    )
    const rows = dataRowsOf(container)
    fireEvent.click(rows[0])
    fireEvent.keyDown(rows[0], { key: 'Enter' })
    fireEvent.keyDown(rows[0], { key: ' ' })
    expect(onRowClick).toHaveBeenCalledTimes(3)
    expect(rows[0]).toHaveAttribute('tabindex', '0')
    expect(rows[1]).toHaveAttribute('tabindex', '-1')
  })

  it('selects by id and ignores cell button clicks', () => {
    const onSelectionChange = vi.fn()
    const cols: TableColumn[] = [
      { key: 'id', title: 'ID' },
      {
        key: 'name',
        title: 'Name',
        render: (row) => <button type="button">Open {String(row.id)}</button>
      }
    ]
    const { container } = render(
      <VirtualTable
        dataSource={makeData(3)}
        columns={cols}
        virtualItemHeight={40}
        virtualHeight={400}
        rowSelection={{ selectedRowKeys: [1] }}
        onSelectionChange={onSelectionChange}
      />
    )
    const rows = dataRowsOf(container)
    expect(rows[0]).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Open 2' }))
    expect(onSelectionChange).not.toHaveBeenCalled()
    fireEvent.click(rows[1])
    expect(onSelectionChange).toHaveBeenCalledWith([1, 2])
  })

  it('does not write an index when the row has no id', () => {
    const onSelectionChange = vi.fn()
    const { container } = render(
      <VirtualTable
        dataSource={[{ name: 'ghost' }]}
        columns={[{ key: 'name', title: 'Name' }]}
        rowSelection={{}}
        onSelectionChange={onSelectionChange}
      />
    )
    fireEvent.click(dataRowsOf(container)[0])
    expect(onSelectionChange).not.toHaveBeenCalled()
  })

  it('scrollToIndex reveals a distant row', () => {
    const ref = React.createRef<{ scrollToIndex: (index: number) => void }>()
    const { container } = render(
      <VirtualTable
        ref={ref}
        dataSource={makeData(1000)}
        columns={columns}
        virtualItemHeight={40}
        virtualHeight={200}
        overscan={2}
      />
    )
    act(() => {
      ref.current?.scrollToIndex(500)
    })
    expect(container.textContent).toContain('Row 501')
  })

  it('virtualizes columns with a numeric width', () => {
    const wide: TableColumn[] = Array.from({ length: 10 }, (_, i) => ({
      key: `c${i}`,
      title: `C${i}`,
      width: 120
    }))
    const rows = Array.from({ length: 5 }, (_, i) => {
      const record: Record<string, unknown> = { id: i + 1 }
      wide.forEach((col) => {
        record[col.key] = `${col.key}-${i}`
      })
      return record
    })
    const { container } = render(
      <VirtualTable
        dataSource={rows}
        columns={wide}
        width={400}
        virtualizeColumns
        virtualItemHeight={40}
        virtualHeight={200}
      />
    )
    const headerCells = container.querySelectorAll('thead th:not([aria-hidden])')
    expect(headerCells.length).toBeGreaterThan(0)
    expect(headerCells.length).toBeLessThan(10)
    expect(container.querySelector('table')?.getAttribute('aria-colcount')).toBe('10')
  })

  it('keeps sticky left/right cells', () => {
    const fixedColumns = [
      { key: 'id', title: 'ID', width: 80, fixed: 'left' as const },
      { key: 'name', title: 'Name', width: 150 },
      { key: 'action', title: 'Action', width: 100, fixed: 'right' as const }
    ]
    render(
      <VirtualTable
        dataSource={makeData(3).map((row) => ({ ...row, action: 'Edit' }))}
        columns={fixedColumns}
        virtualItemHeight={40}
        virtualHeight={400}
      />
    )
    expect(screen.getByText('ID').closest('th')?.style.position).toBe('sticky')
    expect(screen.getByText('Action').closest('th')?.style.position).toBe('sticky')
  })

  it('has no a11y violations for default, selection, loading, and empty states', async () => {
    const table = render(
      <VirtualTable
        dataSource={makeData(5)}
        columns={columns}
        virtualHeight={240}
        virtualItemHeight={40}
      />
    )
    await expectNoA11yViolations(table.container)
    table.unmount()

    const selected = render(
      <VirtualTable
        dataSource={makeData(5)}
        columns={columns}
        rowSelection={{ selectedRowKeys: [2] }}
        virtualHeight={240}
        virtualItemHeight={40}
      />
    )
    await expectNoA11yViolations(selected.container)
    selected.unmount()

    const loading = render(
      <VirtualTable dataSource={makeData(3)} columns={columns} loading virtualHeight={240} />
    )
    await expectNoA11yViolations(loading.container)
    loading.unmount()

    const empty = render(<VirtualTable dataSource={[]} columns={columns} virtualHeight={240} />)
    await expectNoA11yViolations(empty.container)
  })

  it('does not rebuild an omitted dataSource identity on parent rerender', () => {
    function Host() {
      const [, setTick] = useState(0)
      return (
        <>
          <button type="button" onClick={() => setTick((n) => n + 1)}>
            bump
          </button>
          <VirtualTable columns={columns} virtualHeight={200} virtualItemHeight={40} />
        </>
      )
    }
    const { container } = render(<Host />)
    const first = container.querySelector('table')
    fireEvent.click(screen.getByRole('button', { name: 'bump' }))
    expect(container.querySelector('table')).toBe(first)
  })
})
