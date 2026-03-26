/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Mentions } from '@expcat/tigercat-react'

const defaultOptions = [
  { value: 'alice', label: 'Alice' },
  { value: 'bob', label: 'Bob' },
  { value: 'charlie', label: 'Charlie' }
]

describe('Mentions', () => {
  // --- Basic rendering ---
  it('renders textarea', () => {
    const { container } = render(<Mentions options={defaultOptions} />)
    expect(container.querySelector('textarea')).toBeInTheDocument()
  })

  it('applies placeholder', () => {
    const { container } = render(
      <Mentions options={defaultOptions} placeholder="Type @ to mention" />
    )
    expect(container.querySelector('textarea')).toHaveAttribute('placeholder', 'Type @ to mention')
  })

  it('applies className', () => {
    const { container } = render(<Mentions options={defaultOptions} className="my-mentions" />)
    expect(container.querySelector('.my-mentions')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = render(<Mentions options={defaultOptions} size={size} />)
    expect(container.querySelector('textarea')).toBeInTheDocument()
  })

  // --- Disabled ---
  it('disables textarea when disabled', () => {
    const { container } = render(<Mentions options={defaultOptions} disabled />)
    expect(container.querySelector('textarea')).toBeDisabled()
  })

  // --- Rows ---
  it('applies rows prop', () => {
    const { container } = render(<Mentions options={defaultOptions} rows={5} />)
    expect(container.querySelector('textarea')).toHaveAttribute('rows', '5')
  })

  // --- Input handling ---
  it('calls onChange on input', () => {
    const onChange = vi.fn()
    const { container } = render(<Mentions options={defaultOptions} value="" onChange={onChange} />)
    const textarea = container.querySelector('textarea')!
    fireEvent.change(textarea, { target: { value: 'hello' } })
    expect(onChange).toHaveBeenCalled()
  })

  // --- Dropdown (listbox) role ---
  it('does not show dropdown initially', () => {
    const { container } = render(<Mentions options={defaultOptions} />)
    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
  })
})
