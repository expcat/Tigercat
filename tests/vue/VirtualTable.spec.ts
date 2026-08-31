/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { VirtualTableHandle } from '@expcat/tigercat-vue/VirtualTable'
import { VirtualTable } from '@expcat/tigercat-vue/VirtualTable'
import type { TableColumn } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils'

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

describe('VirtualTable (Vue)', () => {
  it('renders headers and visible rows as a native table', () => {
    const { container } = render(VirtualTable, {
      props: {
        dataSource: makeData(10),
        columns,
        virtualHeight: 400,
        virtualItemHeight: 40,
        'data-testid': 'vt'
      }
    })
    expect(container.querySelector('table')).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'ID' })).toBeTruthy()
    expect(screen.getByText('Row 1')).toBeTruthy()
    expect(container.querySelector('table')?.getAttribute('aria-rowcount')).toBe('11')
  })

  it('shows empty and loading text', async () => {
    const { rerender } = render(VirtualTable, {
      props: { dataSource: [], columns, emptyText: 'Nothing here' }
    })
    expect(screen.getByText('Nothing here')).toBeTruthy()
    await rerender({ dataSource: makeData(2), columns, loading: true })
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('windows large datasets and pins row height', () => {
    const { container } = render(VirtualTable, {
      props: {
        dataSource: makeData(1000),
        columns,
        virtualItemHeight: 40,
        virtualHeight: 200,
        overscan: 5
      }
    })
    const rows = dataRowsOf(container)
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(30)
    expect(rows[0].style.height).toBe('40px')
    expect(container.querySelector('[data-tiger-table-virtual-spacer] td')).toBeTruthy()
  })

  it('emits row-click from click and keyboard without rowSelection', async () => {
    const { container, emitted } = render(VirtualTable, {
      props: {
        dataSource: makeData(3),
        columns,
        virtualItemHeight: 40,
        virtualHeight: 400,
        onRowClick: () => undefined
      }
    })
    const rows = dataRowsOf(container)
    await fireEvent.click(rows[0])
    await fireEvent.keyDown(rows[0], { key: 'Enter' })
    expect(emitted()['row-click']?.length).toBeGreaterThanOrEqual(1)
    expect(rows[0].getAttribute('tabindex')).toBe('0')
  })

  it('selects by id and ignores cell button clicks', async () => {
    const cols: TableColumn[] = [
      { key: 'id', title: 'ID' },
      {
        key: 'name',
        title: 'Name',
        render: (row) => h('button', { type: 'button' }, `Open ${String(row.id)}`)
      }
    ]
    const { container, emitted } = render(VirtualTable, {
      props: {
        dataSource: makeData(3),
        columns: cols,
        virtualItemHeight: 40,
        virtualHeight: 400,
        rowSelection: { selectedRowKeys: [1] }
      }
    })
    expect(dataRowsOf(container)[0].getAttribute('aria-selected')).toBe('true')
    await fireEvent.click(screen.getByRole('button', { name: 'Open 2' }))
    expect(emitted()['selection-change']).toBeUndefined()
    await fireEvent.click(dataRowsOf(container)[1])
    expect(emitted()['selection-change']?.[0]).toEqual([[1, 2]])
  })

  it('does not write an index when the row has no id', async () => {
    const { container, emitted } = render(VirtualTable, {
      props: {
        dataSource: [{ name: 'ghost' }],
        columns: [{ key: 'name', title: 'Name' }],
        rowSelection: {}
      }
    })
    await fireEvent.click(dataRowsOf(container)[0])
    expect(emitted()['selection-change']).toBeUndefined()
  })

  it('exposes scrollToIndex', async () => {
    const exposed = ref<VirtualTableHandle | null>(null)
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(VirtualTable, {
            ref: (value: VirtualTableHandle | null) => {
              exposed.value = value
            },
            dataSource: makeData(1000),
            columns,
            virtualItemHeight: 40,
            virtualHeight: 200,
            overscan: 2
          })
      }
    })
    const { container } = render(Wrapper)
    exposed.value?.scrollToIndex(500)
    await nextTick()
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
    const { container } = render(VirtualTable, {
      props: {
        dataSource: rows,
        columns: wide,
        width: 400,
        virtualizeColumns: true,
        virtualItemHeight: 40,
        virtualHeight: 200
      }
    })
    const headerCells = container.querySelectorAll('thead th:not([aria-hidden])')
    expect(headerCells.length).toBeGreaterThan(0)
    expect(headerCells.length).toBeLessThan(10)
    expect(container.querySelector('table')?.getAttribute('aria-colcount')).toBe('10')
  })

  it('has no a11y violations for default, selection, loading, and empty states', async () => {
    const table = render(VirtualTable, {
      props: {
        dataSource: makeData(5),
        columns,
        virtualHeight: 240,
        virtualItemHeight: 40
      }
    })
    await expectNoA11yViolations(table.container)
    table.unmount()

    const selected = render(VirtualTable, {
      props: {
        dataSource: makeData(5),
        columns,
        rowSelection: { selectedRowKeys: [2] },
        virtualHeight: 240,
        virtualItemHeight: 40
      }
    })
    await expectNoA11yViolations(selected.container)
    selected.unmount()

    const loading = render(VirtualTable, {
      props: { dataSource: makeData(3), columns, loading: true, virtualHeight: 240 }
    })
    await expectNoA11yViolations(loading.container)
    loading.unmount()

    const empty = render(VirtualTable, {
      props: { dataSource: [], columns, virtualHeight: 240 }
    })
    await expectNoA11yViolations(empty.container)
  })
})
