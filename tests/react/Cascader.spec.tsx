/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useRef } from 'react'
import { Cascader, type CascaderRef } from '@expcat/tigercat-react/Cascader'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { arSA } from '@expcat/tigercat-core/locales/ar-SA'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils/react'

const simpleOptions = [
  {
    label: 'Zhejiang',
    value: 'zhejiang',
    children: [
      {
        label: 'Hangzhou',
        value: 'hangzhou',
        children: [{ label: 'West Lake', value: 'westlake' }]
      },
      { label: 'Ningbo', value: 'ningbo' }
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
    const user = userEvent.setup()
    const { getByRole, rerender } = render(<Cascader options={simpleOptions} aria-label="Region" />)
    const trigger = getByRole('combobox')
    expect(trigger).toHaveTextContent('Select an option')
    await user.click(trigger)
    await user.click(getByRole('option', { name: 'Zhejiang' }))
    await user.click(getByRole('option', { name: 'Hangzhou' }))
    await user.click(getByRole('option', { name: 'West Lake' }))
    expect(getByRole('combobox')).toHaveTextContent('Zhejiang / Hangzhou / West Lake')
    rerender(<Cascader options={simpleOptions} aria-label="Region" />)
    expect(getByRole('combobox')).toHaveTextContent('Zhejiang / Hangzhou / West Lake')
  })

  it('opens from a closed trigger with ArrowDown', async () => {
    const { getByRole } = render(<Cascader options={simpleOptions} aria-label="Keys" />)
    const trigger = getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(getByRole('option', { name: 'Zhejiang' })).toBeInTheDocument()
  })

  it('selects with keyboard without moving focus onto options', async () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <Cascader options={simpleOptions} aria-label="Keys" onChange={onChange} />
    )
    const trigger = getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'ArrowRight' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger).toHaveFocus()
    expect(onChange).toHaveBeenCalled()
  })

  it('expands on hover when expandTrigger is hover and ignores isLeaf true', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = render(
      <Cascader
        options={[
          {
            label: 'Parent',
            value: 'p',
            children: [{ label: 'Child', value: 'c' }]
          },
          {
            label: 'Fake',
            value: 'f',
            isLeaf: true,
            children: [{ label: 'Hidden', value: 'h' }]
          }
        ]}
        expandTrigger="hover"
        aria-label="Hover"
      />
    )
    await user.click(getByRole('combobox'))
    fireEvent.mouseEnter(getByRole('option', { name: 'Parent' }))
    expect(getByRole('option', { name: 'Child' })).toBeInTheDocument()
    fireEvent.mouseEnter(getByRole('option', { name: 'Fake' }))
    expect(queryByRole('option', { name: 'Hidden' })).not.toBeInTheDocument()
  })

  it('keeps defaultSearchValue after open', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <Cascader options={simpleOptions} searchable defaultSearchValue="West" aria-label="Search" />
    )
    await user.click(getByRole('combobox'))
    expect(getByRole('combobox')).toHaveValue('West')
    expect(getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' })).toBeInTheDocument()
  })

  it('reads FormItem and validates the committed path', async () => {
    const validator = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    const { getByRole, queryByText } = render(
      <Form model={{ region: undefined }} rules={{ region: [{ validator, trigger: 'change' }] }}>
        <FormItem name="region" label="Region">
          <Cascader options={simpleOptions} />
        </FormItem>
      </Form>
    )
    const trigger = getByRole('combobox')
    expect(trigger).toHaveAttribute('id')
    await user.click(trigger)
    expect(queryByText(/required/i)).not.toBeInTheDocument()
    await user.click(getByRole('option', { name: 'Jiangsu' }))
    await user.click(getByRole('option', { name: 'Nanjing' }))
    await waitFor(() => {
      expect(validator).toHaveBeenCalled()
    })
  })

  it('uses zh-TW labels from the official locale object', async () => {
    const { getByRole, getByText } = render(
      <ConfigProvider locale={zhTW}>
        <Cascader options={[]} aria-label="TW" />
      </ConfigProvider>
    )
    expect(getByText('請選擇')).toBeInTheDocument()
    fireEvent.click(getByRole('combobox'))
    expect(getByText('暫無結果')).toBeInTheDocument()
  })

  it('swaps column keys in RTL', async () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <ConfigProvider locale={arSA}>
        <Cascader options={simpleOptions} aria-label="RTL" onChange={onChange} />
      </ConfigProvider>
    )
    const trigger = getByRole('combobox')
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: 'ArrowLeft' })
    expect(getByRole('option', { name: 'Hangzhou' })).toBeInTheDocument()
  })

  it('closes from Done without selecting a leaf', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = render(
      <Cascader options={simpleOptions} aria-label="Done" />
    )
    await user.click(getByRole('combobox'))
    await user.click(getByRole('option', { name: 'Zhejiang' }))
    await user.click(getByRole('button', { name: 'Done' }))
    expect(queryByRole('option', { name: 'Hangzhou' })).not.toBeInTheDocument()
    expect(getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('focuses through ref.current.focus()', () => {
    function Probe() {
      const ref = useRef<CascaderRef>(null)
      return (
        <>
          <button type="button" onClick={() => ref.current?.focus()}>
            Focus
          </button>
          <Cascader ref={ref} options={simpleOptions} aria-label="Ref" />
        </>
      )
    }
    const { getByRole } = render(<Probe />)
    fireEvent.click(getByRole('button', { name: 'Focus' }))
    expect(getByRole('combobox')).toHaveFocus()
  })

  it('serializes the current path through a hidden input', () => {
    const { container } = render(
      <Cascader
        options={simpleOptions}
        name="region"
        value={['jiangsu', 'nanjing']}
        aria-label="Named"
      />
    )
    expect(container.querySelector('input[type="hidden"]')).toHaveValue(
      JSON.stringify(['jiangsu', 'nanjing'])
    )
  })

  it('has no accessibility violations when open with a label', async () => {
    const { container, getByRole } = render(
      <FormItem label="Region">
        <Cascader options={simpleOptions} />
      </FormItem>
    )
    fireEvent.click(getByRole('combobox'))
    await expectNoA11yViolations(container)
  })

  it('gives each parent option its own chevron', async () => {
    const user = userEvent.setup()
    const { getByRole, getAllByRole } = render(
      <Cascader options={simpleOptions} aria-label="Chevrons" />
    )
    await user.click(getByRole('combobox'))
    const parents = getAllByRole('option').filter((node) => node.querySelector('svg'))
    expect(parents.length).toBeGreaterThanOrEqual(2)
  })

  it('keeps search input in the trigger so scrolling the list does not hide it', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <Cascader options={simpleOptions} searchable aria-label="Scroll" />
    )
    await user.click(getByRole('combobox'))
    expect(getByRole('combobox').tagName).toBe('INPUT')
  })
})
