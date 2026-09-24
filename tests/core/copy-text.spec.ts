/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { copyTextToClipboard } from '@expcat/tigercat-core'

describe('copyTextToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects a non-string value without touching the DOM', async () => {
    await expect(copyTextToClipboard(42 as unknown as string)).resolves.toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
  })

  it('writes through the async clipboard API when it is available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await expect(copyTextToClipboard('hello')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('returns false when the clipboard API rejects and does not move focus', async () => {
    const previous = document.createElement('button')
    document.body.appendChild(previous)
    previous.focus()
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await expect(copyTextToClipboard('fallback')).resolves.toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
    expect(document.activeElement).toBe(previous)
    previous.remove()
  })

  it('returns false when the clipboard API is missing', async () => {
    vi.stubGlobal('navigator', { clipboard: undefined })
    await expect(copyTextToClipboard('clean')).resolves.toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
  })
})
