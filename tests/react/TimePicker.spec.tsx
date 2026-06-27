/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { TimePicker, ConfigProvider } from '@expcat/tigercat-react'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('TimePicker', () => {
  it('renders default placeholder', () => {
    render(<TimePicker />)
    expect(screen.getByPlaceholderText('Select time')).toBeInTheDocument()
  })

  it('uses locale-based default placeholder', () => {
    render(<TimePicker locale="zh-CN" />)
    expect(screen.getByPlaceholderText('请选择时间')).toBeInTheDocument()
  })

  it('uses ConfigProvider locale labels', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <TimePicker />
      </ConfigProvider>
    )

    expect(screen.getByPlaceholderText('请选择时间')).toBeInTheDocument()
  })

  it('allows overriding labels for placeholder', () => {
    render(<TimePicker labels={{ selectTime: 'Pick a time' }} />)
    expect(screen.getByPlaceholderText('Pick a time')).toBeInTheDocument()
  })

  it('uses range placeholder by default in range mode', () => {
    render(<TimePicker range />)
    expect(screen.getByPlaceholderText('Select time range')).toBeInTheDocument()
  })

  it('renders controlled display value', () => {
    render(<TimePicker value="14:30" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('14:30')
  })

  it('supports 12-hour display', () => {
    render(<TimePicker value="14:30" format="12" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('02:30 PM')
  })

  it('supports uncontrolled defaultValue', () => {
    render(<TimePicker defaultValue="10:00" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('10:00')
  })

  it('opens panel when input clicked', async () => {
    const user = userEvent.setup()
    render(<TimePicker />)

    await user.click(screen.getByRole('textbox'))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
  })

  it('renders mobile wheel selects and changes time from them', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker defaultValue="10:15" onChange={onChange} />)

    await user.click(screen.getByRole('textbox'))
    const dialog = await screen.findByRole('dialog')
    const hourSelect = dialog.querySelector('select[aria-label="Hour"]') as HTMLSelectElement

    expect(hourSelect).toBeInTheDocument()
    fireEvent.change(hourSelect, { target: { value: '11' } })
    expect(onChange).toHaveBeenCalledWith('11:15')
  })

  it('closes on Escape and restores focus to input', async () => {
    const user = userEvent.setup()
    render(<TimePicker />)

    const input = screen.getByRole('textbox')
    await user.click(input)
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(document.activeElement).toBe(input)
  })

  it('supports keyboard navigation to change hour', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker onChange={onChange} />)

    await user.click(screen.getByRole('textbox'))
    await screen.findByRole('dialog')

    await user.keyboard('{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalled()
  })

  it('focuses first enabled hour and skips disabled options with keyboard', async () => {
    const user = userEvent.setup()
    render(<TimePicker minTime="10:00" maxTime="11:00" />)

    await user.click(screen.getByRole('textbox'))
    const dialog = await screen.findByRole('dialog')

    const hourButtons = Array.from(
      dialog.querySelectorAll<HTMLButtonElement>(
        'button[data-tiger-timepicker-unit="hour"]:not([disabled])'
      )
    )

    expect(hourButtons.length).toBeGreaterThanOrEqual(1)
    expect(document.activeElement).toBe(hourButtons[0])

    await user.keyboard('{ArrowDown}')
    if (hourButtons.length >= 2) {
      expect(document.activeElement).toBe(hourButtons[1])
    }

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(hourButtons[hourButtons.length - 1])
  })

  it('calls onChange when selecting an hour (single)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker onChange={onChange} />)

    await user.click(screen.getByRole('textbox'))
    const dialog = await screen.findByRole('dialog')
    const hourButton = dialog.querySelector<HTMLButtonElement>(
      'button[data-tiger-timepicker-unit="hour"]:not([disabled])'
    )!

    await user.click(hourButton)
    expect(onChange).toHaveBeenCalled()
  })

  it('clears single value and calls onClear', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onClear = vi.fn()
    render(<TimePicker value="14:30" onChange={onChange} onClear={onClear} />)

    await user.click(screen.getByRole('button', { name: 'Clear time' }))
    expect(onChange).toHaveBeenCalledWith(null)
    expect(onClear).toHaveBeenCalled()
  })

  it('supports range display and clears to tuple', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker range value={['14:30', '15:00']} onChange={onChange} />)

    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('14:30 - 15:00')

    await user.click(screen.getByRole('button', { name: 'Clear time' }))
    expect(onChange).toHaveBeenCalledWith([null, null])
  })

  it('renders seconds column and selects a second value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker showSeconds defaultValue="10:15:20" onChange={onChange} />)

    await user.click(screen.getByRole('textbox'))
    const dialog = await screen.findByRole('dialog')
    const secondButton = dialog.querySelector<HTMLButtonElement>(
      'button[data-tiger-timepicker-unit="second"][aria-label="5 seconds"]'
    )!

    await user.click(secondButton)
    expect(onChange).toHaveBeenLastCalledWith('10:15:05')
  })

  it('disables seconds outside minTime and maxTime', async () => {
    const user = userEvent.setup()
    render(<TimePicker showSeconds defaultValue="10:15:20" minTime="10:15:10" maxTime="10:15:30" />)

    await user.click(screen.getByRole('textbox'))
    const dialog = await screen.findByRole('dialog')

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
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker format="12" defaultValue="02:30" onChange={onChange} />)

    await user.click(screen.getByRole('textbox'))
    const dialog = await screen.findByRole('dialog')
    const pmButton = dialog.querySelector<HTMLButtonElement>(
      'button[data-tiger-timepicker-unit="period"][aria-label="PM"]'
    )!

    pmButton.focus()
    await user.keyboard('{Home}{End}{Enter}')
    expect(onChange).toHaveBeenLastCalledWith('14:30')
  })

  it('keeps range values ordered when selecting start or end out of order', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker range defaultValue={['10:00', '11:00']} onChange={onChange} />)

    await user.click(screen.getByRole('textbox'))
    const dialog = await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await user.click(
      dialog.querySelector<HTMLButtonElement>(
        'button[data-tiger-timepicker-unit="hour"][aria-label="12 hours"]'
      )!
    )
    expect(onChange).toHaveBeenLastCalledWith(['12:00', '12:00'])

    await user.click(screen.getByRole('button', { name: 'End' }))
    await user.click(
      dialog.querySelector<HTMLButtonElement>(
        'button[data-tiger-timepicker-unit="hour"][aria-label="9 hours"]'
      )!
    )
    expect(onChange).toHaveBeenLastCalledWith(['12:00', '12:00'])
  })

  it('does not open when disabled or readonly', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<TimePicker disabled />)

    await user.click(screen.getByRole('button', { name: 'Toggle time picker' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(<TimePicker readonly />)
    await user.click(screen.getByRole('button', { name: 'Toggle time picker' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on outside click and supports Now/OK footer actions', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <div>
        <button type="button">Outside</button>
        <TimePicker onChange={onChange} />
      </div>
    )

    await user.click(screen.getByRole('textbox'))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Now' }))
    expect(onChange).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('textbox'))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Outside' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('passes native input attributes and custom className to the wrapper', () => {
    const { container } = render(
      <TimePicker id="meeting-time" name="meeting" required className="custom-picker" />
    )
    const input = screen.getByRole('textbox')

    expect(input).toHaveAttribute('id', 'meeting-time')
    expect(input).toHaveAttribute('name', 'meeting')
    expect(input).toBeRequired()
    expect(container.firstElementChild).toHaveClass('custom-picker')
  })

  it('passes accessibility checks', async () => {
    const { container } = render(<TimePicker value="14:30" />)
    await expectNoA11yViolationsIsolated(container)
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<TimePicker />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
