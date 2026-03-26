/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Transfer } from '@expcat/tigercat-react'

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
      const { container } = render(<Transfer dataSource={dataSource} />)

      const panels = container.querySelectorAll('[role="group"]')
      expect(panels.length).toBe(2)
    })

    it('should show source and target titles', () => {
      const { getByText } = render(
        <Transfer
          dataSource={dataSource}
          sourceTitle="Available"
          targetTitle="Selected"
        />
      )

      expect(getByText(/Available/)).toBeInTheDocument()
      expect(getByText(/Selected/)).toBeInTheDocument()
    })

    it('should split items by value', () => {
      const { getAllByRole } = render(
        <Transfer dataSource={dataSource} value={['1', '2']} />
      )

      const panels = getAllByRole('listbox')
      expect(panels[0].querySelectorAll('[role="option"]').length).toBe(3)
      expect(panels[1].querySelectorAll('[role="option"]').length).toBe(2)
    })

    it('should apply custom className', () => {
      const { container } = render(
        <Transfer dataSource={dataSource} className="custom-transfer" />
      )

      expect(container.querySelector('.custom-transfer')).toBeInTheDocument()
    })
  })

  describe('Transfer operations', () => {
    it('should move items to target', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      const { container, getByLabelText } = render(
        <Transfer dataSource={dataSource} onChange={onChange} />
      )

      // Select first item
      const firstCheckbox = container.querySelector('input[type="checkbox"]')!
      await user.click(firstCheckbox)

      // Click move right
      const moveRightBtn = getByLabelText('Move selected to target')
      await user.click(moveRightBtn)

      expect(onChange).toHaveBeenCalled()
      const call = onChange.mock.calls[0]
      expect(call[1]).toBe('right')
    })

    it('should disable move buttons when nothing selected', () => {
      const { getByLabelText } = render(<Transfer dataSource={dataSource} />)

      expect(getByLabelText('Move selected to target')).toBeDisabled()
      expect(getByLabelText('Move selected to source')).toBeDisabled()
    })
  })

  describe('Search', () => {
    it('should show search inputs when showSearch', () => {
      const { container } = render(
        <Transfer dataSource={dataSource} showSearch />
      )

      const searchInputs = container.querySelectorAll('input[type="text"]')
      expect(searchInputs.length).toBe(2)
    })

    it('should filter items', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Transfer dataSource={dataSource} showSearch />
      )

      const searchInput = container.querySelector('input[type="text"]')!
      await user.type(searchInput, 'Item 1')

      const listbox = container.querySelectorAll('[role="listbox"]')[0]
      const options = listbox.querySelectorAll('[role="option"]')
      expect(options.length).toBe(1)
    })
  })

  describe('Disabled', () => {
    it('should disable all checkboxes when disabled', () => {
      const { container } = render(
        <Transfer dataSource={dataSource} disabled />
      )

      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      checkboxes.forEach((cb) => {
        expect(cb).toBeDisabled()
      })
    })

    it('should not allow selecting disabled items', () => {
      const { getByText } = render(<Transfer dataSource={dataSource} />)

      const item5Label = getByText('Item 5').closest('label')!
      const checkbox = item5Label.querySelector('input[type="checkbox"]')!
      expect(checkbox).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA structure', () => {
      const { container, getByLabelText } = render(
        <Transfer dataSource={dataSource} />
      )

      expect(container.querySelectorAll('[role="group"]').length).toBe(2)
      expect(container.querySelectorAll('[role="listbox"]').length).toBe(2)
      expect(getByLabelText('Move selected to target')).toBeInTheDocument()
      expect(getByLabelText('Move selected to source')).toBeInTheDocument()
    })
  })
})
