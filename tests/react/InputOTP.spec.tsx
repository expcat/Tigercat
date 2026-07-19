/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { InputOTP } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function getSlots(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[]
}

describe('InputOTP', () => {
  describe('Rendering', () => {
    it('renders `length` slots (default 6)', () => {
      const { container } = render(<InputOTP />)
      expect(getSlots(container)).toHaveLength(6)
    })

    it('honours a custom length', () => {
      const { container } = render(<InputOTP length={4} />)
      expect(getSlots(container)).toHaveLength(4)
    })

    it('spreads a controlled value across the slots', () => {
      const { container } = render(<InputOTP value="123" />)
      const slots = getSlots(container)
      expect(slots[0].value).toBe('1')
      expect(slots[1].value).toBe('2')
      expect(slots[2].value).toBe('3')
      expect(slots[3].value).toBe('')
    })

    it('renders group separators when groups sum to length', () => {
      const { getByText } = render(<InputOTP groups={[3, 3]} separator="-" />)
      expect(getByText('-')).toBeInTheDocument()
    })

    it('exposes a hidden input carrying the joined value for form submission', () => {
      const { container } = render(<InputOTP name="code" defaultValue="123" />)
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden).toHaveAttribute('name', 'code')
      expect(hidden.value).toBe('123')
    })
  })

  describe('Input behaviour', () => {
    it('types across slots and advances focus (uncontrolled)', async () => {
      const user = userEvent.setup()
      const { container } = render(<InputOTP length={4} />)
      const slots = getSlots(container)
      await user.click(slots[0])
      await user.keyboard('12')
      expect(slots[0].value).toBe('1')
      expect(slots[1].value).toBe('2')
    })

    it('filters out characters rejected by the numeric type', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container } = render(<InputOTP onChange={onChange} />)
      const slots = getSlots(container)
      await user.click(slots[0])
      await user.keyboard('a')
      expect(slots[0].value).toBe('')
      expect(onChange).not.toHaveBeenCalled()
    })

    it('fires onComplete exactly once when the last slot is filled', async () => {
      const user = userEvent.setup()
      const onComplete = vi.fn()
      const { container } = render(<InputOTP length={3} onComplete={onComplete} />)
      const slots = getSlots(container)
      await user.click(slots[0])
      await user.keyboard('123')
      expect(onComplete).toHaveBeenCalledTimes(1)
      expect(onComplete).toHaveBeenCalledWith('123')
    })

    it('clears the current slot on Backspace and moves back when empty', async () => {
      const user = userEvent.setup()
      const { container } = render(<InputOTP length={4} defaultValue="12" />)
      const slots = getSlots(container)
      await user.click(slots[2])
      await user.keyboard('{Backspace}')
      expect(slots[1].value).toBe('')
      expect(document.activeElement).toBe(slots[1])
    })

    it('moves focus with arrow keys', async () => {
      const user = userEvent.setup()
      const { container } = render(<InputOTP length={4} />)
      const slots = getSlots(container)
      await user.click(slots[0])
      await user.keyboard('{ArrowRight}')
      expect(document.activeElement).toBe(slots[1])
      await user.keyboard('{ArrowLeft}')
      expect(document.activeElement).toBe(slots[0])
    })
  })

  describe('Masked mode', () => {
    it('renders the mask character while keeping the real value in the hidden input', () => {
      const { container } = render(<InputOTP masked maskChar="•" name="pin" defaultValue="12" />)
      const slots = getSlots(container)
      expect(slots[0].value).toBe('•')
      expect(slots[1].value).toBe('•')
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden.value).toBe('12')
    })
  })

  describe('States', () => {
    it('disables all slots', () => {
      const { container } = render(<InputOTP disabled />)
      getSlots(container).forEach((slot) => expect(slot).toBeDisabled())
    })

    it('shows an error message and marks slots invalid', () => {
      const { getByText, container } = render(
        <InputOTP status="error" errorMessage="Invalid code" />
      )
      expect(getByText('Invalid code')).toBeInTheDocument()
      expect(getSlots(container)[0]).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Accessibility', () => {
    it('labels the group and each slot', () => {
      const { getByRole, container } = render(<InputOTP length={6} />)
      expect(getByRole('group')).toHaveAttribute('aria-label', 'One-time password')
      expect(getSlots(container)[0]).toHaveAttribute('aria-label', 'Character 1 of 6')
    })

    it('has no a11y violations', async () => {
      const { container } = render(<InputOTP length={4} ariaLabel="Verification code" />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
