/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { CronEditor } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated, renderWithProps } from '../utils'

describe('CronEditor', () => {
  it('renders the default expression and field editors', () => {
    renderWithProps(CronEditor, {})

    expect(screen.getByRole('group', { name: 'Cron editor' })).toBeInTheDocument()
    expect(screen.getByLabelText('Cron expression')).toHaveValue('* * * * *')
    expect(screen.getByLabelText('Minute mode')).toHaveValue('any')
  })

  it('uses modelValue', () => {
    renderWithProps(CronEditor, { modelValue: '0 12 * * 1' })

    expect(screen.getByLabelText('Cron expression')).toHaveValue('0 12 * * 1')
    expect(screen.getByLabelText('Hour mode')).toHaveValue('specific')
  })

  it('emits update:modelValue and change when raw expression changes', async () => {
    const onUpdate = vi.fn()
    const onChange = vi.fn()
    render(CronEditor, {
      props: { 'onUpdate:modelValue': onUpdate, onChange }
    })

    await fireEvent.update(screen.getByLabelText('Cron expression'), '0 8 * * 1')

    expect(onUpdate).toHaveBeenCalledWith('0 8 * * 1')
    expect(onChange).toHaveBeenCalledWith('0 8 * * 1', expect.objectContaining({ valid: true }))
  })

  it('shows validation errors for invalid expression', () => {
    renderWithProps(CronEditor, { modelValue: '60 * * * *' })

    expect(screen.getByText('Minute must be between 0 and 59')).toBeInTheDocument()
  })

  it('applies presets', async () => {
    const onChange = vi.fn()
    render(CronEditor, { props: { onChange } })

    await fireEvent.update(screen.getByLabelText('Cron preset'), '0 0 * * *')

    expect(onChange).toHaveBeenCalledWith('0 0 * * *', expect.objectContaining({ valid: true }))
  })

  it('updates field mode and step', async () => {
    const onChange = vi.fn()
    render(CronEditor, { props: { onChange } })

    await fireEvent.update(screen.getByLabelText('Minute mode'), 'every')
    expect(onChange).toHaveBeenLastCalledWith(
      '*/1 * * * *',
      expect.objectContaining({ valid: true })
    )
    await fireEvent.update(screen.getByLabelText('Minute step'), '15')
    expect(onChange).toHaveBeenLastCalledWith(
      '*/15 * * * *',
      expect.objectContaining({ valid: true })
    )
  })

  it('supports range editing', async () => {
    const onChange = vi.fn()
    render(CronEditor, { props: { onChange } })

    await fireEvent.update(screen.getByLabelText('Hour mode'), 'range')
    await fireEvent.update(screen.getByLabelText('Hour range start'), '9')
    await fireEvent.update(screen.getByLabelText('Hour range end'), '18')

    expect(onChange).toHaveBeenLastCalledWith(
      '* 9-18 * * *',
      expect.objectContaining({ valid: true })
    )
  })

  it('disables controls when disabled', () => {
    renderWithProps(CronEditor, { disabled: true })

    expect(screen.getByLabelText('Cron expression')).toBeDisabled()
    expect(screen.getByLabelText('Cron preset')).toBeDisabled()
  })

  it('applies size and class', () => {
    const { container } = renderWithProps(CronEditor, { class: 'job-schedule', size: 'lg' })

    expect(container.querySelector('.job-schedule')).toBeInTheDocument()
    expect(screen.getByLabelText('Cron expression').className).toContain('h-10')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithProps(CronEditor, {})

    await expectNoA11yViolationsIsolated(container)
  })
})
