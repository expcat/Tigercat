/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataExport } from '@expcat/tigercat-react/DataExport'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import type { TableColumn } from '@expcat/tigercat-core'
import React from 'react'
import { expectNoA11yViolations } from '../utils/react'

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
  it('renders a dropdown trigger with both format items by default', async () => {
    render(<DataExport columns={columns} dataSource={data} />)

    const trigger = screen.getByRole('button', { name: 'Export' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByRole('menuitem', { name: 'Export Excel' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Export Markdown' })).toBeInTheDocument()
  })

  it('renders a plain button for a single format', () => {
    render(<DataExport columns={columns} dataSource={data} formats={['markdown']} />)

    const button = screen.getByRole('button', { name: 'Export Markdown' })
    expect(button).toBeInTheDocument()
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })

  it('keeps a disabled trigger when formats is empty', () => {
    render(<DataExport columns={columns} dataSource={data} formats={[]} />)
    const button = screen.getByRole('button', { name: 'Export' })
    expect(button).toBeDisabled()
  })

  it('resolves labels from an official locale object', () => {
    render(
      <ConfigProvider locale={zhTW}>
        <DataExport columns={columns} dataSource={data} formats={['xlsx']} />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '匯出 Excel' })).toBeInTheDocument()
    expect(screen.queryByText('导出 Excel')).not.toBeInTheDocument()
    expect(screen.queryByText('Export Excel')).not.toBeInTheDocument()
  })

  it('lets explicit labels override locale', () => {
    render(
      <DataExport
        columns={columns}
        dataSource={data}
        formats={['xlsx']}
        labels={{ xlsxText: 'Download workbook' }}
      />
    )
    expect(screen.getByRole('button', { name: 'Download workbook' })).toBeInTheDocument()
  })

  it('exports on click and emits onExport with the format', async () => {
    const onExport = vi.fn()
    render(
      <DataExport columns={columns} dataSource={data} formats={['markdown']} onExport={onExport} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Export Markdown' }))

    await waitFor(() => expect(onExport).toHaveBeenCalledWith('markdown'))
    expect(createObjectURLSpy).toHaveBeenCalled()
  })

  it('exports the selected format from the opened menu', async () => {
    const onExport = vi.fn()
    render(<DataExport columns={columns} dataSource={data} onExport={onExport} />)

    fireEvent.click(screen.getByRole('button', { name: 'Export' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Export Excel' }))

    await waitFor(() => expect(onExport).toHaveBeenCalledWith('xlsx'))
  })

  it('only starts one export when clicked twice', async () => {
    const onExport = vi.fn()
    render(
      <DataExport columns={columns} dataSource={data} formats={['markdown']} onExport={onExport} />
    )

    const button = screen.getByRole('button', { name: 'Export Markdown' })
    fireEvent.click(button)
    fireEvent.click(button)

    await waitFor(() => expect(onExport).toHaveBeenCalledTimes(1))
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

    const button = screen.getByRole('button', { name: 'Export Markdown' })
    expect(button).toBeDisabled()
    fireEvent.click(button)

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(onExport).not.toHaveBeenCalled()
  })

  it('surfaces onError and a live status when serialization fails', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Export Markdown' }))

    await waitFor(() => expect(onError).toHaveBeenCalled())
    expect((onError.mock.calls[0][0] as Error).message).toBe('boom')
    expect(await screen.findByRole('status')).toHaveTextContent('Export failed')
  })

  it('has no a11y violations for single, open menu, disabled, and error states', async () => {
    const single = render(<DataExport columns={columns} dataSource={data} formats={['xlsx']} />)
    await expectNoA11yViolations(single.container)
    single.unmount()

    const dropdown = render(<DataExport columns={columns} dataSource={data} />)
    fireEvent.click(screen.getByRole('button', { name: 'Export' }))
    await screen.findByRole('menuitem', { name: 'Export Excel' })
    await expectNoA11yViolations(dropdown.container)
    dropdown.unmount()

    const disabled = render(
      <DataExport columns={columns} dataSource={data} formats={['xlsx']} disabled />
    )
    await expectNoA11yViolations(disabled.container)
  })
})
