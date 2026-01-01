/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { Select } from '@tigercat/vue'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils'

const testOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
]

describe('Select', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(Select, {
        props: { options: testOptions },
      })
      
      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      const { getByText } = render(Select, {
        props: { 
          options: testOptions,
          placeholder: 'Select an option',
        },
      })
      
      expect(getByText('Select an option')).toBeInTheDocument()
    })

    it('should render with selected value', () => {
      const { getByText } = render(Select, {
        props: { 
          options: testOptions,
          modelValue: '1',
        },
      })
      
      expect(getByText('Option 1')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(Select, { 
        options: testOptions,
        size,
      })
      
      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(Select, {
        props: { 
          options: testOptions,
          disabled: true,
        },
      })
      
      const trigger = container.querySelector('button')
      expect(trigger).toBeDisabled()
    })

    it('should support clearable option', () => {
      const { container } = render(Select, {
        props: { 
          options: testOptions,
          modelValue: '1',
          clearable: true,
        },
      })
      
      const clearButton = container.querySelector('svg')
      expect(clearButton).toBeInTheDocument()
    })

    it('should support multiple selection', () => {
      const { container } = render(Select, {
        props: { 
          options: testOptions,
          multiple: true,
        },
      })
      
      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('Events', () => {
    it('should emit update:modelValue when option selected', async () => {
      const onUpdate = vi.fn()
      const { container, getByText } = render(Select, {
        props: { 
          options: testOptions,
          'onUpdate:modelValue': onUpdate,
        },
      })
      
      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      
      await waitFor(() => {
        const option = getByText('Option 1')
        return fireEvent.click(option)
      })
      
      expect(onUpdate).toHaveBeenCalledWith('1')
    })

    it('should not emit events when disabled', async () => {
      const onUpdate = vi.fn()
      const { container } = render(Select, {
        props: { 
          options: testOptions,
          disabled: true,
          'onUpdate:modelValue': onUpdate,
        },
      })
      
      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should emit change event', async () => {
      const onChange = vi.fn()
      const { container, getByText } = render(Select, {
        props: { 
          options: testOptions,
          onChange: onChange,
        },
      })
      
      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      
      await waitFor(() => {
        const option = getByText('Option 1')
        return fireEvent.click(option)
      })
      
      expect(onChange).toHaveBeenCalled()
    })
  })

  describe('Dropdown', () => {
    it('should open dropdown when clicked', async () => {
      const { container, getByText } = render(Select, {
        props: { options: testOptions },
      })
      
      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      
      await waitFor(() => {
        expect(getByText('Option 1')).toBeInTheDocument()
      })
    })

    it('should close dropdown when option selected', async () => {
      const { container, getByText, queryByText } = render(Select, {
        props: { options: testOptions },
      })
      
      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      
      await waitFor(() => {
        const option = getByText('Option 1')
        return fireEvent.click(option)
      })
      
      await waitFor(() => {
        expect(queryByText('Option 2')).not.toBeInTheDocument()
      })
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

      const { container } = render(Select, {
        props: { options: testOptions },
      })
      
      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()
      
      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Select, {
        props: { 
          options: testOptions,
          placeholder: 'Select option',
        },
      })
      
      await expectNoA11yViolations(container)
    })

    it('should have proper button element', () => {
      const { container } = render(Select, {
        props: { options: testOptions },
      })
      
      const trigger = container.querySelector('button')
      expect(trigger).toHaveAttribute('type', 'button')
    })

    it('should be keyboard accessible', async () => {
      const { container } = render(Select, {
        props: { options: testOptions },
      })
      
      const trigger = container.querySelector('button')!
      trigger.focus()
      
      expect(trigger).toHaveFocus()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default state', () => {
      const { container } = render(Select, {
        props: { options: testOptions },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with selected value', () => {
      const { container } = render(Select, {
        props: { 
          options: testOptions,
          modelValue: '1',
        },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for disabled state', () => {
      const { container } = render(Select, {
        props: { 
          options: testOptions,
          disabled: true,
        },
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
