/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { notification } from '@expcat/tigercat-vue'

async function flush() {
  await nextTick()
  await Promise.resolve()
  await Promise.resolve()
}

describe('Notification (Vue)', () => {
  beforeEach(() => {
    // Clear all notifications before each test
    notification.clear()
    // Clear any existing notification containers
    document.body.innerHTML = ''
  })

  afterEach(() => {
    // Clean up after each test
    notification.clear()
    document.body.innerHTML = ''
  })

  it('shows a notification for string options', async () => {
    notification.info('Test notification')
    await flush()

    const el = document.querySelector('[data-tiger-notification]')
    expect(el).toBeTruthy()
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
    await flush()
    expect(document.querySelector('[data-tiger-notification]')).toBeTruthy()

    vi.advanceTimersByTime(150)
    await flush()
    expect(document.querySelector('[data-tiger-notification]')).toBeFalsy()

    vi.useRealTimers()
  })

  it('hides close button when closable is false', async () => {
    notification.info({ title: 'Non-closable', closable: false, duration: 0 })
    await flush()

    const closeBtn = document.querySelector('[aria-label="Close notification"]')
    expect(closeBtn).toBeFalsy()
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
})
