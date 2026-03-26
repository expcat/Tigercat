/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Rate } from '@expcat/tigercat-vue'
import { renderWithProps } from '../utils'

describe('Rate', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = renderWithProps(Rate, {})
    const group = container.querySelector('[role="radiogroup"]')
    expect(group).toBeInTheDocument()
  })

  it('renders 5 stars by default', () => {
    const { container } = renderWithProps(Rate, {})
    const stars = container.querySelectorAll('[role="radio"]')
    expect(stars.length).toBe(5)
  })

  it('renders custom count', () => {
    const { container } = renderWithProps(Rate, { count: 3 })
    const stars = container.querySelectorAll('[role="radio"]')
    expect(stars.length).toBe(3)
  })

  it('applies className prop', () => {
    const { container } = renderWithProps(Rate, { className: 'custom-rate' })
    expect(container.querySelector('.custom-rate')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = renderWithProps(Rate, { size })
    expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument()
  })

  // --- Selection ---
  it('selects a star on click', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 0, 'onUpdate:modelValue': onChange }
    })
    const stars = container.querySelectorAll('[role="radio"]')
    await fireEvent.click(stars[2])
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('reflects current value via aria-checked', () => {
    const { container } = renderWithProps(Rate, { modelValue: 3 })
    const stars = container.querySelectorAll('[role="radio"]')
    expect(stars[2].getAttribute('aria-checked')).toBe('true')
    expect(stars[3].getAttribute('aria-checked')).toBe('false')
  })

  // --- Disabled ---
  it('does not emit on click when disabled', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 0, disabled: true, 'onUpdate:modelValue': onChange }
    })
    const stars = container.querySelectorAll('[role="radio"]')
    await fireEvent.click(stars[1])
    expect(onChange).not.toHaveBeenCalled()
  })

  // --- Allow clear ---
  it('clears value when clicking same star with allowClear', async () => {
    const onChange = vi.fn()
    const { container } = render(Rate, {
      props: { modelValue: 3, allowClear: true, 'onUpdate:modelValue': onChange }
    })
    const stars = container.querySelectorAll('[role="radio"]')
    await fireEvent.click(stars[2])
    expect(onChange).toHaveBeenCalledWith(0)
  })

  // --- SVG rendering ---
  it('renders SVG stars', () => {
    const { container } = renderWithProps(Rate, {})
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
  })

  // --- Accessibility ---
  it('has aria-label on radiogroup', () => {
    const { container } = renderWithProps(Rate, {})
    const group = container.querySelector('[role="radiogroup"]')
    expect(group).toHaveAttribute('aria-label', 'Rating')
  })

  it('stars have aria-label with star number', () => {
    const { container } = renderWithProps(Rate, {})
    const stars = container.querySelectorAll('[role="radio"]')
    expect(stars[0]).toHaveAttribute('aria-label', '1 star')
    expect(stars[4]).toHaveAttribute('aria-label', '5 stars')
  })
})
