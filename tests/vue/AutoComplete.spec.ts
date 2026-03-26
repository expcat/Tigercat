/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { AutoComplete } from '@expcat/tigercat-vue'

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
      const { container } = render(AutoComplete, {
        props: { options }
      })

      const input = container.querySelector('input')
      expect(input).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      const { container } = render(AutoComplete, {
        props: { options, placeholder: 'Type to search' }
      })

      const input = container.querySelector('input')
      expect(input?.getAttribute('placeholder')).toBe('Type to search')
    })

    it('should render with initial value', () => {
      const { container } = render(AutoComplete, {
        props: { options, modelValue: 'apple' }
      })

      const input = container.querySelector('input') as HTMLInputElement
      expect(input.value).toBe('apple')
    })
  })

  describe('Dropdown', () => {
    it('should open dropdown on focus', async () => {
      const { container } = render(AutoComplete, {
        props: { options }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)

      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('should show filtered options when typing', async () => {
      const { container, getByText, queryByText } = render(AutoComplete, {
        props: { options }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)
      await fireEvent.update(input, 'App')

      expect(getByText('Apple')).toBeInTheDocument()
      expect(queryByText('Banana')).not.toBeInTheDocument()
    })

    it('should select option on click', async () => {
      const { container, getByText, emitted } = render(AutoComplete, {
        props: { options }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)
      await fireEvent.click(getByText('Apple'))

      expect(emitted()['update:modelValue']).toBeTruthy()
      expect(emitted()['select']).toBeTruthy()
    })

    it('should close dropdown after selection', async () => {
      const { container, getByText } = render(AutoComplete, {
        props: { options }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)
      await fireEvent.click(getByText('Apple'))

      expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })

    it('should show not found text when no matches', async () => {
      const { container, getByText } = render(AutoComplete, {
        props: { options, notFoundText: 'Nothing found' }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)
      await fireEvent.update(input, 'xyz nonexistent')

      expect(getByText('Nothing found')).toBeInTheDocument()
    })
  })

  describe('Clear', () => {
    it('should show clear button when clearable and has value', () => {
      const { container } = render(AutoComplete, {
        props: { options, modelValue: 'test', clearable: true }
      })

      expect(container.querySelector('[aria-label="Clear"]')).toBeInTheDocument()
    })

    it('should clear value on clear click', async () => {
      const { container, emitted } = render(AutoComplete, {
        props: { options, modelValue: 'test', clearable: true }
      })

      const clearBtn = container.querySelector('[aria-label="Clear"]')!
      await fireEvent.click(clearBtn)

      expect(emitted()['update:modelValue']).toBeTruthy()
      const lastEmit = emitted()['update:modelValue']
      expect(lastEmit[lastEmit.length - 1]).toEqual([''])
    })

    it('should not show clear button when not clearable', () => {
      const { container } = render(AutoComplete, {
        props: { options, modelValue: 'test', clearable: false }
      })

      expect(container.querySelector('[aria-label="Clear"]')).not.toBeInTheDocument()
    })
  })

  describe('Disabled', () => {
    it('should disable the input when disabled', () => {
      const { container } = render(AutoComplete, {
        props: { options, disabled: true }
      })

      const input = container.querySelector('input')
      expect(input).toBeDisabled()
    })

    it('should not open dropdown when disabled', async () => {
      const { container } = render(AutoComplete, {
        props: { options, disabled: true }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)

      expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })

    it('should not select disabled options', async () => {
      const { container, getByText, emitted } = render(AutoComplete, {
        props: { options: optionsWithDisabled }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)
      await fireEvent.click(getByText('Banana'))

      expect(emitted()['select']).toBeFalsy()
    })
  })

  describe('Keyboard', () => {
    it('should open on ArrowDown', async () => {
      const { container } = render(AutoComplete, {
        props: { options }
      })

      const input = container.querySelector('input')!
      await fireEvent.keyDown(input, { key: 'ArrowDown' })

      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('should close on Escape', async () => {
      const { container } = render(AutoComplete, {
        props: { options }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)
      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()

      await fireEvent.keyDown(input, { key: 'Escape' })
      expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })

    it('should select on Enter', async () => {
      const { container, emitted } = render(AutoComplete, {
        props: { options, defaultActiveFirstOption: true }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)
      await fireEvent.keyDown(input, { key: 'Enter' })

      expect(emitted()['select']).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have combobox role on input', () => {
      const { container } = render(AutoComplete, {
        props: { options }
      })

      const input = container.querySelector('input')!
      expect(input.getAttribute('role')).toBe('combobox')
      expect(input.getAttribute('aria-expanded')).toBe('false')
      expect(input.getAttribute('aria-haspopup')).toBe('listbox')
    })

    it('should update aria-expanded when open', async () => {
      const { container } = render(AutoComplete, {
        props: { options }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)

      expect(input.getAttribute('aria-expanded')).toBe('true')
    })

    it('should have role=option on each option', async () => {
      const { container } = render(AutoComplete, {
        props: { options }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)

      const opts = container.querySelectorAll('[role="option"]')
      expect(opts.length).toBe(4)
    })
  })

  describe('Filter', () => {
    it('should use custom filter function', async () => {
      const customFilter = (input: string, option: { label: string }) =>
        option.label.startsWith(input)

      const { container, getByText, queryByText } = render(AutoComplete, {
        props: { options, filterOption: customFilter }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)
      await fireEvent.update(input, 'Ch')

      expect(getByText('Cherry')).toBeInTheDocument()
      expect(queryByText('Apple')).not.toBeInTheDocument()
    })

    it('should not filter when filterOption is false', async () => {
      const { container } = render(AutoComplete, {
        props: { options, filterOption: false }
      })

      const input = container.querySelector('input')!
      await fireEvent.focus(input)
      await fireEvent.update(input, 'xyz')

      const opts = container.querySelectorAll('[role="option"]')
      expect(opts.length).toBe(4)
    })
  })
})
