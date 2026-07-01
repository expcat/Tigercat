/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ColorPicker } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
  // --- Keyboard accessibility (S3) ---
  it('opens the panel with Enter and Space on the trigger', () => {
    const { container } = render(<ColorPicker value="#2563eb" />)
    const trigger = container.querySelector('[role="button"]')!
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(container.querySelector('input[type="text"]')).not.toBeInTheDocument()
    fireEvent.keyDown(trigger, { key: ' ' })
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
  })

  it('exposes aria-expanded / aria-haspopup on the trigger', () => {
    const { container } = render(<ColorPicker value="#2563eb" />)
    const trigger = container.querySelector('[role="button"]')!
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('makes preset swatches keyboard-operable', () => {
    const onChange = vi.fn()
    const { container } = render(
      <ColorPicker value="#000000" presets={['#ff0000']} onChange={onChange} />
    )
    fireEvent.click(container.querySelector('[role="button"]')!)
    const preset = container.querySelector('[aria-label="Select #ff0000"]')!
    expect(preset.getAttribute('role')).toBe('button')
    expect(preset.getAttribute('tabindex')).toBe('0')
    fireEvent.keyDown(preset, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  // --- format / showAlpha (S3) ---
  it('renders the value in the declared format', () => {
    const { container } = render(<ColorPicker value="#2563eb" format="rgb" />)
    fireEvent.click(container.querySelector('[role="button"]')!)
    const input = container.querySelector('input[aria-label="Color value"]') as HTMLInputElement
    expect(input.value).toBe('rgb(37, 99, 235)')
  })

  it('shows an alpha slider and reflects alpha in the displayed value when showAlpha', () => {
    const { container } = render(<ColorPicker value="#2563eb" format="rgb" showAlpha />)
    fireEvent.click(container.querySelector('[role="button"]')!)
    const alpha = container.querySelector('input[aria-label="Alpha"]') as HTMLInputElement
    expect(alpha).toBeInTheDocument()
    fireEvent.change(alpha, { target: { value: '50' } })
    const input = container.querySelector('input[aria-label="Color value"]') as HTMLInputElement
    expect(input.value).toBe('rgba(37, 99, 235, 0.5)')
  })

  it('parses rgb() input back to a hex value', () => {
    const onChange = vi.fn()
    const { container } = render(<ColorPicker value="#2563eb" format="rgb" onChange={onChange} />)
    fireEvent.click(container.querySelector('[role="button"]')!)
    const input = container.querySelector('input[aria-label="Color value"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'rgb(255, 0, 0)' } })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ColorPicker />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<ColorPicker />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
