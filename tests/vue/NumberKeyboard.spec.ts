/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { NumberKeyboard } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('NumberKeyboard', () => {
  it('renders digit, delete, and confirm keys', () => {
    render(NumberKeyboard)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
  })

  it('applies className prop', () => {
    const { container } = render(NumberKeyboard, { props: { className: 'custom-keyboard' } })
    expect(container.querySelector('.custom-keyboard')).toBeInTheDocument()
  })

  it('emits value changes in uncontrolled mode', async () => {
    const { emitted } = render(NumberKeyboard)
    await fireEvent.click(screen.getByRole('button', { name: '1' }))
    await fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(emitted().change.map(([value]) => value)).toEqual(['1', '12'])
  })

  it('uses modelValue when provided', async () => {
    const onUpdate = vi.fn()
    render(NumberKeyboard, { props: { modelValue: '9', 'onUpdate:modelValue': onUpdate } })
    await fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(onUpdate).toHaveBeenCalledWith('91')
  })

  it('deletes the last character', async () => {
    const { emitted } = render(NumberKeyboard, { props: { defaultValue: '123' } })
    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(emitted().delete[0][0]).toBe('12')
    expect(emitted().change[0][0]).toBe('12')
  })
  it('does not emit when disabled', async () => {
    const { emitted } = render(NumberKeyboard, { props: { disabled: true } })
    await fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(emitted().change).toBeUndefined()
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not emit when readonly', async () => {
    const { emitted } = render(NumberKeyboard, { props: { readonly: true } })
    await fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(emitted().change).toBeUndefined()
  })

  it('supports custom labels and hidden confirm key', () => {
    render(NumberKeyboard, { props: { deleteText: 'Back', confirmText: 'OK', showConfirm: false } })
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'OK' })).not.toBeInTheDocument()
  })

  it('emits key press payloads', async () => {
    const { emitted } = render(NumberKeyboard)
    await fireEvent.click(screen.getByRole('button', { name: '3' }))
    expect(emitted()['key-press'][0][0]).toMatchObject({ value: '3' })
    expect(emitted()['key-press'][0][1]).toMatchObject({ value: '3', mode: 'number' })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(NumberKeyboard)
      await expectNoA11yViolationsIsolated(container)
    })
  })

})
