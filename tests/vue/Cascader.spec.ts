/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { Cascader } from '@expcat/tigercat-vue/Cascader'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { arSA } from '@expcat/tigercat-core/locales/ar-SA'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils'

const simpleOptions = [
  {
    label: 'Zhejiang',
    value: 'zhejiang',
    children: [
      {
        label: 'Hangzhou',
        value: 'hangzhou',
        children: [{ label: 'West Lake', value: 'westlake' }]
      }
    ]
  },
  {
    label: 'Jiangsu',
    value: 'jiangsu',
    children: [{ label: 'Nanjing', value: 'nanjing' }]
  }
]

describe('Cascader', () => {
  it('keeps an uncontrolled selection after choosing a leaf', async () => {
    const { getByRole } = render(Cascader, {
      props: { options: simpleOptions, 'aria-label': 'Region' }
    })
    const trigger = getByRole('combobox')
    expect(trigger).toHaveTextContent('Select an option')
    await fireEvent.click(trigger)
    await fireEvent.click(getByRole('option', { name: 'Zhejiang' }))
    await fireEvent.click(getByRole('option', { name: 'Hangzhou' }))
    await fireEvent.click(getByRole('option', { name: 'West Lake' }))
    expect(getByRole('combobox')).toHaveTextContent('Zhejiang / Hangzhou / West Lake')
  })

  it('opens from a closed trigger with ArrowDown', async () => {
    const { getByRole } = render(Cascader, {
      props: { options: simpleOptions, 'aria-label': 'Keys' }
    })
    const trigger = getByRole('combobox')
    trigger.focus()
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(getByRole('option', { name: 'Zhejiang' })).toBeInTheDocument()
  })

  it('expands on hover when expandTrigger is hover', async () => {
    const { getByRole } = render(Cascader, {
      props: {
        options: simpleOptions,
        expandTrigger: 'hover',
        'aria-label': 'Hover'
      }
    })
    await fireEvent.click(getByRole('combobox'))
    await fireEvent.mouseEnter(getByRole('option', { name: 'Zhejiang' }))
    expect(getByRole('option', { name: 'Hangzhou' })).toBeInTheDocument()
  })

  it('keeps defaultSearchValue after open', async () => {
    const { getByRole } = render(Cascader, {
      props: {
        options: simpleOptions,
        searchable: true,
        defaultSearchValue: 'West',
        'aria-label': 'Search'
      }
    })
    await fireEvent.click(getByRole('combobox'))
    expect((getByRole('combobox') as HTMLInputElement).value).toBe('West')
    expect(getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' })).toBeInTheDocument()
  })

  it('reads FormItem and validates the committed path', async () => {
    const validator = vi.fn().mockResolvedValue(undefined)
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(
            Form,
            { model: { region: undefined }, rules: { region: [{ validator, trigger: 'change' }] } },
            {
              default: () =>
                h(
                  FormItem,
                  { name: 'region', label: 'Region' },
                  { default: () => h(Cascader, { options: simpleOptions }) }
                )
            }
          )
      }
    })
    const { getByRole, queryByText } = render(Wrapper)
    const trigger = getByRole('combobox')
    expect(trigger).toHaveAttribute('id')
    await fireEvent.click(trigger)
    expect(queryByText(/required/i)).not.toBeInTheDocument()
    await fireEvent.click(getByRole('option', { name: 'Jiangsu' }))
    await fireEvent.click(getByRole('option', { name: 'Nanjing' }))
    await waitFor(() => {
      expect(validator).toHaveBeenCalled()
    })
  })

  it('uses zh-TW labels from the official locale object', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(
            ConfigProvider,
            { locale: zhTW },
            { default: () => h(Cascader, { options: [], 'aria-label': 'TW' }) }
          )
      }
    })
    const { getByRole, getByText } = render(Wrapper)
    expect(getByText('請選擇')).toBeInTheDocument()
    await fireEvent.click(getByRole('combobox'))
    expect(getByText('暫無結果')).toBeInTheDocument()
  })

  it('swaps column keys in RTL', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(
            ConfigProvider,
            { locale: arSA },
            {
              default: () => h(Cascader, { options: simpleOptions, 'aria-label': 'RTL' })
            }
          )
      }
    })
    const { getByRole } = render(Wrapper)
    const trigger = getByRole('combobox')
    trigger.focus()
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await fireEvent.keyDown(trigger, { key: 'Enter' })
    await fireEvent.keyDown(trigger, { key: 'ArrowLeft' })
    expect(getByRole('option', { name: 'Hangzhou' })).toBeInTheDocument()
  })

  it('closes from Done without selecting a leaf', async () => {
    const { getByRole, queryByRole } = render(Cascader, {
      props: { options: simpleOptions, 'aria-label': 'Done' }
    })
    await fireEvent.click(getByRole('combobox'))
    await fireEvent.click(getByRole('option', { name: 'Zhejiang' }))
    await fireEvent.click(getByRole('button', { name: 'Done' }))
    expect(queryByRole('option', { name: 'Hangzhou' })).not.toBeInTheDocument()
    expect(getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('exposes focus/open/close', async () => {
    const exposed = ref<{ focus: () => void } | null>(null)
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(Cascader, {
            ref: (value: { focus: () => void } | null) => {
              exposed.value = value
            },
            options: simpleOptions,
            'aria-label': 'Ref'
          })
      }
    })
    const { getByRole } = render(Wrapper)
    exposed.value?.focus()
    await waitFor(() => {
      expect(getByRole('combobox')).toHaveFocus()
    })
  })

  it('has no accessibility violations when open with a label', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(
            FormItem,
            { label: 'Region' },
            { default: () => h(Cascader, { options: simpleOptions }) }
          )
      }
    })
    const { container, getByRole } = render(Wrapper)
    await fireEvent.click(getByRole('combobox'))
    await expectNoA11yViolations(container)
  })
})
