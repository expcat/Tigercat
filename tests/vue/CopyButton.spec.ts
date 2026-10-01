/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/vue'
import { h } from 'vue'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { CopyButton } from '../../packages/vue/src/components/CopyButton'

describe('CopyButton', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('writes text and keeps focus when copy fails', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const success = render(ConfigProvider, {
      props: { locale: zhCN },
      slots: { default: () => h(CopyButton, { text: 'alpha' }) }
    })
    const button = success.getByRole('button', { name: '复制' })
    button.focus()
    await fireEvent.click(button)
    expect(writeText).toHaveBeenCalledWith('alpha')
    expect(await success.findByRole('status')).toHaveTextContent(zhCN.text.copiedLabel)
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
