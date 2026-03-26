/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { TreeSelect } from '@expcat/tigercat-react'

const treeData = [
  {
    key: 'fruits',
    label: 'Fruits',
    children: [
      { key: 'apple', label: 'Apple' },
      { key: 'banana', label: 'Banana' }
    ]
  },
  {
    key: 'vegetables',
    label: 'Vegetables',
    children: [
      { key: 'carrot', label: 'Carrot' },
      { key: 'lettuce', label: 'Lettuce' }
    ]
  },
  { key: 'grain', label: 'Grain' }
]

const treeDataWithDisabled = [
  {
    key: 'a',
    label: 'Node A',
    children: [{ key: 'a1', label: 'Child A1' }]
  },
  {
    key: 'b',
    label: 'Node B',
    disabled: true,
    children: [{ key: 'b1', label: 'Child B1' }]
  }
]

describe('TreeSelect', () => {
  describe('Rendering', () => {
    it('should render with default placeholder', () => {
      const { getByText } = render(<TreeSelect treeData={treeData} />)
      expect(getByText('Please select')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      const { getByText } = render(<TreeSelect treeData={treeData} placeholder="Pick an item" />)
      expect(getByText('Pick an item')).toBeInTheDocument()
    })

    it('should render with selected value label', () => {
      const { getByText } = render(
        <TreeSelect treeData={treeData} value="apple" defaultExpandAll />
      )
      expect(getByText('Apple')).toBeInTheDocument()
    })

    it('should render disabled state', () => {
      const { container } = render(<TreeSelect treeData={treeData} disabled />)
      const button = container.querySelector('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Dropdown', () => {
    it('should open dropdown on click', async () => {
      const user = userEvent.setup()
      const { container, getByRole } = render(<TreeSelect treeData={treeData} />)
      const button = container.querySelector('button')!
      await user.click(button)
      expect(getByRole('listbox')).toBeInTheDocument()
    })

    it('should show root nodes when opened', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(<TreeSelect treeData={treeData} />)
      const button = container.querySelector('button')!
      await user.click(button)
      expect(getByText('Fruits')).toBeInTheDocument()
      expect(getByText('Vegetables')).toBeInTheDocument()
      expect(getByText('Grain')).toBeInTheDocument()
    })

    it('should not open dropdown when disabled', async () => {
      const user = userEvent.setup()
      const { container, queryByRole } = render(<TreeSelect treeData={treeData} disabled />)
      const button = container.querySelector('button')!
      await user.click(button)
      expect(queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should close dropdown on Escape key', async () => {
      const user = userEvent.setup()
      const { container, queryByRole, getByRole } = render(<TreeSelect treeData={treeData} />)
      const button = container.querySelector('button')!
      await user.click(button)
      expect(getByRole('listbox')).toBeInTheDocument()
      await user.keyboard('{Escape}')
      expect(queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Expand/Collapse', () => {
    it('should expand a parent node to show children', async () => {
      const user = userEvent.setup()
      const { container, getByText, queryByText } = render(<TreeSelect treeData={treeData} />)
      const button = container.querySelector('button')!
      await user.click(button)

      // Children not visible initially
      expect(queryByText('Apple')).not.toBeInTheDocument()

      // Click expand toggle on Fruits node
      const fruitsOption = getByText('Fruits').closest('[role="option"]')!
      const expandToggle = fruitsOption.querySelector('span')!
      await user.click(expandToggle)

      expect(getByText('Apple')).toBeInTheDocument()
      expect(getByText('Banana')).toBeInTheDocument()
    })

    it('should expand all nodes when defaultExpandAll is true', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(<TreeSelect treeData={treeData} defaultExpandAll />)
      const button = container.querySelector('button')!
      await user.click(button)

      expect(getByText('Apple')).toBeInTheDocument()
      expect(getByText('Banana')).toBeInTheDocument()
      expect(getByText('Carrot')).toBeInTheDocument()
      expect(getByText('Lettuce')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('should select a leaf node in single mode', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container, getByText, queryByRole } = render(
        <TreeSelect treeData={treeData} defaultExpandAll onChange={onChange} />
      )
      const button = container.querySelector('button')!
      await user.click(button)
      await user.click(getByText('Apple'))

      expect(onChange).toHaveBeenCalledWith('apple')
      // Should close dropdown after single select
      await waitFor(() => {
        expect(queryByRole('listbox')).not.toBeInTheDocument()
      })
    })

    it('should not select a disabled node', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container, getByText } = render(
        <TreeSelect treeData={treeDataWithDisabled} defaultExpandAll onChange={onChange} />
      )
      const button = container.querySelector('button')!
      await user.click(button)
      await user.click(getByText('Node B'))

      expect(onChange).not.toHaveBeenCalled()
    })

    it('should allow multiple selection', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container, getByText, getByRole } = render(
        <TreeSelect treeData={treeData} defaultExpandAll multiple value={[]} onChange={onChange} />
      )
      const button = container.querySelector('button')!
      await user.click(button)
      await user.click(getByText('Apple'))

      expect(onChange).toHaveBeenCalledWith(['apple'])
      // Dropdown stays open in multiple mode
      expect(getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('Clear', () => {
    it('should show clear button when clearable and has value', () => {
      const { container } = render(
        <TreeSelect treeData={treeData} value="apple" clearable defaultExpandAll />
      )
      const clearBtn = container.querySelector('[aria-label="Clear selection"]')
      expect(clearBtn).toBeInTheDocument()
    })

    it('should clear value on clear click', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container } = render(
        <TreeSelect
          treeData={treeData}
          value="apple"
          clearable
          defaultExpandAll
          onChange={onChange}
        />
      )
      const clearBtn = container.querySelector('[aria-label="Clear selection"]')!
      await user.click(clearBtn)

      expect(onChange).toHaveBeenCalledWith(undefined)
    })

    it('should not show clear button when disabled', () => {
      const { container } = render(
        <TreeSelect treeData={treeData} value="apple" clearable disabled />
      )
      const clearBtn = container.querySelector('[aria-label="Clear selection"]')
      expect(clearBtn).not.toBeInTheDocument()
    })
  })

  describe('Search', () => {
    it('should show search input when showSearch is true', async () => {
      const user = userEvent.setup()
      const { container, getByLabelText } = render(<TreeSelect treeData={treeData} showSearch />)
      const button = container.querySelector('button')!
      await user.click(button)

      expect(getByLabelText('Search tree')).toBeInTheDocument()
    })

    it('should filter nodes by search query', async () => {
      const user = userEvent.setup()
      const { container, getByLabelText, queryByText, getByText } = render(
        <TreeSelect treeData={treeData} showSearch />
      )
      const button = container.querySelector('button')!
      await user.click(button)

      const input = getByLabelText('Search tree')
      await user.clear(input)
      await user.type(input, 'Apple')

      expect(getByText('Apple')).toBeInTheDocument()
      expect(queryByText('Carrot')).not.toBeInTheDocument()
    })

    it('should show empty state when search has no results', async () => {
      const user = userEvent.setup()
      const { container, getByLabelText, getByText } = render(
        <TreeSelect treeData={treeData} showSearch />
      )
      const button = container.querySelector('button')!
      await user.click(button)

      const input = getByLabelText('Search tree')
      await user.clear(input)
      await user.type(input, 'zzzznonexistent')

      expect(getByText('No data')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have combobox role on trigger', () => {
      const { getByRole } = render(<TreeSelect treeData={treeData} />)
      const trigger = getByRole('combobox')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('should set aria-expanded correctly', async () => {
      const user = userEvent.setup()
      const { getByRole } = render(<TreeSelect treeData={treeData} />)
      const trigger = getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await user.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('should mark selected option with aria-selected', async () => {
      const user = userEvent.setup()
      const { container } = render(<TreeSelect treeData={treeData} value="grain" />)
      const button = container.querySelector('button')!
      await user.click(button)

      const option = container.querySelector('[role="option"][aria-selected="true"]')
      expect(option).toBeInTheDocument()
      expect(option!.textContent).toContain('Grain')
    })

    it('should open dropdown on Enter key', async () => {
      const user = userEvent.setup()
      const { getByRole } = render(<TreeSelect treeData={treeData} />)
      const trigger = getByRole('combobox')
      trigger.focus()
      await user.keyboard('{Enter}')
      expect(getByRole('listbox')).toBeInTheDocument()
    })
  })
})
