/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
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
  it.each(['empty options', 'no search matches'])(
    'omits aria-controls for %s',
    async (emptyState) => {
      const { getByRole, queryByRole } = render(Cascader, {
        props: {
          options: emptyState === 'empty options' ? [] : simpleOptions,
          searchable: true
        }
      })
      await fireEvent.click(getByRole('combobox'))
      const input = getByRole('combobox')
      if (emptyState === 'no search matches') await fireEvent.update(input, 'missing')
      expect(input).toHaveAttribute('aria-expanded', 'true')
      expect(queryByRole('listbox')).not.toBeInTheDocument()
      expect(input).not.toHaveAttribute('aria-controls')
      expect(input).not.toHaveAttribute('aria-activedescendant')
    }
  )

  it('ignores Enter while composing a search query', async () => {
    const { getByRole, emitted } = render(Cascader, {
      props: { options: [{ label: 'Alpha', value: 'a' }], searchable: true }
    })
    await fireEvent.click(getByRole('combobox'))
    const input = getByRole('combobox')
    await fireEvent.update(input, 'Alpha')
    expect(input).toHaveAttribute(
      'aria-activedescendant',
      getByRole('option', { name: 'Alpha' }).id
    )
    await fireEvent.keyDown(input, { key: 'Enter', isComposing: true, keyCode: 229 })
    expect.soft(emitted()['update:modelValue']).toBeUndefined()
    expect(getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted()['update:modelValue']).toEqual([[['a']]])
  })

  it.each(['click', 'Enter'])('commits an explicit leaf with children via %s', async (action) => {
    const { getByRole, emitted } = render(Cascader, {
      props: {
        options: [
          {
            label: 'Leaf',
            value: 'leaf',
            isLeaf: true,
            children: [{ label: 'Hidden child', value: 'hidden' }]
          }
        ]
      }
    })
    await fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    if (action === 'click') await fireEvent.click(getByRole('option', { name: 'Leaf' }))
    else await fireEvent.keyDown(getByRole('combobox'), { key: 'Enter' })
    expect(emitted()['update:modelValue']).toEqual([[['leaf']]])
    expect(getByRole('combobox')).toHaveTextContent('Leaf')
    expect(getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('commits the first child after opening and entering its column', async () => {
    const { getByRole, emitted } = render(Cascader, {
      props: {
        options: [{ label: 'A', value: 'a', children: [{ label: 'A child', value: 'ac' }] }]
      }
    })
    const trigger = getByRole('combobox')
    await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    await fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    expect
      .soft(trigger)
      .toHaveAttribute('aria-activedescendant', getByRole('option', { name: 'A child' }).id)
    await fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(emitted()['update:modelValue']).toEqual([[['a', 'ac']]])
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('initializes an already open selected path and its active leaf', () => {
    const { getByRole } = render(Cascader, {
      props: {
        options: [{ label: 'A', value: 'a', children: [{ label: 'A child', value: 'ac' }] }],
        defaultOpen: true,
        defaultValue: ['a', 'ac']
      }
    })
    const parent = getByRole('option', { name: 'A' })
    const child = getByRole('option', { name: 'A child' })
    expect(parent).toBeVisible()
    expect(child).toBeVisible()
    expect(parent.parentElement).not.toBe(child.parentElement)
    expect(getByRole('combobox')).toHaveAttribute('aria-activedescendant', child.id)
  })

  it('keeps an active search result after narrowing the query', async () => {
    const { getByRole, emitted } = render(Cascader, {
      props: {
        options: [
          { label: 'Alpha', value: 'a' },
          { label: 'Beta', value: 'b' },
          { label: 'Gamma', value: 'g' }
        ],
        searchable: true
      }
    })
    await fireEvent.click(getByRole('combobox'))
    const input = getByRole('combobox')
    await fireEvent.update(input, 'a')
    await fireEvent.keyDown(input, { key: 'End' })
    expect(input).toHaveAttribute(
      'aria-activedescendant',
      getByRole('option', { name: 'Gamma' }).id
    )
    await fireEvent.update(input, 'Alpha')
    expect
      .soft(input)
      .toHaveAttribute('aria-activedescendant', getByRole('option', { name: 'Alpha' }).id)
    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted()['update:modelValue']).toEqual([[['a']]])
    expect(getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

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
        const model = ref<{ region?: unknown }>({})
        return () =>
          h(
            Form,
            {
              modelValue: model.value,
              'onUpdate:modelValue': (next: { region?: unknown }) => {
                model.value = next
              },
              rules: { region: [{ validator, trigger: 'change' }] }
            },
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

  it('drops an in-flight lazy load when options are replaced', async () => {
    let resolveLoad!: (children: { label: string; value: string; isLeaf?: boolean }[]) => void
    const loadData = () =>
      new Promise<{ label: string; value: string; isLeaf?: boolean }[]>((resolve) => {
        resolveLoad = resolve
      })
    const onChange = vi.fn()
    const props = {
      options: [{ label: 'Parent', value: 'p', isLeaf: false }],
      modelValue: [] as (string | number)[],
      loadData,
      'aria-label': 'Lazy',
      'onUpdate:modelValue': onChange
    }
    const { getByRole, rerender } = render(Cascader, { props })
    await fireEvent.click(getByRole('combobox'))
    await fireEvent.click(getByRole('option', { name: 'Parent' }))
    await rerender({ ...props, options: [{ label: 'Replacement', value: 'p', isLeaf: true }] })
    resolveLoad([])
    await nextTick()
    await nextTick()
    expect(onChange).not.toHaveBeenCalled()
  })
})
