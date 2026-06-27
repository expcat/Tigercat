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

  // --- Keyboard navigation (C16-2) ---
  describe('Keyboard navigation', () => {
    it('renders day cells as gridcell buttons with a single roving tab-stop', () => {
      renderWithProps(Calendar, { modelValue: testDate })
      const selected = screen.getByRole('gridcell', { name: '2024-06-15' })
      expect(selected.tagName).toBe('BUTTON')
      expect(selected).toHaveAttribute('tabindex', '0')
      expect(screen.getByRole('gridcell', { name: '2024-06-16' })).toHaveAttribute('tabindex', '-1')
    })

    it('moves focus with arrow keys', async () => {
      renderWithProps(Calendar, { modelValue: testDate })
      const start = screen.getByRole('gridcell', { name: '2024-06-15' })
      start.focus()
      await fireEvent.keyDown(start, { key: 'ArrowRight' })
      expect(screen.getByRole('gridcell', { name: '2024-06-16' })).toHaveFocus()
      await fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
      expect(screen.getByRole('gridcell', { name: '2024-06-23' })).toHaveFocus()
    })

    it('selects the focused day with Enter', async () => {
      const onChange = vi.fn()
      render(Calendar, { props: { modelValue: testDate, 'onUpdate:modelValue': onChange } })
      const cell = screen.getByRole('gridcell', { name: '2024-06-20' })
      cell.focus()
      await fireEvent.keyDown(cell, { key: 'Enter' })
      expect(onChange).toHaveBeenCalled()
      expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(20)
    })

    it('Home/End focus the first/last day of the month', async () => {
      renderWithProps(Calendar, { modelValue: testDate })
      const cell = screen.getByRole('gridcell', { name: '2024-06-15' })
      cell.focus()
      await fireEvent.keyDown(cell, { key: 'Home' })
      expect(screen.getByRole('gridcell', { name: '2024-06-01' })).toHaveFocus()
      await fireEvent.keyDown(document.activeElement!, { key: 'End' })
      expect(screen.getByRole('gridcell', { name: '2024-06-30' })).toHaveFocus()
    })

    it('arrows across the month boundary and navigates the view', async () => {
      renderWithProps(Calendar, { modelValue: new Date(2024, 5, 30) })
      const cell = screen.getByRole('gridcell', { name: '2024-06-30' })
      cell.focus()
      await fireEvent.keyDown(cell, { key: 'ArrowDown' })
      expect(screen.getByText('July 2024')).toBeInTheDocument()
      expect(screen.getByRole('gridcell', { name: '2024-07-07' })).toHaveFocus()
    })

    it('year mode: months are keyboard-navigable gridcell buttons', async () => {
      const onPanelChange = vi.fn()
      render(Calendar, {
        props: { mode: 'year', modelValue: testDate, 'onPanel-change': onPanelChange }
      })
      const jun = screen.getByRole('gridcell', { name: 'Jun' })
      expect(jun).toHaveAttribute('tabindex', '0')
      jun.focus()
      await fireEvent.keyDown(jun, { key: 'ArrowRight' })
      expect(screen.getByRole('gridcell', { name: 'Jul' })).toHaveFocus()
      await fireEvent.keyDown(document.activeElement!, { key: 'Enter' })
      expect(onPanelChange).toHaveBeenCalled()
    })
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
