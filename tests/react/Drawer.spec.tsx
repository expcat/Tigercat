/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Drawer } from '@tigercat/react'
import { expectNoA11yViolations } from '../utils/react'

describe('Drawer', () => {
  it('should not render when visible is false (initial)', () => {
    render(<Drawer visible={false} title="Test Drawer" />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should render when visible is true', async () => {
    render(
      <Drawer visible={true} title="Test Drawer">
        <div>Drawer Content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Drawer Content')).toBeInTheDocument()
    })
  })

  it('should link aria-labelledby to an existing title element', async () => {
    render(<Drawer visible={true} title="Accessible Drawer" />)

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

    render(<Drawer visible={true} title="Test Drawer" onClose={onClose} />)
    await user.click(screen.getByLabelText('Close drawer'))
    expect(onClose).toHaveBeenCalled()
  })

  it('should allow overriding close aria-label via locale', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Drawer
        visible={true}
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

    render(<Drawer visible={true} title="Test Drawer" onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onClose when mask is clicked (maskClosable=true)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Drawer visible={true} title="Test Drawer" onClose={onClose} />)

    const mask = document.querySelector('[data-tiger-drawer-mask]')
    expect(mask).toBeInTheDocument()
    await user.click(mask as Element)

    expect(onClose).toHaveBeenCalled()
  })

  it('should not call onClose when mask is clicked (maskClosable=false)', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Drawer visible={true} title="Test Drawer" maskClosable={false} onClose={onClose} />)

    const mask = document.querySelector('[data-tiger-drawer-mask]')
    expect(mask).toBeInTheDocument()
    await user.click(mask as Element)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('should apply custom zIndex', async () => {
    render(<Drawer visible={true} title="Test Drawer" zIndex={2000} />)

    await waitFor(() => {
      const root = document.querySelector('[data-tiger-drawer-root]')
      expect(root).toHaveStyle({ zIndex: '2000' })
    })
  })

  it('should keep content mounted (hidden) when destroyOnClose is false', async () => {
    const { rerender } = render(
      <Drawer visible={true} destroyOnClose={false}>
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })

    rerender(
      <Drawer visible={false} destroyOnClose={false}>
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
      <Drawer visible={true} destroyOnClose={true}>
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument()
    })

    rerender(
      <Drawer visible={false} destroyOnClose={true}>
        <div data-testid="drawer-content">Content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('drawer-content')).not.toBeInTheDocument()
    })
  })

  it('should pass basic accessibility checks', async () => {
    render(
      <Drawer visible={true} title="Accessible Drawer">
        <div>Drawer content</div>
      </Drawer>
    )

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    await expectNoA11yViolations(document.body)
  })
})
