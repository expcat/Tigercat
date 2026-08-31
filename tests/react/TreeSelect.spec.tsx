/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useRef } from 'react'
import { TreeSelect, type TreeSelectRef } from '@expcat/tigercat-react/TreeSelect'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { arSA } from '@expcat/tigercat-core/locales/ar-SA'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils/react'

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
    const user = userEvent.setup()
    const { getByRole, rerender } = render(
      <TreeSelect treeData={treeData} defaultExpandAll aria-label="Team" />
    )
    const trigger = getByRole('combobox')
    expect(trigger).toHaveTextContent('Select an option')
    await user.click(trigger)
    await user.click(getByRole('treeitem', { name: /Apple/ }))
    expect(getByRole('combobox')).toHaveTextContent('Apple')
    rerender(<TreeSelect treeData={treeData} defaultExpandAll aria-label="Team" />)
    expect(getByRole('combobox')).toHaveTextContent('Apple')
  })

  it('expands selected ancestors when opening without defaultExpandAll', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <TreeSelect treeData={treeData} defaultValue="apple" aria-label="Open" />
    )
    await user.click(getByRole('combobox'))
    expect(getByRole('treeitem', { name: /Apple/ })).toBeInTheDocument()
  })

  it('treats empty string as a legal key', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { getByRole, getByLabelText } = render(
      <TreeSelect
        treeData={[
          { key: '', label: 'Blank' },
          { key: 'a', label: 'A' }
        ]}
        clearable
        aria-label="Empty"
        onChange={onChange}
      />
    )
    await user.click(getByRole('combobox'))
    await user.click(getByRole('treeitem', { name: 'Blank' }))
    expect(onChange).toHaveBeenCalledWith('')
    expect(getByRole('combobox')).toHaveTextContent('Blank')
    await user.click(getByLabelText('Clear selection'))
    expect(onChange).toHaveBeenLastCalledWith(undefined)
  })

  it('expands a parent from the chevron button', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = render(
      <TreeSelect treeData={treeData} aria-label="Expand" />
    )
    await user.click(getByRole('combobox'))
    expect(queryByRole('treeitem', { name: /Apple/ })).not.toBeInTheDocument()
    await user.click(getByRole('button', { name: 'Expand' }))
    expect(getByRole('treeitem', { name: /Apple/ })).toBeInTheDocument()
  })

  it('reads FormItem and validates the committed key', async () => {
    const validator = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    const { getByRole, queryByText } = render(
      <Form model={{ team: undefined }} rules={{ team: [{ validator, trigger: 'change' }] }}>
        <FormItem name="team" label="Team">
          <TreeSelect treeData={treeData} defaultExpandAll />
        </FormItem>
      </Form>
    )
    const trigger = getByRole('combobox')
    expect(trigger).toHaveAttribute('id')
    await user.click(trigger)
    expect(queryByText(/required/i)).not.toBeInTheDocument()
    await user.click(getByRole('treeitem', { name: 'Leaf' }))
    await waitFor(() => {
      expect(validator).toHaveBeenCalled()
    })
  })

  it('uses zh-TW labels from the official locale object', async () => {
    const { getByRole, getByText } = render(
      <ConfigProvider locale={zhTW}>
        <TreeSelect treeData={[]} aria-label="TW" />
      </ConfigProvider>
    )
    expect(getByText('請選擇')).toBeInTheDocument()
    fireEvent.click(getByRole('combobox'))
    expect(getByText('暫無結果')).toBeInTheDocument()
  })

  it('enters a child with RTL inline keys', async () => {
    const { getByRole } = render(
      <ConfigProvider locale={arSA}>
        <TreeSelect treeData={treeData} aria-label="RTL" />
      </ConfigProvider>
    )
    const trigger = getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'ArrowLeft' })
    expect(getByRole('treeitem', { name: /Apple/ })).toBeInTheDocument()
  })

  it('closes from Done without selecting a leaf', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<TreeSelect treeData={treeData} aria-label="Done" />)
    await user.click(getByRole('combobox'))
    await user.click(getByRole('button', { name: 'Expand' }))
    await user.click(getByRole('button', { name: 'Done' }))
    expect(getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('marks the tree as multiselectable', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <TreeSelect treeData={treeData} multiple defaultExpandAll aria-label="Multi" />
    )
    await user.click(getByRole('combobox'))
    expect(getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true')
  })

  it('focuses through ref.current.focus()', () => {
    function Probe() {
      const ref = useRef<TreeSelectRef>(null)
      return (
        <>
          <button type="button" onClick={() => ref.current?.focus()}>
            Focus
          </button>
          <TreeSelect ref={ref} treeData={treeData} aria-label="Ref" />
        </>
      )
    }
    const { getByRole } = render(<Probe />)
    fireEvent.click(getByRole('button', { name: 'Focus' }))
    expect(getByRole('combobox')).toHaveFocus()
  })

  it('has no accessibility violations when open with a label', async () => {
    const { container, getByRole } = render(
      <FormItem label="Team">
        <TreeSelect treeData={treeData} defaultExpandAll />
      </FormItem>
    )
    fireEvent.click(getByRole('combobox'))
    await expectNoA11yViolations(container)
  })
})
