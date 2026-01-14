/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { message } from '@tigercat/vue'

const messageTypes = ['success', 'warning', 'error', 'info', 'loading'] as const

async function flushDomUpdates() {
  await nextTick()
  await Promise.resolve()
}

function getMessages() {
  return document.querySelectorAll('[data-tiger-message]')
}

function getMessageByType(type: (typeof messageTypes)[number]) {
  return document.querySelector(`[data-tiger-message][data-tiger-message-type="${type}"]`)
}

describe('Message (Vue)', () => {
  beforeEach(() => {
    // Clear all messages before each test
    message.clear()
    // Clear any existing message containers
    document.body.innerHTML = ''
  })

  afterEach(() => {
    // Clean up after each test
    message.clear()
    document.body.innerHTML = ''
  })

  describe('Basic Functionality', () => {
    it('should show a message when called', async () => {
      message.info('Test message')
      await flushDomUpdates()

      const messageElement = getMessageByType('info')
      expect(messageElement).toBeTruthy()
      expect(messageElement?.textContent).toContain('Test message')
    })

    it('should accept config object as parameter', async () => {
      message.warning({
        content: 'Warning message',
        duration: 5000
      })
      await flushDomUpdates()

      const messageElement = getMessageByType('warning')
      expect(messageElement?.textContent).toContain('Warning message')
    })
  })

  describe('Types', () => {
    it.each(messageTypes)('should show %s type message', async (type) => {
      message[type](`${type} message`)
      await flushDomUpdates()

      const messageElement = getMessageByType(type)
      expect(messageElement).toBeTruthy()
      expect(messageElement?.textContent).toContain(`${type} message`)
    })
  })

  describe('Auto Close', () => {
    it('should auto close after default duration (3000ms)', async () => {
      vi.useFakeTimers()

      message.info('Auto close message')
      await flushDomUpdates()

      // Message should be visible
      expect(getMessages().length).toBe(1)

      // Fast-forward time
      vi.advanceTimersByTime(3000)
      await flushDomUpdates()

      // Message should be removed
      expect(getMessages().length).toBe(0)

      vi.useRealTimers()
    })

    it('should auto close after custom duration', async () => {
      vi.useFakeTimers()

      message.success({
        content: 'Custom duration',
        duration: 1000
      })
      await flushDomUpdates()

      // Message should be visible
      expect(getMessages().length).toBe(1)

      // Fast-forward time
      vi.advanceTimersByTime(1000)
      await flushDomUpdates()

      // Message should be removed
      expect(getMessages().length).toBe(0)

      vi.useRealTimers()
    })

    it('should not auto close when duration is 0', async () => {
      vi.useFakeTimers()

      message.warning({
        content: 'No auto close',
        duration: 0
      })
      await flushDomUpdates()

      // Message should be visible
      expect(getMessages().length).toBe(1)

      // Fast-forward time significantly
      vi.advanceTimersByTime(10000)
      await flushDomUpdates()

      // Message should still be visible
      expect(getMessages().length).toBe(1)

      vi.useRealTimers()
    })

    it('loading type should not auto close by default', async () => {
      vi.useFakeTimers()

      message.loading('Loading...')
      await flushDomUpdates()

      // Message should be visible
      expect(getMessages().length).toBe(1)

      // Fast-forward time
      vi.advanceTimersByTime(5000)
      await flushDomUpdates()

      // Message should still be visible
      expect(getMessages().length).toBe(1)

      vi.useRealTimers()
    })
  })

  describe('Manual Close', () => {
    it('should return a close function', async () => {
      const close = message.info('Closable message')

      expect(typeof close).toBe('function')

      await flushDomUpdates()

      // Message should be visible
      expect(getMessages().length).toBe(1)

      // Call close function
      close()
      await flushDomUpdates()

      // Message should be removed
      expect(getMessages().length).toBe(0)
    })

    it('should show close button when closable is true', async () => {
      message.info({
        content: 'Closable',
        closable: true,
        duration: 0
      })
      await flushDomUpdates()

      const closeButton = document.querySelector('button[aria-label="Close message"]')
      expect(closeButton).toBeTruthy()
    })

    it('should close when close button is clicked', async () => {
      message.info({
        content: 'Closable',
        closable: true,
        duration: 0
      })
      await flushDomUpdates()

      const closeButton = document.querySelector(
        'button[aria-label="Close message"]'
      ) as HTMLButtonElement
      expect(closeButton).toBeTruthy()

      // Click close button
      closeButton?.click()
      await flushDomUpdates()

      // Message should be removed
      expect(getMessages().length).toBe(0)
    })
  })

  describe('Callback', () => {
    it('should call onClose callback when message closes', async () => {
      const onClose = vi.fn()

      const close = message.success({
        content: 'Test',
        onClose
      })

      await nextTick()
      await Promise.resolve()

      // Close manually
      close()
      await flushDomUpdates()

      expect(onClose).toHaveBeenCalled()
    })

    it('should call onClose when auto closed', async () => {
      vi.useFakeTimers()

      const onClose = vi.fn()

      message.info({
        content: 'Test',
        duration: 1000,
        onClose
      })

      await flushDomUpdates()

      // Fast-forward time
      vi.advanceTimersByTime(1000)
      await flushDomUpdates()

      expect(onClose).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('Queue Management', () => {
    it('should show multiple messages', async () => {
      message.info('Message 1')
      message.success('Message 2')
      message.warning('Message 3')

      await flushDomUpdates()

      expect(getMessages().length).toBe(3)
    })

    it('should clear all messages with clear()', async () => {
      message.info('Message 1')
      message.success('Message 2')
      message.warning('Message 3')

      await flushDomUpdates()

      // Messages should be visible
      expect(getMessages().length).toBe(3)

      // Clear all
      message.clear()
      await flushDomUpdates()

      // Messages should be removed
      expect(getMessages().length).toBe(0)
    })

    it('should call onClose for all messages when clearing', async () => {
      const onClose1 = vi.fn()
      const onClose2 = vi.fn()
      const onClose3 = vi.fn()

      message.info({ content: 'Message 1', onClose: onClose1 })
      message.success({ content: 'Message 2', onClose: onClose2 })
      message.warning({ content: 'Message 3', onClose: onClose3 })

      await flushDomUpdates()

      message.clear()
      await nextTick()

      expect(onClose1).toHaveBeenCalled()
      expect(onClose2).toHaveBeenCalled()
      expect(onClose3).toHaveBeenCalled()
    })
  })

  describe('Custom Options', () => {
    it('should support custom className', async () => {
      message.info({
        content: 'Custom class',
        className: 'custom-message-class'
      })

      await flushDomUpdates()

      const messageElement = document.querySelector('.custom-message-class')
      expect(messageElement).toBeTruthy()
    })

    it('should support custom icon', async () => {
      message.success({
        content: 'Custom icon',
        icon: 'M5 13l4 4L19 7'
      })

      await flushDomUpdates()

      const messageElement = getMessageByType('success')
      const svgPath = messageElement?.querySelector('svg path')
      expect(svgPath?.getAttribute('d')).toBe('M5 13l4 4L19 7')
    })
  })

  describe('Accessibility', () => {
    it('should use role=status for non-error messages', async () => {
      message.info('Accessible message')
      await flushDomUpdates()

      const el = getMessageByType('info')
      expect(el?.getAttribute('role')).toBe('status')
    })

    it('should use role=alert for error messages', async () => {
      message.error('Error message')
      await flushDomUpdates()

      const el = getMessageByType('error')
      expect(el?.getAttribute('role')).toBe('alert')
    })

    it('close button should have aria-label', async () => {
      message.info({
        content: 'Closable',
        closable: true
      })
      await flushDomUpdates()

      const closeButton = document.querySelector('button[aria-label="Close message"]')
      expect(closeButton).toBeTruthy()
    })
  })
})
