/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { useRef, useState } from 'react'
import { AutoComplete } from '@expcat/tigercat-react/AutoComplete'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils/react'

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
    const { getByRole } = render(<AutoComplete options={options} aria-label="Fruit" />)
    const input = getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-haspopup', 'listbox')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
  })

  it('opens on focus and filters while typing without committing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onSearchChange = vi.fn()
    const { getByRole, getByText, queryByText } = render(
      <AutoComplete
        options={options}
        aria-label="Fruit"
        onChange={onChange}
        onSearchChange={onSearchChange}
      />
    )
    const input = getByRole('combobox')
    await user.click(input)
    expect(getByRole('listbox')).toBeInTheDocument()
    await user.type(input, 'App')
    expect(getByText('Apple')).toBeInTheDocument()
    expect(queryByText('Banana')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
    expect(onSearchChange).toHaveBeenLastCalledWith('App')
    expect(input).toHaveValue('App')
  })

  it('does not rewrite the query to a matching option label while typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Bound() {
      const [value, setValue] = useState<string | number | undefined>()
      return (
        <AutoComplete
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
          options={jumpOptions}
          aria-label="Fruit"
        />
      )
    }
    const { getByRole } = render(<Bound />)
    const input = getByRole('combobox')
    await user.click(input)
    await user.type(input, 'app')
    expect(input).toHaveValue('app')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('commits the option value and shows its label on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const { getByRole } = render(
      <AutoComplete
        options={cityOptions}
        aria-label="City"
        onChange={onChange}
        onSelect={onSelect}
      />
    )
    const input = getByRole('combobox')
    await user.click(input)
    await user.click(getByRole('option', { name: '北京 Beijing' }))
    expect(onSelect).toHaveBeenCalledWith('beijing', cityOptions[0])
    expect(onChange).toHaveBeenCalledWith('beijing')
    expect(input).toHaveValue('北京 Beijing')
  })

  it('keeps typing beijing as beijing until an option is chosen', async () => {
    const user = userEvent.setup()
    function Bound() {
      const [value, setValue] = useState<string | number | undefined>()
      return (
        <AutoComplete value={value} onChange={setValue} options={cityOptions} aria-label="City" />
      )
    }
    const { getByRole } = render(<Bound />)
    const input = getByRole('combobox')
    await user.click(input)
    await user.type(input, 'beijing')
    expect(input).toHaveValue('beijing')
    await user.click(getByRole('option', { name: '北京 Beijing' }))
    expect(input).toHaveValue('北京 Beijing')
  })

  it('uses defaultValue and defaultSearchValue when value is omitted', async () => {
    const user = userEvent.setup()
    const { getByRole, rerender } = render(
      <AutoComplete options={options} defaultValue="apple" aria-label="Fruit" />
    )
    const input = getByRole('combobox')
    expect(input).toHaveValue('Apple')
    await user.click(input)
    expect(getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true')
    rerender(<AutoComplete options={options} defaultValue="apple" aria-label="Fruit" />)
    expect(input).toHaveValue('Apple')
  })

  it('uses defaultSearchValue when unselected', () => {
    const { getByRole } = render(
      <AutoComplete options={options} defaultSearchValue="q" aria-label="Query" />
    )
    expect(getByRole('combobox')).toHaveValue('q')
  })

  it('does not clear the query when options get a new identity while typing', async () => {
    const user = userEvent.setup()
    const { getByRole, rerender } = render(<AutoComplete options={options} aria-label="Fruit" />)
    const input = getByRole('combobox')
    await user.click(input)
    await user.type(input, 'Ch')
    rerender(<AutoComplete options={[...options]} aria-label="Fruit" />)
    expect(input).toHaveValue('Ch')
  })

  it('closes on Tab and reports onOpenChange', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { getByRole, queryByRole } = render(
      <>
        <AutoComplete options={options} aria-label="Fruit" onOpenChange={onOpenChange} />
        <button type="button">Next</button>
      </>
    )
    const input = getByRole('combobox')
    await user.click(input)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(input).toHaveAttribute('aria-expanded', 'true')
    await user.tab()
    await waitFor(() => {
      expect(queryByRole('listbox')).not.toBeInTheDocument()
      expect(input).toHaveAttribute('aria-expanded', 'false')
      expect(getByRole('button', { name: 'Next' })).toHaveFocus()
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('keeps focus on the outside click target and stays closed', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <>
        <AutoComplete options={options} aria-label="Fruit" />
        <button type="button">Outside target</button>
      </>
    )
    await user.click(getByRole('combobox'))
    expect(getByRole('listbox')).toBeInTheDocument()
    const outside = getByRole('button', { name: 'Outside target' })
    await user.click(outside)
    await waitFor(() => {
      expect(getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
      expect(outside).toHaveFocus()
    })
  })

  it('does not commit while typing when allowFreeInput is false and reverts on blur', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { getByRole } = render(
      <>
        <AutoComplete
          options={options}
          defaultValue="apple"
          allowFreeInput={false}
          aria-label="Fruit"
          onChange={onChange}
        />
        <button type="button">Next</button>
      </>
    )
    const input = getByRole('combobox')
    await user.click(input)
    await user.clear(input)
    await user.type(input, 'xyz')
    expect(onChange).not.toHaveBeenCalled()
    await user.tab()
    await waitFor(() => {
      expect(input).toHaveValue('Apple')
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('commits free text on blur when allowFreeInput is true', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { getByRole } = render(
      <>
        <AutoComplete options={options} aria-label="Fruit" onChange={onChange} />
        <button type="button">Next</button>
      </>
    )
    const input = getByRole('combobox')
    await user.click(input)
    await user.type(input, 'kiwi')
    await user.tab()
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('kiwi')
    })
  })

  it('selects the first option on Enter when defaultActiveFirstOption is true', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { getByRole } = render(
      <AutoComplete options={options} aria-label="Fruit" onSelect={onSelect} />
    )
    const input = getByRole('combobox')
    await user.click(input)
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith('apple', options[0])
  })

  it('commits the query on Enter when defaultActiveFirstOption is false', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const { getByRole } = render(
      <AutoComplete
        options={options}
        defaultActiveFirstOption={false}
        aria-label="Fruit"
        onChange={onChange}
        onSelect={onSelect}
      />
    )
    const input = getByRole('combobox')
    await user.click(input)
    await user.type(input, 'kiwi')
    await user.keyboard('{Enter}')
    expect(onSelect).not.toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith('kiwi')
  })

  it('clears once, keeps focus, and emits search change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onSearchChange = vi.fn()
    const { getByRole } = render(
      <AutoComplete
        options={options}
        defaultValue="apple"
        clearable
        aria-label="Fruit"
        onChange={onChange}
        onSearchChange={onSearchChange}
      />
    )
    const input = getByRole('combobox')
    const clear = getByRole('button', { name: 'Clear' })
    await user.click(clear)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(undefined)
    expect(onSearchChange).toHaveBeenCalledWith('')
    expect(input).toHaveFocus()
  })

  it('skips disabled options with the keyboard and does not select them', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const { getByRole } = render(
      <AutoComplete
        options={optionsWithDisabled}
        defaultActiveFirstOption={false}
        aria-label="Fruit"
        onSelect={onSelect}
      />
    )
    const input = getByRole('combobox')
    await user.click(input)
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(getByRole('option', { name: 'Cherry' })).toHaveAttribute('data-active', 'true')
    await user.click(getByRole('option', { name: 'Banana' }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('moves to the first and last enabled options with Home and End', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(
      <AutoComplete options={options} aria-label="Fruit" defaultActiveFirstOption={false} />
    )
    const input = getByRole('combobox')
    await user.click(input)
    await user.keyboard('{End}')
    expect(getByRole('option', { name: 'Date' })).toHaveAttribute('data-active', 'true')
    await user.keyboard('{Home}')
    expect(getByRole('option', { name: 'Apple' })).toHaveAttribute('data-active', 'true')
  })

  it('honors a controlled searchValue', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    const { getByRole } = render(
      <AutoComplete
        options={options}
        searchValue="Ban"
        onSearchChange={onSearchChange}
        aria-label="Fruit"
      />
    )
    const input = getByRole('combobox')
    expect(input).toHaveValue('Ban')
    await user.click(input)
    await user.type(input, 'a')
    expect(onSearchChange).toHaveBeenCalled()
  })

  it('shows loading instead of empty when filterOption is false', async () => {
    const user = userEvent.setup()
    const { getByRole, getByText, queryByRole } = render(
      <AutoComplete options={[]} filterOption={false} loading aria-label="Fruit" />
    )
    await user.click(getByRole('combobox'))
    expect(queryByRole('listbox')).not.toBeInTheDocument()
    expect(getByText('Loading...')).toBeInTheDocument()
  })

  it('does not leave aria-controls pointing at a missing listbox', async () => {
    const user = userEvent.setup()
    const { getByRole } = render(<AutoComplete options={options} aria-label="Fruit" />)
    const input = getByRole('combobox')
    await user.click(input)
    await user.type(input, 'zzzz')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).not.toHaveAttribute('aria-controls')
  })

  it('reads FormItem and validates the committed value', async () => {
    const validator = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    const { getByRole, queryByText } = render(
      <Form model={{ fruit: undefined }} rules={{ fruit: [{ validator, trigger: 'change' }] }}>
        <FormItem name="fruit" label="Fruit">
          <AutoComplete options={options} />
        </FormItem>
      </Form>
    )
    const input = getByRole('combobox')
    expect(input).toHaveAttribute('id')
    await user.click(input)
    expect(queryByText(/required/i)).not.toBeInTheDocument()
    await user.click(getByRole('option', { name: 'Apple' }))
    await waitFor(() => {
      expect(validator.mock.calls.some((call) => call[0] === 'apple')).toBe(true)
    })
  })

  it('focuses through ref.current.focus()', () => {
    function Probe() {
      const ref = useRef<HTMLInputElement>(null)
      return (
        <>
          <button type="button" onClick={() => ref.current?.focus()}>
            Focus
          </button>
          <AutoComplete ref={ref} options={options} aria-label="Ref" />
        </>
      )
    }
    const { getByRole } = render(<Probe />)
    getByRole('button', { name: 'Focus' }).click()
    expect(getByRole('combobox')).toHaveFocus()
  })

  it('uses zh-TW empty and clear labels from the official locale object', async () => {
    const user = userEvent.setup()
    const { getByRole, getByText } = render(
      <ConfigProvider locale={zhTW}>
        <AutoComplete options={options} defaultValue="apple" clearable aria-label="TW" />
      </ConfigProvider>
    )
    expect(getByRole('button', { name: '清除' })).toBeInTheDocument()
    const input = getByRole('combobox')
    await user.click(input)
    await user.clear(input)
    await user.type(input, 'zzzz')
    expect(getByText('暫無結果')).toBeInTheDocument()
  })

  it('has no a11y violations when opened with a name', async () => {
    const { container, getByRole } = render(
      <AutoComplete options={options} aria-label="Accessible autocomplete" />
    )
    await act(async () => {
      getByRole('combobox').focus()
    })
    await expectNoA11yViolations(container)
  })

  it('has no a11y violations when opened with no matches', async () => {
    const user = userEvent.setup()
    const { container, getByRole } = render(
      <AutoComplete options={options} aria-label="Empty autocomplete" />
    )
    await user.click(getByRole('combobox'))
    await user.type(getByRole('combobox'), 'zzzz')
    await expectNoA11yViolations(container)
  })

  it('has no a11y violations inside a labelled FormItem', async () => {
    const { container, getByRole } = render(
      <Form>
        <FormItem name="fruit" label="Fruit">
          <AutoComplete options={options} />
        </FormItem>
      </Form>
    )
    await act(async () => {
      getByRole('combobox').focus()
    })
    await expectNoA11yViolations(container)
  })

  it('uses a custom filter and keeps all options when filterOption is false', async () => {
    const user = userEvent.setup()
    const customFilter = (input: string, option: { label: string }) =>
      option.label.startsWith(input)
    const { getByRole, getByText, queryByText, rerender } = render(
      <AutoComplete options={options} filterOption={customFilter} aria-label="Fruit" />
    )
    const input = getByRole('combobox')
    await user.click(input)
    await user.type(input, 'Ch')
    expect(getByText('Cherry')).toBeInTheDocument()
    expect(queryByText('Apple')).not.toBeInTheDocument()
    rerender(<AutoComplete options={options} filterOption={false} aria-label="Fruit" />)
    await user.clear(input)
    await user.type(input, 'xyz')
    expect(getByRole('listbox').querySelectorAll('[role="option"]')).toHaveLength(4)
  })

  it('disables the input', () => {
    const { getByRole } = render(<AutoComplete options={options} disabled aria-label="Fruit" />)
    expect(getByRole('combobox')).toBeDisabled()
  })
})
