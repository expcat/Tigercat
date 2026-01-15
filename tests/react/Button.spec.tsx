/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Button } from '@expcat/tigercat-react'
import { expectNoA11yViolations, setThemeVariables, clearThemeVariables } from '../utils/react'

describe('Button', () => {
  it('renders a button and merges className', () => {
    render(<Button className="custom-class">Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex')
    expect(button).toHaveClass('custom-class')
  })

  it('forwards native attributes', () => {
    render(
      <Button aria-label="Custom label" data-testid="test-button">
        Button
      </Button>
    )

    const button = screen.getByTestId('test-button')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
  })

  it('respects type prop (submit/reset/button)', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')

    rerender(<Button type="reset">Reset</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')

    rerender(<Button>Button</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('calls onClick when enabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button', { name: 'Click' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick and shows spinner when loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    const { container } = render(
      <Button loading onClick={onClick}>
        Loading
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Loading' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
    expect(container.querySelector('svg.animate-spin')).toHaveAttribute('aria-hidden', 'true')

    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('supports keyboard activation when enabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Keyboard</Button>)

    const button = screen.getByRole('button', { name: 'Keyboard' })
    button.focus()
    expect(button).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not activate via keyboard when loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <Button loading onClick={onClick}>
        Loading
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Loading' })
    expect(button).toBeDisabled()

    await user.tab()
    expect(button).not.toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onClick).not.toHaveBeenCalled()
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables([
        '--tiger-primary',
        '--tiger-primary-hover',
        '--tiger-secondary',
        '--tiger-secondary-hover'
      ])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000',
        '--tiger-primary-hover': '#cc0000'
      })

      const { container } = render(<Button variant="primary">Primary Button</Button>)

      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
      expect(rootStyles.getPropertyValue('--tiger-primary-hover').trim()).toBe('#cc0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Accessible Button</Button>)

      await expectNoA11yViolations(container)
    })
  })
})
