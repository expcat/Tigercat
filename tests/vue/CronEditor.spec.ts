/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { ConfigProvider, CronEditor } from '@expcat/tigercat-vue'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
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

  it('uses ConfigProvider locale for fields, presets, aria, and validation', () => {
    render({
      render() {
        return h(ConfigProvider, { locale: zhCN }, () =>
          h(CronEditor, { modelValue: '60 * * * *' })
        )
      }
    })

    expect(screen.getByRole('group', { name: 'Cron 表达式编辑器' })).toBeInTheDocument()
    expect(screen.getByLabelText('Cron 表达式')).toHaveValue('60 * * * *')
    expect(screen.getByLabelText('分钟模式')).toHaveValue('specific')
    expect(screen.getByLabelText('分钟值')).toHaveValue(60)
    expect(screen.getByLabelText('Cron 预设')).toHaveTextContent('选择预设')
    expect(screen.getByLabelText('Cron 预设')).toHaveTextContent('每天')
    expect(screen.getByText('分钟必须在 0 到 59 之间')).toBeInTheDocument()
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

  describe('Edge Cases and Boundary', () => {
    it('hides preset select when presets are empty', () => {
      renderWithProps(CronEditor, { presets: [] })

      expect(screen.queryByLabelText('Cron preset')).not.toBeInTheDocument()
    })

    it('makes controls inactive when readonly', () => {
      renderWithProps(CronEditor, { readonly: true })

      expect(screen.getByLabelText('Cron expression')).toHaveAttribute('readonly')
      expect(screen.getByLabelText('Cron preset')).toBeDisabled()
      expect(screen.getByLabelText('Minute mode')).toBeDisabled()
    })

    it('clamps specific values to field boundaries', async () => {
      const onChange = vi.fn()
      render(CronEditor, { props: { onChange } })

      await fireEvent.update(screen.getByLabelText('Hour mode'), 'specific')
      await fireEvent.update(screen.getByLabelText('Hour value'), '99')

      expect(onChange).toHaveBeenLastCalledWith(
        '* 23 * * *',
        expect.objectContaining({ valid: true })
      )
    })

    it('normalizes reversed ranges to ascending order', async () => {
      const onChange = vi.fn()
      render(CronEditor, { props: { onChange } })

      await fireEvent.update(screen.getByLabelText('Month mode'), 'range')
      await fireEvent.update(screen.getByLabelText('Month range start'), '12')
      await fireEvent.update(screen.getByLabelText('Month range end'), '1')

      expect(onChange).toHaveBeenLastCalledWith(
        '* * * 1-12 *',
        expect.objectContaining({ valid: true })
      )
    })

    it('reports invalid custom field values', () => {
      renderWithProps(CronEditor, { modelValue: '* * * * MON' })

      expect(
        screen.getByText('Weekday must be *, a number, a range, a step, or a comma list')
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Weekday custom value')).toHaveValue('MON')
    })
  })
})
