/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Transfer } from '@expcat/tigercat-vue'

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

    it('should show source and target titles', () => {
      const { getByText } = render(Transfer, {
        props: { dataSource, sourceTitle: 'Available', targetTitle: 'Selected' }
      })

      expect(getByText(/Available/)).toBeInTheDocument()
      expect(getByText(/Selected/)).toBeInTheDocument()
    })

    it('should render items in source panel', () => {
      const { getByText } = render(Transfer, {
        props: { dataSource }
      })

      expect(getByText('Item 1')).toBeInTheDocument()
      expect(getByText('Item 2')).toBeInTheDocument()
    })

    it('should split items by target keys', () => {
      const { getAllByRole } = render(Transfer, {
        props: { dataSource, modelValue: ['1', '2'] }
      })

      const panels = getAllByRole('listbox')
      // Source: 3 items (3, 4, 5)
      expect(panels[0].querySelectorAll('[role="option"]').length).toBe(3)
      // Target: 2 items (1, 2)
      expect(panels[1].querySelectorAll('[role="option"]').length).toBe(2)
    })
  })

  describe('Transfer operations', () => {
    it('should move items to target on right arrow click', async () => {
      const { container, getByText, getByLabelText, emitted } = render(Transfer, {
        props: { dataSource }
      })

      // Select item 1
      const checkbox = container.querySelector('input[type="checkbox"]')!
      await fireEvent.change(checkbox, { target: { checked: true } })

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
    it('should show search inputs when showSearch is true', () => {
      const { container } = render(Transfer, {
        props: { dataSource, showSearch: true }
      })

      const searchInputs = container.querySelectorAll('input[type="text"]')
      expect(searchInputs.length).toBe(2)
    })

    it('should filter items by search query', async () => {
      const { container, queryByText } = render(Transfer, {
        props: { dataSource, showSearch: true }
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
    it('should have group role on panels', () => {
      const { container } = render(Transfer, {
        props: { dataSource }
      })

      const groups = container.querySelectorAll('[role="group"]')
      expect(groups.length).toBe(2)
    })

    it('should have listbox role on item lists', () => {
      const { container } = render(Transfer, {
        props: { dataSource }
      })

      const listboxes = container.querySelectorAll('[role="listbox"]')
      expect(listboxes.length).toBe(2)
    })

    it('should have aria-label on operation buttons', () => {
      const { getByLabelText } = render(Transfer, {
        props: { dataSource }
      })

      expect(getByLabelText('Move selected to target')).toBeInTheDocument()
      expect(getByLabelText('Move selected to source')).toBeInTheDocument()
    })
  })
})
