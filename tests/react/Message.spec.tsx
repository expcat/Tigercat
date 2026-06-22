/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, waitFor } from '@testing-library/react'
import { Message } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const messageTypes = ['success', 'warning', 'error', 'info', 'loading'] as const

function getMessages() {
  return document.querySelectorAll('[data-tiger-message]')
}

function getMessageByType(type: (typeof messageTypes)[number]) {
  return document.querySelector(`[data-tiger-message][data-tiger-message-type="${type}"]`)
}

async function runMessageAction<T>(action: () => T): Promise<T> {
  let result!: T
  act(() => {
    result = action()
  })
  await act(async () => {
    await Promise.resolve()
  })
  return result
}

describe('Message (React)', () => {
  beforeEach(async () => {
    // Clear all messages before each test
    await runMessageAction(() => Message.clear())
    // Clear any existing message containers
    document.body.innerHTML = ''
  })

  afterEach(async () => {
    // Clean up after each test
    await runMessageAction(() => Message.clear())
    document.body.innerHTML = ''
  })

  describe('Basic Functionality', () => {
    it('should show a message when called', async () => {
      await runMessageAction(() => Message.info('Test message'))

      await waitFor(() => {
        const messageElement = getMessageByType('info')
        expect(messageElement).toBeTruthy()
        expect(messageElement?.textContent).toContain('Test message')
      })
    })

    it('should accept config object as parameter', async () => {
      await runMessageAction(() =>
        Message.warning({
          content: 'Warning message',
          duration: 5000
        })
      )

      await waitFor(() => {
        const messageElement = getMessageByType('warning')
        expect(messageElement?.textContent).toContain('Warning message')
      })
    })
  })

  describe('Types', () => {
    it.each(messageTypes)('should show %s type message', async (type) => {
      await runMessageAction(() => Message[type](`${type} message`))

      await waitFor(() => {
        const messageElement = getMessageByType(type)
        expect(messageElement).toBeTruthy()
        expect(messageElement?.textContent).toContain(`${type} message`)
      })
    })
  })

  describe('Auto Close', () => {
    it('should auto close after default duration (3000ms)', async () => {
      vi.useFakeTimers()

      await runMessageAction(() => Message.info('Auto close message'))

      expect(getMessages().length).toBe(1)

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(getMessages().length).toBe(0)

      vi.useRealTimers()
    })

    it('should auto close after custom duration', async () => {
      vi.useFakeTimers()

      await runMessageAction(() =>
        Message.success({
          content: 'Custom duration',
          duration: 1000
        })
      )

      expect(getMessages().length).toBe(1)

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(getMessages().length).toBe(0)

      vi.useRealTimers()
    })

    it('should not auto close when duration is 0', async () => {
      vi.useFakeTimers()

      await runMessageAction(() =>
        Message.warning({
          content: 'No auto close',
          duration: 0
        })
      )

      expect(getMessages().length).toBe(1)

      // Fast-forward time significantly
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Message should still be visible
      expect(getMessages().length).toBe(1)

      vi.useRealTimers()
    })

    it('loading type should not auto close by default', async () => {
      vi.useFakeTimers()

      await runMessageAction(() => Message.loading('Loading...'))

      expect(getMessages().length).toBe(1)

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // Message should still be visible
      expect(getMessages().length).toBe(1)

      vi.useRealTimers()
    })
  })

  describe('Manual Close', () => {
    it('should return a close function', async () => {
      const close = await runMessageAction(() => Message.info('Closable message'))

      expect(typeof close).toBe('function')

      await waitFor(() => {
        expect(getMessages().length).toBe(1)
      })

      // Call close function
      await runMessageAction(close)

      await waitFor(() => {
        expect(getMessages().length).toBe(0)
      })
    })

    it('should show close button when closable is true', async () => {
      await runMessageAction(() =>
        Message.info({
          content: 'Closable',
          closable: true,
          duration: 0
        })
      )

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="Close message"]')
        expect(closeButton).toBeTruthy()
      })
    })

    it('should close when close button is clicked', async () => {
      vi.useFakeTimers()

      await runMessageAction(() =>
        Message.info({
          content: 'Closable',
          closable: true,
          duration: 0
        })
      )

      const closeButton = document.querySelector(
        'button[aria-label="Close message"]'
      ) as HTMLButtonElement
      expect(closeButton).toBeTruthy()
      await act(async () => {
        closeButton?.click()
      })

      act(() => {
        vi.advanceTimersByTime(350)
      })

      expect(getMessages().length).toBe(0)

      vi.useRealTimers()
    })
  })

  describe('Callback', () => {
    it('should call onClose callback when message closes', async () => {
      const onClose = vi.fn()

      const close = await runMessageAction(() =>
        Message.success({
          content: 'Test',
          onClose
        })
      )

      await waitFor(() => {
        expect(getMessages().length).toBe(1)
      })

      // Close manually
      await runMessageAction(close)

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('should call onClose when auto closed', async () => {
      vi.useFakeTimers()

      const onClose = vi.fn()

      await runMessageAction(() =>
        Message.info({
          content: 'Test',
          duration: 1000,
          onClose
        })
      )

      expect(getMessages().length).toBe(1)

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(onClose).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('Queue Management', () => {
    it('should show multiple messages', async () => {
      await runMessageAction(() => {
        Message.info('Message 1')
        Message.success('Message 2')
        Message.warning('Message 3')
      })

      await waitFor(() => {
        expect(getMessages().length).toBe(3)
      })
    })

    it('should clear all messages with clear()', async () => {
      await runMessageAction(() => {
        Message.info('Message 1')
        Message.success('Message 2')
        Message.warning('Message 3')
      })

      await waitFor(() => {
        expect(getMessages().length).toBe(3)
      })

      // Clear all
      await runMessageAction(() => Message.clear())

      await waitFor(() => {
        expect(getMessages().length).toBe(0)
      })
    })

    it('should call onClose for all messages when clearing', async () => {
      const onClose1 = vi.fn()
      const onClose2 = vi.fn()
      const onClose3 = vi.fn()

      await runMessageAction(() => {
        Message.info({ content: 'Message 1', onClose: onClose1 })
        Message.success({ content: 'Message 2', onClose: onClose2 })
        Message.warning({ content: 'Message 3', onClose: onClose3 })
      })

      await waitFor(() => {
        expect(getMessages().length).toBe(3)
      })

      await runMessageAction(() => Message.clear())

      await waitFor(() => {
        expect(onClose1).toHaveBeenCalled()
        expect(onClose2).toHaveBeenCalled()
        expect(onClose3).toHaveBeenCalled()
      })
    })
  })

  describe('Custom Options', () => {
    it('should support custom className', async () => {
      await runMessageAction(() =>
        Message.info({
          content: 'Custom class',
          className: 'custom-message-class'
        })
      )

      await waitFor(() => {
        const messageElement = document.querySelector('.custom-message-class')
        expect(messageElement).toBeTruthy()
      })
    })

    it('should support custom icon', async () => {
      await runMessageAction(() =>
        Message.success({
          content: 'Custom icon',
          icon: 'M5 13l4 4L19 7'
        })
      )

      await waitFor(() => {
        const messageElement = getMessageByType('success')
        const svgPath = messageElement?.querySelector('svg path')
        expect(svgPath?.getAttribute('d')).toBe('M5 13l4 4L19 7')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      vi.useFakeTimers()
      await runMessageAction(() =>
        Message.info({
          content: 'Accessible message',
          duration: 0
        })
      )
      await act(async () => {
        vi.advanceTimersByTime(10)
      })
      vi.useRealTimers()

      await waitFor(() => expect(getMessageByType('info')).toBeTruthy())
      await expectNoA11yViolationsIsolated(document.body)
    })

    it('should use role=status for non-error messages', async () => {
      await runMessageAction(() => Message.info('Accessible message'))
      await waitFor(() => {
        const el = getMessageByType('info')
        expect(el?.getAttribute('role')).toBe('status')
      })
    })

    it('should use role=alert for error messages', async () => {
      await runMessageAction(() => Message.error('Error message'))
      await waitFor(() => {
        const el = getMessageByType('error')
        expect(el?.getAttribute('role')).toBe('alert')
      })
    })

    it('close button should have aria-label', async () => {
      await runMessageAction(() =>
        Message.info({
          content: 'Closable',
          closable: true
        })
      )

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="Close message"]')
        expect(closeButton).toBeTruthy()
      })
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      expect(() => Message.clear()).not.toThrow()
    })
  })
})
