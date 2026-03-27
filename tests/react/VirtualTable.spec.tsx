import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { VirtualTable } from '@expcat/tigercat-react'

const columns = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: 'Name' }
]

function makeData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Row ${i + 1}`
  }))
}

describe('VirtualTable (React)', () => {
  it('renders the grid', () => {
    const { getByRole, getByText } = render(
      <VirtualTable data={makeData(10)} columns={columns} height={400} rowHeight={40} />
    )
    expect(getByRole('grid')).toBeTruthy()
    expect(getByText('ID')).toBeTruthy()
    expect(getByText('Name')).toBeTruthy()
  })

  it('renders column headers', () => {
    const { getAllByRole } = render(
      <VirtualTable data={makeData(5)} columns={columns} />
    )
    const ths = getAllByRole('columnheader')
    expect(ths.length).toBe(2)
    expect(ths[0].textContent).toBe('ID')
  })

  it('shows empty text when no data', () => {
    const { getByText } = render(
      <VirtualTable data={[]} columns={columns} emptyText="No records" />
    )
    expect(getByText('No records')).toBeTruthy()
  })

  it('shows default empty text', () => {
    const { getByText } = render(
      <VirtualTable data={[]} columns={columns} />
    )
    expect(getByText('No data')).toBeTruthy()
  })

  it('shows loading overlay', () => {
    const { getByText } = render(
      <VirtualTable data={makeData(5)} columns={columns} loading />
    )
    expect(getByText('Loading...')).toBeTruthy()
  })

  it('does not show loading when false', () => {
    const { queryByText } = render(
      <VirtualTable data={makeData(5)} columns={columns} loading={false} />
    )
    expect(queryByText('Loading...')).toBeNull()
  })

  it('renders visible row data', () => {
    const { getByText } = render(
      <VirtualTable data={makeData(3)} columns={columns} rowHeight={40} height={400} />
    )
    expect(getByText('Row 1')).toBeTruthy()
    expect(getByText('Row 2')).toBeTruthy()
  })

  it('calls onRowClick', () => {
    const onRowClick = vi.fn()
    const { getAllByRole } = render(
      <VirtualTable data={makeData(3)} columns={columns} rowHeight={40} height={400} onRowClick={onRowClick} />
    )
    const rows = getAllByRole('row')
    const dataRows = rows.filter(
      (r) => !r.querySelector('th') && r.getAttribute('aria-hidden') !== 'true' && r.getAttribute('aria-hidden') !== ''
    )
    if (dataRows.length > 0) {
      fireEvent.click(dataRows[0])
      expect(onRowClick).toHaveBeenCalledOnce()
    }
  })

  it('calls onSelect when selectable', () => {
    const onSelect = vi.fn()
    const { getAllByRole } = render(
      <VirtualTable
        data={makeData(3)}
        columns={columns}
        rowHeight={40}
        height={400}
        selectable
        onSelect={onSelect}
      />
    )
    const rows = getAllByRole('row')
    const dataRows = rows.filter(
      (r) => !r.querySelector('th') && r.getAttribute('aria-hidden') !== 'true' && r.getAttribute('aria-hidden') !== ''
    )
    if (dataRows.length > 0) {
      fireEvent.click(dataRows[0])
      expect(onSelect).toHaveBeenCalledOnce()
    }
  })

  it('sets aria-rowcount', () => {
    const data = makeData(200)
    const { getByRole } = render(
      <VirtualTable data={data} columns={columns} rowHeight={40} height={200} />
    )
    expect(getByRole('grid').getAttribute('aria-rowcount')).toBe('200')
  })

  it('applies height style', () => {
    const { getByRole } = render(
      <VirtualTable data={makeData(5)} columns={columns} height={600} />
    )
    expect(getByRole('grid').style.height).toBe('600px')
  })

  it('applies bordered class', () => {
    const { getByRole } = render(
      <VirtualTable data={makeData(3)} columns={columns} bordered />
    )
    expect(getByRole('grid').className).toContain('border')
  })

  it('applies custom className', () => {
    const { getByRole } = render(
      <VirtualTable data={makeData(3)} columns={columns} className="my-vt" />
    )
    expect(getByRole('grid').className).toContain('my-vt')
  })

  it('renders only visible rows for large dataset', () => {
    const { getAllByRole } = render(
      <VirtualTable data={makeData(1000)} columns={columns} rowHeight={40} height={200} overscan={5} />
    )
    const allRows = getAllByRole('row')
    const dataRows = allRows.filter(
      (r) => !r.querySelector('th') && r.getAttribute('aria-hidden') !== 'true' && r.getAttribute('aria-hidden') !== ''
    )
    expect(dataRows.length).toBeLessThan(30)
    expect(dataRows.length).toBeGreaterThan(0)
  })

  it('uses renderCell for custom rendering', () => {
    const renderCell = (value: unknown) => `[${value}]`
    const { getByText } = render(
      <VirtualTable data={makeData(2)} columns={columns} renderCell={renderCell} />
    )
    expect(getByText('[1]')).toBeTruthy()
    expect(getByText('[Row 1]')).toBeTruthy()
  })

  it('applies column width', () => {
    const cols = [
      { key: 'id', title: 'ID', width: 120 },
      { key: 'name', title: 'Name', width: '250px' }
    ]
    const { getAllByRole } = render(
      <VirtualTable data={makeData(3)} columns={cols} />
    )
    const ths = getAllByRole('columnheader')
    expect(ths[0].style.width).toBe('120px')
    expect(ths[1].style.width).toBe('250px')
  })
})
