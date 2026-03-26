/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { ColorPicker } from '@expcat/tigercat-vue'
import { renderWithProps } from '../utils'

describe('ColorPicker', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = renderWithProps(ColorPicker, {})
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders color swatch trigger', () => {
    const { container } = renderWithProps(ColorPicker, { modelValue: '#ff0000' })
    const swatch = container.querySelector('[role="button"]')
    expect(swatch).toBeInTheDocument()
  })

  it('applies className prop', () => {
    const { container } = renderWithProps(ColorPicker, { className: 'my-picker' })
    expect(container.querySelector('.my-picker')).toBeInTheDocument()
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = renderWithProps(ColorPicker, { size })
    expect(container.firstElementChild).toBeInTheDocument()
  })

  // --- Dropdown toggle ---
  it('opens dropdown on trigger click', async () => {
    const { container } = renderWithProps(ColorPicker, { modelValue: '#2563eb' })
    const trigger = container.querySelector('[role="button"]')!
    await fireEvent.click(trigger)
    // Should have dropdown panel
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
  })

  it('closes dropdown on second click', async () => {
    const { container } = renderWithProps(ColorPicker, { modelValue: '#2563eb' })
    const trigger = container.querySelector('[role="button"]')!
    await fireEvent.click(trigger)
    await fireEvent.click(trigger)
    expect(container.querySelector('input[type="text"]')).not.toBeInTheDocument()
  })

  // --- Disabled ---
  it('does not open when disabled', async () => {
    const { container } = renderWithProps(ColorPicker, { disabled: true })
    const trigger = container.querySelector('[role="button"]')!
    await fireEvent.click(trigger)
    expect(container.querySelector('input[type="text"]')).not.toBeInTheDocument()
  })

  // --- Preset colors ---
  it('renders preset swatches', async () => {
    const { container } = renderWithProps(ColorPicker, {
      modelValue: '#000',
      presets: ['#ff0000', '#00ff00', '#0000ff']
    })
    const trigger = container.querySelector('[role="button"]')!
    await fireEvent.click(trigger)
    // Should render 3 preset buttons
    const presets = container.querySelectorAll('[aria-label^="Select "]')
    expect(presets.length).toBe(3)
  })

  // --- Hex input ---
  it('updates value via hex input', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, {
      props: { modelValue: '#2563eb', 'onUpdate:modelValue': onChange }
    })
    const trigger = container.querySelector('[role="button"]')!
    await fireEvent.click(trigger)
    const input = container.querySelector('input[type="text"]') as HTMLInputElement
    await fireEvent.update(input, 'ff0000')
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  // --- Hue slider ---
  it('renders hue range slider', async () => {
    const { container } = renderWithProps(ColorPicker, { modelValue: '#2563eb' })
    const trigger = container.querySelector('[role="button"]')!
    await fireEvent.click(trigger)
    const slider = container.querySelector('input[type="range"]')
    expect(slider).toBeInTheDocument()
  })
})
