/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { MaskInput } from '@expcat/tigercat-vue'
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
      expect(getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
      expect(getByText('Bad value')).toBeInTheDocument()
    })

    it('has no a11y violations', async () => {
      const { container } = render(MaskInput, {
        props: { mask: '##/##/####' },
        attrs: { 'aria-label': 'Date' }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
