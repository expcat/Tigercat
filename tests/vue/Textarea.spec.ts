/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Textarea } from '@tigercat/vue'
import { renderWithProps, expectNoA11yViolations, componentSizes } from '../utils'

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
  })

  it('shows count when showCount is enabled', () => {
    renderWithProps(Textarea, {
      modelValue: 'abc',
      showCount: true,
      maxLength: 10
    })

    expect(screen.getByText('3/10')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Textarea, {
      attrs: {
        'aria-label': 'Description textarea'
      }
    })

    await expectNoA11yViolations(container)
  })
})
