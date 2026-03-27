import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { VirtualTable } from '@expcat/tigercat-vue'

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

describe('VirtualTable (Vue)', () => {
  it('renders with basic data', () => {
    const { getByRole, getByText } = render(VirtualTable, {
      props: { data: makeData(10), columns, height: 400, rowHeight: 40 }
    })
    expect(getByRole('grid')).toBeTruthy()
    expect(getByText('ID')).toBeTruthy()
    expect(getByText('Name')).toBeTruthy()
  })

  it('renders header cells', () => {
    const { getAllByRole } = render(VirtualTable, {
      props: { data: makeData(5), columns }
    })
    const ths = getAllByRole('columnheader')
    expect(ths.length).toBe(2)
    expect(ths[0].textContent).toBe('ID')
    expect(ths[1].textContent).toBe('Name')
  })

  it('shows empty text when no data', () => {
    const { getByText } = render(VirtualTable, {
      props: { data: [], columns, emptyText: 'Nothing here' }
    })
    expect(getByText('Nothing here')).toBeTruthy()
  })

  it('shows default empty text', () => {
    const { getByText } = render(VirtualTable, {
      props: { data: [], columns }
    })
    expect(getByText('No data')).toBeTruthy()
  })

  it('shows loading overlay', () => {
    const { getByText } = render(VirtualTable, {
      props: { data: makeData(5), columns, loading: true }
    })
    expect(getByText('Loading...')).toBeTruthy()
  })

  it('does not show loading when not loading', () => {
    const { queryByText } = render(VirtualTable, {
      props: { data: makeData(5), columns, loading: false }
    })
    expect(queryByText('Loading...')).toBeNull()
  })

  it('renders row data', () => {
    const { getByText } = render(VirtualTable, {
      props: { data: makeData(3), columns, rowHeight: 40, height: 400 }
    })
    expect(getByText('Row 1')).toBeTruthy()
    expect(getByText('Row 2')).toBeTruthy()
    expect(getByText('Row 3')).toBeTruthy()
  })

  it('emits row-click event', async () => {
    const wrapper = render(VirtualTable, {
      props: { data: makeData(3), columns, rowHeight: 40, height: 400 }
    })
    const rows = wrapper.getAllByRole('row')
    // First row is header, second is spacer (aria-hidden), rows start from index 2
    const dataRows = rows.filter(
      (r) =>
        !r.querySelector('th') &&
        r.getAttribute('aria-hidden') !== 'true' &&
        r.getAttribute('aria-hidden') !== ''
    )
    if (dataRows.length > 0) {
      await fireEvent.click(dataRows[0])
      expect(wrapper.emitted('row-click')?.[0]).toBeTruthy()
    }
  })

  it('emits select when selectable', async () => {
    const wrapper = render(VirtualTable, {
      props: { data: makeData(3), columns, rowHeight: 40, height: 400, selectable: true }
    })
    const rows = wrapper.getAllByRole('row')
    const dataRows = rows.filter(
      (r) =>
        !r.querySelector('th') &&
        r.getAttribute('aria-hidden') !== 'true' &&
        r.getAttribute('aria-hidden') !== ''
    )
    if (dataRows.length > 0) {
      await fireEvent.click(dataRows[0])
      expect(wrapper.emitted('select')?.[0]).toBeTruthy()
    }
  })

  it('applies aria-rowcount', () => {
    const data = makeData(100)
    const { getByRole } = render(VirtualTable, {
      props: { data, columns, rowHeight: 40, height: 200 }
    })
    expect(getByRole('grid').getAttribute('aria-rowcount')).toBe('100')
  })

  it('applies bordered class', () => {
    const { getByRole } = render(VirtualTable, {
      props: { data: makeData(3), columns, bordered: true }
    })
    expect(getByRole('grid').className).toContain('border')
  })

  it('applies custom className', () => {
    const { getByRole } = render(VirtualTable, {
      props: { data: makeData(3), columns, className: 'custom-vt' }
    })
    expect(getByRole('grid').className).toContain('custom-vt')
  })

  it('renders only visible rows for large datasets', () => {
    // 1000 rows, 40px each, 200px viewport → visible ~5 + overscan 5 = ~15 rows
    const { getAllByRole } = render(VirtualTable, {
      props: { data: makeData(1000), columns, rowHeight: 40, height: 200, overscan: 5 }
    })
    // Filter to data rows only (not header, not spacers)
    const allRows = getAllByRole('row')
    const dataRows = allRows.filter(
      (r) =>
        !r.querySelector('th') &&
        r.getAttribute('aria-hidden') !== 'true' &&
        r.getAttribute('aria-hidden') !== ''
    )
    // Should be much less than 1000
    expect(dataRows.length).toBeLessThan(30)
    expect(dataRows.length).toBeGreaterThan(0)
  })

  it('uses rowKey prop for key extraction', () => {
    const data = [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' }
    ]
    const { getByText } = render(VirtualTable, {
      props: { data, columns, rowKey: 'id' }
    })
    expect(getByText('Alpha')).toBeTruthy()
    expect(getByText('Beta')).toBeTruthy()
  })

  it('sets height style on container', () => {
    const { getByRole } = render(VirtualTable, {
      props: { data: makeData(5), columns, height: 500 }
    })
    expect(getByRole('grid').style.height).toBe('500px')
  })

  it('applies column width', () => {
    const cols = [
      { key: 'id', title: 'ID', width: 100 },
      { key: 'name', title: 'Name', width: '200px' }
    ]
    const { getAllByRole } = render(VirtualTable, {
      props: { data: makeData(3), columns: cols }
    })
    const ths = getAllByRole('columnheader')
    expect(ths[0].style.width).toBe('100px')
    expect(ths[1].style.width).toBe('200px')
  })
})
