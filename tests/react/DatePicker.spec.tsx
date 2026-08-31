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

  it('has no axe violations when the dialog is open', async () => {
    const { container } = render(
      <DatePicker defaultOpen value={june} now={june} aria-label="Pick a day" />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
