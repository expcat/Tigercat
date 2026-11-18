/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Drawer } from '@expcat/tigercat-vue/Drawer'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { h, nextTick } from 'vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  expectNoA11yViolationsIsolated
} from '../utils'

describe('Drawer', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('applies a custom body padding override', async () => {
    renderWithSlots(
      Drawer,
      { default: () => h('div', 'Body') },
      { props: { open: true, title: 'Padded', bodyPadding: false, bodyClassName: 'p-0' } }
    )

    await waitFor(() => {
      const body = document.querySelector('.overflow-y-auto')
      expect(body).toBeTruthy()
      expect(body).toHaveClass('p-0')
      expect(body?.className).not.toContain('px-6')
    })
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
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onUpdateOpen).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalled()
  })

  it('preserves a caller description and otherwise describes the default slot', async () => {
    const { rerender } = render(Drawer, {
      props: { open: true, 'aria-describedby': 'caller-description' },
      slots: { default: 'Drawer content' }
    })
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-describedby', 'caller-description')

    await rerender({ 'aria-describedby': undefined })
    const dialog = screen.getByRole('dialog')
    const body = dialog.querySelector('[data-tiger-drawer-body]')
    expect(body?.id).toBeTruthy()
    expect(dialog).toHaveAttribute('aria-describedby', body?.id)
  })

  it('tabs to the resize separator and resizes along its axis with arrow keys', async () => {
    const user = userEvent.setup()
    const { rerender } = render(Drawer, {
      props: { open: true, resizable: true, width: 90, fullscreenOnMobile: false }
    })
    await nextTick()
    const dialog = screen.getByRole('dialog')
    Object.defineProperty(dialog, 'offsetWidth', { configurable: true, value: 90 })
    const separator = screen.getByRole('separator')
    screen.getByRole('button', { name: 'Close' }).focus()

    await user.tab()
    expect(separator).toHaveFocus()
    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
    await user.keyboard('{ArrowLeft}')
    expect(dialog).toHaveStyle({ width: '100px' })
    expect(separator).toHaveAttribute('aria-valuenow', '100')
    expect(separator).toHaveAttribute('aria-valuemin', '80')
    expect(separator).toHaveAttribute('aria-valuemax', String(window.innerWidth))
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')
    expect(dialog).toHaveStyle({ width: '80px' })

    await rerender({ placement: 'bottom' })
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
    await user.keyboard('{ArrowUp}')
    expect(dialog).toHaveStyle({ height: '90px' })
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(dialog).toHaveStyle({ height: '80px' })
  })

  it('keeps the available resize range while keyboard and pointer changes stay within it', async () => {
    render(Drawer, {
      props: {
        open: true,
        resizable: true,
        width: 90,
        placement: 'bottom',
        fullscreenOnMobile: false
      }
    })
    const dialog = screen.getByRole('dialog')
    const root = dialog.closest('[data-tiger-drawer-root]')!
    Object.defineProperty(root, 'clientHeight', { configurable: true, value: 110 })
    Object.defineProperty(dialog, 'offsetHeight', { configurable: true, value: 90 })
    const separator = screen.getByRole('separator')
    await fireEvent.focus(separator)
    expect(separator).toHaveAttribute('aria-valuemax', '110')

    await fireEvent.keyDown(separator, { key: 'ArrowUp' })
    await fireEvent.keyDown(separator, { key: 'ArrowUp' })
    await fireEvent.keyDown(separator, { key: 'ArrowUp' })
    expect(dialog).toHaveStyle({ height: '110px' })
    expect(separator).toHaveAttribute('aria-valuenow', '110')

    await fireEvent.pointerDown(separator, { button: 0, clientY: 100 })
    await fireEvent.pointerMove(window, { clientY: 200 })
    expect(dialog).toHaveStyle({ height: '80px' })
    expect(separator).toHaveAttribute('aria-valuenow', '80')
    await fireEvent.pointerMove(window, { clientY: 0 })
    await fireEvent.pointerUp(window)
    expect(dialog).toHaveStyle({ height: '110px' })
    expect(separator).toHaveAttribute('aria-valuenow', '110')
    expect(separator).toHaveAttribute('aria-valuemax', '110')
  })

  it('uses official locale objects for the close button', async () => {
    render({
      components: { ConfigProvider, Drawer },
      setup: () => ({ locale: zhCN }),
      template:
        '<ConfigProvider :locale="locale"><Drawer open title="Test Drawer" /></ConfigProvider>'
    })
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument()
  })

  it('uses Traditional Chinese close labels from zhTW', async () => {
    render({
      components: { ConfigProvider, Drawer },
      setup: () => ({ locale: zhTW }),
      template:
        '<ConfigProvider :locale="locale"><Drawer open title="Test Drawer" /></ConfigProvider>'
    })
    expect(screen.getByRole('button', { name: '關閉' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()
  })

  it('names a drawer without a title', async () => {
    render(Drawer, {
      props: { open: true },
      slots: { default: () => h('p', 'Body') }
    })
    expect(screen.getByRole('dialog', { name: 'Drawer' })).toBeInTheDocument()
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
      expect(screen.getByRole('button', { name: 'Close (i18n)' })).toBeInTheDocument()
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Close (i18n)' }))
    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })

  it('should allow overriding close aria-label via labels', async () => {
    render(Drawer, {
      props: {
        open: true,
        title: 'Test Drawer',
        labels: { closeAriaLabel: 'Dismiss drawer' }
      }
    })
    expect(await screen.findByRole('button', { name: 'Dismiss drawer' })).toBeInTheDocument()
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

  it('does not close when mask is hidden and the empty frame is clicked', async () => {
    const onUpdateOpen = vi.fn()
    render(Drawer, {
      props: {
        open: true,
        title: 'Test Drawer',
        mask: false,
        'onUpdate:open': onUpdateOpen
      },
      slots: { default: () => h('p', 'Body') }
    })
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    expect(document.querySelector('[data-tiger-drawer-mask]')).not.toBeInTheDocument()
    fireEvent.click(document.querySelector('[data-tiger-drawer-root]') as Element)
    expect(onUpdateOpen).not.toHaveBeenCalled()
  })

  it('does not close on Escape when keyboard is false', async () => {
    const onUpdateOpen = vi.fn()
    render(Drawer, {
      props: {
        open: true,
        title: 'Test Drawer',
        keyboard: false,
        'onUpdate:open': onUpdateOpen
      }
    })
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.keyDown(document, { key: 'Escape' })
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

  it('keeps a named dialog when fullscreenOnMobile is disabled', async () => {
    render(Drawer, {
      props: { open: true, title: 'Desktop drawer', fullscreenOnMobile: false },
      slots: { default: () => 'content' }
    })
    expect(await screen.findByRole('dialog', { name: 'Desktop drawer' })).toBeInTheDocument()
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
    await fireEvent.touchStart(dialog, { touches: [{ clientX: 330, clientY: 120 }] })
    await fireEvent.touchMove(dialog, { touches: [{ clientX: 260, clientY: 124 }] })
    await fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 260, clientY: 124 }] })
    expect(onUpdateOpen).not.toHaveBeenCalled()

    await fireEvent.touchStart(dialog, { touches: [{ clientX: 260, clientY: 120 }] })
    await fireEvent.touchMove(dialog, { touches: [{ clientX: 330, clientY: 124 }] })
    await fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 330, clientY: 124 }] })

    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })

  it('closes a narrow fullscreen left drawer when swiped in the documented direction', async () => {
    const previousWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
    const onUpdateOpen = vi.fn()
    try {
      render(Drawer, {
        props: {
          open: true,
          title: 'Swipe Drawer',
          placement: 'left',
          'onUpdate:open': onUpdateOpen
        }
      })

      const dialog = screen.getByRole('dialog')
      await fireEvent.touchStart(dialog, { touches: [{ clientX: 40, clientY: 120 }] })
      await fireEvent.touchMove(dialog, { touches: [{ clientX: 120, clientY: 124 }] })
      await fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 120, clientY: 124 }] })

      expect(onUpdateOpen).toHaveBeenCalledWith(false)
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: previousWidth })
    }
  })

  it('does not close a bottom drawer when the body can still scroll', async () => {
    const onUpdateOpen = vi.fn()
    render(Drawer, {
      props: {
        open: true,
        title: 'Swipe Drawer',
        placement: 'bottom',
        'onUpdate:open': onUpdateOpen
      },
      slots: {
        default: () => h('div', { style: 'height: 800px' }, 'Long')
      }
    })

    const body = document.querySelector('[data-tiger-drawer-body]') as HTMLElement
    Object.defineProperty(body, 'scrollTop', { value: 80, configurable: true })
    Object.defineProperty(body, 'clientHeight', { value: 120, configurable: true })
    Object.defineProperty(body, 'scrollHeight', { value: 800, configurable: true })

    await fireEvent.touchStart(body, { touches: [{ clientX: 120, clientY: 160 }] })
    await fireEvent.touchMove(body, { touches: [{ clientX: 124, clientY: 240 }] })
    await fireEvent.touchEnd(body, { changedTouches: [{ clientX: 124, clientY: 240 }] })

    expect(onUpdateOpen).not.toHaveBeenCalled()
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

  it('should trap Tab after opening from closed', async () => {
    const user = userEvent.setup()
    const { rerender } = render(Drawer, {
      props: { open: false, title: 'Focus Drawer' },
      slots: {
        default: () =>
          h('div', [
            h('button', { type: 'button' }, 'First action'),
            h('button', { type: 'button' }, 'Last action')
          ])
      }
    })

    await rerender({ open: true, title: 'Focus Drawer' })

    await waitFor(() => {
      const dialog = document.querySelector('[role="dialog"]')
      expect(dialog).toBeInTheDocument()
      expect(dialog?.contains(document.activeElement)).toBe(true)
    })

    screen.getByText('Last action').focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  it('should restore focus when the open instance is unmounted', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Open drawer'
    document.body.appendChild(trigger)
    trigger.focus()

    const { unmount } = render(Drawer, {
      props: { open: true, title: 'Focus Drawer' },
      slots: {
        default: () => h('button', { type: 'button' }, 'Inside')
      }
    })

    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')?.contains(document.activeElement)).toBe(true)
    })

    unmount()
    await waitFor(() => expect(trigger).toHaveFocus())
    trigger.remove()
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
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
      expect(screen.getByText('Last action')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: 'Close' })
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

  it('should destroy content after close animation when requested', async () => {
    const onAfterClose = vi.fn()
    const { rerender } = render(Drawer, {
      props: {
        open: true,
        destroyOnClose: true,
        onAfterClose
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
      onAfterClose
    })

    await waitFor(
      () => {
        expect(onAfterClose).toHaveBeenCalled()
        expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })

  it('should emit after-enter/after-close after the animation duration', async () => {
    vi.useFakeTimers()
    try {
      const onAfterEnter = vi.fn()
      const onAfterClose = vi.fn()

      const { rerender } = render(Drawer, {
        props: {
          open: true,
          title: 'Test Drawer',
          onAfterEnter,
          onAfterClose
        }
      })

      await nextTick()
      expect(onAfterEnter).toHaveBeenCalled()

      await rerender({
        open: false,
        title: 'Test Drawer',
        onAfterEnter,
        onAfterClose
      })
      expect(onAfterClose).toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('emits after-enter after destroyOnClose mounts the panel and the transition ends', async () => {
    vi.useFakeTimers()
    const view = document.defaultView!
    const readStyle = view.getComputedStyle.bind(view)
    const styleSpy = vi.spyOn(view, 'getComputedStyle').mockImplementation((element: Element) => {
      const style = readStyle(element)
      return new Proxy(style, {
        get(target, prop, receiver) {
          if (prop === 'transitionDuration') return '200ms'
          if (prop === 'transitionDelay') return '0s'
          const value = Reflect.get(target, prop, receiver)
          return typeof value === 'function' ? value.bind(target) : value
        }
      }) as CSSStyleDeclaration
    })
    try {
      const onAfterEnter = vi.fn(() => {
        expect(document.body.contains(document.querySelector('[role="dialog"]'))).toBe(true)
      })
      const { rerender } = render(Drawer, {
        props: { open: true, destroyOnClose: true, onAfterEnter },
        slots: { default: () => h('div', 'Content') }
      })

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(onAfterEnter).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(200)
      expect(onAfterEnter).toHaveBeenCalledTimes(1)

      onAfterEnter.mockClear()
      await rerender({ open: false, destroyOnClose: true, onAfterEnter })
      await vi.advanceTimersByTimeAsync(200)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

      await rerender({ open: true, destroyOnClose: true, onAfterEnter })
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(onAfterEnter).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(200)
      expect(onAfterEnter).toHaveBeenCalledTimes(1)
    } finally {
      styleSpy.mockRestore()
      vi.useRealTimers()
    }
  })

  it('should pass basic accessibility checks', async () => {
    render(Drawer, {
      props: { open: true, resizable: true, title: 'Accessible Drawer' },
      slots: { default: () => h('div', 'Drawer content') }
    })

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await expectNoA11yViolationsIsolated(document.body)
  })

  it('passes axe for untitled, unclosable, and empty drawers', async () => {
    const first = render(Drawer, {
      props: { open: true },
      slots: { default: () => h('p', 'Body') }
    })
    expect(await screen.findByRole('dialog', { name: 'Drawer' })).toBeInTheDocument()
    await expectNoA11yViolations(screen.getByRole('dialog'))
    first.unmount()

    const second = render(Drawer, {
      props: { open: true, title: 'No close', closable: false }
    })
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    await expectNoA11yViolations(screen.getByRole('dialog'))
    second.unmount()

    render(Drawer, { props: { open: true } })
    await expectNoA11yViolations(screen.getByRole('dialog'))
  })

  it('closes a nested drawer before the outer drawer on Escape', async () => {
    const onOuter = vi.fn()
    const onInner = vi.fn()
    render({
      components: { Drawer },
      setup: () => ({ onOuter, onInner }),
      template:
        '<Drawer open title="Outer" @update:open="onOuter"><Drawer open title="Inner" @update:open="onInner">Nested</Drawer></Drawer>'
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

  describe('width prop', () => {
    it('should allow disabling mobile fullscreen classes', () => {
      render(Drawer, {
        props: { open: true, fullscreenOnMobile: false },
        slots: { default: () => 'content' }
      })

      expect(screen.getByRole('dialog')).toHaveTextContent('content')
    })

    it('should apply className and panelStyle to the panel', () => {
      render(Drawer, {
        props: {
          open: true,
          className: 'custom-panel',
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
    it('should apply number width as pixels', () => {
      render(Drawer, {
        props: { open: true, width: 500 }
      })
      const dialog = screen.getByRole('dialog') as HTMLElement
      expect(dialog.style.width).toBe('500px')
    })
  })
})
