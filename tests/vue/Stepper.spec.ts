/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Stepper } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('Stepper', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = renderWithProps(Stepper, {})
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
  })

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

  // --- Value display ---
  it('displays current value', () => {
    const { container } = renderWithProps(Stepper, { modelValue: 5 })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('5')
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

  it('decrements on minus click', async () => {
    const onChange = vi.fn()
    const { container } = render(Stepper, {
      props: { modelValue: 5, 'onUpdate:modelValue': onChange }
    })
    const buttons = container.querySelectorAll('button')
    await fireEvent.click(buttons[0]) // Minus button
    expect(onChange).toHaveBeenCalledWith(4)
  })

  // --- Min / Max ---
  it('disables minus at min', () => {
    const { container } = renderWithProps(Stepper, { modelValue: 0, min: 0 })
    const minus = container.querySelectorAll('button')[0]
    expect(minus).toBeDisabled()
  })

  it('disables plus at max', () => {
    const { container } = renderWithProps(Stepper, { modelValue: 10, max: 10 })
    const plus = container.querySelectorAll('button')[1]
    expect(plus).toBeDisabled()
  })

  it('does not go below min', async () => {
    const onChange = vi.fn()
    const { container } = render(Stepper, {
      props: { modelValue: 0, min: 0, 'onUpdate:modelValue': onChange }
    })
    const minus = container.querySelectorAll('button')[0]
    await fireEvent.click(minus)
    expect(onChange).not.toHaveBeenCalled()
  })

  // --- Step ---
  it('increments by custom step', async () => {
    const onChange = vi.fn()
    const { container } = render(Stepper, {
      props: { modelValue: 0, step: 5, 'onUpdate:modelValue': onChange }
    })
    const plus = container.querySelectorAll('button')[1]
    await fireEvent.click(plus)
    expect(onChange).toHaveBeenCalledWith(5)
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

  // --- SVG icons ---
  it('renders SVG icons in buttons', () => {
    const { container } = renderWithProps(Stepper, {})
    expect(container.querySelectorAll('svg').length).toBe(2)
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Stepper)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(Stepper)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
