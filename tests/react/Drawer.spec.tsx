/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Drawer } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
    await user.click(screen.getByLabelText('Close drawer'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onOpenChange with false when close button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(<Drawer open={true} title="Test Drawer" onOpenChange={onOpenChange} />)
    await user.click(screen.getByLabelText('Close drawer'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
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

    await user.click(screen.getByLabelText('Close (i18n)'))
    expect(onClose).toHaveBeenCalled()
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

  it('should apply custom zIndex', async () => {
    render(<Drawer open={true} title="Test Drawer" zIndex={2000} />)

    await waitFor(() => {
      const root = document.querySelector('[data-tiger-drawer-root]')
      expect(root).toHaveStyle({ zIndex: '2000' })
    })
  })

  it('should include mobile fullscreen classes', async () => {
    render(<Drawer open={true} title="Mobile Drawer" />)

    await waitFor(() => {
      expect(screen.getByRole('dialog').className).toContain('max-md:!w-screen')
      expect(screen.getByRole('dialog').className).toContain('max-md:!h-[100dvh]')
    })
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

  it('should trap focus inside the drawer', async () => {
    const user = userEvent.setup()

    render(
      <Drawer open={true} title="Focus Drawer">
        <button type="button">First action</button>
        <button type="button">Last action</button>
      </Drawer>
    )

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
      <Drawer open={true} destroyOnClose={true} deferDestroyOnClose onAfterClose={onAfterClose}>
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })

    rerender(
      <Drawer open={false} destroyOnClose={true} deferDestroyOnClose onAfterClose={onAfterClose}>
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

  it('should fire onAfterEnter/onAfterClose after animation', async () => {
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

    await new Promise((resolve) => setTimeout(resolve, 350))
    expect(onAfterEnter).toHaveBeenCalled()

    rerender(
      <Drawer
        open={false}
        title="Test Drawer"
        onAfterEnter={onAfterEnter}
        onAfterClose={onAfterClose}
      />
    )

    await new Promise((resolve) => setTimeout(resolve, 350))
    expect(onAfterClose).toHaveBeenCalled()
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

  describe('width prop', () => {
    it('should allow disabling mobile fullscreen classes', () => {
      render(
        <Drawer open={true} fullscreenOnMobile={false}>
          content
        </Drawer>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog.className).not.toContain('max-md:!w-screen')
      expect(dialog.className).not.toContain('max-md:!h-[100dvh]')
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
