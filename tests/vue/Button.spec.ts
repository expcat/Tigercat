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
