/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-react'
import {
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

const getBox = (container: HTMLElement) =>
  container.querySelector('input[type="checkbox"]') as HTMLInputElement
const getBoxes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[]

describe('Checkbox', () => {
  describe('Rendering', () => {
    it('renders the input and label, unchecked by default', () => {
      const { container, getByText } = render(<Checkbox value="option1">Check me</Checkbox>)
      const box = getBox(container)
      expect(box).toBeInTheDocument()
      expect(box).toHaveAttribute('value', 'option1')
      expect(box.checked).toBe(false)
      expect(getByText('Check me')).toBeInTheDocument()
    })

    it('applies custom className to the label', () => {
      const { container } = render(<Checkbox className="custom-checkbox">Custom</Checkbox>)
      expect(container.querySelector('label')).toHaveClass('custom-checkbox')
    })

    it.each(componentSizes)('renders %s size', (size) => {
      const { container } = render(<Checkbox size={size}>Checkbox</Checkbox>)
      expect(getBox(container)).toBeInTheDocument()
    })
  })

  describe('Disabled state', () => {
    it('is disabled and does not call onChange when clicked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Checkbox disabled onChange={handleChange}>
          Disabled
        </Checkbox>
      )
      const box = getBox(container)
      expect(box).toBeDisabled()
      await user.click(box)
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Controlled and uncontrolled', () => {
    it('reflects the controlled checked prop and reacts to changes', () => {
      const { container, rerender } = render(<Checkbox checked={false}>Checkbox</Checkbox>)
      expect(getBox(container).checked).toBe(false)
      rerender(<Checkbox checked>Checkbox</Checkbox>)
      expect(getBox(container).checked).toBe(true)
    })
    it('toggles in uncontrolled mode from defaultChecked', async () => {
      const user = userEvent.setup()
      const { container } = render(<Checkbox defaultChecked={false}>Uncontrolled</Checkbox>)
      const box = getBox(container)
      expect(box.checked).toBe(false)
      await user.click(box)
      expect(box.checked).toBe(true)
      await user.click(box)
      expect(box.checked).toBe(false)
    })

    it('calls onChange with the new checked value and the event', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Checkbox onChange={handleChange}>Checkbox</Checkbox>)
      await user.click(getBox(container))
      expect(handleChange.mock.calls[0][0]).toBe(true)
      expect(handleChange.mock.calls[0][1]).toBeDefined()
    })
  })

  describe('Indeterminate state', () => {
    it('reflects and toggles the indeterminate prop', async () => {
      const { container, rerender } = render(<Checkbox indeterminate>Indeterminate</Checkbox>)
      await waitFor(() => expect(getBox(container).indeterminate).toBe(true))
      rerender(<Checkbox indeterminate={false}>Indeterminate</Checkbox>)
      await waitFor(() => expect(getBox(container).indeterminate).toBe(false))
    })
  })

  describe('CheckboxGroup', () => {
    it('renders children checkboxes', () => {
      const { container } = render(
        <CheckboxGroup>
          <Checkbox value="a">A</Checkbox>
          <Checkbox value="b">B</Checkbox>
        </CheckboxGroup>
      )
      expect(getBoxes(container)).toHaveLength(2)
    })

    it('selects and deselects items (uncontrolled)', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <CheckboxGroup defaultValue={['apple']} onChange={handleChange}>
          <Checkbox value="apple">Apple</Checkbox>
          <Checkbox value="banana">Banana</Checkbox>
        </CheckboxGroup>
      )
      const inputs = getBoxes(container)
      expect(inputs[0].checked).toBe(true)
      expect(inputs[1].checked).toBe(false)

      await user.click(inputs[1])
      expect(handleChange).toHaveBeenCalledWith(['apple', 'banana'])

      await user.click(inputs[0])
      expect(handleChange).toHaveBeenLastCalledWith(['banana'])
    })
    it('works as a controlled group', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [value, setValue] = React.useState<(string | number | boolean)[]>(['apple'])
        return (
          <CheckboxGroup value={value} onChange={setValue}>
            <Checkbox value="apple">Apple</Checkbox>
            <Checkbox value="banana">Banana</Checkbox>
          </CheckboxGroup>
        )
      }
      const { container } = render(<TestComponent />)
      const inputs = getBoxes(container)
      expect(inputs[0].checked).toBe(true)
      await user.click(inputs[1])
      expect(inputs[1].checked).toBe(true)
    })
    it('disables all checkboxes and blocks onChange when the group is disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <CheckboxGroup disabled onChange={handleChange}>
          <Checkbox value="a">A</Checkbox>
          <Checkbox value="b">B</Checkbox>
        </CheckboxGroup>
      )
      const inputs = getBoxes(container)
      inputs.forEach((input) => expect(input).toBeDisabled())
      await user.click(inputs[0])
      expect(handleChange).not.toHaveBeenCalled()
    })
    it('calls onChange with the selected values', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <CheckboxGroup onChange={handleChange}>
          <Checkbox value="a">A</Checkbox>
          <Checkbox value="b">B</Checkbox>
        </CheckboxGroup>
      )
      await user.click(getBoxes(container)[0])
      expect(handleChange).toHaveBeenCalledWith(['a'])
    })

    it('supports a select-all / indeterminate pattern', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [values, setValues] = React.useState<string[]>([])
        const allOptions = ['a', 'b', 'c']
        const isAllChecked = values.length === allOptions.length
        const isIndeterminate = values.length > 0 && values.length < allOptions.length
        const toggleAll = (checked: boolean) => setValues(checked ? [...allOptions] : [])
        return (
          <div>
            <Checkbox checked={isAllChecked} indeterminate={isIndeterminate} onChange={toggleAll}>
              Select All
            </Checkbox>
            <CheckboxGroup value={values} onChange={setValues}>
              {allOptions.map((opt) => (
                <Checkbox key={opt} value={opt}>
                  {opt}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </div>
        )
      }
      const { container } = render(<TestComponent />)
      const inputs = getBoxes(container)
      const selectAll = inputs[0]
      const options = inputs.slice(1)

      await user.click(selectAll)
      expect(selectAll.checked).toBe(true)
      options.forEach((cb) => expect(cb.checked).toBe(true))

      await user.click(options[0])
      await waitFor(() => expect(selectAll.indeterminate).toBe(true))

      await user.click(selectAll)
      expect(selectAll.checked).toBe(true)
      await waitFor(() => expect(selectAll.indeterminate).toBe(false))
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })
  })

  describe('Accessibility', () => {
    it('is focusable', () => {
      const { container } = render(<Checkbox>Checkbox</Checkbox>)
      const box = getBox(container)
      box.focus()
      expect(box).toHaveFocus()
    })

    it('has no violations for a standalone checkbox', async () => {
      const { container } = render(<Checkbox>Accessible Checkbox</Checkbox>)
      await expectNoA11yViolationsIsolated(container)
    })

    it('has no violations for a checkbox group', async () => {
      const { container } = render(
        <CheckboxGroup>
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge Cases', () => {})
})
