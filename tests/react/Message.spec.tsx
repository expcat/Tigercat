/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { message } from '@tigercat/react'

const messageTypes = ['success', 'warning', 'error', 'info', 'loading'] as const

describe('Message (React)', () => {
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
      await act(async () => {
        message.info('Test message')
        // Wait for container to be created
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      expect(messageElement?.textContent).toContain('Test message')
    })

    it('should accept string as parameter', async () => {
      await act(async () => {
        message.success('Success message')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement?.textContent).toContain('Success message')
    })

    it('should accept config object as parameter', async () => {
      await act(async () => {
        message.warning({
          content: 'Warning message',
          duration: 5000,
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement?.textContent).toContain('Warning message')
    })
  })

  describe('Types', () => {
    it.each(messageTypes)('should show %s type message', async (type) => {
      await act(async () => {
        message[type](`${type} message`)
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      expect(messageElement?.textContent).toContain(`${type} message`)
    })

    it('should apply correct color scheme for success type', async () => {
      await act(async () => {
        message.success('Success')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement?.className).toContain('green')
    })

    it('should apply correct color scheme for error type', async () => {
      await act(async () => {
        message.error('Error')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement?.className).toContain('red')
    })
  })

  describe('Auto Close', () => {
    it('should auto close after default duration (3000ms)', async () => {
      vi.useFakeTimers()
      
      await act(async () => {
        message.info('Auto close message')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Message should be visible
      let messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      // Fast-forward time
      await act(async () => {
        vi.advanceTimersByTime(3000)
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Message should be removed
      messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeFalsy()
      
      vi.useRealTimers()
    })

    it('should auto close after custom duration', async () => {
      vi.useFakeTimers()
      
      await act(async () => {
        message.success({
          content: 'Custom duration',
          duration: 1000,
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Message should be visible
      let messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      // Fast-forward time
      await act(async () => {
        vi.advanceTimersByTime(1000)
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Message should be removed
      messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeFalsy()
      
      vi.useRealTimers()
    })

    it('should not auto close when duration is 0', async () => {
      vi.useFakeTimers()
      
      await act(async () => {
        message.warning({
          content: 'No auto close',
          duration: 0,
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Message should be visible
      let messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      // Fast-forward time significantly
      await act(async () => {
        vi.advanceTimersByTime(10000)
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Message should still be visible
      messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      vi.useRealTimers()
    })

    it('loading type should not auto close by default', async () => {
      vi.useFakeTimers()
      
      await act(async () => {
        message.loading('Loading...')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Message should be visible
      let messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      // Fast-forward time
      await act(async () => {
        vi.advanceTimersByTime(5000)
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Message should still be visible
      messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      vi.useRealTimers()
    })
  })

  describe('Manual Close', () => {
    it('should return a close function', async () => {
      let close: (() => void) | undefined
      
      await act(async () => {
        close = message.info('Closable message')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      expect(typeof close).toBe('function')
      
      // Message should be visible
      let messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
      
      // Call close function
      await act(async () => {
        close?.()
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Message should be removed
      messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeFalsy()
    })

    it('should show close button when closable is true', async () => {
      await act(async () => {
        message.info({
          content: 'Closable',
          closable: true,
          duration: 0,
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const closeButton = document.querySelector('button[aria-label="Close message"]')
      expect(closeButton).toBeTruthy()
    })

    it('should close when close button is clicked', async () => {
      await act(async () => {
        message.info({
          content: 'Closable',
          closable: true,
          duration: 0,
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const closeButton = document.querySelector('button[aria-label="Close message"]') as HTMLButtonElement
      expect(closeButton).toBeTruthy()
      
      // Click close button
      await act(async () => {
        closeButton?.click()
        await new Promise(resolve => setTimeout(resolve, 400))
      })
      
      // Message should be removed
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeFalsy()
    })
  })

  describe('Callback', () => {
    it('should call onClose callback when message closes', async () => {
      const onClose = vi.fn()
      let close: (() => void) | undefined
      
      await act(async () => {
        close = message.success({
          content: 'Test',
          onClose,
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Close manually
      await act(async () => {
        close?.()
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      expect(onClose).toHaveBeenCalled()
    })

    it('should call onClose when auto closed', async () => {
      vi.useFakeTimers()
      
      const onClose = vi.fn()
      
      await act(async () => {
        message.info({
          content: 'Test',
          duration: 1000,
          onClose,
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Fast-forward time
      await act(async () => {
        vi.advanceTimersByTime(1000)
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      expect(onClose).toHaveBeenCalled()
      
      vi.useRealTimers()
    })
  })

  describe('Queue Management', () => {
    it('should show multiple messages', async () => {
      await act(async () => {
        message.info('Message 1')
        message.success('Message 2')
        message.warning('Message 3')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const messages = document.querySelectorAll('[role="alert"]')
      expect(messages.length).toBe(3)
    })

    it('should clear all messages with clear()', async () => {
      await act(async () => {
        message.info('Message 1')
        message.success('Message 2')
        message.warning('Message 3')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Messages should be visible
      let messages = document.querySelectorAll('[role="alert"]')
      expect(messages.length).toBe(3)
      
      // Clear all
      await act(async () => {
        message.clear()
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      // Messages should be removed
      messages = document.querySelectorAll('[role="alert"]')
      expect(messages.length).toBe(0)
    })

    it('should call onClose for all messages when clearing', async () => {
      const onClose1 = vi.fn()
      const onClose2 = vi.fn()
      const onClose3 = vi.fn()
      
      await act(async () => {
        message.info({ content: 'Message 1', onClose: onClose1 })
        message.success({ content: 'Message 2', onClose: onClose2 })
        message.warning({ content: 'Message 3', onClose: onClose3 })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      await act(async () => {
        message.clear()
      })
      
      expect(onClose1).toHaveBeenCalled()
      expect(onClose2).toHaveBeenCalled()
      expect(onClose3).toHaveBeenCalled()
    })
  })

  describe('Custom Options', () => {
    it('should support custom className', async () => {
      await act(async () => {
        message.info({
          content: 'Custom class',
          className: 'custom-message-class',
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const messageElement = document.querySelector('.custom-message-class')
      expect(messageElement).toBeTruthy()
    })

    it('should support custom icon', async () => {
      await act(async () => {
        message.success({
          content: 'Custom icon',
          icon: 'M5 13l4 4L19 7',
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const svg = document.querySelector('svg path')
      expect(svg?.getAttribute('d')).toBe('M5 13l4 4L19 7')
    })
  })

  describe('Accessibility', () => {
    it('should have role="alert"', async () => {
      await act(async () => {
        message.info('Accessible message')
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const messageElement = document.querySelector('[role="alert"]')
      expect(messageElement).toBeTruthy()
    })

    it('close button should have aria-label', async () => {
      await act(async () => {
        message.info({
          content: 'Closable',
          closable: true,
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const closeButton = document.querySelector('button[aria-label="Close message"]')
      expect(closeButton).toBeTruthy()
    })
  })
})
