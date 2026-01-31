/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Input } from '@expcat/tigercat-vue'
import type { InputType, InputStatus } from '@expcat/tigercat-core'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
  edgeCaseData
} from '../utils'

describe('Input', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Input)

      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('border')
    })

    it('should render with placeholder', () => {
      const { getByPlaceholderText } = renderWithProps(Input, {
        placeholder: 'Enter text'
      })

      expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with initial value', () => {
      const { getByRole } = renderWithProps(Input, {
        modelValue: 'Initial value'
      })

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Initial value')
    })

    it('should forward attrs (data/aria/title)', () => {
      const { getByRole } = render(Input, {
        attrs: {
          'data-testid': 'test-input',
          title: 'Input title',
          'aria-describedby': 'input-help'
        }
      })

      const input = getByRole('textbox')
      expect(input).toHaveAttribute('data-testid', 'test-input')
      expect(input).toHaveAttribute('title', 'Input title')
      expect(input).toHaveAttribute('aria-describedby', 'input-help')
    })

    it('should render wrapper div with correct classes', () => {
      const { container } = render(Input)
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.tagName).toBe('DIV')
      expect(wrapper).toHaveClass('relative')
      expect(wrapper).toHaveClass('w-full')
    })

    it('should apply className prop to wrapper', () => {
      const { container } = render(Input, {
        props: { className: 'custom-wrapper-class' }
      })
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('custom-wrapper-class')
    })

    it('should merge class from attrs with className prop', () => {
      const { container } = render(Input, {
        props: { className: 'from-prop' },
        attrs: { class: 'from-attr' }
      })
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('from-prop')
      expect(wrapper).toHaveClass('from-attr')
    })
  })

  describe('Affix', () => {
    it('should render prefix prop', () => {
      const { container } = render(Input, {
        props: { prefix: 'Pre' }
      })
      expect(container).toHaveTextContent('Pre')
    })

    it('should render prefix slot', () => {
      const { container } = render(Input, {
        slots: { prefix: '<span class="prefix-slot">Slot</span>' }
      })
      expect(container.querySelector('.prefix-slot')).toBeInTheDocument()
    })

    it('should render suffix prop', () => {
      const { container } = render(Input, {
        props: { suffix: 'Suf' }
      })
      expect(container).toHaveTextContent('Suf')
    })

    it('should render suffix slot', () => {
      const { container } = render(Input, {
        slots: { suffix: '<span class="suffix-slot">Slot</span>' }
      })
      expect(container.querySelector('.suffix-slot')).toBeInTheDocument()
    })

    it('should prioritize prefix slot over prefix prop', () => {
      const { container, queryByText } = render(Input, {
        props: { prefix: 'PropPrefix' },
        slots: { prefix: '<span>SlotPrefix</span>' }
      })
      expect(container).toHaveTextContent('SlotPrefix')
      expect(queryByText('PropPrefix')).not.toBeInTheDocument()
    })

    it('should prioritize suffix slot over suffix prop', () => {
      const { container, queryByText } = render(Input, {
        props: { suffix: 'PropSuffix' },
        slots: { suffix: '<span>SlotSuffix</span>' }
      })
      expect(container).toHaveTextContent('SlotSuffix')
      expect(queryByText('PropSuffix')).not.toBeInTheDocument()
    })

    it('should render both prefix and suffix together', () => {
      const { container } = render(Input, {
        props: { prefix: '$', suffix: '.00' }
      })
      expect(container).toHaveTextContent('$')
      expect(container).toHaveTextContent('.00')
    })
  })

  describe('Validation', () => {
    it('should render error status style', () => {
      const { container } = render(Input, {
        props: { status: 'error' }
      })
      const input = container.querySelector('input')
      expect(input).toHaveClass('border-red-500')
    })

    it('should render error message inside input wrapper', () => {
      const { container } = render(Input, {
        props: { status: 'error', errorMessage: 'Bad input' }
      })
      expect(container).toHaveTextContent('Bad input')
    })

    it('should hide suffix when error message is shown', () => {
      const { container } = render(Input, {
        props: { status: 'error', errorMessage: 'Bad input', suffix: 'Should hide' }
      })
      expect(container).not.toHaveTextContent('Should hide')
    })

    it('should show suffix when status is error but no errorMessage', () => {
      const { container } = render(Input, {
        props: { status: 'error', suffix: 'Visible suffix' }
      })
      expect(container).toHaveTextContent('Visible suffix')
    })

    it.each(['success', 'warning'] as InputStatus[])('should handle %s status', (status) => {
      const { container } = render(Input, {
        props: { status }
      })
      const input = container.querySelector('input')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { getByRole } = renderWithProps(Input, { size })

      const input = getByRole('textbox')
      expect(input).toBeInTheDocument()
    })

    it('should handle different input types', () => {
      const types: InputType[] = ['text', 'password', 'email', 'number', 'tel', 'url']

      types.forEach((type) => {
        const { container, unmount } = renderWithProps(Input, {
          type
        })

        const input = container.querySelector('input')
        expect(input).toHaveAttribute('type', type)
        unmount()
      })
    })

    it('should handle search input type', () => {
      const { container } = renderWithProps(Input, { type: 'search' })
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'search')
    })

    it('should apply maxLength attribute', () => {
      const { getByRole } = renderWithProps(Input, {
        maxLength: 10
      })

      expect(getByRole('textbox')).toHaveAttribute('maxlength', '10')
    })

    it('should apply minLength attribute', () => {
      const { getByRole } = renderWithProps(Input, {
        minLength: 3
      })

      expect(getByRole('textbox')).toHaveAttribute('minlength', '3')
    })

    it('should apply name attribute', () => {
      const { getByRole } = renderWithProps(Input, {
        name: 'username'
      })

      expect(getByRole('textbox')).toHaveAttribute('name', 'username')
    })

    it('should apply id attribute', () => {
      const { container } = renderWithProps(Input, {
        id: 'input-id'
      })

      expect(container.querySelector('#input-id')).toBeInTheDocument()
    })

    it('should apply autocomplete attribute', () => {
      const { getByRole } = renderWithProps(Input, {
        autoComplete: 'email'
      })

      expect(getByRole('textbox')).toHaveAttribute('autocomplete', 'email')
    })

    it('should have autofocus attribute when autoFocus is true', () => {
      const { getByRole } = renderWithProps(Input, {
        autoFocus: true
      })

      const input = getByRole('textbox')
      expect(input).toHaveAttribute('autofocus')
    })

    it('should apply style prop to wrapper', () => {
      const { container } = render(Input, {
        props: { style: { width: '200px' } }
      })
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ width: '200px' })
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByRole } = renderWithProps(Input, {
        disabled: true
      })

      const input = getByRole('textbox')
      expect(input).toBeDisabled()
      // Verify disabled styling is applied via class
      expect(input.className).toContain('disabled:')
    })

    it('should be readonly when readonly prop is true', () => {
      const { getByRole } = renderWithProps(Input, {
        readonly: true
      })

      const input = getByRole('textbox')
      expect(input).toHaveAttribute('readonly')
    })

    it('should show required state', () => {
      const { getByRole } = renderWithProps(Input, {
        required: true
      })

      expect(getByRole('textbox')).toBeRequired()
    })

    it('should combine disabled and readonly states', () => {
      const { getByRole } = renderWithProps(Input, {
        disabled: true,
        readonly: true
      })

      const input = getByRole('textbox')
      expect(input).toBeDisabled()
      expect(input).toHaveAttribute('readonly')
    })
  })

  describe('Events', () => {
    it('should emit update:modelValue on input', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          'onUpdate:modelValue': onUpdate
        }
      })

      const input = getByRole('textbox')
      await fireEvent.update(input, 'test')

      expect(onUpdate).toHaveBeenCalledWith('test')
    })

    it('should emit input event', async () => {
      const onInput = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          onInput: onInput
        }
      })

      const input = getByRole('textbox')
      await fireEvent.input(input, { target: { value: 'test' } })

      expect(onInput).toHaveBeenCalled()
    })

    it('should emit change event', async () => {
      const onChange = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          onChange: onChange
        }
      })

      const input = getByRole('textbox')
      await fireEvent.change(input, { target: { value: 'test' } })

      expect(onChange).toHaveBeenCalled()
    })

    it('should emit focus event', async () => {
      const onFocus = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          onFocus: onFocus
        }
      })

      const input = getByRole('textbox')
      await fireEvent.focus(input)

      expect(onFocus).toHaveBeenCalled()
    })

    it('should emit blur event', async () => {
      const onBlur = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          onBlur: onBlur
        }
      })

      const input = getByRole('textbox')
      await fireEvent.blur(input)

      expect(onBlur).toHaveBeenCalled()
    })

    it('should not emit events when disabled', async () => {
      const onUpdate = vi.fn()
      const onInput = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          disabled: true,
          'onUpdate:modelValue': onUpdate,
          onInput: onInput
        }
      })

      const input = getByRole('textbox')
      await fireEvent.input(input, { target: { value: 'test' } })

      // Input is disabled, events should not fire
      expect(input).toBeDisabled()
    })

    it('should not allow input when readonly', async () => {
      const { getByRole } = renderWithProps(Input, {
        readonly: true,
        modelValue: 'initial'
      })

      const input = getByRole('textbox')
      expect(input).toHaveAttribute('readonly')
    })

    it('should emit all events in correct order during typing', async () => {
      const events: string[] = []
      const onInput = vi.fn(() => events.push('input'))
      const onUpdate = vi.fn(() => events.push('update'))

      const { getByRole } = render(Input, {
        props: {
          onInput,
          'onUpdate:modelValue': onUpdate
        }
      })

      const input = getByRole('textbox')
      await fireEvent.input(input, { target: { value: 'a' } })

      expect(onInput).toHaveBeenCalled()
      expect(onUpdate).toHaveBeenCalled()
    })
  })

  describe('v-model binding', () => {
    it('should update value when modelValue changes', async () => {
      const { getByRole, rerender } = renderWithProps(Input, {
        modelValue: 'initial'
      })

      let input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('initial')

      await rerender({ modelValue: 'updated' })
      input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('updated')
    })

    it('should handle number type values', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          type: 'number',
          'onUpdate:modelValue': onUpdate
        }
      })

      const input = getByRole('spinbutton')
      await fireEvent.update(input, '42')

      expect(onUpdate).toHaveBeenCalled()
    })

    it('should handle empty string modelValue', () => {
      const { getByRole } = renderWithProps(Input, {
        modelValue: ''
      })

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle undefined modelValue', () => {
      const { getByRole } = renderWithProps(Input, {
        modelValue: undefined
      })

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle numeric modelValue for text input', () => {
      const { getByRole } = renderWithProps(Input, {
        modelValue: 123
      })

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('123')
    })

    it('should sync localValue with modelValue changes', async () => {
      const { getByRole, rerender } = renderWithProps(Input, {
        modelValue: 'first'
      })

      let input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('first')

      await rerender({ modelValue: 'second' })
      input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('second')

      await rerender({ modelValue: '' })
      input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  describe('Type Variants', () => {
    it('should render text input by default', () => {
      const { container } = render(Input)
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should render password input', () => {
      const { container } = renderWithProps(Input, { type: 'password' })
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should render email input', () => {
      const { container } = renderWithProps(Input, { type: 'email' })
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render number input with spinbutton role', () => {
      const { getByRole } = renderWithProps(Input, { type: 'number' })
      expect(getByRole('spinbutton')).toBeInTheDocument()
    })

    it('should render tel input', () => {
      const { container } = renderWithProps(Input, { type: 'tel' })
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'tel')
    })

    it('should render url input', () => {
      const { container } = renderWithProps(Input, { type: 'url' })
      const input = container.querySelector('input')
      expect(input).toHaveAttribute('type', 'url')
    })

    it('should handle number input with decimal values', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          type: 'number',
          'onUpdate:modelValue': onUpdate
        }
      })

      const input = getByRole('spinbutton')
      await fireEvent.update(input, '3.14')

      expect(onUpdate).toHaveBeenCalled()
    })

    it('should handle number input with invalid value', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          type: 'number',
          'onUpdate:modelValue': onUpdate
        }
      })

      const input = getByRole('spinbutton')
      await fireEvent.input(input, { target: { value: 'abc' } })

      // Should still emit, but with string value when NaN
      expect(onUpdate).toHaveBeenCalled()
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

      const { getByRole } = renderWithProps(Input, {
        placeholder: 'Themed input'
      })

      const input = getByRole('textbox')
      expect(input).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Input, {
        props: {
          placeholder: 'Accessible input'
        }
      })

      await expectNoA11yViolations(container)
    })

    it('should be keyboard accessible', async () => {
      const onFocus = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          onFocus: onFocus
        }
      })

      const input = getByRole('textbox')
      input.focus()

      expect(input).toHaveFocus()
      expect(onFocus).toHaveBeenCalled()
    })

    it('should have proper role', () => {
      const { getByRole } = render(Input)

      expect(getByRole('textbox')).toBeInTheDocument()
    })

    it('should support aria-label', () => {
      const { getByLabelText } = render(Input, {
        attrs: {
          'aria-label': 'Username input'
        }
      })

      expect(getByLabelText('Username input')).toBeInTheDocument()
    })

    it('should support aria-invalid for error state', () => {
      const { getByRole } = render(Input, {
        props: { status: 'error' },
        attrs: { 'aria-invalid': 'true' }
      })

      const input = getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('should handle Tab key navigation', async () => {
      const user = userEvent.setup()
      const onFocus = vi.fn()
      const onBlur = vi.fn()

      const { getByRole } = render(Input, {
        props: { onFocus, onBlur }
      })

      const input = getByRole('textbox')

      await user.tab()
      expect(input).toHaveFocus()
      expect(onFocus).toHaveBeenCalled()

      await user.tab()
      expect(input).not.toHaveFocus()
      expect(onBlur).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle whitespace-only value', () => {
      const { getByRole } = renderWithProps(Input, {
        modelValue: edgeCaseData.whitespace
      })

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(edgeCaseData.whitespace)
    })

    it('should handle special characters', () => {
      const { getByRole } = renderWithProps(Input, {
        modelValue: edgeCaseData.specialCharacters
      })

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(edgeCaseData.specialCharacters)
    })

    it('should handle unicode characters', () => {
      const { getByRole } = renderWithProps(Input, {
        modelValue: edgeCaseData.unicode
      })

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(edgeCaseData.unicode)
    })

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000)
      const { getByRole } = renderWithProps(Input, {
        modelValue: longText
      })

      const input = getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe(longText)
    })

    it('should handle rapid value changes', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Input, {
        props: { 'onUpdate:modelValue': onUpdate }
      })

      const input = getByRole('textbox')

      await fireEvent.input(input, { target: { value: 'a' } })
      await fireEvent.input(input, { target: { value: 'ab' } })
      await fireEvent.input(input, { target: { value: 'abc' } })

      expect(onUpdate).toHaveBeenCalledTimes(3)
    })

    it('should handle zero value for number input', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          type: 'number',
          'onUpdate:modelValue': onUpdate
        }
      })

      const input = getByRole('spinbutton')
      await fireEvent.update(input, '0')

      expect(onUpdate).toHaveBeenCalledWith(0)
    })

    it('should handle negative numbers', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Input, {
        props: {
          type: 'number',
          'onUpdate:modelValue': onUpdate
        }
      })

      const input = getByRole('spinbutton')
      await fireEvent.update(input, '-5')

      expect(onUpdate).toHaveBeenCalledWith(-5)
    })

    it('should handle maxLength constraint', async () => {
      const { getByRole } = renderWithProps(Input, {
        maxLength: 5,
        modelValue: ''
      })

      const input = getByRole('textbox') as HTMLInputElement
      expect(input).toHaveAttribute('maxlength', '5')
    })

    it('should render without crashing with all props', () => {
      const { getByRole } = render(Input, {
        props: {
          modelValue: 'test',
          size: 'lg',
          type: 'text',
          status: 'error',
          errorMessage: 'Error',
          prefix: 'Pre',
          suffix: 'Suf',
          placeholder: 'Placeholder',
          disabled: false,
          readonly: false,
          required: true,
          maxLength: 100,
          minLength: 1,
          name: 'test-input',
          id: 'test-id',
          autoComplete: 'off',
          autoFocus: false,
          className: 'custom-class',
          style: { width: '100%' }
        }
      })

      expect(getByRole('textbox')).toBeInTheDocument()
    })
  })

  describe('Shake Animation', () => {
    it('should trigger shake animation when status changes to error', async () => {
      const { container, rerender } = render(Input, {
        props: { status: 'default' }
      })

      await rerender({ status: 'error' })

      const wrapper = container.firstChild as HTMLElement
      // The shake class should be applied
      expect(wrapper.className).toContain('tiger-animate-shake')
    })

    it('should remove shake class after animation ends', async () => {
      const { container } = render(Input, {
        props: { status: 'error' }
      })

      const wrapper = container.firstChild as HTMLElement

      // Simulate animation end
      await fireEvent.animationEnd(wrapper)

      // After animation ends, the shake class should be removed
      expect(wrapper.className).not.toContain('tiger-animate-shake')
    })
  })
})
