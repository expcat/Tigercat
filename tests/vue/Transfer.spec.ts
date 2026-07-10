/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Transfer } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

const dataSource = [
  { key: '1', label: 'Item 1' },
  { key: '2', label: 'Item 2' },
  { key: '3', label: 'Item 3' },
  { key: '4', label: 'Item 4' },
  { key: '5', label: 'Item 5', disabled: true }
]

describe('Transfer', () => {
  describe('Rendering', () => {
    it('should render two panels', () => {
      const { container } = render(Transfer, {
        props: { dataSource }
      })

      const panels = container.querySelectorAll('[role="group"]')
      expect(panels.length).toBe(2)
    })
    it('should render items in source panel', () => {
      const { getByText } = render(Transfer, {
        props: { dataSource }
      })

      expect(getByText('Item 1')).toBeInTheDocument()
      expect(getByText('Item 2')).toBeInTheDocument()
    })
  })

  describe('Transfer operations', () => {
    it('should move items to target on right arrow click', async () => {
      const { container, getByText, getByLabelText, emitted } = render(Transfer, {
        props: { dataSource }
      })

      // Select item 1
      const checkbox = container.querySelector('input[type="checkbox"]')!
      await fireEvent.update(checkbox, true)

      // Click move right
      const moveRightBtn = getByLabelText('Move selected to target')
      await fireEvent.click(moveRightBtn)

      expect(emitted()['update:modelValue']).toBeTruthy()
    })

    it('should disable move buttons when no items selected', () => {
      const { getByLabelText } = render(Transfer, {
        props: { dataSource }
      })

      const moveRight = getByLabelText('Move selected to target')
      const moveLeft = getByLabelText('Move selected to source')

      expect(moveRight).toBeDisabled()
      expect(moveLeft).toBeDisabled()
    })
  })

  describe('Search', () => {
    it('should show search inputs when searchable is true', () => {
      const { container } = render(Transfer, {
        props: { dataSource, searchable: true }
      })

      const searchInputs = container.querySelectorAll('input[type="text"]')
      expect(searchInputs.length).toBe(2)
    })

    it('should filter items by search query', async () => {
      const { container, queryByText } = render(Transfer, {
        props: { dataSource, searchable: true }
      })

      const searchInput = container.querySelector('input[type="text"]')!
      await fireEvent.update(searchInput, 'Item 1')

      // Only Item 1 should be visible in source
      const listbox = container.querySelectorAll('[role="listbox"]')[0]
      const options = listbox.querySelectorAll('[role="option"]')
      expect(options.length).toBe(1)
    })
  })

  describe('Disabled', () => {
    it('should disable all checkboxes when disabled', () => {
      const { container } = render(Transfer, {
        props: { dataSource, disabled: true }
      })

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      checkboxes.forEach((cb) => {
        expect(cb).toBeDisabled()
      })
    })

    it('should not allow selecting disabled items', async () => {
      const { getByText } = render(Transfer, {
        props: { dataSource }
      })

      // Item 5 is disabled
      const item5Label = getByText('Item 5').closest('label')!
      const checkbox = item5Label.querySelector('input[type="checkbox"]')!
      expect(checkbox).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA structure', () => {
      const { container, getByLabelText } = render(Transfer, {
        props: { dataSource }
      })

      expect(container.querySelectorAll('[role="group"]').length).toBe(2)
      expect(container.querySelectorAll('[role="listbox"]').length).toBe(2)
      expect(getByLabelText('Move selected to target')).toBeInTheDocument()
      expect(getByLabelText('Move selected to source')).toBeInTheDocument()
    })

    it('should have no accessibility violations', async () => {
      const { container } = render(Transfer)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
