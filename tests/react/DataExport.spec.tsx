/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataExport } from '@expcat/tigercat-react'
import type { TableColumn } from '@expcat/tigercat-core'
import React from 'react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
    render(<DataExport columns={columns} dataSource={data} />)

    expect(screen.getByRole('button', { name: 'Export data' })).toHaveTextContent('Export')
    expect(screen.getByText('Export Excel')).toBeInTheDocument()
    expect(screen.getByText('Export Markdown')).toBeInTheDocument()
  })

  it('renders a plain button for a single format', () => {
    render(<DataExport columns={columns} dataSource={data} formats={['markdown']} />)

    const button = screen.getByRole('button', { name: 'Export data' })
    expect(button).toHaveTextContent('Export Markdown')
    expect(screen.queryByText('Export Excel')).not.toBeInTheDocument()
  })

  it('renders nothing when formats is empty', () => {
    const { container } = render(<DataExport columns={columns} dataSource={data} formats={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('resolves labels from locale, with explicit overrides taking precedence', () => {
    const { unmount } = render(
      <DataExport
        columns={columns}
        dataSource={data}
        formats={['xlsx']}
        locale={{ locale: 'zh-CN' }}
      />
    )
    expect(screen.getByText('导出 Excel')).toBeInTheDocument()
    unmount()

    render(
      <DataExport
        columns={columns}
        dataSource={data}
        formats={['xlsx']}
        locale={{ locale: 'zh-CN' }}
        labels={{ xlsxText: 'Download workbook' }}
      />
    )
    expect(screen.getByText('Download workbook')).toBeInTheDocument()
  })

  it('exports on click and emits onExport with the format', async () => {
    const onExport = vi.fn()
    render(
      <DataExport
        columns={columns}
        dataSource={data}
        formats={['markdown']}
        onExport={onExport}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Export data' }))

    await waitFor(() => expect(onExport).toHaveBeenCalledWith('markdown'))
    expect(createObjectURLSpy).toHaveBeenCalled()
  })

  it('exports the selected format from the dropdown menu', async () => {
    const onExport = vi.fn()
    render(<DataExport columns={columns} dataSource={data} onExport={onExport} />)

    fireEvent.click(screen.getByText('Export Excel'))

    await waitFor(() => expect(onExport).toHaveBeenCalledWith('xlsx'))
  })

  it('does not export while disabled', async () => {
    const onExport = vi.fn()
    render(
      <DataExport
        columns={columns}
        dataSource={data}
        formats={['markdown']}
        disabled
        onExport={onExport}
      />
    )

    const button = screen.getByRole('button', { name: 'Export data' })
    expect(button).toBeDisabled()
    fireEvent.click(button)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(onExport).not.toHaveBeenCalled()
  })

  it('emits onError when serialization fails', async () => {
    const onError = vi.fn()
    render(
      <DataExport
        columns={columns}
        dataSource={data}
        formats={['markdown']}
        cellFormatter={() => {
          throw new Error('boom')
        }}
        onError={onError}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Export data' }))

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect((onError.mock.calls[0][0] as Error).message).toBe('boom')
  })

  it('has no a11y violations in both render modes', async () => {
    const single = render(<DataExport columns={columns} dataSource={data} formats={['xlsx']} />)
    await expectNoA11yViolationsIsolated(single.container)
    single.unmount()

    const dropdown = render(<DataExport columns={columns} dataSource={data} />)
    // same waiver as Dropdown.spec.tsx: the dropdown trigger wrapper carries aria-expanded
    await expectNoA11yViolationsIsolated(dropdown.container, {
      rules: { 'aria-allowed-attr': { enabled: false } }
    })
  })
})
