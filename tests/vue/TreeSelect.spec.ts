/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { TreeSelect } from '@expcat/tigercat-vue/TreeSelect'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils'

const treeData = [
  {
    key: 'fruits',
    label: 'Fruits',
    children: [
      { key: 'apple', label: 'Apple' },
      { key: 'banana', label: 'Banana' }
    ]
  },
  { key: 'leaf', label: 'Leaf' }
]

describe('TreeSelect', () => {
  it('keeps an uncontrolled selection after choosing a leaf', async () => {
    const { getByRole } = render(TreeSelect, {
      props: { treeData, defaultExpandAll: true, 'aria-label': 'Team' }
    })
    const trigger = getByRole('combobox')
    expect(trigger).toHaveTextContent('Select an option')
    await fireEvent.click(trigger)
    await fireEvent.click(getByRole('treeitem', { name: /Apple/ }))
    expect(getByRole('combobox')).toHaveTextContent('Apple')
  })

  it('expands selected ancestors when opening without defaultExpandAll', async () => {
    const { getByRole } = render(TreeSelect, {
      props: { treeData, defaultValue: 'apple', 'aria-label': 'Open' }
    })
    await fireEvent.click(getByRole('combobox'))
    expect(getByRole('treeitem', { name: /Apple/ })).toBeInTheDocument()
  })

  it('expands a parent from the chevron button', async () => {
    const { getByRole, queryByRole } = render(TreeSelect, {
      props: { treeData, 'aria-label': 'Expand' }
    })
    await fireEvent.click(getByRole('combobox'))
    expect(queryByRole('treeitem', { name: /Apple/ })).not.toBeInTheDocument()
    await fireEvent.click(getByRole('button', { name: 'Expand' }))
    expect(getByRole('treeitem', { name: /Apple/ })).toBeInTheDocument()
  })

  it('reads FormItem and validates the committed key', async () => {
    const validator = vi.fn().mockResolvedValue(undefined)
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(
            Form,
            { model: { team: undefined }, rules: { team: [{ validator, trigger: 'change' }] } },
            {
              default: () =>
                h(
                  FormItem,
                  { name: 'team', label: 'Team' },
                  {
                    default: () => h(TreeSelect, { treeData, defaultExpandAll: true })
                  }
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
    await fireEvent.click(getByRole('treeitem', { name: 'Leaf' }))
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
            {
              default: () => h(TreeSelect, { treeData: [], 'aria-label': 'TW' })
            }
          )
      }
    })
    const { getByRole, getByText } = render(Wrapper)
    expect(getByText('請選擇')).toBeInTheDocument()
    await fireEvent.click(getByRole('combobox'))
    expect(getByText('暫無結果')).toBeInTheDocument()
  })

  it('closes from Done without selecting a leaf', async () => {
    const { getByRole } = render(TreeSelect, {
      props: { treeData, 'aria-label': 'Done' }
    })
    await fireEvent.click(getByRole('combobox'))
    await fireEvent.click(getByRole('button', { name: 'Expand' }))
    await fireEvent.click(getByRole('button', { name: 'Done' }))
    expect(getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('has no accessibility violations when open with a label', async () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(
            FormItem,
            { label: 'Team' },
            {
              default: () => h(TreeSelect, { treeData, defaultExpandAll: true })
            }
          )
      }
    })
    const { container, getByRole } = render(Wrapper)
    await fireEvent.click(getByRole('combobox'))
    await expectNoA11yViolations(container)
  })
})
