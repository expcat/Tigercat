/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Rate } from '@expcat/tigercat-react'

describe('Rate', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = render(<Rate />)
    expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument()
  })

  it('renders 5 stars by default', () => {
    const { container } = render(<Rate />)
    const stars = container.querySelectorAll('[role="radio"]')
    expect(stars.length).toBe(5)
  })

  it('renders custom count', () => {
    const { container } = render(<Rate count={3} />)
    const stars = container.querySelectorAll('[role="radio"]')
    expect(stars.length).toBe(3)
  })

  it('applies className', () => {
    const { container } = render(<Rate className="custom-rate" />)
    expect(container.querySelector('.custom-rate')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = render(<Rate size={size} />)
    expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument()
  })

  // --- Selection ---
  it('calls onChange on star click', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={0} onChange={onChange} />)
    const stars = container.querySelectorAll('[role="radio"]')
    fireEvent.click(stars[2])
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('reflects current value via aria-checked', () => {
    const { container } = render(<Rate value={3} />)
    const stars = container.querySelectorAll('[role="radio"]')
    expect(stars[2].getAttribute('aria-checked')).toBe('true')
    expect(stars[3].getAttribute('aria-checked')).toBe('false')
  })

  // --- Disabled ---
  it('does not call onChange when disabled', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={0} disabled onChange={onChange} />)
    const stars = container.querySelectorAll('[role="radio"]')
    fireEvent.click(stars[1])
    expect(onChange).not.toHaveBeenCalled()
  })

  // --- Allow clear ---
  it('clears value when clicking same star with allowClear', () => {
    const onChange = vi.fn()
    const { container } = render(<Rate value={3} allowClear onChange={onChange} />)
    const stars = container.querySelectorAll('[role="radio"]')
    fireEvent.click(stars[2])
    expect(onChange).toHaveBeenCalledWith(0)
  })

  // --- SVG rendering ---
  it('renders SVG stars', () => {
    const { container } = render(<Rate />)
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0)
  })

  // --- Accessibility ---
  it('has aria-label on radiogroup', () => {
    const { container } = render(<Rate />)
    expect(container.querySelector('[role="radiogroup"]')).toHaveAttribute('aria-label', 'Rating')
  })

  it('stars have aria-label with star number', () => {
    const { container } = render(<Rate />)
    const stars = container.querySelectorAll('[role="radio"]')
    expect(stars[0]).toHaveAttribute('aria-label', '1 star')
    expect(stars[4]).toHaveAttribute('aria-label', '5 stars')
  })
})
