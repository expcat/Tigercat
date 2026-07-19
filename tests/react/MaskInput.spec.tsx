/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { MaskInput } from '@expcat/tigercat-react'
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
      expect(getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
      expect(getByText('Bad value')).toBeInTheDocument()
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
})
