/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { Cascader } from '@expcat/tigercat-vue/Cascader'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

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
  describe('Props', () => {
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

      expect(document.body.querySelector('[role="listbox"]')).toBeInTheDocument()
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

    it('renders clear as a sibling button of the combobox trigger', () => {
      const { container } = render(Cascader, {
        props: {
          options: simpleOptions,
          modelValue: ['zhejiang', 'hangzhou'],
          clearable: true
        }
      })

      const trigger = container.querySelector('[role="combobox"]')!
      const clearBtn = container.querySelector('[data-tiger-cascader-clear]')
      expect(clearBtn).toBeTruthy()
      expect(clearBtn?.tagName).toBe('BUTTON')
      expect(trigger.contains(clearBtn)).toBe(false)
    })
  })

  describe('Search', () => {
    it('should filter options by search query', async () => {
      const { container, getByText, queryByText } = render(Cascader, {
        props: { options: simpleOptions, searchable: true }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      const searchInput = document.body.querySelector('input[aria-label="Search options"]')!
      await fireEvent.update(searchInput, 'West')

      expect(getByText('Zhejiang / Hangzhou / West Lake')).toBeInTheDocument()
      expect(queryByText('Zhong Hua Men')).not.toBeInTheDocument()
    })

    it('should show not found text when no results', async () => {
      const { container, getByText } = render(Cascader, {
        props: {
          options: simpleOptions,
          searchable: true,
          emptyText: 'Nothing found'
        }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)

      const searchInput = document.body.querySelector('input[aria-label="Search options"]')!
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
    it('should open on Enter key', async () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.keyDown(trigger, { key: 'Enter' })

      expect(document.body.querySelector('[role="listbox"]')).toBeInTheDocument()
    })

    it('moves and commits with ArrowDown and Enter on a non-virtual list', async () => {
      const { container, getByText, emitted } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
      await fireEvent.keyDown(trigger, { key: 'Enter' })

      expect(getByText('Hangzhou')).toBeInTheDocument()
      expect(getByText('Ningbo')).toBeInTheDocument()

      await fireEvent.keyDown(trigger, { key: 'ArrowDown' })
      await fireEvent.keyDown(trigger, { key: 'Enter' })

      expect(emitted()['update:modelValue'][0]).toEqual([['zhejiang', 'ningbo']])
      expect(emitted()['change'][0]).toEqual([['zhejiang', 'ningbo']])
    })

    it('skips disabled options when moving with ArrowDown', async () => {
      const { container } = render(Cascader, {
        props: { options: optionsWithDisabled }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      await fireEvent.keyDown(trigger, { key: 'ArrowDown' })

      const activeId = trigger.getAttribute('aria-activedescendant')
      expect(activeId).toBeTruthy()
      const activeEl = document.getElementById(activeId!)
      expect(activeEl?.textContent).toContain('Active')
      expect(activeEl?.textContent).not.toContain('Disabled')
    })

    it('should close on Escape key', async () => {
      const { container } = render(Cascader, {
        props: { options: simpleOptions }
      })

      const trigger = container.querySelector('button')!
      await fireEvent.click(trigger)
      expect(document.body.querySelector('[role="listbox"]')).toBeInTheDocument()

      await fireEvent.keyDown(trigger, { key: 'Escape' })
      expect(document.body.querySelector('[role="listbox"]')).not.toBeInTheDocument()
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(Cascader)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Virtual scrolling', () => {
    const largeOptions = Array.from({ length: 200 }, (_, i) => ({
      label: `Option ${i}`,
      value: i,
      children: [{ label: `Child ${i}`, value: `c-${i}` }]
    }))

    it('renders only a subset of column options when virtual is enabled', async () => {
      const { container, getByText, queryByText } = render(Cascader, {
        props: { options: largeOptions, virtual: true }
      })

      await fireEvent.click(container.querySelector('button')!)

      const virtualList = document.body.querySelector('[data-tiger-cascader-virtual]')
      expect(virtualList).toBeInTheDocument()
      expect(getByText('Option 0')).toBeInTheDocument()
      expect(queryByText('Option 199')).not.toBeInTheDocument()

      const options = document.body.querySelectorAll('[role="option"]')
      expect(options.length).toBeGreaterThan(0)
      expect(options.length).toBeLessThan(50)
    })

    it('does not virtualize by default and still renders a small column fully', async () => {
      const { container, getByText } = render(Cascader, {
        props: { options: simpleOptions }
      })

      await fireEvent.click(container.querySelector('button')!)

      expect(document.body.querySelector('[data-tiger-cascader-virtual]')).not.toBeInTheDocument()
      expect(getByText('Zhejiang')).toBeInTheDocument()
      expect(getByText('Jiangsu')).toBeInTheDocument()
      expect(document.body.querySelectorAll('[role="option"]').length).toBe(2)
    })

    it('keeps a far selected option in the virtual window', async () => {
      const { container, getByText, queryByText } = render(Cascader, {
        props: {
          options: largeOptions,
          virtual: true,
          modelValue: [80, 'c-80']
        }
      })

      await fireEvent.click(container.querySelector('button')!)

      await waitFor(() => {
        expect(getByText('Option 80')).toBeInTheDocument()
      })
      expect(queryByText('Option 0')).not.toBeInTheDocument()
    })

    it('keeps the active option in the window during keyboard navigation', async () => {
      const { container, getByText, queryByText } = render(Cascader, {
        props: { options: largeOptions, virtual: true }
      })

      await fireEvent.click(container.querySelector('button')!)
      const virtualList = document.body.querySelector('[data-tiger-cascader-virtual]')!
      await fireEvent.keyDown(virtualList, { key: 'End' })

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
      const { container, getByText, queryByText } = render(Cascader, {
        props: {
          options: searchOptions,
          virtual: true,
          searchable: { limit: 80 }
        }
      })

      await fireEvent.click(container.querySelector('button')!)
      const searchInput = document.body.querySelector('input[aria-label="Search options"]')!
      await fireEvent.update(searchInput, 'City')

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
      const { container, getByText, queryByText } = render(Cascader, {
        props: {
          options: searchOptions,
          virtual: true,
          searchable: { limit: 80 }
        }
      })

      await fireEvent.click(container.querySelector('button')!)
      const searchInput = document.body.querySelector('input[aria-label="Search options"]')!
      await fireEvent.update(searchInput, 'City')

      await waitFor(() => {
        expect(document.body.querySelector('[data-tiger-cascader-virtual]')).toBeInTheDocument()
      })

      const virtualList = document.body.querySelector('[data-tiger-cascader-virtual]')!
      await fireEvent.keyDown(virtualList, { key: 'End' })

      await waitFor(() => {
        expect(getByText('City 79')).toBeInTheDocument()
      })

      await fireEvent.update(searchInput, 'City 0')

      await waitFor(() => {
        expect(getByText('City 0')).toBeInTheDocument()
      })
      expect(queryByText('City 79')).not.toBeInTheDocument()
    })

    it('still selects a visible option when virtual is enabled', async () => {
      const { container, getByText, emitted } = render(Cascader, {
        props: { options: largeOptions, virtual: true }
      })

      await fireEvent.click(container.querySelector('button')!)
      await fireEvent.click(getByText('Option 0'))
      await fireEvent.click(getByText('Child 0'))

      expect(emitted()['update:modelValue'][0]).toEqual([[0, 'c-0']])
    })
  })
})
