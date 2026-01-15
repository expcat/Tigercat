/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { TimePicker } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('TimePicker', () => {
  it('renders default placeholder', () => {
    render(<TimePicker />)
    expect(screen.getByPlaceholderText('Select time')).toBeInTheDocument()
  })

  it('uses locale-based default placeholder', () => {
    render(<TimePicker locale="zh-CN" />)
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

    const hourButtons = within(dialog)
      .getAllByRole('button', { name: /hours/i })
      .filter((el) => !(el as HTMLButtonElement).disabled) as HTMLButtonElement[]

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
    const hourButton = within(dialog).getAllByRole('button', {
      name: /hours/i
    })[0]

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

  it('passes accessibility checks', async () => {
    const { container } = render(<TimePicker value="14:30" />)
    await expectNoA11yViolations(container)
  })
})
