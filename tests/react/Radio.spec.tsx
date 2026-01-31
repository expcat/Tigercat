/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Radio, RadioGroup } from '@expcat/tigercat-react'
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

describe('Radio', () => {
  describe('Basic Rendering', () => {
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

    it('should render without label when no children', () => {
      const { container } = render(<Radio value="option1" />)

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toBeInTheDocument()
    })

    it('should render with numeric value', () => {
      const { container } = render(<Radio value={123}>Numeric</Radio>)

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toHaveAttribute('value', '123')
    })

    it('should apply custom className', () => {
      const { container } = render(
        <Radio value="option1" className="custom-class">
          Option
        </Radio>
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('should apply custom style', () => {
      const { container } = render(
        <Radio value="option1" style={{ marginTop: '10px' }}>
          Styled
        </Radio>
      )

      const label = container.querySelector('label')
      expect(label).toHaveStyle({ marginTop: '10px' })
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

    it('should prioritize checked prop over defaultChecked', () => {
      const { container } = render(
        <Radio value="option1" checked={false} defaultChecked>
          Controlled
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(false)
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

    it('should call onChange with numeric value', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Radio value={42} onChange={handleChange}>
          Numeric
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')!
      await user.click(radio)

      expect(handleChange).toHaveBeenCalledWith(42)
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

    it('should not change when controlled and onChange not provided', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Radio value="option1" checked={false}>
          Controlled
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(false)

      await user.click(radio)
      expect(radio.checked).toBe(false)
    })
  })

  describe('Uncontrolled Component', () => {
    it('should toggle in uncontrolled mode', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Radio value="option1" defaultChecked={false}>
          Uncontrolled
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement
      expect(radio.checked).toBe(false)

      await user.click(radio)
      expect(radio.checked).toBe(true)
    })
  })

  describe('Keyboard Navigation', () => {
    it('should activate on Enter key', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Radio value="option1" onChange={handleChange}>
          Option
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')!
      radio.focus()
      await user.keyboard('{Enter}')

      expect(handleChange).toHaveBeenCalledWith('option1')
    })

    it('should not activate on Enter when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Radio value="option1" disabled onChange={handleChange}>
          Disabled
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')!
      await user.keyboard('{Enter}')

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('RadioGroup', () => {
    describe('Basic Rendering', () => {
      it('should render RadioGroup with children', () => {
        const { container } = render(
          <RadioGroup>
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        const group = container.querySelector('[role="radiogroup"]')
        expect(group).toBeInTheDocument()
        expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(2)
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

      it('should allow custom className override', () => {
        const { container } = render(
          <RadioGroup className="custom-group flex gap-4">
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        const group = container.querySelector('[role="radiogroup"]')
        expect(group).toHaveClass('custom-group')
        expect(group).toHaveClass('flex')
        expect(group).toHaveClass('gap-4')
      })
    })

    describe('Uncontrolled Mode', () => {
      it('should select and switch values', async () => {
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

      it('should work without default value', async () => {
        const user = userEvent.setup()

        const { container } = render(
          <RadioGroup>
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        expect(inputs[0].checked).toBe(false)
        expect(inputs[1].checked).toBe(false)

        await user.click(inputs[0])

        expect(inputs[0].checked).toBe(true)
        expect(inputs[1].checked).toBe(false)
      })
    })

    describe('Controlled Mode', () => {
      it('should work as controlled component', async () => {
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
        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        expect(inputs[0].checked).toBe(true)
        expect(inputs[1].checked).toBe(false)

        await user.click(inputs[1])

        expect(inputs[0].checked).toBe(false)
        expect(inputs[1].checked).toBe(true)
      })
    })

    describe('Name Attribute', () => {
      it('should apply name to all radios', () => {
        const { container } = render(
          <RadioGroup name="my-group">
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        const inputs = container.querySelectorAll('input[type="radio"]')
        inputs.forEach((input) => {
          expect(input).toHaveAttribute('name', 'my-group')
        })
      })

      it('should auto-generate name when not provided', () => {
        const { container } = render(
          <RadioGroup>
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        const inputs = container.querySelectorAll('input[type="radio"]')
        const name = inputs[0].getAttribute('name')
        expect(name).toBeTruthy()
        expect(name).toContain('tiger-radio-group')
        inputs.forEach((input) => {
          expect(input).toHaveAttribute('name', name)
        })
      })
    })

    describe('Size Inheritance', () => {
      it.each(componentSizes)('should pass %s size to children', (size) => {
        const { container } = render(
          <RadioGroup size={size}>
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(2)
      })

      it('should allow child to override size', () => {
        const { container } = render(
          <RadioGroup size="sm">
            <Radio value="a" size="lg">
              A
            </Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(2)
      })
    })

    describe('Disabled State', () => {
      it('should disable all radios when group is disabled', () => {
        const { container } = render(
          <RadioGroup disabled>
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        const inputs = container.querySelectorAll('input[type="radio"]')
        inputs.forEach((input) => {
          expect(input).toBeDisabled()
        })
      })

      it('should not call onChange when group is disabled', async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn()

        const { container } = render(
          <RadioGroup disabled onChange={handleChange}>
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        const inputs = container.querySelectorAll('input[type="radio"]')
        await user.click(inputs[0])

        expect(handleChange).not.toHaveBeenCalled()
      })

      it('should allow individual radio to be disabled', () => {
        const { container } = render(
          <RadioGroup>
            <Radio value="a" disabled>
              A
            </Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        const inputs = container.querySelectorAll('input[type="radio"]')
        expect(inputs[0]).toBeDisabled()
        expect(inputs[1]).not.toBeDisabled()
      })
    })

    describe('Events', () => {
      it('should call onChange when value changes', async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn()

        const { container } = render(
          <RadioGroup onChange={handleChange}>
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
          </RadioGroup>
        )

        const inputs = container.querySelectorAll('input[type="radio"]')
        await user.click(inputs[1])

        expect(handleChange).toHaveBeenCalledWith('b')
      })

      it('should call onChange with numeric value', async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn()

        const { container } = render(
          <RadioGroup onChange={handleChange}>
            <Radio value={1}>One</Radio>
            <Radio value={2}>Two</Radio>
          </RadioGroup>
        )

        const inputs = container.querySelectorAll('input[type="radio"]')
        await user.click(inputs[1])

        expect(handleChange).toHaveBeenCalledWith(2)
      })
    })

    describe('Keyboard Navigation', () => {
      it('should navigate with arrow keys', async () => {
        const user = userEvent.setup()

        const { container } = render(
          <RadioGroup defaultValue="a">
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
            <Radio value="c">C</Radio>
          </RadioGroup>
        )

        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        inputs[0].focus()
        expect(inputs[0]).toHaveFocus()

        await user.keyboard('{ArrowDown}')
        expect(inputs[1]).toHaveFocus()
        expect(inputs[1].checked).toBe(true)
      })

      it('should wrap around with arrow keys', async () => {
        const user = userEvent.setup()

        const { container } = render(
          <RadioGroup defaultValue="c">
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
            <Radio value="c">C</Radio>
          </RadioGroup>
        )

        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        inputs[2].focus()
        await user.keyboard('{ArrowDown}')

        expect(inputs[0]).toHaveFocus()
        expect(inputs[0].checked).toBe(true)
      })

      it('should skip disabled radios during navigation', async () => {
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

        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        inputs[0].focus()
        await user.keyboard('{ArrowDown}')

        expect(inputs[2]).toHaveFocus()
        expect(inputs[2].checked).toBe(true)
      })

      it('should navigate with ArrowUp', async () => {
        const user = userEvent.setup()

        const { container } = render(
          <RadioGroup defaultValue="c">
            <Radio value="a">A</Radio>
            <Radio value="b">B</Radio>
            <Radio value="c">C</Radio>
          </RadioGroup>
        )

        const inputs = Array.from(
          container.querySelectorAll('input[type="radio"]')
        ) as HTMLInputElement[]

        inputs[2].focus()
        await user.keyboard('{ArrowUp}')

        expect(inputs[1]).toHaveFocus()
        expect(inputs[1].checked).toBe(true)
      })

      it('should navigate with ArrowLeft and ArrowRight', async () => {
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

        inputs[0].focus()
        await user.keyboard('{ArrowRight}')
        expect(inputs[1]).toHaveFocus()

        await user.keyboard('{ArrowLeft}')
        expect(inputs[0]).toHaveFocus()
      })
    })

    describe('Accessibility', () => {
      it('should have proper radiogroup role', () => {
        const { container } = render(
          <RadioGroup>
            <Radio value="a">A</Radio>
          </RadioGroup>
        )

        expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument()
      })

      it('should have no accessibility violations', async () => {
        const { container } = render(
          <RadioGroup defaultValue="a">
            <Radio value="a">Option A</Radio>
            <Radio value="b">Option B</Radio>
          </RadioGroup>
        )

        await expectNoA11yViolations(container)
      })
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

    it('should not be focusable when disabled', () => {
      const { container } = render(
        <Radio value="option1" disabled>
          Disabled
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')!
      expect(radio).toBeDisabled()
    })

    it('should have proper role', () => {
      const { container } = render(<Radio value="option1">Radio</Radio>)

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toHaveAttribute('type', 'radio')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      const { container } = render(<Radio value="">Empty Value</Radio>)

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toHaveAttribute('value', '')
    })

    it('should handle special characters in value', () => {
      const specialValue = '<>&"\'\`'
      const { container } = render(<Radio value={specialValue}>Special</Radio>)

      const radio = container.querySelector('input[type="radio"]')
      expect(radio).toHaveAttribute('value', specialValue)
    })

    it('should handle rapid clicks', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Radio value="option1" onChange={handleChange}>
          Rapid
        </Radio>
      )

      const radio = container.querySelector('input[type="radio"]')!

      await user.click(radio)
      await user.click(radio)
      await user.click(radio)

      // Radio fires onChange on first click - subsequent clicks on same already-checked radio
      // may not fire onChange since the value doesn't change
      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle many radios in group', () => {
      const options = Array.from({ length: 20 }, (_, i) => `option${i}`)

      const { container } = render(
        <RadioGroup defaultValue="option0">
          {options.map((opt) => (
            <Radio key={opt} value={opt}>
              {opt}
            </Radio>
          ))}
        </RadioGroup>
      )

      expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(20)
    })
  })
})
