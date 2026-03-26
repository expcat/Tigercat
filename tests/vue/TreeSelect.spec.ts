/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { TreeSelect } from '@expcat/tigercat-vue'

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
      const { getByText } = render(TreeSelect, {
        props: { treeData }
      })
      expect(getByText('Please select')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      const { getByText } = render(TreeSelect, {
        props: { treeData, placeholder: 'Pick an item' }
      })
      expect(getByText('Pick an item')).toBeInTheDocument()
    })

    it('should render with selected value label', () => {
      const { getByText } = render(TreeSelect, {
        props: { treeData, modelValue: 'apple', defaultExpandAll: true }
      })
      expect(getByText('Apple')).toBeInTheDocument()
    })

    it('should render disabled state', () => {
      const { container } = render(TreeSelect, {
        props: { treeData, disabled: true }
      })
      const button = container.querySelector('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Dropdown', () => {
    it('should open dropdown on click', async () => {
      const { container, getByRole } = render(TreeSelect, {
        props: { treeData }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)
      expect(getByRole('listbox')).toBeInTheDocument()
    })

    it('should show root nodes when opened', async () => {
      const { container, getByText } = render(TreeSelect, {
        props: { treeData }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)
      expect(getByText('Fruits')).toBeInTheDocument()
      expect(getByText('Vegetables')).toBeInTheDocument()
      expect(getByText('Grain')).toBeInTheDocument()
    })

    it('should not open dropdown when disabled', async () => {
      const { container, queryByRole } = render(TreeSelect, {
        props: { treeData, disabled: true }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)
      expect(queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should close dropdown on Escape key', async () => {
      const { container, queryByRole, getByRole } = render(TreeSelect, {
        props: { treeData }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)
      expect(getByRole('listbox')).toBeInTheDocument()
      await fireEvent.keyDown(button, { key: 'Escape' })
      expect(queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Expand/Collapse', () => {
    it('should expand a parent node to show children', async () => {
      const { container, getByText, queryByText } = render(TreeSelect, {
        props: { treeData }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)

      // Children should not be visible initially
      expect(queryByText('Apple')).not.toBeInTheDocument()

      // Click expand toggle on the Fruits node
      const fruitsOption = getByText('Fruits').closest('[role="option"]')!
      const expandToggle = fruitsOption.querySelector('span')!
      await fireEvent.click(expandToggle)

      expect(getByText('Apple')).toBeInTheDocument()
      expect(getByText('Banana')).toBeInTheDocument()
    })

    it('should expand all nodes when defaultExpandAll is true', async () => {
      const { container, getByText } = render(TreeSelect, {
        props: { treeData, defaultExpandAll: true }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)

      expect(getByText('Apple')).toBeInTheDocument()
      expect(getByText('Banana')).toBeInTheDocument()
      expect(getByText('Carrot')).toBeInTheDocument()
      expect(getByText('Lettuce')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('should select a leaf node in single mode', async () => {
      const handler = vi.fn()
      const { container, getByText, queryByRole } = render(TreeSelect, {
        props: { treeData, defaultExpandAll: true, 'onUpdate:modelValue': handler }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)
      await fireEvent.click(getByText('Apple'))

      expect(handler).toHaveBeenCalledWith('apple')
      // Should close dropdown after single select
      expect(queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should not select a disabled node', async () => {
      const handler = vi.fn()
      const { container, getByText } = render(TreeSelect, {
        props: {
          treeData: treeDataWithDisabled,
          defaultExpandAll: true,
          'onUpdate:modelValue': handler
        }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)
      await fireEvent.click(getByText('Node B'))

      expect(handler).not.toHaveBeenCalled()
    })

    it('should allow multiple selection', async () => {
      const handler = vi.fn()
      const { container, getByText, getByRole } = render(TreeSelect, {
        props: {
          treeData,
          defaultExpandAll: true,
          multiple: true,
          modelValue: [],
          'onUpdate:modelValue': handler
        }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)

      await fireEvent.click(getByText('Apple'))
      expect(handler).toHaveBeenCalledWith(['apple'])

      // Dropdown stays open in multiple mode
      expect(getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('Clear', () => {
    it('should show clear button when clearable and has value', async () => {
      const { container } = render(TreeSelect, {
        props: {
          treeData,
          modelValue: 'apple',
          clearable: true,
          defaultExpandAll: true
        }
      })
      const clearBtn = container.querySelector('[aria-label="Clear selection"]')
      expect(clearBtn).toBeInTheDocument()
    })

    it('should clear value on clear click', async () => {
      const handler = vi.fn()
      const { container } = render(TreeSelect, {
        props: {
          treeData,
          modelValue: 'apple',
          clearable: true,
          defaultExpandAll: true,
          'onUpdate:modelValue': handler
        }
      })
      const clearBtn = container.querySelector('[aria-label="Clear selection"]')!
      await fireEvent.click(clearBtn)

      expect(handler).toHaveBeenCalledWith(undefined)
    })

    it('should not show clear button when disabled', () => {
      const { container } = render(TreeSelect, {
        props: {
          treeData,
          modelValue: 'apple',
          clearable: true,
          disabled: true
        }
      })
      const clearBtn = container.querySelector('[aria-label="Clear selection"]')
      expect(clearBtn).not.toBeInTheDocument()
    })
  })

  describe('Search', () => {
    it('should show search input when showSearch is true', async () => {
      const { container, getByLabelText } = render(TreeSelect, {
        props: { treeData, showSearch: true }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)

      expect(getByLabelText('Search tree')).toBeInTheDocument()
    })

    it('should filter nodes by search query', async () => {
      const { container, getByLabelText, queryByText, getByText } = render(TreeSelect, {
        props: { treeData, showSearch: true }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)

      const input = getByLabelText('Search tree')
      await fireEvent.update(input, 'Apple')

      expect(getByText('Apple')).toBeInTheDocument()
      // Non-matching leaf nodes should be hidden
      expect(queryByText('Carrot')).not.toBeInTheDocument()
    })

    it('should show empty state when search has no results', async () => {
      const { container, getByLabelText, getByText } = render(TreeSelect, {
        props: { treeData, showSearch: true }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)

      const input = getByLabelText('Search tree')
      await fireEvent.update(input, 'zzzznonexistent')

      expect(getByText('No data')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have combobox role on trigger', () => {
      const { getByRole } = render(TreeSelect, {
        props: { treeData }
      })
      const trigger = getByRole('combobox')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('should set aria-expanded correctly', async () => {
      const { container, getByRole } = render(TreeSelect, {
        props: { treeData }
      })
      const trigger = getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')

      await fireEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('should mark selected option with aria-selected', async () => {
      const { container } = render(TreeSelect, {
        props: { treeData, modelValue: 'grain' }
      })
      const button = container.querySelector('button')!
      await fireEvent.click(button)

      const option = container.querySelector('[role="option"][aria-selected="true"]')
      expect(option).toBeInTheDocument()
      expect(option!.textContent).toContain('Grain')
    })

    it('should open dropdown on Enter key', async () => {
      const { getByRole } = render(TreeSelect, {
        props: { treeData }
      })
      const trigger = getByRole('combobox')
      await fireEvent.keyDown(trigger, { key: 'Enter' })
      expect(getByRole('listbox')).toBeInTheDocument()
    })
  })
})
