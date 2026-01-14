/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Checkbox, CheckboxGroup } from '@tigercat/react'
import {
  expectNoA11yViolations,
  componentSizes,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

describe('Checkbox', () => {
  it('renders checkbox input and label', () => {
    const { container, getByText } = render(<Checkbox>Check me</Checkbox>)
    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
    expect(getByText('Check me')).toBeInTheDocument()
  })

  it.each(componentSizes)('renders %s size', (size) => {
    const { container } = render(<Checkbox size={size}>Checkbox</Checkbox>)
    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
  })

  it('supports disabled', () => {
    const { container } = render(<Checkbox disabled>Disabled</Checkbox>)
    expect(container.querySelector('input[type="checkbox"]')).toBeDisabled()
  })

  it('supports controlled checked', () => {
    const { container } = render(<Checkbox checked>Checked</Checkbox>)
    expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(
      true
    )
  })

  it('supports uncontrolled defaultChecked', () => {
    const { container } = render(<Checkbox defaultChecked>Default</Checkbox>)
    expect((container.querySelector('input[type="checkbox"]') as HTMLInputElement).checked).toBe(
      true
    )
  })

  it('supports indeterminate', async () => {
    const { container } = render(<Checkbox indeterminate>Indeterminate</Checkbox>)
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    await waitFor(() => expect(checkbox.indeterminate).toBe(true))
  })

  it('calls onChange when clicked (non-group)', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const { container } = render(<Checkbox onChange={handleChange}>Checkbox</Checkbox>)

    await user.click(container.querySelector('input[type="checkbox"]')!)
    expect(handleChange).toHaveBeenCalled()
    expect(handleChange.mock.calls[0][0]).toBe(true)
  })

  it('does not call onChange when disabled', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const { container } = render(
      <Checkbox disabled onChange={handleChange}>
        Disabled
      </Checkbox>
    )

    await user.click(container.querySelector('input[type="checkbox"]')!)
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('supports group selection via CheckboxGroup', async () => {
    const user = userEvent.setup()
    const handleGroupChange = vi.fn()
    const { container } = render(
      <CheckboxGroup defaultValue={['apple']} onChange={handleGroupChange}>
        <Checkbox value="apple">Apple</Checkbox>
        <Checkbox value="banana">Banana</Checkbox>
      </CheckboxGroup>
    )

    const inputs = container.querySelectorAll('input[type="checkbox"]')
    expect((inputs[0] as HTMLInputElement).checked).toBe(true)
    expect((inputs[1] as HTMLInputElement).checked).toBe(false)

    await user.click(inputs[1])
    expect(handleGroupChange).toHaveBeenCalledWith(['apple', 'banana'])
  })

  it('works as controlled component', async () => {
    const user = userEvent.setup()

    const TestComponent = () => {
      const [checked, setChecked] = React.useState(false)
      return (
        <Checkbox checked={checked} onChange={(isChecked) => setChecked(isChecked)}>
          Checkbox
        </Checkbox>
      )
    }

    const { container } = render(<TestComponent />)
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checkbox.checked).toBe(false)

    await user.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary'])
    })

    it('supports theme variables', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000'
      })

      render(<Checkbox checked>Themed</Checkbox>)
      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Checkbox>Accessible Checkbox</Checkbox>)
      await expectNoA11yViolations(container)
    })

    it('is focusable', () => {
      const { container } = render(<Checkbox>Checkbox</Checkbox>)
      const checkbox = container.querySelector('input[type="checkbox"]')!
      checkbox.focus()
      expect(checkbox).toHaveFocus()
    })
  })
})
