/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CronEditor } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('CronEditor', () => {
  it('renders the default expression and field editors', () => {
    render(<CronEditor />)

    expect(screen.getByRole('group', { name: 'Cron editor' })).toBeInTheDocument()
    expect(screen.getByLabelText('Cron expression')).toHaveValue('* * * * *')
    expect(screen.getByLabelText('Minute mode')).toHaveValue('any')
  })

  it('uses controlled value', () => {
    render(<CronEditor value="0 12 * * 1" />)

    expect(screen.getByLabelText('Cron expression')).toHaveValue('0 12 * * 1')
    expect(screen.getByLabelText('Hour mode')).toHaveValue('specific')
  })

  it('calls onChange when raw expression changes', () => {
    const onChange = vi.fn()
    render(<CronEditor onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Cron expression'), { target: { value: '0 8 * * 1' } })

    expect(onChange).toHaveBeenCalledWith('0 8 * * 1', expect.objectContaining({ valid: true }))
  })

  it('shows validation errors for invalid expression', () => {
    render(<CronEditor value="60 * * * *" />)

    expect(screen.getByText('Minute must be between 0 and 59')).toBeInTheDocument()
  })

  it('applies presets', () => {
    const onChange = vi.fn()
    render(<CronEditor onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Cron preset'), { target: { value: '0 0 * * *' } })

    expect(onChange).toHaveBeenCalledWith('0 0 * * *', expect.objectContaining({ valid: true }))
  })

  it('updates field mode and step', () => {
    const onChange = vi.fn()
    render(<CronEditor onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Minute mode'), { target: { value: 'every' } })
    expect(onChange).toHaveBeenLastCalledWith(
      '*/1 * * * *',
      expect.objectContaining({ valid: true })
    )
    fireEvent.change(screen.getByLabelText('Minute step'), { target: { value: '15' } })
    expect(onChange).toHaveBeenLastCalledWith(
      '*/15 * * * *',
      expect.objectContaining({ valid: true })
    )
  })

  it('supports range editing', () => {
    const onChange = vi.fn()
    render(<CronEditor onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Hour mode'), { target: { value: 'range' } })
    fireEvent.change(screen.getByLabelText('Hour range start'), { target: { value: '9' } })
    fireEvent.change(screen.getByLabelText('Hour range end'), { target: { value: '18' } })

    expect(onChange).toHaveBeenLastCalledWith(
      '* 9-18 * * *',
      expect.objectContaining({ valid: true })
    )
  })

  it('disables controls when disabled', () => {
    render(<CronEditor disabled />)

    expect(screen.getByLabelText('Cron expression')).toBeDisabled()
    expect(screen.getByLabelText('Cron preset')).toBeDisabled()
  })

  it('applies size and className', () => {
    const { container } = render(<CronEditor className="job-schedule" size="lg" />)

    expect(container.querySelector('.job-schedule')).toBeInTheDocument()
    expect(screen.getByLabelText('Cron expression').className).toContain('h-10')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<CronEditor />)

    await expectNoA11yViolationsIsolated(container)
  })
})
