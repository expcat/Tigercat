/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ColorPicker } from '@expcat/tigercat-react/ColorPicker'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('ColorPicker', () => {
  it('applies className', () => {
    const { container } = render(<ColorPicker className="my-picker" />)
    expect(container.querySelector('.my-picker')).toBeInTheDocument()
  })

  // --- Dropdown toggle ---
  it('opens dropdown on trigger click', () => {
    const { container } = render(<ColorPicker value="#2563eb" />)
    const trigger = container.querySelector('[role="button"]')!
    fireEvent.click(trigger)
    expect(document.body.querySelector('input[type="text"]')).toBeInTheDocument()
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
    const presets = document.body.querySelectorAll('[aria-label^="Select "]')
    expect(presets.length).toBe(3)
  })

  // --- Hex input ---
  it('calls onChange via hex input', () => {
    const onChange = vi.fn()
    const { container } = render(<ColorPicker value="#2563eb" onChange={onChange} />)
    fireEvent.click(container.querySelector('[role="button"]')!)
    const input = document.body.querySelector('input[type="text"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ff0000' } })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  }) // --- Keyboard accessibility (S3) ---
  it('opens the panel with Enter and Space on the trigger', () => {
    const { container } = render(<ColorPicker value="#2563eb" />)
    const trigger = container.querySelector('[role="button"]')!
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(document.body.querySelector('input[type="text"]')).toBeInTheDocument()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(document.body.querySelector('input[type="text"]')).not.toBeInTheDocument()
    fireEvent.keyDown(trigger, { key: ' ' })
    expect(document.body.querySelector('input[type="text"]')).toBeInTheDocument()
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
    const preset = document.body.querySelector('[aria-label="Select #ff0000"]')!
    expect(preset.getAttribute('role')).toBe('button')
    expect(preset.getAttribute('tabindex')).toBe('0')
    fireEvent.keyDown(preset, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ColorPicker />)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  it('paints the trigger swatch from rgba value (not black)', () => {
    const { container } = render(<ColorPicker value="rgba(37, 99, 235, 0.8)" showAlpha />)
    const trigger = container.querySelector('[role="button"]') as HTMLElement
    const bg = (trigger.style.backgroundColor || '').replace(/\s+/g, '').toLowerCase()
    expect(bg).not.toMatch(/rgb\(0,0,0\)|#000/)
    expect(bg).toMatch(/37/)
    expect(bg).toMatch(/99/)
    expect(bg).toMatch(/235/)
    expect(bg).toMatch(/0\.8/)
  })

  it('emits an alpha-bearing string when the Alpha slider changes', () => {
    const onChange = vi.fn()
    const { container } = render(
      <ColorPicker value="rgba(37, 99, 235, 0.8)" showAlpha format="rgb" onChange={onChange} />
    )
    fireEvent.click(container.querySelector('[role="button"]')!)
    const slider = document.body.querySelector('input[aria-label="Alpha"]') as HTMLInputElement
    expect(slider).toBeTruthy()
    fireEvent.change(slider, { target: { value: '50' } })
    expect(onChange).toHaveBeenCalled()
    const emitted = String(onChange.mock.calls[0][0])
    expect(emitted).toMatch(/rgba?\(|hsla?\(/)
    expect(emitted).not.toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('does not render the Alpha slider when showAlpha is false', () => {
    const { container } = render(<ColorPicker value="#2563eb" showAlpha={false} />)
    fireEvent.click(container.querySelector('[role="button"]')!)
    expect(document.body.querySelector('input[aria-label="Alpha"]')).not.toBeInTheDocument()
  })

  it('uses English Pick color on the trigger by default', () => {
    const { container } = render(<ColorPicker value="#2563eb" />)
    const trigger = container.querySelector('[data-tiger-colorpicker-trigger]')!
    expect(trigger.getAttribute('aria-label')).toBe('Pick color')
    expect(trigger.getAttribute('title')).toBe('Pick color')
  })

  it('uses ConfigProvider zh-CN for trigger / panel title / clear', () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <ColorPicker value="#2563eb" />
      </ConfigProvider>
    )
    const trigger = container.querySelector('[data-tiger-colorpicker-trigger]')!
    expect(trigger.getAttribute('aria-label')).toBe('选择颜色')
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog', { name: '颜色' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '清空' })).toBeInTheDocument()
  })

  it('lets labels.trigger override locale text', () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <ColorPicker value="#2563eb" labels={{ trigger: '自定义颜色' }} />
      </ConfigProvider>
    )
    expect(
      container.querySelector('[data-tiger-colorpicker-trigger]')?.getAttribute('aria-label')
    ).toBe('自定义颜色')
  })

  it('emits empty string when Clear is clicked', () => {
    const onChange = vi.fn()
    const { container } = render(<ColorPicker value="#2563eb" onChange={onChange} />)
    fireEvent.click(container.querySelector('[data-tiger-colorpicker-trigger]')!)
    fireEvent.click(document.body.querySelector('[data-tiger-colorpicker-clear]')!)
    expect(onChange).toHaveBeenCalledWith('')
  })
})
