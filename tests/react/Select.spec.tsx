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
})
