/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { CopyButton } from '../../packages/react/src/components/CopyButton'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'

describe('CopyButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('puts the accessible name on an icon-only button', () => {
    render(
      <CopyButton text="token" aria-label="Copy token">
        <svg aria-hidden="true" />
      </CopyButton>
    )
    const button = screen.getByRole('button', { name: 'Copy token' })
    expect(button).toHaveAttribute('aria-label', 'Copy token')
    expect(button.parentElement).not.toHaveAttribute('aria-label')
  })

  it('preserves focus moved elsewhere while copying', async () => {
    let resolveCopy!: () => void
    const pendingCopy = new Promise<void>((resolve) => {
      resolveCopy = resolve
    })
    const writeText = vi.fn(() => pendingCopy)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    render(
      <>
        <CopyButton text="token" />
        <button>Next control</button>
      </>
    )
    const button = screen.getByRole('button', { name: 'Copy' })
    const next = screen.getByRole('button', { name: 'Next control' })
    button.focus()
    fireEvent.click(button)
    next.focus()
    expect(writeText).toHaveBeenCalledWith('token')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(next)

    await act(async () => resolveCopy())

    expect(screen.getByRole('status')).toHaveTextContent('Copied')
    expect(document.activeElement).toBe(next)
  })

  it('writes text and keeps focus when copy fails', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const { unmount } = render(
      <ConfigProvider locale={zhCN}>
        <CopyButton text="alpha" />
      </ConfigProvider>
    )
    const button = screen.getByRole('button', { name: '复制' })
    button.focus()
    await act(async () => {
      fireEvent.click(button)
    })
    expect(writeText).toHaveBeenCalledWith('alpha')
    expect(screen.getByRole('status')).toHaveTextContent(zhCN.text.copiedLabel)
    expect(document.activeElement).toBe(button)
    unmount()

    writeText.mockRejectedValueOnce(new Error('nope'))
    render(<CopyButton text="beta" />)
    const failed = screen.getByRole('button', { name: 'Copy' })
    failed.focus()
    await act(async () => {
      fireEvent.click(failed)
    })
    expect(failed).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('status').textContent).toBe('Copy failed')
    expect(document.activeElement).toBe(failed)
  })
})
