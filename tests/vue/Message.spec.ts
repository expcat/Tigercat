/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { message } from '@tigercat/vue'

const messageTypes = ['success', 'warning', 'error', 'info', 'loading'] as const

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
      await nextTick()
      
      // Wait for container to be created
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      expect(messageElement?.textContent).toContain('Test message')
    })

    it('should accept string as parameter', async () => {
      message.success('Success message')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement?.textContent).toContain('Success message')
    })

    it('should accept config object as parameter', async () => {
      message.warning({
        content: 'Warning message',
        duration: 5000,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement?.textContent).toContain('Warning message')
    })
  })

  describe('Types', () => {
    it.each(messageTypes)('should show %s type message', async (type) => {
      message[type](`${type} message`)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      expect(messageElement?.textContent).toContain(`${type} message`)
    })

    it('should apply correct color scheme for success type', async () => {
      message.success('Success')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement?.className).toContain('green')
    })

    it('should apply correct color scheme for error type', async () => {
      message.error('Error')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement?.className).toContain('red')
    })
  })

  describe('Auto Close', () => {
    it('should auto close after default duration (3000ms)', async () => {
      vi.useFakeTimers()
      
      message.info('Auto close message')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Message should be visible
      let messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      // Fast-forward time
      vi.advanceTimersByTime(3000)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Message should be removed
      messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeFalsy()
      
      vi.useRealTimers()
    })

    it('should auto close after custom duration', async () => {
      vi.useFakeTimers()
      
      message.success({
        content: 'Custom duration',
        duration: 1000,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Message should be visible
      let messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      // Fast-forward time
      vi.advanceTimersByTime(1000)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Message should be removed
      messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeFalsy()
      
      vi.useRealTimers()
    })

    it('should not auto close when duration is 0', async () => {
      vi.useFakeTimers()
      
      message.warning({
        content: 'No auto close',
        duration: 0,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Message should be visible
      let messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      // Fast-forward time significantly
      vi.advanceTimersByTime(10000)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Message should still be visible
      messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      vi.useRealTimers()
    })

    it('loading type should not auto close by default', async () => {
      vi.useFakeTimers()
      
      message.loading('Loading...')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Message should be visible
      let messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      // Fast-forward time
      vi.advanceTimersByTime(5000)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Message should still be visible
      messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      vi.useRealTimers()
    })
  })

  describe('Manual Close', () => {
    it('should return a close function', async () => {
      const close = message.info('Closable message')
      
      expect(typeof close).toBe('function')
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Message should be visible
      let messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      // Call close function
      close()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Message should be removed
      messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeFalsy()
    })

    it('should show close button when closable is true', async () => {
      message.info({
        content: 'Closable',
        closable: true,
        duration: 0,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const closeButton = document.querySelector('button[aria-label="Close message"]')
      expect(closeButton).toBeTruthy()
    })

    it('should close when close button is clicked', async () => {
      message.info({
        content: 'Closable',
        closable: true,
        duration: 0,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const closeButton = document.querySelector('button[aria-label="Close message"]') as HTMLButtonElement
      expect(closeButton).toBeTruthy()
      
      // Click close button
      closeButton?.click()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Message should be removed
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeFalsy()
    })
  })

  describe('Callback', () => {
    it('should call onClose callback when message closes', async () => {
      const onClose = vi.fn()
      
      const close = message.success({
        content: 'Test',
        onClose,
      })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Close manually
      close()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(onClose).toHaveBeenCalled()
    })

    it('should call onClose when auto closed', async () => {
      vi.useFakeTimers()
      
      const onClose = vi.fn()
      
      message.info({
        content: 'Test',
        duration: 1000,
        onClose,
      })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Fast-forward time
      vi.advanceTimersByTime(1000)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(onClose).toHaveBeenCalled()
      
      vi.useRealTimers()
    })
  })

  describe('Queue Management', () => {
    it('should show multiple messages', async () => {
      message.info('Message 1')
      message.success('Message 2')
      message.warning('Message 3')
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const messages = document.querySelectorAll('[role="alert"]')
      expect(messages.length).toBe(3)
    })

    it('should clear all messages with clear()', async () => {
      message.info('Message 1')
      message.success('Message 2')
      message.warning('Message 3')
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Messages should be visible
      let messages = document.querySelectorAll('[role="alert"]')
      expect(messages.length).toBe(3)
      
      // Clear all
      message.clear()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Messages should be removed
      messages = document.querySelectorAll('[role="alert"]')
      expect(messages.length).toBe(0)
    })

    it('should call onClose for all messages when clearing', async () => {
      const onClose1 = vi.fn()
      const onClose2 = vi.fn()
      const onClose3 = vi.fn()
      
      message.info({ content: 'Message 1', onClose: onClose1 })
      message.success({ content: 'Message 2', onClose: onClose2 })
      message.warning({ content: 'Message 3', onClose: onClose3 })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
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
        className: 'custom-message-class',
      })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const messageElement = document.querySelector('.custom-message-class')
      expect(messageElement).toBeTruthy()
    })

    it('should support custom icon', async () => {
      message.success({
        content: 'Custom icon',
        icon: 'M5 13l4 4L19 7',
      })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const svg = document.querySelector('svg path')
      expect(svg?.getAttribute('d')).toBe('M5 13l4 4L19 7')
    })
  })

  describe('Accessibility', () => {
    it('should have role="alert"', async () => {
      message.info('Accessible message')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
    })

    it('close button should have aria-label', async () => {
      message.info({
        content: 'Closable',
        closable: true,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const closeButton = document.querySelector('button[aria-label="Close message"]')
      expect(closeButton).toBeTruthy()
    })
  })
})
