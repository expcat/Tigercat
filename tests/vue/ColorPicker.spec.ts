/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { render, screen, fireEvent, waitFor } from '@testing-library/vue'
import { ColorPicker } from '@expcat/tigercat-vue/ColorPicker'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { renderWithProps, expectNoA11yViolations } from '../utils'

function trigger(container: HTMLElement) {
  return container.querySelector('[data-tiger-colorpicker-trigger]') as HTMLButtonElement
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
  return fireEvent.pointerDown(plane, { clientX: s, clientY: 100 - v, pointerId: 1 })
}

describe('ColorPicker', () => {
  it('applies className without dropping the wrapper', () => {
    const { container } = renderWithProps(ColorPicker, { className: 'my-picker' })
    const root = container.querySelector('.my-picker') as HTMLElement
    expect(root).toBeInTheDocument()
    expect(root.className).toMatch(/inline-block/)
  })

  it('opens a modal dialog from a native button trigger', async () => {
    const { container } = renderWithProps(ColorPicker, { modelValue: '#2563eb' })
    const button = trigger(container)
    expect(button.tagName).toBe('BUTTON')
    expect(button.getAttribute('aria-haspopup')).toBe('dialog')
    await fireEvent.click(button)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not open when disabled', async () => {
    const { container } = renderWithProps(ColorPicker, { disabled: true })
    await fireEvent.click(trigger(container))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders presets as a ColorSwatch radiogroup', async () => {
    const { container } = renderWithProps(ColorPicker, {
      modelValue: '#000000',
      presets: ['#ff0000', '#00ff00', '#0000ff']
    })
    await fireEvent.click(trigger(container))
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('commits typed input', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, {
      props: { modelValue: '#2563eb', 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(trigger(container))
    const input = document.body.querySelector('input[type="text"]') as HTMLInputElement
    await fireEvent.update(input, 'ff0000')
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('emits rgb after an SV change when format is rgb', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, {
      props: { modelValue: '#808080', format: 'rgb', 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(trigger(container))
    await clickSv(90, 90)
    expect(onChange).toHaveBeenCalled()
    const emitted = String(onChange.mock.calls.at(-1)?.[0])
    expect(emitted.startsWith('rgb')).toBe(true)
  })

  it('selects a preset through ColorSwatch', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, {
      props: { modelValue: '#000000', presets: ['#ff0000'], 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(trigger(container))
    await fireEvent.click(screen.getByRole('radio', { name: '#ff0000' }))
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('paints the trigger from rgba instead of falling back to black', () => {
    const { container } = renderWithProps(ColorPicker, {
      modelValue: 'rgba(37, 99, 235, 0.8)',
      showAlpha: true
    })
    const swatch = trigger(container).firstElementChild as HTMLElement
    const painted = `${swatch.style.boxShadow} ${swatch.style.backgroundColor}`
    expect(painted).toMatch(/37/)
    expect(painted).toMatch(/99/)
    expect(painted).toMatch(/235/)
  })

  it('emits rgba when the alpha slider moves under format=rgb', async () => {
    const onUpdate = vi.fn()
    const { container } = render(ColorPicker, {
      props: {
        modelValue: 'rgba(37, 99, 235, 0.8)',
        showAlpha: true,
        format: 'rgb',
        'onUpdate:modelValue': onUpdate
      }
    })
    await fireEvent.click(trigger(container))
    const slider = document.body.querySelector('input[aria-label="Alpha"]') as HTMLInputElement
    await fireEvent.update(slider, '50')
    const emitted = String(onUpdate.mock.calls[0][0])
    expect(emitted).toMatch(/rgba\(/)
  })

  it('uses ConfigProvider zh-CN for trigger / panel / clear', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, { locale: zhCN }, () => h(ColorPicker, { modelValue: '#2563eb' }))
      }
    })
    const { container } = render(Wrapper)
    expect(trigger(container).getAttribute('aria-label')).toBe('选择颜色')
    await fireEvent.click(trigger(container))
    expect(screen.getByRole('dialog', { name: '颜色' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '清空' })).toBeInTheDocument()
  })

  it('uses official zhTW and jaJP objects', () => {
    const Tw = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, { locale: zhTW }, () => h(ColorPicker, { modelValue: '#2563eb' }))
      }
    })
    const { container, unmount } = render(Tw)
    expect(trigger(container).getAttribute('aria-label')).toBe('選擇顏色')
    unmount()
    const Ja = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, { locale: jaJP }, () => h(ColorPicker, { modelValue: '#2563eb' }))
      }
    })
    const ja = render(Ja)
    expect(trigger(ja.container).getAttribute('aria-label')).toBe('色を選択')
  })

  it('emits empty string when Clear is clicked', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, {
      props: { modelValue: '#2563eb', 'onUpdate:modelValue': onChange }
    })
    await fireEvent.click(trigger(container))
    await fireEvent.click(document.body.querySelector('[data-tiger-colorpicker-clear]')!)
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('does not treat opening the panel as a field blur', async () => {
    const validator = vi.fn(() => undefined)
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(Form, null, () =>
            h(FormItem, { name: 'color', label: 'Theme', rules: [{ validator }] }, () =>
              h(ColorPicker)
            )
          )
      }
    })
    const { container } = render(Wrapper)
    expect(trigger(container).id).toBeTruthy()
    await fireEvent.click(trigger(container))
    expect(validator).not.toHaveBeenCalled()
    await clickSv(70, 70)
    await waitFor(() => expect(validator).toHaveBeenCalled())
  })

  it('has no accessibility violations when open', async () => {
    renderWithProps(ColorPicker, { defaultOpen: true, modelValue: '#2563eb', presets: ['#ff0000'] })
    await expectNoA11yViolations(document.body)
  })
})
