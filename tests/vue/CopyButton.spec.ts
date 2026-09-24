/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/vue'
import { CopyButton } from '../../packages/vue/src/components/CopyButton'

describe('CopyButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('writes text and keeps focus when copy fails', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const success = render(CopyButton, { props: { text: 'alpha' } })
    const button = success.getByRole('button', { name: 'Copy' })
    button.focus()
    await fireEvent.click(button)
    expect(writeText).toHaveBeenCalledWith('alpha')
    expect(document.activeElement).toBe(button)
    success.unmount()

    writeText.mockReset()
    writeText.mockRejectedValue(new Error('nope'))
    const failure = render(CopyButton, { props: { text: 'beta' } })
    const failed = failure.getByRole('button', { name: 'Copy' })
    failed.focus()
    await fireEvent.click(failed)
    await Promise.resolve()
    expect(failed.getAttribute('aria-invalid')).toBe('true')
    expect(failure.getByRole('status').textContent).toBe('Copy failed')
    expect(document.activeElement).toBe(failed)
  })
})
