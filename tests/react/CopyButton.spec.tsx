/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { CopyButton } from '../../packages/react/src/components/CopyButton'

describe('CopyButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('writes text and keeps focus when copy fails', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const { unmount } = render(<CopyButton text="alpha" />)
    const button = screen.getByRole('button', { name: 'Copy' })
    button.focus()
    await act(async () => {
      fireEvent.click(button)
    })
    expect(writeText).toHaveBeenCalledWith('alpha')
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
