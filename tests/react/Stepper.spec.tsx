/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { Stepper } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Stepper', () => {
  it('renders minus and plus buttons', () => {
    const { container } = render(<Stepper />)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(2)
  })

  it('allows overriding step control aria labels', () => {
    render(<Stepper value={5} incrementAriaLabel="增加数值" decrementAriaLabel="减少数值" />)
    expect(screen.getByLabelText('增加数值')).toBeInTheDocument()
    expect(screen.getByLabelText('减少数值')).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<Stepper className="my-stepper" />)
    expect(container.querySelector('.my-stepper')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = render(<Stepper size={size} />)
    expect(container.querySelector('input')).toBeInTheDocument()
  })
  // --- Increment / Decrement ---
  it('increments on plus click', () => {
    const onChange = vi.fn()
    const { container } = render(<Stepper value={5} onChange={onChange} />)
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[1])
    expect(onChange).toHaveBeenCalledWith(6)
  })
  it('repeats increment while the plus button is held', () => {
    vi.useFakeTimers()
    try {
      const onChange = vi.fn()
      const { container } = render(<Stepper value={5} onChange={onChange} />)
      const plus = container.querySelectorAll('button')[1]

      fireEvent.pointerDown(plus)
      expect(onChange).toHaveBeenCalledWith(6)

      act(() => {
        vi.advanceTimersByTime(450)
      })
      expect(onChange.mock.calls.map(([value]) => value)).toEqual([6, 7, 8])

      fireEvent.pointerUp(plus)
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(onChange.mock.calls.map(([value]) => value)).toEqual([6, 7, 8])
    } finally {
      vi.useRealTimers()
    }
  })

  // --- Disabled ---
  it('disables all controls when disabled', () => {
    const { container } = render(<Stepper disabled />)
    const buttons = container.querySelectorAll('button')
    buttons.forEach((b) => expect(b).toBeDisabled())
    expect(container.querySelector('input')).toBeDisabled()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Stepper />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
