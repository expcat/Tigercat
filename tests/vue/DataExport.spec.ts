/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { DataExport } from '@expcat/tigercat-vue'
import type { TableColumn } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

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
  it('renders a dropdown trigger with both format items by default', () => {
    render(DataExport, { props: { columns, dataSource: data } })

    expect(screen.getByRole('button', { name: 'Export data' })).toHaveTextContent('Export')
    expect(screen.getByText('Export Excel')).toBeInTheDocument()
    expect(screen.getByText('Export Markdown')).toBeInTheDocument()
  })

  it('renders a plain button for a single format', () => {
    render(DataExport, { props: { columns, dataSource: data, formats: ['markdown'] } })

    const button = screen.getByRole('button', { name: 'Export data' })
    expect(button).toHaveTextContent('Export Markdown')
    expect(screen.queryByText('Export Excel')).not.toBeInTheDocument()
  })

  it('renders nothing when formats is empty', () => {
    const { container } = render(DataExport, {
      props: { columns, dataSource: data, formats: [] }
    })
    expect(container).toBeEmptyDOMElement()
  })

  it('resolves labels from locale, with explicit overrides taking precedence', () => {
    const { unmount } = render(DataExport, {
      props: { columns, dataSource: data, formats: ['xlsx'], locale: { locale: 'zh-CN' } }
    })
    expect(screen.getByText('导出 Excel')).toBeInTheDocument()
    unmount()

    render(DataExport, {
      props: {
        columns,
        dataSource: data,
        formats: ['xlsx'],
        locale: { locale: 'zh-CN' },
        labels: { xlsxText: 'Download workbook' }
      }
    })
    expect(screen.getByText('Download workbook')).toBeInTheDocument()
  })

  it('exports on click and emits export with the format', async () => {
    const { emitted } = render(DataExport, {
      props: { columns, dataSource: data, formats: ['markdown'] }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Export data' }))

    await waitFor(() => expect(emitted().export).toBeTruthy())
    expect(emitted().export[0]).toEqual(['markdown'])
    expect(createObjectURLSpy).toHaveBeenCalled()
  })

  it('exports the selected format from the dropdown menu', async () => {
    const { emitted } = render(DataExport, { props: { columns, dataSource: data } })

    await fireEvent.click(screen.getByText('Export Excel'))

    await waitFor(() => expect(emitted().export).toBeTruthy())
    expect(emitted().export[0]).toEqual(['xlsx'])
  })

  it('does not export while disabled', async () => {
    const { emitted } = render(DataExport, {
      props: { columns, dataSource: data, formats: ['markdown'], disabled: true }
    })

    const button = screen.getByRole('button', { name: 'Export data' })
    expect(button).toBeDisabled()
    await fireEvent.click(button)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(emitted().export).toBeUndefined()
  })

  it('emits error when serialization fails', async () => {
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

    await fireEvent.click(screen.getByRole('button', { name: 'Export data' }))

    await waitFor(() => expect(emitted().error).toBeTruthy())
    expect((emitted().error[0] as [Error])[0].message).toBe('boom')
  })

  it('has no a11y violations in both render modes', async () => {
    const single = render(DataExport, {
      props: { columns, dataSource: data, formats: ['xlsx'] }
    })
    await expectNoA11yViolationsIsolated(single.container)
    single.unmount()

    const dropdown = render(DataExport, { props: { columns, dataSource: data } })
    // same waiver as Dropdown.spec.ts: the dropdown trigger wrapper carries aria-expanded
    await expectNoA11yViolationsIsolated(dropdown.container, {
      rules: { 'aria-allowed-attr': { enabled: false } }
    })
  })
})
