/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { TimePicker } from '@expcat/tigercat-vue/TimePicker'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils'

function mockLayout(desktop: boolean) {
  window.matchMedia = ((query: string) => {
    const matches = query.includes('min-width: 640px') ? desktop : false
    return {
      matches,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
      onchange: null
    }
  }) as typeof window.matchMedia
}

describe('TimePicker', () => {
  beforeEach(() => {
    mockLayout(true)
  })

  it('renders a closed field with the locale placeholder', () => {
    const { container } = render(TimePicker)
    expect(container.querySelector('input')).toHaveAttribute('placeholder', 'Select time')
  })

  it('keeps an uncontrolled selection without v-model', async () => {
    const { container } = render(TimePicker, { props: { defaultValue: '10:00' } })
    await fireEvent.click(screen.getByLabelText('Toggle time picker'))
    await fireEvent.click(document.querySelector('[aria-label="11 Hour"]') as HTMLElement)
    expect(container.querySelector('input')).toHaveValue('11:00')
    await fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(container.querySelector('input')).toHaveValue('11:00')
  })

  it('does not emit until OK', async () => {
    const { emitted } = render(TimePicker, { props: { defaultOpen: true } })
    await fireEvent.click(document.querySelector('[aria-label="09 Hour"]') as HTMLElement)
    expect(emitted()['update:modelValue']).toBeUndefined()
    await fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(emitted()['update:modelValue']?.at(-1)?.[0]).toBe('09:00')
  })

  it('supports v-model:open', async () => {
    const onOpen = vi.fn()
    render(TimePicker, {
      props: { open: false, 'onUpdate:open': onOpen }
    })
    await fireEvent.click(screen.getByLabelText('Toggle time picker'))
    expect(onOpen).toHaveBeenCalledWith(true)
  })

  it('uses official locale objects for placeholder copy', () => {
    const { container } = render({
      setup() {
        return () => h(ConfigProvider, { locale: zhCN }, () => h(TimePicker))
      }
    })
    expect(container.querySelector('input')).toHaveAttribute('placeholder', '请选择时间')
  })

  it('uses Traditional Chinese placeholder from zhTW', () => {
    const { container } = render({
      setup() {
        return () => h(ConfigProvider, { locale: zhTW }, () => h(TimePicker))
      }
    })
    expect(container.querySelector('input')).toHaveAttribute('placeholder', '請選擇時間')
  })

  it('can pick 09:30 from an empty value when minTime is 09:30', async () => {
    const { emitted } = render(TimePicker, { props: { minTime: '09:30', defaultOpen: true } })
    await fireEvent.click(document.querySelector('[aria-label="09 Hour"]') as HTMLElement)
    await fireEvent.click(document.querySelector('[aria-label="30 Min"]') as HTMLElement)
    await fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(emitted()['update:modelValue']?.at(-1)?.[0]).toBe('09:30')
  })

  it('mounts only one time tree', async () => {
    render(TimePicker, { props: { defaultOpen: true } })
    const dialog = screen.getByRole('dialog')
    expect(dialog.querySelectorAll('[data-tiger-timepicker-unit="hour"]').length).toBeGreaterThan(0)
    expect(dialog.querySelectorAll('select')).toHaveLength(0)
  })

  it('has no axe violations when the dialog is open', async () => {
    const { container } = render(TimePicker, {
      props: { defaultOpen: true, modelValue: '14:30', 'aria-label': 'Meeting time' }
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
