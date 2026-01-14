/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Radio, RadioGroup } from '@tigercat/react'
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

describe('Radio', () => {
  describe('Rendering', () => {
    it('should render with required value prop', () => {
      const { container } = render(<Radio value="option1">Option 1</Radio>)

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toBeInTheDocument()
      expect(radio).toHaveAttribute('value', 'option1')
    })

    it('should render with label text', () => {
      const { getByText } = render(<Radio value="option1">Option 1</Radio>)

      expect(getByText('Option 1')).toBeInTheDocument()
    })

    it('should render unchecked by default', () => {
      const { container } = render(<Radio value="option1">Option 1</Radio>)

      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(false)
    })

    it('should support defaultChecked (uncontrolled)', () => {
      const { container } = render(
        <Radio value="option1" defaultChecked>
          Option 1
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(true)
    })

    it('should apply custom className', () => {
      const { container } = render(
        <Radio value="option1" className="custom-class">
          Option
        </Radio>
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(
        <Radio value="option1" size={size}>
          Option
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toBeInTheDocument()
    })

    it('should apply name attribute', () => {
      const { container } = render(
        <Radio value="option1" name="choice">
          Option 1
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toHaveAttribute('name', 'choice')
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(
        <Radio value="option1" disabled>
          Disabled
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toBeDisabled()
    })

    it('should be checked when checked prop is true', () => {
      const { container } = render(
        <Radio value="option1" checked>
          Checked
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(true)
    })
  })

  describe('Events', () => {
    it('should call onChange when clicked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Radio value="option1" onChange={handleChange}>
          Option 1
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')!
      await user.click(radio)

      expect(handleChange).toHaveBeenCalledWith('option1')
    })

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Radio value="option1" disabled onChange={handleChange}>
          Disabled
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')!
      await user.click(radio)

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [checked, setChecked] = React.useState(false)

        return (
          <Radio value="option1" checked={checked} onChange={() => setChecked(true)}>
            Option
          </Radio>
        )
      }

      const { container } = render(<TestComponent />)
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement

      expect(radio.checked).toBe(false)

      await user.click(radio)

      expect(radio.checked).toBe(true)
    })
  })

  describe('RadioGroup', () => {
    it('should select and switch values in uncontrolled mode', async () => {
      const user = userEvent.setup()

      const { container } = render(
        <RadioGroup defaultValue="a">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      )

      const inputs = Array.from(
        container.querySelectorAll('input[type="radio"]')
      ) as HTMLInputElement[]

      expect(inputs[0].checked).toBe(true)
      expect(inputs[1].checked).toBe(false)

      await user.click(inputs[1])

      expect(inputs[0].checked).toBe(false)
      expect(inputs[1].checked).toBe(true)
    })

    it('should apply default spacing when no className provided', () => {
      const { container } = render(
        <RadioGroup defaultValue="a">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      )

      const group = container.querySelector('[role="radiogroup"]')
      expect(group).toBeInTheDocument()
      expect(group).toHaveClass('space-y-2')
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

      const { container } = render(
        <Radio value="option1" checked>
          Themed
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Radio value="option1">Accessible Radio</Radio>)

      await expectNoA11yViolations(container)
    })

    it('should be focusable', () => {
      const { container } = render(<Radio value="option1">Radio</Radio>)

      const radio = container.querySelector('input[type="radio"]')!
      radio.focus()

      expect(radio).toHaveFocus()
    })
  })
})
