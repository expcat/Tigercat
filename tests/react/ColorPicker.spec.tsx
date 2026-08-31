/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { ColorPicker } from '@expcat/tigercat-react/ColorPicker'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { expectNoA11yViolations } from '../utils/react'

function trigger(container: HTMLElement) {
  return container.querySelector('[data-tiger-colorpicker-trigger]') as HTMLButtonElement
}

function open(container: HTMLElement) {
  fireEvent.click(trigger(container))
}

function clickSv(s = 80, v = 80) {
  const plane = document.body.querySelector('[data-tiger-colorpicker-sv]') as HTMLElement
  plane.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      toJSON: () => undefined
    }) as DOMRect
  fireEvent.pointerDown(plane, { clientX: s, clientY: 100 - v, pointerId: 1 })
}

describe('ColorPicker', () => {
  it('applies className without dropping the wrapper', () => {
    const { container } = render(<ColorPicker className="my-picker" />)
    const root = container.querySelector('.my-picker') as HTMLElement
    expect(root).toBeInTheDocument()
    expect(root.className).toMatch(/inline-block/)
  })

  it('opens a modal dialog from a native button trigger', () => {
    const { container } = render(<ColorPicker value="#2563eb" />)
    const button = trigger(container)
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-controls')
  })

  it('does not open when disabled', () => {
    const { container } = render(<ColorPicker disabled />)
    fireEvent.click(trigger(container))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders presets as a ColorSwatch radiogroup', () => {
    const { container } = render(
      <ColorPicker value="#000000" presets={['#ff0000', '#00ff00', '#0000ff']} />
    )
    open(container)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('commits typed input in the current format', () => {
    const onChange = vi.fn()
    const { container } = render(<ColorPicker value="#2563eb" onChange={onChange} />)
    open(container)
    const input = document.body.querySelector('input[type="text"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ff0000' } })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('opens with Enter and Space on the trigger', () => {
    const { container } = render(<ColorPicker value="#2563eb" />)
    const button = trigger(container)
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.keyDown(button, { key: ' ' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('emits rgb after an SV change when format is rgb', () => {
    const onChange = vi.fn()
    const { container } = render(<ColorPicker value="#808080" format="rgb" onChange={onChange} />)
    open(container)
    clickSv(90, 90)
    expect(onChange).toHaveBeenCalled()
    const emitted = String(onChange.mock.calls.at(-1)?.[0])
    expect(emitted.startsWith('rgb')).toBe(true)
    expect(emitted).not.toMatch(/^#/)
  })

  it('keeps hex format when dragging hue of a saturated color', () => {
    const onChange = vi.fn()
    const { container } = render(<ColorPicker value="#ff0000" format="hex" onChange={onChange} />)
    open(container)
    fireEvent.change(screen.getByRole('slider', { name: 'Hue' }), { target: { value: '120' } })
    const emitted = String(onChange.mock.calls.at(-1)?.[0])
    expect(emitted).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('selects a preset through ColorSwatch', () => {
    const onChange = vi.fn()
    const { container } = render(
      <ColorPicker value="#000000" presets={['#ff0000']} onChange={onChange} />
    )
    open(container)
    fireEvent.click(screen.getByRole('radio', { name: '#ff0000' }))
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('paints the trigger from rgba instead of falling back to black', () => {
    const { container } = render(<ColorPicker value="rgba(37, 99, 235, 0.8)" showAlpha />)
    const swatch = trigger(container).firstElementChild as HTMLElement
    const painted = `${swatch.style.boxShadow} ${swatch.style.backgroundColor}`
    expect(painted).toMatch(/37/)
    expect(painted).toMatch(/99/)
    expect(painted).toMatch(/235/)
  })

  it('emits rgba when the alpha slider moves under format=rgb', () => {
    const onChange = vi.fn()
    const { container } = render(
      <ColorPicker value="rgba(37, 99, 235, 0.8)" showAlpha format="rgb" onChange={onChange} />
    )
    open(container)
    fireEvent.change(screen.getByRole('slider', { name: 'Alpha' }), { target: { value: '50' } })
    const emitted = String(onChange.mock.calls[0][0])
    expect(emitted).toMatch(/rgba\(/)
    expect(emitted).not.toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('uncontrolled defaultValue survives rerender and updates from a preset', () => {
    const { container, rerender } = render(
      <ColorPicker defaultValue="#111111" presets={['#ff0000']} />
    )
    open(container)
    fireEvent.click(screen.getByRole('radio', { name: '#ff0000' }))
    rerender(<ColorPicker defaultValue="#111111" presets={['#ff0000']} />)
    const swatch = trigger(container).firstElementChild as HTMLElement
    expect(swatch.style.boxShadow).toMatch(/255/)
  })

  it('uses ConfigProvider zh-CN for trigger / panel / clear', () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <ColorPicker value="#2563eb" />
      </ConfigProvider>
    )
    expect(trigger(container)).toHaveAttribute('aria-label', '选择颜色')
    open(container)
    expect(screen.getByRole('dialog', { name: '颜色' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '清空' })).toBeInTheDocument()
  })

  it('uses official zhTW and jaJP objects', () => {
    const { container, rerender } = render(
      <ConfigProvider locale={zhTW}>
        <ColorPicker value="#2563eb" />
      </ConfigProvider>
    )
    expect(trigger(container)).toHaveAttribute('aria-label', '選擇顏色')
    rerender(
      <ConfigProvider locale={jaJP}>
        <ColorPicker value="#2563eb" />
      </ConfigProvider>
    )
    expect(trigger(container)).toHaveAttribute('aria-label', '色を選択')
  })

  it('lets labels.trigger override locale text', () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <ColorPicker value="#2563eb" labels={{ trigger: '自定义颜色' }} />
      </ConfigProvider>
    )
    expect(trigger(container)).toHaveAttribute('aria-label', '自定义颜色')
  })

  it('emits empty string when Clear is clicked', () => {
    const onChange = vi.fn()
    const { container } = render(<ColorPicker value="#2563eb" onChange={onChange} />)
    open(container)
    fireEvent.click(document.body.querySelector('[data-tiger-colorpicker-clear]')!)
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('does not treat opening the panel as a field blur', async () => {
    const validator = vi.fn(() => undefined)
    const { container } = render(
      <Form>
        <FormItem name="color" label="Theme" rules={[{ validator }]}>
          <ColorPicker />
        </FormItem>
      </Form>
    )
    expect(trigger(container)).toHaveAttribute('id')
    open(container)
    expect(validator).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('slider', { name: /Saturation/ }))
    clickSv(70, 70)
    await waitFor(() => expect(validator).toHaveBeenCalled())
  })

  it('has no accessibility violations when open', async () => {
    render(<ColorPicker defaultOpen value="#2563eb" presets={['#ff0000']} />)
    await expectNoA11yViolations(document.body)
  })
})
