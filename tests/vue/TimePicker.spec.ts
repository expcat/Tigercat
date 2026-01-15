/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { TimePicker } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

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

  it('passes accessibility checks', async () => {
    const { container } = renderWithProps(TimePicker, { modelValue: '14:30' })
    await expectNoA11yViolations(container)
  })
})
