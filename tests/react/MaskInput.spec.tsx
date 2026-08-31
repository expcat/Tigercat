/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MaskInput } from '@expcat/tigercat-react/MaskInput'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('MaskInput', () => {
  describe('Rendering', () => {
    it('formats a controlled raw value for display', () => {
      const { getByRole } = render(<MaskInput mask="##/##/####" value="12345678" />)
      expect((getByRole('textbox') as HTMLInputElement).value).toBe('12/34/5678')
    })

    it('formats a default raw value (uncontrolled)', () => {
      const { getByRole } = render(<MaskInput mask="##/##/####" defaultValue="1234" />)
      expect((getByRole('textbox') as HTMLInputElement).value).toBe('12/34/')
    })
  })

  describe('Input behaviour', () => {
    it('reports the raw value and masked detail on change', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { getByRole } = render(<MaskInput mask="##/##/####" onChange={onChange} />)
      const input = getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.keyboard('12')
      // Last call carries the raw value + masked detail
      const [rawArg, detailArg] = onChange.mock.calls.at(-1)!
      expect(rawArg).toBe('12')
      expect(detailArg.maskedValue).toBe('12/')
      expect(input.value).toBe('12/')
    })

    it('fires onComplete when every token slot is filled', async () => {
      const user = userEvent.setup()
      const onComplete = vi.fn()
      const { getByRole } = render(<MaskInput mask="##" onComplete={onComplete} />)
      const input = getByRole('textbox')
      await user.click(input)
      await user.keyboard('12')
      expect(onComplete).toHaveBeenCalledWith('12', '12')
    })

    it('applies custom token transforms', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { getByRole } = render(
        <MaskInput
          mask="AA"
          tokens={{ A: { pattern: /[A-Z]/, transform: (c) => c.toUpperCase() } }}
          onChange={onChange}
        />
      )
      const input = getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.keyboard('ab')
      expect(input.value).toBe('AB')
      expect(onChange.mock.calls.at(-1)![0]).toBe('AB')
    })
  })

  describe('Clearable', () => {
    it('clears the value and fires onClear', async () => {
      const user = userEvent.setup()
      const onClear = vi.fn()
      const onChange = vi.fn()
      const { getByRole, getByLabelText } = render(
        <MaskInput mask="##/##" defaultValue="12" clearable onClear={onClear} onChange={onChange} />
      )
      await user.click(getByLabelText('Clear input'))
      expect(onClear).toHaveBeenCalled()
      expect((getByRole('textbox') as HTMLInputElement).value).toBe('')
    })
  })

  describe('States and Accessibility', () => {
    it('shows an error message and marks the input invalid', () => {
      const { getByRole, getByText } = render(
        <MaskInput mask="##" status="error" errorMessage="Bad value" />
      )
      const input = getByRole('textbox')
      const errorEl = getByText('Bad value')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(errorEl).toBeInTheDocument()
      expect(errorEl).toHaveAttribute('aria-live', 'polite')
      expect(errorEl.className).not.toContain('inset-y-0')
    })

    it('disables the input', () => {
      const { getByRole } = render(<MaskInput mask="##" disabled />)
      expect(getByRole('textbox')).toBeDisabled()
    })

    it('has no a11y violations', async () => {
      const { container } = render(<MaskInput mask="##/##/####" aria-label="Date" />)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Native form submit', () => {
    it('renders a hidden input with the raw value when name is set (controlled)', () => {
      const { getByRole, getAllByRole, container } = render(
        <MaskInput mask="##/##/####" value="12345678" name="date" />
      )
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
      const { getByRole, container } = render(
        <MaskInput mask="##/##/####" defaultValue="12345678" name="date" />
      )
      const textbox = getByRole('textbox') as HTMLInputElement
      expect(textbox.value).toBe('12/34/5678')
      expect(textbox).not.toHaveAttribute('name')
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden).toHaveAttribute('name', 'date')
      expect(hidden.value).toBe('12345678')
    })

    it('does not render a hidden input without name', () => {
      const { getByRole, container } = render(<MaskInput mask="##/##/####" value="12345678" />)
      expect(container.querySelector('input[type="hidden"]')).toBeNull()
      expect(getByRole('textbox')).not.toHaveAttribute('name')
    })

    it('treats an empty name as absent', () => {
      const { getByRole, container } = render(
        <MaskInput mask="##/##/####" value="12345678" name="" />
      )
      expect(container.querySelector('input[type="hidden"]')).toBeNull()
      expect(getByRole('textbox')).not.toHaveAttribute('name')
    })

    it('updates the hidden raw value on input', async () => {
      const user = userEvent.setup()
      const { getByRole, container } = render(<MaskInput mask="##/##" name="date" />)
      const input = getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.keyboard('12')
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden.value).toBe('12')
      expect(input.value).toBe('12/')
    })

    it('clears the hidden value when clearable is used', async () => {
      const user = userEvent.setup()
      const { getByRole, getByLabelText, container } = render(
        <MaskInput mask="##/##" defaultValue="12" clearable name="date" />
      )
      await user.click(getByLabelText('Clear input'))
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden.value).toBe('')
      expect((getByRole('textbox') as HTMLInputElement).value).toBe('')
    })

    it('does not submit the hidden raw input when disabled', () => {
      const { getByRole, container } = render(
        <MaskInput mask="##/##/####" value="12345678" name="date" disabled />
      )
      expect(getByRole('textbox')).toBeDisabled()
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden).toHaveAttribute('name', 'date')
      expect(hidden.value).toBe('12345678')
      expect(hidden).toBeDisabled()
    })

    it('keeps Clear when the field is in an error state', () => {
      const { getByLabelText, getByRole } = render(
        <MaskInput
          mask="##/##"
          defaultValue="12"
          clearable
          status="error"
          errorMessage="Bad date"
        />
      )
      expect(getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
      expect(getByLabelText('Clear input')).toBeInTheDocument()
    })

    it('submits the raw value via FormData', () => {
      const { container, getByRole } = render(
        <form>
          <MaskInput name="phone" mask="(###) ###-####" defaultValue="5551234567" />
        </form>
      )
      const form = container.querySelector('form') as HTMLFormElement
      expect(new FormData(form).get('phone')).toBe('5551234567')
      expect(getByRole('textbox')).not.toHaveAttribute('name')
      expect((getByRole('textbox') as HTMLInputElement).value).toBe('(555) 123-4567')
    })
  })
})
