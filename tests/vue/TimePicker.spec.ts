/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { TimePicker, ConfigProvider } from '@expcat/tigercat-vue'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { defineComponent, h } from 'vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('TimePicker', () => {
  it('renders default placeholder', () => {
    const { container } = render(TimePicker)
    const input = container.querySelector('input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Select time')
  })

  it('uses locale-based default placeholder', () => {
    const { container } = renderWithProps(TimePicker, { locale: 'zh-CN' })
    const input = container.querySelector('input')
    expect(input).toHaveAttribute('placeholder', '请选择时间')
  })

  it('uses ConfigProvider locale labels', () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(
            ConfigProvider,
            { locale: zhCN },
            {
              default: () => h(TimePicker)
            }
          )
      }
    })

    const { container } = render(Wrapper)
    const input = container.querySelector('input')
    expect(input).toHaveAttribute('placeholder', '请选择时间')
  })

  it('allows overriding labels for placeholder', () => {
    const { container } = renderWithProps(TimePicker, {
      labels: { selectTime: 'Pick a time' }
    })
    const input = container.querySelector('input')
    expect(input).toHaveAttribute('placeholder', 'Pick a time')
  })

  it('uses range placeholder by default in range mode', () => {
    const { container } = renderWithProps(TimePicker, { range: true })
    const input = container.querySelector('input')
    expect(input).toHaveAttribute('placeholder', 'Select time range')
  })

  it('renders controlled display value', () => {
    const { container } = renderWithProps(TimePicker, { modelValue: '14:30' })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('14:30')
  })

  it('supports 12-hour display', () => {
    const { container } = renderWithProps(TimePicker, {
      modelValue: '14:30',
      format: '12'
    })
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('02:30 PM')
  })

  it('opens panel when input clicked', async () => {
    const { container } = render(TimePicker)
    await fireEvent.click(container.querySelector('input') as HTMLInputElement)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeInTheDocument())
  })

  it('renders mobile wheel selects and emits time changes from them', async () => {
    const { container, emitted } = renderWithProps(TimePicker, {
      modelValue: '10:15'
    })

    await fireEvent.click(container.querySelector('input') as HTMLInputElement)
    const hourSelect = container.querySelector('select[aria-label="Hour"]') as HTMLSelectElement

    expect(hourSelect).toBeInTheDocument()
    await fireEvent.update(hourSelect, '11')
    expect(emitted().change?.at(-1)).toEqual(['11:15'])
  })

  it('closes on Escape and restores focus to input', async () => {
    const { container } = render(TimePicker)
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.click(input)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeInTheDocument())

    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    await fireEvent.keyDown(dialog, { key: 'Escape' })

    await waitFor(() => expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument())
    expect(document.activeElement).toBe(input)
  })

  it('supports keyboard navigation to change hour', async () => {
    const { container, emitted } = renderWithProps(TimePicker, {
      modelValue: null
    })
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.click(input)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeInTheDocument())

    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    await fireEvent.keyDown(dialog, { key: 'ArrowDown' })
    await fireEvent.keyDown(dialog, { key: 'Enter' })

    expect(emitted()).toHaveProperty('update:modelValue')
  })

  it('focuses first enabled hour and skips disabled options with keyboard', async () => {
    const { container } = renderWithProps(TimePicker, {
      modelValue: null,
      minTime: '10:00',
      maxTime: '11:00'
    })
    const input = container.querySelector('input') as HTMLInputElement

    await fireEvent.click(input)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeInTheDocument())

    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    const hourButtons = Array.from(
      dialog.querySelectorAll('button[data-tiger-timepicker-unit="hour"]')
    ).filter((el) => !(el as HTMLButtonElement).disabled) as HTMLButtonElement[]

    expect(hourButtons.length).toBeGreaterThanOrEqual(1)
    expect(document.activeElement).toBe(hourButtons[0])

    await fireEvent.keyDown(dialog, { key: 'ArrowDown' })
    if (hourButtons.length >= 2) {
      expect(document.activeElement).toBe(hourButtons[1])
    }

    await fireEvent.keyDown(dialog, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(hourButtons[hourButtons.length - 1])
  })

  it('emits clear + update:modelValue when cleared', async () => {
    const { container, emitted } = renderWithProps(TimePicker, {
      modelValue: '14:30',
      clearable: true
    })

    const clearButton = container.querySelector(
      'button[aria-label="Clear time"]'
    ) as HTMLButtonElement
    await fireEvent.click(clearButton)

    expect(emitted()).toHaveProperty('clear')
    expect(emitted()).toHaveProperty('update:modelValue')
  })

  it('supports range display and clears to tuple', async () => {
    const { container, emitted } = renderWithProps(TimePicker, {
      range: true,
      modelValue: ['14:30', '15:00']
    })

    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('14:30 - 15:00')

    const clearButton = container.querySelector(
      'button[aria-label="Clear time"]'
    ) as HTMLButtonElement
    await fireEvent.click(clearButton)

    expect(emitted()).toHaveProperty('update:modelValue')
  })

  it('renders seconds column and selects a second value', async () => {
    const { container, emitted } = renderWithProps(TimePicker, {
      showSeconds: true,
      modelValue: '10:15:20'
    })

    await fireEvent.click(container.querySelector('input') as HTMLInputElement)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeInTheDocument())
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    const secondButton = dialog.querySelector<HTMLButtonElement>(
      'button[data-tiger-timepicker-unit="second"][aria-label="5 seconds"]'
    )!

    await fireEvent.click(secondButton)
    const updates = emitted()['update:modelValue'] as Array<[string]>
    expect(updates.at(-1)?.[0]).toBe('10:15:05')
  })

  it('disables seconds outside minTime and maxTime', async () => {
    const { container } = renderWithProps(TimePicker, {
      showSeconds: true,
      modelValue: '10:15:20',
      minTime: '10:15:10',
      maxTime: '10:15:30'
    })

    await fireEvent.click(container.querySelector('input') as HTMLInputElement)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeInTheDocument())
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement

    expect(
      dialog.querySelector<HTMLButtonElement>(
        'button[data-tiger-timepicker-unit="second"][aria-label="5 seconds"]'
      )
    ).toBeDisabled()
    expect(
      dialog.querySelector<HTMLButtonElement>(
        'button[data-tiger-timepicker-unit="second"][aria-label="15 seconds"]'
      )
    ).not.toBeDisabled()
  })

  it('supports 12-hour period selection and Home/End keyboard movement', async () => {
    const { container, emitted } = renderWithProps(TimePicker, {
      format: '12',
      modelValue: '02:30'
    })

    await fireEvent.click(container.querySelector('input') as HTMLInputElement)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeInTheDocument())
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    const pmButton = dialog.querySelector<HTMLButtonElement>(
      'button[data-tiger-timepicker-unit="period"][aria-label="PM"]'
    )!

    pmButton.focus()
    await fireEvent.keyDown(dialog, { key: 'Home' })
    await fireEvent.keyDown(dialog, { key: 'End' })
    await fireEvent.keyDown(dialog, { key: 'Enter' })
    const updates = emitted()['update:modelValue'] as Array<[string]>
    expect(updates.at(-1)?.[0]).toBe('14:30')
  })

  it('keeps range values ordered when selecting start or end out of order', async () => {
    const { container, emitted } = renderWithProps(TimePicker, {
      range: true,
      modelValue: ['10:00', '11:00']
    })

    await fireEvent.click(container.querySelector('input') as HTMLInputElement)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeInTheDocument())
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement

    await fireEvent.click(dialog.querySelector<HTMLButtonElement>('button[aria-label="Start"]')!)
    await fireEvent.click(
      dialog.querySelector<HTMLButtonElement>(
        'button[data-tiger-timepicker-unit="hour"][aria-label="12 hours"]'
      )!
    )
    let updates = emitted()['update:modelValue'] as Array<[unknown]>
    expect(updates.at(-1)?.[0]).toEqual(['12:00', '12:00'])

    await fireEvent.click(dialog.querySelector<HTMLButtonElement>('button[aria-label="End"]')!)
    await fireEvent.click(
      dialog.querySelector<HTMLButtonElement>(
        'button[data-tiger-timepicker-unit="hour"][aria-label="9 hours"]'
      )!
    )
    updates = emitted()['update:modelValue'] as Array<[unknown]>
    expect(updates.at(-1)?.[0]).toEqual(['10:00', '10:00'])
  })

  it('does not open when disabled or readonly', async () => {
    const { container, rerender } = renderWithProps(TimePicker, { disabled: true })

    await fireEvent.click(container.querySelector('button[aria-label="Toggle time picker"]')!)
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()

    await rerender({ disabled: false, readonly: true })
    await fireEvent.click(container.querySelector('button[aria-label="Toggle time picker"]')!)
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('closes on outside click and supports Now/OK footer actions', async () => {
    const { container, emitted } = renderWithProps(TimePicker, { modelValue: null })

    await fireEvent.click(container.querySelector('input') as HTMLInputElement)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeInTheDocument())
    const nowButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Now'
    ) as HTMLButtonElement
    await fireEvent.click(nowButton)
    expect(emitted()).toHaveProperty('update:modelValue')

    const okButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'OK'
    ) as HTMLButtonElement
    await fireEvent.click(okButton)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument())

    await fireEvent.click(container.querySelector('input') as HTMLInputElement)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).toBeInTheDocument())
    await fireEvent.click(document.body)
    await waitFor(() => expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument())
  })

  it('passes native input attributes and custom class to the wrapper', () => {
    const { container } = renderWithProps(TimePicker, {
      id: 'meeting-time',
      name: 'meeting',
      required: true,
      class: 'custom-picker'
    })
    const input = container.querySelector('input') as HTMLInputElement

    expect(input).toHaveAttribute('id', 'meeting-time')
    expect(input).toHaveAttribute('name', 'meeting')
    expect(input).toBeRequired()
    expect(container.firstElementChild).toHaveClass('custom-picker')
  })

  it('passes accessibility checks', async () => {
    const { container } = renderWithProps(TimePicker, { modelValue: '14:30' })
    await expectNoA11yViolationsIsolated(container)
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(TimePicker)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
