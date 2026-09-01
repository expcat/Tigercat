/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { notification, NotificationContainer } from '@expcat/tigercat-react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { expectNoA11yViolations } from '../utils/react'

function getToasts() {
  return document.querySelectorAll('[data-tiger-notification]')
}

async function flushHost() {
  await act(async () => {
    await Promise.resolve()
  })
}

describe('notification (React)', () => {
  beforeAll(async () => {
    notification.info({ title: '__warmup__', duration: 0 })
    await waitFor(() => {
      expect(document.querySelector('[data-tiger-notification]')).toBeTruthy()
    })
    notification.clear()
    document.body.innerHTML = ''
  })

  beforeEach(() => {
    act(() => {
      notification.clear()
    })
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    act(() => {
      notification.clear()
    })
    document.body.innerHTML = ''
  })

  it('renders three toasts on the same position from one act', async () => {
    await flushHost()
    act(() => {
      notification.info({ title: 'one', duration: 0, position: 'top-right' })
      notification.success({ title: 'two', duration: 0, position: 'top-right' })
      notification.warning({ title: 'three', duration: 0, position: 'top-right' })
    })
    expect(getToasts()).toHaveLength(3)
  })

  it('does not fire onClose again after the close button', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    act(() => {
      notification.info({ title: 'Timed', duration: 3000, closable: true, onClose })
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

  it('does not turn the toast into a widget; action Enter does not fire toast onClick', () => {
    const onClick = vi.fn()
    const onAction = vi.fn()
    act(() => {
      notification.info({
        title: 'Clickable',
        duration: 0,
        onClick,
        actions: [{ label: 'View', onClick: onAction }]
      })
    })
    const action = screen.getByRole('button', { name: 'View' })
    expect(document.querySelector('[data-tiger-notification]')?.getAttribute('tabindex')).toBeNull()
    action.focus()
    fireEvent.keyDown(action, { key: 'Enter' })
    fireEvent.click(action)
    expect(onAction).toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('uses official locale close names', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <span />
      </ConfigProvider>
    )
    act(() => {
      notification.info({ title: 'CN', duration: 0, closable: true })
    })
    expect(
      screen.getByRole('button', { name: zhCN.common?.closeNotificationAriaLabel })
    ).toBeTruthy()

    notification.clear()
    render(
      <ConfigProvider locale={zhTW}>
        <span />
      </ConfigProvider>
    )
    act(() => {
      notification.info({ title: 'TW', duration: 0, closable: true })
    })
    expect(
      screen.getByRole('button', { name: zhTW.common?.closeNotificationAriaLabel })
    ).toBeTruthy()

    notification.clear()
    render(
      <ConfigProvider locale={jaJP}>
        <span />
      </ConfigProvider>
    )
    act(() => {
      notification.info({ title: 'JA', duration: 0, closable: true })
    })
    expect(
      screen.getByRole('button', { name: jaJP.common?.closeNotificationAriaLabel })
    ).toBeTruthy()
  })

  it('keeps one live role per toast and none on an empty container', async () => {
    act(() => {
      notification.info({ title: 'info', duration: 0 })
      notification.error({ title: 'error', duration: 0 })
    })
    expect(document.querySelectorAll('[aria-live]')).toHaveLength(0)
    expect(document.querySelectorAll('[role="status"]')).toHaveLength(1)
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1)
    await expectNoA11yViolations(document.querySelector('[data-tiger-notification]') as HTMLElement)

    notification.clear()
    const { unmount } = render(<NotificationContainer />)
    expect(document.querySelector('[data-tiger-notification-container][aria-live]')).toBeNull()
    const empty = document.querySelector('[data-tiger-notification-container]')
    if (empty) await expectNoA11yViolations(empty as HTMLElement)
    unmount()
  })
})
