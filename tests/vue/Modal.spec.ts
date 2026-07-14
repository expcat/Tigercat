/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { h } from 'vue'
import { Modal, Select } from '@expcat/tigercat-vue'
import { renderWithProps, renderWithSlots, expectNoA11yViolationsIsolated } from '../utils'

describe('Modal', () => {
  describe('Rendering', () => {
    it('should not render when open is false', () => {
      const { container } = renderWithProps(Modal, {
        open: false,
        title: 'Test Modal'
      })

      expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
    })

    it('should render when open is true', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal'
      })

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
      })
    })

    it('should render with title', async () => {
      renderWithProps(Modal, {
        open: true,
        title: 'Modal Title'
      })

      await waitFor(() => {
        expect(screen.getByText('Modal Title')).toBeInTheDocument()
      })
    })

    it('should render default slot content', async () => {
      const { getByText } = renderWithSlots(
        Modal,
        {
          default: 'Modal Content'
        },
        {
          open: true
        }
      )

      await waitFor(() => {
        expect(getByText('Modal Content')).toBeInTheDocument()
      })
    })

    it('should render custom title slot', async () => {
      const { getByText } = renderWithSlots(
        Modal,
        {
          title: '<strong>Custom Title</strong>'
        },
        {
          open: true
        }
      )

      await waitFor(() => {
        expect(getByText('Custom Title')).toBeInTheDocument()
      })
    })

    it('should render footer slot', async () => {
      const { getByText } = renderWithSlots(
        Modal,
        {
          default: 'Content',
          footer: '<button>Custom Footer</button>'
        },
        {
          open: true
        }
      )

      await waitFor(() => {
        expect(getByText('Custom Footer')).toBeInTheDocument()
      })
    })
  })

  describe('Props', () => {
    it('should show close button by default', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal'
      })

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="Close"]')
        expect(closeButton).toBeInTheDocument()
      })
    })

    it('should allow overriding ok/cancel via locale when using default footer', async () => {
      renderWithProps(Modal, {
        open: true,
        title: 'Test Modal',
        showDefaultFooter: true,
        locale: {
          common: { okText: 'OK (i18n)', cancelText: 'Cancel (i18n)' }
        }
      })

      await waitFor(() => {
        expect(screen.getByText('OK (i18n)')).toBeInTheDocument()
        expect(screen.getByText('Cancel (i18n)')).toBeInTheDocument()
      })
    })

    it('should hide close button when closable is false', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal',
        closable: false
      })

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="Close"]')
        expect(closeButton).not.toBeInTheDocument()
      })
    })

    it('should show mask by default', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal'
      })

      await waitFor(() => {
        const mask = document.querySelector('[data-tiger-modal-mask]')
        expect(mask).toBeInTheDocument()
      })
    })

    it('should hide mask when mask is false', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal',
        mask: false
      })

      await waitFor(() => {
        const mask = document.querySelector('[data-tiger-modal-mask]')
        expect(mask).not.toBeInTheDocument()
      })
    })

    it('should apply custom className', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal',
        className: 'custom-modal-class'
      })

      await waitFor(() => {
        const dialog = document.querySelector('.custom-modal-class')
        expect(dialog).toBeInTheDocument()
      })
    })

    it('should apply custom zIndex', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal',
        zIndex: 2000
      })

      await waitFor(() => {
        const wrapper = document.querySelector('.fixed')
        expect(wrapper).toHaveStyle({ zIndex: '2000' })
      })
    })

    it('should include mobile sheet classes when mobileSheet is true', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Mobile Sheet',
        mobileSheet: true
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]') as HTMLElement
        expect(dialog.className).toContain('max-md:fixed')
        expect(dialog.className).toContain('max-md:bottom-0')
      })
    })
  })

  describe('Events', () => {
    it('should emit update:open, cancel, and close when close button is clicked', async () => {
      const user = userEvent.setup()
      const onUpdateOpen = vi.fn()
      const onCancel = vi.fn()
      const onClose = vi.fn()

      const { container } = render(Modal, {
        props: {
          open: true,
          title: 'Test Modal',
          'onUpdate:open': onUpdateOpen,
          onCancel,
          onClose
        }
      })

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="Close"]')
        expect(closeButton).toBeInTheDocument()
      })

      const closeButton = document.querySelector('button[aria-label="Close"]')!
      await user.click(closeButton)

      expect(onUpdateOpen).toHaveBeenCalledWith(false)
      expect(onCancel).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })

    it('should emit update:open and cancel when mobile sheet is swiped down', async () => {
      const onUpdateOpen = vi.fn()
      const onCancel = vi.fn()

      const { container } = render(Modal, {
        props: {
          open: true,
          title: 'Swipe Sheet',
          mobileSheet: true,
          'onUpdate:open': onUpdateOpen,
          onCancel
        }
      })

      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      await fireEvent.touchStart(dialog, { touches: [{ clientX: 120, clientY: 160 }] })
      await fireEvent.touchMove(dialog, { touches: [{ clientX: 124, clientY: 240 }] })
      await fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 124, clientY: 240 }] })

      expect(onUpdateOpen).toHaveBeenCalledWith(false)
      expect(onCancel).toHaveBeenCalled()
    })

    it('should emit update:open and cancel when mask is clicked (maskClosable=true)', async () => {
      const user = userEvent.setup()
      const onUpdateOpen = vi.fn()
      const onCancel = vi.fn()

      const { container } = render(Modal, {
        props: {
          open: true,
          title: 'Test Modal',
          maskClosable: true,
          'onUpdate:open': onUpdateOpen,
          onCancel
        }
      })

      await waitFor(() => {
        const containerEl = document.querySelector('.flex.min-h-full')
        expect(containerEl).toBeInTheDocument()
      })

      const containerEl = document.querySelector('.flex.min-h-full')!
      await user.click(containerEl)

      expect(onUpdateOpen).toHaveBeenCalledWith(false)
      expect(onCancel).toHaveBeenCalled()
    })

    it('should not emit events when mask is clicked (maskClosable=false)', async () => {
      const user = userEvent.setup()
      const onUpdateOpen = vi.fn()
      const onCancel = vi.fn()

      const { container } = render(Modal, {
        props: {
          open: true,
          title: 'Test Modal',
          maskClosable: false,
          'onUpdate:open': onUpdateOpen,
          onCancel
        }
      })

      await waitFor(() => {
        const containerEl = document.querySelector('.flex.min-h-full')
        expect(containerEl).toBeInTheDocument()
      })

      const containerEl = document.querySelector('.flex.min-h-full')!
      await user.click(containerEl)

      expect(onUpdateOpen).not.toHaveBeenCalled()
      expect(onCancel).not.toHaveBeenCalled()
    })

    it('should not emit close event when open changes externally', async () => {
      const onClose = vi.fn()

      const { rerender } = render(Modal, {
        props: {
          open: true,
          title: 'Test Modal',
          onClose
        }
      })

      await rerender({ open: false })

      expect(onClose).not.toHaveBeenCalled()
    })

    it('should emit after-close when external close lifecycle completes', async () => {
      vi.useFakeTimers()
      try {
        const onAfterClose = vi.fn()
        const { rerender } = render(Modal, {
          props: {
            open: true,
            title: 'Test Modal',
            onAfterClose
          }
        })

        await rerender({ open: false, onAfterClose })
        await vi.runOnlyPendingTimersAsync()

        expect(onAfterClose).toHaveBeenCalled()
      } finally {
        vi.useRealTimers()
      }
    })

    it('should restore focus to trigger after close', async () => {
      const trigger = document.createElement('button')
      trigger.textContent = 'Open modal'
      document.body.appendChild(trigger)
      trigger.focus()

      const { rerender } = render(Modal, {
        props: {
          open: true,
          title: 'Test Modal'
        }
      })

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
      })

      await rerender({ open: false })

      await waitFor(() => expect(trigger).toHaveFocus())
      trigger.remove()
    })

    it('should emit cancel when ESC is pressed', async () => {
      const onCancel = vi.fn()

      const { container } = render(Modal, {
        props: {
          open: true,
          title: 'Test Modal',
          onCancel
        }
      })

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
      })

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('States', () => {
    it('should handle centered prop', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal',
        centered: true
      })

      await waitFor(() => {
        const containerEl = document.querySelector('.items-center')
        expect(containerEl).toBeInTheDocument()
      })
    })

    it('should handle non-centered prop', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal',
        centered: false
      })

      await waitFor(() => {
        const containerEl = document.querySelector('.items-start')
        expect(containerEl).toBeInTheDocument()
      })
    })

    it('should destroy content when destroyOnClose is true and modal is closed', async () => {
      const { container, rerender } = render(Modal, {
        props: {
          open: true,
          destroyOnClose: true
        },
        slots: {
          default: '<div data-testid="modal-content">Content</div>'
        }
      })

      await waitFor(() => {
        expect(document.querySelector('[data-testid="modal-content"]')).toBeInTheDocument()
      })

      await rerender({
        open: false,
        destroyOnClose: true
      })

      await waitFor(() => {
        expect(document.querySelector('[data-testid="modal-content"]')).not.toBeInTheDocument()
      })
    })

    it('should keep content mounted (hidden) when destroyOnClose is false', async () => {
      const { container, rerender } = render(Modal, {
        props: {
          open: true,
          destroyOnClose: false
        },
        slots: {
          default: '<div data-testid="modal-content">Content</div>'
        }
      })

      await waitFor(() => {
        expect(document.querySelector('[data-testid="modal-content"]')).toBeInTheDocument()
      })

      await rerender({
        open: false,
        destroyOnClose: false
      })

      await waitFor(() => {
        const root = document.querySelector('[data-tiger-modal-root]')
        expect(root).toHaveAttribute('hidden')
        expect(document.querySelector('[data-testid="modal-content"]')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal'
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
        expect(dialog).toHaveAttribute('aria-modal', 'true')

        const labelledby = dialog?.getAttribute('aria-labelledby')
        expect(labelledby).toBeTruthy()
        expect(document.querySelector(`#${labelledby}`)).toBeInTheDocument()
      })
    })

    it('should have close button with aria-label', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal'
      })

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="Close"]')
        expect(closeButton).toBeInTheDocument()
      })
    })

    it('should have mask with aria-hidden', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Test Modal'
      })

      await waitFor(() => {
        const mask = document.querySelector('[data-tiger-modal-mask]')
        expect(mask).toBeInTheDocument()
        expect(mask).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('should pass basic accessibility checks', async () => {
      const { container } = renderWithProps(Modal, {
        open: true,
        title: 'Accessible Modal'
      })

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
      })

      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Focus Trap', () => {
    it('should trap focus within modal on Tab key', async () => {
      const user = userEvent.setup()
      const { container } = render(Modal, {
        props: {
          open: true,
          title: 'Focus Trap Test',
          showDefaultFooter: true
        }
      })

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
      })

      const dialog = document.querySelector('[role="dialog"]')!
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      expect(focusableElements.length).toBeGreaterThan(0)

      // Focus first element and Tab to last
      const firstFocusable = focusableElements[0] as HTMLElement
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

      firstFocusable.focus()
      expect(document.activeElement).toBe(firstFocusable)

      // Tab through all elements
      for (let i = 1; i < focusableElements.length; i++) {
        await user.tab()
      }

      // After last element, Tab should wrap to first
      await user.tab()
      expect(document.activeElement).toBe(firstFocusable)
    })

    it('should trap focus on Shift+Tab from first element', async () => {
      const user = userEvent.setup()
      const { container } = render(Modal, {
        props: {
          open: true,
          title: 'Focus Trap Test',
          showDefaultFooter: true
        }
      })

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
      })

      const dialog = document.querySelector('[role="dialog"]')!
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      expect(focusableElements.length).toBeGreaterThan(0)

      const firstFocusable = focusableElements[0] as HTMLElement
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

      firstFocusable.focus()
      expect(document.activeElement).toBe(firstFocusable)

      // Shift+Tab from first should go to last
      await user.tab({ shift: true })
      expect(document.activeElement).toBe(lastFocusable)
    })
  })

  describe('width prop', () => {
    it('should apply custom width style when width is a string', () => {
      const { container } = render(Modal, {
        props: { open: true, width: '600px' }
      })
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      expect(dialog.style.width).toBe('600px')
    })

    it('should apply custom width as pixels when width is a number', () => {
      const { container } = render(Modal, {
        props: { open: true, width: 800 }
      })
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      expect(dialog.style.width).toBe('800px')
    })
  })

  describe('anchored overlay layer', () => {
    it('owns a layer host and teleports nested anchored overlays into it', async () => {
      render(Modal, {
        props: { open: true, title: 'Layer host' },
        slots: {
          default: () => h(Select, { options: [{ label: 'Option', value: 'option' }] })
        }
      })

      const dialog = await screen.findByRole('dialog')
      const hostId = dialog.getAttribute('aria-owns')
      const host = hostId ? document.getElementById(hostId) : null
      expect(host).toHaveAttribute('data-tiger-overlay-host')

      await fireEvent.click(dialog.querySelector('button[data-state="closed"]')!)
      const listbox = await screen.findByRole('listbox')

      expect(listbox.parentElement).toBe(host)
      expect(host?.closest('[data-tiger-overlay-layer]')).toBeInTheDocument()
    })
  })
})
