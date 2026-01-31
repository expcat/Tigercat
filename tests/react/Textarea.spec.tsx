/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Textarea } from '@expcat/tigercat-react'
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
  edgeCaseData
} from '../utils/react'

describe('Textarea', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Textarea />)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveClass('block')
      expect(textarea).toHaveClass('border')
    })

    it('renders with placeholder', () => {
      const { getByPlaceholderText } = render(<Textarea placeholder="Enter text" />)
      expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders with initial value (controlled)', () => {
      const { getByRole } = render(<Textarea value="Initial value" />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('Initial value')
    })

    it('renders with defaultValue (uncontrolled)', () => {
      const { getByRole } = render(<Textarea defaultValue="Default value" />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('Default value')
    })

    it('passes through native attributes', () => {
      render(
        <Textarea
          data-testid="test-textarea"
          title="Textarea title"
          aria-describedby="textarea-help"
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('data-testid', 'test-textarea')
      expect(textarea).toHaveAttribute('title', 'Textarea title')
      expect(textarea).toHaveAttribute('aria-describedby', 'textarea-help')
    })

    it('renders wrapper div with correct structure', () => {
      const { container } = render(<Textarea />)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.tagName).toBe('DIV')
      expect(wrapper).toHaveClass('w-full')
    })

    it('applies custom className to textarea', () => {
      const { getByRole } = render(<Textarea className="custom-class" />)
      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('custom-class')
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('supports size %s', (size) => {
      render(<Textarea size={size} />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('supports common native props', () => {
      render(
        <Textarea
          rows={5}
          maxLength={10}
          minLength={2}
          name="description"
          id="textarea-id"
          autoComplete="off"
          autoFocus
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '5')
      expect(textarea).toHaveAttribute('maxlength', '10')
      expect(textarea).toHaveAttribute('minlength', '2')
      expect(textarea).toHaveAttribute('name', 'description')
      expect(textarea).toHaveAttribute('id', 'textarea-id')
      expect(textarea).toHaveAttribute('autocomplete', 'off')
      expect(textarea).toHaveFocus()
    })

    it('uses default rows of 3', () => {
      const { getByRole } = render(<Textarea />)
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '3')
    })

    it('applies custom rows value', () => {
      const { getByRole } = render(<Textarea rows={10} />)
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '10')
    })
  })

  describe('Rows Control', () => {
    it('should set custom rows value', () => {
      const { getByRole } = render(<Textarea rows={10} />)
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '10')
    })

    it('should handle rows value of 1', () => {
      const { getByRole } = render(<Textarea rows={1} />)
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '1')
    })

    it('should handle large rows value', () => {
      const { getByRole } = render(<Textarea rows={50} />)
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '50')
    })
  })

  describe('States', () => {
    it('is disabled when disabled prop is true', () => {
      const { getByRole } = render(<Textarea disabled />)

      const textarea = getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('is readonly when readonly prop is true', () => {
      const { getByRole } = render(<Textarea readonly />)

      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('readonly')
    })

    it('shows required state', () => {
      const { getByRole } = render(<Textarea required />)

      expect(getByRole('textbox')).toBeRequired()
    })

    it('combines disabled and readonly states', () => {
      const { getByRole } = render(<Textarea disabled readonly />)

      const textarea = getByRole('textbox')
      expect(textarea).toBeDisabled()
      expect(textarea).toHaveAttribute('readonly')
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('handles controlled and uncontrolled values', async () => {
      const user = userEvent.setup()

      const { rerender } = render(<Textarea value="initial" />)
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('initial')

      rerender(<Textarea value={'Line 1\nLine 2'} />)
      expect(textarea.value).toBe('Line 1\nLine 2')

      const { unmount } = render(<Textarea defaultValue="default" />)
      const uncontrolled = screen.getAllByRole('textbox')[1] as HTMLTextAreaElement
      expect(uncontrolled.value).toBe('default')
      await user.type(uncontrolled, 'x')
      expect(uncontrolled.value).toBe('defaultx')
      unmount()
    })

    it('works as controlled component', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      const TestComponent = () => {
        const [value, setValue] = React.useState('initial')

        return (
          <Textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              handleChange(e)
            }}
          />
        )
      }

      const { getByRole } = render(<TestComponent />)
      const textarea = getByRole('textbox') as HTMLTextAreaElement

      expect(textarea.value).toBe('initial')

      await user.clear(textarea)
      await user.type(textarea, 'updated')

      expect(textarea.value).toBe('updated')
      expect(handleChange).toHaveBeenCalled()
    })

    it('works as uncontrolled component', async () => {
      const user = userEvent.setup()
      const { getByRole } = render(<Textarea defaultValue="initial" />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('initial')

      await user.clear(textarea)
      await user.type(textarea, 'updated')

      expect(textarea.value).toBe('updated')
    })

    it('handles multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      const { getByRole } = render(<Textarea value={multilineText} />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(multilineText)
    })
  })

  describe('Events', () => {
    it('handles events', async () => {
      const user = userEvent.setup()
      const onInput = vi.fn()
      const onChange = vi.fn()
      const onFocus = vi.fn()
      const onBlur = vi.fn()

      const { getByRole } = render(
        <Textarea onInput={onInput} onChange={onChange} onFocus={onFocus} onBlur={onBlur} />
      )

      const textarea = getByRole('textbox')
      await user.click(textarea)
      expect(onFocus).toHaveBeenCalled()

      await user.type(textarea, 'a')
      expect(onInput).toHaveBeenCalled()
      expect(onChange).toHaveBeenCalled()

      await user.tab()
      expect(onBlur).toHaveBeenCalled()
    })

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { getByRole } = render(<Textarea disabled onChange={onChange} />)

      const textarea = getByRole('textbox')
      expect(textarea).toBeDisabled()

      await user.type(textarea, 'test')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not allow typing when readonly', async () => {
      const user = userEvent.setup()
      const { getByRole } = render(<Textarea readonly value="fixed" />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      await user.type(textarea, 'x')
      expect(textarea.value).toBe('fixed')
    })

    it('handles Tab key navigation', async () => {
      const user = userEvent.setup()
      const onFocus = vi.fn()
      const onBlur = vi.fn()

      const { getByRole } = render(<Textarea onFocus={onFocus} onBlur={onBlur} />)

      const textarea = getByRole('textbox')

      await user.tab()
      expect(textarea).toHaveFocus()
      expect(onFocus).toHaveBeenCalled()

      await user.tab()
      expect(textarea).not.toHaveFocus()
      expect(onBlur).toHaveBeenCalled()
    })

    it('handles multiple event handlers together', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const handleInput = vi.fn()
      const handleFocus = vi.fn()
      const handleBlur = vi.fn()

      const { getByRole } = render(
        <Textarea
          onChange={handleChange}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      )

      const textarea = getByRole('textbox')
      await user.click(textarea)
      await user.type(textarea, 'a')
      await user.tab()

      expect(handleFocus).toHaveBeenCalled()
      expect(handleInput).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalled()
      expect(handleBlur).toHaveBeenCalled()
    })
  })

  describe('AutoResize', () => {
    it('has resize-y class when autoResize is false', () => {
      const { getByRole } = render(<Textarea autoResize={false} />)

      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('resize-y')
    })

    it('has resize-none class when autoResize is true', () => {
      const { getByRole } = render(<Textarea autoResize />)

      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('resize-none')
    })

    it('accepts minRows prop', () => {
      const { getByRole } = render(<Textarea autoResize minRows={2} />)

      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('accepts maxRows prop', () => {
      const { getByRole } = render(<Textarea autoResize maxRows={10} />)

      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('accepts both minRows and maxRows props', () => {
      const { getByRole } = render(<Textarea autoResize minRows={3} maxRows={10} />)

      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('triggers height adjustment on input when autoResize is true', async () => {
      const user = userEvent.setup()
      const onInput = vi.fn()

      const { getByRole } = render(<Textarea autoResize onInput={onInput} />)

      const textarea = getByRole('textbox')
      await user.type(textarea, 'New content')

      expect(onInput).toHaveBeenCalled()
    })
  })

  describe('Resize Modes', () => {
    it('allows vertical resize by default', () => {
      const { getByRole } = render(<Textarea />)
      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('resize-y')
    })

    it('disables resize when autoResize is enabled', () => {
      const { getByRole } = render(<Textarea autoResize />)

      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('resize-none')
    })
  })

  describe('Character Count (showCount)', () => {
    it('shows count when showCount is enabled', () => {
      render(<Textarea defaultValue="abc" showCount maxLength={10} />)
      expect(screen.getByText('3/10')).toBeInTheDocument()
    })

    it('shows count without maxLength', () => {
      render(<Textarea defaultValue="hello" showCount />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('shows zero count for empty value', () => {
      render(<Textarea defaultValue="" showCount />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('shows count with maxLength for empty value', () => {
      render(<Textarea defaultValue="" showCount maxLength={100} />)
      expect(screen.getByText('0/100')).toBeInTheDocument()
    })

    it('updates count on input', async () => {
      const user = userEvent.setup()

      const TestComponent = () => {
        const [value, setValue] = React.useState('ab')

        return <Textarea value={value} onChange={(e) => setValue(e.target.value)} showCount maxLength={10} />
      }

      const { getByRole } = render(<TestComponent />)

      expect(screen.getByText('2/10')).toBeInTheDocument()

      const textarea = getByRole('textbox')
      await user.type(textarea, 'cd')

      expect(screen.getByText('4/10')).toBeInTheDocument()
    })

    it('does not show count when showCount is false', () => {
      const { container } = render(<Textarea defaultValue="abc" showCount={false} maxLength={10} />)
      expect(container).not.toHaveTextContent('3/10')
    })

    it('count container has correct classes', () => {
      const { container } = render(<Textarea defaultValue="test" showCount />)

      const countDiv = container.querySelector('.text-right')
      expect(countDiv).toBeInTheDocument()
      expect(countDiv).toHaveClass('text-sm')
      expect(countDiv).toHaveClass('text-gray-500')
    })
  })

  describe('MaxLength', () => {
    it('applies maxLength attribute', () => {
      const { getByRole } = render(<Textarea maxLength={100} />)

      expect(getByRole('textbox')).toHaveAttribute('maxlength', '100')
    })

    it('works with showCount', () => {
      render(<Textarea defaultValue="test" maxLength={10} showCount />)

      expect(screen.getByText('4/10')).toBeInTheDocument()
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('supports custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000'
      })

      const { getByRole } = render(<Textarea placeholder="Themed textarea" />)

      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Textarea aria-label="Description" />)
      await expectNoA11yViolations(container)
    })

    it('is keyboard accessible', async () => {
      const onFocus = vi.fn()
      const { getByRole } = render(<Textarea onFocus={onFocus} />)

      const textarea = getByRole('textbox')
      textarea.focus()

      expect(textarea).toHaveFocus()
      expect(onFocus).toHaveBeenCalled()
    })

    it('has proper role', () => {
      const { getByRole } = render(<Textarea />)

      expect(getByRole('textbox')).toBeInTheDocument()
    })

    it('supports aria-label', () => {
      const { getByLabelText } = render(<Textarea aria-label="Comments textarea" />)

      expect(getByLabelText('Comments textarea')).toBeInTheDocument()
    })

    it('supports aria-invalid for error state', () => {
      const { getByRole } = render(<Textarea aria-invalid="true" />)

      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty string value', () => {
      const { getByRole } = render(<Textarea value="" />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('handles whitespace-only value', () => {
      const { getByRole } = render(<Textarea value={edgeCaseData.whitespace} />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(edgeCaseData.whitespace)
    })

    it('handles special characters', () => {
      const { getByRole } = render(<Textarea value={edgeCaseData.specialCharacters} />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(edgeCaseData.specialCharacters)
    })

    it('handles unicode characters', () => {
      const { getByRole } = render(<Textarea value={edgeCaseData.unicode} />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(edgeCaseData.unicode)
    })

    it('handles very long text', () => {
      const longText = 'a'.repeat(5000)
      const { getByRole } = render(<Textarea value={longText} />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(longText)
    })

    it('handles text with many newlines', () => {
      const textWithNewlines = 'Line1\nLine2\nLine3\nLine4\nLine5'
      const { getByRole } = render(<Textarea value={textWithNewlines} />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(textWithNewlines)
    })

    it('handles rapid value changes', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      const TestComponent = () => {
        const [value, setValue] = React.useState('')

        return (
          <Textarea
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              handleChange(e)
            }}
          />
        )
      }

      const { getByRole } = render(<TestComponent />)
      const textarea = getByRole('textbox')

      await user.type(textarea, 'abc')

      expect(handleChange).toHaveBeenCalledTimes(3)
    })

    it('renders without crashing with all props', () => {
      const { getByRole } = render(
        <Textarea
          value="test content"
          size="lg"
          placeholder="Enter description"
          disabled={false}
          readonly={false}
          required={true}
          rows={5}
          autoResize={false}
          maxRows={10}
          minRows={2}
          maxLength={500}
          minLength={10}
          name="description"
          id="textarea-id"
          autoComplete="off"
          showCount={true}
          className="custom-class"
        />
      )

      expect(getByRole('textbox')).toBeInTheDocument()
    })

    it('handles HTML-like content safely', () => {
      const htmlContent = '<script>alert("xss")</script>'
      const { getByRole } = render(<Textarea value={htmlContent} />)

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(htmlContent)
    })

    it('correctly counts unicode characters', () => {
      const unicodeText = '你好世界🌍'
      render(<Textarea value={unicodeText} showCount />)

      // Unicode characters should be counted correctly
      expect(screen.getByText(String(unicodeText.length))).toBeInTheDocument()
    })
  })

  describe('Ref Forwarding', () => {
    it('forwards ref to textarea element', () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    })

    it('allows imperative focus via ref', () => {
      const ref = React.createRef<HTMLTextAreaElement>()
      render(<Textarea ref={ref} />)

      ref.current?.focus()
      expect(ref.current).toHaveFocus()
    })
  })
})
