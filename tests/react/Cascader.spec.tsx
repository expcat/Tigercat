/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Cascader } from '@expcat/tigercat-react'
import { componentSizes } from '../utils/react'

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
    it('should render with default props', () => {
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      const { getByText } = render(<Cascader options={simpleOptions} placeholder="Select area" />)

      expect(getByText('Select area')).toBeInTheDocument()
    })

    it('should render with selected value', () => {
      const { getByText } = render(
        <Cascader options={simpleOptions} value={['zhejiang', 'hangzhou', 'westlake']} />
      )

      expect(getByText('Zhejiang / Hangzhou / West Lake')).toBeInTheDocument()
    })

    it('should render with custom separator', () => {
      const { getByText } = render(
        <Cascader options={simpleOptions} value={['zhejiang', 'hangzhou']} separator=" > " />
      )

      expect(getByText('Zhejiang > Hangzhou')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<Cascader options={simpleOptions} className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(<Cascader options={simpleOptions} size={size} />)

      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(<Cascader options={simpleOptions} disabled />)

      const trigger = container.querySelector('button')
      expect(trigger).toBeDisabled()
    })
  })

  describe('Dropdown', () => {
    it('should open dropdown on click', async () => {
      const user = userEvent.setup()
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('should show first level options', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      expect(getByText('Zhejiang')).toBeInTheDocument()
      expect(getByText('Jiangsu')).toBeInTheDocument()
    })

    it('should expand child options on click', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)
      await user.click(getByText('Zhejiang'))

      expect(getByText('Hangzhou')).toBeInTheDocument()
      expect(getByText('Ningbo')).toBeInTheDocument()
    })

    it('should select leaf option and close', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container, getByText } = render(
        <Cascader options={simpleOptions} onChange={onChange} />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)
      await user.click(getByText('Zhejiang'))
      await user.click(getByText('Ningbo'))

      expect(onChange).toHaveBeenCalledWith(['zhejiang', 'ningbo'])
    })

    it('should not open when disabled', async () => {
      const user = userEvent.setup()
      const { container } = render(<Cascader options={simpleOptions} disabled />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })
  })

  describe('Clear', () => {
    it('should show clear button when has value and clearable', () => {
      const { container } = render(
        <Cascader options={simpleOptions} value={['zhejiang', 'hangzhou']} clearable />
      )

      expect(container.querySelector('[aria-label="Clear selection"]')).toBeInTheDocument()
    })

    it('should clear value on clear click', async () => {
      const user = userEvent.setup()
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
      await user.click(clearBtn)

      expect(onChange).toHaveBeenCalledWith([])
    })

    it('should not show clear button when not clearable', () => {
      const { container } = render(
        <Cascader options={simpleOptions} value={['zhejiang']} clearable={false} />
      )

      expect(container.querySelector('[aria-label="Clear selection"]')).not.toBeInTheDocument()
    })
  })

  describe('Search', () => {
    it('should show search input when showSearch is true', async () => {
      const user = userEvent.setup()
      const { container } = render(<Cascader options={simpleOptions} showSearch />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      expect(container.querySelector('input[aria-label="Search options"]')).toBeInTheDocument()
    })

    it('should filter options by search query', async () => {
      const user = userEvent.setup()
      const { container, getByText, queryByText } = render(
        <Cascader options={simpleOptions} showSearch />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const searchInput = container.querySelector('input[aria-label="Search options"]')!
      await user.type(searchInput, 'West')

      expect(getByText('Zhejiang / Hangzhou / West Lake')).toBeInTheDocument()
    })

    it('should show not found text when no results', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(
        <Cascader options={simpleOptions} showSearch notFoundText="Nothing found" />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const searchInput = container.querySelector('input[aria-label="Search options"]')!
      await user.type(searchInput, 'xyz nonexistent')

      expect(getByText('Nothing found')).toBeInTheDocument()
    })
  })

  describe('Disabled options', () => {
    it('should not select disabled options', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container, getByText } = render(
        <Cascader options={optionsWithDisabled} onChange={onChange} />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)
      await user.click(getByText('Disabled'))

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('changeOnSelect', () => {
    it('should call onChange on each level when changeOnSelect is true', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container, getByText } = render(
        <Cascader options={simpleOptions} changeOnSelect onChange={onChange} />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)
      await user.click(getByText('Zhejiang'))

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
      const user = userEvent.setup()
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      expect(trigger.getAttribute('aria-expanded')).toBe('true')
    })

    it('should have role=option on each option', async () => {
      const user = userEvent.setup()
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const options = container.querySelectorAll('[role="option"]')
      expect(options.length).toBeGreaterThan(0)
    })

    it('should open on Enter key', async () => {
      const user = userEvent.setup()
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      trigger.focus()
      await user.keyboard('{Enter}')

      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('should close on Escape key', async () => {
      const user = userEvent.setup()
      const { container } = render(<Cascader options={simpleOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)
      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()

      await user.keyboard('{Escape}')
      expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })
  })
})
