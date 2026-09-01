/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, it, expect, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Drawer } from '@expcat/tigercat-react/Drawer'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { ANIMATION_DURATION_MS } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations, expectNoA11yViolationsIsolated } from '../utils/react'

describe('Drawer', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('should not render when open is false (initial)', () => {
    render(<Drawer open={false} title="Test Drawer" />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when open is true', async () => {
    render(
      <Drawer open={true} title="Test Drawer">
        <div>Drawer Content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Drawer Content')).toBeInTheDocument()
    })
  })

  it('should link aria-labelledby to an existing title element', async () => {
    render(<Drawer open={true} title="Accessible Drawer" />)

    await waitFor(() => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')

      const labelledby = dialog.getAttribute('aria-labelledby')
      expect(labelledby).toBeTruthy()
      expect(document.getElementById(labelledby!)).toBeInTheDocument()
    })
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Drawer open={true} title="Test Drawer" onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onOpenChange with false when close button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(<Drawer open={true} title="Test Drawer" onOpenChange={onOpenChange} />)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('uses official locale objects for the close button', async () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <Drawer open title="Test Drawer" />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument()
    rerender(
      <ConfigProvider locale={zhTW}>
        <Drawer open title="Test Drawer" />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '關閉' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()
  })

  it('names a drawer without a title', async () => {
    render(
      <Drawer open>
        <p>Body</p>
      </Drawer>
    )
    expect(screen.getByRole('dialog', { name: 'Drawer' })).toBeInTheDocument()
  })

  it('should allow overriding close aria-label via locale', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Drawer
        open={true}
        title="Test Drawer"
        onClose={onClose}
        locale={{ drawer: { closeAriaLabel: 'Close (i18n)' } }}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Close (i18n)' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('should allow overriding close aria-label via labels', async () => {
    render(<Drawer open={true} title="Test Drawer" labels={{ closeAriaLabel: 'Dismiss drawer' }} />)
    expect(screen.getByRole('button', { name: 'Dismiss drawer' })).toBeInTheDocument()
  })

  it('should call onClose on ESC key press', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Drawer open={true} title="Test Drawer" onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onClose when mask is clicked (maskClosable=true)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Drawer open={true} title="Test Drawer" onClose={onClose} />)

    const mask = document.querySelector('[data-tiger-drawer-mask]')
    expect(mask).toBeInTheDocument()
    await user.click(mask as Element)

    expect(onClose).toHaveBeenCalled()
  })

  it('should not call onClose when mask is clicked (maskClosable=false)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Drawer open={true} title="Test Drawer" maskClosable={false} onClose={onClose} />)

    const mask = document.querySelector('[data-tiger-drawer-mask]')
    expect(mask).toBeInTheDocument()
    await user.click(mask as Element)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close when mask is hidden and the empty frame is clicked', async () => {
    const onOpenChange = vi.fn()
    render(
      <Drawer open={true} title="Test Drawer" mask={false} onOpenChange={onOpenChange}>
        <p>Body</p>
      </Drawer>
    )
    await screen.findByRole('dialog')
    expect(document.querySelector('[data-tiger-drawer-mask]')).not.toBeInTheDocument()
    fireEvent.click(document.querySelector('[data-tiger-drawer-root]')!)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('does not close on Escape when keyboard is false', async () => {
    const onOpenChange = vi.fn()
    render(<Drawer open={true} title="Test Drawer" keyboard={false} onOpenChange={onOpenChange} />)
    await screen.findByRole('dialog')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('should apply custom zIndex', async () => {
    render(<Drawer open={true} title="Test Drawer" zIndex={2000} />)

    await waitFor(() => {
      const root = document.querySelector('[data-tiger-drawer-root]')
      expect(root).toHaveStyle({ zIndex: '2000' })
    })
  })

  it('keeps a named dialog when fullscreenOnMobile is disabled', async () => {
    render(
      <Drawer open={true} title="Desktop drawer" fullscreenOnMobile={false}>
        content
      </Drawer>
    )
    expect(await screen.findByRole('dialog', { name: 'Desktop drawer' })).toBeInTheDocument()
  })

  it('should close on outward swipe gesture', async () => {
    const onOpenChange = vi.fn()

    render(
      <Drawer open={true} title="Swipe Drawer" placement="right" onOpenChange={onOpenChange} />
    )

    const dialog = screen.getByRole('dialog')
    fireEvent.touchStart(dialog, { touches: [{ clientX: 260, clientY: 120 }] })
    fireEvent.touchMove(dialog, { touches: [{ clientX: 330, clientY: 124 }] })
    fireEvent.touchEnd(dialog, { changedTouches: [{ clientX: 330, clientY: 124 }] })

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not close a bottom drawer when the body can still scroll', async () => {
    const onOpenChange = vi.fn()
    render(
      <Drawer open={true} title="Swipe Drawer" placement="bottom" onOpenChange={onOpenChange}>
        <div style={{ height: 800 }}>Long</div>
      </Drawer>
    )

    const body = document.querySelector('[data-tiger-drawer-body]') as HTMLElement
    Object.defineProperty(body, 'scrollTop', { value: 80, configurable: true })
    Object.defineProperty(body, 'clientHeight', { value: 120, configurable: true })
    Object.defineProperty(body, 'scrollHeight', { value: 800, configurable: true })

    fireEvent.touchStart(body, { touches: [{ clientX: 120, clientY: 160 }] })
    fireEvent.touchMove(body, { touches: [{ clientX: 124, clientY: 240 }] })
    fireEvent.touchEnd(body, { changedTouches: [{ clientX: 124, clientY: 240 }] })

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('should lock body scroll while open and restore it when closed', async () => {
    const { rerender } = render(<Drawer open={true} title="Test Drawer" />)

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden')
    })

    rerender(<Drawer open={false} title="Test Drawer" />)

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('')
    })
  })

  it('should trap Tab after opening from closed', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Drawer open={open} onOpenChange={setOpen} title="Focus Drawer">
            <button type="button">First action</button>
            <button type="button">Last action</button>
          </Drawer>
        </>
      )
    }

    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = await screen.findByRole('dialog')
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))

    screen.getByText('Last action').focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  it('should restore focus when the open instance is unmounted', async () => {
    const trigger = document.createElement('button')
    trigger.textContent = 'Open drawer'
    document.body.appendChild(trigger)
    trigger.focus()

    const { unmount } = render(
      <Drawer open={true} title="Focus Drawer">
        <button type="button">Inside</button>
      </Drawer>
    )

    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')?.contains(document.activeElement)).toBe(true)
    })

    unmount()
    await waitFor(() => expect(trigger).toHaveFocus())
    trigger.remove()
  })

  it('should trap focus inside the drawer', async () => {
    const user = userEvent.setup()

    render(
      <Drawer open={true} title="Focus Drawer">
        <button type="button">First action</button>
        <button type="button">Last action</button>
      </Drawer>
    )

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
    const { rerender } = render(
      <Drawer open={true} destroyOnClose={false}>
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })

    rerender(
      <Drawer open={false} destroyOnClose={false}>
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    )

    await waitFor(() => {
      const root = document.querySelector('[data-tiger-drawer-root]')
      expect(root).toHaveAttribute('hidden')
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })
  })

  it('should destroy content when destroyOnClose is true', async () => {
    const { rerender } = render(
      <Drawer open={true} destroyOnClose={true}>
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })

    rerender(
      <Drawer open={false} destroyOnClose={true}>
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument()
    })
  })

  it('should destroy content after close animation when requested', async () => {
    const onAfterClose = vi.fn()
    const { rerender } = render(
      <Drawer open={true} destroyOnClose={true} onAfterClose={onAfterClose}>
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })

    rerender(
      <Drawer open={false} destroyOnClose={true} onAfterClose={onAfterClose}>
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    )

    expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    expect(document.querySelector('[data-tiger-drawer-root]')).not.toHaveAttribute('hidden')

    await waitFor(
      () => {
        expect(onAfterClose).toHaveBeenCalled()
        expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })

  it('should fire onAfterEnter/onAfterClose after animation', () => {
    vi.useFakeTimers()
    try {
      const onAfterEnter = vi.fn()
      const onAfterClose = vi.fn()

      const { rerender } = render(
        <Drawer
          open={true}
          title="Test Drawer"
          onAfterEnter={onAfterEnter}
          onAfterClose={onAfterClose}
        />
      )

      expect(onAfterEnter).not.toHaveBeenCalled()
      act(() => {
        vi.advanceTimersByTime(ANIMATION_DURATION_MS)
      })
      expect(onAfterEnter).toHaveBeenCalled()

      rerender(
        <Drawer
          open={false}
          title="Test Drawer"
          onAfterEnter={onAfterEnter}
          onAfterClose={onAfterClose}
        />
      )

      expect(onAfterClose).not.toHaveBeenCalled()
      act(() => {
        vi.advanceTimersByTime(ANIMATION_DURATION_MS)
      })
      expect(onAfterClose).toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('should pass basic accessibility checks', async () => {
    render(
      <Drawer open={true} title="Accessible Drawer">
        <div>Drawer content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await expectNoA11yViolationsIsolated(document.body)
  })

  it('passes axe for untitled, unclosable, and empty drawers', async () => {
    const { rerender } = render(
      <Drawer open>
        <p>Body</p>
      </Drawer>
    )
    expect(await screen.findByRole('dialog', { name: 'Drawer' })).toBeInTheDocument()
    await expectNoA11yViolations(screen.getByRole('dialog'))

    rerender(<Drawer open title="No close" closable={false} />)
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
    await expectNoA11yViolations(screen.getByRole('dialog'))

    rerender(<Drawer open />)
    await expectNoA11yViolations(screen.getByRole('dialog'))
  })

  it('closes a nested drawer before the outer drawer on Escape', async () => {
    const onOuter = vi.fn()
    const onInner = vi.fn()
    render(
      <Drawer open title="Outer" onOpenChange={onOuter}>
        <Drawer open title="Inner" onOpenChange={onInner}>
          Nested
        </Drawer>
      </Drawer>
    )
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
      render(
        <Drawer open={true} fullscreenOnMobile={false}>
          content
        </Drawer>
      )

      expect(screen.getByRole('dialog')).toHaveTextContent('content')
    })

    it('should apply panelClassName and panelStyle to the panel', () => {
      render(
        <Drawer
          open={true}
          panelClassName="custom-panel"
          panelStyle={{ maxWidth: '320px', backgroundColor: 'red' }}>
          content
        </Drawer>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveClass('custom-panel')
      expect(dialog).toHaveStyle({ maxWidth: '320px', backgroundColor: 'red' })
    })

    it('should apply custom width style for right placement', () => {
      render(
        <Drawer open={true} placement="right" width="400px">
          content
        </Drawer>
      )
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      expect(dialog.style.width).toBe('400px')
    })
    it('should apply number width as pixels', () => {
      render(
        <Drawer open={true} width={500}>
          content
        </Drawer>
      )
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement
      expect(dialog.style.width).toBe('500px')
    })
  })
})
