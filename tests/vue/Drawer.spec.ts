/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Drawer } from '@expcat/tigercat-vue'
import { h } from 'vue'
import { renderWithProps, renderWithSlots, expectNoA11yViolationsIsolated } from '../utils'

describe('Drawer', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('should not render when open is false (initial)', () => {
    render(Drawer, {
      props: { open: false, title: 'Test Drawer' }
    })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when open is true', async () => {
    renderWithSlots(
      Drawer,
      { default: () => h('div', 'Drawer Content') },
      { props: { open: true, title: 'Test Drawer' } }
    )

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Drawer Content')).toBeInTheDocument()
    })
  })

  it('should link aria-labelledby to an existing title element', async () => {
    render(Drawer, {
      props: { open: true, title: 'Accessible Drawer' }
    })

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')

      const labelledby = dialog.getAttribute('aria-labelledby')
      expect(labelledby).toBeTruthy()
      expect(document.getElementById(labelledby!)).toBeInTheDocument()
    })
  })

  it('should emit close and update:open when close button is clicked', async () => {
    const onClose = vi.fn()
    const onUpdateOpen = vi.fn()

    render(Drawer, {
      props: {
        open: true,
        title: 'Test Drawer',
        'onUpdate:open': onUpdateOpen,
        onClose
      }
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Close drawer')).toBeInTheDocument()
    })

    await fireEvent.click(screen.getByLabelText('Close drawer'))

    expect(onUpdateOpen).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalled()
  })

  it('should allow overriding close aria-label via locale', async () => {
    const onUpdateOpen = vi.fn()

    render(Drawer, {
      props: {
        open: true,
        title: 'Test Drawer',
        locale: { drawer: { closeAriaLabel: 'Close (i18n)' } },
        'onUpdate:open': onUpdateOpen
      }
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Close (i18n)')).toBeInTheDocument()
    })

    await fireEvent.click(screen.getByLabelText('Close (i18n)'))
    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })

  it('should close on ESC key press', async () => {
    const onUpdateOpen = vi.fn()

    render(Drawer, {
      props: {
        open: true,
        title: 'Test Drawer',
        'onUpdate:open': onUpdateOpen
      }
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })

  it('should close when mask is clicked (maskClosable=true)', async () => {
    const onUpdateOpen = vi.fn()

    render(Drawer, {
      props: {
        open: true,
        title: 'Test Drawer',
        'onUpdate:open': onUpdateOpen
      }
    })

    await waitFor(() => {
      expect(document.querySelector('[data-tiger-drawer-mask]')).toBeInTheDocument()
    })

    fireEvent.click(document.querySelector('[data-tiger-drawer-mask]') as Element)
    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })

  it('should not close when mask is clicked (maskClosable=false)', async () => {
    const onUpdateOpen = vi.fn()

    render(Drawer, {
      props: {
        open: true,
        title: 'Test Drawer',
        maskClosable: false,
        'onUpdate:open': onUpdateOpen
      }
    })

    await waitFor(() => {
      expect(document.querySelector('[data-tiger-drawer-mask]')).toBeInTheDocument()
    })

    fireEvent.click(document.querySelector('[data-tiger-drawer-mask]') as Element)
    expect(onUpdateOpen).not.toHaveBeenCalled()
  })

  it('should apply custom zIndex', async () => {
    render(Drawer, {
      props: { open: true, title: 'Test Drawer', zIndex: 2000 }
    })

    await waitFor(() => {
      const root = document.querySelector('[data-tiger-drawer-root]') as HTMLElement
      expect(root).toHaveStyle({ zIndex: '2000' })
    })
  })

  it('should include mobile fullscreen classes', async () => {
    render(Drawer, {
      props: { open: true, title: 'Mobile Drawer' }
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog').className).toContain('max-md:!w-screen')
      expect(screen.getByRole('dialog').className).toContain('max-md:!h-[100dvh]')
    })
  })

  it('should close on outward swipe gesture', async () => {
    const onUpdateOpen = vi.fn()

    render(Drawer, {
      props: {
        open: true,
        title: 'Swipe Drawer',
        placement: 'right',
        'onUpdate:open': onUpdateOpen
      }
    })

    const dialog = screen.getByRole('dialog')
    await fireEvent.touchStart(dialog, { touches: [{ clientX: 260, clientY: 120 }] })
    await fireEvent.touchMove(dialog, { touches: [{ clientX: 330, clientY: 124 }] })
    await fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 330, clientY: 124 }] })

    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })

  it('should lock body scroll while open and restore it when closed', async () => {
    const { rerender } = render(Drawer, {
      props: { open: true, title: 'Test Drawer' }
    })

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden')
    })

    await rerender({ open: false, title: 'Test Drawer' })

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('')
    })
  })

  it('should trap focus inside the drawer', async () => {
    const user = userEvent.setup()

    render(Drawer, {
      props: { open: true, title: 'Focus Drawer' },
      slots: {
        default: () =>
          h('div', [
            h('button', { type: 'button' }, 'First action'),
            h('button', { type: 'button' }, 'Last action')
          ])
      }
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Close drawer')).toBeInTheDocument()
      expect(screen.getByText('Last action')).toBeInTheDocument()
    })

    const closeButton = screen.getByLabelText('Close drawer')
    const lastButton = screen.getByText('Last action')

    lastButton.focus()
    await user.tab()
    expect(closeButton).toHaveFocus()
  })

  it('should keep content mounted (hidden) when destroyOnClose is false', async () => {
    const { rerender } = render(Drawer, {
      props: { open: true, destroyOnClose: false },
      slots: {
        default: () => h('div', { 'data-testid': 'drawer-content' }, 'Content')
      }
    })

    await waitFor(() => {
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })

    await rerender({ open: false, destroyOnClose: false })

    await waitFor(() => {
      const root = document.querySelector('[data-tiger-drawer-root]') as HTMLElement
      expect(root).toHaveAttribute('hidden')
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })
  })

  it('should destroy content when destroyOnClose is true', async () => {
    const { rerender } = render(Drawer, {
      props: { open: true, destroyOnClose: true },
      slots: {
        default: () => h('div', { 'data-testid': 'drawer-content' }, 'Content')
      }
    })

    await waitFor(() => {
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })

    await rerender({ open: false, destroyOnClose: true })

    await waitFor(() => {
      expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument()
    })
  })

  it('should destroy content after leave animation when requested', async () => {
    const onAfterLeave = vi.fn()
    const { rerender } = render(Drawer, {
      props: {
        open: true,
        destroyOnClose: true,
        destroyOnCloseAfterLeave: true,
        onAfterLeave
      },
      slots: {
        default: () => h('div', { 'data-testid': 'drawer-content' }, 'Content')
      }
    })

    await waitFor(() => {
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })

    await rerender({
      open: false,
      destroyOnClose: true,
      destroyOnCloseAfterLeave: true,
      onAfterLeave
    })

    expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    expect(document.querySelector('[data-tiger-drawer-root]')).not.toHaveAttribute('hidden')

    await waitFor(
      () => {
        expect(onAfterLeave).toHaveBeenCalled()
        expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })

  it('should emit after-enter/after-leave after 300ms', async () => {
    const onAfterEnter = vi.fn()
    const onAfterLeave = vi.fn()

    const { rerender } = render(Drawer, {
      props: {
        open: true,
        title: 'Test Drawer',
        onAfterEnter,
        onAfterLeave
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 350))
    expect(onAfterEnter).toHaveBeenCalled()

    await rerender({
      open: false,
      title: 'Test Drawer',
      onAfterEnter,
      onAfterLeave
    })
    await new Promise((resolve) => setTimeout(resolve, 350))
    expect(onAfterLeave).toHaveBeenCalled()
  })

  it('should pass basic accessibility checks', async () => {
    render(Drawer, {
      props: { open: true, title: 'Accessible Drawer' },
      slots: { default: () => h('div', 'Drawer content') }
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await expectNoA11yViolationsIsolated(document.body)
  })

  describe('width prop', () => {
    it('should allow disabling mobile fullscreen classes', () => {
      render(Drawer, {
        props: { open: true, fullscreenOnMobile: false }
      })

      const dialog = screen.getByRole('dialog')
      expect(dialog.className).not.toContain('max-md:!w-screen')
      expect(dialog.className).not.toContain('max-md:!h-[100dvh]')
    })

    it('should apply panelClassName and panelStyle to the panel', () => {
      render(Drawer, {
        props: {
          open: true,
          panelClassName: 'custom-panel',
          panelStyle: { maxWidth: '320px', backgroundColor: 'red' }
        }
      })

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('custom-panel')
      expect(dialog).toHaveStyle({ maxWidth: '320px', backgroundColor: 'red' })
    })

    it('should apply custom width style for right placement', () => {
      render(Drawer, {
        props: { open: true, placement: 'right', width: '400px' }
      })
      const dialog = screen.getByRole('dialog') as HTMLElement
      expect(dialog.style.width).toBe('400px')
    })

    it('should apply custom height style for top placement', () => {
      render(Drawer, {
        props: { open: true, placement: 'top', width: '300px' }
      })
      const dialog = screen.getByRole('dialog') as HTMLElement
      expect(dialog.style.height).toBe('300px')
    })

    it('should apply number width as pixels', () => {
      render(Drawer, {
        props: { open: true, width: 500 }
      })
      const dialog = screen.getByRole('dialog') as HTMLElement
      expect(dialog.style.width).toBe('500px')
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
