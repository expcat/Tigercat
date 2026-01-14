/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Switch } from '@tigercat/react'
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

describe('Switch', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Switch />)

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toBeInTheDocument()
    })

    it('should render in unchecked state by default', () => {
      const { container } = render(<Switch />)

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('aria-checked', 'false')
    })

    it('should render in checked state when checked prop is true', () => {
      const { container } = render(<Switch checked />)

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should apply custom className', () => {
      const { container } = render(<Switch className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(<Switch size={size} />)

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toBeInTheDocument()
    })

    it('should apply disabled state', () => {
      const { container } = render(<Switch disabled />)

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveClass('cursor-not-allowed')
      expect(switchButton).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Events', () => {
    it('should call onChange when clicked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Switch checked={false} onChange={handleChange} />)

      const switchButton = container.querySelector('[role="switch"]')!
      await user.click(switchButton)

      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Switch disabled onChange={handleChange} />)

      const switchButton = container.querySelector('[role="switch"]')!
      await user.click(switchButton)

      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should toggle from true to false', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Switch checked={true} onChange={handleChange} />)

      const switchButton = container.querySelector('[role="switch"]')!
      await user.click(switchButton)

      expect(handleChange).toHaveBeenCalledWith(false)
    })

    it('should call onChange when Space is pressed', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Switch checked={false} onChange={handleChange} />)

      const switchButton = container.querySelector('[role="switch"]')!
      switchButton.focus()
      await user.keyboard('[Space]')

      expect(handleChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [checked, setChecked] = React.useState(false)

        return <Switch checked={checked} onChange={(value) => setChecked(value)} />
      }

      const { container } = render(<TestComponent />)
      const switchButton = container.querySelector('[role="switch"]')!

      expect(switchButton).toHaveAttribute('aria-checked', 'false')

      await user.click(switchButton)

      expect(switchButton).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('States', () => {
    it('should show checked state correctly', () => {
      const { container, rerender } = render(<Switch checked={false} />)

      let switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('aria-checked', 'false')

      rerender(<Switch checked={true} />)
      switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(<Switch disabled />)

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveClass('cursor-not-allowed')
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000'
      })

      const { container } = render(<Switch checked />)

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Switch aria-label="Toggle switch" />)

      await expectNoA11yViolations(container)
    })

    it('should have proper role and aria attributes', () => {
      const { container } = render(<Switch checked={false} />)

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('role', 'switch')
      expect(switchButton).toHaveAttribute('aria-checked', 'false')
    })
  })
})
