/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { Message, MessageContainer } from '@expcat/tigercat-react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { expectNoA11yViolations } from '../utils/react'

function getMessages() {
  return document.querySelectorAll('[data-tiger-message]')
}

async function flushHost() {
  await act(async () => {
    await Promise.resolve()
  })
}

describe('Message (React)', () => {
  beforeAll(async () => {
    Message.info({ content: '__warmup__', duration: 0 })
    await waitFor(() => {
      expect(document.querySelector('[data-tiger-message]')).toBeTruthy()
    })
    Message.clear()
    document.body.innerHTML = ''
  })

  beforeEach(() => {
    act(() => {
      Message.clear()
    })
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    act(() => {
      Message.clear()
    })
    document.body.innerHTML = ''
  })

  it('renders three messages from one act without waiting', async () => {
    await flushHost()
    act(() => {
      Message.info('one')
      Message.success('two')
      Message.warning('three')
    })
    expect(getMessages()).toHaveLength(3)
  })

  it('respects loading duration when it is passed', () => {
    vi.useFakeTimers()
    act(() => {
      Message.loading({ content: 'Saving', duration: 1000 })
    })
    expect(getMessages()).toHaveLength(1)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(getMessages()).toHaveLength(0)
  })

  it('does not fire onClose again after a manual close', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    act(() => {
      Message.info({ content: 'Timed', duration: 3000, closable: true, onClose })
    })
    act(() => {
      screen.getByRole('button').click()
    })
    expect(onClose).toHaveBeenCalledTimes(1)
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses official locale close names without an override', () => {
    const { unmount } = render(
      <ConfigProvider locale={zhCN}>
        <span />
      </ConfigProvider>
    )
    act(() => {
      Message.info({ content: 'Closable', closable: true, duration: 0 })
    })
    expect(screen.getByRole('button', { name: zhCN.common?.closeMessageAriaLabel })).toBeTruthy()
    unmount()
    Message.clear()

    render(
      <ConfigProvider locale={zhTW}>
        <span />
      </ConfigProvider>
    )
    act(() => {
      Message.info({ content: 'TW', closable: true, duration: 0 })
    })
    expect(screen.getByRole('button', { name: zhTW.common?.closeMessageAriaLabel })).toBeTruthy()
    expect(screen.getByRole('button').getAttribute('aria-label')).not.toContain('消息')

    Message.clear()
    render(
      <ConfigProvider locale={jaJP}>
        <span />
      </ConfigProvider>
    )
    act(() => {
      Message.info({ content: 'JA', closable: true, duration: 0 })
    })
    expect(screen.getByRole('button', { name: jaJP.common?.closeMessageAriaLabel })).toBeTruthy()
  })

  it('keeps a single live region per item and none on an empty container', async () => {
    act(() => {
      Message.info({ content: 'info', duration: 0 })
      Message.error({ content: 'error', duration: 0 })
    })
    expect(document.querySelectorAll('[aria-live]')).toHaveLength(0)
    expect(document.querySelectorAll('[role="status"]')).toHaveLength(1)
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1)
    await expectNoA11yViolations(document.querySelector('[data-tiger-message]') as HTMLElement)

    Message.clear()
    const { unmount } = render(<MessageContainer />)
    expect(document.querySelector('[data-tiger-message-container][aria-live]')).toBeNull()
    const empty = document.querySelector('[data-tiger-message-container]')
    if (empty) await expectNoA11yViolations(empty as HTMLElement)
    unmount()
  })

  it('places toasts by logical position without locking physical inset class names', () => {
    act(() => {
      Message.info({ content: 'corner', position: 'bottom-right', duration: 0 })
    })
    const host = document.querySelector(
      '[data-tiger-message-container][data-tiger-message-position="bottom-right"]'
    )
    expect(host).toBeTruthy()
    expect(host?.textContent).toContain('corner')
  })
})
