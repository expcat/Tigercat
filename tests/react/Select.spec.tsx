/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Select } from '@expcat/tigercat-react'
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

const testOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' }
]

const groupedOptions = [
  {
    label: 'Group A',
    options: [
      { label: 'A-1', value: 'a1' },
      { label: 'A-2', value: 'a2' }
    ]
  }
]

const optionsWithDisabledFirst = [
  { label: 'Disabled', value: 'd', disabled: true },
  { label: 'Enabled', value: 'e' }
]

describe('Select', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Select options={testOptions} />)

      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      const { getByText } = render(<Select options={testOptions} placeholder="Select an option" />)

      expect(getByText('Select an option')).toBeInTheDocument()
    })

    it('should render with selected value', () => {
      const { getByText } = render(<Select options={testOptions} value="1" />)

      expect(getByText('Option 1')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(<Select options={testOptions} className="custom-class" />)

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    it.each(componentSizes)('should render %s size correctly', (size) => {
      const { container } = render(<Select options={testOptions} size={size} />)

      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()
    })

    it('should be disabled when disabled prop is true', () => {
      const { container } = render(<Select options={testOptions} disabled />)

      const trigger = container.querySelector('button')
      expect(trigger).toBeDisabled()
    })

    it('should show clear control when value is set', () => {
      const { container } = render(<Select options={testOptions} value="1" clearable />)

      expect(container.querySelector('[data-tiger-select-clear]')).toBeInTheDocument()
    })
  })

  describe('Events', () => {
    it('should call onChange when option selected', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container, getByText } = render(
        <Select options={testOptions} onChange={handleChange} />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      await user.click(getByText('Option 1'))

      expect(handleChange).toHaveBeenCalledWith('1')
    })

    it('should not open dropdown when disabled', async () => {
      const user = userEvent.setup()
      const { container, queryByText } = render(<Select options={testOptions} disabled />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      expect(queryByText('Option 1')).not.toBeInTheDocument()
    })

    it('should call onChange with array in multiple mode', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container, getByText } = render(
        <Select options={testOptions} multiple value={[]} onChange={handleChange} />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)
      await user.click(getByText('Option 1'))

      expect(handleChange).toHaveBeenCalledWith(['1'])
    })

    it('should clear selection without opening dropdown (single)', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container, queryByRole } = render(
        <Select options={testOptions} value="1" onChange={handleChange} />
      )

      const clear = container.querySelector('[data-tiger-select-clear]') as HTMLElement
      expect(clear).toBeInTheDocument()

      await user.click(clear)

      expect(handleChange).toHaveBeenCalledWith(undefined)
      expect(queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('should clear selection (multiple)', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(
        <Select options={testOptions} multiple value={['1']} onChange={handleChange} />
      )

      const clear = container.querySelector('[data-tiger-select-clear]') as HTMLElement
      await user.click(clear)
      expect(handleChange).toHaveBeenCalledWith([])
    })
  })

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [value, setValue] = React.useState<string | undefined>()

        return <Select options={testOptions} value={value} onChange={(val) => setValue(val)} />
      }

      const { container, getByText } = render(<TestComponent />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)
      await user.click(getByText('Option 1'))

      await waitFor(() => {
        expect(getByText('Option 1')).toBeInTheDocument()
      })
    })
  })

  describe('Dropdown', () => {
    it('should close dropdown when option selected (single mode)', async () => {
      const user = userEvent.setup()
      const { container, getByText, queryByText } = render(<Select options={testOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)
      await user.click(getByText('Option 1'))

      await waitFor(() => {
        expect(queryByText('Option 2')).not.toBeInTheDocument()
      })
    })

    it('should render option groups', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(<Select options={groupedOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      expect(getByText('Group A')).toBeInTheDocument()
      expect(getByText('A-1')).toBeInTheDocument()
    })

    it('should call onSearch and filter options when searchable', async () => {
      const user = userEvent.setup()
      const onSearch = vi.fn()
      const { container, getByText, queryByText } = render(
        <Select options={testOptions} searchable onSearch={onSearch} />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const input = container.querySelector('input')!
      await user.type(input, 'Option 2')

      expect(onSearch).toHaveBeenCalled()
      expect(getByText('Option 2')).toBeInTheDocument()
      expect(queryByText('Option 1')).not.toBeInTheDocument()
    })
  })

  describe('Keyboard Interaction', () => {
    it('should open with ArrowDown and select active option with Enter', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container, getByRole, queryByText } = render(
        <Select options={testOptions} onChange={handleChange} />
      )

      const trigger = container.querySelector('button')!
      trigger.focus()
      expect(trigger).toHaveFocus()

      await user.keyboard('{ArrowDown}')

      const firstOption = await waitFor(() => getByRole('option', { name: 'Option 1' }))
      await waitFor(() => {
        expect(firstOption).toHaveFocus()
      })

      await user.keyboard('{Enter}')
      expect(handleChange).toHaveBeenCalledWith('1')

      await waitFor(() => {
        expect(queryByText('Option 2')).not.toBeInTheDocument()
        expect(trigger).toHaveFocus()
      })
    })

    it('should close with Escape and return focus to trigger', async () => {
      const user = userEvent.setup()
      const { container, getByText, queryByText } = render(<Select options={testOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)
      expect(getByText('Option 1')).toBeInTheDocument()

      await user.keyboard('{Escape}')

      await waitFor(() => {
        expect(queryByText('Option 1')).not.toBeInTheDocument()
        expect(trigger).toHaveFocus()
      })
    })

    it('should move focus from search input to options with ArrowDown when searchable', async () => {
      const user = userEvent.setup()
      const { container, getByRole } = render(<Select options={testOptions} searchable />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const input = container.querySelector('input')!
      await waitFor(() => {
        expect(input).toHaveFocus()
      })

      await user.keyboard('{ArrowDown}')
      const firstOption = getByRole('option', { name: 'Option 1' })

      await waitFor(() => {
        expect(firstOption).toHaveFocus()
      })
    })

    it('should skip disabled options when opening with ArrowDown', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container, getByRole } = render(
        <Select options={optionsWithDisabledFirst} onChange={handleChange} />
      )

      const trigger = container.querySelector('button')!
      trigger.focus()
      await user.keyboard('{ArrowDown}')

      const enabledOption = await waitFor(() => getByRole('option', { name: 'Enabled' }))

      await waitFor(() => {
        expect(enabledOption).toHaveFocus()
      })

      await user.keyboard('{Enter}')
      expect(handleChange).toHaveBeenCalledWith('e')
    })
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000'
      })

      const { container } = render(<Select options={testOptions} />)

      const trigger = container.querySelector('button')
      expect(trigger).toBeInTheDocument()

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Select options={testOptions} placeholder="Select option" />)

      await expectNoA11yViolations(container)
    })

    it('should have proper button element', () => {
      const { container } = render(<Select options={testOptions} />)

      const trigger = container.querySelector('button')
      expect(trigger).toHaveAttribute('type', 'button')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const { container } = render(<Select options={testOptions} />)

      const trigger = container.querySelector('button')!
      await user.tab()

      expect(trigger).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('should display noDataText when options array is empty', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(
        <Select options={[]} noDataText="No data available" />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      expect(getByText('No data available')).toBeInTheDocument()
    })

    it('should display noOptionsText when search returns no results', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(
        <Select options={testOptions} searchable noOptionsText="No matches found" />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const input = container.querySelector('input')!
      await user.type(input, 'xyz')

      expect(getByText('No matches found')).toBeInTheDocument()
    })

    it('should handle long option text with truncation', () => {
      const longOptions = [
        { label: 'This is a very long option text that should be truncated', value: 'long' }
      ]

      const { getByText } = render(<Select options={longOptions} value="long" />)

      expect(
        getByText('This is a very long option text that should be truncated')
      ).toBeInTheDocument()
    })

    it('should handle disabled options in groups', async () => {
      const user = userEvent.setup()
      const groupWithDisabled = [
        {
          label: 'Group B',
          options: [
            { label: 'B-1', value: 'b1', disabled: true },
            { label: 'B-2', value: 'b2' }
          ]
        }
      ]

      const { container, getByText } = render(<Select options={groupWithDisabled} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const disabledOption = getByText('B-1').closest('[role="option"]')
      expect(disabledOption).toHaveAttribute('aria-disabled', 'true')
    })

    it('should not show clear button when clearable is false', () => {
      const { container } = render(<Select options={testOptions} value="1" clearable={false} />)

      expect(container.querySelector('[data-tiger-select-clear]')).not.toBeInTheDocument()
    })

    it('should handle multiple selection with all options selected', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(
        <Select options={testOptions} multiple value={['1', '2', '3']} />
      )

      const trigger = container.querySelector('button')!
      expect(getByText('Option 1, Option 2, Option 3')).toBeInTheDocument()

      await user.click(trigger)
      const selectedOptions = container.querySelectorAll('[role="option"][aria-selected="true"]')
      expect(selectedOptions.length).toBe(3)
    })

    it('should display multiple selected values as comma-separated text', () => {
      const { getByText } = render(<Select options={testOptions} multiple value={['1', '2']} />)

      expect(getByText('Option 1, Option 2')).toBeInTheDocument()
    })

    it('should handle large number of options', async () => {
      const user = userEvent.setup()
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `${i + 1}`
      }))

      const { container, getByText } = render(<Select options={manyOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      expect(getByText('Option 1')).toBeInTheDocument()
      expect(getByText('Option 100')).toBeInTheDocument()
    })
  })

  describe('Additional Keyboard Navigation', () => {
    it('should navigate up with ArrowUp key', async () => {
      const user = userEvent.setup()
      const { container, getByRole } = render(<Select options={testOptions} />)

      const trigger = container.querySelector('button')!
      trigger.focus()

      await user.keyboard('{ArrowUp}')

      await waitFor(() => {
        const listbox = getByRole('listbox')
        expect(listbox).toBeInTheDocument()
      })
    })

    it('should select option with Space key', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container, getByRole } = render(
        <Select options={testOptions} onChange={handleChange} />
      )

      const trigger = container.querySelector('button')!
      trigger.focus()

      await user.keyboard(' ')

      const firstOption = await waitFor(() => getByRole('option', { name: 'Option 1' }))
      await waitFor(() => {
        expect(firstOption).toHaveFocus()
      })

      await user.keyboard(' ')
      expect(handleChange).toHaveBeenCalledWith('1')
    })

    it('should close dropdown with Tab key', async () => {
      const user = userEvent.setup()
      const { container, getByText, queryByText } = render(<Select options={testOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      await waitFor(() => {
        expect(getByText('Option 1')).toBeInTheDocument()
      })

      await user.keyboard('{Tab}')

      await waitFor(() => {
        expect(queryByText('Option 1')).not.toBeInTheDocument()
      })
    })

    it('should navigate to first option with Home key', async () => {
      const user = userEvent.setup()
      const { container, getByRole } = render(<Select options={testOptions} value="3" />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const lastOption = await waitFor(() => getByRole('option', { name: 'Option 3' }))
      await waitFor(() => {
        expect(lastOption).toHaveFocus()
      })

      await user.keyboard('{Home}')

      const firstOption = getByRole('option', { name: 'Option 1' })
      await waitFor(() => {
        expect(firstOption).toHaveFocus()
      })
    })

    it('should navigate to last option with End key', async () => {
      const user = userEvent.setup()
      const { container, getByRole } = render(<Select options={testOptions} value="1" />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const firstOption = await waitFor(() => getByRole('option', { name: 'Option 1' }))
      await waitFor(() => {
        expect(firstOption).toHaveFocus()
      })

      await user.keyboard('{End}')

      const lastOption = getByRole('option', { name: 'Option 3' })
      await waitFor(() => {
        expect(lastOption).toHaveFocus()
      })
    })
  })

  describe('Dropdown Behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      const { container, getByText, queryByText } = render(<Select options={testOptions} />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      await waitFor(() => {
        expect(getByText('Option 1')).toBeInTheDocument()
      })

      await user.click(document.body)

      await waitFor(() => {
        expect(queryByText('Option 1')).not.toBeInTheDocument()
      })
    })

    it('should keep dropdown open in multiple mode after selection', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(
        <Select options={testOptions} multiple value={[]} />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      await user.click(getByText('Option 1'))

      await waitFor(() => {
        expect(getByText('Option 2')).toBeInTheDocument()
      })
    })

    it('should focus search input when dropdown opens with searchable', async () => {
      const user = userEvent.setup()
      const { container } = render(<Select options={testOptions} searchable />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const input = container.querySelector('input')!
      await waitFor(() => {
        expect(input).toHaveFocus()
      })
    })
  })

  describe('Multiple Selection Features', () => {
    it('should toggle selection in multiple mode', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { getByRole } = render(
        <Select options={testOptions} multiple value={['1']} onChange={handleChange} />
      )

      const trigger = getByRole('button')
      await user.click(trigger)

      const option1 = getByRole('option', { name: 'Option 1' })
      await user.click(option1)
      expect(handleChange).toHaveBeenCalledWith([])

      const option2 = getByRole('option', { name: 'Option 2' })
      await user.click(option2)
      expect(handleChange).toHaveBeenCalledWith(['1', '2'])
    })

    it('should show check icon for selected items in multiple mode', async () => {
      const user = userEvent.setup()
      const { container, getByRole } = render(
        <Select options={testOptions} multiple value={['1', '2']} />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const option1 = getByRole('option', { name: 'Option 1' })
      const option2 = getByRole('option', { name: 'Option 2' })
      const option3 = getByRole('option', { name: 'Option 3' })

      expect(option1).toHaveAttribute('aria-selected', 'true')
      expect(option2).toHaveAttribute('aria-selected', 'true')
      expect(option3).toHaveAttribute('aria-selected', 'false')
    })
  })

  describe('Search Functionality', () => {
    it('should filter options case-insensitively', async () => {
      const user = userEvent.setup()
      const { container, getByText, queryByText } = render(
        <Select options={testOptions} searchable />
      )

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const input = container.querySelector('input')!
      await user.type(input, 'option 1')

      expect(getByText('Option 1')).toBeInTheDocument()
      expect(queryByText('Option 2')).not.toBeInTheDocument()
    })

    it('should reset search query when dropdown closes', async () => {
      const user = userEvent.setup()
      const { container, getByText } = render(<Select options={testOptions} searchable />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const input = container.querySelector('input')!
      await user.type(input, 'Option 1')

      await user.click(getByText('Option 1'))

      await user.click(trigger)

      const inputAfterReopen = container.querySelector('input')!
      expect(inputAfterReopen.value).toBe('')
      expect(getByText('Option 2')).toBeInTheDocument()
    })

    it('should allow Space key in search input without closing dropdown', async () => {
      const user = userEvent.setup()
      const { container, queryByRole } = render(<Select options={testOptions} searchable />)

      const trigger = container.querySelector('button')!
      await user.click(trigger)

      const input = container.querySelector('input')!
      await user.type(input, 'Option 1')

      await user.keyboard(' ')

      // Dropdown should still be open
      const listbox = queryByRole('listbox')
      expect(listbox).toBeInTheDocument()
    })
  })
})
