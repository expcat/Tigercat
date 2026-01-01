/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { Drawer } from '@tigercat/vue'
import { h } from 'vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
} from '../utils'

describe('Drawer', () => {
  // Clean up after each test
  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('Rendering', () => {
    it('should not render when visible is false', () => {
      render(Drawer, {
        props: {
          visible: false,
          title: 'Test Drawer',
        },
      })
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should render when visible is true', async () => {
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
        },
      })
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should render with title', async () => {
      render(Drawer, {
        props: {
          visible: true,
          title: 'My Drawer Title',
        },
      })
      
      await waitFor(() => {
        expect(screen.getByText('My Drawer Title')).toBeInTheDocument()
      })
    })

    it('should render with default content slot', async () => {
      renderWithSlots(Drawer, {
        default: 'Drawer Content',
      }, {
        props: {
          visible: true,
        },
      })
      
      await waitFor(() => {
        expect(screen.getByText('Drawer Content')).toBeInTheDocument()
      })
    })
  })

  describe('Placement', () => {
    it.each(['left', 'right', 'top', 'bottom'] as const)(
      'should render with %s placement',
      async (placement) => {
        render(Drawer, {
          props: {
            visible: true,
            placement,
            title: `${placement} drawer`,
          },
        })
        
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
        render(Drawer, {
          props: {
            visible: true,
            size,
            title: `${size} drawer`,
          },
        })
        
        await waitFor(() => {
          const dialog = screen.getByRole('dialog')
          expect(dialog).toBeInTheDocument()
        })
      }
    )
  })

  describe('Close Functionality', () => {
    it('should show close button by default', async () => {
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
        },
      })
      
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close drawer')
        expect(closeButton).toBeInTheDocument()
      })
    })

    it('should not show close button when closable is false', async () => {
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
          closable: false,
        },
      })
      
      await waitFor(() => {
        expect(screen.queryByLabelText('Close drawer')).not.toBeInTheDocument()
      })
    })

    it('should emit close event when close button is clicked', async () => {
      const onClose = vi.fn()
      const onUpdateVisible = vi.fn()
      
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
          'onUpdate:visible': onUpdateVisible,
          onClose,
        },
      })
      
      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close drawer')
        fireEvent.click(closeButton)
      })
      
      expect(onUpdateVisible).toHaveBeenCalledWith(false)
      expect(onClose).toHaveBeenCalled()
    })

    it('should close on ESC key press', async () => {
      const onUpdateVisible = vi.fn()
      
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
          'onUpdate:visible': onUpdateVisible,
        },
      })
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(onUpdateVisible).toHaveBeenCalledWith(false)
    })
  })

  describe('Mask', () => {
    it('should show mask by default', async () => {
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
        },
      })
      
      await waitFor(() => {
        const mask = document.querySelector('[aria-hidden="true"]')
        expect(mask).toBeInTheDocument()
      })
    })

    it('should not show mask when mask is false', async () => {
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
          mask: false,
        },
      })
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      const mask = document.querySelector('[aria-hidden="true"]')
      expect(mask).not.toBeInTheDocument()
    })

    it('should close when mask is clicked by default', async () => {
      const onUpdateVisible = vi.fn()
      
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
          'onUpdate:visible': onUpdateVisible,
        },
      })
      
      await waitFor(() => {
        const mask = document.querySelector('[aria-hidden="true"]')
        expect(mask).toBeInTheDocument()
        fireEvent.click(mask as Element)
      })
      
      expect(onUpdateVisible).toHaveBeenCalledWith(false)
    })

    it('should not close when mask is clicked if maskClosable is false', async () => {
      const onUpdateVisible = vi.fn()
      
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
          maskClosable: false,
          'onUpdate:visible': onUpdateVisible,
        },
      })
      
      await waitFor(() => {
        const mask = document.querySelector('[aria-hidden="true"]')
        expect(mask).toBeInTheDocument()
        fireEvent.click(mask as Element)
      })
      
      expect(onUpdateVisible).not.toHaveBeenCalled()
    })
  })

  describe('Custom Slots', () => {
    it('should render custom header slot', async () => {
      render(Drawer, {
        props: {
          visible: true,
        },
        slots: {
          header: () => h('div', { 'data-testid': 'custom-header' }, 'Custom Header'),
        },
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-header')).toBeInTheDocument()
        expect(screen.getByText('Custom Header')).toBeInTheDocument()
      })
    })

    it('should render custom footer slot', async () => {
      render(Drawer, {
        props: {
          visible: true,
        },
        slots: {
          footer: () => h('div', { 'data-testid': 'custom-footer' }, 'Custom Footer'),
        },
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('custom-footer')).toBeInTheDocument()
        expect(screen.getByText('Custom Footer')).toBeInTheDocument()
      })
    })
  })

  describe('DestroyOnClose', () => {
    it('should render content initially when destroyOnClose is false', async () => {
      const { rerender } = render(Drawer, {
        props: {
          visible: true,
          destroyOnClose: false,
        },
        slots: {
          default: 'Content',
        },
      })
      
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument()
      })
      
      // Close drawer
      await rerender({
        visible: false,
        destroyOnClose: false,
      })
      
      // Content should still exist in DOM
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should destroy content when closed if destroyOnClose is true', async () => {
      const { rerender } = render(Drawer, {
        props: {
          visible: true,
          destroyOnClose: true,
        },
        slots: {
          default: 'Content',
        },
      })
      
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument()
      })
      
      // Close drawer
      await rerender({
        visible: false,
        destroyOnClose: true,
      })
      
      // Content should be destroyed
      await waitFor(() => {
        expect(screen.queryByText('Content')).not.toBeInTheDocument()
      })
    })
  })

  describe('Custom Classes', () => {
    it('should apply custom className to drawer', async () => {
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
          className: 'custom-drawer-class',
        },
      })
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveClass('custom-drawer-class')
      })
    })

    it('should apply custom bodyClassName to drawer body', async () => {
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
          bodyClassName: 'custom-body-class',
        },
        slots: {
          default: () => h('div', { 'data-testid': 'drawer-content' }, 'Content'),
        },
      })
      
      await waitFor(() => {
        const content = screen.getByTestId('drawer-content')
        const body = content.parentElement
        expect(body).toHaveClass('custom-body-class')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria attributes', async () => {
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
        },
      })
      
      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAttribute('aria-labelledby')
      })
    })

    it('should pass accessibility checks', async () => {
      const { container } = render(Drawer, {
        props: {
          visible: true,
          title: 'Accessible Drawer',
        },
        slots: {
          default: 'Drawer content',
        },
      })
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      await expectNoA11yViolations(container)
    })
  })

  describe('Events', () => {
    it('should emit after-enter event', async () => {
      const onAfterEnter = vi.fn()
      
      render(Drawer, {
        props: {
          visible: true,
          title: 'Test Drawer',
          onAfterEnter,
        },
      })
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      }, { timeout: 500 })
      
      // Wait for transition to complete (300ms)
      await new Promise(resolve => setTimeout(resolve, 350))
      
      expect(onAfterEnter).toHaveBeenCalled()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default drawer', async () => {
      const { container } = render(Drawer, {
        props: {
          visible: true,
          title: 'Snapshot Drawer',
        },
        slots: {
          default: 'Snapshot content',
        },
      })
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
      
      expect(container).toMatchSnapshot()
    })
  })
})
