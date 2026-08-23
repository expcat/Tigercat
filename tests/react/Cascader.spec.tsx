/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { Cascader } from '@expcat/tigercat-react/Cascader'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
    children: [
      {
        label: 'Nanjing',
        value: 'nanjing',
        children: [{ label: 'Zhong Hua Men', value: 'zhonghuamen' }]
      }
    ]
  }
]

const optionsWithDisabled = [
  {
    label: 'Active',
    value: 'active',
    children: [{ label: 'Child', value: 'child' }]
  },
  {
    label: 'Disabled',
    value: 'disabled',
    disabled: true,
    children: [{ label: 'Blocked', value: 'blocked' }]
  }
]

describe('Cascader', () => {
  describe('Rendering', () => {
    it('should apply custom className', () => {
      const { container } = render(<Cascader options={simpleOptions} className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it('should be disabled when disabled prop is true', () => {
      const { container } = render(<Cascader options={simpleOptions} disabled />)

      const trigger = container.querySelector('button')
      expect(trigger).toBeDisabled()
    })
  })

  describe('Dropdown', () => {
    it('should open dropdown on click', async () => {
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      fireEvent.click(trigger)

      expect(document.body.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('should expand child options on click', async () => {
      const { container, getByText } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      fireEvent.click(trigger)
      fireEvent.click(getByText('Zhejiang'))

      expect(getByText('Hangzhou')).toBeInTheDocument()
      expect(getByText('Ningbo')).toBeInTheDocument()
    })

    it('should select leaf option and close', async () => {
      const onChange = vi.fn()
      const { container, getByText } = render(
        <Cascader options={simpleOptions} onChange={onChange} />
      )

      const trigger = container.querySelector('button')!
      fireEvent.click(trigger)
      fireEvent.click(getByText('Zhejiang'))
      fireEvent.click(getByText('Ningbo'))

      expect(onChange).toHaveBeenCalledWith(['zhejiang', 'ningbo'])
    })
  })

  describe('Clear', () => {
    it('should clear value on clear click', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <Cascader
          options={simpleOptions}
          value={['zhejiang', 'hangzhou']}
          clearable
          onChange={onChange}
        />
      )

      const clearBtn = container.querySelector('[aria-label="Clear selection"]')!
      fireEvent.click(clearBtn)

      expect(onChange).toHaveBeenCalledWith([])
    })
  })

  describe('Search', () => {
    it('should filter options by search query', async () => {
      const { container, getByText } = render(<Cascader options={simpleOptions} searchable />)

      const trigger = container.querySelector('button')!
      fireEvent.click(trigger)

      const searchInput = document.body.querySelector('input[aria-label="Search options"]')!
      fireEvent.change(searchInput, { target: { value: 'West' } })

      expect(getByText('Zhejiang / Hangzhou / West Lake')).toBeInTheDocument()
    })

    it('should show not found text when no results', async () => {
      const { container, getByText } = render(
        <Cascader options={simpleOptions} searchable emptyText="Nothing found" />
      )

      const trigger = container.querySelector('button')!
      fireEvent.click(trigger)

      const searchInput = document.body.querySelector('input[aria-label="Search options"]')!
      fireEvent.change(searchInput, { target: { value: 'xyz nonexistent' } })

      expect(getByText('Nothing found')).toBeInTheDocument()
    })

    it('does not clear controlled searchValue again after the dropdown opens', async () => {
      const onSearchChange = vi.fn()

      function ControlledCascader() {
        const [controlledSearch, setControlledSearch] = React.useState('')
        return (
          <Cascader
            options={simpleOptions}
            searchable
            searchValue={controlledSearch}
            onSearchChange={(nextValue) => {
              onSearchChange(nextValue)
              setControlledSearch(nextValue)
            }}
          />
        )
      }

      const { container } = render(<ControlledCascader />)
      fireEvent.click(container.querySelector('button')!)
      const searchInput = document.body.querySelector<HTMLInputElement>(
        'input[aria-label="Search options"]'
      )!
      fireEvent.change(searchInput, { target: { value: 'West' } })

      await waitFor(() => expect(searchInput.value).toBe('West'))
      expect(onSearchChange).toHaveBeenCalledTimes(2)
      expect(onSearchChange).toHaveBeenNthCalledWith(1, '')
      expect(onSearchChange).toHaveBeenLastCalledWith('West')
    })
  })

  describe('Disabled options', () => {
    it('should not select disabled options', async () => {
      const onChange = vi.fn()
      const { container, getByText } = render(
        <Cascader options={optionsWithDisabled} onChange={onChange} />
      )

      const trigger = container.querySelector('button')!
      fireEvent.click(trigger)
      fireEvent.click(getByText('Disabled'))

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('changeOnSelect', () => {
    it('should call onChange on each level when changeOnSelect is true', async () => {
      const onChange = vi.fn()
      const { container, getByText } = render(
        <Cascader options={simpleOptions} changeOnSelect onChange={onChange} />
      )

      const trigger = container.querySelector('button')!
      fireEvent.click(trigger)
      fireEvent.click(getByText('Zhejiang'))

      expect(onChange).toHaveBeenCalledWith(['zhejiang'])
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA attributes on trigger', () => {
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      expect(trigger.getAttribute('role')).toBe('combobox')
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
      expect(trigger.getAttribute('aria-haspopup')).toBe('listbox')
    })

    it('should update aria-expanded when opened', async () => {
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      fireEvent.click(trigger)

      expect(trigger.getAttribute('aria-expanded')).toBe('true')
    })
    it('should open on Enter key', async () => {
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      trigger.focus()
      fireEvent.keyDown(trigger, { key: 'Enter' })

      expect(document.body.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('should close on Escape key', async () => {
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      fireEvent.click(trigger)
      expect(document.body.querySelector('[role="listbox"]')).toBeInTheDocument()

      fireEvent.keyDown(trigger, { key: 'Escape' })
      expect(document.body.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(<Cascader />)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Virtual scrolling', () => {
    const largeOptions = Array.from({ length: 200 }, (_, i) => ({
      label: `Option ${i}`,
      value: i,
      children: [{ label: `Child ${i}`, value: `c-${i}` }]
    }))

    it('renders only a subset of column options when virtual is enabled', () => {
      const { container, getByText, queryByText } = render(
        <Cascader options={largeOptions} virtual />
      )

      fireEvent.click(container.querySelector('button')!)

      expect(document.body.querySelector('[data-tiger-cascader-virtual]')).toBeInTheDocument()
      expect(getByText('Option 0')).toBeInTheDocument()
      expect(queryByText('Option 199')).not.toBeInTheDocument()

      const options = document.body.querySelectorAll('[role="option"]')
      expect(options.length).toBeGreaterThan(0)
      expect(options.length).toBeLessThan(50)
    })

    it('does not virtualize by default and still renders a small column fully', () => {
      const { container, getByText } = render(<Cascader options={simpleOptions} />)

      fireEvent.click(container.querySelector('button')!)

      expect(document.body.querySelector('[data-tiger-cascader-virtual]')).not.toBeInTheDocument()
      expect(getByText('Zhejiang')).toBeInTheDocument()
      expect(getByText('Jiangsu')).toBeInTheDocument()
      expect(document.body.querySelectorAll('[role="option"]').length).toBe(2)
    })

    it('keeps a far selected option in the virtual window', async () => {
      const { container, getByText, queryByText } = render(
        <Cascader options={largeOptions} virtual value={[80, 'c-80']} />
      )

      fireEvent.click(container.querySelector('button')!)

      await waitFor(() => {
        expect(getByText('Option 80')).toBeInTheDocument()
      })
      expect(queryByText('Option 0')).not.toBeInTheDocument()
    })

    it('keeps the active option in the window during keyboard navigation', async () => {
      const { container, getByText, queryByText } = render(
        <Cascader options={largeOptions} virtual />
      )

      fireEvent.click(container.querySelector('button')!)
      const virtualList = document.body.querySelector('[data-tiger-cascader-virtual]')!
      fireEvent.keyDown(virtualList, { key: 'End' })

      await waitFor(() => {
        expect(getByText('Option 199')).toBeInTheDocument()
      })
      expect(queryByText('Option 0')).not.toBeInTheDocument()
    })

    it('virtualizes the searchable flat path list', async () => {
      const searchOptions = Array.from({ length: 80 }, (_, i) => ({
        label: `City ${i}`,
        value: i
      }))
      const { container, getByText, queryByText } = render(
        <Cascader options={searchOptions} virtual searchable={{ limit: 80 }} />
      )

      fireEvent.click(container.querySelector('button')!)
      const searchInput = document.body.querySelector('input[aria-label="Search options"]')!
      fireEvent.change(searchInput, { target: { value: 'City' } })

      await waitFor(() => {
        expect(document.body.querySelector('[data-tiger-cascader-virtual]')).toBeInTheDocument()
      })
      expect(getByText('City 0')).toBeInTheDocument()
      expect(queryByText('City 79')).not.toBeInTheDocument()
      expect(document.body.querySelectorAll('[role="option"]').length).toBeLessThan(50)
    })

    it('still shows the first matching row after End then a tighter search query', async () => {
      const searchOptions = Array.from({ length: 80 }, (_, i) => ({
        label: `City ${i}`,
        value: i
      }))
      const { container, getByText, queryByText } = render(
        <Cascader options={searchOptions} virtual searchable={{ limit: 80 }} />
      )

      fireEvent.click(container.querySelector('button')!)
      const searchInput = document.body.querySelector('input[aria-label="Search options"]')!
      fireEvent.change(searchInput, { target: { value: 'City' } })

      await waitFor(() => {
        expect(document.body.querySelector('[data-tiger-cascader-virtual]')).toBeInTheDocument()
      })

      const virtualList = document.body.querySelector('[data-tiger-cascader-virtual]')!
      fireEvent.keyDown(virtualList, { key: 'End' })

      await waitFor(() => {
        expect(getByText('City 79')).toBeInTheDocument()
      })

      fireEvent.change(searchInput, { target: { value: 'City 0' } })

      await waitFor(() => {
        expect(getByText('City 0')).toBeInTheDocument()
      })
      expect(queryByText('City 79')).not.toBeInTheDocument()
    })

    it('still selects a visible option when virtual is enabled', () => {
      const onChange = vi.fn()
      const { container, getByText } = render(
        <Cascader options={largeOptions} virtual onChange={onChange} />
      )

      fireEvent.click(container.querySelector('button')!)
      fireEvent.click(getByText('Option 0'))
      fireEvent.click(getByText('Child 0'))

      expect(onChange).toHaveBeenCalledWith([0, 'c-0'])
    })
  })
})
