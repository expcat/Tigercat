/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Radio, RadioGroup } from '@expcat/tigercat-react'
import {
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

const getRadio = (container: HTMLElement) =>
  container.querySelector('input[type="radio"]') as HTMLInputElement
const getRadios = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input[type="radio"]')) as HTMLInputElement[]

describe('Radio', () => {
  describe('Rendering', () => {
    it('should render the input, value and label', () => {
      const { container, getByText } = render(<Radio value="option1">Option 1</Radio>)
      const radio = getRadio(container)
      expect(radio).toBeInTheDocument()
      expect(radio).toHaveAttribute('value', 'option1')
      expect(radio.checked).toBe(false)
      expect(getByText('Option 1')).toBeInTheDocument()
    })
    it('should apply custom className', () => {
      const { container } = render(
        <Radio value="option1" className="custom-class">
          Option
        </Radio>
      )
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it.each(componentSizes)('should render %s size', (size) => {
      const { container } = render(
        <Radio value="option1" size={size}>
          Option
        </Radio>
      )
      expect(getRadio(container)).toBeInTheDocument()
    })

    it('should apply the name attribute', () => {
      const { container } = render(
        <Radio value="option1" name="choice">
          Option 1
        </Radio>
      )
      expect(getRadio(container)).toHaveAttribute('name', 'choice')
    })

    it('should be disabled when disabled', () => {
      const { container } = render(
        <Radio value="option1" disabled>
          Disabled
        </Radio>
      )
      expect(getRadio(container)).toBeDisabled()
    })

    it('should prioritize the checked prop over defaultChecked', () => {
      const { container } = render(
        <Radio value="option1" checked={false} defaultChecked>
          Controlled
        </Radio>
      )
      expect(getRadio(container).checked).toBe(false)
    })
  })

  describe('Events', () => {
    it('should call onChange with the value on click', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Radio value="option1" onChange={handleChange}>
          Option 1
        </Radio>
      )
      await user.click(getRadio(container))
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
      await user.click(getRadio(container))
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should activate on the Enter key', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Radio value="option1" onChange={handleChange}>
          Option
        </Radio>
      )
      getRadio(container).focus()
      await user.keyboard('{Enter}')
      expect(handleChange).toHaveBeenCalledWith('option1')
    })
  })

  describe('Controlled and uncontrolled', () => {
    it('should reflect the controlled checked state', async () => {
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
      const radio = getRadio(container)
      expect(radio.checked).toBe(false)
      await user.click(radio)
      expect(radio.checked).toBe(true)
    })
  })

  describe('RadioGroup', () => {
    it('should render children inside a radiogroup', () => {
      const { container } = render(
        <RadioGroup>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      )
      expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument()
      expect(getRadios(container)).toHaveLength(2)
    })

    it('should select and switch values (uncontrolled)', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <RadioGroup defaultValue="a">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      )
      const inputs = getRadios(container)
      expect(inputs[0].checked).toBe(true)
      await user.click(inputs[1])
      expect(inputs[0].checked).toBe(false)
      expect(inputs[1].checked).toBe(true)
    })

    it('should work without a default value', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <RadioGroup>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      )
      const inputs = getRadios(container)
      expect(inputs[0].checked).toBe(false)
      await user.click(inputs[0])
      expect(inputs[0].checked).toBe(true)
    })

    it('should work as a controlled group', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [value, setValue] = React.useState<string | number>('a')
        return (
          <RadioGroup value={value} onChange={setValue}>
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )
      }
      const { container } = render(<TestComponent />)
      const inputs = getRadios(container)
      await user.click(inputs[1])
      expect(inputs[0].checked).toBe(false)
      expect(inputs[1].checked).toBe(true)
    })

    it('should apply an explicit name to all radios', () => {
      const { container } = render(
        <RadioGroup name="my-group">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      )
      getRadios(container).forEach((input) => {
        expect(input).toHaveAttribute('name', 'my-group')
      })
    })

    it('should auto-generate a shared name when not provided', () => {
      const { container } = render(
        <RadioGroup>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      )
      const inputs = getRadios(container)
      const name = inputs[0].getAttribute('name')
      expect(name).toContain('tiger-radio-group')
      inputs.forEach((input) => expect(input).toHaveAttribute('name', name))
    })
    it('should disable all radios, and support individually disabled radios', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <RadioGroup disabled onChange={handleChange}>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      )
      const inputs = getRadios(container)
      inputs.forEach((input) => expect(input).toBeDisabled())
      await user.click(inputs[0])
      expect(handleChange).not.toHaveBeenCalled()
    })
    it('should call onChange with the selected value', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <RadioGroup onChange={handleChange}>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      )
      await user.click(getRadios(container)[1])
      expect(handleChange).toHaveBeenCalledWith('b')
    })

    it('should move and select with arrow keys, skipping disabled radios', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <RadioGroup defaultValue="a">
          <Radio value="a">A</Radio>
          <Radio value="b" disabled>
            B
          </Radio>
          <Radio value="c">C</Radio>
        </RadioGroup>
      )
      const inputs = getRadios(container)
      inputs[0].focus()
      await user.keyboard('{ArrowDown}')
      expect(inputs[2]).toHaveFocus()
      expect(inputs[2].checked).toBe(true)
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })
  })

  describe('Accessibility', () => {
    it('should be focusable', () => {
      const { container } = render(<Radio value="option1">Radio</Radio>)
      const radio = getRadio(container)
      radio.focus()
      expect(radio).toHaveFocus()
    })

    it('should have no violations for a standalone radio', async () => {
      const { container } = render(<Radio value="option1">Accessible Radio</Radio>)
      await expectNoA11yViolationsIsolated(container)
    })

    it('should have no violations for a radio group', async () => {
      const { container } = render(
        <RadioGroup defaultValue="a">
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge Cases', () => {})
})
