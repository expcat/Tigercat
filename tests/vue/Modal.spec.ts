/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { h } from 'vue'
import { Modal } from '@expcat/tigercat-vue/Modal'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Popover } from '@expcat/tigercat-vue/Popover'
import { Select } from '@expcat/tigercat-vue/Select'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  expectNoA11yViolationsIsolated
} from '../utils'

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
      renderWithProps(Modal, {
        open: true,
        title: 'Test Modal'
      })
      expect(await screen.findByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    it('uses official locale objects for close and default footer', async () => {
      const { unmount } = render({
        components: { ConfigProvider, Modal },
        setup: () => ({ locale: zhCN }),
        template:
          '<ConfigProvider :locale="locale"><Modal open title="Test Modal" show-default-footer /></ConfigProvider>'
      })
      expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument()
      unmount()
      render({
        components: { ConfigProvider, Modal },
        setup: () => ({ locale: zhTW }),
        template:
          '<ConfigProvider :locale="locale"><Modal open title="Test Modal" show-default-footer /></ConfigProvider>'
      })
      expect(screen.getByRole('button', { name: '關閉' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()
    })

    it('names a dialog without a title', async () => {
      render(Modal, {
        props: { open: true },
        slots: { default: () => h('p', 'Body') }
      })
      expect(screen.getByRole('dialog', { name: 'Dialog' })).toBeInTheDocument()
    })

    it('should allow overriding close aria-label via labels', async () => {
      renderWithProps(Modal, {
        open: true,
        title: 'Test Modal',
        labels: { closeAriaLabel: 'Dismiss dialog' }
      })
      expect(await screen.findByRole('button', { name: 'Dismiss dialog' })).toBeInTheDocument()
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
      renderWithProps(Modal, {
        open: true,
        title: 'Test Modal',
        closable: false
      })
      expect(await screen.findByRole('dialog')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
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
      renderWithProps(Modal, {
        open: true,
        title: 'Test Modal',
        zIndex: 2000
      })
      await waitFor(() => {
        const wrapper = document.querySelector('[data-tiger-modal-root]')
        expect(wrapper).toHaveStyle({ zIndex: '2000' })
      })
    })

    it('renders a scrollable body when mobileSheet is true', async () => {
      render(Modal, {
        props: { open: true, title: 'Mobile Sheet', mobileSheet: true },
        slots: { default: () => h('p', 'Long sheet') }
      })
      const body = await screen.findByText('Long sheet')
      expect(body.closest('[data-tiger-modal-body]')).toBeInTheDocument()
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

      await user.click(await screen.findByRole('button', { name: 'Close' }))

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

    it('does not close a mobile sheet when the body can still scroll', async () => {
      const onUpdateOpen = vi.fn()
      render(Modal, {
        props: {
          open: true,
          title: 'Swipe Sheet',
          mobileSheet: true,
          'onUpdate:open': onUpdateOpen
        },
        slots: {
          default: () => h('div', { style: 'height: 800px' }, 'Long')
        }
      })

      const body = document.querySelector('[data-tiger-modal-body]') as HTMLElement
      Object.defineProperty(body, 'scrollTop', { value: 80, configurable: true })
      Object.defineProperty(body, 'clientHeight', { value: 120, configurable: true })
      Object.defineProperty(body, 'scrollHeight', { value: 800, configurable: true })

      await fireEvent.touchStart(body, { touches: [{ clientX: 120, clientY: 160 }] })
      await fireEvent.touchMove(body, { touches: [{ clientX: 124, clientY: 240 }] })
      await fireEvent.touchEnd(body, { changedTouches: [{ clientX: 124, clientY: 240 }] })

      expect(onUpdateOpen).not.toHaveBeenCalled()
    })

    it('should emit update:open and cancel when mask is clicked (maskClosable=true)', async () => {
      const user = userEvent.setup()
      const onUpdateOpen = vi.fn()
      const onCancel = vi.fn()

      render(Modal, {
        props: {
          open: true,
          title: 'Test Modal',
          maskClosable: true,
          'onUpdate:open': onUpdateOpen,
          onCancel
        }
      })

      const mask = await waitFor(() => {
        const node = document.querySelector('[data-tiger-modal-mask]')
        expect(node).toBeInTheDocument()
        return node as HTMLElement
      })

      await user.click(mask)
      expect(onUpdateOpen).toHaveBeenCalledWith(false)
      expect(onCancel).toHaveBeenCalled()
    })

    it('should not emit events when mask is clicked (maskClosable=false)', async () => {
      const user = userEvent.setup()
      const onUpdateOpen = vi.fn()
      const onCancel = vi.fn()

      render(Modal, {
        props: {
          open: true,
          title: 'Test Modal',
          maskClosable: false,
          'onUpdate:open': onUpdateOpen,
          onCancel
        }
      })

      const mask = await waitFor(() => {
        const node = document.querySelector('[data-tiger-modal-mask]')
        expect(node).toBeInTheDocument()
        return node as HTMLElement
      })

      await user.click(mask)
      expect(onUpdateOpen).not.toHaveBeenCalled()
      expect(onCancel).not.toHaveBeenCalled()
    })

    it('does not close when mask is hidden and the empty frame is clicked', async () => {
      const onUpdateOpen = vi.fn()
      render(Modal, {
        props: {
          open: true,
          title: 'Test Modal',
          mask: false,
          'onUpdate:open': onUpdateOpen
        },
        slots: { default: () => h('p', 'Body') }
      })

      await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeInTheDocument())
      expect(document.querySelector('[data-tiger-modal-mask]')).not.toBeInTheDocument()
      await fireEvent.click(document.querySelector('[data-tiger-modal-root]')!)
      expect(onUpdateOpen).not.toHaveBeenCalled()
    })

    it('does not close on Escape when keyboard is false', async () => {
      const onUpdateOpen = vi.fn()
      render(Modal, {
        props: {
          open: true,
          title: 'Test Modal',
          keyboard: false,
          'onUpdate:open': onUpdateOpen
        }
      })
      await waitFor(() => expect(document.querySelector('[role="dialog"]')).toBeInTheDocument())
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(onUpdateOpen).not.toHaveBeenCalled()
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
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
        expect(dialog?.contains(document.activeElement)).toBe(true)
      })

      await rerender({ open: false })

      await waitFor(() => expect(trigger).toHaveFocus())
      trigger.remove()
    })

    it('should restore focus when the open instance is unmounted', async () => {
      const trigger = document.createElement('button')
      trigger.textContent = 'Open modal'
      document.body.appendChild(trigger)
      trigger.focus()

      const { unmount } = render(Modal, {
        props: {
          open: true,
          title: 'Test Modal'
        }
      })

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')?.contains(document.activeElement)).toBe(
          true
        )
      })

      unmount()
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

      expect(document.querySelector('[data-testid="modal-content"]')).toBeInTheDocument()
      expect(document.querySelector('[data-tiger-modal-root]')).not.toHaveAttribute('hidden')

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
      renderWithProps(Modal, {
        open: true,
        title: 'Test Modal'
      })
      expect(await screen.findByRole('button', { name: 'Close' })).toBeInTheDocument()
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
      renderWithProps(Modal, {
        open: true,
        title: 'Accessible Modal'
      })
      expect(await screen.findByRole('dialog')).toBeInTheDocument()
      await expectNoA11yViolationsIsolated(document.body)
    })

    it('passes axe for untitled, unclosable, and empty dialogs', async () => {
      const { unmount } = render(Modal, {
        props: { open: true },
        slots: { default: () => h('p', 'Body') }
      })
      expect(await screen.findByRole('dialog', { name: 'Dialog' })).toBeInTheDocument()
      await expectNoA11yViolations(screen.getByRole('dialog'))
      unmount()

      const second = renderWithProps(Modal, { open: true, title: 'No close', closable: false })
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
      await expectNoA11yViolations(screen.getByRole('dialog'))
      second.unmount()

      renderWithProps(Modal, { open: true })
      await expectNoA11yViolations(screen.getByRole('dialog'))
    })
  })

  describe('Focus Trap', () => {
    it('should trap Tab after opening from closed', async () => {
      const user = userEvent.setup()
      const { rerender } = render(Modal, {
        props: {
          open: false,
          title: 'Focus Trap Test',
          showDefaultFooter: true
        },
        slots: {
          default: '<input data-testid="modal-input" />'
        }
      })

      await rerender({
        open: true,
        title: 'Focus Trap Test',
        showDefaultFooter: true
      })

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
        expect(dialog?.contains(document.activeElement)).toBe(true)
      })

      const dialog = document.querySelector('[role="dialog"]')!
      const focusableElements = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstFocusable = focusableElements[0] as HTMLElement
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

      lastFocusable.focus()
      await user.tab()
      expect(firstFocusable).toHaveFocus()
    })

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

      await fireEvent.click(dialog.querySelector('[role="combobox"]')!)
      const listbox = await screen.findByRole('listbox')

      const selectLayer = listbox.closest('[data-tiger-overlay-layer]')
      expect(selectLayer?.parentElement).toBe(host)
      expect(selectLayer?.querySelector(':scope > [data-tiger-overlay-host]')).toBeInTheDocument()
      expect(host?.closest('[data-tiger-overlay-layer]')).toBeInTheDocument()
    })

    it('closes a nested modal before the outer modal on Escape', async () => {
      const onOuter = vi.fn()
      const onInner = vi.fn()
      render({
        components: { Modal },
        setup: () => ({ onOuter, onInner }),
        template:
          '<Modal open title="Outer" @update:open="onOuter"><Modal open title="Inner" @update:open="onInner">Nested</Modal></Modal>'
      })
      const inner = await screen.findByRole('dialog', { name: 'Inner' })
      const outer = screen.getByRole('dialog', { name: 'Outer' })
      expect(inner.closest('[inert]')).toBeNull()
      await waitFor(() => {
        expect(inner.closest('[data-tiger-overlay-host]')?.id).toBe(outer.getAttribute('aria-owns'))
      })
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }))
      expect(onInner).toHaveBeenCalledWith(false)
      expect(onOuter).not.toHaveBeenCalled()
    })

    it('closes a default-open nested overlay before the modal on Escape', async () => {
      const user = userEvent.setup()
      const { emitted } = render(Modal, {
        props: { open: true, title: 'Parent modal' },
        slots: {
          default: () =>
            h(
              Popover,
              { defaultOpen: true },
              {
                default: () => h('button', 'Nested trigger'),
                content: () => 'Nested popover'
              }
            )
        }
      })

      expect(await screen.findByText('Nested popover')).toBeVisible()
      await user.keyboard('{Escape}')

      await waitFor(() => expect(screen.queryByText('Nested popover')).toBeNull())
      expect(screen.getByRole('dialog', { name: 'Parent modal' })).toBeVisible()
      expect(emitted()['update:open']).toBeFalsy()
    })
  })
})
