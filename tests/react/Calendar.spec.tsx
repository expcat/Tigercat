/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Calendar } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Calendar', () => {
  const testDate = new Date(2024, 5, 15) // June 15, 2024

  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = render(<Calendar />)
    expect(container.querySelector('[role="group"]')).toBeInTheDocument()
  })

  it('renders weekday headers in month mode', () => {
    render(<Calendar mode="month" />)
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('displays current month and year', () => {
    render(<Calendar value={testDate} />)
    expect(screen.getByText('June 2024')).toBeInTheDocument()
  })

  it('uses component locale for calendar labels and date text', () => {
    render(<Calendar value={testDate} locale={{ locale: 'zh-CN' }} />)
    expect(screen.getByText('2024年6月')).toBeInTheDocument()
    expect(screen.getByText('周日')).toBeInTheDocument()
    expect(screen.getByLabelText('下个月')).toBeInTheDocument()
  })

  it('renders day numbers', () => {
    render(<Calendar value={testDate} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<Calendar className="my-cal" />)
    expect(container.querySelector('.my-cal')).toBeInTheDocument()
  })

  // --- Navigation ---
  it('navigates to previous month', () => {
    render(<Calendar value={testDate} />)
    fireEvent.click(screen.getByLabelText('Previous month'))
    expect(screen.getByText('May 2024')).toBeInTheDocument()
  })

  it('navigates to next month', () => {
    render(<Calendar value={testDate} />)
    fireEvent.click(screen.getByLabelText('Next month'))
    expect(screen.getByText('July 2024')).toBeInTheDocument()
  })

  it('wraps year on December→January', () => {
    render(<Calendar value={new Date(2024, 11, 1)} />)
    expect(screen.getByText('December 2024')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Next month'))
    expect(screen.getByText('January 2025')).toBeInTheDocument()
  })

  // --- Selection ---
  it('calls onChange on day click', () => {
    const onChange = vi.fn()
    render(<Calendar value={testDate} onChange={onChange} />)
    fireEvent.click(screen.getByText('20'))
    expect(onChange).toHaveBeenCalled()
    const picked = onChange.mock.calls[0][0] as Date
    expect(picked.getDate()).toBe(20)
  })

  // --- Disabled dates ---
  it('does not call onChange on disabled date', () => {
    const onChange = vi.fn()
    render(
      <Calendar value={testDate} disabledDate={(d) => d.getDate() === 20} onChange={onChange} />
    )
    fireEvent.click(screen.getByText('20'))
    expect(onChange).not.toHaveBeenCalled()
  })

  // --- Fullscreen ---
  it('applies fullscreen styles', () => {
    const { container } = render(<Calendar fullscreen />)
    const el = container.querySelector('[role="group"]')
    expect(el?.className).toContain('w-full')
  })

  // --- Year mode ---
  it('renders month names in year mode', () => {
    render(<Calendar mode="year" value={testDate} />)
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Dec')).toBeInTheDocument()
  })

  it('navigates years in year mode', () => {
    render(<Calendar mode="year" value={testDate} />)
    expect(screen.getByText('2024')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Next year'))
    expect(screen.getByText('2025')).toBeInTheDocument()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Calendar />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<Calendar />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
