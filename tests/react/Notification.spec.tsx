/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { notification } from '@expcat/tigercat-react'

const notificationPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const

describe('Notification (React)', () => {
  beforeEach(async () => {
    await act(async () => {
      // Clear all notifications before each test
      notification.clear()
      await flushMicrotasks()
    })
    // Clear any existing notification containers
    document.body.innerHTML = ''
  })

  afterEach(async () => {
    await act(async () => {
      // Clean up after each test
      notification.clear()
      await flushMicrotasks()
    })
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  async function flushMicrotasks() {
    await Promise.resolve()
    await Promise.resolve()
  }

  it('shows a notification for string options', async () => {
    await act(async () => {
      notification.info('Test notification')
      await flushMicrotasks()
    })

    const el = document.querySelector('[data-tiger-notification]')
    expect(el).toBeTruthy()
    expect(el?.textContent).toContain('Test notification')
  })

  it('supports config object with description', async () => {
    await act(async () => {
      notification.warning({
        title: 'Warning notification',
        description: 'This is a warning description'
      })
      await flushMicrotasks()
    })

    const el = document.querySelector('[data-tiger-notification]')
    expect(el?.getAttribute('data-tiger-notification-type')).toBe('warning')
    expect(el?.textContent).toContain('Warning notification')
    expect(el?.textContent).toContain('This is a warning description')
  })

  it('returns a close function', async () => {
    let close: (() => void) | undefined

    await act(async () => {
      close = notification.info({
        title: 'Closable via function',
        duration: 0
      })
      await flushMicrotasks()
    })

    expect(typeof close).toBe('function')
    expect(document.querySelector('[data-tiger-notification]')).toBeTruthy()

    await act(async () => {
      close!()
      await flushMicrotasks()
    })

    expect(document.querySelector('[data-tiger-notification]')).toBeFalsy()
  })

  it('respects position by creating a container per position', async () => {
    await act(async () => {
      notification.info({ title: 'Top-left', position: 'top-left' })
      await flushMicrotasks()
    })

    const container = document.getElementById('tiger-notification-container-top-left')
    expect(container).toBeTruthy()
    expect(container?.getAttribute('data-tiger-notification-position')).toBe('top-left')
    expect(container?.querySelector('[data-tiger-notification]')).toBeTruthy()
  })

  it('auto-closes after duration', async () => {
    vi.useFakeTimers()

    await act(async () => {
      notification.info({ title: 'Auto-close', duration: 100 })
      await flushMicrotasks()
    })

    expect(document.querySelector('[data-tiger-notification]')).toBeTruthy()

    await act(async () => {
      vi.advanceTimersByTime(150)
    })

    await act(async () => {
      await flushMicrotasks()
    })

    expect(document.querySelector('[data-tiger-notification]')).toBeFalsy()
  })

  it('hides close button when closable is false', async () => {
    await act(async () => {
      notification.info({
        title: 'Non-closable',
        closable: false,
        duration: 0
      })
      await flushMicrotasks()
    })

    const closeBtn = document.querySelector('[aria-label="Close notification"]')
    expect(closeBtn).toBeFalsy()
  })

  it('clears notifications for a specific position', async () => {
    await act(async () => {
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
      await flushMicrotasks()
    })

    expect(document.querySelectorAll('[data-tiger-notification]').length).toBe(2)

    await act(async () => {
      notification.clear('top-right')
      await flushMicrotasks()
    })

    expect(document.querySelectorAll('[data-tiger-notification]').length).toBe(1)
    const remaining = document.querySelector('[data-tiger-notification]')
    expect(remaining?.textContent).toContain('Top-left 1')
  })
})
