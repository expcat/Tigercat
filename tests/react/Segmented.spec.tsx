/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Segmented } from '@expcat/tigercat-react'

const defaultOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' }
]

describe('Segmented', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = render(<Segmented options={defaultOptions} />)
    expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument()
  })

  it('renders all options', () => {
    render(<Segmented options={defaultOptions} />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
    expect(screen.getByText('Option C')).toBeInTheDocument()
  })

  it('renders radio options', () => {
    const { container } = render(<Segmented options={defaultOptions} />)
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios.length).toBe(3)
  })

  it('applies className', () => {
    const { container } = render(<Segmented options={defaultOptions} className="my-seg" />)
    expect(container.querySelector('.my-seg')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = render(<Segmented options={defaultOptions} size={size} />)
    expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument()
  })

  // --- Selection ---
  it('calls onChange on option click', () => {
    const onChange = vi.fn()
    render(<Segmented options={defaultOptions} value="a" onChange={onChange} />)
    fireEvent.click(screen.getByText('Option B'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('checks the selected radio', () => {
    const { container } = render(<Segmented options={defaultOptions} value="b" />)
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios[1].getAttribute('aria-checked')).toBe('true')
    expect(radios[0].getAttribute('aria-checked')).toBe('false')
  })

  // --- Disabled ---
  it('disables all options when disabled', () => {
    const { container } = render(<Segmented options={defaultOptions} disabled />)
    const radios = container.querySelectorAll('[role="radio"]')
    radios.forEach((r) => expect(r.getAttribute('aria-disabled')).toBe('true'))
  })

  it('disables individual option', () => {
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' }
    ]
    const { container } = render(<Segmented options={opts} />)
    const radios = container.querySelectorAll('[role="radio"]')
    expect(radios[0].getAttribute('aria-disabled')).toBe('false')
    expect(radios[1].getAttribute('aria-disabled')).toBe('true')
    expect(radios[2].getAttribute('aria-disabled')).toBe('false')
  })

  // --- Block mode ---
  it('applies block class', () => {
    const { container } = render(<Segmented options={defaultOptions} block />)
    const group = container.querySelector('[role="radiogroup"]')
    expect(group?.className).toContain('w-full')
  })
})
