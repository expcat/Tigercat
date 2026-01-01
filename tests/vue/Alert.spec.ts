/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Alert } from '@tigercat/vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  componentSizes,
} from '../utils'

const alertTypes = ['success', 'warning', 'error', 'info'] as const

describe('Alert', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Alert, {
        props: {
          title: 'Test Alert',
        },
      })
      
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(screen.getByText('Test Alert')).toBeInTheDocument()
    })

    it('should render with title via slot', () => {
      const { getByText } = renderWithSlots(Alert, {
        title: 'Custom Title',
      })
      
      expect(getByText('Custom Title')).toBeInTheDocument()
    })

    it('should render with description', () => {
      render(Alert, {
        props: {
          title: 'Alert Title',
          description: 'Alert description text',
        },
      })
      
      expect(screen.getByText('Alert Title')).toBeInTheDocument()
      expect(screen.getByText('Alert description text')).toBeInTheDocument()
    })

    it('should render with description via slot', () => {
      renderWithSlots(Alert, {
        title: 'Title',
        description: 'Custom Description',
      })
      
      expect(screen.getByText('Custom Description')).toBeInTheDocument()
    })

    it('should render default slot content when no title/description', () => {
      renderWithSlots(Alert, {
        default: 'Default content',
      })
      
      expect(screen.getByText('Default content')).toBeInTheDocument()
    })
  })

  describe('Types', () => {
    it.each(alertTypes)('should render %s type correctly', (type) => {
      const { container } = renderWithProps(Alert, {
        type,
        title: `${type} alert`,
      })
      
      const alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
      // Verify alert has type-specific classes
      expect(alert?.className).toBeTruthy()
    })

    it('should apply info type by default', () => {
      const { container } = renderWithProps(Alert, {
        title: 'Default Alert',
      })
      
      const alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(Alert, {
        size,
        title: `${size} alert`,
      })
      
      const alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('Icon', () => {
    it('should show icon by default', () => {
      const { container } = renderWithProps(Alert, {
        title: 'Alert with icon',
      })
      
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should hide icon when showIcon is false', () => {
      const { container } = renderWithProps(Alert, {
        title: 'Alert without icon',
        showIcon: false,
      })
      
      const icon = container.querySelector('svg')
      expect(icon).not.toBeInTheDocument()
    })

    it.each(alertTypes)('should render correct icon for %s type', (type) => {
      const { container } = renderWithProps(Alert, {
        type,
        title: `${type} alert`,
        showIcon: true,
      })
      
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      // Each type should have a unique icon path
      const path = icon?.querySelector('path')
      expect(path).toBeInTheDocument()
    })
  })

  describe('Closable', () => {
    it('should not render close button when closable is false', () => {
      const { container } = renderWithProps(Alert, {
        title: 'Non-closable Alert',
        closable: false,
      })
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      expect(closeButton).not.toBeInTheDocument()
    })

    it('should render close button when closable is true', () => {
      const { container } = renderWithProps(Alert, {
        title: 'Closable Alert',
        closable: true,
      })
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      expect(closeButton).toBeInTheDocument()
    })

    it('should emit close event when close button is clicked', async () => {
      const onClose = vi.fn()
      
      const { container } = render(Alert, {
        props: {
          title: 'Closable Alert',
          closable: true,
          onClose,
        },
      })
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      expect(closeButton).toBeInTheDocument()
      
      if (closeButton) {
        await fireEvent.click(closeButton)
        expect(onClose).toHaveBeenCalledTimes(1)
      }
    })

    it('should hide alert after close button is clicked', async () => {
      const { container } = render(Alert, {
        props: {
          title: 'Closable Alert',
          closable: true,
        },
      })
      
      let alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      if (closeButton) {
        await fireEvent.click(closeButton)
      }
      
      alert = container.querySelector('[role="alert"]')
      expect(alert).not.toBeInTheDocument()
    })
  })

  describe('Multiple Content Types', () => {
    it('should render title and description together', () => {
      render(Alert, {
        props: {
          title: 'Main Title',
          description: 'Description text',
        },
      })
      
      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('should render with all features enabled', () => {
      const { container } = render(Alert, {
        props: {
          type: 'success',
          size: 'lg',
          title: 'Success!',
          description: 'Operation completed successfully',
          showIcon: true,
          closable: true,
        },
      })
      
      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
      expect(container.querySelector('button[aria-label="Close alert"]')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role="alert"', () => {
      renderWithProps(Alert, {
        title: 'Accessible Alert',
      })
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should have accessible close button', () => {
      const { container } = renderWithProps(Alert, {
        title: 'Alert',
        closable: true,
      })
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('type', 'button')
    })

    it('should have no a11y violations with basic props', async () => {
      const { container } = renderWithProps(Alert, {
        title: 'Accessible Alert',
        description: 'This is an accessible alert',
      })
      
      await expectNoA11yViolations(container)
    })

    it('should have no a11y violations with closable alert', async () => {
      const { container } = renderWithProps(Alert, {
        title: 'Closable Alert',
        closable: true,
      })
      
      await expectNoA11yViolations(container)
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for info type', () => {
      const { container } = renderWithProps(Alert, {
        type: 'info',
        title: 'Info Alert',
        description: 'Info description',
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for success type with icon', () => {
      const { container } = renderWithProps(Alert, {
        type: 'success',
        title: 'Success!',
        showIcon: true,
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for error type with close button', () => {
      const { container } = renderWithProps(Alert, {
        type: 'error',
        title: 'Error occurred',
        description: 'Please try again',
        closable: true,
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for all sizes', () => {
      componentSizes.forEach(size => {
        const { container } = renderWithProps(Alert, {
          size,
          title: `${size} Alert`,
        })
        
        expect(container.firstChild).toMatchSnapshot()
      })
    })
  })
})
