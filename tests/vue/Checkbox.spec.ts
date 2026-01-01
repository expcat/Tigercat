/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Checkbox } from '@tigercat/vue'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils'

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Checkbox, {
        slots: { default: 'Checkbox' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toBeInTheDocument()
    })

    it('should render with label text', () => {
      const { getByText } = render(Checkbox, {
        slots: { default: 'Check me' },
      })
      
      expect(getByText('Check me')).toBeInTheDocument()
    })

    it('should render unchecked by default', () => {
      const { container } = render(Checkbox, {
        slots: { default: 'Checkbox' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(Checkbox, 
        { size },
        { slots: { default: 'Checkbox' } }
      )
      
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(Checkbox, {
        props: { disabled: true },
        slots: { default: 'Disabled' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toBeDisabled()
    })

    it('should be checked when modelValue is true', () => {
      const { container } = render(Checkbox, {
        props: { modelValue: true },
        slots: { default: 'Checked' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Events', () => {
    it('should emit update:modelValue when clicked', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Checkbox' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]')!
      await fireEvent.click(checkbox)
      
      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('should not emit events when disabled', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { disabled: true, 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Disabled' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]')!
      await fireEvent.click(checkbox)
      
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should toggle from false to true', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { modelValue: false, 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Toggle' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]')!
      await fireEvent.click(checkbox)
      
      expect(onUpdate).toHaveBeenCalledWith(true)
    })

    it('should toggle from true to false', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { modelValue: true, 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Toggle' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]')!
      await fireEvent.click(checkbox)
      
      expect(onUpdate).toHaveBeenCalledWith(false)
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000',
      })

      const { container } = render(Checkbox, {
        props: { modelValue: true },
        slots: { default: 'Themed' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toBeInTheDocument()
      
      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Checkbox, {
        slots: { default: 'Accessible Checkbox' },
      })
      
      await expectNoA11yViolations(container)
    })

    it('should have proper role', () => {
      const { container } = render(Checkbox, {
        slots: { default: 'Checkbox' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })

    it('should be keyboard accessible', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Checkbox, {
        props: { 'onUpdate:modelValue': onUpdate },
        slots: { default: 'Checkbox' },
      })
      
      const checkbox = container.querySelector('input[type="checkbox"]')!
      checkbox.focus()
      
      expect(checkbox).toHaveFocus()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for unchecked state', () => {
      const { container } = render(Checkbox, {
        slots: { default: 'Unchecked' },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for checked state', () => {
      const { container } = render(Checkbox, {
        props: { modelValue: true },
        slots: { default: 'Checked' },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for disabled state', () => {
      const { container } = render(Checkbox, {
        props: { disabled: true },
        slots: { default: 'Disabled' },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
