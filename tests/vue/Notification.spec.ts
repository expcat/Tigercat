/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { notification, NotificationContainer } from '@expcat/tigercat-vue'
import { ConfigProvider } from '../../packages/vue/src/components/ConfigProvider'
import { expectNoA11yViolations } from '../utils'

function getToasts() {
  return document.querySelectorAll('[data-tiger-notification]')
}

async function flushHost() {
  await Promise.resolve()
  await nextTick()
}

function mountProvider(locale: typeof zhCN) {
  const app = createApp({
    render: () => h(ConfigProvider, { locale }, () => h('span'))
  })
  const root = document.createElement('div')
  document.body.append(root)
  app.mount(root)
  return () => {
    app.unmount()
    root.remove()
  }
}

describe('notification (Vue)', () => {
  beforeAll(async () => {
    notification.info({ title: '__warmup__', duration: 0 })
    await vi.waitFor(() => {
      expect(document.querySelector('[data-tiger-notification]')).toBeTruthy()
    })
    notification.clear()
    document.body.innerHTML = ''
  })

  beforeEach(async () => {
    notification.clear()
    document.body.innerHTML = ''
    await flushHost()
  })

  afterEach(() => {
    vi.useRealTimers()
    notification.clear()
    document.body.innerHTML = ''
  })

  it('renders three toasts on the same position from one turn', async () => {
    notification.info({ title: 'one', duration: 0, position: 'top-right' })
    notification.success({ title: 'two', duration: 0, position: 'top-right' })
    notification.warning({ title: 'three', duration: 0, position: 'top-right' })
    await flushHost()
    expect(getToasts()).toHaveLength(3)
  })

  it('does not fire onClose again after the close button', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    notification.info({ title: 'Timed', duration: 3000, closable: true, onClose })
    await flushHost()
    document.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushHost()
    expect(onClose).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(3000)
    await flushHost()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not fire toast onClick when an action is activated', async () => {
    const onClick = vi.fn()
    const onAction = vi.fn()
    notification.info({
      title: 'Clickable',
      duration: 0,
      onClick,
      actions: [{ label: 'View', onClick: onAction }]
    })
    await flushHost()
    const action = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'View'
    )
    expect(document.querySelector('[data-tiger-notification]')?.getAttribute('tabindex')).toBeNull()
    action?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushHost()
    expect(onAction).toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('uses official locale close names and accepts a custom closeAriaLabel', async () => {
    mountProvider(zhCN)
    notification.info({ title: 'CN', duration: 0, closable: true })
    await flushHost()
    expect(
      document.querySelector(`button[aria-label="${zhCN.common?.closeNotificationAriaLabel}"]`)
    ).toBeTruthy()

    notification.clear()
    mountProvider(zhTW)
    notification.info({ title: 'TW', duration: 0, closable: true })
    await flushHost()
    expect(document.querySelector('button')?.getAttribute('aria-label')).toBe(
      zhTW.common?.closeNotificationAriaLabel
    )

    notification.clear()
    mountProvider(jaJP)
    notification.info({ title: 'JA', duration: 0, closable: true })
    await flushHost()
    expect(document.querySelector('button')?.getAttribute('aria-label')).toBe(
      jaJP.common?.closeNotificationAriaLabel
    )

    notification.clear()
    notification.info({
      title: 'Custom',
      duration: 0,
      closable: true,
      closeAriaLabel: 'Dismiss this notice'
    })
    await flushHost()
    expect(document.querySelector('button[aria-label="Dismiss this notice"]')).toBeTruthy()
  })

  it('emits close from the declarative container', async () => {
    const onClose = vi.fn()
    const root = document.createElement('div')
    document.body.append(root)
    const app = createApp({
      render: () =>
        h(NotificationContainer, {
          notifications: [
            {
              id: 'one',
              type: 'info',
              title: 'Declarative',
              duration: 0,
              closable: true,
              position: 'top-right'
            }
          ],
          onClose
        })
    })
    app.mount(root)
    await nextTick()
    document.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(onClose).toHaveBeenCalledWith('one')
    app.unmount()
  })

  it('keeps one live role per toast and none on an empty container', async () => {
    notification.info({ title: 'info', duration: 0 })
    notification.error({ title: 'error', duration: 0 })
    await flushHost()
    expect(document.querySelectorAll('[aria-live]')).toHaveLength(0)
    expect(document.querySelectorAll('[role="status"]')).toHaveLength(1)
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1)
    await expectNoA11yViolations(document.querySelector('[data-tiger-notification]') as HTMLElement)

    notification.clear()
    const root = document.createElement('div')
    document.body.append(root)
    const app = createApp(NotificationContainer)
    app.mount(root)
    await nextTick()
    expect(document.querySelector('[data-tiger-notification-container][aria-live]')).toBeNull()
    const empty = document.querySelector('[data-tiger-notification-container]')
    if (empty) await expectNoA11yViolations(empty as HTMLElement)
    app.unmount()
  })
})
