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

  it('puts native attributes on an icon-only button and keeps wrapper styling', () => {
    const { getByRole } = render(CopyButton, {
      props: { text: 'token' },
      attrs: {
        'aria-label': 'Copy token',
        'aria-describedby': 'copy-help',
        id: 'copy-token',
        tabindex: -1,
        class: 'copy-layout',
        style: 'margin-top: 4px'
      },
      slots: { default: () => h('svg', { 'aria-hidden': 'true' }) }
    })
    const button = getByRole('button', { name: 'Copy token' })
    expect(button).toHaveAttribute('aria-label', 'Copy token')
    expect(button).toHaveAttribute('aria-describedby', 'copy-help')
    expect(button).toHaveAttribute('id', 'copy-token')
    expect(button).toHaveAttribute('tabindex', '-1')
    expect(button.parentElement).not.toHaveAttribute('aria-label')
    expect(button.parentElement).toHaveClass('tiger-space', 'copy-layout')
    expect(button.parentElement).toHaveStyle({ marginTop: '4px' })
  })

  it('preserves focus moved elsewhere while copying', async () => {
    let resolveCopy!: () => void
    const pendingCopy = new Promise<void>((resolve) => {
      resolveCopy = resolve
    })
    const writeText = vi.fn(() => pendingCopy)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const { getByRole, queryByRole, findByRole } = render({
      render: () => h('div', [h(CopyButton, { text: 'token' }), h('button', 'Next control')])
    })
    const button = getByRole('button', { name: 'Copy' })
    const next = getByRole('button', { name: 'Next control' })
    button.focus()
    await fireEvent.click(button)
    next.focus()
    expect(writeText).toHaveBeenCalledWith('token')
    expect(queryByRole('status')).not.toBeInTheDocument()
    expect(document.activeElement).toBe(next)

    resolveCopy()

    expect(await findByRole('status')).toHaveTextContent('Copied')
    expect(document.activeElement).toBe(next)
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
