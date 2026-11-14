/**
 * @vitest-environment happy-dom
 */
import { defineComponent, h, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { frFR } from '@expcat/tigercat-core/locales/fr-FR'
import { Select } from '@expcat/tigercat-vue/Select'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'
import { InputNumber } from '@expcat/tigercat-vue/InputNumber'
import { Slider } from '@expcat/tigercat-vue/Slider'

describe('W9 vue forms', () => {
  it.each([
    [zhCN, '全选当前结果'],
    [zhTW, '全選目前結果'],
    [frFR, 'Tout sélectionner']
  ] as const)('inherits auxiliary Select copy from $0.locale Provider', async (locale, text) => {
    const { getByRole } = render(
      defineComponent({
        setup: () => () =>
          h(ConfigProvider, { locale }, () =>
            h(Select, { multiple: true, options: [{ label: 'Ada', value: 'a' }] })
          )
      })
    )
    await fireEvent.click(getByRole('combobox'))
    expect(getByRole('button', { name: text })).toBeInTheDocument()
  })

  it('selects filtered options, caps the count, and shows omitted names', async () => {
    const value = ref<string[]>([])
    const Host = defineComponent({
      setup() {
        return () =>
          h(Select, {
            multiple: true,
            modelValue: value.value,
            maxCount: 2,
            maxTagCount: 1,
            'aria-label': 'People',
            options: [
              { label: 'Ada', value: 'a', description: 'Pilot' },
              { label: 'Bea', value: 'b' },
              { label: 'Cam', value: 'c' }
            ],
            'onUpdate:modelValue': (next: string[]) => {
              value.value = next
            }
          })
      }
    })
    const { getByRole, getByText } = render(Host)
    await fireEvent.click(getByRole('combobox'))
    expect(getByText('Pilot')).toBeTruthy()
    await fireEvent.click(document.querySelector('[data-tiger-select-all]') as HTMLElement)
    expect(value.value).toEqual(['a', 'b'])
  })

  it('opens a read-only select without changing the value', async () => {
    const value = ref('a')
    const Host = defineComponent({
      setup() {
        return () =>
          h(Select, {
            modelValue: value.value,
            readOnly: true,
            'aria-label': 'People',
            options: [
              { label: 'Ada', value: 'a' },
              { label: 'Bea', value: 'b' }
            ],
            'onUpdate:modelValue': (next: string) => {
              value.value = next
            }
          })
      }
    })
    const { getByRole, getByText } = render(Host)
    const trigger = getByRole('combobox')
    expect(trigger).not.toHaveAttribute('aria-disabled', 'true')
    await fireEvent.click(trigger)
    await fireEvent.click(getByText('Bea'))
    expect(value.value).toBe('a')
  })

  it('keeps a big integer as a string and focuses an error summary item', async () => {
    const model = ref<string | number | null>('9007199254740993')
    const { getByRole } = render(InputNumber, {
      props: {
        modelValue: model.value,
        name: 'big',
        'onUpdate:modelValue': (next: string | number | null) => {
          model.value = next
        }
      }
    })
    const input = getByRole('spinbutton') as HTMLInputElement
    expect(input.value).toBe('9007199254740993')

    const FormHost = defineComponent({
      setup() {
        return () =>
          h(
            Form,
            {
              showErrorSummary: true,
              modelValue: { name: '' },
              rules: { name: [{ required: true, message: 'Name required' }] }
            },
            () =>
              h(FormItem, { name: 'name', label: 'Name' }, () => h(Input, { 'aria-label': 'Name' }))
          )
      }
    })
    const form = render(FormHost)
    await fireEvent.submit(form.container.querySelector('form') as HTMLFormElement)
    const summary = await form.findByRole('button', { name: 'Name required' })
    await fireEvent.click(summary)
    expect(form.getByRole('textbox', { name: 'Name' })).toHaveFocus()
  })

  it('ignores slider keys when read only and keeps the value visible', async () => {
    const { getByRole } = render(Slider, {
      props: { modelValue: 20, readOnly: true, 'aria-label': 'Volume' }
    })
    const slider = getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '20')
    await fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(slider).toHaveAttribute('aria-valuenow', '20')
  })
})
