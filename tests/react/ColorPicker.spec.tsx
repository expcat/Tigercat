/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ColorPicker } from '@expcat/tigercat-react'

describe('ColorPicker', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = render(<ColorPicker />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders color swatch trigger', () => {
    const { container } = render(<ColorPicker value="#ff0000" />)
    const swatch = container.querySelector('[role="button"]')
    expect(swatch).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<ColorPicker className="my-picker" />)
    expect(container.querySelector('.my-picker')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = render(<ColorPicker size={size} />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  // --- Dropdown toggle ---
  it('opens dropdown on trigger click', () => {
    const { container } = render(<ColorPicker value="#2563eb" />)
    const trigger = container.querySelector('[role="button"]')!
    fireEvent.click(trigger)
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
  })

  it('closes dropdown on second click', () => {
    const { container } = render(<ColorPicker value="#2563eb" />)
    const trigger = container.querySelector('[role="button"]')!
    fireEvent.click(trigger)
    fireEvent.click(trigger)
    expect(container.querySelector('input[type="text"]')).not.toBeInTheDocument()
  })

  // --- Disabled ---
  it('does not open when disabled', () => {
    const { container } = render(<ColorPicker disabled />)
    const trigger = container.querySelector('[role="button"]')!
    fireEvent.click(trigger)
    expect(container.querySelector('input[type="text"]')).not.toBeInTheDocument()
  })

  // --- Preset colors ---
  it('renders preset swatches', () => {
    const { container } = render(
      <ColorPicker value="#000" presets={['#ff0000', '#00ff00', '#0000ff']} />
    )
    fireEvent.click(container.querySelector('[role="button"]')!)
    const presets = container.querySelectorAll('[aria-label^="Select "]')
    expect(presets.length).toBe(3)
  })

  // --- Hex input ---
  it('calls onChange via hex input', () => {
    const onChange = vi.fn()
    const { container } = render(<ColorPicker value="#2563eb" onChange={onChange} />)
    fireEvent.click(container.querySelector('[role="button"]')!)
    const input = container.querySelector('input[type="text"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ff0000' } })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  // --- Hue slider ---
  it('renders hue range slider', () => {
    const { container } = render(<ColorPicker value="#2563eb" />)
    fireEvent.click(container.querySelector('[role="button"]')!)
    expect(container.querySelector('input[type="range"]')).toBeInTheDocument()
  })
})
