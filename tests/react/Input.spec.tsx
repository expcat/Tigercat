/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Input } from '@expcat/tigercat-react'
import type { InputType, InputStatus } from '@expcat/tigercat-core'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
  edgeCaseData
} from '../utils/react'

describe('Input', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('border')
    })

    it('should render with placeholder', () => {
      const { getByPlaceholderText } = render(<Input placeholder="Enter text" />)

      expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with initial value (controlled)', () => {
      const { getByRole } = render(<Input value="Initial value" />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Initial value')
    })

    it('should render with defaultValue (uncontrolled)', () => {
      const { getByRole } = render(<Input defaultValue="Default value" />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Default value')
    })

    it('should apply custom className', () => {
      const { container } = render(<Input className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('should pass through native attributes', () => {
      const { getByRole } = render(
        <Input data-testid="test-input" title="Input title" aria-describedby="input-help" />
      )

      const input = getByRole('textbox')
      expect(input).toHaveAttribute('data-testid', 'test-input')
      expect(input).toHaveAttribute('title', 'Input title')
      expect(input).toHaveAttribute('aria-describedby', 'input-help')
    })

    it('should render wrapper div with correct structure', () => {
      const { container } = render(<Input />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.tagName).toBe('DIV')
      expect(wrapper).toHaveClass('relative')
      expect(wrapper).toHaveClass('w-full')
    })

    it('should apply style prop to wrapper', () => {
      const { container } = render(<Input style={{ width: '200px' }} />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ width: '200px' })
    })
  })

  describe('Affix', () => {
    it('should render prefix', () => {
      const { getByText } = render(<Input prefix="Pre" />)
      expect(getByText('Pre')).toBeInTheDocument()
    })

    it('should render suffix', () => {
      const { getByText } = render(<Input suffix="Suf" />)
      expect(getByText('Suf')).toBeInTheDocument()
    })

    it('should render both prefix and suffix together', () => {
      const { getByText } = render(<Input prefix="$" suffix=".00" />)
      expect(getByText('$')).toBeInTheDocument()
      expect(getByText('.00')).toBeInTheDocument()
    })

    it('should render prefix as React node', () => {
      const { getByTestId } = render(<Input prefix={<span data-testid="prefix-icon">Icon</span>} />)
      expect(getByTestId('prefix-icon')).toBeInTheDocument()
    })

    it('should render suffix as React node', () => {
      const { getByTestId } = render(<Input suffix={<span data-testid="suffix-icon">Icon</span>} />)
      expect(getByTestId('suffix-icon')).toBeInTheDocument()
    })
  })

  describe('Validation', () => {
    it('should render error status style', () => {
      const { container } = render(<Input status="error" />)
      const input = container.querySelector('input')
      expect(input?.className).toContain('border-red-500')
    })

    it('should render error message', () => {
      const { getByText, queryByText } = render(
        <Input status="error" errorMessage="Bad input" suffix="HiddenSuffix" />
      )
      expect(getByText('Bad input')).toBeInTheDocument()
      expect(queryByText('HiddenSuffix')).not.toBeInTheDocument()
    })

    it('should show suffix when status is error but no errorMessage', () => {
      const { getByText } = render(<Input status="error" suffix="Visible" />)
      expect(getByText('Visible')).toBeInTheDocument()
    })

    it.each(['success', 'warning'] as InputStatus[])('should handle %s status', (status) => {
      const { container } = render(<Input status={status} />)
      const input = container.querySelector('input')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { getByRole } = render(<Input size={size} />)

      const input = getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should handle different input types', () => {
      const types: InputType[] = ['text', 'password', 'email', 'number', 'tel', 'url']

      types.forEach((type) => {
        const { container, unmount } = render(<Input type={type} />)

        const input = container.querySelector('input')
        expect(input).toHaveAttribute('type', type)
        unmount()
      })
    })

    it('should handle search input type', () => {
      const { container } = render(<Input type="search" />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'search')
    })

    it('should apply maxLength attribute', () => {
      const { getByRole } = render(<Input maxLength={10} />)

      expect(getByRole('textbox')).toHaveAttribute('maxlength', '10')
    })

    it('should apply minLength attribute', () => {
      const { getByRole } = render(<Input minLength={3} />)

      expect(getByRole('textbox')).toHaveAttribute('minlength', '3')
    })

    it('should apply name attribute', () => {
      const { getByRole } = render(<Input name="username" />)

      expect(getByRole('textbox')).toHaveAttribute('name', 'username')
    })

    it('should apply id attribute', () => {
      const { container } = render(<Input id="input-id" />)

      expect(container.querySelector('#input-id')).toBeInTheDocument()
    })

    it('should apply autocomplete attribute', () => {
      const { getByRole } = render(<Input autoComplete="email" />)

      expect(getByRole('textbox')).toHaveAttribute('autocomplete', 'email')
    })

    it('should autofocus when autoFocus is true', () => {
      const { getByRole } = render(<Input autoFocus />)

      const input = getByRole('textbox')
      expect(input).toHaveFocus()
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByRole } = render(<Input disabled />)

      const input = getByRole('textbox')
      expect(input).toBeDisabled()
      // Verify disabled styling is applied via class
      expect(input.className).toContain('disabled:')
    })

    it('should be readonly when readonly prop is true', () => {
      const { getByRole } = render(<Input readonly />)

      const input = getByRole('textbox')
      expect(input).toHaveAttribute('readonly')
    })

    it('should show required state', () => {
      const { getByRole } = render(<Input required />)

      expect(getByRole('textbox')).toBeRequired()
    })

    it('should combine disabled and readonly states', () => {
      const { getByRole } = render(<Input disabled readonly />)

      const input = getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveAttribute('readonly')
    })
  })

  describe('Events', () => {
    it('should call onChange handler on input', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { getByRole } = render(<Input onChange={handleChange} />)

      const input = getByRole('textbox')
      await user.type(input, 't')

      expect(handleChange).toHaveBeenCalled()
    })

    it('should call onInput handler', async () => {
      const user = userEvent.setup()
      const handleInput = vi.fn()
      const { getByRole } = render(<Input onInput={handleInput} />)

      const input = getByRole('textbox')
      await user.type(input, 'test')

      expect(handleInput).toHaveBeenCalled()
    })

    it('should call onFocus handler', async () => {
      const user = userEvent.setup()
      const handleFocus = vi.fn()
      const { getByRole } = render(<Input onFocus={handleFocus} />)

      const input = getByRole('textbox')
      await user.click(input)

      expect(handleFocus).toHaveBeenCalled()
    })

    it('should call onBlur handler', async () => {
      const user = userEvent.setup()
      const handleBlur = vi.fn()
      const { getByRole } = render(<Input onBlur={handleBlur} />)

      const input = getByRole('textbox')
      await user.click(input)
      await user.tab()

      expect(handleBlur).toHaveBeenCalled()
    })

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { getByRole } = render(<Input disabled onChange={handleChange} />)

      const input = getByRole('textbox')
      await user.type(input, 'test')

      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should not allow typing when readonly', async () => {
      const user = userEvent.setup()
      const { getByRole } = render(<Input readonly value="initial" />)

      const input = getByRole('textbox') as HTMLInputElement
      await user.type(input, 'test')

      expect(input.value).toBe('initial')
    })

    it('should handle multiple event handlers together', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const handleInput = vi.fn()
      const handleFocus = vi.fn()
      const handleBlur = vi.fn()

      const { getByRole } = render(
        <Input
          onChange={handleChange}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      )

      const input = getByRole('textbox')
      await user.click(input)
      await user.type(input, 'a')
      await user.tab()

      expect(handleFocus).toHaveBeenCalled()
      expect(handleInput).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalled()
      expect(handleBlur).toHaveBeenCalled()
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const TestComponent = () => {
        const [value, setValue] = React.useState('initial')

        return (
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              handleChange(e)
            }}
          />
        )
      }

      const { getByRole } = render(<TestComponent />)
      const input = getByRole('textbox') as HTMLInputElement

      expect(input.value).toBe('initial')

      await user.clear(input)
      await user.type(input, 'updated')

      expect(input.value).toBe('updated')
      expect(handleChange).toHaveBeenCalled()
    })

    it('should work as uncontrolled component', async () => {
      const user = userEvent.setup()
      const { getByRole } = render(<Input defaultValue="initial" />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('initial')

      await user.clear(input)
      await user.type(input, 'updated')

      expect(input.value).toBe('updated')
    })

    it('should handle number type in controlled mode', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [value, setValue] = React.useState<string | number>(0)

        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const val = e.target.value
              setValue(val === '' ? '' : Number(val))
            }}
          />
        )
      }

      const { getByRole } = render(<TestComponent />)
      const input = getByRole('spinbutton') as HTMLInputElement

      expect(input.value).toBe('0')

      await user.clear(input)
      await user.type(input, '42')

      expect(input.value).toBe('42')
    })

    it('should handle empty string value', () => {
      const { getByRole } = render(<Input value="" />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle undefined value (uncontrolled)', () => {
      const { getByRole } = render(<Input defaultValue="" />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle numeric value for text input', () => {
      const { getByRole } = render(<Input value={123} />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('123')
    })
  })

  describe('Type Variants', () => {
    it('should render text input by default', () => {
      const { container } = render(<Input />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render password input', () => {
      const { container } = render(<Input type="password" />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should render email input', () => {
      const { container } = render(<Input type="email" />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render number input with spinbutton role', () => {
      const { getByRole } = render(<Input type="number" />)
      expect(getByRole('spinbutton')).toBeInTheDocument()
    })

    it('should render tel input', () => {
      const { container } = render(<Input type="tel" />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should render url input', () => {
      const { container } = render(<Input type="url" />)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'url')
    })

    it('should handle number input with decimal values', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      const TestComponent = () => {
        const [value, setValue] = React.useState<string | number>('')

        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              handleChange(e)
            }}
          />
        )
      }

      const { getByRole } = render(<TestComponent />)
      const input = getByRole('spinbutton')
      await user.type(input, '3.14')

      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle negative numbers', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      const TestComponent = () => {
        const [value, setValue] = React.useState<string | number>('')

        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              handleChange(e)
            }}
          />
        )
      }

      const { getByRole } = render(<TestComponent />)
      const input = getByRole('spinbutton')
      await user.type(input, '-5')

      expect(handleChange).toHaveBeenCalled()
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

      const { getByRole } = render(<Input placeholder="Themed input" />)

      const input = getByRole('textbox')
      expect(input).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Input placeholder="Accessible input" />)

      await expectNoA11yViolations(container)
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const handleFocus = vi.fn()
      const { getByRole } = render(<Input onFocus={handleFocus} />)

      const input = getByRole('textbox')
      await user.tab()

      expect(input).toHaveFocus()
      expect(handleFocus).toHaveBeenCalled()
    })

    it('should have proper role', () => {
      const { getByRole } = render(<Input />)

      expect(getByRole('textbox')).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      const { getByLabelText } = render(<Input aria-label="Username input" />)

      expect(getByLabelText('Username input')).toBeInTheDocument()
    })

    it('should support aria-invalid for error state', () => {
      const { getByRole } = render(<Input status="error" aria-invalid="true" />)

      const input = getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('should handle Tab key navigation', async () => {
      const user = userEvent.setup()
      const handleFocus = vi.fn()
      const handleBlur = vi.fn()

      const { getByRole } = render(<Input onFocus={handleFocus} onBlur={handleBlur} />)

      const input = getByRole('textbox')

      await user.tab()
      expect(input).toHaveFocus()
      expect(handleFocus).toHaveBeenCalled()

      await user.tab()
      expect(input).not.toHaveFocus()
      expect(handleBlur).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      const { getByRole } = render(<Input value="" />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle whitespace-only value', () => {
      const { getByRole } = render(<Input value={edgeCaseData.whitespace} />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(edgeCaseData.whitespace)
    })

    it('should handle special characters', () => {
      const { getByRole } = render(<Input value={edgeCaseData.specialCharacters} />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(edgeCaseData.specialCharacters)
    })

    it('should handle unicode characters', () => {
      const { getByRole } = render(<Input value={edgeCaseData.unicode} />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(edgeCaseData.unicode)
    })

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000)
      const { getByRole } = render(<Input value={longText} />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(longText)
    })

    it('should handle rapid value changes', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      const TestComponent = () => {
        const [value, setValue] = React.useState('')

        return (
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              handleChange(e)
            }}
          />
        )
      }

      const { getByRole } = render(<TestComponent />)
      const input = getByRole('textbox')

      await user.type(input, 'abc')

      expect(handleChange).toHaveBeenCalledTimes(3)
    })

    it('should handle zero value for number input', () => {
      const { getByRole } = render(<Input type="number" value={0} />)

      const input = getByRole('spinbutton') as HTMLInputElement
      expect(input.value).toBe('0')
    })

    it('should handle maxLength constraint', () => {
      const { getByRole } = render(<Input maxLength={5} />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input).toHaveAttribute('maxlength', '5')
    })

    it('should render without crashing with all props', () => {
      const { getByRole } = render(
        <Input
          value="test"
          size="lg"
          type="text"
          status="error"
          errorMessage="Error"
          prefix="Pre"
          suffix="Suf"
          placeholder="Placeholder"
          disabled={false}
          readonly={false}
          required={true}
          maxLength={100}
          minLength={1}
          name="test-input"
          id="test-id"
          autoComplete="off"
          autoFocus={false}
          className="custom-class"
          style={{ width: '100%' }}
        />
      )

      expect(getByRole('textbox')).toBeInTheDocument()
    })

    it('should handle HTML-like content safely', () => {
      const htmlContent = '<script>alert("xss")</script>'
      const { getByRole } = render(<Input value={htmlContent} />)

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(htmlContent)
    })
  })

  describe('Shake Animation', () => {
    it('should trigger shake animation when status changes to error', () => {
      const { container, rerender } = render(<Input status="default" />)

      rerender(<Input status="error" />)

      const wrapper = container.firstChild as HTMLElement
      // The shake class should be applied
      expect(wrapper.className).toContain('tiger-animate-shake')
    })
  })
})
