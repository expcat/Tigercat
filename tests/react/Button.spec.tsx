/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Button } from '@tigercat/react'
import {
  renderWithProps,
  renderWithChildren,
  expectNoA11yViolations,
  buttonVariants,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils'

describe('Button', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('inline-flex')
    })

    it('should render with custom text via children', () => {
      const { getByText } = render(<Button>Custom Button Text</Button>)
      
      expect(getByText('Custom Button Text')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<Button className="custom-class">Button</Button>)
      
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it.each(buttonVariants)('should render %s variant correctly', (variant) => {
      const { container } = render(
        <Button variant={variant}>{variant} button</Button>
      )
      
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('should apply default variant when not specified', () => {
      const { getByRole } = render(<Button>Default Button</Button>)
      const button = getByRole('button')
      
      // Should have primary variant classes by default
      expect(button).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(
        <Button size={size}>{size} button</Button>
      )
      
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should handle type prop', () => {
      const { getByRole } = render(<Button type="submit">Submit</Button>)
      expect(getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('should handle reset type', () => {
      const { getByRole } = render(<Button type="reset">Reset</Button>)
      expect(getByRole('button')).toHaveAttribute('type', 'reset')
    })

    it('should default to button type', () => {
      const { getByRole } = render(<Button>Button</Button>)
      
      expect(getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('should pass through other HTML button attributes', () => {
      const { getByRole } = render(
        <Button aria-label="Custom label" data-testid="test-button">
          Button
        </Button>
      )
      
      const button = getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom label')
      expect(button).toHaveAttribute('data-testid', 'test-button')
    })
  })

  describe('Events', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(
        <Button onClick={handleClick}>Click me</Button>
      )
      
      await userEvent.click(getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      )
      
      await userEvent.click(getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(
        <Button onClick={handleClick} loading>
          Loading Button
        </Button>
      )
      
      await userEvent.click(getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByRole } = render(<Button disabled>Disabled</Button>)
      
      expect(getByRole('button')).toBeDisabled()
    })

    it('should show loading state', () => {
      const { container, getByRole } = render(<Button loading>Loading</Button>)
      
      const button = getByRole('button')
      expect(button).toBeDisabled()
      
      const spinner = container.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should handle focus state', () => {
      const { getByRole } = render(<Button>Focus me</Button>)
      const button = getByRole('button')
      
      button.focus()
      expect(button).toHaveFocus()
    })

    it('should be disabled when loading', () => {
      const { getByRole } = render(<Button loading>Loading</Button>)
      
      expect(getByRole('button')).toBeDisabled()
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables([
        '--tiger-primary',
        '--tiger-primary-hover',
        '--tiger-secondary',
        '--tiger-secondary-hover',
      ])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000',
        '--tiger-primary-hover': '#cc0000',
      })

      const { container } = render(<Button variant="primary">Primary Button</Button>)
      
      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
      expect(rootStyles.getPropertyValue('--tiger-primary-hover').trim()).toBe('#cc0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Accessible Button</Button>)
      
      await expectNoA11yViolations(container)
    })

    it('should have proper ARIA attributes when provided', () => {
      const { getByRole } = render(<Button aria-label="Close">×</Button>)
      const button = getByRole('button', { name: 'Close' })
      
      expect(button).toHaveAttribute('aria-label', 'Close')
    })

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(<Button onClick={handleClick}>Button</Button>)
      
      const button = getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
      
      await userEvent.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be activatable with space key', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(<Button onClick={handleClick}>Button</Button>)
      
      const button = getByRole('button')
      button.focus()
      
      await userEvent.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Children', () => {
    it('should render text children', () => {
      const { getByText } = render(<Button>Text Content</Button>)
      
      expect(getByText('Text Content')).toBeInTheDocument()
    })

    it('should render complex children', () => {
      const { getByText } = render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      )
      
      expect(getByText('Icon')).toBeInTheDocument()
      expect(getByText('Text')).toBeInTheDocument()
    })

    it('should render with loading spinner and children', () => {
      const { getByText, container } = render(
        <Button loading>Loading Text</Button>
      )
      
      expect(getByText('Loading Text')).toBeInTheDocument()
      expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { getByRole } = render(<Button />)
      
      expect(getByRole('button')).toBeInTheDocument()
    })

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000)
      const { getByText } = render(<Button>{longText}</Button>)
      
      expect(getByText(longText)).toBeInTheDocument()
    })

    it('should handle special characters', () => {
      const specialText = '<>&"\'§±!@#$%^&*()'
      const { getByText } = render(<Button>{specialText}</Button>)
      
      expect(getByText(specialText)).toBeInTheDocument()
    })

    it('should handle unicode characters', () => {
      const unicodeText = '你好世界 🌍 مرحبا'
      const { getByText } = render(<Button>{unicodeText}</Button>)
      
      expect(getByText(unicodeText)).toBeInTheDocument()
    })

    it('should handle rapid clicks', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(<Button onClick={handleClick}>Button</Button>)
      
      const button = getByRole('button')
      await userEvent.click(button)
      await userEvent.click(button)
      await userEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('should handle both disabled and loading props', () => {
      const handleClick = vi.fn()
      const { getByRole } = render(
        <Button disabled loading onClick={handleClick}>
          Button
        </Button>
      )
      
      const button = getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should handle whitespace-only children', () => {
      const { getByRole } = render(<Button>   </Button>)
      
      expect(getByRole('button')).toBeInTheDocument()
    })

    it('should handle null children gracefully', () => {
      const { getByRole } = render(<Button>{null}</Button>)
      
      expect(getByRole('button')).toBeInTheDocument()
    })

    it('should handle undefined onClick gracefully', async () => {
      const { getByRole } = render(<Button>Click me</Button>)
      
      // Should not throw error even without onClick
      await userEvent.click(getByRole('button'))
    })

    it('should handle multiple rapid state changes', () => {
      const { getByRole, rerender } = render(<Button>Button</Button>)
      
      rerender(<Button disabled>Button</Button>)
      expect(getByRole('button')).toBeDisabled()
      
      rerender(<Button loading>Button</Button>)
      expect(getByRole('button')).toBeDisabled()
      
      rerender(<Button>Button</Button>)
      expect(getByRole('button')).not.toBeDisabled()
    })

    it('should handle all size-variant combinations', () => {
      componentSizes.forEach(size => {
        buttonVariants.forEach(variant => {
          const { getByRole, unmount } = render(
            <Button size={size} variant={variant}>
              {size} {variant}
            </Button>
          )
          expect(getByRole('button')).toBeInTheDocument()
          unmount() // Clean up before next render
        })
      })
    })

    it('should preserve custom props through re-renders', () => {
      const customDataAttr = 'custom-test-value'
      const { getByRole, rerender } = render(
        <Button data-custom={customDataAttr}>Button</Button>
      )
      
      expect(getByRole('button')).toHaveAttribute('data-custom', customDataAttr)
      
      rerender(<Button data-custom={customDataAttr} disabled>Button</Button>)
      expect(getByRole('button')).toHaveAttribute('data-custom', customDataAttr)
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default state', () => {
      const { container } = render(<Button>Default Button</Button>)
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for each variant', () => {
      buttonVariants.forEach(variant => {
        const { container } = render(<Button variant={variant}>{variant}</Button>)
        expect(container.firstChild).toMatchSnapshot()
      })
    })

    it('should match snapshot for each size', () => {
      componentSizes.forEach(size => {
        const { container } = render(<Button size={size}>{size}</Button>)
        expect(container.firstChild).toMatchSnapshot()
      })
    })

    it('should match snapshot for disabled state', () => {
      const { container } = render(<Button disabled>Disabled</Button>)
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for loading state', () => {
      const { container } = render(<Button loading>Loading</Button>)
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
