/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useState } from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { TimePicker } from '@expcat/tigercat-react/TimePicker'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils/react'

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

async function openPicker() {
  await userEvent.click(screen.getByLabelText('Toggle time picker'))
  return screen.findByRole('dialog')
}

describe('TimePicker', () => {
  beforeEach(() => {
    mockLayout(true)
  })

  it('renders a closed field with the locale placeholder', () => {
    render(<TimePicker />)
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Select time')
  })

  it('uses official locale objects for placeholder copy', () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <TimePicker />
      </ConfigProvider>
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', '请选择时间')
    rerender(
      <ConfigProvider locale={zhTW}>
        <TimePicker />
      </ConfigProvider>
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', '請選擇時間')
  })

  it('keeps an uncontrolled selection until OK', async () => {
    render(<TimePicker defaultValue="10:00" />)
    await openPicker()
    fireEvent.click(document.querySelector('[aria-label="11 Hour"]') as HTMLElement)
    expect(screen.getByRole('textbox')).toHaveValue('11:00')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('11:00')
  })

  it('does not emit onChange until OK', async () => {
    const onChange = vi.fn()
    render(<TimePicker onChange={onChange} />)
    await openPicker()
    fireEvent.click(document.querySelector('[aria-label="09 Hour"]') as HTMLElement)
    expect(onChange).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(onChange).toHaveBeenCalledWith('09:00')
  })

  it('can pick 09:30 from an empty value when minTime is 09:30', async () => {
    const onChange = vi.fn()
    render(<TimePicker minTime="09:30" onChange={onChange} />)
    await openPicker()
    fireEvent.click(document.querySelector('[aria-label="09 Hour"]') as HTMLElement)
    fireEvent.click(document.querySelector('[aria-label="30 Min"]') as HTMLElement)
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(onChange).toHaveBeenCalledWith('09:30')
  })

  it('supports controlled open', async () => {
    function Harness() {
      const [open, setOpen] = useState(false)
      return <TimePicker value="14:30" open={open} onOpenChange={setOpen} />
    }
    render(<Harness />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await openPicker()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-tiger="timepicker-panel"]')).toHaveLength(1)
  })

  it('commits a range on OK and keeps incomplete ranges off Form', async () => {
    const onChange = vi.fn()
    render(<TimePicker range defaultOpen defaultValue={null} onChange={onChange} />)
    fireEvent.click(document.querySelector('[aria-label="10 Hour"]') as HTMLElement)
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('tab', { name: 'End' }))
    fireEvent.click(document.querySelector('[aria-label="11 Hour"]') as HTMLElement)
    expect(onChange).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(onChange).toHaveBeenCalledWith(['10:00', '11:00'])
  })

  it('clamps an out-of-order range end to start', async () => {
    const onChange = vi.fn()
    render(<TimePicker range defaultOpen defaultValue={['12:00', '12:00']} onChange={onChange} />)
    await userEvent.click(screen.getByRole('tab', { name: 'End' }))
    fireEvent.click(document.querySelector('[aria-label="09 Hour"]') as HTMLElement)
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(onChange).toHaveBeenCalledWith(['12:00', '12:00'])
  })

  it('parses typed 12-hour input', async () => {
    const onChange = vi.fn()
    render(<TimePicker format="12" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '02:30 PM' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith('14:30')
  })

  it('does not treat opening the panel as a field blur', async () => {
    const validator = vi.fn(() => undefined)
    render(
      <Form>
        <FormItem name="when" label="When" rules={[{ validator }]}>
          <TimePicker />
        </FormItem>
      </Form>
    )
    await openPicker()
    expect(validator).not.toHaveBeenCalled()
    fireEvent.click(document.querySelector('[aria-label="11 Hour"]') as HTMLElement)
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(validator).toHaveBeenCalled())
  })

  it('mounts only the desktop column tree in the a11y tree', async () => {
    render(<TimePicker defaultOpen />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.querySelectorAll('[data-tiger-timepicker-unit="hour"]').length).toBeGreaterThan(0)
    expect(dialog.querySelectorAll('select')).toHaveLength(0)
  })

  it('mounts native selects on small screens instead of columns', async () => {
    mockLayout(false)
    render(<TimePicker defaultOpen />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.querySelectorAll('select')).toHaveLength(2)
    expect(dialog.querySelectorAll('[role="listbox"]')).toHaveLength(0)
  })

  it('does not change the time when ArrowDown is pressed on OK', async () => {
    const onChange = vi.fn()
    render(<TimePicker defaultOpen defaultValue="10:00" onChange={onChange} />)
    const ok = screen.getByRole('button', { name: 'OK' })
    ok.focus()
    fireEvent.keyDown(ok, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(ok)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('has no axe violations when the dialog is open', async () => {
    const { container } = render(<TimePicker defaultOpen value="14:30" aria-label="Meeting time" />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })

  it('has no axe violations for range and 12-hour open states', async () => {
    const { container, rerender } = render(
      <TimePicker range defaultOpen defaultValue={['09:00', '18:00']} aria-label="Shift" />
    )
    await expectNoA11yViolations(container)
    rerender(<TimePicker format="12" defaultOpen value="14:30" aria-label="Afternoon" />)
    await expectNoA11yViolations(container)
  })
})
