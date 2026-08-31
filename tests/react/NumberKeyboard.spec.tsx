/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { NumberKeyboard } from '@expcat/tigercat-react/NumberKeyboard'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { expectNoA11yViolations } from '../utils/react'

const deleteName = enUS.numberKeyboard!.deleteText!
const confirmName = enUS.common!.okText!
const keypad = () =>
  (document.querySelector('[data-tiger-number-keyboard]') as HTMLElement) ??
  screen.getByRole('group')

describe('NumberKeyboard', () => {
  it('renders digit, delete, and confirm keys', () => {
    render(<NumberKeyboard />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: deleteName })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: confirmName })).toBeInTheDocument()
  })

  it('is a single tab stop', () => {
    render(<NumberKeyboard />)
    expect(keypad()).toHaveAttribute('tabIndex', '0')
    expect(screen.getAllByRole('button').every((button) => button.tabIndex === -1)).toBe(true)
  })

  it('does not expose the empty spacer as a button', () => {
    render(<NumberKeyboard mode="phone" />)
    expect(screen.queryByRole('button', { name: 'Empty' })).not.toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<NumberKeyboard className="custom-keyboard" />)
    expect(container.querySelector('.custom-keyboard')).toBeInTheDocument()
  })

  it('emits value changes in uncontrolled mode', () => {
    const onChange = vi.fn()
    render(<NumberKeyboard onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    expect(onChange.mock.calls.map(([value]) => value)).toEqual(['1', '12'])
  })

  it('uses controlled value when provided', () => {
    const onChange = vi.fn()
    render(<NumberKeyboard value="9" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(onChange).toHaveBeenCalledWith('91', expect.objectContaining({ action: 'input' }))
  })

  it('deletes the last character', () => {
    const onChange = vi.fn()
    const onDelete = vi.fn()
    render(<NumberKeyboard defaultValue="123" onChange={onChange} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: deleteName }))
    expect(onDelete).toHaveBeenCalledWith('12', expect.objectContaining({ action: 'delete' }))
    expect(onChange).toHaveBeenCalledWith('12', expect.objectContaining({ key: 'delete' }))
  })

  it('does not emit when disabled', () => {
    const onChange = vi.fn()
    render(<NumberKeyboard disabled onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(keypad()).toHaveAttribute('aria-disabled', 'true')
    expect(keypad()).toHaveAttribute('tabIndex', '-1')
  })

  it('does not emit when readonly but stays focusable', () => {
    const onChange = vi.fn()
    render(<NumberKeyboard readonly onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(keypad()).toHaveAttribute('tabIndex', '0')
    expect(screen.getByRole('button', { name: '1' })).not.toBeDisabled()
  })

  it('supports custom labels and hidden confirm key', () => {
    render(<NumberKeyboard deleteText="Back" confirmText="OK" showConfirm={false} />)
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'OK' })).not.toBeInTheDocument()
  })

  it('types from the focused keypad', () => {
    const onChange = vi.fn()
    render(<NumberKeyboard onChange={onChange} />)
    keypad().focus()
    fireEvent.keyDown(keypad(), { key: '5' })
    fireEvent.keyDown(keypad(), { key: 'Backspace' })
    expect(onChange.mock.calls.map(([value]) => value)).toEqual(['5', ''])
  })

  it('does not append after a lowercase id-card x', () => {
    const onChange = vi.fn()
    render(<NumberKeyboard mode="id-card" value="12345678901234567x" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes the overlay on confirm', () => {
    const onOpenChange = vi.fn()
    const onConfirm = vi.fn()
    render(
      <NumberKeyboard
        defaultOpen
        defaultValue="8"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: confirmName }))
    expect(onConfirm).toHaveBeenCalledWith('8', expect.objectContaining({ action: 'confirm' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('writes the committed string into FormItem', async () => {
    const validator = vi.fn(() => undefined)
    render(
      <Form>
        <FormItem name="pin" label="PIN" rules={[{ validator }]}>
          <NumberKeyboard />
        </FormItem>
      </Form>
    )
    expect(keypad()).toHaveAttribute('id')
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    await waitFor(() => expect(validator).toHaveBeenCalled())
    expect(validator.mock.calls.at(-1)?.[0]).toBe('1')
  })

  it('does not blur-validate when moving between keys', async () => {
    const validator = vi.fn(() => undefined)
    render(
      <Form>
        <FormItem name="pin" label="PIN" rules={[{ validator, trigger: 'blur' }]}>
          <NumberKeyboard />
        </FormItem>
      </Form>
    )
    keypad().focus()
    fireEvent.blur(keypad(), { relatedTarget: screen.getByRole('button', { name: '2' }) })
    expect(validator).not.toHaveBeenCalled()
  })

  it('uses official locale objects', () => {
    render(
      <ConfigProvider locale={zhTW}>
        <NumberKeyboard />
      </ConfigProvider>
    )
    expect(screen.getByRole('group', { name: zhTW.numberKeyboard?.ariaLabel })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: zhTW.numberKeyboard?.deleteText })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: zhTW.common?.okText })).toBeInTheDocument()
  })

  it('uses ja-JP locale objects', () => {
    render(
      <ConfigProvider locale={jaJP}>
        <NumberKeyboard mode="amount" />
      </ConfigProvider>
    )
    expect(
      screen.getByRole('button', { name: jaJP.numberKeyboard?.decimalAriaLabel })
    ).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<NumberKeyboard />)
      await expectNoA11yViolations(container)
    })

    it('has no accessibility violations for id-card', async () => {
      const { container } = render(<NumberKeyboard mode="id-card" />)
      await expectNoA11yViolations(container)
    })
  })
})
