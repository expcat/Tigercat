/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { NumberKeyboard } from '@expcat/tigercat-vue/NumberKeyboard'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { expectNoA11yViolations } from '../utils'

const deleteName = enUS.numberKeyboard!.deleteText!
const confirmName = enUS.common!.okText!
const keypad = () =>
  (document.querySelector('[data-tiger-number-keyboard]') as HTMLElement) ??
  screen.getByRole('group')

describe('NumberKeyboard', () => {
  it('renders digit, delete, and confirm keys', () => {
    render(NumberKeyboard)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: deleteName })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: confirmName })).toBeInTheDocument()
  })

  it('is a single tab stop', () => {
    render(NumberKeyboard)
    expect(keypad()).toHaveAttribute('tabindex', '0')
    expect(screen.getAllByRole('button').every((button) => button.tabIndex === -1)).toBe(true)
  })

  it('does not expose the empty spacer as a button', () => {
    render(NumberKeyboard, { props: { mode: 'phone' } })
    expect(screen.queryByRole('button', { name: 'Empty' })).not.toBeInTheDocument()
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
    await fireEvent.click(screen.getByRole('button', { name: deleteName }))
    expect(emitted().delete[0][0]).toBe('12')
  })

  it('does not emit when disabled', async () => {
    const { emitted } = render(NumberKeyboard, { props: { disabled: true } })
    await fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(emitted().change).toBeUndefined()
    expect(keypad()).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not emit when readonly but stays focusable', async () => {
    const { emitted } = render(NumberKeyboard, { props: { readonly: true } })
    await fireEvent.click(screen.getByRole('button', { name: '1' }))
    expect(emitted().change).toBeUndefined()
    expect(keypad()).toHaveAttribute('tabindex', '0')
  })

  it('types from the focused keypad', async () => {
    const { emitted } = render(NumberKeyboard)
    keypad().focus()
    await fireEvent.keyDown(keypad(), { key: '5' })
    expect(emitted().change[0][0]).toBe('5')
  })

  it('closes the overlay on confirm', async () => {
    const onOpenChange = vi.fn()
    render(NumberKeyboard, {
      props: {
        defaultOpen: true,
        defaultValue: '8',
        'onUpdate:open': onOpenChange,
        onOpenChange: onOpenChange
      }
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: confirmName }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('writes the committed string into FormItem', async () => {
    const validator = vi.fn(() => undefined)
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(Form, null, () =>
            h(FormItem, { name: 'pin', label: 'PIN', rules: [{ validator }] }, () =>
              h(NumberKeyboard)
            )
          )
      }
    })
    render(Wrapper)
    expect(keypad().id).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: '1' }))
    await waitFor(() => expect(validator).toHaveBeenCalled())
    expect(validator.mock.calls.at(-1)?.[0]).toBe('1')
  })

  it('uses official locale objects', () => {
    const Wrapper = defineComponent({
      setup() {
        return () => h(ConfigProvider, { locale: zhTW }, () => h(NumberKeyboard))
      }
    })
    render(Wrapper)
    expect(screen.getByRole('group', { name: zhTW.numberKeyboard?.ariaLabel })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: zhTW.common?.okText })).toBeInTheDocument()
  })

  it('uses ja-JP locale objects', () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, { locale: jaJP }, () => h(NumberKeyboard, { mode: 'amount' }))
      }
    })
    render(Wrapper)
    expect(
      screen.getByRole('button', { name: jaJP.numberKeyboard?.decimalAriaLabel })
    ).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(NumberKeyboard)
      await expectNoA11yViolations(container)
    })
  })
})
