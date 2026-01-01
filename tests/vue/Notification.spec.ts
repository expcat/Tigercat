/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { notification } from '@tigercat/vue'

const notificationTypes = ['success', 'warning', 'error', 'info'] as const
const notificationPositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const

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

  describe('Basic Functionality', () => {
    it('should show a notification when called', async () => {
      notification.info('Test notification')
      await nextTick()
      
      // Wait for container to be created
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement).toBeTruthy()
      expect(notificationElement?.textContent).toContain('Test notification')
    })

    it('should accept string as parameter (title only)', async () => {
      notification.success('Success notification')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement?.textContent).toContain('Success notification')
    })

    it('should accept config object as parameter', async () => {
      notification.warning({
        title: 'Warning notification',
        description: 'This is a warning description',
        duration: 5000,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement?.textContent).toContain('Warning notification')
      expect(notificationElement?.textContent).toContain('This is a warning description')
    })

    it('should return a close function', async () => {
      const close = notification.info('Test notification')
      expect(typeof close).toBe('function')
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      let notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement).toBeTruthy()
      
      // Close the notification
      close()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement).toBeFalsy()
    })
  })

  describe('Types', () => {
    notificationTypes.forEach(type => {
      it(`should show ${type} notification`, async () => {
        notification[type]({
          title: `${type} notification`,
          description: `This is a ${type} notification`,
        })
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const notificationElement = document.querySelector('[role="alert"]')
        expect(notificationElement).toBeTruthy()
        expect(notificationElement?.textContent).toContain(`${type} notification`)
      })
    })
  })

  describe('Positions', () => {
    notificationPositions.forEach(position => {
      it(`should show notification at ${position}`, async () => {
        notification.info({
          title: 'Test notification',
          position,
        })
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const container = document.getElementById(`tiger-notification-container-${position}`)
        expect(container).toBeTruthy()
        
        const notificationElement = container?.querySelector('[role="alert"]')
        expect(notificationElement).toBeTruthy()
      })
    })
  })

  describe('Duration and Auto-close', () => {
    it('should auto-close after specified duration', async () => {
      notification.info({
        title: 'Auto-close notification',
        duration: 100,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 50))
      
      let notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement).toBeTruthy()
      
      // Wait for auto-close
      await new Promise(resolve => setTimeout(resolve, 150))
      
      notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement).toBeFalsy()
    })

    it('should not auto-close when duration is 0', async () => {
      notification.info({
        title: 'Persistent notification',
        duration: 0,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement).toBeTruthy()
      
      // Wait to verify it doesn't auto-close
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const stillExisting = document.querySelector('[role="alert"]')
      expect(stillExisting).toBeTruthy()
    })
  })

  describe('Closable', () => {
    it('should show close button when closable is true', async () => {
      notification.info({
        title: 'Closable notification',
        closable: true,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const closeButton = document.querySelector('[aria-label="Close notification"]')
      expect(closeButton).toBeTruthy()
    })

    it('should not show close button when closable is false', async () => {
      notification.info({
        title: 'Non-closable notification',
        closable: false,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const closeButton = document.querySelector('[aria-label="Close notification"]')
      expect(closeButton).toBeFalsy()
    })

    it('should close notification when close button is clicked', async () => {
      notification.info({
        title: 'Closable notification',
        closable: true,
        duration: 0,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const closeButton = document.querySelector('[aria-label="Close notification"]') as HTMLElement
      expect(closeButton).toBeTruthy()
      
      closeButton?.click()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement).toBeFalsy()
    })
  })

  describe('Callbacks', () => {
    it('should call onClose callback when notification is closed', async () => {
      const onClose = vi.fn()
      
      const close = notification.info({
        title: 'Test notification',
        onClose,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      close()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClick callback when notification is clicked', async () => {
      const onClick = vi.fn()
      
      notification.info({
        title: 'Clickable notification',
        onClick,
        duration: 0,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notificationElement = document.querySelector('[role="alert"]') as HTMLElement
      expect(notificationElement).toBeTruthy()
      
      notificationElement?.click()
      await nextTick()
      
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Clear Notifications', () => {
    it('should clear all notifications', async () => {
      notification.info('Notification 1')
      notification.success('Notification 2')
      notification.warning('Notification 3')
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      let notifications = document.querySelectorAll('[role="alert"]')
      expect(notifications.length).toBeGreaterThan(0)
      
      notification.clear()
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      notifications = document.querySelectorAll('[role="alert"]')
      expect(notifications.length).toBe(0)
    })

    it('should clear notifications for specific position', async () => {
      notification.info({ title: 'Top-right 1', position: 'top-right' })
      notification.success({ title: 'Top-left 1', position: 'top-left' })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      let notifications = document.querySelectorAll('[role="alert"]')
      expect(notifications.length).toBe(2)
      
      notification.clear('top-right')
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      notifications = document.querySelectorAll('[role="alert"]')
      expect(notifications.length).toBe(1)
      
      const remainingNotification = document.querySelector('[role="alert"]')
      expect(remainingNotification?.textContent).toContain('Top-left 1')
    })
  })

  describe('Multiple Notifications', () => {
    it('should show multiple notifications at the same position', async () => {
      notification.info({ title: 'Notification 1', position: 'top-right' })
      notification.success({ title: 'Notification 2', position: 'top-right' })
      notification.warning({ title: 'Notification 3', position: 'top-right' })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notifications = document.querySelectorAll('[role="alert"]')
      expect(notifications.length).toBe(3)
    })

    it('should show notifications at different positions independently', async () => {
      notification.info({ title: 'Top-right', position: 'top-right' })
      notification.success({ title: 'Top-left', position: 'top-left' })
      notification.warning({ title: 'Bottom-right', position: 'bottom-right' })
      notification.error({ title: 'Bottom-left', position: 'bottom-left' })
      
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notifications = document.querySelectorAll('[role="alert"]')
      expect(notifications.length).toBe(4)
      
      // Check containers exist for all positions
      notificationPositions.forEach(position => {
        const container = document.getElementById(`tiger-notification-container-${position}`)
        expect(container).toBeTruthy()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      notification.info({
        title: 'Accessible notification',
        description: 'This notification is accessible',
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement).toBeTruthy()
      expect(notificationElement?.getAttribute('role')).toBe('alert')
      expect(notificationElement?.getAttribute('aria-live')).toBe('assertive')
      expect(notificationElement?.getAttribute('aria-atomic')).toBe('true')
    })

    it('should have aria-label on close button', async () => {
      notification.info({
        title: 'Closable notification',
        closable: true,
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const closeButton = document.querySelector('[aria-label="Close notification"]')
      expect(closeButton).toBeTruthy()
      expect(closeButton?.getAttribute('aria-label')).toBe('Close notification')
    })
  })

  describe('Content', () => {
    it('should display title only', async () => {
      notification.info({
        title: 'Title only',
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement?.textContent).toContain('Title only')
    })

    it('should display title and description', async () => {
      notification.info({
        title: 'Title with description',
        description: 'This is the description content',
      })
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const notificationElement = document.querySelector('[role="alert"]')
      expect(notificationElement?.textContent).toContain('Title with description')
      expect(notificationElement?.textContent).toContain('This is the description content')
    })
  })
})
