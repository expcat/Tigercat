/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Stepper } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('Stepper', () => {
  it('renders minus and plus buttons', () => {
    const { container } = renderWithProps(Stepper, {})
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(2)
  })

  it('allows overriding step control aria labels', () => {
    renderWithProps(Stepper, {
      modelValue: 5,
      incrementAriaLabel: '增加数值',
      decrementAriaLabel: '减少数值'
    })
    expect(screen.getByLabelText('增加数值')).toBeInTheDocument()
    expect(screen.getByLabelText('减少数值')).toBeInTheDocument()
  })

  it('applies className prop', () => {
    const { container } = renderWithProps(Stepper, { className: 'my-stepper' })
    expect(container.querySelector('.my-stepper')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = renderWithProps(Stepper, { size })
    expect(container.querySelector('input')).toBeInTheDocument()
  })
  // --- Increment / Decrement ---
  it('increments on plus click', async () => {
    const onChange = vi.fn()
    const { container } = render(Stepper, {
      props: { modelValue: 5, 'onUpdate:modelValue': onChange }
    })
    const buttons = container.querySelectorAll('button')
    await fireEvent.click(buttons[1]) // Plus button
    expect(onChange).toHaveBeenCalledWith(6)
  })
  it('repeats increment while the plus button is held', async () => {
    vi.useFakeTimers()
    try {
      const onChange = vi.fn()
      const { container } = render(Stepper, {
        props: { modelValue: 5, 'onUpdate:modelValue': onChange }
      })
      const plus = container.querySelectorAll('button')[1]

      await fireEvent.pointerDown(plus)
      expect(onChange).toHaveBeenCalledWith(6)

      vi.advanceTimersByTime(450)
      expect(onChange.mock.calls.map(([value]) => value)).toEqual([6, 7, 8])

      await fireEvent.pointerUp(plus)
      vi.advanceTimersByTime(200)
      expect(onChange.mock.calls.map(([value]) => value)).toEqual([6, 7, 8])
    } finally {
      vi.useRealTimers()
    }
  })

  // --- Disabled ---
  it('disables all controls when disabled', () => {
    const { container } = renderWithProps(Stepper, { disabled: true })
    const buttons = container.querySelectorAll('button')
    buttons.forEach((b) => expect(b).toBeDisabled())
    expect(container.querySelector('input')).toBeDisabled()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Stepper)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
