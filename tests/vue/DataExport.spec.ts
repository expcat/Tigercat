/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { DataExport } from '@expcat/tigercat-vue/DataExport'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import type { TableColumn } from '@expcat/tigercat-core'
import { expectNoA11yViolations } from '../utils'

const columns: TableColumn[] = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' }
]

const data = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
]

let createObjectURLSpy: ReturnType<typeof vi.fn>

beforeEach(() => {
  createObjectURLSpy = vi.fn(() => 'blob:mock')
  URL.createObjectURL = createObjectURLSpy as typeof URL.createObjectURL
  URL.revokeObjectURL = vi.fn() as typeof URL.revokeObjectURL
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DataExport', () => {
  it('renders a dropdown trigger with the default format items', async () => {
    render(DataExport, { props: { columns, dataSource: data } })

    const trigger = screen.getByRole('button', { name: 'Export data' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByRole('menuitem', { name: 'Export Excel' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Export CSV' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Export Markdown' })).toBeInTheDocument()
  })

  it('renders a plain button for a single format', () => {
    render(DataExport, { props: { columns, dataSource: data, formats: ['markdown'] } })

    expect(screen.getByRole('button', { name: 'Export Markdown' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })

  it('keeps a disabled trigger when formats is empty', () => {
    render(DataExport, { props: { columns, dataSource: data, formats: [] } })
    expect(screen.getByRole('button', { name: 'Export data' })).toBeDisabled()
  })

  it('resolves labels from an official locale object', () => {
    render({
      components: { ConfigProvider, DataExport },
      setup() {
        return { columns, data, zhTW }
      },
      template: `
        <ConfigProvider :locale="zhTW">
          <DataExport :columns="columns" :data-source="data" :formats="['xlsx']" />
        </ConfigProvider>
      `
    })
    expect(screen.getByRole('button', { name: '匯出 Excel' })).toBeInTheDocument()
    expect(screen.queryByText('导出 Excel')).not.toBeInTheDocument()
    expect(screen.queryByText('Export Excel')).not.toBeInTheDocument()
  })

  it('lets explicit labels override locale', () => {
    render(DataExport, {
      props: {
        columns,
        dataSource: data,
        formats: ['xlsx'],
        labels: { xlsxText: 'Download workbook' }
      }
    })
    expect(screen.getByRole('button', { name: 'Download workbook' })).toBeInTheDocument()
  })

  it('keeps a caller aria-label on a single format and the trigger label on many', () => {
    const single = render(DataExport, {
      props: { columns, dataSource: data, formats: ['markdown'] },
      attrs: { 'aria-label': 'Save table' }
    })
    expect(screen.getByRole('button', { name: 'Save table' })).toHaveAttribute(
      'aria-label',
      'Save table'
    )
    single.unmount()

    render(DataExport, { props: { columns, dataSource: data } })
    expect(screen.getByRole('button', { name: 'Export data' })).toHaveAttribute(
      'aria-label',
      'Export data'
    )
  })

  it('exports on click and emits export with the format', async () => {
    const { emitted } = render(DataExport, {
      props: { columns, dataSource: data, formats: ['markdown'] }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Export Markdown' }))

    await waitFor(() => expect(emitted().export).toBeTruthy())
    expect(emitted().export[0]).toEqual(['markdown'])
    expect(createObjectURLSpy).toHaveBeenCalled()
  })

  it('exports the selected format from the opened menu', async () => {
    const { emitted } = render(DataExport, { props: { columns, dataSource: data } })

    await fireEvent.click(screen.getByRole('button', { name: 'Export data' }))
    await fireEvent.click(await screen.findByRole('menuitem', { name: 'Export Excel' }))

    await waitFor(() => expect(emitted().export).toBeTruthy())
    expect(emitted().export[0]).toEqual(['xlsx'])
  })

  it('only starts one export when clicked twice', async () => {
    const { emitted } = render(DataExport, {
      props: { columns, dataSource: data, formats: ['markdown'] }
    })

    const button = screen.getByRole('button', { name: 'Export Markdown' })
    await fireEvent.click(button)
    await fireEvent.click(button)

    await waitFor(() => expect(emitted().export).toBeTruthy())
    expect(emitted().export).toHaveLength(1)
  })

  it('does not export while disabled', async () => {
    const { emitted } = render(DataExport, {
      props: { columns, dataSource: data, formats: ['markdown'], disabled: true }
    })

    const button = screen.getByRole('button', { name: 'Export Markdown' })
    expect(button).toBeDisabled()
    await fireEvent.click(button)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(emitted().export).toBeUndefined()
  })

  it('emits error and a live status when serialization fails', async () => {
    const { emitted } = render(DataExport, {
      props: {
        columns,
        dataSource: data,
        formats: ['markdown'],
        cellFormatter: () => {
          throw new Error('boom')
        }
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Export Markdown' }))

    await waitFor(() => expect(emitted().error).toBeTruthy())
    expect((emitted().error[0] as [Error])[0].message).toBe('boom')
    expect(await screen.findByRole('status')).toHaveTextContent('Export failed')
  })

  it('gives customExport filtered columns and formatted rows', async () => {
    const customExport = vi.fn()
    const exportColumns: TableColumn[] = [
      { key: 'name', title: 'Name' },
      { key: 'secret', title: 'Secret' },
      { key: 'actions', title: 'Ops', render: () => 'edit' }
    ]
    render(DataExport, {
      props: {
        columns: exportColumns,
        dataSource: [{ name: 'Ada', secret: 'hidden' }],
        hiddenColumnKeys: ['secret'],
        cellFormatter: (value: unknown, column: TableColumn) =>
          column.key === 'name' ? `X:${value}` : value,
        customExport,
        formats: ['csv']
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }))

    await waitFor(() => expect(customExport).toHaveBeenCalled())
    const info = customExport.mock.calls[0][0] as {
      columns: TableColumn[]
      dataSource: Array<Record<string, unknown>>
    }
    expect(info.columns.map((column) => column.key)).toEqual(['name'])
    expect(info.dataSource).toEqual([{ name: 'X:Ada' }])
  })

  it('has no a11y violations for single, open menu, and disabled states', async () => {
    const single = render(DataExport, {
      props: { columns, dataSource: data, formats: ['xlsx'] }
    })
    await expectNoA11yViolations(single.container)
    single.unmount()

    const dropdown = render(DataExport, { props: { columns, dataSource: data } })
    await fireEvent.click(screen.getByRole('button', { name: 'Export data' }))
    await screen.findByRole('menuitem', { name: 'Export Excel' })
    await expectNoA11yViolations(dropdown.container)
    dropdown.unmount()

    const disabled = render(DataExport, {
      props: { columns, dataSource: data, formats: ['xlsx'], disabled: true }
    })
    await expectNoA11yViolations(disabled.container)
  })
})
