/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Modal } from '@tigercat/react'
import { expectNoA11yViolations } from '../utils/react'

const modalSizes = ['sm', 'md', 'lg', 'xl', 'full'] as const

describe('Modal', () => {
  describe('Rendering', () => {
    it('should not render when visible is false', () => {
      const { container } = render(<Modal visible={false} title="Test Modal" />)

      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
    })

    it('should render when visible is true', async () => {
      render(<Modal visible={true} title="Test Modal" />)

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
      })
    })

    it('should render with title', async () => {
      render(<Modal visible={true} title="Modal Title" />)

      await waitFor(() => {
        expect(screen.getByText('Modal Title')).toBeInTheDocument()
      })
    })

    it('should render children content', async () => {
      render(
        <Modal visible={true}>
          <div>Modal Content</div>
        </Modal>
      )

      await waitFor(() => {
        expect(screen.getByText('Modal Content')).toBeInTheDocument()
      })
    })

    it('should render custom titleContent', async () => {
      render(<Modal visible={true} titleContent={<strong>Custom Title</strong>} />)

      await waitFor(() => {
        expect(screen.getByText('Custom Title')).toBeInTheDocument()
      })
    })

    it('should render footer content when provided', async () => {
      render(<Modal visible={true} footer={<button type="button">Custom Footer</button>} />)

      await waitFor(() => {
        expect(screen.getByText('Custom Footer')).toBeInTheDocument()
      })
    })
  })

  describe('Props', () => {
    it.each(modalSizes)('should render with size %s', async (size) => {
      render(<Modal visible={true} size={size} title="Test Modal" />)

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })
    })

    it('should show close button by default', async () => {
      render(<Modal visible={true} title="Test Modal" />)

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="Close"]')
        expect(closeButton).toBeInTheDocument()
      })
    })

    it('should allow overriding close aria-label via locale', async () => {
      render(
        <Modal
          visible={true}
          title="Test Modal"
          locale={{ modal: { closeAriaLabel: 'Close (i18n)' } }}
        />
      )

      await waitFor(() => {
        expect(screen.getByLabelText('Close (i18n)')).toBeInTheDocument()
      })
    })

    it('should hide close button when closable is false', async () => {
      render(<Modal visible={true} title="Test Modal" closable={false} />)

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      const closeButton = document.querySelector('button[aria-label="Close"]')
      expect(closeButton).not.toBeInTheDocument()
    })

    it('should show mask by default', async () => {
      render(<Modal visible={true} title="Test Modal" />)

      await waitFor(() => {
        const mask = document.querySelector('[data-tiger-modal-mask]')
        expect(mask).toBeInTheDocument()
      })
    })

    it('should hide mask when mask is false', async () => {
      render(<Modal visible={true} title="Test Modal" mask={false} />)

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
      })

      const mask = document.querySelector('[data-tiger-modal-mask]')
      expect(mask).not.toBeInTheDocument()
    })

    it('should apply custom className', async () => {
      render(<Modal visible={true} title="Test Modal" className="custom-modal-class" />)

      await waitFor(() => {
        const dialog = document.querySelector('.custom-modal-class')
        expect(dialog).toBeInTheDocument()
      })
    })

    it('should apply custom zIndex', async () => {
      render(<Modal visible={true} title="Test Modal" zIndex={2000} />)

      await waitFor(() => {
        const wrapper = document.querySelector('.fixed')
        expect(wrapper).toHaveStyle({ zIndex: '2000' })
      })
    })
  })

  describe('Events', () => {
    it('should call onCancel when close button is clicked', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      render(<Modal visible={true} title="Test Modal" onCancel={onCancel} />)

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="Close"]')
        expect(closeButton).toBeInTheDocument()
      })

      const closeButton = document.querySelector('button[aria-label="Close"]')!
      await user.click(closeButton)

      expect(onCancel).toHaveBeenCalled()
    })

    it('should call onCancel when ESC is pressed', async () => {
      const onCancel = vi.fn()

      render(<Modal visible={true} title="Test Modal" onCancel={onCancel} />)

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
      })

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      expect(onCancel).toHaveBeenCalled()
    })

    it('should call onCancel when mask is clicked (maskClosable=true)', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      render(<Modal visible={true} title="Test Modal" maskClosable={true} onCancel={onCancel} />)

      await waitFor(() => {
        const containerEl = document.querySelector('.flex.min-h-full')
        expect(containerEl).toBeInTheDocument()
      })

      const containerEl = document.querySelector('.flex.min-h-full')!
      await user.click(containerEl)

      expect(onCancel).toHaveBeenCalled()
    })

    it('should not call onCancel when mask is clicked (maskClosable=false)', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()

      render(<Modal visible={true} title="Test Modal" maskClosable={false} onCancel={onCancel} />)

      await waitFor(() => {
        const containerEl = document.querySelector('.flex.min-h-full')
        expect(containerEl).toBeInTheDocument()
      })

      const containerEl = document.querySelector('.flex.min-h-full')!
      await user.click(containerEl)

      expect(onCancel).not.toHaveBeenCalled()
    })

    it('should call onClose when modal is closed', async () => {
      const onClose = vi.fn()

      const { rerender } = render(<Modal visible={true} title="Test Modal" onClose={onClose} />)

      rerender(<Modal visible={false} title="Test Modal" onClose={onClose} />)

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('should call onVisibleChange when visibility changes', async () => {
      const onVisibleChange = vi.fn()

      const { rerender } = render(
        <Modal visible={true} title="Test Modal" onVisibleChange={onVisibleChange} />
      )

      expect(onVisibleChange).toHaveBeenCalledWith(true)

      rerender(<Modal visible={false} title="Test Modal" onVisibleChange={onVisibleChange} />)

      await waitFor(() => {
        expect(onVisibleChange).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('States', () => {
    it('should handle centered prop', async () => {
      render(<Modal visible={true} title="Test Modal" centered={true} />)

      await waitFor(() => {
        const containerEl = document.querySelector('.items-center')
        expect(containerEl).toBeInTheDocument()
      })
    })

    it('should handle non-centered prop', async () => {
      render(<Modal visible={true} title="Test Modal" centered={false} />)

      await waitFor(() => {
        const containerEl = document.querySelector('.items-start')
        expect(containerEl).toBeInTheDocument()
      })
    })

    it('should destroy content when destroyOnClose is true and modal is closed', async () => {
      const { rerender } = render(
        <Modal visible={true} destroyOnClose={true}>
          <div data-testid="modal-content">Content</div>
        </Modal>
      )

      await waitFor(() => {
        expect(screen.getByTestId('modal-content')).toBeInTheDocument()
      })

      rerender(
        <Modal visible={false} destroyOnClose={true}>
          <div data-testid="modal-content">Content</div>
        </Modal>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument()
      })
    })

    it('should keep content mounted (hidden) when destroyOnClose is false', async () => {
      const { rerender } = render(
        <Modal visible={true} destroyOnClose={false}>
          <div data-testid="modal-content">Content</div>
        </Modal>
      )

      await waitFor(() => {
        expect(screen.getByTestId('modal-content')).toBeInTheDocument()
      })

      rerender(
        <Modal visible={false} destroyOnClose={false}>
          <div data-testid="modal-content">Content</div>
        </Modal>
      )

      await waitFor(() => {
        const root = document.querySelector('[data-tiger-modal-root]')
        expect(root).toHaveAttribute('hidden')
        expect(screen.getByTestId('modal-content')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      render(<Modal visible={true} title="Test Modal" />)

      await waitFor(() => {
        const dialog = document.querySelector('[role="dialog"]')
        expect(dialog).toBeInTheDocument()
        expect(dialog).toHaveAttribute('aria-modal', 'true')

        const labelledby = dialog?.getAttribute('aria-labelledby')
        expect(labelledby).toBeTruthy()
        expect(document.getElementById(labelledby!)).toBeInTheDocument()
      })
    })

    it('should have close button with aria-label', async () => {
      render(<Modal visible={true} title="Test Modal" />)

      await waitFor(() => {
        const closeButton = document.querySelector('button[aria-label="Close"]')
        expect(closeButton).toBeInTheDocument()
      })
    })

    it('should have mask with aria-hidden', async () => {
      render(<Modal visible={true} title="Test Modal" />)

      await waitFor(() => {
        const mask = document.querySelector('[data-tiger-modal-mask]')
        expect(mask).toBeInTheDocument()
        expect(mask).toHaveAttribute('aria-hidden', 'true')
      })
    })

    it('should pass basic accessibility checks', async () => {
      const { container } = render(<Modal visible={true} title="Accessible Modal" />)

      await waitFor(() => {
        expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
      })

      // Use document.body for accessibility checks since Modal is portaled
      await expectNoA11yViolations(document.body)
    })
  })
})
