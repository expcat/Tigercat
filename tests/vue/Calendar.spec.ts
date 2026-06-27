/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Calendar } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('Calendar', () => {
  const testDate = new Date(2024, 5, 15) // June 15, 2024

  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = renderWithProps(Calendar, {})
    expect(container.querySelector('[role="group"]')).toBeInTheDocument()
  })

  it('renders weekday headers in month mode', () => {
    renderWithProps(Calendar, { mode: 'month' })
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('displays current month and year', () => {
    renderWithProps(Calendar, { modelValue: testDate })
    expect(screen.getByText('June 2024')).toBeInTheDocument()
  })

  it('uses component locale for calendar labels and date text', () => {
    renderWithProps(Calendar, { modelValue: testDate, locale: { locale: 'zh-CN' } })
    expect(screen.getByText('2024年6月')).toBeInTheDocument()
    expect(screen.getByText('周日')).toBeInTheDocument()
    expect(screen.getByLabelText('下个月')).toBeInTheDocument()
  })

  it('renders day numbers', () => {
    renderWithProps(Calendar, { modelValue: testDate })
    expect(screen.getByText('15')).toBeInTheDocument()
    const ones = screen.getAllByText('1')
    expect(ones.length).toBeGreaterThanOrEqual(1)
  })

  it('applies className prop', () => {
    const { container } = renderWithProps(Calendar, { className: 'my-cal' })
    expect(container.querySelector('.my-cal')).toBeInTheDocument()
  })

  // --- Navigation ---
  it('navigates to previous month', async () => {
    renderWithProps(Calendar, { modelValue: testDate })
    const prevBtn = screen.getByLabelText('Previous month')
    await fireEvent.click(prevBtn)
    expect(screen.getByText('May 2024')).toBeInTheDocument()
  })

  it('navigates to next month', async () => {
    renderWithProps(Calendar, { modelValue: testDate })
    const nextBtn = screen.getByLabelText('Next month')
    await fireEvent.click(nextBtn)
    expect(screen.getByText('July 2024')).toBeInTheDocument()
  })

  it('wraps year on December→January', async () => {
    renderWithProps(Calendar, { modelValue: new Date(2024, 11, 1) })
    expect(screen.getByText('December 2024')).toBeInTheDocument()
    const nextBtn = screen.getByLabelText('Next month')
    await fireEvent.click(nextBtn)
    expect(screen.getByText('January 2025')).toBeInTheDocument()
  })

  // --- Selection ---
  it('selects a day on click', async () => {
    const onChange = vi.fn()
    render(Calendar, {
      props: { modelValue: testDate, 'onUpdate:modelValue': onChange }
    })
    const day20 = screen.getByText('20')
    await fireEvent.click(day20)
    expect(onChange).toHaveBeenCalled()
    const picked = onChange.mock.calls[0][0] as Date
    expect(picked.getDate()).toBe(20)
  })

  // --- Disabled dates ---
  it('does not select disabled dates', async () => {
    const onChange = vi.fn()
    render(Calendar, {
      props: {
        modelValue: testDate,
        disabledDate: (d: Date) => d.getDate() === 20,
        'onUpdate:modelValue': onChange
      }
    })
    const day20 = screen.getByText('20')
    await fireEvent.click(day20)
    expect(onChange).not.toHaveBeenCalled()
  })

  // --- Fullscreen ---
  it('applies fullscreen styles', () => {
    const { container } = renderWithProps(Calendar, { fullscreen: true })
    const el = container.querySelector('[role="group"]')
    expect(el?.className).toContain('w-full')
  })

  // --- Year mode ---
  it('renders month names in year mode', () => {
    renderWithProps(Calendar, { mode: 'year', modelValue: testDate })
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Dec')).toBeInTheDocument()
  })

  it('navigates years in year mode', async () => {
    renderWithProps(Calendar, { mode: 'year', modelValue: testDate })
    expect(screen.getByText('2024')).toBeInTheDocument()
    const nextBtn = screen.getByLabelText('Next year')
    await fireEvent.click(nextBtn)
    expect(screen.getByText('2025')).toBeInTheDocument()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Calendar)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(Calendar)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
