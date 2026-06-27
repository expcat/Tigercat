/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Rate } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

/** The interactive star spans are the direct children of the slider. */
function getStars(container: HTMLElement): HTMLElement[] {
  const slider = container.querySelector('[role="slider"]') as HTMLElement
  return Array.from(slider.children) as HTMLElement[]
}

describe('Rate', () => {
  // --- Basic rendering ---
  it('renders as a single slider (not a radiogroup)', () => {
    const { container } = render(<Rate />)
    expect(container.querySelector('[role="slider"]')).toBeInTheDocument()
    expect(container.querySelector('[role="radiogroup"]')).not.toBeInTheDocument()
    expect(container.querySelector('[role="radio"]')).not.toBeInTheDocument()
  })

  it('renders 5 stars by default', () => {
    const { container } = render(<Rate />)
    expect(getStars(container).length).toBe(5)
  })

  it('renders custom count', () => {
    const { container } = render(<Rate count={3} />)
    expect(getStars(container).length).toBe(3)
    expect(container.querySelector('[role="slider"]')).toHaveAttribute('aria-valuemax', '3')
  })

  it('applies className', () => {
    const { container } = render(<Rate className="custom-rate" />)
    expect(container.querySelector('.custom-rate')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = render(<Rate size={size} />)
    expect(container.querySelector('[role="slider"]')).toBeInTheDocument()
  })

  // --- Selection (mouse) ---
  it('calls onChange on star click', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={0} onChange={onChange} />)
    fireEvent.click(getStars(container)[2])
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('reflects the current value via aria-valuenow (single source, no multi-checked)', () => {
    const { container } = render(<Rate value={3} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider).toHaveAttribute('aria-valuenow', '3')
    expect(slider).toHaveAttribute('aria-valuetext', '3 stars')
    // No element should claim aria-checked anymore.
    expect(container.querySelector('[aria-checked]')).not.toBeInTheDocument()
  })

  it('uses singular valuetext for a value of 1', () => {
    const { container } = render(<Rate value={1} />)
    expect(container.querySelector('[role="slider"]')).toHaveAttribute('aria-valuetext', '1 star')
  })

  // --- Keyboard ---
  it('increments on ArrowRight / ArrowUp', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={2} onChange={onChange} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(3)
    fireEvent.keyDown(slider, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('decrements on ArrowLeft / ArrowDown', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={2} onChange={onChange} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('Home goes to 0 and End goes to count', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={2} count={5} onChange={onChange} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.keyDown(slider, { key: 'Home' })
    expect(onChange).toHaveBeenCalledWith(0)
    fireEvent.keyDown(slider, { key: 'End' })
    expect(onChange).toHaveBeenCalledWith(5)
  })

  it('steps by 0.5 with allowHalf', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={2} allowHalf onChange={onChange} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(2.5)
  })

  it('clamps at the min and max bounds', () => {
    const onChange = vi.fn()
    const { container, rerender } = render(<Rate value={0} count={5} onChange={onChange} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.keyDown(slider, { key: 'ArrowLeft' })
    expect(onChange).not.toHaveBeenCalled()

    rerender(<Rate value={5} count={5} onChange={onChange} />)
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
  })

  // --- Disabled ---
  it('does not call onChange when disabled (mouse or keyboard) and is not focusable', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={0} disabled onChange={onChange} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    fireEvent.click(getStars(container)[1])
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
    expect(slider).toHaveAttribute('tabindex', '-1')
    expect(slider).toHaveAttribute('aria-disabled', 'true')
  })

  it('is focusable (tabindex 0) when enabled', () => {
    const { container } = render(<Rate />)
    expect(container.querySelector('[role="slider"]')).toHaveAttribute('tabindex', '0')
  })

  // --- Allow clear ---
  it('clears value when clicking same star with allowClear', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={3} allowClear onChange={onChange} />)
    fireEvent.click(getStars(container)[2])
    expect(onChange).toHaveBeenCalledWith(0)
  })

  // --- SVG rendering ---
  it('renders SVG stars', () => {
    const { container } = render(<Rate />)
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
  })

  // --- Accessibility ---
  it('has aria-label and value bounds on the slider', () => {
    const { container } = render(<Rate value={2} count={5} />)
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider).toHaveAttribute('aria-label', 'Rating')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '5')
    expect(slider).toHaveAttribute('aria-valuenow', '2')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Rate />)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  it('renders correctly with allowHalf and half value', () => {
    const { container } = render(<Rate value={2.5} allowHalf />)
    const stars = getStars(container)
    expect(stars.length).toBe(5)
    expect(stars[2].querySelector('.overflow-hidden')).toHaveStyle({ width: '50%' })
    expect(container.querySelector('[role="slider"]')).toHaveAttribute('aria-valuenow', '2.5')
  })

  it('renders custom character', () => {
    const { container } = render(<Rate character="♥" />)
    expect(container.textContent).toContain('♥')
    expect(container.querySelectorAll('svg').length).toBe(0)
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<Rate />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
