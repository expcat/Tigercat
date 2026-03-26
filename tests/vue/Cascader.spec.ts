/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Cascader } from '@expcat/tigercat-vue'
import { renderWithProps, componentSizes } from '../utils'

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
      const { container } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      const { getByText } = render(Cascader, {
        props: {
          options: simpleOptions,
          placeholder: 'Select area'
        }
      })

      expect(getByText('Select area')).toBeInTheDocument()
    })

    it('should render with selected value', () => {
      const { getByText } = render(Cascader, {
        props: {
          options: simpleOptions,
          modelValue: ['zhejiang', 'hangzhou', 'westlake']
        }
      })

      expect(getByText('Zhejiang / Hangzhou / West Lake')).toBeInTheDocument()
    })

    it('should render with custom separator', () => {
      const { getByText } = render(Cascader, {
        props: {
          options: simpleOptions,
          modelValue: ['zhejiang', 'hangzhou'],
          separator: ' > '
        }
      })

      expect(getByText('Zhejiang > Hangzhou')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = renderWithProps(Cascader, {
        options: simpleOptions,
        size
      })

      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions, disabled: true }
      })

      const trigger = container.querySelector('button')
      expect(trigger).toBeDisabled()
    })
  })

  describe('Dropdown', () => {
    it('should open dropdown on click', async () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('should show first level options', async () => {
      const { container, getByText } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      expect(getByText('Zhejiang')).toBeInTheDocument()
      expect(getByText('Jiangsu')).toBeInTheDocument()
    })

    it('should expand child options on click', async () => {
      const { container, getByText } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      await fireEvent.click(getByText('Zhejiang'))

      expect(getByText('Hangzhou')).toBeInTheDocument()
      expect(getByText('Ningbo')).toBeInTheDocument()
    })

    it('should select leaf option and close', async () => {
      const { container, getByText, emitted } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      await fireEvent.click(getByText('Zhejiang'))
      await fireEvent.click(getByText('Ningbo'))

      expect(emitted()['update:modelValue']).toBeTruthy()
      expect(emitted()['update:modelValue'][0]).toEqual([['zhejiang', 'ningbo']])
      expect(emitted()['change'][0]).toEqual([['zhejiang', 'ningbo']])
    })

    it('should not open when disabled', async () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions, disabled: true }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })

    it('should expand on hover when expandTrigger is hover', async () => {
      const { container, getByText } = render(Cascader, {
        props: { options: simpleOptions, expandTrigger: 'hover' }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      const zhejiang = getByText('Zhejiang').closest('[role="option"]')!
      await fireEvent.mouseEnter(zhejiang)

      expect(getByText('Hangzhou')).toBeInTheDocument()
    })
  })

  describe('Clear', () => {
    it('should show clear button when has value and clearable', async () => {
      const { container } = render(Cascader, {
        props: {
          options: simpleOptions,
          modelValue: ['zhejiang', 'hangzhou'],
          clearable: true
        }
      })

      expect(container.querySelector('[aria-label="Clear selection"]')).toBeInTheDocument()
    })

    it('should clear value on clear click', async () => {
      const { container, emitted } = render(Cascader, {
        props: {
          options: simpleOptions,
          modelValue: ['zhejiang', 'hangzhou'],
          clearable: true
        }
      })

      const clearBtn = container.querySelector('[aria-label="Clear selection"]')!
      await fireEvent.click(clearBtn)

      expect(emitted()['update:modelValue'][0]).toEqual([[]])
    })

    it('should not show clear button when not clearable', () => {
      const { container } = render(Cascader, {
        props: {
          options: simpleOptions,
          modelValue: ['zhejiang'],
          clearable: false
        }
      })

      expect(container.querySelector('[aria-label="Clear selection"]')).not.toBeInTheDocument()
    })
  })

  describe('Search', () => {
    it('should show search input when showSearch is true', async () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions, showSearch: true }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      expect(container.querySelector('input[aria-label="Search options"]')).toBeInTheDocument()
    })

    it('should filter options by search query', async () => {
      const { container, getByText, queryByText } = render(Cascader, {
        props: { options: simpleOptions, showSearch: true }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      const searchInput = container.querySelector('input[aria-label="Search options"]')!
      await fireEvent.update(searchInput, 'West')

      expect(getByText('Zhejiang / Hangzhou / West Lake')).toBeInTheDocument()
      expect(queryByText('Zhong Hua Men')).not.toBeInTheDocument()
    })

    it('should show not found text when no results', async () => {
      const { container, getByText } = render(Cascader, {
        props: {
          options: simpleOptions,
          showSearch: true,
          notFoundText: 'Nothing found'
        }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      const searchInput = container.querySelector('input[aria-label="Search options"]')!
      await fireEvent.update(searchInput, 'xyz nonexistent')

      expect(getByText('Nothing found')).toBeInTheDocument()
    })
  })

  describe('Disabled options', () => {
    it('should not select disabled options', async () => {
      const { container, getByText, emitted } = render(Cascader, {
        props: { options: optionsWithDisabled }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      await fireEvent.click(getByText('Disabled'))

      expect(emitted()['update:modelValue']).toBeFalsy()
    })
  })

  describe('changeOnSelect', () => {
    it('should emit on each level when changeOnSelect is true', async () => {
      const { container, getByText, emitted } = render(Cascader, {
        props: { options: simpleOptions, changeOnSelect: true }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      await fireEvent.click(getByText('Zhejiang'))

      expect(emitted()['update:modelValue']).toBeTruthy()
      expect(emitted()['update:modelValue'][0]).toEqual([['zhejiang']])
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA attributes on trigger', () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      expect(trigger.getAttribute('role')).toBe('combobox')
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
      expect(trigger.getAttribute('aria-haspopup')).toBe('listbox')
    })

    it('should update aria-expanded when opened', async () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      expect(trigger.getAttribute('aria-expanded')).toBe('true')
    })

    it('should have role=option on each option', async () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      const options = container.querySelectorAll('[role="option"]')
      expect(options.length).toBeGreaterThan(0)
    })

    it('should open on Enter key', async () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.keyDown(trigger, { key: 'Enter' })

      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('should close on Escape key', async () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      expect(container.querySelector('[role="listbox"]')).toBeInTheDocument()

      await fireEvent.keyDown(trigger, { key: 'Escape' })
      expect(container.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })
  })
})
