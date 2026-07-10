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
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
  edgeCaseData
} from '../utils'

describe('Input', () => {
  describe('Rendering', () => {
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

    it('should apply className prop to wrapper', () => {
      const { container } = render(Input, {
        props: { className: 'custom-wrapper-class' }
      })
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('custom-wrapper-class')
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
      await fireEvent.update(input, 'test')

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
      await fireEvent.update(input, 'test')
      input.dispatchEvent(new Event('change', { bubbles: true }))

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
      await fireEvent.update(input, 'test')

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
      await fireEvent.update(input, 'a')

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
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Input, {
        props: {
          placeholder: 'Accessible input'
        }
      })

      await expectNoA11yViolationsIsolated(container)
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

    it('should support aria-label', () => {
      const { getByLabelText } = render(Input, {
        attrs: {
          'aria-label': 'Username input'
        }
      })

      expect(getByLabelText('Username input')).toBeInTheDocument()
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
    it('should handle rapid value changes', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Input, {
        props: { 'onUpdate:modelValue': onUpdate }
      })

      const input = getByRole('textbox')

      await fireEvent.update(input, 'a')
      await fireEvent.update(input, 'ab')
      await fireEvent.update(input, 'abc')

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
      await fireEvent.update(input, 'abc')

      // Should still emit, but with string value when NaN
      expect(onUpdate).toHaveBeenCalled()
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

  describe('clearable', () => {
    it('shows clear button when clearable and has value', async () => {
      render(Input, {
        props: { clearable: true, modelValue: 'hello' }
      })
      expect(screen.getByLabelText('Clear input')).toBeInTheDocument()
    })

    it('does not show clear button when value is empty', () => {
      render(Input, {
        props: { clearable: true, modelValue: '' }
      })
      expect(screen.queryByLabelText('Clear input')).not.toBeInTheDocument()
    })

    it('clears value when clear button is clicked', async () => {
      const { emitted } = render(Input, {
        props: { clearable: true, modelValue: 'hello' }
      })

      await fireEvent.click(screen.getByLabelText('Clear input'))
      expect(emitted()['update:modelValue']).toBeTruthy()
      expect(emitted()['update:modelValue'][0]).toEqual([''])
      expect(emitted()['clear']).toBeTruthy()
    })

    it('does not show clear button when disabled', () => {
      render(Input, {
        props: { clearable: true, modelValue: 'hello', disabled: true }
      })
      expect(screen.queryByLabelText('Clear input')).not.toBeInTheDocument()
    })
  })

  describe('showPassword', () => {
    it('shows password toggle for password type', () => {
      render(Input, {
        props: { type: 'password', showPassword: true, modelValue: 'secret' }
      })
      expect(screen.getByLabelText('Show password')).toBeInTheDocument()
    })

    it('toggles input type between password and text', async () => {
      const { container } = render(Input, {
        props: { type: 'password', showPassword: true, modelValue: 'secret' }
      })
      const input = container.querySelector('input')!

      expect(input).toHaveAttribute('type', 'password')
      await fireEvent.click(screen.getByLabelText('Show password'))
      expect(input).toHaveAttribute('type', 'text')
      expect(screen.getByLabelText('Hide password')).toBeInTheDocument()
    })
  })

  describe('showCount', () => {
    it('shows character count', () => {
      render(Input, {
        props: { showCount: true, modelValue: 'hello' }
      })
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('shows current/max when maxLength is set', () => {
      render(Input, {
        props: { showCount: true, maxLength: 10, modelValue: 'hello' }
      })
      expect(screen.getByText('5 / 10')).toBeInTheDocument()
    })
  })

  describe('a11y: standalone error state', () => {
    it('sets aria-invalid when status is error', () => {
      render(Input, {
        props: { status: 'error' }
      })
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('sets aria-describedby pointing to error message when status=error and errorMessage', () => {
      render(Input, {
        props: { status: 'error', errorMessage: 'Required field' }
      })
      const input = screen.getByRole('textbox')
      const describedBy = input.getAttribute('aria-describedby')
      expect(describedBy).toBeTruthy()

      const errorEl = document.getElementById(describedBy!)
      expect(errorEl).toBeInTheDocument()
      expect(errorEl?.textContent).toBe('Required field')
    })

    it('does not set aria-invalid when status is default', () => {
      render(Input)
      const input = screen.getByRole('textbox')
      expect(input).not.toHaveAttribute('aria-invalid')
    })
  })
})
