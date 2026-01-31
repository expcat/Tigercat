/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Checkbox, CheckboxGroup } from '@expcat/tigercat-react'
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

describe('Checkbox', () => {
  describe('Basic Rendering', () => {
    it('renders checkbox input and label', () => {
      const { container, getByText } = render(<Checkbox>Check me</Checkbox>)
      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
      expect(getByText('Check me')).toBeInTheDocument()
    })

    it('renders checkbox without label', () => {
      const { container } = render(<Checkbox />)
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toBeInTheDocument()
    })

    it('renders unchecked by default', () => {
      const { container } = render(<Checkbox>Checkbox</Checkbox>)
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)
    })

    it('renders with value prop', () => {
      const { container } = render(<Checkbox value="option1">Option 1</Checkbox>)
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('value', 'option1')
    })

    it('renders with numeric value', () => {
      const { container } = render(<Checkbox value={42}>Numeric</Checkbox>)
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('value', '42')
    })

    it('applies custom className', () => {
      const { container } = render(<Checkbox className="custom-checkbox">Custom</Checkbox>)
      const label = container.querySelector('label')
      expect(label).toHaveClass('custom-checkbox')
    })
  })

  describe('Sizes', () => {
    it.each(componentSizes)('renders %s size', (size) => {
      const { container } = render(<Checkbox size={size}>Checkbox</Checkbox>)
      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
    })
  })

  describe('Disabled State', () => {
    it('supports disabled', () => {
      const { container } = render(<Checkbox disabled>Disabled</Checkbox>)
      expect(container.querySelector('input[type="checkbox"]')).toBeDisabled()
    })

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Checkbox disabled onChange={handleChange}>
          Disabled
        </Checkbox>
      )

      await user.click(container.querySelector('input[type="checkbox"]')!)
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('cannot be toggled when disabled', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Checkbox disabled defaultChecked>
          Disabled
        </Checkbox>
      )

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(true)

      await user.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Controlled Mode', () => {
    it('supports controlled checked', () => {
      const { container } = render(<Checkbox checked>Checked</Checkbox>)
      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(
        true
      )
    })

    it('responds to checked changes', () => {
      const { container, rerender } = render(<Checkbox checked={false}>Checkbox</Checkbox>)

      let checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      rerender(<Checkbox checked>Checkbox</Checkbox>)
      checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(true)
    })

    it('calls onChange when clicked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Checkbox checked={false} onChange={handleChange}>
          Checkbox
        </Checkbox>
      )

      await user.click(container.querySelector('input[type="checkbox"]')!)
      expect(handleChange).toHaveBeenCalled()
      expect(handleChange.mock.calls[0][0]).toBe(true)
    })

    it('works as controlled component', async () => {
      const user = userEvent.setup()

      const TestComponent = () => {
        const [checked, setChecked] = React.useState(false)
        return (
          <Checkbox checked={checked} onChange={(isChecked) => setChecked(isChecked)}>
            Checkbox
          </Checkbox>
        )
      }

      const { container } = render(<TestComponent />)
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await user.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })
  })

  describe('Uncontrolled Mode', () => {
    it('supports uncontrolled defaultChecked', () => {
      const { container } = render(<Checkbox defaultChecked>Default</Checkbox>)
      expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(
        true
      )
    })

    it('can be toggled in uncontrolled mode', async () => {
      const user = userEvent.setup()
      const { container } = render(<Checkbox defaultChecked={false}>Uncontrolled</Checkbox>)

      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox.checked).toBe(false)

      await user.click(checkbox)
      expect(checkbox.checked).toBe(true)

      await user.click(checkbox)
      expect(checkbox.checked).toBe(false)
    })

    it('calls onChange in uncontrolled mode', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Checkbox onChange={handleChange}>Checkbox</Checkbox>)

      await user.click(container.querySelector('input[type="checkbox"]')!)
      expect(handleChange).toHaveBeenCalled()
      expect(handleChange.mock.calls[0][0]).toBe(true)
    })
  })

  describe('Indeterminate State', () => {
    it('supports indeterminate', async () => {
      const { container } = render(<Checkbox indeterminate>Indeterminate</Checkbox>)
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      await waitFor(() => expect(checkbox.indeterminate).toBe(true))
    })

    it('indeterminate can be toggled', async () => {
      const { container, rerender } = render(<Checkbox indeterminate>Indeterminate</Checkbox>)

      let checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      await waitFor(() => expect(checkbox.indeterminate).toBe(true))

      rerender(<Checkbox indeterminate={false}>Indeterminate</Checkbox>)
      checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
      await waitFor(() => expect(checkbox.indeterminate).toBe(false))
    })

    it('clicking indeterminate checkbox calls onChange', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Checkbox indeterminate onChange={handleChange}>
          Indeterminate
        </Checkbox>
      )

      await user.click(container.querySelector('input[type="checkbox"]')!)
      expect(handleChange).toHaveBeenCalled()
      expect(handleChange.mock.calls[0][0]).toBe(true)
    })
  })

  describe('Events', () => {
    it('calls onChange when clicked (non-group)', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Checkbox onChange={handleChange}>Checkbox</Checkbox>)

      await user.click(container.querySelector('input[type="checkbox"]')!)
      expect(handleChange).toHaveBeenCalled()
      expect(handleChange.mock.calls[0][0]).toBe(true)
    })

    it('onChange receives event as second argument', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Checkbox onChange={handleChange}>Checkbox</Checkbox>)

      await user.click(container.querySelector('input[type="checkbox"]')!)
      expect(handleChange.mock.calls[0][1]).toBeDefined()
    })
  })

  describe('CheckboxGroup', () => {
    describe('Basic Rendering', () => {
      it('renders CheckboxGroup with children', () => {
        const { container } = render(
          <CheckboxGroup>
            <Checkbox value="a">A</Checkbox>
            <Checkbox value="b">B</Checkbox>
          </CheckboxGroup>
        )

        expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
      })

      it('applies className to group', () => {
        const { container } = render(
          <CheckboxGroup className="custom-group">
            <Checkbox value="a">A</Checkbox>
          </CheckboxGroup>
        )

        expect(container.querySelector('div.custom-group')).toBeInTheDocument()
      })
    })

    describe('Uncontrolled Mode', () => {
      it('supports group selection via CheckboxGroup', async () => {
        const user = userEvent.setup()
        const handleGroupChange = vi.fn()
        const { container } = render(
          <CheckboxGroup defaultValue={['apple']} onChange={handleGroupChange}>
            <Checkbox value="apple">Apple</Checkbox>
            <Checkbox value="banana">Banana</Checkbox>
          </CheckboxGroup>
        )

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        expect((inputs[0] as HTMLInputElement).checked).toBe(true)
        expect((inputs[1] as HTMLInputElement).checked).toBe(false)

        await user.click(inputs[1])
        expect(handleGroupChange).toHaveBeenCalledWith(['apple', 'banana'])
      })

      it('can uncheck item in group', async () => {
        const user = userEvent.setup()
        const handleGroupChange = vi.fn()
        const { container } = render(
          <CheckboxGroup defaultValue={['apple', 'banana']} onChange={handleGroupChange}>
            <Checkbox value="apple">Apple</Checkbox>
            <Checkbox value="banana">Banana</Checkbox>
          </CheckboxGroup>
        )

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        await user.click(inputs[0])
        expect(handleGroupChange).toHaveBeenCalledWith(['banana'])
      })

      it('works without default value', async () => {
        const user = userEvent.setup()
        const handleGroupChange = vi.fn()
        const { container } = render(
          <CheckboxGroup onChange={handleGroupChange}>
            <Checkbox value="apple">Apple</Checkbox>
            <Checkbox value="banana">Banana</Checkbox>
          </CheckboxGroup>
        )

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        expect((inputs[0] as HTMLInputElement).checked).toBe(false)
        expect((inputs[1] as HTMLInputElement).checked).toBe(false)

        await user.click(inputs[0])
        expect(handleGroupChange).toHaveBeenCalledWith(['apple'])
      })
    })

    describe('Controlled Mode', () => {
      it('works as controlled component', async () => {
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
        const inputs = container.querySelectorAll('input[type="checkbox"]')

        expect((inputs[0] as HTMLInputElement).checked).toBe(true)
        expect((inputs[1] as HTMLInputElement).checked).toBe(false)

        await user.click(inputs[1])

        expect((inputs[0] as HTMLInputElement).checked).toBe(true)
        expect((inputs[1] as HTMLInputElement).checked).toBe(true)
      })
    })

    describe('Size Inheritance', () => {
      it.each(componentSizes)('passes %s size to children', (size) => {
        const { container } = render(
          <CheckboxGroup size={size}>
            <Checkbox value="a">A</Checkbox>
            <Checkbox value="b">B</Checkbox>
          </CheckboxGroup>
        )

        expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
      })

      it('allows child to override size', () => {
        const { container } = render(
          <CheckboxGroup size="sm">
            <Checkbox value="a" size="lg">
              A
            </Checkbox>
            <Checkbox value="b">B</Checkbox>
          </CheckboxGroup>
        )

        expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
      })
    })

    describe('Disabled State', () => {
      it('disables all checkboxes when group is disabled', () => {
        const { container } = render(
          <CheckboxGroup disabled>
            <Checkbox value="a">A</Checkbox>
            <Checkbox value="b">B</Checkbox>
          </CheckboxGroup>
        )

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        inputs.forEach((input) => {
          expect(input).toBeDisabled()
        })
      })

      it('does not call onChange when group is disabled', async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn()
        const { container } = render(
          <CheckboxGroup disabled onChange={handleChange}>
            <Checkbox value="a">A</Checkbox>
          </CheckboxGroup>
        )

        await user.click(container.querySelector('input[type="checkbox"]')!)
        expect(handleChange).not.toHaveBeenCalled()
      })

      it('allows individual checkbox to be disabled', () => {
        const { container } = render(
          <CheckboxGroup>
            <Checkbox value="a" disabled>
              A
            </Checkbox>
            <Checkbox value="b">B</Checkbox>
          </CheckboxGroup>
        )

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        expect(inputs[0]).toBeDisabled()
        expect(inputs[1]).not.toBeDisabled()
      })
    })

    describe('Events', () => {
      it('calls onChange with selected values', async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn()
        const { container } = render(
          <CheckboxGroup onChange={handleChange}>
            <Checkbox value="a">A</Checkbox>
            <Checkbox value="b">B</Checkbox>
          </CheckboxGroup>
        )

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        await user.click(inputs[0])

        expect(handleChange).toHaveBeenCalledWith(['a'])
      })

      it('calls onChange with numeric values', async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn()
        const { container } = render(
          <CheckboxGroup onChange={handleChange}>
            <Checkbox value={1}>One</Checkbox>
            <Checkbox value={2}>Two</Checkbox>
          </CheckboxGroup>
        )

        const inputs = container.querySelectorAll('input[type="checkbox"]')
        await user.click(inputs[0])
        await user.click(inputs[1])

        expect(handleChange).toHaveBeenLastCalledWith([1, 2])
      })
    })

    describe('Select All Pattern', () => {
      it('supports select all / deselect all pattern', async () => {
        const user = userEvent.setup()

        const TestComponent = () => {
          const [values, setValues] = React.useState<string[]>([])
          const allOptions = ['a', 'b', 'c']

          const isAllChecked = values.length === allOptions.length
          const isIndeterminate = values.length > 0 && values.length < allOptions.length

          const toggleAll = (checked: boolean) => {
            setValues(checked ? [...allOptions] : [])
          }

          return (
            <div>
              <Checkbox
                checked={isAllChecked}
                indeterminate={isIndeterminate}
                onChange={toggleAll}>
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
        const inputs = container.querySelectorAll(
          'input[type="checkbox"]'
        ) as NodeListOf<HTMLInputElement>
        const selectAllCheckbox = inputs[0]
        const optionCheckboxes = Array.from(inputs).slice(1) as HTMLInputElement[]

        // Initially nothing is selected
        expect(selectAllCheckbox.checked).toBe(false)
        await waitFor(() => expect(selectAllCheckbox.indeterminate).toBe(false))
        optionCheckboxes.forEach((cb) => expect(cb.checked).toBe(false))

        // Click select all
        await user.click(selectAllCheckbox)

        expect(selectAllCheckbox.checked).toBe(true)
        optionCheckboxes.forEach((cb) => expect(cb.checked).toBe(true))

        // Uncheck one option -> indeterminate
        await user.click(optionCheckboxes[0])

        await waitFor(() => expect(selectAllCheckbox.indeterminate).toBe(true))

        // Click select all again to select all
        await user.click(selectAllCheckbox)

        expect(selectAllCheckbox.checked).toBe(true)
        await waitFor(() => expect(selectAllCheckbox.indeterminate).toBe(false))
      })
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('supports theme variables', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000'
      })

      render(<Checkbox checked>Themed</Checkbox>)
      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Checkbox>Accessible Checkbox</Checkbox>)
      await expectNoA11yViolations(container)
    })

    it('is focusable', () => {
      const { container } = render(<Checkbox>Checkbox</Checkbox>)
      const checkbox = container.querySelector('input[type="checkbox"]')!
      checkbox.focus()
      expect(checkbox).toHaveFocus()
    })

    it('has proper type attribute', () => {
      const { container } = render(<Checkbox>Checkbox</Checkbox>)
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })

    it('CheckboxGroup passes accessibility checks', async () => {
      const { container } = render(
        <CheckboxGroup>
          <Checkbox value="a">Option A</Checkbox>
          <Checkbox value="b">Option B</Checkbox>
        </CheckboxGroup>
      )

      await expectNoA11yViolations(container)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string value', () => {
      const { container } = render(<Checkbox value="">Empty Value</Checkbox>)
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('value', '')
    })

    it('handles boolean value', () => {
      const { container } = render(<Checkbox value={true}>Boolean</Checkbox>)
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('value', 'true')
    })

    it('handles special characters in value', () => {
      const specialValue = '<>&"\'\`'
      const { container } = render(<Checkbox value={specialValue}>Special</Checkbox>)
      const checkbox = container.querySelector('input[type="checkbox"]')
      expect(checkbox).toHaveAttribute('value', specialValue)
    })

    it('handles rapid clicks', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Checkbox onChange={handleChange}>Rapid</Checkbox>)

      const checkbox = container.querySelector('input[type="checkbox"]')!

      await user.click(checkbox)
      await user.click(checkbox)
      await user.click(checkbox)

      expect(handleChange).toHaveBeenCalledTimes(3)
      expect(handleChange.mock.calls[0][0]).toBe(true)
      expect(handleChange.mock.calls[1][0]).toBe(false)
      expect(handleChange.mock.calls[2][0]).toBe(true)
    })

    it('handles many checkboxes in group', async () => {
      const user = userEvent.setup()
      const options = Array.from({ length: 20 }, (_, i) => `option${i}`)

      const TestComponent = () => {
        const [values, setValues] = React.useState<string[]>([])
        return (
          <CheckboxGroup value={values} onChange={setValues}>
            {options.map((opt) => (
              <Checkbox key={opt} value={opt}>
                {opt}
              </Checkbox>
            ))}
          </CheckboxGroup>
        )
      }

      const { container } = render(<TestComponent />)
      const inputs = container.querySelectorAll('input[type="checkbox"]')

      expect(inputs).toHaveLength(20)

      // Click first and last
      await user.click(inputs[0])
      await user.click(inputs[19])

      expect((inputs[0] as HTMLInputElement).checked).toBe(true)
      expect((inputs[19] as HTMLInputElement).checked).toBe(true)
      expect((inputs[10] as HTMLInputElement).checked).toBe(false)
    })
  })
})
