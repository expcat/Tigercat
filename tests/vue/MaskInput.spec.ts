/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { h } from 'vue'
import { render, fireEvent } from '@testing-library/vue'
import { MaskInput } from '@expcat/tigercat-vue/MaskInput'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('MaskInput', () => {
  describe('Rendering', () => {
    it('formats a controlled raw value for display', () => {
      const { getByRole } = render(MaskInput, {
        props: { mask: '##/##/####', modelValue: '12345678' }
      })
      expect((getByRole('textbox') as HTMLInputElement).value).toBe('12/34/5678')
    })

    it('formats a default raw value (uncontrolled)', () => {
      const { getByRole } = render(MaskInput, {
        props: { mask: '##/##/####', defaultValue: '1234' }
      })
      expect((getByRole('textbox') as HTMLInputElement).value).toBe('12/34/')
    })
  })

  describe('Input behaviour', () => {
    it('emits update:modelValue (raw) and change (payload) on input', async () => {
      const onUpdate = vi.fn()
      const onChange = vi.fn()
      const { getByRole } = render(MaskInput, {
        props: { mask: '##/##/####', 'onUpdate:modelValue': onUpdate, onChange }
      })
      const input = getByRole('textbox') as HTMLInputElement
      // Simulate the browser inserting "12" before the input event fires
      input.value = '12'
      await fireEvent.input(input)
      expect(onUpdate).toHaveBeenCalledWith('12')
      const [rawArg, detailArg] = onChange.mock.calls.at(-1)!
      expect(rawArg).toBe('12')
      expect(detailArg.maskedValue).toBe('12/')
    })

    it('emits complete when every token slot is filled', async () => {
      const onComplete = vi.fn()
      const { getByRole } = render(MaskInput, {
        props: { mask: '##', modelValue: '1', onComplete }
      })
      const input = getByRole('textbox') as HTMLInputElement
      input.value = '12'
      await fireEvent.input(input)
      expect(onComplete).toHaveBeenCalledWith('12', '12')
    })
  })

  describe('Clearable', () => {
    it('clears the value and emits clear', async () => {
      const onClear = vi.fn()
      const { getByRole, getByLabelText } = render(MaskInput, {
        props: { mask: '##/##', defaultValue: '12', clearable: true, onClear }
      })
      await fireEvent.click(getByLabelText('Clear input'))
      expect(onClear).toHaveBeenCalled()
      expect((getByRole('textbox') as HTMLInputElement).value).toBe('')
    })
  })

  describe('States and Accessibility', () => {
    it('shows an error message and marks the input invalid', () => {
      const { getByRole, getByText } = render(MaskInput, {
        props: { mask: '##', status: 'error', errorMessage: 'Bad value' }
      })
      const input = getByRole('textbox')
      const errorEl = getByText('Bad value')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(errorEl).toBeInTheDocument()
      expect(errorEl).toHaveAttribute('aria-live', 'polite')
      expect(errorEl.className).not.toContain('inset-y-0')
    })

    it('has no a11y violations', async () => {
      const { container } = render(MaskInput, {
        props: { mask: '##/##/####' },
        attrs: { 'aria-label': 'Date' }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Native form submit', () => {
    it('renders a hidden input with the raw value when name is set (controlled)', () => {
      const { getByRole, getAllByRole, container } = render(MaskInput, {
        props: { mask: '##/##/####', modelValue: '12345678', name: 'date' }
      })
      const textbox = getByRole('textbox') as HTMLInputElement
      expect(textbox.value).toBe('12/34/5678')
      expect(textbox).not.toHaveAttribute('name')
      expect(getAllByRole('textbox')).toHaveLength(1)
      const hidden = container.querySelectorAll('input[type="hidden"]')
      expect(hidden).toHaveLength(1)
      expect(hidden[0]).toHaveAttribute('name', 'date')
      expect((hidden[0] as HTMLInputElement).value).toBe('12345678')
    })

    it('renders a hidden input with the raw value when name is set (uncontrolled)', () => {
      const { getByRole, container } = render(MaskInput, {
        props: { mask: '##/##/####', defaultValue: '12345678', name: 'date' }
      })
      const textbox = getByRole('textbox') as HTMLInputElement
      expect(textbox.value).toBe('12/34/5678')
      expect(textbox).not.toHaveAttribute('name')
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden).toHaveAttribute('name', 'date')
      expect(hidden.value).toBe('12345678')
    })

    it('does not render a hidden input without name', () => {
      const { getByRole, container } = render(MaskInput, {
        props: { mask: '##/##/####', modelValue: '12345678' }
      })
      expect(container.querySelector('input[type="hidden"]')).toBeNull()
      expect(getByRole('textbox')).not.toHaveAttribute('name')
    })

    it('treats an empty name as absent', () => {
      const { getByRole, container } = render(MaskInput, {
        props: { mask: '##/##/####', modelValue: '12345678', name: '' }
      })
      expect(container.querySelector('input[type="hidden"]')).toBeNull()
      expect(getByRole('textbox')).not.toHaveAttribute('name')
    })

    it('updates the hidden raw value on input', async () => {
      const { getByRole, container } = render(MaskInput, {
        props: { mask: '##/##', name: 'date' }
      })
      const input = getByRole('textbox') as HTMLInputElement
      input.value = '12'
      await fireEvent.input(input)
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden.value).toBe('12')
      expect(input.value).toBe('12/')
    })

    it('clears the hidden value when clearable is used', async () => {
      const { getByRole, getByLabelText, container } = render(MaskInput, {
        props: { mask: '##/##', defaultValue: '12', clearable: true, name: 'date' }
      })
      await fireEvent.click(getByLabelText('Clear input'))
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden.value).toBe('')
      expect((getByRole('textbox') as HTMLInputElement).value).toBe('')
    })

    it('does not submit the hidden raw input when disabled', () => {
      const { getByRole, container } = render(MaskInput, {
        props: { mask: '##/##/####', modelValue: '12345678', name: 'date', disabled: true }
      })
      expect(getByRole('textbox')).toBeDisabled()
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden).toHaveAttribute('name', 'date')
      expect(hidden.value).toBe('12345678')
      expect(hidden).toBeDisabled()
    })

    it('submits the raw value via FormData', () => {
      const { container, getByRole } = render({
        render: () =>
          h('form', [
            h(MaskInput, {
              name: 'phone',
              mask: '(###) ###-####',
              defaultValue: '5551234567'
            })
          ])
      })
      const form = container.querySelector('form') as HTMLFormElement
      expect(new FormData(form).get('phone')).toBe('5551234567')
      expect(getByRole('textbox')).not.toHaveAttribute('name')
      expect((getByRole('textbox') as HTMLInputElement).value).toBe('(555) 123-4567')
    })
  })
})
