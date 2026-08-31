/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { Select } from '@expcat/tigercat-vue/Select'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Modal } from '@expcat/tigercat-vue/Modal'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils'

const testOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' }
]

const groupedOptions = [
  {
    label: 'Group A',
    options: [
      { label: 'A-1', value: 'a1' },
      { label: 'A-2', value: 'a2' }
    ]
  }
]

describe('Select', () => {
  it('exposes data-state on the combobox', async () => {
    const { getByRole } = render(Select, {
      props: { options: testOptions, 'aria-label': 'Fruit' }
    })
    const trigger = getByRole('combobox')
    expect(trigger).toHaveAttribute('data-state', 'closed')
    await fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('data-state', 'open')
  })

  it('keeps an uncontrolled selection after choosing an option', async () => {
    const { getByRole, getByText } = render(Select, {
      props: { options: testOptions, 'aria-label': 'Pick' }
    })
    expect(getByText('Select an option')).toBeInTheDocument()
    await fireEvent.click(getByRole('combobox'))
    await fireEvent.click(getByRole('option', { name: 'Option 1' }))
    expect(getByRole('combobox')).toHaveTextContent('Option 1')
  })

  it('treats empty string as a real option value', async () => {
    const onChange = vi.fn()
    const { getByRole, getByLabelText } = render(Select, {
      props: {
        options: [
          { label: 'None', value: '' },
          { label: 'One', value: '1' }
        ],
        'aria-label': 'Empty',
        clearable: true,
        onChange
      }
    })
    await fireEvent.click(getByRole('combobox'))
    await fireEvent.click(getByRole('option', { name: 'None' }))
    expect(onChange).toHaveBeenCalledWith('')
    expect(getByRole('combobox')).toHaveTextContent('None')
    await fireEvent.click(getByLabelText('Clear selection'))
    expect(onChange).toHaveBeenLastCalledWith(undefined)
    expect(getByRole('combobox')).toHaveTextContent('Select an option')
  })

  it('selects with keyboard without moving focus onto options', async () => {
    const onChange = vi.fn()
    const { getByRole } = render(Select, {
      props: { options: testOptions, 'aria-label': 'Keys', onChange }
    })
    const trigger = getByRole('combobox')
    trigger.focus()
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const option = getByRole('option', { name: 'Option 1' })
    expect(document.activeElement).not.toBe(option)
    expect(trigger).toHaveAttribute('aria-activedescendant', option.id)
    await fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('1')
  })

  it('creates from the search query on a virtual list', async () => {
    const onCreate = vi.fn()
    const onChange = vi.fn()
    const { getByRole } = render(Select, {
      props: {
        options: testOptions,
        searchable: true,
        creatable: true,
        virtual: true,
        'aria-label': 'Create',
        onCreate,
        onChange
      }
    })
    await fireEvent.click(getByRole('combobox'))
    const input = document.body.querySelector('input[role="combobox"]') as HTMLInputElement
    await fireEvent.update(input, 'New option')
    await fireEvent.click(getByRole('option', { name: 'Create "New option"' }))
    expect(onCreate).toHaveBeenCalledWith({ label: 'New option', value: 'New option' })
    expect(onChange).toHaveBeenCalledWith('New option')
  })

  it('renders grouped options as labelled groups', async () => {
    const { getByRole } = render(Select, {
      props: { options: groupedOptions, 'aria-label': 'Groups' }
    })
    await fireEvent.click(getByRole('combobox'))
    expect(getByRole('group', { name: 'Group A' })).toBeInTheDocument()
  })

  it('reads FormItem and validates the committed value', async () => {
    const validator = vi.fn().mockResolvedValue(true)
    const Wrapper = defineComponent({
      setup() {
        const model = ref({ city: undefined as number | undefined })
        return () =>
          h(Form, { model: model.value, rules: { city: [{ validator, trigger: 'change' }] } }, () =>
            h(FormItem, { name: 'city', label: 'City' }, () =>
              h(Select, {
                options: [{ label: 'NYC', value: 42 }],
                'onUpdate:modelValue': (value: number) => {
                  model.value = { city: value }
                }
              })
            )
          )
      }
    })
    const { getByRole } = render(Wrapper)
    const trigger = getByRole('combobox')
    await fireEvent.click(trigger)
    await fireEvent.click(getByRole('option', { name: 'NYC' }))
    await waitFor(() => {
      expect(validator.mock.calls.some((call) => call[0] === 42)).toBe(true)
    })
  })

  it('exposes focus / open / close', async () => {
    const Wrapper = defineComponent({
      setup() {
        const selectRef = ref<{ focus: () => void }>()
        return () =>
          h('div', [
            h('button', { type: 'button', onClick: () => selectRef.value?.focus() }, 'Focus'),
            h(Select, {
              ref: selectRef,
              options: testOptions,
              'aria-label': 'Ref'
            })
          ])
      }
    })
    const { getByRole } = render(Wrapper)
    await fireEvent.click(getByRole('button', { name: 'Focus' }))
    expect(getByRole('combobox')).toHaveFocus()
  })

  it('uses zh-TW labels from the official locale object', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, { locale: zhTW }, () => h(Select, { options: [], 'aria-label': 'TW' }))
      }
    })
    const { getByRole, getByText } = render(Wrapper)
    expect(getByText('請選擇')).toBeInTheDocument()
    await fireEvent.click(getByRole('combobox'))
    expect(getByText('暫無選項')).toBeInTheDocument()
  })

  it('portals into a modal overlay host', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(Modal, { open: true, title: 'Dialog' }, () =>
            h(Select, { options: testOptions, 'aria-label': 'Inside' })
          )
      }
    })
    const { getByRole } = render(Wrapper)
    await fireEvent.click(getByRole('combobox'))
    expect(getByRole('listbox').closest('[data-tiger-overlay-host]')).toBeTruthy()
  })

  it('has no a11y violations when opened with a name', async () => {
    const { container, getByRole } = render(Select, {
      props: { options: testOptions, 'aria-label': 'Accessible select' }
    })
    await fireEvent.click(getByRole('combobox'))
    await expectNoA11yViolations(container)
  })

  it('shows zh-CN placeholder from ConfigProvider', () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(ConfigProvider, { locale: zhCN }, () =>
            h(Select, { options: testOptions, 'aria-label': 'ZH' })
          )
      }
    })
    const { getByText } = render(Wrapper)
    expect(getByText('请选择')).toBeInTheDocument()
  })
})
