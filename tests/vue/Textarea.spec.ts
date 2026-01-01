/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Textarea } from '@tigercat/vue'
import {
  renderWithProps,
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
} from '../utils'

describe('Textarea', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(Textarea)
      
      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveClass('block')
    })

    it('should render with placeholder', () => {
      const { getByPlaceholderText } = renderWithProps(Textarea, {
        placeholder: 'Enter text',
      })
      
      expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should render with initial value', () => {
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: 'Initial value',
      })
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('Initial value')
    })

    it('should render with custom rows', () => {
      const { getByRole } = renderWithProps(Textarea, {
        rows: 5,
      })
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '5')
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { getByRole } = renderWithProps(Textarea, { size })
      
      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
    })

    it('should apply maxLength attribute', () => {
      const { getByRole } = renderWithProps(Textarea, {
        maxLength: 100,
      })
      
      expect(getByRole('textbox')).toHaveAttribute('maxlength', '100')
    })

    it('should apply minLength attribute', () => {
      const { getByRole } = renderWithProps(Textarea, {
        minLength: 10,
      })
      
      expect(getByRole('textbox')).toHaveAttribute('minlength', '10')
    })

    it('should apply name attribute', () => {
      const { getByRole } = renderWithProps(Textarea, {
        name: 'description',
      })
      
      expect(getByRole('textbox')).toHaveAttribute('name', 'description')
    })

    it('should apply id attribute', () => {
      const { container } = renderWithProps(Textarea, {
        id: 'textarea-id',
      })
      
      expect(container.querySelector('#textarea-id')).toBeInTheDocument()
    })

    it('should apply autocomplete attribute', () => {
      const { getByRole } = renderWithProps(Textarea, {
        autoComplete: 'off',
      })
      
      expect(getByRole('textbox')).toHaveAttribute('autocomplete', 'off')
    })

    it('should have autofocus attribute when autoFocus is true', () => {
      const { getByRole } = renderWithProps(Textarea, {
        autoFocus: true,
      })
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('autofocus')
    })
  })

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByRole } = renderWithProps(Textarea, {
        disabled: true,
      })
      
      const textarea = getByRole('textbox')
      expect(textarea).toBeDisabled()
      expect(textarea.className).toContain('disabled:')
    })

    it('should be readonly when readonly prop is true', () => {
      const { getByRole } = renderWithProps(Textarea, {
        readonly: true,
      })
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('readonly')
    })

    it('should show required state', () => {
      const { getByRole } = renderWithProps(Textarea, {
        required: true,
      })
      
      expect(getByRole('textbox')).toBeRequired()
    })
  })

  describe('Events', () => {
    it('should emit update:modelValue on input', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          'onUpdate:modelValue': onUpdate,
        },
      })
      
      const textarea = getByRole('textbox')
      await fireEvent.update(textarea, 'test')
      
      expect(onUpdate).toHaveBeenCalledWith('test')
    })

    it('should emit input event', async () => {
      const onInput = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          onInput: onInput,
        },
      })
      
      const textarea = getByRole('textbox')
      await fireEvent.input(textarea, { target: { value: 'test' } })
      
      expect(onInput).toHaveBeenCalled()
    })

    it('should emit focus event', async () => {
      const onFocus = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          onFocus: onFocus,
        },
      })
      
      const textarea = getByRole('textbox')
      await fireEvent.focus(textarea)
      
      expect(onFocus).toHaveBeenCalled()
    })

    it('should emit blur event', async () => {
      const onBlur = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          onBlur: onBlur,
        },
      })
      
      const textarea = getByRole('textbox')
      await fireEvent.blur(textarea)
      
      expect(onBlur).toHaveBeenCalled()
    })

    it('should not allow input when disabled', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          disabled: true,
          'onUpdate:modelValue': onUpdate,
        },
      })
      
      const textarea = getByRole('textbox')
      expect(textarea).toBeDisabled()
    })

    it('should not allow input when readonly', async () => {
      const { getByRole } = renderWithProps(Textarea, {
        readonly: true,
        modelValue: 'initial',
      })
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('readonly')
    })
  })

  describe('v-model binding', () => {
    it('should update value when modelValue changes', async () => {
      const { getByRole, rerender } = renderWithProps(Textarea, {
        modelValue: 'initial',
      })
      
      let textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('initial')
      
      await rerender({ modelValue: 'updated' })
      textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('updated')
    })

    it('should handle multiline text', async () => {
      const multilineText = 'Line 1\nLine 2\nLine 3'
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: multilineText,
      })
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(multilineText)
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000',
      })

      const { getByRole } = renderWithProps(Textarea, {
        placeholder: 'Themed textarea',
      })
      
      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      
      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Textarea, {
        props: {
          placeholder: 'Accessible textarea',
        },
      })
      
      await expectNoA11yViolations(container)
    })

    it('should be keyboard accessible', async () => {
      const onFocus = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          onFocus: onFocus,
        },
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
      const { getByRole } = render(Textarea, {
        attrs: {
          'aria-label': 'Description textarea',
        },
      })
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-label', 'Description textarea')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty value', () => {
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: '',
      })
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })

    it('should handle very long text', async () => {
      const longText = 'Lorem ipsum dolor sit amet. '.repeat(100)
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: longText,
      })
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(longText)
    })

    it('should handle special characters', async () => {
      const specialText = '<>&"\'\`§±!@#$%^&*()'
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: specialText,
      })
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(specialText)
    })

    it('should handle unicode characters', () => {
      const unicodeText = '你好世界 🌍 مرحبا'
      const { getByRole } = renderWithProps(Textarea, {
        modelValue: unicodeText,
      })
      
      const textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe(unicodeText)
    })

    it('should handle rapid input changes', async () => {
      const onUpdate = vi.fn()
      const { getByRole } = render(Textarea, {
        props: {
          'onUpdate:modelValue': onUpdate,
        },
      })
      
      const textarea = getByRole('textbox')
      
      await fireEvent.update(textarea, 'a')
      await fireEvent.update(textarea, 'ab')
      await fireEvent.update(textarea, 'abc')
      
      expect(onUpdate).toHaveBeenCalledTimes(3)
    })

    it('should respect maxLength constraint', async () => {
      const { getByRole } = renderWithProps(Textarea, {
        maxLength: 50,
      })
      
      const textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('maxlength', '50')
    })

    it('should handle rows changes', async () => {
      const { getByRole, rerender } = renderWithProps(Textarea, {
        rows: 3,
      })
      
      let textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '3')
      
      await rerender({ rows: 10 })
      textarea = getByRole('textbox')
      expect(textarea).toHaveAttribute('rows', '10')
    })

    it('should handle multiple size changes', async () => {
      const { getByRole, rerender } = renderWithProps(Textarea, {
        size: 'sm',
      })
      
      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      
      for (const size of componentSizes) {
        await rerender({ size })
        expect(textarea).toBeInTheDocument()
      }
    })

    it('should handle null and undefined values', () => {
      const { getByRole, rerender } = renderWithProps(Textarea, {
        modelValue: undefined,
      })
      
      let textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
      
      rerender({ modelValue: null as any })
      textarea = getByRole('textbox') as HTMLTextAreaElement
      expect(textarea.value).toBe('')
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for default textarea', () => {
      const { container } = render(Textarea)
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with placeholder', () => {
      const { container } = renderWithProps(Textarea, {
        placeholder: 'Enter description',
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for disabled state', () => {
      const { container } = renderWithProps(Textarea, {
        disabled: true,
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot for readonly state', () => {
      const { container } = renderWithProps(Textarea, {
        readonly: true,
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with custom rows', () => {
      const { container } = renderWithProps(Textarea, {
        rows: 10,
      })
      
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
