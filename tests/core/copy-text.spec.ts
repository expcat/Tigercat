/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { copyTextToClipboard } from '@expcat/tigercat-core'

type ExecCommandHost = { execCommand?: unknown }

const originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand')

/** Replace `document.execCommand`, which happy-dom does not implement. */
function stubExecCommand(impl: () => boolean) {
  const spy = vi.fn(impl)
  Object.defineProperty(document, 'execCommand', { configurable: true, value: spy })
  return spy
}

/** Force the legacy textarea path by taking the async clipboard API away. */
function withoutClipboardApi() {
  vi.stubGlobal('navigator', { clipboard: undefined })
}

describe('copyTextToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    if (originalExecCommand) {
      Object.defineProperty(document, 'execCommand', originalExecCommand)
    } else {
      delete (document as ExecCommandHost).execCommand
    }
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

  it('falls back to the textarea path when the clipboard API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const execCommand = stubExecCommand(() => true)

    await expect(copyTextToClipboard('fallback')).resolves.toBe(true)
    expect(execCommand).toHaveBeenCalledWith('copy')
  })

  it('removes the fallback textarea after a successful copy', async () => {
    withoutClipboardApi()
    stubExecCommand(() => true)

    await expect(copyTextToClipboard('clean')).resolves.toBe(true)
    expect(document.querySelector('textarea')).toBeNull()
  })

  // Regression: the removal used to sit after `execCommand` inside the same
  // `try`, so a throw stranded an invisible, focusable textbox in the document
  // — polluting the a11y tree and every later `getByRole('textbox')` query.
  it('removes the fallback textarea when execCommand throws', async () => {
    withoutClipboardApi()
    stubExecCommand(() => {
      throw new Error('unsupported')
    })

    await expect(copyTextToClipboard('leaky')).resolves.toBe(false)
    expect(document.querySelector('textarea')).toBeNull()
  })
})
