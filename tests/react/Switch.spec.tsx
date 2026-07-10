/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Switch } from '@expcat/tigercat-react'
import {
  expectNoA11yViolationsIsolated,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

describe('Switch', () => {
  const getSwitch = (container: HTMLElement) =>
    container.querySelector('[role="switch"]') as HTMLElement

  describe('Rendering', () => {
    it('renders a switch, unchecked by default', () => {
      const { container } = render(<Switch />)
      const el = getSwitch(container)
      expect(el).toBeInTheDocument()
      expect(el).toHaveAttribute('aria-checked', 'false')
    })

    it('reflects the checked prop via aria-checked', () => {
      const { container, rerender } = render(<Switch checked={false} />)
      expect(getSwitch(container)).toHaveAttribute('aria-checked', 'false')
      rerender(<Switch checked />)
      expect(getSwitch(container)).toHaveAttribute('aria-checked', 'true')
    })

    it('applies custom className', () => {
      const { container } = render(<Switch className="custom-class" />)
      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it.each(componentSizes)('renders %s size', (size) => {
      const { container } = render(<Switch size={size} />)
      expect(getSwitch(container)).toBeInTheDocument()
    })
  })

  describe('Events', () => {
    it.each([
      [false, true],
      [true, false]
    ])('toggles onChange from %s to %s on click', async (checked, expected) => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Switch checked={checked} onChange={handleChange} />)
      await user.click(getSwitch(container))
      expect(handleChange).toHaveBeenCalledWith(expected)
    })

    it.each(['[Space]', '[Enter]'])('toggles onChange when %s is pressed', async (key) => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Switch checked={false} onChange={handleChange} />)
      getSwitch(container).focus()
      await user.keyboard(key)
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('does not call onChange when disabled', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Switch disabled onChange={handleChange} />)
      await user.click(getSwitch(container))
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('does not toggle on unrelated keys', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      const { container } = render(<Switch checked={false} onChange={handleChange} />)
      getSwitch(container).focus()
      await user.keyboard('a')
      await user.keyboard('[Escape]')
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('works as a controlled component', async () => {
      const user = userEvent.setup()
      const TestComponent = () => {
        const [checked, setChecked] = React.useState(false)
        return <Switch checked={checked} onChange={(value) => setChecked(value)} />
      }
      const { container } = render(<TestComponent />)
      const el = getSwitch(container)
      expect(el).toHaveAttribute('aria-checked', 'false')
      await user.click(el)
      expect(el).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('Handler composition', () => {
    it('fires both onClick and onChange', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      const handleChange = vi.fn()
      const { container } = render(
        <Switch checked={false} onClick={handleClick} onChange={handleChange} />
      )
      await user.click(getSwitch(container))
      expect(handleClick).toHaveBeenCalled()
      expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('skips onChange when onClick prevents default', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn((e) => e.preventDefault())
      const handleChange = vi.fn()
      const { container } = render(
        <Switch checked={false} onClick={handleClick} onChange={handleChange} />
      )
      await user.click(getSwitch(container))
      expect(handleClick).toHaveBeenCalled()
      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('States', () => {
    it('marks the disabled state and removes it from the tab order', () => {
      const { container } = render(<Switch disabled />)
      const el = getSwitch(container)
      expect(el).toHaveAttribute('aria-disabled', 'true')
      expect(el).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Switch aria-label="Toggle switch" />)
      await expectNoA11yViolationsIsolated(container)
    })

    it('forwards aria-label and aria-labelledby', () => {
      const { container } = render(<Switch aria-label="Custom label" aria-labelledby="label-id" />)
      const el = getSwitch(container)
      expect(el).toHaveAttribute('aria-label', 'Custom label')
      expect(el).toHaveAttribute('aria-labelledby', 'label-id')
    })
  })
})
