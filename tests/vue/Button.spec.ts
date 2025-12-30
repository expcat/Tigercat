/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Button } from '@tigercat/vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  buttonVariants,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils'

describe('Button', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Button, {
        slots: {
          default: 'Click me',
        },
      })
      
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('inline-flex')
    })

    it('should render with custom text via slot', () => {
      const { getByText } = renderWithSlots(Button, {
        default: 'Custom Button Text',
      })
      
      expect(getByText('Custom Button Text')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it.each(buttonVariants)('should render %s variant correctly', (variant) => {
      const { container } = renderWithProps(
        Button,
        { variant },
        {
          slots: { default: `${variant} button` },
        }
      )
      
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      // Verify button has some classes (variant-specific classes are applied)
      expect(button?.className).toBeTruthy()
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(
        Button,
        { size },
        {
          slots: { default: `${size} button` },
        }
      )
      
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByRole } = renderWithProps(
        Button,
        { disabled: true },
        {
          slots: { default: 'Disabled Button' },
        }
      )
      
      const button = getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('cursor-not-allowed')
    })

    it('should show loading state', () => {
      const { container, getByRole } = renderWithProps(
        Button,
        { loading: true },
        {
          slots: { default: 'Loading Button' },
        }
      )
      
      const button = getByRole('button')
      expect(button).toBeDisabled()
      
      // Check for loading spinner (SVG element)
      const spinner = container.querySelector('svg')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should not be clickable when loading', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(Button, {
        props: {
          loading: true,
        },
        slots: {
          default: 'Loading Button',
        },
        attrs: {
          onClick: handleClick,
        },
      })
      
      const button = getByRole('button')
      await fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Events', () => {
    it('should emit click event when clicked', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(Button, {
        props: {
          onClick: handleClick,
        },
        slots: {
          default: 'Click me',
        },
      })
      
      const button = getByRole('button')
      await fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not emit click when disabled', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(Button, {
        props: {
          disabled: true,
          onClick: handleClick,
        },
        slots: {
          default: 'Disabled Button',
        },
      })
      
      const button = getByRole('button')
      await fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables([
        '--tiger-primary',
        '--tiger-primary-hover',
        '--tiger-primary-disabled',
      ])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000',
        '--tiger-primary-hover': '#cc0000',
      })

      const { container } = renderWithProps(
        Button,
        { variant: 'primary' },
        {
          slots: { default: 'Themed Button' },
        }
      )
      
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
      
      // Verify theme variables are set
      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Button, {
        slots: {
          default: 'Accessible Button',
        },
      })
      
      await expectNoA11yViolations(container)
    })

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(Button, {
        props: {
          onClick: handleClick,
        },
        slots: {
          default: 'Keyboard Button',
        },
      })
      
      const button = getByRole('button')
      button.focus()
      
      expect(button).toHaveFocus()
      
      // Simulate Enter key press
      await fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      // Note: Button click via keyboard is handled by browser, not component
    })

    it('should have proper role', () => {
      const { getByRole } = render(Button, {
        slots: {
          default: 'Role Button',
        },
      })
      
      expect(getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty slot content', () => {
      const { getByRole } = render(Button)
      
      const button = getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.textContent).toBe('')
    })

    it('should handle very long text content', () => {
      const longText = 'Button '.repeat(100)
      const { getByRole } = renderWithSlots(Button, {
        default: longText,
      })
      
      const button = getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.textContent).toContain('Button')
    })

    it('should handle special characters in content', () => {
      const specialText = '<>&"\'\`§±!@#$%^&*()'
      const { getByRole } = renderWithSlots(Button, {
        default: specialText,
      })
      
      const button = getByRole('button')
      expect(button.textContent).toBe(specialText)
    })

    it('should handle unicode characters', () => {
      const unicodeText = '你好世界 🌍 مرحبا'
      const { getByText } = renderWithSlots(Button, {
        default: unicodeText,
      })
      
      expect(getByText(unicodeText)).toBeInTheDocument()
    })

    it('should handle rapid clicks when not disabled', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(Button, {
        props: {
          onClick: handleClick,
        },
        slots: {
          default: 'Click me',
        },
      })
      
      const button = getByRole('button')
      
      // Simulate rapid clicking
      await fireEvent.click(button)
      await fireEvent.click(button)
      await fireEvent.click(button)
      await fireEvent.click(button)
      await fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(5)
    })

    it('should not emit click when both disabled and loading', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(Button, {
        props: {
          disabled: true,
          loading: true,
          onClick: handleClick,
        },
        slots: {
          default: 'Button',
        },
      })
      
      const button = getByRole('button')
      await fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
      expect(button).toBeDisabled()
    })

    it('should handle whitespace-only content', () => {
      const { getByRole } = renderWithSlots(Button, {
        default: '   ',
      })
      
      const button = getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should maintain state through multiple prop changes', async () => {
      const { getByRole, rerender } = renderWithProps(
        Button,
        { disabled: false },
        { slots: { default: 'Button' } }
      )
      
      let button = getByRole('button')
      expect(button).not.toBeDisabled()
      
      await rerender({ disabled: true })
      button = getByRole('button')
      expect(button).toBeDisabled()
      
      await rerender({ disabled: false, loading: true })
      button = getByRole('button')
      expect(button).toBeDisabled() // loading also disables
    })

    it('should handle multiple variants in sequence', async () => {
      const { getByRole, rerender } = renderWithProps(
        Button,
        { variant: 'primary' },
        { slots: { default: 'Button' } }
      )
      
      const button = getByRole('button')
      expect(button).toBeInTheDocument()
      
      for (const variant of buttonVariants) {
        await rerender({ variant })
        expect(button).toBeInTheDocument()
      }
    })
  })

  describe('Boundary Conditions', () => {
    it('should handle negative scenarios gracefully', async () => {
      const handleClick = vi.fn()
      
      // Test with undefined onClick
      const { getByRole } = render(Button, {
        slots: { default: 'Button' },
      })
      
      await fireEvent.click(getByRole('button'))
      // Should not throw error even without onClick handler
    })

    it('should handle conflicting props correctly', () => {
      // Test disabled takes precedence over other states
      const { getByRole } = renderWithProps(
        Button,
        { disabled: true, loading: false },
        { slots: { default: 'Button' } }
      )
      
      expect(getByRole('button')).toBeDisabled()
    })

    it('should handle all size-variant combinations', () => {
      for (const size of componentSizes) {
        for (const variant of buttonVariants) {
          const { getByRole, unmount } = renderWithProps(
            Button,
            { size, variant },
            { slots: { default: `${size} ${variant}` } }
          )
          
          expect(getByRole('button')).toBeInTheDocument()
          unmount() // Clean up before next render
        }
      }
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default button', () => {
      const { container } = render(Button, {
        slots: {
          default: 'Default Button',
        },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for primary variant', () => {
      const { container } = renderWithProps(
        Button,
        { variant: 'primary' },
        {
          slots: { default: 'Primary Button' },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for disabled state', () => {
      const { container } = renderWithProps(
        Button,
        { disabled: true },
        {
          slots: { default: 'Disabled Button' },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for loading state', () => {
      const { container } = renderWithProps(
        Button,
        { loading: true },
        {
          slots: { default: 'Loading Button' },
        }
      )
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
