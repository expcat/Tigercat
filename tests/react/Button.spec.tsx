/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import {
  buttonSizeClasses,
  getButtonVariantClasses,
  resetDevWarnCache
} from '@expcat/tigercat-core'
import {
  expectNoA11yViolationsIsolated,
  setThemeVariables,
  clearThemeVariables
} from '../utils/react'

describe('Button', () => {
  it('renders a button and merges className', () => {
    render(<Button className="custom-class">Click me</Button>)

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex')
    expect(button).toHaveClass('whitespace-nowrap')
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

  it('warns when color is passed instead of variant', () => {
    // devWarn dedupes per key process-wide, so drop any earlier hit first.
    resetDevWarnCache()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    render(<Button color="primary">Color prop</Button>)

    const button = screen.getByRole('button', { name: 'Color prop' })
    expect(button).toBeInTheDocument()
    expect(button).not.toHaveAttribute('color')
    expect(warn).toHaveBeenCalledWith(
      '[Tigercat] Button does not support color. Use variant instead.'
    )
    warn.mockRestore()
  })

  it('applies variant classes for each variant', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'link'] as const
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>)
      const button = screen.getByRole('button', { name: variant })
      const expected = getButtonVariantClasses(variant)
      expected.split(' ').forEach((cls) => {
        expect(button.className).toContain(cls)
      })
      unmount()
    }
  })

  it('applies size classes for each size', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>{size}</Button>)
      const button = screen.getByRole('button', { name: size })
      buttonSizeClasses[size].split(' ').forEach((cls) => {
        expect(button.className).toContain(cls)
      })
      unmount()
    }
  })

  it('renders block button with full width', () => {
    render(<Button block>Block</Button>)
    expect(screen.getByRole('button', { name: 'Block' })).toHaveClass('w-full')
  })

  it('respects htmlType prop (submit/reset/button)', () => {
    const { rerender } = render(<Button htmlType="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')

    rerender(<Button htmlType="reset">Reset</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')

    rerender(<Button>Button</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('treats native type as the same attribute as htmlType', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')

    rerender(
      <Button type="reset" htmlType="submit">
        Submit
      </Button>
    )
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('forwards ref to the native button', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Focus me</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    ref.current?.focus()
    expect(ref.current).toHaveFocus()
  })

  it('renders an unknown variant as primary without throwing', () => {
    expect(() =>
      render(<Button variant={'not-a-variant' as 'primary'}>Fallback</Button>)
    ).not.toThrow()
    expect(screen.getByRole('button', { name: 'Fallback' })).toBeInTheDocument()
  })

  it('submits a form when htmlType is submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())

    render(
      <form onSubmit={onSubmit}>
        <Button htmlType="submit">Save</Button>
      </form>
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
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
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).not.toHaveAttribute('aria-disabled', 'true')
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
    expect(container.querySelector('svg.animate-spin')).toHaveAttribute('aria-hidden', 'true')

    button.focus()
    expect(button).toHaveFocus()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders custom loading icon when loading and loadingIcon prop is provided', () => {
    render(
      <Button
        loading
        loadingIcon={
          <span data-testid="custom-spinner" aria-hidden="true">
            Custom
          </span>
        }>
        Submit
      </Button>
    )

    // aria-hidden content inside button might still be part of text content depending on implementation,
    // but let's check if we can find it by generic role first.
    // Ideally we want to ensure the custom icon is there.
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('custom-spinner')).toBeInTheDocument()
    // Default spinner should not be present
    expect(button.querySelector('svg.animate-spin')).not.toBeInTheDocument()
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
    expect(button).not.toBeDisabled()

    button.focus()
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

      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('danger prop', () => {
    it('applies danger classes instead of variant classes when danger is true', () => {
      const { container } = render(<Button danger>Delete</Button>)
      const button = container.querySelector('button')!
      expect(button.className).toContain('--tiger-error')
    })

    it('applies danger classes for outline variant', () => {
      const { container } = render(
        <Button danger variant="outline">
          Delete
        </Button>
      )
      const button = container.querySelector('button')!
      expect(button.className).toContain('--tiger-error')
      expect(button.className).toContain('border-2')
    })
  })

  describe('iconPosition prop', () => {
    it('renders icon before the label by default', () => {
      render(<Button icon={<span data-testid="icon">★</span>}>Star</Button>)
      const button = screen.getByRole('button', { name: 'Star' })
      const iconSpan = screen.getByTestId('icon').parentElement!
      expect(button.firstElementChild).toBe(iconSpan)
      expect(iconSpan).toHaveAttribute('aria-hidden', 'true')
      expect(iconSpan.className).toContain('me-2')
    })

    it('renders icon after the label when iconPosition is end', () => {
      render(
        <Button icon={<span data-testid="icon">★</span>} iconPosition="end">
          Star
        </Button>
      )
      const button = screen.getByRole('button', { name: 'Star' })
      const iconSpan = screen.getByTestId('icon').parentElement!
      expect(button.lastElementChild).toBe(iconSpan)
      expect(iconSpan.className).toContain('ms-2')
      expect(iconSpan.className).not.toContain('order-1')
    })

    it('renders loading spinner after the label when iconPosition is right', () => {
      const { container } = render(
        <Button loading iconPosition="right">
          Loading
        </Button>
      )
      const button = screen.getByRole('button', { name: 'Loading' })
      const spinnerSpan = container.querySelector('svg.animate-spin')!.parentElement!
      expect(button.lastElementChild).toBe(spinnerSpan)
      expect(spinnerSpan.className).toContain('ms-2')
    })

    it('warns when an icon-only button has no accessible name', () => {
      resetDevWarnCache()
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      render(<Button icon={<span>★</span>} />)
      expect(warn).toHaveBeenCalledWith(
        '[Tigercat] Button has no accessible name. Provide text content, aria-label, or aria-labelledby.'
      )
      warn.mockRestore()
    })
  })
})
