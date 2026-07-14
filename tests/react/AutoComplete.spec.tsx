/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { AutoComplete } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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

      expect(document.body.querySelector('[role="listbox"]')).toBeInTheDocument()
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
    it('should show not found text', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(
        <AutoComplete options={options} emptyText="Nothing found" />
      )

      const input = container.querySelector('input')!
      await user.click(input)
      await user.clear(input)
      await user.type(input, 'xyz nonexistent')

      expect(getByText('Nothing found')).toBeInTheDocument()
    })
  })

  describe('Clear', () => {
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
  })

  describe('Keyboard', () => {
    it('should open on ArrowDown', async () => {
      const user = userEvent.setup()
      const { container } = render(<AutoComplete options={options} />)

      const input = container.querySelector('input')!
      act(() => {
        input.focus()
      })
      await user.keyboard('{ArrowDown}')

      expect(document.body.querySelector('[role="listbox"]')).toBeInTheDocument()
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
    it('should have no accessibility violations', async () => {
      const { container } = render(<AutoComplete />)
      await expectNoA11yViolationsIsolated(container)
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

      const opts = document.body.querySelectorAll('[role="option"]')
      expect(opts.length).toBe(4)
    })
  })
})
