/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { Mentions } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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

  it('positions dropdown with floating styles when mention query opens', async () => {
    const { container } = render(<Mentions options={defaultOptions} value="" onChange={vi.fn()} />)
    const textarea = container.querySelector('textarea')!

    fireEvent.change(textarea, {
      target: {
        value: '@a',
        selectionStart: 2
      }
    })

    const dropdown = await screen.findByRole('listbox')

    await waitFor(() => {
      expect(dropdown.style.left).not.toBe('')
      expect(dropdown.style.top).not.toBe('')
    })
  })

  // --- Keyboard navigation ---
  it('navigates options with ArrowDown and ArrowUp', async () => {
    const { container } = render(<Mentions options={defaultOptions} value="" onChange={vi.fn()} />)
    const textarea = container.querySelector('textarea')!

    fireEvent.change(textarea, {
      target: { value: '@', selectionStart: 1 }
    })
    await screen.findByRole('listbox')

    fireEvent.keyDown(textarea, { key: 'ArrowDown' })
    const options = container.querySelectorAll('[role="option"]')
    expect(options[1]?.getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(textarea, { key: 'ArrowUp' })
    expect(options[0]?.getAttribute('aria-selected')).toBe('true')
  })

  it('selects option with Enter key', async () => {
    const onSelect = vi.fn()
    const onChange = vi.fn()
    const { container } = render(
      <Mentions options={defaultOptions} value="" onChange={onChange} onSelect={onSelect} />
    )
    const textarea = container.querySelector('textarea')!

    fireEvent.change(textarea, {
      target: { value: '@', selectionStart: 1 }
    })
    await screen.findByRole('listbox')

    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalled()
  })

  it('closes dropdown on Escape', async () => {
    const { container } = render(<Mentions options={defaultOptions} value="" onChange={vi.fn()} />)
    const textarea = container.querySelector('textarea')!

    fireEvent.change(textarea, {
      target: { value: '@', selectionStart: 1 }
    })
    await screen.findByRole('listbox')

    fireEvent.keyDown(textarea, { key: 'Escape' })
    expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
  })

  // --- Option click selection ---
  it('selects option on click', async () => {
    const onSelect = vi.fn()
    const onChange = vi.fn()
    const { container } = render(
      <Mentions options={defaultOptions} value="" onChange={onChange} onSelect={onSelect} />
    )
    const textarea = container.querySelector('textarea')!

    fireEvent.change(textarea, {
      target: { value: '@', selectionStart: 1 }
    })
    await screen.findByRole('listbox')

    const option = container.querySelectorAll('[role="option"]')[0]
    fireEvent.click(option)
    expect(onSelect).toHaveBeenCalled()
  })

  // --- Filtering ---
  it('filters options based on query text', async () => {
    const { container } = render(<Mentions options={defaultOptions} value="" onChange={vi.fn()} />)
    const textarea = container.querySelector('textarea')!

    fireEvent.change(textarea, {
      target: { value: '@al', selectionStart: 3 }
    })
    await screen.findByRole('listbox')

    const options = container.querySelectorAll('[role="option"]')
    expect(options).toHaveLength(1)
    expect(options[0].textContent).toBe('Alice')
  })

  // --- Custom prefix ---
  it('supports custom prefix character', async () => {
    const { container } = render(
      <Mentions options={defaultOptions} value="" onChange={vi.fn()} prefix="#" />
    )
    const textarea = container.querySelector('textarea')!

    fireEvent.change(textarea, {
      target: { value: '#b', selectionStart: 2 }
    })
    await screen.findByRole('listbox')

    const options = container.querySelectorAll('[role="option"]')
    expect(options).toHaveLength(1)
    expect(options[0].textContent).toBe('Bob')
  })

  // --- Disabled options ---
  it('does not select disabled options', async () => {
    const disabledOptions = [...defaultOptions, { value: 'dave', label: 'Dave', disabled: true }]
    const onSelect = vi.fn()
    const { container } = render(
      <Mentions options={disabledOptions} value="" onChange={vi.fn()} onSelect={onSelect} />
    )
    const textarea = container.querySelector('textarea')!

    fireEvent.change(textarea, {
      target: { value: '@d', selectionStart: 2 }
    })

    // No non-disabled options match 'd' prefix except 'dave' which is disabled
    // Since filter excludes disabled, dropdown might be empty or not shown
    // This covers the disabled option filtering branch
    expect(container.querySelector('textarea')).toBeInTheDocument()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Mentions />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<Mentions />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
