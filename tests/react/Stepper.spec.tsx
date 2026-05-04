/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { Stepper } from '@expcat/tigercat-react'

describe('Stepper', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = render(<Stepper />)
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
  })

  it('renders minus and plus buttons', () => {
    const { container } = render(<Stepper />)
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(2)
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

  // --- Value display ---
  it('displays current value', () => {
    const { container } = render(<Stepper value={5} />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('5')
  })

  // --- Increment / Decrement ---
  it('increments on plus click', () => {
    const onChange = vi.fn()
    const { container } = render(<Stepper value={5} onChange={onChange} />)
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[1])
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('decrements on minus click', () => {
    const onChange = vi.fn()
    const { container } = render(<Stepper value={5} onChange={onChange} />)
    const buttons = container.querySelectorAll('button')
    fireEvent.click(buttons[0])
    expect(onChange).toHaveBeenCalledWith(4)
  })

  // --- Min / Max ---
  it('disables minus at min', () => {
    const { container } = render(<Stepper value={0} min={0} />)
    const minus = container.querySelectorAll('button')[0]
    expect(minus).toBeDisabled()
  })

  it('disables plus at max', () => {
    const { container } = render(<Stepper value={10} max={10} />)
    const plus = container.querySelectorAll('button')[1]
    expect(plus).toBeDisabled()
  })

  it('does not go below min', () => {
    const onChange = vi.fn()
    const { container } = render(<Stepper value={0} min={0} onChange={onChange} />)
    const minus = container.querySelectorAll('button')[0]
    fireEvent.click(minus)
    expect(onChange).not.toHaveBeenCalled()
  })

  // --- Step ---
  it('increments by custom step', () => {
    const onChange = vi.fn()
    const { container } = render(<Stepper value={0} step={5} onChange={onChange} />)
    const plus = container.querySelectorAll('button')[1]
    fireEvent.click(plus)
    expect(onChange).toHaveBeenCalledWith(5)
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

  // --- SVG icons ---
  it('renders SVG icons in buttons', () => {
    const { container } = render(<Stepper />)
    expect(container.querySelectorAll('svg').length).toBe(2)
  })
})
