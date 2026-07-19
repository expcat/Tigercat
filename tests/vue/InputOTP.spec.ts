/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { InputOTP } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

function getSlots(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll('input[type="text"]')) as HTMLInputElement[]
}

describe('InputOTP', () => {
  describe('Rendering', () => {
    it('renders `length` slots (default 6)', () => {
      const { container } = render(InputOTP)
      expect(getSlots(container)).toHaveLength(6)
    })

    it('spreads modelValue across the slots', () => {
      const { container } = render(InputOTP, { props: { modelValue: '123', length: 4 } })
      const slots = getSlots(container)
      expect(slots[0].value).toBe('1')
      expect(slots[2].value).toBe('3')
      expect(slots[3].value).toBe('')
    })

    it('renders group separators when groups sum to length', () => {
      const { getByText } = render(InputOTP, { props: { groups: [3, 3], separator: '-' } })
      expect(getByText('-')).toBeInTheDocument()
    })
  })

  describe('v-model and events', () => {
    it('emits update:modelValue as the user types', async () => {
      const onUpdate = vi.fn()
      const { container } = render(InputOTP, {
        props: { length: 4, 'onUpdate:modelValue': onUpdate }
      })
      const slots = getSlots(container)
      await fireEvent.update(slots[0], '1')
      expect(onUpdate).toHaveBeenCalledWith('1')
    })

    it('emits complete when the last slot is filled', async () => {
      const onComplete = vi.fn()
      const { container } = render(InputOTP, {
        props: { length: 2, modelValue: '1', onComplete }
      })
      const slots = getSlots(container)
      await fireEvent.update(slots[1], '2')
      expect(onComplete).toHaveBeenCalledWith('12')
    })
  })

  describe('Masked mode', () => {
    it('renders the mask character while keeping the real value in the hidden input', () => {
      const { container } = render(InputOTP, {
        props: { masked: true, maskChar: '•', name: 'pin', modelValue: '12' }
      })
      const slots = getSlots(container)
      expect(slots[0].value).toBe('•')
      const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
      expect(hidden.value).toBe('12')
    })
  })

  describe('States', () => {
    it('disables all slots', () => {
      const { container } = render(InputOTP, { props: { disabled: true } })
      getSlots(container).forEach((slot) => expect(slot).toBeDisabled())
    })

    it('shows an error message', () => {
      const { getByText } = render(InputOTP, {
        props: { status: 'error', errorMessage: 'Invalid code' }
      })
      expect(getByText('Invalid code')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('labels the group and each slot', () => {
      const { getByRole, container } = render(InputOTP, { props: { length: 6 } })
      expect(getByRole('group')).toHaveAttribute('aria-label', 'One-time password')
      expect(getSlots(container)[0]).toHaveAttribute('aria-label', 'Character 1 of 6')
    })

    it('has no a11y violations', async () => {
      const { container } = render(InputOTP, { props: { length: 4, ariaLabel: 'Verification code' } })
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
