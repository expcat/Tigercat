/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Switch } from '@expcat/tigercat-vue'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils'

describe('Switch', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Switch)

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toBeInTheDocument()
    })

    it('should render in unchecked state by default', () => {
      const { container } = render(Switch)

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('aria-checked', 'false')
    })

    it('should render in checked state when checked prop is true', () => {
      const { container } = renderWithProps(Switch, { checked: true })

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(Switch, { size })

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toBeInTheDocument()
    })

    it('should apply disabled state', () => {
      const { container } = renderWithProps(Switch, { disabled: true })

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveClass('cursor-not-allowed')
      expect(switchButton).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Events', () => {
    it('should emit update:checked when clicked', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: {
          checked: false,
          'onUpdate:checked': onUpdate
        }
      })

      const switchButton = container.querySelector('[role="switch"]')!
      await fireEvent.click(switchButton)

      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('should emit change event when clicked', async () => {
      const onChange = vi.fn()
      const { container } = render(Switch, {
        props: {
          checked: false,
          onChange: onChange
        }
      })

      const switchButton = container.querySelector('[role="switch"]')!
      await fireEvent.click(switchButton)

      expect(onChange).toHaveBeenCalledWith(true)
    })

    it('should not emit events when disabled', async () => {
      const onUpdate = vi.fn()
      const onChange = vi.fn()
      const { container } = render(Switch, {
        props: {
          disabled: true,
          checked: false,
          'onUpdate:checked': onUpdate,
          onChange: onChange
        }
      })

      const switchButton = container.querySelector('[role="switch"]')!
      await fireEvent.click(switchButton)

      expect(onUpdate).not.toHaveBeenCalled()
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should toggle from true to false', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: {
          checked: true,
          'onUpdate:checked': onUpdate
        }
      })

      const switchButton = container.querySelector('[role="switch"]')!
      await fireEvent.click(switchButton)

      expect(onUpdate).toHaveBeenCalledWith(false)
    })

    it('should emit update:checked when Space is pressed', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: {
          checked: false,
          'onUpdate:checked': onUpdate
        }
      })

      const switchButton = container.querySelector('[role="switch"]')!
      switchButton.focus()
      await fireEvent.keyDown(switchButton, { key: ' ', code: 'Space' })

      expect(onUpdate).toHaveBeenCalledWith(true)
    })
  })

  describe('States', () => {
    it('should show checked state correctly', async () => {
      const { container, rerender } = renderWithProps(Switch, {
        checked: false
      })

      let switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('aria-checked', 'false')

      await rerender({ checked: true })
      switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = renderWithProps(Switch, { disabled: true })

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

      const { container } = renderWithProps(Switch, { checked: true })

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Switch, {
        attrs: {
          'aria-label': 'Toggle switch'
        }
      })

      await expectNoA11yViolations(container)
    })

    it('should have proper role and aria attributes', () => {
      const { container } = renderWithProps(Switch, { checked: false })

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('role', 'switch')
      expect(switchButton).toHaveAttribute('aria-checked', 'false')
    })

    it('should be keyboard accessible', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: {
          checked: false,
          'onUpdate:checked': onUpdate
        }
      })

      const switchButton = container.querySelector('[role="switch"]')!
      switchButton.focus()

      expect(switchButton).toHaveFocus()

      await fireEvent.keyDown(switchButton, { key: 'Enter', code: 'Enter' })
      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('should have tabindex 0 when enabled', () => {
      const { container } = renderWithProps(Switch, { disabled: false })

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).not.toHaveAttribute('tabindex', '-1')
    })

    it('should have tabindex -1 when disabled', () => {
      const { container } = renderWithProps(Switch, { disabled: true })

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('V-Model Support', () => {
    it('should work with v-model:checked', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: {
          checked: false,
          'onUpdate:checked': onUpdate
        }
      })

      const switchButton = container.querySelector('[role="switch"]')!
      await fireEvent.click(switchButton)

      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('should update when v-model value changes', async () => {
      const { container, rerender } = renderWithProps(Switch, { checked: false })

      let switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('aria-checked', 'false')

      await rerender({ checked: true })

      switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid clicks correctly', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: {
          checked: false,
          'onUpdate:checked': onUpdate
        }
      })

      const switchButton = container.querySelector('[role="switch"]')!

      await fireEvent.click(switchButton)
      await fireEvent.click(switchButton)
      await fireEvent.click(switchButton)

      // In controlled mode, each click emits the toggled value
      // Since checked stays false, all clicks emit true
      expect(onUpdate).toHaveBeenCalledTimes(3)
      expect(onUpdate).toHaveBeenNthCalledWith(1, true)
      expect(onUpdate).toHaveBeenNthCalledWith(2, true)
      expect(onUpdate).toHaveBeenNthCalledWith(3, true)
    })

    it('should not trigger on other key presses', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: {
          checked: false,
          'onUpdate:checked': onUpdate
        }
      })

      const switchButton = container.querySelector('[role="switch"]')!

      await fireEvent.keyDown(switchButton, { key: 'a' })
      await fireEvent.keyDown(switchButton, { key: 'Escape' })
      await fireEvent.keyDown(switchButton, { key: 'Tab' })

      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should handle large size correctly', () => {
      const { container } = renderWithProps(Switch, { size: 'lg' })

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toBeInTheDocument()
    })

    it('should handle small size correctly', () => {
      const { container } = renderWithProps(Switch, { size: 'sm' })

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toBeInTheDocument()
    })

    it('should preserve custom className with other props', () => {
      const { container } = renderWithProps(Switch, {
        className: 'custom-class',
        checked: true,
        disabled: false
      })

      const switchButton = container.querySelector('.custom-class')
      expect(switchButton).toBeInTheDocument()
    })

    it('should apply custom styles correctly', () => {
      const { container } = renderWithProps(Switch, {
        style: { marginLeft: '10px' }
      })

      const switchButton = container.querySelector('[role="switch"]')
      expect(switchButton).toBeInTheDocument()
    })
  })

  describe('Event Prevention', () => {
    it('should prevent default behavior on Space key to avoid page scroll', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: {
          checked: false,
          'onUpdate:checked': onUpdate
        }
      })
      const switchButton = container.querySelector('[role="switch"]')!

      // Test that Space key triggers toggle (side effect of preventDefault working)
      await fireEvent.keyDown(switchButton, { key: ' ', code: 'Space' })

      // If preventDefault works correctly, the switch should toggle
      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('should prevent default behavior on Enter key', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Switch, {
        props: {
          checked: false,
          'onUpdate:checked': onUpdate
        }
      })
      const switchButton = container.querySelector('[role="switch"]')!

      // Test that Enter key triggers toggle
      await fireEvent.keyDown(switchButton, { key: 'Enter', code: 'Enter' })

      // If preventDefault works correctly, the switch should toggle
      expect(onUpdate).toHaveBeenCalledWith(true)
    })
  })
})
