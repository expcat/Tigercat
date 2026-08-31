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

  it('has no axe violations when the dialog is open', async () => {
    const { container } = render(DatePicker, {
      props: { defaultOpen: true, modelValue: june, now: june, 'aria-label': 'Pick a day' }
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
