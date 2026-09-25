/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { DatePicker } from '@expcat/tigercat-react/DatePicker'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils/react'

const june = new Date(2024, 5, 15)

describe('DatePicker', () => {
  it('renders a closed field with the locale placeholder', () => {
    const { container } = render(<DatePicker />)
    expect(container.querySelector('input')).toHaveAttribute('placeholder', 'Select date')
  })

  it('keeps an uncontrolled selection', async () => {
    const { container } = render(<DatePicker defaultValue={june} now={june} />)
    const toggle = screen.getByLabelText('Toggle calendar')
    await userEvent.click(toggle)
    fireEvent.click(document.querySelector('[data-date="2024-06-20"]') as HTMLElement)
    expect(container.querySelector('input')).toHaveValue('2024-06-20')
  })

  it('supports controlled open', async () => {
    function Harness() {
      const [open, setOpen] = useState(false)
      return <DatePicker value={june} now={june} open={open} onOpenChange={setOpen} />
    }
    render(<Harness />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Toggle calendar'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(document.querySelectorAll('[aria-label="Calendar"]')).toHaveLength(1)
  })

  it('commits a range in two clicks and waits for OK', async () => {
    const onChange = vi.fn()
    render(
      <DatePicker range defaultOpen now={june} defaultValue={[null, null]} onChange={onChange} />
    )
    fireEvent.click(document.querySelector('[data-date="2024-06-10"]') as HTMLElement)
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(document.querySelector('[data-date="2024-06-20"]') as HTMLElement)
    expect(onChange).toHaveBeenCalled()
    const range = onChange.mock.calls.at(-1)?.[0] as [Date, Date]
    expect(range[0].getDate()).toBe(10)
    expect(range[1].getDate()).toBe(20)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('parses typed input using the current format', async () => {
    const onChange = vi.fn()
    const { container } = render(<DatePicker format="dd/MM/yyyy" now={june} onChange={onChange} />)
    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.change(input, { target: { value: '15/01/2024' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalled()
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(15)
    expect(input).not.toHaveAttribute('readonly')
  })

  it('uses official locale objects for placeholder copy', () => {
    const { container, rerender } = render(
      <ConfigProvider locale={zhCN}>
        <DatePicker />
      </ConfigProvider>
    )
    expect(container.querySelector('input')).toHaveAttribute('placeholder', '请选择日期')
    rerender(
      <ConfigProvider locale={zhTW}>
        <DatePicker />
      </ConfigProvider>
    )
    expect(container.querySelector('input')).toHaveAttribute('placeholder', '請選擇日期')
  })

  it('does not treat opening the panel as a field blur', async () => {
    const validator = vi.fn(() => undefined)
    render(
      <Form>
        <FormItem name="when" label="When" rules={[{ validator }]}>
          <DatePicker now={june} />
        </FormItem>
      </Form>
    )
    await userEvent.click(screen.getByLabelText('Toggle calendar'))
    expect(validator).not.toHaveBeenCalled()
    fireEvent.click(document.querySelector('[data-date="2024-06-20"]') as HTMLElement)
    await waitFor(() => expect(validator).toHaveBeenCalled())
  })

  it('submits the Gregorian day, not the Buddhist display year', () => {
    const date = new Date(2024, 0, 5)
    const { container } = render(
      <DatePicker name="day" locale={{ locale: 'th-TH' }} value={date} />
    )
    expect(screen.getByRole('textbox')).toHaveValue('2567-01-05')
    expect(screen.getByRole('textbox')).not.toHaveAttribute('name')
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden).toHaveAttribute('name', 'day')
    expect(hidden).toHaveValue('2024-01-05')
    expect(container.querySelectorAll('[name="day"]')).toHaveLength(1)
  })

  it('keeps an empty named field in the form', () => {
    const { container } = render(<DatePicker name="day" />)
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden).toHaveValue('')
    expect(hidden).not.toBeDisabled()
  })

  it('does not commit a typed disabled day', () => {
    const onChange = vi.fn()
    render(
      <DatePicker
        onChange={onChange}
        disabledDate={(date) =>
          date.getFullYear() === 2024 && date.getMonth() === 0 && date.getDate() === 15
        }
      />
    )
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '2024-01-15' } })
    fireEvent.blur(input)
    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('2024-01-15')
    expect(screen.getByRole('status')).toHaveTextContent('That date is not available.')
  })

  it('swaps a typed range whose end is before the start', () => {
    const onChange = vi.fn()
    render(<DatePicker range onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '2024-01-10 - 2024-01-01' } })
    fireEvent.blur(input)
    const range = onChange.mock.calls[0]?.[0] as [Date, Date]
    expect(range[0]).toEqual(new Date(2024, 0, 1))
    expect(range[1]).toEqual(new Date(2024, 0, 10))
  })

  it('keeps an incomplete range open on OK', async () => {
    const onChange = vi.fn()
    render(<DatePicker range defaultOpen now={june} onChange={onChange} />)
    fireEvent.click(document.querySelector('[data-date="2024-06-10"]') as HTMLElement)
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox')).toHaveValue('2024-06-10 - ')
    expect(screen.getByRole('status')).toHaveTextContent('Choose an end date.')
  })

  it('does not emit when the clicked day is already selected', () => {
    const onChange = vi.fn()
    render(<DatePicker defaultOpen value={june} now={june} onChange={onChange} />)
    fireEvent.click(document.querySelector('[data-date="2024-06-15"]') as HTMLElement)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('exposes the dialog on the input and the calendar button', async () => {
    render(<DatePicker defaultOpen value={june} now={june} />)
    const input = screen.getByRole('textbox')
    const toggle = screen.getByLabelText('Toggle calendar')
    const dialog = screen.getByRole('dialog')
    expect(input).toHaveAttribute('aria-haspopup', 'dialog')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(input).toHaveAttribute('aria-controls', dialog.id)
    expect(toggle).toHaveAttribute('aria-controls', dialog.id)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('sets a single-day range when Today is clicked without an injected clock', () => {
    const onChange = vi.fn()
    render(<DatePicker range defaultOpen onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Today' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    const [start, end] = onChange.mock.calls[0][0] as [Date, Date]
    const today = new Date()
    expect(start.getFullYear()).toBe(today.getFullYear())
    expect(start.getMonth()).toBe(today.getMonth())
    expect(start.getDate()).toBe(today.getDate())
    expect(end.getMonth()).toBe(start.getMonth())
    expect(end.getDate()).toBe(start.getDate())
    const pad = (n: number) => String(n).padStart(2, '0')
    const iso = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
    expect(screen.getByRole('textbox')).toHaveValue(`${iso} - ${iso}`)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('opens a range month grid in a panel that fits the calendar card', async () => {
    render(<DatePicker range defaultOpen />)
    expect(await screen.findByRole('grid')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-date]').length).toBeGreaterThan(20)
    const panel = document.querySelector('[data-tiger="datepicker-panel"]') as HTMLElement
    expect(panel.className).toContain('w-fit')
    expect(panel.className).not.toContain('w-80')
  })

  it('has no axe violations when the dialog is open', async () => {
    const { container } = render(
      <DatePicker defaultOpen value={june} now={june} aria-label="Pick a day" />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
