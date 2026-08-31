/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Calendar } from '@expcat/tigercat-vue/Calendar'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { expectNoA11yViolations } from '../utils'
import { h } from 'vue'

const testDate = new Date(2024, 5, 15)
const now = new Date(2024, 5, 15)

function dayButton(iso: string): HTMLElement {
  const el = document.querySelector(`[data-date="${iso}"]`)
  if (!el) throw new Error(`missing ${iso}`)
  return el as HTMLElement
}

function renderCalendar(props: Record<string, unknown> = {}) {
  return render(Calendar, { props: { now, ...props } })
}

describe('Calendar', () => {
  it('renders the month title and weekday headers', () => {
    renderCalendar({ modelValue: testDate })
    expect(screen.getByText('June 2024')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByRole('grid')).toHaveAttribute('aria-labelledby')
  })

  it('keeps an uncontrolled selection after click', async () => {
    renderCalendar({ defaultValue: testDate })
    await fireEvent.click(dayButton('2024-06-20'))
    expect(dayButton('2024-06-20')).toHaveAttribute('aria-selected', 'true')
  })

  it('follows a controlled value into another month', async () => {
    const { rerender } = renderCalendar({ modelValue: testDate })
    expect(screen.getByText('June 2024')).toBeInTheDocument()
    await rerender({ modelValue: new Date(2024, 7, 20), now })
    expect(screen.getByText('August 2024')).toBeInTheDocument()
    expect(dayButton('2024-08-20')).toHaveAttribute('aria-selected', 'true')
  })

  it('navigates months and wraps the year', async () => {
    renderCalendar({ modelValue: new Date(2024, 11, 1) })
    await fireEvent.click(screen.getByLabelText('Next month'))
    expect(screen.getByText('January 2025')).toBeInTheDocument()
  })

  it('emits update:modelValue for an enabled day and ignores a disabled day', async () => {
    const onUpdate = vi.fn()
    render(Calendar, {
      props: {
        modelValue: testDate,
        now,
        disabledDate: (date: Date) => date.getDate() === 20,
        'onUpdate:modelValue': onUpdate
      }
    })
    await fireEvent.click(dayButton('2024-06-20'))
    expect(onUpdate).not.toHaveBeenCalled()
    await fireEvent.click(dayButton('2024-06-21'))
    expect((onUpdate.mock.calls[0][0] as Date).getDate()).toBe(21)
  })

  it('clicks a padding day and jumps to that month', async () => {
    const onUpdate = vi.fn()
    render(Calendar, {
      props: { modelValue: testDate, now, 'onUpdate:modelValue': onUpdate }
    })
    await fireEvent.click(dayButton('2024-07-01'))
    expect(screen.getByText('July 2024')).toBeInTheDocument()
    expect((onUpdate.mock.calls[0][0] as Date).getMonth()).toBe(6)
  })

  it('year view click selects the 1st and switches to month mode when mode is uncontrolled', async () => {
    const onUpdate = vi.fn()
    const onPanelChange = vi.fn()
    render(Calendar, {
      props: {
        defaultValue: testDate,
        now,
        'onUpdate:modelValue': onUpdate,
        onPanelChange
      }
    })
    await fireEvent.click(screen.getByText('June 2024'))
    expect(screen.getByText('2024')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('gridcell', { name: 'Mar' }))
    expect((onUpdate.mock.calls[0][0] as Date).getMonth()).toBe(2)
    expect(onPanelChange).toHaveBeenCalledWith(expect.any(Date), 'month')
    expect(screen.getByText('March 2024')).toBeInTheDocument()
  })

  it('moves focus with arrows and skips disabled days', async () => {
    renderCalendar({
      modelValue: new Date(2024, 5, 14),
      disabledDate: (date: Date) => date.getDay() === 0 || date.getDay() === 6
    })
    const start = dayButton('2024-06-14')
    start.focus()
    await fireEvent.keyDown(start, { key: 'ArrowRight' })
    expect(dayButton('2024-06-17')).toHaveFocus()
  })

  it('uses official locale objects for navigation copy and week start', () => {
    render({
      setup() {
        return () =>
          h(ConfigProvider, { locale: zhCN }, () => h(Calendar, { modelValue: testDate, now }))
      }
    })
    expect(screen.getByLabelText('下个月')).toBeInTheDocument()
    expect(screen.getByText('周一')).toBeInTheDocument()
  })

  it('uses Traditional Chinese navigation copy from zhTW', () => {
    render({
      setup() {
        return () =>
          h(ConfigProvider, { locale: zhTW }, () => h(Calendar, { modelValue: testDate, now }))
      }
    })
    expect(screen.getByLabelText('下個月')).toBeInTheDocument()
  })

  it('uses Japanese navigation copy from jaJP', () => {
    render({
      setup() {
        return () =>
          h(ConfigProvider, { locale: jaJP }, () => h(Calendar, { modelValue: testDate, now }))
      }
    })
    expect(screen.getByLabelText('翌月')).toBeInTheDocument()
  })

  it('has no axe violations for a labelled month view with disabled dates', async () => {
    const { container } = render(Calendar, {
      props: {
        modelValue: testDate,
        now,
        disabledDate: (date: Date) => date.getDay() === 0,
        'aria-label': 'June calendar'
      }
    })
    await expectNoA11yViolations(container)
  })
})
