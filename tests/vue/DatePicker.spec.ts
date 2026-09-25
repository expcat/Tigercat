/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { DatePicker } from '@expcat/tigercat-vue/DatePicker'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils'

const june = new Date(2024, 5, 15)

describe('DatePicker', () => {
  it('renders a closed field with the locale placeholder', () => {
    const { container } = render(DatePicker)
    expect(container.querySelector('input')).toHaveAttribute('placeholder', 'Select date')
  })

  it('keeps an uncontrolled selection without v-model', async () => {
    const { container } = render(DatePicker, { props: { defaultValue: june, now: june } })
    await fireEvent.click(screen.getByLabelText('Toggle calendar'))
    await fireEvent.click(document.querySelector('[data-date="2024-06-20"]') as HTMLElement)
    expect(container.querySelector('input')).toHaveValue('2024-06-20')
  })

  it('supports v-model:open', async () => {
    const onOpen = vi.fn()
    render(DatePicker, {
      props: { now: june, open: false, 'onUpdate:open': onOpen }
    })
    await fireEvent.click(screen.getByLabelText('Toggle calendar'))
    expect(onOpen).toHaveBeenCalledWith(true)
  })

  it('uses official locale objects for placeholder copy', () => {
    const { container } = render({
      setup() {
        return () => h(ConfigProvider, { locale: zhCN }, () => h(DatePicker))
      }
    })
    expect(container.querySelector('input')).toHaveAttribute('placeholder', '请选择日期')
  })

  it('uses Traditional Chinese placeholder from zhTW', () => {
    const { container } = render({
      setup() {
        return () => h(ConfigProvider, { locale: zhTW }, () => h(DatePicker))
      }
    })
    expect(container.querySelector('input')).toHaveAttribute('placeholder', '請選擇日期')
  })

  it('submits the Gregorian day and does not emit legacy value events', async () => {
    const date = new Date(2024, 0, 5)
    const { container, emitted } = render(DatePicker, {
      props: { name: 'day', locale: { locale: 'th-TH' }, modelValue: date, now: date }
    })
    const text = container.querySelector('input[type="text"]') as HTMLInputElement
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(text).toHaveValue('2567-01-05')
    expect(text).not.toHaveAttribute('name')
    expect(hidden).toHaveAttribute('name', 'day')
    expect(hidden).toHaveValue('2024-01-05')
    await fireEvent.click(screen.getByLabelText('Toggle calendar'))
    expect(emitted().change).toBeUndefined()
    expect(emitted().input).toBeUndefined()
    expect(emitted()['open-change']).toBeUndefined()
    expect(emitted()['update:open']?.[0]).toEqual([true])
  })

  it('sets a single-day range when Today is clicked without an injected clock', async () => {
    const onUpdate = vi.fn()
    const { container } = render(DatePicker, {
      props: {
        range: true,
        defaultOpen: true,
        'onUpdate:modelValue': onUpdate
      }
    })
    await fireEvent.click(screen.getByRole('button', { name: 'Today' }))
    expect(onUpdate).toHaveBeenCalledTimes(1)
    const [start, end] = onUpdate.mock.calls[0][0] as [Date, Date]
    const today = new Date()
    expect(start.getFullYear()).toBe(today.getFullYear())
    expect(start.getMonth()).toBe(today.getMonth())
    expect(start.getDate()).toBe(today.getDate())
    expect(end.getMonth()).toBe(start.getMonth())
    expect(end.getDate()).toBe(start.getDate())
    const pad = (n: number) => String(n).padStart(2, '0')
    const iso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    expect(container.querySelector('input')).toHaveValue(`${iso} - ${iso}`)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('opens a range month grid in a panel that fits the calendar card', async () => {
    render(DatePicker, { props: { range: true, defaultOpen: true } })
    expect(await screen.findByRole('grid')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-date]').length).toBeGreaterThan(20)
    const panel = document.querySelector('[data-tiger="datepicker-panel"]') as HTMLElement
    expect(panel.className).toContain('w-fit')
    expect(panel.className).not.toContain('w-80')
  })

  it('has no axe violations when the dialog is open', async () => {
    const { container } = render(DatePicker, {
      props: { defaultOpen: true, modelValue: june, now: june, 'aria-label': 'Pick a day' }
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
