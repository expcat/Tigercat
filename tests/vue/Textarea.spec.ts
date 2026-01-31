/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { nextTick } from 'vue'
import { Textarea } from '@expcat/tigercat-vue'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
  edgeCaseData
} from '../utils'

describe('Textarea', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Textarea)

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveClass('block')
      expect(textarea).toHaveClass('border')
    })

    it('should render with placeholder', () => {
      const { getByPlaceholderText } = renderWithProps(Textarea, {
        placeholder: 'Enter text'
      })

      expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with initial value', () => {
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: 'Initial value'
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('Initial value')
    })

    it('should forward attrs (data/aria/title)', () => {
      const { getByRole } = render(Textarea, {
        attrs: {
          'data-testid': 'test-textarea',
          title: 'Textarea title',
          'aria-describedby': 'textarea-help'
        }
      })

      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('data-testid', 'test-textarea')
      expect(textarea).toHaveAttribute('title', 'Textarea title')
      expect(textarea).toHaveAttribute('aria-describedby', 'textarea-help')
    })

    it('should render wrapper div', () => {
      const { container } = render(Textarea)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.tagName).toBe('DIV')
      expect(wrapper).toHaveClass('w-full')
    })

    it('should apply className prop to textarea', () => {
      const { getByRole } = render(Textarea, {
        props: { className: 'custom-textarea-class' }
      })
      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('custom-textarea-class')
    })

    it('should merge class from attrs with className prop', () => {
      const { getByRole } = render(Textarea, {
        props: { className: 'from-prop' },
        attrs: { class: 'from-attr' }
      })
      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('from-prop')
      expect(textarea).toHaveClass('from-attr')
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { getByRole } = renderWithProps(Textarea, { size })
      expect(getByRole('textbox')).toBeInTheDocument()
    })

    it('should apply common native attributes', () => {
      const { getByRole } = renderWithProps(Textarea, {
        rows: 5,
        maxLength: 10,
        minLength: 2,
        name: 'description',
        id: 'textarea-id',
        autoComplete: 'off',
        autoFocus: true
      })

      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '5')
      expect(textarea).toHaveAttribute('maxlength', '10')
      expect(textarea).toHaveAttribute('minlength', '2')
      expect(textarea).toHaveAttribute('name', 'description')
      expect(textarea).toHaveAttribute('id', 'textarea-id')
      expect(textarea).toHaveAttribute('autocomplete', 'off')
      expect(textarea).toHaveAttribute('autofocus')
    })

    it('should use default rows of 3', () => {
      const { getByRole } = render(Textarea)
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '3')
    })

    it('should apply style prop', () => {
      const { getByRole } = render(Textarea, {
        props: { style: { minHeight: '100px' } }
      })
      const textarea = getByRole('textbox')
      expect(textarea).toHaveStyle({ minHeight: '100px' })
    })
  })

  describe('Rows Control', () => {
    it('should set custom rows value', () => {
      const { getByRole } = renderWithProps(Textarea, { rows: 10 })
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '10')
    })

    it('should handle rows value of 1', () => {
      const { getByRole } = renderWithProps(Textarea, { rows: 1 })
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '1')
    })

    it('should handle large rows value', () => {
      const { getByRole } = renderWithProps(Textarea, { rows: 50 })
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '50')
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByRole } = renderWithProps(Textarea, {
        disabled: true
      })

      const textarea = getByRole('textbox')
      expect(textarea).toBeDisabled()
      expect(textarea.className).toContain('disabled:')
    })

    it('should be readonly when readonly prop is true', () => {
      const { getByRole } = renderWithProps(Textarea, {
        readonly: true
      })

      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('readonly')
    })

    it('should show required state', () => {
      const { getByRole } = renderWithProps(Textarea, {
        required: true
      })

      expect(getByRole('textbox')).toBeRequired()
    })

    it('should combine disabled and readonly states', () => {
      const { getByRole } = renderWithProps(Textarea, {
        disabled: true,
        readonly: true
      })

      const textarea = getByRole('textbox')
      expect(textarea).toBeDisabled()
      expect(textarea).toHaveAttribute('readonly')
    })
  })

  describe('Events', () => {
    it('should emit update:modelValue on input', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          'onUpdate:modelValue': onUpdate
        }
      })

      const textarea = getByRole('textbox')
      await fireEvent.update(textarea, 'test')

      expect(onUpdate).toHaveBeenCalledWith('test')
    })

    it('should emit input event', async () => {
      const onInput = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          onInput
        }
      })

      const textarea = getByRole('textbox')
      await fireEvent.input(textarea, { target: { value: 'test' } })

      expect(onInput).toHaveBeenCalled()
    })

    it('should emit change event', async () => {
      const onChange = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          onChange
        }
      })

      const textarea = getByRole('textbox')
      await fireEvent.change(textarea, { target: { value: 'test' } })

      expect(onChange).toHaveBeenCalled()
    })

    it('should emit focus event', async () => {
      const onFocus = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          onFocus
        }
      })

      const textarea = getByRole('textbox')
      await fireEvent.focus(textarea)

      expect(onFocus).toHaveBeenCalled()
    })

    it('should emit blur event', async () => {
      const onBlur = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          onBlur
        }
      })

      const textarea = getByRole('textbox')
      await fireEvent.blur(textarea)

      expect(onBlur).toHaveBeenCalled()
    })

    it('should emit focus and blur events', async () => {
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          onFocus,
          onBlur
        }
      })

      const textarea = getByRole('textbox')
      await fireEvent.focus(textarea)
      await fireEvent.blur(textarea)

      expect(onFocus).toHaveBeenCalled()
      expect(onBlur).toHaveBeenCalled()
    })

    it('should not emit events when disabled', async () => {
      const onUpdate = vi.fn()
      const onInput = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          disabled: true,
          'onUpdate:modelValue': onUpdate,
          onInput
        }
      })

      const textarea = getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('should handle Tab key navigation', async () => {
      const user = userEvent.setup()
      const onFocus = vi.fn()
      const onBlur = vi.fn()

      const { getByRole } = render(Textarea, {
        props: { onFocus, onBlur }
      })

      const textarea = getByRole('textbox')

      await user.tab()
      expect(textarea).toHaveFocus()
      expect(onFocus).toHaveBeenCalled()

      await user.tab()
      expect(textarea).not.toHaveFocus()
      expect(onBlur).toHaveBeenCalled()
    })
  })

  describe('v-model binding', () => {
    it('should update value when modelValue changes', async () => {
      const { getByRole, rerender } = renderWithProps(Textarea, {
        modelValue: 'initial'
      })

      let textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('initial')

      await rerender({ modelValue: 'updated' })
      textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('updated')
    })

    it('should handle empty string modelValue', () => {
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: ''
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('should handle undefined modelValue', () => {
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: undefined
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: multilineText
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(multilineText)
    })

    it('should sync localValue with modelValue changes', async () => {
      const { getByRole, rerender } = renderWithProps(Textarea, {
        modelValue: 'first'
      })

      let textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('first')

      await rerender({ modelValue: 'second' })
      textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('second')

      await rerender({ modelValue: '' })
      textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })
  })

  describe('AutoResize', () => {
    it('should have resize-y class when autoResize is false', () => {
      const { getByRole } = renderWithProps(Textarea, {
        autoResize: false
      })

      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('resize-y')
    })

    it('should have resize-none class when autoResize is true', () => {
      const { getByRole } = renderWithProps(Textarea, {
        autoResize: true
      })

      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('resize-none')
    })

    it('should accept minRows prop', () => {
      const { getByRole } = renderWithProps(Textarea, {
        autoResize: true,
        minRows: 2
      })

      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should accept maxRows prop', () => {
      const { getByRole } = renderWithProps(Textarea, {
        autoResize: true,
        maxRows: 10
      })

      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should accept both minRows and maxRows props', () => {
      const { getByRole } = renderWithProps(Textarea, {
        autoResize: true,
        minRows: 3,
        maxRows: 10
      })

      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should trigger height adjustment on input when autoResize is true', async () => {
      const onInput = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          autoResize: true,
          onInput
        }
      })

      const textarea = getByRole('textbox')
      await fireEvent.input(textarea, { target: { value: 'New content' } })

      expect(onInput).toHaveBeenCalled()
    })
  })

  describe('Resize Modes', () => {
    it('should allow vertical resize by default', () => {
      const { getByRole } = render(Textarea)
      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('resize-y')
    })

    it('should disable resize when autoResize is enabled', () => {
      const { getByRole } = renderWithProps(Textarea, {
        autoResize: true
      })

      const textarea = getByRole('textbox')
      expect(textarea).toHaveClass('resize-none')
    })
  })

  describe('Character Count (showCount)', () => {
    it('shows count when showCount is enabled', () => {
      renderWithProps(Textarea, {
        modelValue: 'abc',
        showCount: true,
        maxLength: 10
      })

      expect(screen.getByText('3/10')).toBeInTheDocument()
    })

    it('shows count without maxLength', () => {
      renderWithProps(Textarea, {
        modelValue: 'hello',
        showCount: true
      })

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('shows zero count for empty value', () => {
      renderWithProps(Textarea, {
        modelValue: '',
        showCount: true
      })

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('shows count with maxLength for empty value', () => {
      renderWithProps(Textarea, {
        modelValue: '',
        showCount: true,
        maxLength: 100
      })

      expect(screen.getByText('0/100')).toBeInTheDocument()
    })

    it('updates count on input', async () => {
      const onUpdate = vi.fn()
      const { getByRole, rerender } = render(Textarea, {
        props: {
          modelValue: 'ab',
          showCount: true,
          maxLength: 10,
          'onUpdate:modelValue': onUpdate
        }
      })

      expect(screen.getByText('2/10')).toBeInTheDocument()

      await rerender({ modelValue: 'abcd', showCount: true, maxLength: 10 })

      expect(screen.getByText('4/10')).toBeInTheDocument()
    })

    it('does not show count when showCount is false', () => {
      const { container } = renderWithProps(Textarea, {
        modelValue: 'abc',
        showCount: false,
        maxLength: 10
      })

      expect(container).not.toHaveTextContent('3/10')
    })

    it('count container has correct classes', () => {
      const { container } = renderWithProps(Textarea, {
        modelValue: 'test',
        showCount: true
      })

      const countDiv = container.querySelector('.text-right')
      expect(countDiv).toBeInTheDocument()
      expect(countDiv).toHaveClass('text-sm')
      expect(countDiv).toHaveClass('text-gray-500')
    })
  })

  describe('MaxLength', () => {
    it('should apply maxLength attribute', () => {
      const { getByRole } = renderWithProps(Textarea, {
        maxLength: 100
      })

      expect(getByRole('textbox')).toHaveAttribute('maxlength', '100')
    })

    it('should work with showCount', () => {
      renderWithProps(Textarea, {
        modelValue: 'test',
        maxLength: 10,
        showCount: true
      })

      expect(screen.getByText('4/10')).toBeInTheDocument()
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

      const { getByRole } = renderWithProps(Textarea, {
        placeholder: 'Themed textarea'
      })

      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(Textarea, {
        attrs: {
          'aria-label': 'Description textarea'
        }
      })

      await expectNoA11yViolations(container)
    })

    it('should be keyboard accessible', async () => {
      const onFocus = vi.fn()
      const { getByRole } = render(Textarea, {
        props: { onFocus }
      })

      const textarea = getByRole('textbox')
      textarea.focus()

      expect(textarea).toHaveFocus()
      expect(onFocus).toHaveBeenCalled()
    })

    it('should have proper role', () => {
      const { getByRole } = render(Textarea)

      expect(getByRole('textbox')).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      const { getByLabelText } = render(Textarea, {
        attrs: {
          'aria-label': 'Comments textarea'
        }
      })

      expect(getByLabelText('Comments textarea')).toBeInTheDocument()
    })

    it('should support aria-invalid for error state', () => {
      const { getByRole } = render(Textarea, {
        attrs: { 'aria-invalid': 'true' }
      })

      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: ''
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('should handle whitespace-only value', () => {
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: edgeCaseData.whitespace
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(edgeCaseData.whitespace)
    })

    it('should handle special characters', () => {
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: edgeCaseData.specialCharacters
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(edgeCaseData.specialCharacters)
    })

    it('should handle unicode characters', () => {
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: edgeCaseData.unicode
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(edgeCaseData.unicode)
    })

    it('should handle very long text', () => {
      const longText = 'a'.repeat(5000)
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: longText
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(longText)
    })

    it('should handle text with many newlines', () => {
      const textWithNewlines = 'Line1\nLine2\nLine3\nLine4\nLine5'
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: textWithNewlines
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(textWithNewlines)
    })

    it('should handle rapid value changes', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Textarea, {
        props: { 'onUpdate:modelValue': onUpdate }
      })

      const textarea = getByRole('textbox')

      await fireEvent.input(textarea, { target: { value: 'a' } })
      await fireEvent.input(textarea, { target: { value: 'ab' } })
      await fireEvent.input(textarea, { target: { value: 'abc' } })

      expect(onUpdate).toHaveBeenCalledTimes(3)
    })

    it('should render without crashing with all props', () => {
      const { getByRole } = render(Textarea, {
        props: {
          modelValue: 'test content',
          size: 'lg',
          placeholder: 'Enter description',
          disabled: false,
          readonly: false,
          required: true,
          rows: 5,
          autoResize: false,
          maxRows: 10,
          minRows: 2,
          maxLength: 500,
          minLength: 10,
          name: 'description',
          id: 'textarea-id',
          autoComplete: 'off',
          autoFocus: false,
          showCount: true,
          className: 'custom-class',
          style: { width: '100%' }
        }
      })

      expect(getByRole('textbox')).toBeInTheDocument()
    })

    it('should handle HTML-like content safely', () => {
      const htmlContent = '<script>alert("xss")</script>'
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: htmlContent
      })

      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(htmlContent)
    })

    it('should correctly count unicode characters', () => {
      const unicodeText = '你好世界🌍'
      renderWithProps(Textarea, {
        modelValue: unicodeText,
        showCount: true
      })

      // Unicode characters should be counted correctly
      expect(screen.getByText(String(unicodeText.length))).toBeInTheDocument()
    })
  })
})
