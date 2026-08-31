/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { CronEditor } from '@expcat/tigercat-react/CronEditor'
import { zhCN } from '../../packages/core/src/utils/i18n/locales/zh-CN'
import { expectNoA11yViolations } from '../utils/react'

describe('CronEditor', () => {
  it('renders an empty unselected editor, not every-minute', () => {
    render(<CronEditor />)

    expect(screen.getByRole('group', { name: 'Cron editor' })).toBeInTheDocument()
    expect(screen.getByLabelText('Cron expression')).toHaveValue('')
    expect(screen.getByLabelText('Minute mode')).toBeDisabled()
  })

  it('uses controlled value', () => {
    render(<CronEditor value="0 12 * * 1" />)

    expect(screen.getByLabelText('Cron expression')).toHaveValue('0 12 * * 1')
    expect(screen.getByLabelText('Hour mode')).toHaveValue('specific')
  })

  it('calls onChange when raw expression changes', () => {
    const onChange = vi.fn()
    render(<CronEditor defaultValue="" onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Cron expression'), { target: { value: '0 8 * * 1' } })

    expect(onChange).toHaveBeenCalledWith('0 8 * * 1', expect.objectContaining({ valid: true }))
  })

  it('shows validation errors for invalid expression', () => {
    render(<CronEditor value="60 * * * *" />)

    expect(screen.getByText('Minute must be between 0 and 59')).toBeInTheDocument()
  })

  it('applies presets', () => {
    const onChange = vi.fn()
    render(<CronEditor defaultValue="" onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Cron preset'), { target: { value: '0 0 * * *' } })

    expect(onChange).toHaveBeenCalledWith('0 0 * * *', expect.objectContaining({ valid: true }))
  })

  it('uses ConfigProvider locale for fields, presets, aria, and validation', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <CronEditor value="60 * * * *" />
      </ConfigProvider>
    )

    expect(screen.getByRole('group', { name: 'Cron 表达式编辑器' })).toBeInTheDocument()
    expect(screen.getByLabelText('Cron 表达式')).toHaveValue('60 * * * *')
    expect(screen.getByLabelText('分钟模式')).toHaveValue('specific')
    expect(screen.getByLabelText('分钟值')).toHaveValue('60')
    expect(screen.getByLabelText('Cron 预设')).toHaveTextContent('选择预设')
    expect(screen.getByLabelText('Cron 预设')).toHaveTextContent('每天')
    expect(screen.getByText('分钟必须在 0 到 59 之间')).toBeInTheDocument()
  })

  it('updates field mode and step', () => {
    const onChange = vi.fn()
    render(<CronEditor defaultValue="* * * * *" onChange={onChange} />)

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
    render(<CronEditor defaultValue="* * * * *" onChange={onChange} />)

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

  it('has no accessibility violations for an invalid expression', async () => {
    const { container } = render(<CronEditor value="60 * * * *" />)

    await expectNoA11yViolations(container)
  })

  describe('Edge Cases and Boundary', () => {
    it('hides preset select when presets are empty', () => {
      render(<CronEditor presets={[]} />)

      expect(screen.queryByLabelText('Cron preset')).not.toBeInTheDocument()
    })

    it('makes controls inactive when readonly', () => {
      render(<CronEditor readonly />)

      expect(screen.getByLabelText('Cron expression')).toHaveAttribute('readonly')
      expect(screen.getByLabelText('Cron preset')).toBeDisabled()
      expect(screen.getByLabelText('Minute mode')).toBeDisabled()
    })

    it('keeps custom mode when switching from any', () => {
      render(<CronEditor defaultValue="* * * * *" />)

      fireEvent.change(screen.getByLabelText('Minute mode'), { target: { value: 'custom' } })
      expect(screen.getByLabelText('Minute mode')).toHaveValue('custom')
      const custom = screen.getByLabelText('Minute custom value')
      fireEvent.change(custom, { target: { value: '1,15,30' } })
      expect(screen.getByLabelText('Cron expression')).toHaveValue('1,15,30 * * * *')
    })

    it('does not rewrite a 6-field expression when a column changes', () => {
      const onChange = vi.fn()
      render(<CronEditor value="0 0 0 * * *" onChange={onChange} />)

      expect(screen.getByLabelText('Minute mode')).toBeDisabled()
      fireEvent.change(screen.getByLabelText('Minute mode'), { target: { value: 'specific' } })
      expect(onChange).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Cron expression')).toHaveValue('0 0 0 * * *')
    })

    it('reports invalid custom field values', () => {
      render(<CronEditor value="* * * * MON" />)

      expect(
        screen.getByText('Weekday must be *, a number, a range, a step, or a comma list')
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Weekday custom value')).toHaveValue('MON')
    })
  })
})
