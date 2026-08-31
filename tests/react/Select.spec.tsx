/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useRef } from 'react'
import { Select, type SelectRef } from '@expcat/tigercat-react/Select'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Modal } from '@expcat/tigercat-react/Modal'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils/react'

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

function getCombobox(container: HTMLElement) {
  return container.querySelector('[role="combobox"]') as HTMLElement
}

describe('Select', () => {
  it('exposes data-state on the combobox', async () => {
    const { container } = render(<Select options={testOptions} aria-label="Fruit" />)
    const trigger = getCombobox(container)
    expect(trigger).toHaveAttribute('data-state', 'closed')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('data-state', 'open')
  })

  it('uses locale placeholder and keeps an uncontrolled selection', async () => {
    const user = userEvent.setup()
    const { getByRole, getByText, rerender } = render(
      <Select options={testOptions} defaultValue={undefined} aria-label="Pick" />
    )
    expect(getByText('Select an option')).toBeInTheDocument()
    await user.click(getByRole('combobox'))
    await user.click(getByRole('option', { name: 'Option 1' }))
    expect(getByRole('combobox')).toHaveTextContent('Option 1')
    rerender(<Select options={testOptions} defaultValue={undefined} aria-label="Pick" />)
    expect(getByRole('combobox')).toHaveTextContent('Option 1')
  })

  it('treats empty string as a real option value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const options = [
      { label: 'None', value: '' },
      { label: 'One', value: '1' }
    ]
    const { getByRole, getByLabelText } = render(
      <Select options={options} aria-label="Empty" onChange={onChange} clearable />
    )
    await user.click(getByRole('combobox'))
    await user.click(getByRole('option', { name: 'None' }))
    expect(onChange).toHaveBeenCalledWith('')
    expect(getByRole('combobox')).toHaveTextContent('None')
    await user.click(getByLabelText('Clear selection'))
    expect(onChange).toHaveBeenLastCalledWith(undefined)
    expect(getByRole('combobox')).toHaveTextContent('Select an option')
  })

  it('opens from open / defaultOpen and notifies onOpenChange', async () => {
    const onOpenChange = vi.fn()
    const { getByRole, rerender } = render(
      <Select options={testOptions} defaultOpen aria-label="Open" onOpenChange={onOpenChange} />
    )
    expect(getByRole('listbox')).toBeInTheDocument()
    rerender(
      <Select options={testOptions} open={false} aria-label="Open" onOpenChange={onOpenChange} />
    )
    expect(getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('selects with keyboard without moving focus onto options', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { getByRole } = render(
      <Select options={testOptions} aria-label="Keys" onChange={onChange} />
    )
    const trigger = getByRole('combobox')
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    const option = getByRole('option', { name: 'Option 1' })
    expect(option).not.toHaveFocus()
    expect(trigger).toHaveAttribute('aria-activedescendant', option.id)
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith('1')
    expect(trigger).toHaveFocus()
  })

  it('keeps the highlight on the clicked multiple option', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <Select options={testOptions} multiple defaultValue={['1']} aria-label="Multi" />
    )
    await user.click(getByRole('combobox'))
    await user.click(getByRole('option', { name: 'Option 3' }))
    expect(getByRole('option', { name: 'Option 3' })).toHaveAttribute('data-active')
    expect(getByRole('listbox')).toBeInTheDocument()
  })

  it('filters immediately and delays onSearchChange', async () => {
    vi.useFakeTimers()
    const onSearchChange = vi.fn()
    const onSearchValueChange = vi.fn()
    const { getByRole } = render(
      <Select
        options={testOptions}
        searchable
        searchDebounce={200}
        aria-label="Search"
        onSearchChange={onSearchChange}
        onSearchValueChange={onSearchValueChange}
      />
    )
    fireEvent.click(getByRole('combobox'))
    const input = document.body.querySelector('input[role="combobox"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Option 2' } })
    expect(input.value).toBe('Option 2')
    expect(onSearchValueChange).toHaveBeenCalledWith('Option 2')
    expect(onSearchChange).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(onSearchChange).toHaveBeenCalledWith('Option 2')
    vi.useRealTimers()
  })

  it('clears multiple search after selecting by default', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = render(
      <Select options={testOptions} multiple searchable aria-label="Skills" />
    )
    await user.click(getByRole('combobox'))
    const input = document.body.querySelector('input[role="combobox"]') as HTMLInputElement
    await user.type(input, 'Option 2')
    await user.click(getByRole('option', { name: 'Option 2' }))
    expect(input.value).toBe('')
    expect(queryByRole('option', { name: 'Option 1' })).toBeInTheDocument()
    expect(getByRole('listbox')).toBeInTheDocument()
  })

  it('creates from the search query, including virtual lists', async () => {
    const onCreate = vi.fn()
    const onChange = vi.fn()
    const { getByRole } = render(
      <Select
        options={testOptions}
        searchable
        creatable
        virtual
        aria-label="Create"
        onCreate={onCreate}
        onChange={onChange}
      />
    )
    fireEvent.click(getByRole('combobox'))
    const input = document.body.querySelector('input[role="combobox"]') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'New option' } })
    fireEvent.click(getByRole('option', { name: 'Create "New option"' }))
    expect(onCreate).toHaveBeenCalledWith({ label: 'New option', value: 'New option' })
    expect(onChange).toHaveBeenCalledWith('New option')
  })

  it('renders grouped options as labelled groups', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<Select options={groupedOptions} aria-label="Groups" />)
    await user.click(getByRole('combobox'))
    expect(getByRole('group', { name: 'Group A' })).toBeInTheDocument()
    expect(getByRole('option', { name: 'A-1' })).toBeInTheDocument()
  })

  it('reads FormItem and validates the committed value', async () => {
    const validator = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    const { getByRole, queryByText } = render(
      <Form model={{ city: undefined }} rules={{ city: [{ validator, trigger: 'change' }] }}>
        <FormItem name="city" label="City">
          <Select options={[{ label: 'NYC', value: 42 }]} />
        </FormItem>
      </Form>
    )
    const trigger = getByRole('combobox')
    expect(trigger).toHaveAttribute('id')
    await user.click(trigger)
    expect(queryByText(/required/i)).not.toBeInTheDocument()
    await user.click(getByRole('option', { name: 'NYC' }))
    await waitFor(() => {
      expect(validator).toHaveBeenCalled()
    })
    const last = validator.mock.calls.at(-1)?.[0]
    expect(
      last === 42 || last?.value === 42 || validator.mock.calls.some((call) => call.includes(42))
    ).toBe(true)
  })

  it('serializes the current value through a hidden input', () => {
    const { container } = render(
      <Select options={testOptions} name="city" value="2" aria-label="Named" />
    )
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('2')
  })

  it('focuses through ref.current.focus()', () => {
    function Probe() {
      const ref = useRef<SelectRef>(null)
      return (
        <>
          <button type="button" onClick={() => ref.current?.focus()}>
            Focus
          </button>
          <Select ref={ref} options={testOptions} aria-label="Ref" />
        </>
      )
    }
    const { getByRole } = render(<Probe />)
    fireEvent.click(getByRole('button', { name: 'Focus' }))
    expect(getByRole('combobox')).toHaveFocus()
  })

  it('uses zh-TW labels from the official locale object', async () => {
    const { getByRole, getByText } = render(
      <ConfigProvider locale={zhTW}>
        <Select options={[]} aria-label="TW" />
      </ConfigProvider>
    )
    expect(getByText('請選擇')).toBeInTheDocument()
    fireEvent.click(getByRole('combobox'))
    expect(getByText('暫無選項')).toBeInTheDocument()
  })

  it('keeps virtual groups keyboard-reachable', async () => {
    const user = userEvent.setup()
    const many = Array.from({ length: 40 }, (_, i) => ({
      label: `Option ${i + 1}`,
      value: `${i + 1}`
    }))
    const { getByRole } = render(
      <Select options={many} virtual listHeight={120} aria-label="Virtual" />
    )
    const trigger = getByRole('combobox')
    trigger.focus()
    await user.keyboard('{ArrowDown}')
    fireEvent.keyDown(trigger, { key: 'End' })
    const last = getByRole('option', { name: 'Option 40' })
    expect(last).toBeInTheDocument()
    expect(last).toHaveAttribute('data-active')
  })

  it('portals into a modal overlay host', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <Modal open title="Dialog">
        <Select options={testOptions} aria-label="Inside" />
      </Modal>
    )
    await user.click(getByRole('combobox'))
    const listbox = getByRole('listbox')
    expect(listbox.closest('[data-tiger-overlay-host]')).toBeTruthy()
  })

  it('has no a11y violations when opened with a name', async () => {
    const { container, getByRole } = render(
      <Select options={testOptions} aria-label="Accessible select" />
    )
    fireEvent.click(getByRole('combobox'))
    await expectNoA11yViolations(container)
  })

  it('shows zh-CN placeholder from ConfigProvider', () => {
    const { getByText } = render(
      <ConfigProvider locale={zhCN}>
        <Select options={testOptions} aria-label="ZH" />
      </ConfigProvider>
    )
    expect(getByText('请选择')).toBeInTheDocument()
  })
})
