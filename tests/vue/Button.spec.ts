/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Button } from '@expcat/tigercat-vue/Button'
import {
  buttonSizeClasses,
  getButtonVariantClasses,
  resetDevWarnCache
} from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated, setThemeVariables, clearThemeVariables } from '../utils'

describe('Button', () => {
  it('renders and merges class/style from props and attrs', () => {
    const { container } = render(Button, {
      props: { className: 'from-prop', style: { color: 'red' } },
      attrs: { class: 'from-attr', style: { backgroundColor: 'black' } },
      slots: { default: 'Click me' }
    })

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex')
    expect(button).toHaveClass('whitespace-nowrap')
    expect(button).toHaveClass('from-prop')
    expect(button).toHaveClass('from-attr')
  })

  it('forwards native attributes', () => {
    render(Button, {
      attrs: { 'aria-label': 'Custom', 'data-testid': 'btn' },
      slots: { default: 'X' }
    })

    const button = screen.getByTestId('btn')
    expect(button).toHaveAttribute('aria-label', 'Custom')
  })

  it('warns when color is passed instead of variant', () => {
    // devWarn dedupes per key process-wide, so drop any earlier hit first.
    resetDevWarnCache()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    render(Button, {
      attrs: { color: 'primary' },
      slots: { default: 'Color prop' }
    })

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
      const { container } = render(Button, {
        props: { variant },
        slots: { default: variant }
      })
      const button = container.querySelector('button')!
      const expected = getButtonVariantClasses(variant)
      expected.split(' ').forEach((cls) => {
        expect(button.className).toContain(cls)
      })
    }
  })

  it('applies size classes for each size', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const { container } = render(Button, {
        props: { size },
        slots: { default: size }
      })
      const button = container.querySelector('button')!
      buttonSizeClasses[size].split(' ').forEach((cls) => {
        expect(button.className).toContain(cls)
      })
    }
  })

  it('renders block button with full width', () => {
    const { container } = render(Button, {
      props: { block: true },
      slots: { default: 'Block' }
    })
    const button = container.querySelector('button')
    expect(button).toHaveClass('w-full')
  })

  it('respects htmlType prop (submit/reset/button)', () => {
    const first = render(Button, {
      props: { htmlType: 'submit' },
      slots: { default: 'Submit' }
    })
    expect(first.container.querySelector('button')).toHaveAttribute('type', 'submit')
    first.unmount()

    const second = render(Button, {
      props: { htmlType: 'reset' },
      slots: { default: 'Reset' }
    })
    expect(second.container.querySelector('button')).toHaveAttribute('type', 'reset')
  })

  it('honors native type when htmlType is omitted', () => {
    const { container, rerender } = render(Button, {
      props: { type: 'submit' },
      slots: { default: 'Submit' }
    })
    expect(container.querySelector('button')).toHaveAttribute('type', 'submit')

    rerender({ type: 'reset', htmlType: 'submit' })
    expect(container.querySelector('button')).toHaveAttribute('type', 'submit')
  })

  it('renders an unknown variant without throwing', () => {
    expect(() =>
      render(Button, {
        props: { variant: 'not-a-variant' as 'primary' },
        slots: { default: 'Fallback' }
      })
    ).not.toThrow()
    expect(screen.getByRole('button', { name: 'Fallback' })).toBeInTheDocument()
  })

  it('submits a form when native type is submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((event: Event) => event.preventDefault())

    render({
      components: { Button },
      template: '<form @submit="onSubmit"><Button type="submit">Save</Button></form>',
      setup: () => ({ onSubmit })
    })

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when enabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(Button, {
      slots: { default: 'Click' },
      attrs: { onClick }
    })

    await user.click(screen.getByRole('button', { name: 'Click' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()

    render(Button, {
      props: { disabled: true },
      slots: { default: 'Disabled' },
      attrs: { onClick }
    })

    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()

    await fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick and shows spinner when loading', async () => {
    const onClick = vi.fn()

    const { container } = render(Button, {
      props: { loading: true },
      slots: { default: 'Loading' },
      attrs: { onClick }
    })

    const button = screen.getByRole('button', { name: 'Loading' })
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).not.toHaveAttribute('aria-disabled', 'true')
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
    expect(container.querySelector('svg.animate-spin')).toHaveAttribute('aria-hidden', 'true')

    button.focus()
    expect(button).toHaveFocus()
    await fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders custom loading icon via slot', () => {
    const { container } = render(Button, {
      props: { loading: true },
      slots: { 'loading-icon': '<span class="custom-loader">Loading...</span>' }
    })

    const loader = container.querySelector('.custom-loader')
    expect(loader).toBeInTheDocument()
    expect(loader).toHaveTextContent('Loading...')
    expect(container.querySelector('svg.animate-spin')).not.toBeInTheDocument()
  })

  it('can receive focus (keyboard baseline)', async () => {
    const { container } = render(Button, {
      slots: { default: 'Focusable' }
    })

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()

    button?.focus()
    expect(button).toHaveFocus()
  })

  it('supports keyboard activation when enabled (Enter)', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    const { container } = render(Button, {
      slots: { default: 'Keyboard' },
      attrs: { onClick }
    })

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()

    if (!button) return

    button.focus()
    expect(button).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not activate via keyboard when loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(Button, {
      props: { loading: true },
      slots: { default: 'Loading' },
      attrs: { onClick }
    })

    const button = screen.getByRole('button', { name: 'Loading' })
    expect(button).not.toBeDisabled()

    button.focus()
    await user.keyboard('{Enter}')
    expect(onClick).not.toHaveBeenCalled()
  })

  describe('Theme Support', () => {
    afterEach(() => {
      clearThemeVariables(['--tiger-primary', '--tiger-primary-hover', '--tiger-primary-disabled'])
    })

    it('should support custom theme colors', () => {
      setThemeVariables({
        '--tiger-primary': '#ff0000',
        '--tiger-primary-hover': '#cc0000'
      })

      const { container } = render(Button, {
        props: { variant: 'primary' },
        slots: { default: 'Themed Button' }
      })

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()

      // Verify theme variables are set
      const rootStyles = window.getComputedStyle(document.documentElement)
      expect(rootStyles.getPropertyValue('--tiger-primary').trim()).toBe('#ff0000')
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Button, {
        slots: {
          default: 'Accessible Button'
        }
      })

      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('danger prop', () => {
    it('applies danger classes when danger is true', () => {
      const { container } = render(Button, {
        props: { danger: true },
        slots: { default: 'Delete' }
      })
      const button = container.querySelector('button')!
      expect(button.className).toContain('--tiger-error')
    })

    it('applies danger classes for outline variant', () => {
      const { container } = render(Button, {
        props: { danger: true, variant: 'outline' },
        slots: { default: 'Delete' }
      })
      const button = container.querySelector('button')!
      expect(button.className).toContain('--tiger-error')
      expect(button.className).toContain('border-2')
    })
  })

  describe('iconPosition prop', () => {
    it('renders icon slot before the label by default', () => {
      const { container } = render(Button, {
        slots: {
          default: 'Star',
          icon: '<span data-testid="icon">★</span>'
        }
      })
      const button = container.querySelector('button')!
      const icon = container.querySelector('[data-testid="icon"]')!
      expect(button.firstElementChild).toBe(icon.parentElement)
      expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true')
      expect(icon.parentElement!.className).toContain('me-2')
    })

    it('renders icon slot after the label when iconPosition is end', () => {
      const { container } = render(Button, {
        props: { iconPosition: 'end' },
        slots: {
          default: 'Star',
          icon: '<span data-testid="icon">★</span>'
        }
      })
      const button = container.querySelector('button')!
      const icon = container.querySelector('[data-testid="icon"]')!
      expect(button.lastElementChild).toBe(icon.parentElement)
      expect(icon.parentElement!.className).toContain('ms-2')
      expect(icon.parentElement!.className).not.toContain('order-1')
    })

    it('renders loading spinner after the label when iconPosition is right', () => {
      const { container } = render(Button, {
        props: { loading: true, iconPosition: 'right' },
        slots: { default: 'Loading' }
      })
      const button = container.querySelector('button')!
      const spinner = container.querySelector('svg.animate-spin')!
      expect(button.lastElementChild).toBe(spinner.parentElement)
      expect(spinner.parentElement!.className).toContain('ms-2')
    })
  })
})
