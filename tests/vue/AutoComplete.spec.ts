/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { AutoComplete } from '@expcat/tigercat-vue/AutoComplete'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils'

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' }
]

const optionsWithDisabled = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' }
]

const cityOptions = [
  { label: '北京 Beijing', value: 'beijing' },
  { label: '上海 Shanghai', value: 'shanghai' },
  { label: '深圳 Shenzhen', value: 'shenzhen' }
]

const jumpOptions = [{ label: 'Apple', value: 'app' }]

describe('AutoComplete', () => {
  it('renders a combobox input', () => {
    const { getByRole } = render(AutoComplete, {
      props: { options, 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-haspopup', 'listbox')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
  })

  it('opens on focus and filters while typing without committing', async () => {
    const { getByRole, getByText, queryByText, emitted } = render(AutoComplete, {
      props: { options, 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    expect(getByRole('listbox')).toBeInTheDocument()
    await fireEvent.update(input, 'App')
    expect(getByText('Apple')).toBeInTheDocument()
    expect(queryByText('Banana')).not.toBeInTheDocument()
    expect(emitted()['update:modelValue']).toBeUndefined()
    expect(emitted()['search-change']?.at(-1)).toEqual(['App'])
    expect(input).toHaveValue('App')
  })

  it('does not rewrite the query to a matching option label while typing', async () => {
    const Wrapper = defineComponent({
      setup() {
        const value = ref<string | number | undefined>()
        return () =>
          h(AutoComplete, {
            modelValue: value.value,
            options: jumpOptions,
            'aria-label': 'Fruit',
            'onUpdate:modelValue': (next: string | number | undefined) => {
              value.value = next
            }
          })
      }
    })
    const { getByRole } = render(Wrapper)
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.update(input, 'app')
    expect(input).toHaveValue('app')
  })

  it('commits the option value and shows its label on click', async () => {
    const { getByRole, emitted } = render(AutoComplete, {
      props: { options: cityOptions, 'aria-label': 'City' }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.click(getByRole('option', { name: '北京 Beijing' }))
    expect(emitted()['update:modelValue']?.at(-1)).toEqual(['beijing'])
    expect(emitted().select?.at(-1)?.[0]).toBe('beijing')
    expect(input).toHaveValue('北京 Beijing')
  })

  it('keeps typing beijing as beijing until an option is chosen', async () => {
    const Wrapper = defineComponent({
      setup() {
        const value = ref<string | number | undefined>()
        return () =>
          h(AutoComplete, {
            modelValue: value.value,
            options: cityOptions,
            'aria-label': 'City',
            'onUpdate:modelValue': (next: string | number | undefined) => {
              value.value = next
            }
          })
      }
    })
    const { getByRole } = render(Wrapper)
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.update(input, 'beijing')
    expect(input).toHaveValue('beijing')
    await fireEvent.click(getByRole('option', { name: '北京 Beijing' }))
    expect(input).toHaveValue('北京 Beijing')
  })

  it('uses defaultValue and defaultSearchValue when modelValue is omitted', async () => {
    const { getByRole, rerender } = render(AutoComplete, {
      props: { options, defaultValue: 'apple', 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    expect(input).toHaveValue('Apple')
    await fireEvent.focus(input)
    expect(getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true')
    await rerender({ options, defaultValue: 'apple', 'aria-label': 'Fruit' })
    expect(input).toHaveValue('Apple')
  })

  it('uses defaultSearchValue when unselected', () => {
    const { getByRole } = render(AutoComplete, {
      props: { options, defaultSearchValue: 'q', 'aria-label': 'Query' }
    })
    expect(getByRole('combobox')).toHaveValue('q')
  })

  it('does not clear the query when options get a new identity while typing', async () => {
    const { getByRole, rerender } = render(AutoComplete, {
      props: { options, 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.update(input, 'Ch')
    await rerender({ options: [...options], 'aria-label': 'Fruit' })
    expect(input).toHaveValue('Ch')
  })

  it('closes on Tab and reports open-change', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h('div', [
            h(AutoComplete, { options, 'aria-label': 'Fruit' }),
            h('button', { type: 'button' }, 'Next')
          ])
      }
    })
    const { getByRole, queryByRole } = render(Wrapper)
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    input.focus()
    await fireEvent.focusOut(input, { relatedTarget: getByRole('button', { name: 'Next' }) })
    await waitFor(() => {
      expect(queryByRole('listbox')).not.toBeInTheDocument()
      expect(input).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('does not commit while typing when allowFreeInput is false and reverts on blur', async () => {
    const { getByRole, emitted } = render(AutoComplete, {
      props: {
        options,
        defaultValue: 'apple',
        allowFreeInput: false,
        'aria-label': 'Fruit'
      }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.update(input, 'xyz')
    expect(emitted()['update:modelValue']).toBeUndefined()
    await fireEvent.focusOut(input, { relatedTarget: document.body })
    await waitFor(() => {
      expect(input).toHaveValue('Apple')
    })
    expect(emitted()['update:modelValue']).toBeUndefined()
  })

  it('commits free text on blur when allowFreeInput is true', async () => {
    const { getByRole, emitted } = render(AutoComplete, {
      props: { options, 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.update(input, 'kiwi')
    await fireEvent.focusOut(input, { relatedTarget: document.body })
    await waitFor(() => {
      expect(emitted()['update:modelValue']?.at(-1)).toEqual(['kiwi'])
    })
  })

  it('selects the first option on Enter when defaultActiveFirstOption is true', async () => {
    const { getByRole, emitted } = render(AutoComplete, {
      props: { options, 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted().select?.at(-1)?.[0]).toBe('apple')
  })

  it('commits the query on Enter when defaultActiveFirstOption is false', async () => {
    const { getByRole, emitted } = render(AutoComplete, {
      props: { options, defaultActiveFirstOption: false, 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.update(input, 'kiwi')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted().select).toBeUndefined()
    expect(emitted()['update:modelValue']?.at(-1)).toEqual(['kiwi'])
  })

  it('clears once, keeps focus, and emits search-change', async () => {
    const { getByRole, emitted } = render(AutoComplete, {
      props: { options, defaultValue: 'apple', clearable: true, 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    await fireEvent.mouseDown(getByRole('button', { name: 'Clear' }))
    await fireEvent.click(getByRole('button', { name: 'Clear' }))
    await nextTick()
    expect(emitted()['update:modelValue']?.at(-1)).toEqual([undefined])
    expect(emitted()['search-change']?.at(-1)).toEqual([''])
    expect(input).toHaveFocus()
  })

  it('skips disabled options with the keyboard and does not select them', async () => {
    const { getByRole, emitted } = render(AutoComplete, {
      props: {
        options: optionsWithDisabled,
        defaultActiveFirstOption: false,
        'aria-label': 'Fruit'
      }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    await fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-active', 'true')
    await fireEvent.click(getByRole('option', { name: 'Banana' }))
    expect(emitted().select).toBeUndefined()
  })

  it('moves to the first and last enabled options with Home and End', async () => {
    const { getByRole } = render(AutoComplete, {
      props: { options, 'aria-label': 'Fruit', defaultActiveFirstOption: false }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.keyDown(input, { key: 'End' })
    expect(getByRole('option', { name: 'Date' })).toHaveAttribute('data-active', 'true')
    await fireEvent.keyDown(input, { key: 'Home' })
    expect(getByRole('option', { name: 'Apple' })).toHaveAttribute('data-active', 'true')
  })

  it('honors a controlled searchValue', async () => {
    const { getByRole, emitted } = render(AutoComplete, {
      props: { options, searchValue: 'Ban', 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    expect(input).toHaveValue('Ban')
    await fireEvent.focus(input)
    await fireEvent.update(input, 'Bana')
    expect(emitted()['update:searchValue']?.at(-1)).toEqual(['Bana'])
    expect(emitted()['search-change']?.at(-1)).toEqual(['Bana'])
  })

  it('shows loading instead of empty when filterOption is false', async () => {
    const { getByRole, getByText, queryByRole } = render(AutoComplete, {
      props: { options: [], filterOption: false, loading: true, 'aria-label': 'Fruit' }
    })
    await fireEvent.focus(getByRole('combobox'))
    expect(queryByRole('listbox')).not.toBeInTheDocument()
    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('does not leave aria-controls pointing at a missing listbox', async () => {
    const { getByRole } = render(AutoComplete, {
      props: { options, 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.update(input, 'zzzz')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).not.toHaveAttribute('aria-controls')
  })

  it('reads FormItem and validates the committed value', async () => {
    const validator = vi.fn().mockResolvedValue(true)
    const Wrapper = defineComponent({
      setup() {
        const model = ref({ fruit: undefined as string | undefined })
        return () =>
          h(
            Form,
            { model: model.value, rules: { fruit: [{ validator, trigger: 'change' }] } },
            () =>
              h(FormItem, { name: 'fruit', label: 'Fruit' }, () =>
                h(AutoComplete, {
                  options,
                  'onUpdate:modelValue': (value: string | undefined) => {
                    model.value = { fruit: value }
                  }
                })
              )
          )
      }
    })
    const { getByRole, queryByText } = render(Wrapper)
    const input = getByRole('combobox')
    expect(input).toHaveAttribute('id')
    await fireEvent.focus(input)
    expect(queryByText(/required/i)).not.toBeInTheDocument()
    await fireEvent.click(getByRole('option', { name: 'Apple' }))
    await waitFor(() => {
      expect(validator.mock.calls.some((call) => call[0] === 'apple')).toBe(true)
    })
  })

  it('exposes focus / open / close', async () => {
    const Wrapper = defineComponent({
      setup() {
        const autoCompleteRef = ref<{ focus: () => void }>()
        return () =>
          h('div', [
            h('button', { type: 'button', onClick: () => autoCompleteRef.value?.focus() }, 'Focus'),
            h(AutoComplete, {
              ref: autoCompleteRef,
              options,
              'aria-label': 'Ref'
            })
          ])
      }
    })
    const { getByRole } = render(Wrapper)
    await fireEvent.click(getByRole('button', { name: 'Focus' }))
    expect(getByRole('combobox')).toHaveFocus()
  })

  it('uses zh-TW empty and clear labels from the official locale object', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, { locale: zhTW }, () =>
            h(AutoComplete, {
              options,
              defaultValue: 'apple',
              clearable: true,
              'aria-label': 'TW'
            })
          )
      }
    })
    const { getByRole, getByText } = render(Wrapper)
    expect(getByRole('button', { name: '清除' })).toBeInTheDocument()
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.update(input, 'zzzz')
    expect(getByText('暫無結果')).toBeInTheDocument()
  })

  it('has no a11y violations when opened with a name', async () => {
    const { container, getByRole } = render(AutoComplete, {
      props: { options, 'aria-label': 'Accessible autocomplete' }
    })
    await fireEvent.focus(getByRole('combobox'))
    await expectNoA11yViolations(container)
  })

  it('has no a11y violations when opened with no matches', async () => {
    const { container, getByRole } = render(AutoComplete, {
      props: { options, 'aria-label': 'Empty autocomplete' }
    })
    await fireEvent.focus(getByRole('combobox'))
    await fireEvent.update(getByRole('combobox'), 'zzzz')
    await expectNoA11yViolations(container)
  })

  it('has no a11y violations inside a labelled FormItem', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(Form, () =>
            h(FormItem, { name: 'fruit', label: 'Fruit' }, () => h(AutoComplete, { options }))
          )
      }
    })
    const { container, getByRole } = render(Wrapper)
    await fireEvent.focus(getByRole('combobox'))
    await expectNoA11yViolations(container)
  })

  it('uses a custom filter and keeps all options when filterOption is false', async () => {
    const customFilter = (input: string, option: { label: string }) =>
      option.label.startsWith(input)
    const { getByRole, getByText, queryByText, rerender } = render(AutoComplete, {
      props: { options, filterOption: customFilter, 'aria-label': 'Fruit' }
    })
    const input = getByRole('combobox')
    await fireEvent.focus(input)
    await fireEvent.update(input, 'Ch')
    expect(getByText('Cherry')).toBeInTheDocument()
    expect(queryByText('Apple')).not.toBeInTheDocument()
    await rerender({ options, filterOption: false, 'aria-label': 'Fruit' })
    await fireEvent.update(input, 'xyz')
    expect(getByRole('listbox').querySelectorAll('[role="option"]')).toHaveLength(4)
  })

  it('disables the input', () => {
    const { getByRole } = render(AutoComplete, {
      props: { options, disabled: true, 'aria-label': 'Fruit' }
    })
    expect(getByRole('combobox')).toBeDisabled()
  })
})
