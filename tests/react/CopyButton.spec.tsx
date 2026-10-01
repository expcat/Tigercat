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
