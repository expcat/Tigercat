/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { act, fireEvent, waitFor } from '@testing-library/react'
import { notification } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Notification (React)', () => {
  beforeAll(async () => {
    notification.clear()
    await flushLazyImport()
    document.body.innerHTML = ''
  })

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
    for (let i = 0; i < 8; i += 1) {
      await Promise.resolve()
    }
  }

  async function flushLazyImport() {
    await flushMicrotasks()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
    await flushMicrotasks()
  }

  it('shows a notification for string options', async () => {
    await act(async () => {
      notification.info('Test notification')
      await flushMicrotasks()
    })

    await waitFor(() => {
      expect(document.querySelector('[data-tiger-notification]')).toBeTruthy()
    })

    const el = document.querySelector('[data-tiger-notification]')
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

  it('renders inline actions without triggering the toast click handler', async () => {
    const handleToastClick = vi.fn()
    const handleActionClick = vi.fn()

    await act(async () => {
      notification.info({
        title: 'Actionable notification',
        duration: 0,
        onClick: handleToastClick,
        actions: [{ label: 'View', type: 'primary', onClick: handleActionClick }]
      })
      await flushMicrotasks()
    })

    const action = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'View'
    )
    expect(action).toBeTruthy()

    await act(async () => {
      fireEvent.click(action!)
      await flushMicrotasks()
    })

    expect(handleActionClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: expect.any(Number), close: expect.any(Function) })
    )
    expect(handleToastClick).not.toHaveBeenCalled()

    const toast = document.querySelector('[data-tiger-notification]')
    await act(async () => {
      fireEvent.click(toast!)
      await flushMicrotasks()
    })
    expect(handleToastClick).toHaveBeenCalledTimes(1)
  })

  it('closes when an inline action has closeOnClick', async () => {
    vi.useFakeTimers()

    await act(async () => {
      notification.info({
        title: 'Close from action',
        duration: 0,
        actions: [{ label: 'Undo', closeOnClick: true }]
      })
      await flushMicrotasks()
    })

    const action = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent === 'Undo'
    )
    expect(action).toBeTruthy()

    await act(async () => {
      fireEvent.click(action!)
      vi.runAllTimers()
      await flushMicrotasks()
    })

    expect(document.querySelector('[data-tiger-notification]')).toBeFalsy()
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
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      vi.useFakeTimers()
      await act(async () => {
        notification.info({
          title: 'Accessible notification',
          description: 'Notification details',
          duration: 0
        })
        await flushMicrotasks()
      })
      await act(async () => {
        vi.advanceTimersByTime(10)
      })
      vi.useRealTimers()

      await expectNoA11yViolationsIsolated(document.body)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      expect(() => notification.clear()).not.toThrow()
    })
  })
})
