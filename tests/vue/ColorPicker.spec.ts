/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { ColorPicker } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('ColorPicker', () => {
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
  }) // --- Keyboard accessibility (S3) ---
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
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(ColorPicker)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {})
})
