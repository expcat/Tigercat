/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Rate } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

/** The interactive star spans are the direct children of the slider. */
function getStars(container: HTMLElement): HTMLElement[] {
  const slider = container.querySelector('[role="slider"]') as HTMLElement
  return Array.from(slider.children) as HTMLElement[]
}

describe('Rate', () => {
  // --- Basic rendering ---
  it('renders as a single slider (not a radiogroup)', () => {
    const { container } = renderWithProps(Rate, {})
    expect(container.querySelector('[role="slider"]')).toBeInTheDocument()
    expect(container.querySelector('[role="radiogroup"]')).not.toBeInTheDocument()
    expect(container.querySelector('[role="radio"]')).not.toBeInTheDocument()
  })

  it('renders 5 stars by default', () => {
    const { container } = renderWithProps(Rate, {})
    expect(getStars(container).length).toBe(5)
  })
  it('applies className prop', () => {
    const { container } = renderWithProps(Rate, { className: 'custom-rate' })
    expect(container.querySelector('.custom-rate')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = renderWithProps(Rate, { size })
    expect(container.querySelector('[role="slider"]')).toBeInTheDocument()
  })

  // --- Selection (mouse) ---
  it('selects a star on click', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 0, 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(getStars(container)[2])
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('reflects the current value via aria-valuenow (single source, no multi-checked)', () => {
    const { container } = renderWithProps(Rate, { modelValue: 3 })
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider).toHaveAttribute('aria-valuenow', '3')
    expect(slider).toHaveAttribute('aria-valuetext', '3 stars')
    expect(container.querySelector('[aria-checked]')).not.toBeInTheDocument()
  })
  it('steps by 0.5 with allowHalf', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 2, allowHalf: true, 'onUpdate:modelValue': onChange }
    })
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    await fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(2.5)
  })

  // --- Disabled ---
  it('does not emit on click or keyboard when disabled and is not focusable', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 0, disabled: true, 'onUpdate:modelValue': onChange }
    })
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    await fireEvent.click(getStars(container)[1])
    await fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
    expect(slider).toHaveAttribute('tabindex', '-1')
    expect(slider).toHaveAttribute('aria-disabled', 'true')
  })

  // --- Allow clear ---
  it('clears value when clicking same star with allowClear', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 3, allowClear: true, 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(getStars(container)[2])
    expect(onChange).toHaveBeenCalledWith(0)
  })
  // --- Accessibility ---
  it('has aria-label and value bounds on the slider', () => {
    const { container } = renderWithProps(Rate, { modelValue: 2, count: 5 })
    const slider = container.querySelector('[role="slider"]') as HTMLElement
    expect(slider).toHaveAttribute('aria-label', 'Rating')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '5')
    expect(slider).toHaveAttribute('aria-valuenow', '2')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Rate)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {})
})
