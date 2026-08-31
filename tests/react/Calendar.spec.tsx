/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, render, screen, fireEvent } from '@testing-library/react'
import React, { useState } from 'react'
import { Calendar } from '@expcat/tigercat-react/Calendar'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { arSA } from '@expcat/tigercat-core/locales/ar-SA'
import { expectNoA11yViolations } from '../utils/react'

const testDate = new Date(2024, 5, 15)
const now = new Date(2024, 5, 15)

function dayButton(iso: string): HTMLElement {
  const el = document.querySelector(`[data-date="${iso}"]`)
  if (!el) throw new Error(`missing ${iso}`)
  return el as HTMLElement
}

describe('Calendar', () => {
  it('renders the month title and weekday headers', () => {
    render(<Calendar value={testDate} now={now} />)
    expect(screen.getByText('June 2024')).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByRole('grid')).toHaveAttribute('aria-labelledby')
  })

  it('keeps an uncontrolled selection after click', () => {
    render(<Calendar defaultValue={testDate} now={now} />)
    fireEvent.click(dayButton('2024-06-20'))
    expect(dayButton('2024-06-20')).toHaveAttribute('aria-selected', 'true')
  })

  it('follows a controlled value into another month', () => {
    const { rerender } = render(<Calendar value={testDate} now={now} />)
    expect(screen.getByText('June 2024')).toBeInTheDocument()
    rerender(<Calendar value={new Date(2024, 7, 20)} now={now} />)
    expect(screen.getByText('August 2024')).toBeInTheDocument()
    expect(dayButton('2024-08-20')).toHaveAttribute('aria-selected', 'true')
  })

  it('does not reset the panel when the same day is passed as a new Date', () => {
    const { rerender } = render(<Calendar value={testDate} now={now} />)
    fireEvent.click(screen.getByLabelText('Next month'))
    expect(screen.getByText('July 2024')).toBeInTheDocument()
    rerender(<Calendar value={new Date(2024, 5, 15)} now={now} />)
    expect(screen.getByText('July 2024')).toBeInTheDocument()
  })

  it('navigates months and wraps the year', () => {
    render(<Calendar value={new Date(2024, 11, 1)} now={now} />)
    fireEvent.click(screen.getByLabelText('Next month'))
    expect(screen.getByText('January 2025')).toBeInTheDocument()
  })

  it('emits onChange for an enabled day and ignores a disabled day', () => {
    const onChange = vi.fn()
    render(
      <Calendar
        value={testDate}
        now={now}
        disabledDate={(date) => date.getDate() === 20}
        onChange={onChange}
      />
    )
    fireEvent.click(dayButton('2024-06-20'))
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(dayButton('2024-06-21'))
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(21)
  })

  it('clicks a padding day and jumps to that month', () => {
    const onChange = vi.fn()
    render(<Calendar value={testDate} now={now} onChange={onChange} />)
    fireEvent.click(dayButton('2024-07-01'))
    expect(screen.getByText('July 2024')).toBeInTheDocument()
    expect((onChange.mock.calls[0][0] as Date).getMonth()).toBe(6)
  })

  it('year view click selects the 1st and switches to month mode when mode is uncontrolled', () => {
    const onChange = vi.fn()
    const onPanelChange = vi.fn()
    render(
      <Calendar
        defaultValue={testDate}
        now={now}
        onChange={onChange}
        onPanelChange={onPanelChange}
      />
    )
    fireEvent.click(screen.getByText('June 2024'))
    expect(screen.getByText('2024')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('gridcell', { name: 'Mar' }))
    expect(onChange).toHaveBeenCalled()
    expect((onChange.mock.calls[0][0] as Date).getMonth()).toBe(2)
    expect(onPanelChange).toHaveBeenCalledWith(expect.any(Date), 'month')
    expect(screen.getByText('March 2024')).toBeInTheDocument()
  })

  it('controlled year mode does not lie about the drawn panel', () => {
    const onPanelChange = vi.fn()
    render(<Calendar mode="year" value={testDate} now={now} onPanelChange={onPanelChange} />)
    fireEvent.click(screen.getByRole('gridcell', { name: 'Mar' }))
    expect(onPanelChange).toHaveBeenCalledWith(expect.any(Date), 'month')
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByRole('gridcell', { name: 'Mar' })).toBeInTheDocument()
  })

  it('moves focus with arrows and skips disabled days', () => {
    render(
      <Calendar
        value={new Date(2024, 5, 14)}
        now={now}
        disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      />
    )
    const start = dayButton('2024-06-14')
    act(() => start.focus())
    fireEvent.keyDown(start, { key: 'ArrowRight' })
    expect(dayButton('2024-06-17')).toHaveFocus()
  })

  it('flips inline arrows in RTL', () => {
    render(
      <ConfigProvider locale={arSA}>
        <Calendar value={testDate} now={now} />
      </ConfigProvider>
    )
    const start = dayButton('2024-06-15')
    act(() => start.focus())
    fireEvent.keyDown(start, { key: 'ArrowRight' })
    expect(dayButton('2024-06-14')).toHaveFocus()
  })

  it('uses official locale objects for navigation copy and week start', () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <Calendar value={testDate} now={now} />
      </ConfigProvider>
    )
    expect(screen.getByLabelText('下个月')).toBeInTheDocument()
    expect(screen.getByText('周一')).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={zhTW}>
        <Calendar value={testDate} now={now} />
      </ConfigProvider>
    )
    expect(screen.getByLabelText('下個月')).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={jaJP}>
        <Calendar value={testDate} now={now} />
      </ConfigProvider>
    )
    expect(screen.getByLabelText('翌月')).toBeInTheDocument()
  })

  it('forwards ref and aria-label to the root', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<Calendar ref={ref} value={testDate} now={now} aria-label="Team calendar" />)
    expect(ref.current).toHaveAttribute('aria-label', 'Team calendar')
    expect(ref.current).toHaveAttribute('data-tiger', 'calendar')
  })

  it('has no axe violations for month and year views with disabled dates', async () => {
    const { container, rerender } = render(
      <Calendar
        value={testDate}
        now={now}
        disabledDate={(date) => date.getDay() === 0}
        aria-label="June calendar"
      />
    )
    await expectNoA11yViolations(container)
    rerender(
      <Calendar
        mode="year"
        value={testDate}
        now={now}
        disabledDate={(date) => date.getMonth() === 2}
        aria-label="2024 calendar"
      />
    )
    await expectNoA11yViolations(container)
  })
})

describe('Calendar controlled follow', () => {
  it('lets a parent move the value to another month', () => {
    function Harness() {
      const [date, setDate] = useState(testDate)
      return (
        <div>
          <button type="button" onClick={() => setDate(new Date(2024, 7, 20))}>
            Jump
          </button>
          <Calendar value={date} now={now} onChange={setDate} />
        </div>
      )
    }
    render(<Harness />)
    fireEvent.click(screen.getByText('Jump'))
    expect(screen.getByText('August 2024')).toBeInTheDocument()
  })
})
