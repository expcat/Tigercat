/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Drawer } from '@tigercat/react'
import {
  renderWithProps,
  renderWithChildren,
  expectNoA11yViolations,
} from '../utils'

describe('Drawer', () => {
  // Clean up after each test
  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('Rendering', () => {
    it('should not render when visible is false', () => {
      render(<Drawer visible={false} title="Test Drawer" />)
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render when visible is true', async () => {
      render(<Drawer visible={true} title="Test Drawer" />)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should render with title', async () => {
      render(<Drawer visible={true} title="My Drawer Title" />)
      
      await waitFor(() => {
        expect(screen.getByText('My Drawer Title')).toBeInTheDocument()
      })
    })

    it('should render with children content', async () => {
      render(
        <Drawer visible={true} title="Test Drawer">
          <div>Drawer Content</div>
        </Drawer>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Drawer Content')).toBeInTheDocument()
      })
    })
  })

  describe('Placement', () => {
    it.each(['left', 'right', 'top', 'bottom'] as const)(
      'should render with %s placement',
      async (placement) => {
        render(
          <Drawer visible={true} placement={placement} title={`${placement} drawer`} />
        )
        
        await waitFor(() => {
          const dialog = screen.getByRole('dialog')
          expect(dialog).toBeInTheDocument()
        })
      }
    )
  })

  describe('Size', () => {
    it.each(['sm', 'md', 'lg', 'xl', 'full'] as const)(
      'should render with %s size',
      async (size) => {
        render(
          <Drawer visible={true} size={size} title={`${size} drawer`} />
        )
        
        await waitFor(() => {
          const dialog = screen.getByRole('dialog')
          expect(dialog).toBeInTheDocument()
        })
      }
    )
  })

  describe('Close Functionality', () => {
    it('should show close button by default', async () => {
      render(<Drawer visible={true} title="Test Drawer" />)
      
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close drawer')
        expect(closeButton).toBeInTheDocument()
      })
    })

    it('should not show close button when closable is false', async () => {
      render(<Drawer visible={true} title="Test Drawer" closable={false} />)
      
      await waitFor(() => {
        expect(screen.queryByLabelText('Close drawer')).not.toBeInTheDocument()
      })
    })

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      render(<Drawer visible={true} title="Test Drawer" onClose={onClose} />)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Close drawer')).toBeInTheDocument()
      })
      
      const closeButton = screen.getByLabelText('Close drawer')
      await user.click(closeButton)
      
      expect(onClose).toHaveBeenCalled()
    })

    it('should call onClose on ESC key press', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      render(<Drawer visible={true} title="Test Drawer" onClose={onClose} />)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      await user.keyboard('{Escape}')
      
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Mask', () => {
    it('should show mask by default', async () => {
      render(<Drawer visible={true} title="Test Drawer" />)
      
      await waitFor(() => {
        const mask = document.querySelector('[aria-hidden="true"]')
        expect(mask).toBeInTheDocument()
      })
    })

    it('should not show mask when mask is false', async () => {
      render(<Drawer visible={true} title="Test Drawer" mask={false} />)
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      const mask = document.querySelector('[aria-hidden="true"]')
      expect(mask).not.toBeInTheDocument()
    })

    it('should call onClose when mask is clicked by default', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      render(<Drawer visible={true} title="Test Drawer" onClose={onClose} />)
      
      await waitFor(() => {
        const mask = document.querySelector('[aria-hidden="true"]')
        expect(mask).toBeInTheDocument()
      })
      
      const mask = document.querySelector('[aria-hidden="true"]')
      await user.click(mask as Element)
      
      expect(onClose).toHaveBeenCalled()
    })

    it('should not call onClose when mask is clicked if maskClosable is false', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      render(
        <Drawer visible={true} title="Test Drawer" maskClosable={false} onClose={onClose} />
      )
      
      await waitFor(() => {
        const mask = document.querySelector('[aria-hidden="true"]')
        expect(mask).toBeInTheDocument()
      })
      
      const mask = document.querySelector('[aria-hidden="true"]')
      await user.click(mask as Element)
      
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Custom Content', () => {
    it('should render custom header', async () => {
      render(
        <Drawer
          visible={true}
          header={<div data-testid="custom-header">Custom Header</div>}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-header')).toBeInTheDocument()
        expect(screen.getByText('Custom Header')).toBeInTheDocument()
      })
    })

    it('should render custom footer', async () => {
      render(
        <Drawer
          visible={true}
          title="Test Drawer"
          footer={<div data-testid="custom-footer">Custom Footer</div>}
        />
      )
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-footer')).toBeInTheDocument()
        expect(screen.getByText('Custom Footer')).toBeInTheDocument()
      })
    })
  })

  describe('DestroyOnClose', () => {
    it('should render content initially when destroyOnClose is false', async () => {
      const { rerender } = render(
        <Drawer visible={true} destroyOnClose={false}>
          <div>Content</div>
        </Drawer>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument()
      })
      
      // Close drawer
      rerender(
        <Drawer visible={false} destroyOnClose={false}>
          <div>Content</div>
        </Drawer>
      )
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should destroy content when closed if destroyOnClose is true', async () => {
      const { rerender } = render(
        <Drawer visible={true} destroyOnClose={true}>
          <div>Content</div>
        </Drawer>
      )
      
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument()
      })
      
      // Close drawer
      rerender(
        <Drawer visible={false} destroyOnClose={true}>
          <div>Content</div>
        </Drawer>
      )
      
      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument()
      })
    })
  })

  describe('Custom Classes', () => {
    it('should apply custom className to drawer', async () => {
      render(
        <Drawer visible={true} title="Test Drawer" className="custom-drawer-class" />
      )
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveClass('custom-drawer-class')
      })
    })

    it('should apply custom bodyClassName to drawer body', async () => {
      render(
        <Drawer visible={true} title="Test Drawer" bodyClassName="custom-body-class">
          <div data-testid="drawer-content">Content</div>
        </Drawer>
      )
      
      await waitFor(() => {
        const content = screen.getByTestId('drawer-content')
        const body = content.parentElement
        expect(body).toHaveClass('custom-body-class')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria attributes', async () => {
      render(<Drawer visible={true} title="Test Drawer" />)
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAttribute('aria-labelledby')
      })
    })

    it('should pass accessibility checks', async () => {
      const { container } = render(
        <Drawer visible={true} title="Accessible Drawer">
          <div>Drawer content</div>
        </Drawer>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      await expectNoA11yViolations(container)
    })
  })

  describe('Events', () => {
    it('should call onAfterEnter after drawer opens', async () => {
      const onAfterEnter = vi.fn()
      
      render(
        <Drawer visible={true} title="Test Drawer" onAfterEnter={onAfterEnter} />
      )
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      }, { timeout: 500 })
      
      // Wait for transition to complete (300ms)
      await new Promise(resolve => setTimeout(resolve, 350))
      
      expect(onAfterEnter).toHaveBeenCalled()
    })

    it('should call onAfterLeave after drawer closes', async () => {
      const onAfterLeave = vi.fn()
      
      const { rerender } = render(
        <Drawer visible={true} title="Test Drawer" onAfterLeave={onAfterLeave} />
      )
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      // Close drawer
      rerender(
        <Drawer visible={false} title="Test Drawer" onAfterLeave={onAfterLeave} />
      )
      
      // Wait for transition to complete (300ms)
      await new Promise(resolve => setTimeout(resolve, 350))
      
      expect(onAfterLeave).toHaveBeenCalled()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default drawer', async () => {
      const { container } = render(
        <Drawer visible={true} title="Snapshot Drawer">
          <div>Snapshot content</div>
        </Drawer>
      )
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      expect(container).toMatchSnapshot()
    })
  })
})
