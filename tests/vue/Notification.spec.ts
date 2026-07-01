/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/vue'
import { createApp, h, nextTick } from 'vue'
import { notification } from '@expcat/tigercat-vue'
import { ConfigProvider } from '../../packages/vue/src/components/ConfigProvider'
import { expectNoA11yViolationsIsolated } from '../utils'

async function flushMicrotasks() {
  await nextTick()
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve()
  }
}

async function flush() {
  await flushMicrotasks()
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await flushMicrotasks()
}

async function flushLazyImport() {
  await flushMicrotasks()
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
  await flushMicrotasks()
}

describe('Notification (Vue)', () => {
  beforeAll(async () => {
    notification.clear()
    await flushLazyImport()
    document.body.innerHTML = ''
  })

  beforeEach(async () => {
    // Clear all notifications before each test
    notification.clear()
    await flushLazyImport()
    // Clear any existing notification containers
    document.body.innerHTML = ''
  })

  afterEach(() => {
    // Clean up after each test
    notification.clear()
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('shows a notification for string options', async () => {
    notification.info('Test notification')
    await flush()

    await waitFor(() => {
      expect(document.querySelector('[data-tiger-notification]')).toBeTruthy()
    })

    const el = document.querySelector('[data-tiger-notification]')
    expect(el?.textContent).toContain('Test notification')
  })

  it('supports config object with description', async () => {
    notification.warning({
      title: 'Warning notification',
      description: 'This is a warning description'
    })
    await flush()

    const el = document.querySelector('[data-tiger-notification]')
    expect(el?.getAttribute('data-tiger-notification-type')).toBe('warning')
    expect(el?.textContent).toContain('Warning notification')
    expect(el?.textContent).toContain('This is a warning description')
  })

  it('returns a close function', async () => {
    const close = notification.info({
      title: 'Closable via function',
      duration: 0
    })
    expect(typeof close).toBe('function')
    await flush()

    expect(document.querySelector('[data-tiger-notification]')).toBeTruthy()
    close()
    await flush()
    expect(document.querySelector('[data-tiger-notification]')).toBeFalsy()
  })

  it('uses ConfigProvider locale for command-root close aria label', async () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    const app = createApp({
      render: () =>
        h(ConfigProvider, { locale: { locale: 'zh-CN', common: { closeText: '关闭' } } }, () =>
          h('span')
        )
    })
    app.mount(root)
    await flush()

    notification.info({
      title: 'Provider localized notification',
      duration: 0
    })
    await flush()

    expect(document.querySelector('button[aria-label="关闭通知"]')).toBeTruthy()
    app.unmount()
    root.remove()
  })

  it('respects position by creating a container per position', async () => {
    notification.info({ title: 'Top-left', position: 'top-left' })
    await flush()

    const container = document.getElementById('tiger-notification-container-top-left')
    expect(container).toBeTruthy()
    expect(container?.getAttribute('data-tiger-notification-position')).toBe('top-left')
    expect(container?.querySelector('[data-tiger-notification]')).toBeTruthy()
  })

  it('auto-closes after duration', async () => {
    vi.useFakeTimers()

    notification.info({ title: 'Auto-close', duration: 100 })
    await flushMicrotasks()
    vi.advanceTimersByTime(16)
    await flushMicrotasks()
    expect(document.querySelector('[data-tiger-notification]')).toBeTruthy()

    vi.advanceTimersByTime(150)
    vi.advanceTimersByTime(16)
    await flushMicrotasks()
    expect(document.querySelector('[data-tiger-notification]')).toBeFalsy()
  })

  it('hides close button when closable is false', async () => {
    notification.info({ title: 'Non-closable', closable: false, duration: 0 })
    await flush()

    const closeBtn = document.querySelector('[aria-label="Close notification"]')
    expect(closeBtn).toBeFalsy()
  })

  it('renders inline actions without triggering the toast click handler', async () => {
    const handleToastClick = vi.fn()
    const handleActionClick = vi.fn()

    notification.info({
      title: 'Actionable notification',
      duration: 0,
      onClick: handleToastClick,
      actions: [{ label: 'View', type: 'primary', onClick: handleActionClick }]
    })
    await flush()

    const action = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'View'
    )
    expect(action).toBeTruthy()

    await fireEvent.click(action!)
    await flush()

    expect(handleActionClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: expect.any(Number), close: expect.any(Function) })
    )
    expect(handleToastClick).not.toHaveBeenCalled()

    const toast = document.querySelector('[data-tiger-notification]')
    await fireEvent.click(toast!)
    await flush()
    expect(handleToastClick).toHaveBeenCalledTimes(1)
  })

  it('closes when an inline action has closeOnClick', async () => {
    notification.info({
      title: 'Close from action',
      duration: 0,
      actions: [{ label: 'Undo', closeOnClick: true }]
    })
    await flush()

    const action = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Undo'
    )
    expect(action).toBeTruthy()

    await fireEvent.click(action!)
    await flush()
    expect(document.querySelector('[data-tiger-notification]')).toBeFalsy()
  })

  it('clears notifications for a specific position', async () => {
    notification.info({
      title: 'Top-right 1',
      position: 'top-right',
      duration: 0
    })
    notification.success({
      title: 'Top-left 1',
      position: 'top-left',
      duration: 0
    })
    await flush()

    expect(document.querySelectorAll('[data-tiger-notification]').length).toBe(2)

    notification.clear('top-right')
    await flush()

    expect(document.querySelectorAll('[data-tiger-notification]').length).toBe(1)
    const remaining = document.querySelector('[data-tiger-notification]')
    expect(remaining?.textContent).toContain('Top-left 1')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      notification.info({
        title: 'Accessible notification',
        description: 'Notification details',
        duration: 0
      })
      await flush()

      await expectNoA11yViolationsIsolated(document.body)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      expect(() => notification.clear()).not.toThrow()
    })
  })
})
