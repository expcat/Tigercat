/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { ColorPicker } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

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
  // --- Keyboard accessibility (S3) ---
  it('opens the panel with Enter and Space on the trigger', async () => {
    const { container } = renderWithProps(ColorPicker, { modelValue: '#2563eb' })
    const trigger = container.querySelector('[role="button"]')!
    await fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
    await fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(container.querySelector('input[type="text"]')).not.toBeInTheDocument()
    await fireEvent.keyDown(trigger, { key: ' ' })
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument()
  })

  it('exposes aria-expanded / aria-haspopup on the trigger', async () => {
    const { container } = renderWithProps(ColorPicker, { modelValue: '#2563eb' })
    const trigger = container.querySelector('[role="button"]')!
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    await fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('makes preset swatches keyboard-operable', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, {
      props: { modelValue: '#000000', presets: ['#ff0000'], 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(container.querySelector('[role="button"]')!)
    const preset = container.querySelector('[aria-label="Select #ff0000"]')!
    expect(preset.getAttribute('role')).toBe('button')
    expect(preset.getAttribute('tabindex')).toBe('0')
    await fireEvent.keyDown(preset, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  // --- format / showAlpha (S3) ---
  it('renders the value in the declared format', async () => {
    const { container } = renderWithProps(ColorPicker, { modelValue: '#2563eb', format: 'rgb' })
    await fireEvent.click(container.querySelector('[role="button"]')!)
    const input = container.querySelector('input[aria-label="Color value"]') as HTMLInputElement
    expect(input.value).toBe('rgb(37, 99, 235)')
  })

  it('shows an alpha slider and reflects alpha in the displayed value when showAlpha', async () => {
    const { container } = renderWithProps(ColorPicker, {
      modelValue: '#2563eb',
      format: 'rgb',
      showAlpha: true
    })
    await fireEvent.click(container.querySelector('[role="button"]')!)
    const alpha = container.querySelector('input[aria-label="Alpha"]') as HTMLInputElement
    expect(alpha).toBeInTheDocument()
    await fireEvent.update(alpha, '50')
    const input = container.querySelector('input[aria-label="Color value"]') as HTMLInputElement
    expect(input.value).toBe('rgba(37, 99, 235, 0.5)')
  })

  it('parses rgb() input back to a hex value', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, {
      props: { modelValue: '#2563eb', format: 'rgb', 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(container.querySelector('[role="button"]')!)
    const input = container.querySelector('input[aria-label="Color value"]') as HTMLInputElement
    await fireEvent.update(input, 'rgb(255, 0, 0)')
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(ColorPicker)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(ColorPicker)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
