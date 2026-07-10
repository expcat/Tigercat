/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@expcat/tigercat-vue'
import {
  renderWithProps,
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables,
  edgeCaseData
} from '../utils'

describe('Textarea', () => {
  const getTextarea = () => screen.getByRole('textbox') as HTMLTextAreaElement

  describe('Rendering', () => {
    it('renders a textbox by default', () => {
      render(Textarea)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders the placeholder', () => {
      const { getByPlaceholderText } = renderWithProps(Textarea, { placeholder: 'Enter text' })
      expect(getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('forwards attrs (data/title/aria)', () => {
      render(Textarea, {
        attrs: { 'data-testid': 'test-textarea', title: 'Title', 'aria-describedby': 'help' }
      })
      const textarea = getTextarea()
      expect(textarea).toHaveAttribute('data-testid', 'test-textarea')
      expect(textarea).toHaveAttribute('title', 'Title')
      expect(textarea).toHaveAttribute('aria-describedby', 'help')
    })

    it('merges the className prop with class from attrs', () => {
      render(Textarea, { props: { className: 'from-prop' }, attrs: { class: 'from-attr' } })
      const textarea = getTextarea()
      expect(textarea).toHaveClass('from-prop')
      expect(textarea).toHaveClass('from-attr')
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('renders %s size', (size) => {
      const { getByRole } = renderWithProps(Textarea, { size })
      expect(getByRole('textbox')).toBeInTheDocument()
    })
    it('defaults rows to 3 and honors a custom rows value', async () => {
      const { getByRole, rerender } = render(Textarea)
      expect(getByRole('textbox')).toHaveAttribute('rows', '3')
      await rerender({ rows: 10 })
      expect(getByRole('textbox')).toHaveAttribute('rows', '10')
    })
  })

  describe('States', () => {
    it('is disabled when disabled', () => {
      const { getByRole } = renderWithProps(Textarea, { disabled: true })
      expect(getByRole('textbox')).toBeDisabled()
    })
  })

  describe('Value binding (v-model)', () => {
    it('reflects modelValue and syncs on change', async () => {
      const { getByRole, rerender } = renderWithProps(Textarea, { modelValue: 'first' })
      expect((getByRole('textbox') as HTMLTextAreaElement).value).toBe('first')
      await rerender({ modelValue: 'second' })
      expect((getByRole('textbox') as HTMLTextAreaElement).value).toBe('second')
      await rerender({ modelValue: '' })
      expect((getByRole('textbox') as HTMLTextAreaElement).value).toBe('')
    })

    it('treats undefined modelValue as an empty string', () => {
      const { getByRole } = renderWithProps(Textarea, { modelValue: undefined })
      expect((getByRole('textbox') as HTMLTextAreaElement).value).toBe('')
    })

    it('preserves multiline text', () => {
      const multiline = 'Line 1\nLine 2\nLine 3'
      const { getByRole } = renderWithProps(Textarea, { modelValue: multiline })
      expect((getByRole('textbox') as HTMLTextAreaElement).value).toBe(multiline)
    })
  })

  describe('Events', () => {
    it('emits update:modelValue and input on input', async () => {
      const onUpdate = vi.fn()
      const onInput = vi.fn()
      const { getByRole } = render(Textarea, {
        props: { 'onUpdate:modelValue': onUpdate, onInput }
      })
      await fireEvent.update(getByRole('textbox'), 'test')
      expect(onUpdate).toHaveBeenCalledWith('test')
      expect(onInput).toHaveBeenCalled()
    })

    it('emits focus and blur', async () => {
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      const { getByRole } = render(Textarea, { props: { onFocus, onBlur } })
      const textarea = getByRole('textbox')
      await fireEvent.focus(textarea)
      expect(onFocus).toHaveBeenCalled()
      await fireEvent.blur(textarea)
      expect(onBlur).toHaveBeenCalled()
    })

    it('is reachable and blurrable via Tab', async () => {
      const user = userEvent.setup()
      const onFocus = vi.fn()
      const onBlur = vi.fn()
      const { getByRole } = render(Textarea, { props: { onFocus, onBlur } })
      const textarea = getByRole('textbox')
      await user.tab()
      expect(textarea).toHaveFocus()
      expect(onFocus).toHaveBeenCalled()
      await user.tab()
      expect(textarea).not.toHaveFocus()
      expect(onBlur).toHaveBeenCalled()
    })
  })

  describe('AutoResize', () => {
    it.each([
      [false, 'resize-y'],
      [true, 'resize-none']
    ])('applies the resize class for autoResize=%s', (autoResize, className) => {
      const { getByRole } = renderWithProps(Textarea, { autoResize })
      expect(getByRole('textbox')).toHaveClass(className)
    })

    it('accepts minRows and maxRows and adjusts on input', async () => {
      const onInput = vi.fn()
      const { getByRole } = render(Textarea, {
        props: { autoResize: true, minRows: 2, maxRows: 10, onInput }
      })
      const textarea = getByRole('textbox')
      expect(textarea).toBeInTheDocument()
      await fireEvent.update(textarea, 'New content')
      expect(onInput).toHaveBeenCalled()
    })
  })

  describe('Character count (showCount)', () => {
    it('shows the count with maxLength', () => {
      renderWithProps(Textarea, { modelValue: 'abc', showCount: true, maxLength: 10 })
      expect(screen.getByText('3/10')).toBeInTheDocument()
    })
    it('updates the count when modelValue changes', async () => {
      const { rerender } = render(Textarea, {
        props: { modelValue: 'ab', showCount: true, maxLength: 10 }
      })
      expect(screen.getByText('2/10')).toBeInTheDocument()
      await rerender({ modelValue: 'abcd', showCount: true, maxLength: 10 })
      expect(screen.getByText('4/10')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(Textarea, { attrs: { 'aria-label': 'Description textarea' } })
      await expectNoA11yViolationsIsolated(container)
    })

    it('reflects aria-invalid for the error state', () => {
      const { getByRole } = render(Textarea, { attrs: { 'aria-invalid': 'true' } })
      expect(getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('is keyboard focusable', () => {
      const onFocus = vi.fn()
      const { getByRole } = render(Textarea, { props: { onFocus } })
      const textarea = getByRole('textbox')
      textarea.focus()
      expect(textarea).toHaveFocus()
      expect(onFocus).toHaveBeenCalled()
    })
  })
})
