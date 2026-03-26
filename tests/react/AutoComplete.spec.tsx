/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { AutoComplete } from '@expcat/tigercat-react'

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

describe('AutoComplete', () => {
  describe('Rendering', () => {
    it('should render an input element', () => {
      const { container } = render(<AutoComplete options={options} />)

      expect(container.querySelector('input')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      const { container } = render(<AutoComplete options={options} placeholder="Type to search" />)

      const input = container.querySelector('input')
      expect(input?.getAttribute('placeholder')).toBe('Type to search')
    })

    it('should render with initial value', () => {
      const { container } = render(<AutoComplete options={options} value="apple" />)

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('apple')
    })

    it('should apply custom className', () => {
      const { container } = render(<AutoComplete options={options} className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Dropdown', () => {
    it('should open dropdown on focus', async () => {
      const user = userEvent.setup()
      const { container } = render(<AutoComplete options={options} />)

      const input = container.querySelector('input')!
      await user.click(input)

      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('should show filtered options when typing', async () => {
      const user = userEvent.setup()
      const { container, getByText, queryByText } = render(<AutoComplete options={options} />)

      const input = container.querySelector('input')!
      await user.click(input)
      await user.clear(input)
      await user.type(input, 'App')

      expect(getByText('Apple')).toBeInTheDocument()
      expect(queryByText('Banana')).not.toBeInTheDocument()
    })

    it('should select option on click', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const onSelect = vi.fn()
      const { container, getByText } = render(
        <AutoComplete options={options} onChange={onChange} onSelect={onSelect} />
      )

      const input = container.querySelector('input')!
      await user.click(input)
      await user.click(getByText('Apple'))

      expect(onSelect).toHaveBeenCalledWith('apple', options[0])
    })

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(<AutoComplete options={options} />)

      const input = container.querySelector('input')!
      await user.click(input)
      await user.click(getByText('Apple'))

      expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })

    it('should show not found text', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(
        <AutoComplete options={options} notFoundText="Nothing found" />
      )

      const input = container.querySelector('input')!
      await user.click(input)
      await user.clear(input)
      await user.type(input, 'xyz nonexistent')

      expect(getByText('Nothing found')).toBeInTheDocument()
    })
  })

  describe('Clear', () => {
    it('should show clear button when clearable and has value', () => {
      const { container } = render(<AutoComplete options={options} value="test" clearable />)

      expect(container.querySelector('[aria-label="Clear"]')).toBeInTheDocument()
    })

    it('should clear value on click', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container } = render(
        <AutoComplete options={options} value="test" clearable onChange={onChange} />
      )

      const clearBtn = container.querySelector('[aria-label="Clear"]')!
      await user.click(clearBtn)

      expect(onChange).toHaveBeenCalledWith('')
    })
  })

  describe('Disabled', () => {
    it('should disable the input', () => {
      const { container } = render(<AutoComplete options={options} disabled />)

      expect(container.querySelector('input')).toBeDisabled()
    })

    it('should not select disabled options', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      const { container, getByText } = render(
        <AutoComplete options={optionsWithDisabled} onSelect={onSelect} />
      )

      const input = container.querySelector('input')!
      await user.click(input)
      await user.click(getByText('Banana'))

      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard', () => {
    it('should open on ArrowDown', async () => {
      const user = userEvent.setup()
      const { container } = render(<AutoComplete options={options} />)

      const input = container.querySelector('input')!
      input.focus()
      await user.keyboard('{ArrowDown}')

      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('should close on Escape', async () => {
      const user = userEvent.setup()
      const { container } = render(<AutoComplete options={options} />)

      const input = container.querySelector('input')!
      await user.click(input)
      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })

    it('should select on Enter', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      const { container } = render(<AutoComplete options={options} onSelect={onSelect} />)

      const input = container.querySelector('input')!
      await user.click(input)
      await user.keyboard('{Enter}')

      expect(onSelect).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have combobox role', () => {
      const { container } = render(<AutoComplete options={options} />)

      const input = container.querySelector('input')!
      expect(input.getAttribute('role')).toBe('combobox')
      expect(input.getAttribute('aria-expanded')).toBe('false')
      expect(input.getAttribute('aria-haspopup')).toBe('listbox')
    })

    it('should update aria-expanded when open', async () => {
      const user = userEvent.setup()
      const { container } = render(<AutoComplete options={options} />)

      const input = container.querySelector('input')!
      await user.click(input)

      expect(input.getAttribute('aria-expanded')).toBe('true')
    })

    it('should have role=option on each option', async () => {
      const user = userEvent.setup()
      const { container } = render(<AutoComplete options={options} />)

      const input = container.querySelector('input')!
      await user.click(input)

      const opts = container.querySelectorAll('[role="option"]')
      expect(opts.length).toBe(4)
    })
  })

  describe('Filter', () => {
    it('should use custom filter function', async () => {
      const user = userEvent.setup()
      const customFilter = (input: string, option: { label: string }) =>
        option.label.startsWith(input)

      const { container, getByText, queryByText } = render(
        <AutoComplete options={options} filterOption={customFilter} />
      )

      const input = container.querySelector('input')!
      await user.click(input)
      await user.clear(input)
      await user.type(input, 'Ch')

      expect(getByText('Cherry')).toBeInTheDocument()
      expect(queryByText('Apple')).not.toBeInTheDocument()
    })

    it('should not filter when filterOption is false', async () => {
      const user = userEvent.setup()
      const { container } = render(<AutoComplete options={options} filterOption={false} />)

      const input = container.querySelector('input')!
      await user.click(input)
      await user.clear(input)
      await user.type(input, 'xyz')

      const opts = container.querySelectorAll('[role="option"]')
      expect(opts.length).toBe(4)
    })
  })
})
