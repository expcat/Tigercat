/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Alert } from '@tigercat/react'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
} from '../utils'

const alertTypes = ['success', 'warning', 'error', 'info'] as const

describe('Alert', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Alert title="Test Alert" />)
      
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(screen.getByText('Test Alert')).toBeInTheDocument()
    })

    it('should render with children when no title', () => {
      render(<Alert>Default content</Alert>)
      
      expect(screen.getByText('Default content')).toBeInTheDocument()
    })

    it('should render with description', () => {
      render(<Alert title="Alert Title" description="Alert description text" />)
      
      expect(screen.getByText('Alert Title')).toBeInTheDocument()
      expect(screen.getByText('Alert description text')).toBeInTheDocument()
    })

    it('should render with custom title slot', () => {
      render(
        <Alert titleSlot={<strong>Custom Title</strong>}>
          Content
        </Alert>
      )
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
    })

    it('should render with custom description slot', () => {
      render(
        <Alert 
          title="Title" 
          descriptionSlot={<em>Custom Description</em>}
        />
      )
      
      expect(screen.getByText('Custom Description')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<Alert title="Alert" className="custom-class" />)
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Types', () => {
    it.each(alertTypes)('should render %s type correctly', (type) => {
      const { container } = render(
        <Alert type={type} title={`${type} alert`} />
      )
      
      const alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
      expect(alert?.className).toBeTruthy()
    })

    it('should apply info type by default', () => {
      const { container } = render(<Alert title="Default Alert" />)
      
      const alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(
        <Alert size={size} title={`${size} alert`} />
      )
      
      const alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
    })
  })

  describe('Icon', () => {
    it('should show icon by default', () => {
      const { container } = render(<Alert title="Alert with icon" />)
      
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should hide icon when showIcon is false', () => {
      const { container } = render(
        <Alert title="Alert without icon" showIcon={false} />
      )
      
      const icon = container.querySelector('svg')
      expect(icon).not.toBeInTheDocument()
    })

    it.each(alertTypes)('should render correct icon for %s type', (type) => {
      const { container } = render(
        <Alert type={type} title={`${type} alert`} showIcon={true} />
      )
      
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      const path = icon?.querySelector('path')
      expect(path).toBeInTheDocument()
    })
  })

  describe('Closable', () => {
    it('should not render close button when closable is false', () => {
      const { container } = render(
        <Alert title="Non-closable Alert" closable={false} />
      )
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      expect(closeButton).not.toBeInTheDocument()
    })

    it('should render close button when closable is true', () => {
      const { container } = render(
        <Alert title="Closable Alert" closable={true} />
      )
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      expect(closeButton).toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      const { container } = render(
        <Alert title="Closable Alert" closable onClose={onClose} />
      )
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      expect(closeButton).toBeInTheDocument()
      
      if (closeButton) {
        await user.click(closeButton)
        expect(onClose).toHaveBeenCalledTimes(1)
      }
    })

    it('should hide alert after close button is clicked', async () => {
      const user = userEvent.setup()
      
      const { container } = render(
        <Alert title="Closable Alert" closable />
      )
      
      let alert = container.querySelector('[role="alert"]')
      expect(alert).toBeInTheDocument()
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      if (closeButton) {
        await user.click(closeButton)
      }
      
      alert = container.querySelector('[role="alert"]')
      expect(alert).not.toBeInTheDocument()
    })

    it('should not call onClose if not provided', async () => {
      const user = userEvent.setup()
      
      const { container } = render(
        <Alert title="Closable Alert" closable />
      )
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      
      if (closeButton) {
        await user.click(closeButton)
        expect(true).toBe(true)
      }
    })
  })

  describe('Multiple Content Types', () => {
    it('should render title and description together', () => {
      render(
        <Alert title="Main Title" description="Description text" />
      )
      
      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('should render with all features enabled', () => {
      const { container } = render(
        <Alert
          type="success"
          size="lg"
          title="Success!"
          description="Operation completed successfully"
          showIcon={true}
          closable={true}
        />
      )
      
      expect(screen.getByText('Success!')).toBeInTheDocument()
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
      expect(container.querySelector('svg')).toBeInTheDocument()
      expect(container.querySelector('button[aria-label="Close alert"]')).toBeInTheDocument()
    })

    it('should prioritize titleSlot over title prop', () => {
      render(
        <Alert 
          title="Original Title" 
          titleSlot={<span>Slot Title</span>}
        />
      )
      
      expect(screen.getByText('Slot Title')).toBeInTheDocument()
      expect(screen.queryByText('Original Title')).not.toBeInTheDocument()
    })

    it('should prioritize descriptionSlot over description prop', () => {
      render(
        <Alert 
          title="Title"
          description="Original Description" 
          descriptionSlot={<span>Slot Description</span>}
        />
      )
      
      expect(screen.getByText('Slot Description')).toBeInTheDocument()
      expect(screen.queryByText('Original Description')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have role="alert"', () => {
      render(<Alert title="Accessible Alert" />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should have accessible close button', () => {
      const { container } = render(
        <Alert title="Alert" closable />
      )
      
      const closeButton = container.querySelector('button[aria-label="Close alert"]')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('type', 'button')
    })

    it('should have no a11y violations with basic props', async () => {
      const { container } = render(
        <Alert title="Accessible Alert" description="This is an accessible alert" />
      )
      
      await expectNoA11yViolations(container)
    })

    it('should have no a11y violations with closable alert', async () => {
      const { container } = render(
        <Alert title="Closable Alert" closable />
      )
      
      await expectNoA11yViolations(container)
    })

    it('should have no a11y violations with all features', async () => {
      const { container } = render(
        <Alert
          type="success"
          title="Success"
          description="All features enabled"
          showIcon={true}
          closable={true}
        />
      )
      
      await expectNoA11yViolations(container)
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for info type', () => {
      const { container } = render(
        <Alert type="info" title="Info Alert" description="Info description" />
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for success type with icon', () => {
      const { container } = render(
        <Alert type="success" title="Success!" showIcon={true} />
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for error type with close button', () => {
      const { container } = render(
        <Alert
          type="error"
          title="Error occurred"
          description="Please try again"
          closable={true}
        />
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for all sizes', () => {
      componentSizes.forEach(size => {
        const { container } = render(
          <Alert size={size} title={`${size} Alert`} />
        )
        
        expect(container.firstChild).toMatchSnapshot()
      })
    })
  })
})
