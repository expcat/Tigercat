/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { CronEditor } from '@expcat/tigercat-vue/CronEditor'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolations, renderWithProps } from '../utils'

describe('CronEditor', () => {
  it('renders an empty unselected editor, not every-minute', () => {
    renderWithProps(CronEditor, {})

    expect(screen.getByRole('group', { name: 'Cron editor' })).toBeInTheDocument()
    expect(screen.getByLabelText('Cron expression')).toHaveValue('')
    expect(screen.getByLabelText('Minute mode')).toBeDisabled()
    expect(screen.getByLabelText('Minute mode')).toHaveValue('')
  })

  it('uses modelValue', () => {
    renderWithProps(CronEditor, { modelValue: '0 12 * * 1' })

    expect(screen.getByLabelText('Cron expression')).toHaveValue('0 12 * * 1')
    expect(screen.getByLabelText('Hour mode')).toHaveValue('specific')
  })

  it('emits update:modelValue when raw expression changes', async () => {
    const onUpdate = vi.fn()
    render(CronEditor, {
      props: { defaultValue: '', 'onUpdate:modelValue': onUpdate }
    })

    await fireEvent.update(screen.getByLabelText('Cron expression'), '0 8 * * 1')

    expect(onUpdate).toHaveBeenCalledWith('0 8 * * 1')
  })

  it('keeps invalid text out of the form value', async () => {
    const onUpdate = vi.fn()
    const { container } = render(CronEditor, {
      props: { defaultValue: '', name: 'job', 'onUpdate:modelValue': onUpdate }
    })

    await fireEvent.update(screen.getByLabelText('Cron expression'), '*/0')

    expect(onUpdate).not.toHaveBeenCalledWith('*/0')
    expect(screen.getByLabelText('Cron expression')).toHaveValue('*/0')
    expect(container.querySelector('input[name="job"]')).toHaveValue('')
    const live = container.querySelector('[aria-live="polite"]')
    expect(live).toBeTruthy()
    expect(live).not.toHaveAttribute('role', 'alert')
  })

  it('shows validation errors for invalid expression', () => {
    renderWithProps(CronEditor, { modelValue: '60 * * * *' })

    expect(screen.getByText('Minute must be between 0 and 59')).toBeInTheDocument()
  })

  it('applies presets', async () => {
    const onUpdate = vi.fn()
    render(CronEditor, { props: { 'onUpdate:modelValue': onUpdate } })

    await fireEvent.update(screen.getByLabelText('Cron preset'), '0 0 * * *')

    expect(onUpdate).toHaveBeenCalledWith('0 0 * * *')
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
    expect(screen.getByLabelText('分钟值')).toHaveValue('60')
    expect(screen.getByLabelText('Cron 预设')).toHaveTextContent('选择预设')
    expect(screen.getByLabelText('Cron 预设')).toHaveTextContent('每天')
    expect(screen.getByText('分钟必须在 0 到 59 之间')).toBeInTheDocument()
  })

  it('updates field mode and step', async () => {
    const onUpdate = vi.fn()
    render(CronEditor, { props: { defaultValue: '* * * * *', 'onUpdate:modelValue': onUpdate } })

    await fireEvent.update(screen.getByLabelText('Minute mode'), 'every')
    expect(onUpdate).toHaveBeenLastCalledWith('*/1 * * * *')
    await fireEvent.update(screen.getByLabelText('Minute step'), '15')
    expect(onUpdate).toHaveBeenLastCalledWith('*/15 * * * *')
  })

  it('supports range editing', async () => {
    const onUpdate = vi.fn()
    render(CronEditor, { props: { defaultValue: '* * * * *', 'onUpdate:modelValue': onUpdate } })

    await fireEvent.update(screen.getByLabelText('Hour mode'), 'range')
    await fireEvent.update(screen.getByLabelText('Hour range start'), '9')
    await fireEvent.update(screen.getByLabelText('Hour range end'), '18')

    expect(onUpdate).toHaveBeenLastCalledWith('* 9-18 * * *')
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

  it('has no accessibility violations for an invalid expression', async () => {
    const { container } = renderWithProps(CronEditor, { modelValue: '60 * * * *' })

    await expectNoA11yViolations(container)
  })

  describe('Edge Cases and Boundary', () => {
    it('hides preset select when presets are empty', () => {
      renderWithProps(CronEditor, { presets: [] })

      expect(screen.queryByLabelText('Cron preset')).not.toBeInTheDocument()
    })

    it('keeps read-only controls focusable without changing the value', async () => {
      const onUpdate = vi.fn()
      render(CronEditor, {
        props: { readOnly: true, modelValue: '* * * * *', 'onUpdate:modelValue': onUpdate }
      })

      expect(screen.getByLabelText('Cron expression')).toHaveAttribute('readonly')
      expect(screen.getByLabelText('Cron expression')).not.toBeDisabled()
      expect(screen.getByLabelText('Cron preset')).not.toBeDisabled()
      expect(screen.getByLabelText('Minute mode')).not.toBeDisabled()
      await fireEvent.update(screen.getByLabelText('Minute mode'), 'every')
      expect(onUpdate).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Cron expression')).toHaveValue('* * * * *')
    })

    it('keeps custom mode when switching from any', async () => {
      renderWithProps(CronEditor, { defaultValue: '* * * * *' })

      await fireEvent.update(screen.getByLabelText('Minute mode'), 'custom')
      expect(screen.getByLabelText('Minute mode')).toHaveValue('custom')
      await fireEvent.update(screen.getByLabelText('Minute custom value'), '1,15,30')
      expect(screen.getByLabelText('Cron expression')).toHaveValue('1,15,30 * * * *')
    })

    it('does not rewrite a 6-field expression when a column changes', async () => {
      const onUpdate = vi.fn()
      render(CronEditor, {
        props: { modelValue: '0 0 0 * * *', 'onUpdate:modelValue': onUpdate }
      })

      expect(screen.getByLabelText('Minute mode')).toBeDisabled()
      expect(screen.getByLabelText('Minute mode')).toHaveValue('')
      await fireEvent.update(screen.getByLabelText('Minute mode'), 'specific')
      expect(onUpdate).not.toHaveBeenCalled()
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
