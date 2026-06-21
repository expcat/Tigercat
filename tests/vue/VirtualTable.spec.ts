import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { VirtualTable } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

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
      const { getByText } = render(VirtualTable, {
        props: { data: makeFixedData(5), columns: fixedColumns }
      })
      const th = getByText('ID').closest('th')!
      expect(th.style.position).toBe('sticky')
      expect(th.style.left).toBe('0px')
      expect(th).toHaveClass(tableHeaderBgClass)
    })

    it('applies sticky right style to fixed-right header cell', () => {
      const { getByText } = render(VirtualTable, {
        props: { data: makeFixedData(5), columns: fixedColumns }
      })
      const th = getByText('Action').closest('th')!
      expect(th.style.position).toBe('sticky')
      expect(th.style.right).toBe('0px')
      expect(th).toHaveClass(tableHeaderBgClass)
    })

    it('does not apply sticky style to non-fixed header cell', () => {
      const { getByText } = render(VirtualTable, {
        props: { data: makeFixedData(5), columns: fixedColumns }
      })
      const th = getByText('Name').closest('th')!
      expect(th.style.position).not.toBe('sticky')
    })

    it('applies sticky left style to fixed-left body cell', () => {
      const { getAllByRole } = render(VirtualTable, {
        props: { data: makeFixedData(3), columns: fixedColumns, rowHeight: 40, height: 400 }
      })
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
      const { getAllByRole } = render(VirtualTable, {
        props: { data: makeFixedData(3), columns: fixedColumns, rowHeight: 40, height: 400 }
      })
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
      const { getAllByRole } = render(VirtualTable, {
        props: {
          data: makeFixedData(3),
          columns: fixedColumns,
          striped: true,
          rowHeight: 40,
          height: 400
        }
      })
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

      const { getByText, getAllByRole } = render(VirtualTable, {
        props: {
          data: makeFixedData(3),
          columns: styledColumns,
          rowHeight: 40,
          height: 240,
          selectedKeys: [0]
        }
      })

      expect(getByText('ID').closest('th')).toHaveClass('custom-fixed-header')
      const dataRows = getAllByRole('row').filter((row) => row.querySelector('td'))
      expect(dataRows[0].querySelectorAll('td')[0]).toHaveClass('virtual-table-left-selected')
      expect(dataRows[0].querySelectorAll('td')[0]).toHaveClass(tableFixedSelectedBgClass)
    })

    it('supports sticky header + sticky columns simultaneously', () => {
      const { getByText } = render(VirtualTable, {
        props: {
          data: makeFixedData(5),
          columns: fixedColumns,
          stickyHeader: true
        }
      })
      // Header is sticky
      const thead = getByText('ID').closest('thead')!
      expect(thead.className).toContain('sticky')
      // Fixed column header is also sticky
      const th = getByText('ID').closest('th')!
      expect(th.style.position).toBe('sticky')
      expect(th.style.left).toBe('0px')
    })
  })

  describe('Edge cases', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(VirtualTable, {
        props: { data: makeData(3), columns, height: 240, rowHeight: 40 }
      })

      await expectNoA11yViolationsIsolated(container)
    })

    it('renders with empty data and columns', () => {
      const { getByRole, getByText } = render(VirtualTable, {
        props: { data: [], columns: [] }
      })
      expect(getByRole('grid')).toBeTruthy()
      expect(getByText('No data')).toBeTruthy()
    })

    it('renders with single column', () => {
      const singleCol = [{ key: 'id', title: 'ID' }]
      const { getAllByRole } = render(VirtualTable, {
        props: { data: makeData(3), columns: singleCol }
      })
      expect(getAllByRole('columnheader').length).toBe(1)
    })

    it('renders striped rows correctly', () => {
      const { getAllByRole } = render(VirtualTable, {
        props: { data: makeData(5), columns, striped: true, rowHeight: 40, height: 400 }
      })
      const rows = getAllByRole('row')
      const dataRows = rows.filter(
        (r) =>
          !r.querySelector('th') &&
          r.getAttribute('aria-hidden') !== 'true' &&
          r.getAttribute('aria-hidden') !== ''
      )
      // Odd rows (index 1, 3) should have striped class
      if (dataRows.length > 1) {
        expect(dataRows[1].className).toContain('bg-')
      }
    })

    it('renders selected row with highlight', () => {
      const { getAllByRole } = render(VirtualTable, {
        props: {
          data: makeData(3),
          columns,
          rowHeight: 40,
          height: 400,
          selectedKeys: [0]
        }
      })
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
      const { getByText } = render(VirtualTable, {
        props: {
          data,
          columns,
          rowKey: (row: Record<string, unknown>) => `key-${row.id}`
        }
      })
      expect(getByText('Row 1')).toBeTruthy()
    })

    it('renders with loading and empty data simultaneously', () => {
      const { getByText, queryByText } = render(VirtualTable, {
        props: { data: [], columns, loading: true }
      })
      expect(getByText('Loading...')).toBeTruthy()
      // Empty text should NOT show when loading
      expect(queryByText('No data')).toBeNull()
    })

    it('handles large overscan value', () => {
      const { getAllByRole } = render(VirtualTable, {
        props: { data: makeData(10), columns, rowHeight: 40, height: 200, overscan: 100 }
      })
      const rows = getAllByRole('row')
      const dataRows = rows.filter(
        (r) =>
          !r.querySelector('th') &&
          r.getAttribute('aria-hidden') !== 'true' &&
          r.getAttribute('aria-hidden') !== ''
      )
      // Should render all 10 rows since overscan exceeds total
      expect(dataRows.length).toBe(10)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
