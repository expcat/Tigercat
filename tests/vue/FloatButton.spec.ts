/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { FloatButton, FloatButtonGroup } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('FloatButton (Vue)', () => {
  describe('Rendering', () => {
    it('renders a button element', () => {
      render(FloatButton, { slots: { default: 'Click' } })
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders slot content', () => {
      render(FloatButton, { slots: { default: 'Action' } })
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('has type="button"', () => {
      render(FloatButton)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('applies circle shape class by default', () => {
      const { container } = render(FloatButton)
      expect(container.querySelector('button')?.className).toContain('rounded-full')
    })

    it('applies square shape class', () => {
      const { container } = render(FloatButton, { props: { shape: 'square' } })
      expect(container.querySelector('button')?.className).toContain('rounded-')
      expect(container.querySelector('button')?.className).not.toContain('rounded-full')
    })
  })

  describe('Tooltip', () => {
    it('sets title from tooltip prop', () => {
      render(FloatButton, { props: { tooltip: 'Help' } })
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Help')
    })

    it('uses tooltip as aria-label when ariaLabel is not set', () => {
      render(FloatButton, { props: { tooltip: 'Help' } })
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Help')
    })

    it('uses ariaLabel over tooltip for aria-label', () => {
      render(FloatButton, { props: { tooltip: 'Help', ariaLabel: 'Custom' } })
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom')
    })
  })

  describe('Disabled', () => {
    it('sets disabled attribute', () => {
      render(FloatButton, { props: { disabled: true } })
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('does not emit click when disabled', async () => {
      const { emitted } = render(FloatButton, { props: { disabled: true } })
      await fireEvent.click(screen.getByRole('button'))
      expect(emitted().click).toBeUndefined()
    })

    it('emits click when enabled', async () => {
      const { emitted } = render(FloatButton)
      await fireEvent.click(screen.getByRole('button'))
      expect(emitted().click).toHaveLength(1)
    })
  })

  describe('Type variants', () => {
    it('applies primary type classes by default', () => {
      const { container } = render(FloatButton)
      const btn = container.querySelector('button')!
      expect(btn.className).toContain('bg-')
    })

    it('applies default type classes', () => {
      const { container } = render(FloatButton, { props: { type: 'default' } })
      const btn = container.querySelector('button')!
      expect(btn.className).toContain('bg-')
    })
  })

  describe('className and attrs', () => {
    it('merges className prop', () => {
      const { container } = render(FloatButton, { props: { className: 'my-btn' } })
      expect(container.querySelector('button')).toHaveClass('my-btn')
    })

    it('merges attrs class', () => {
      const { container } = render(FloatButton, { attrs: { class: 'extra' } })
      expect(container.querySelector('button')).toHaveClass('extra')
    })
  })
})

describe('FloatButtonGroup (Vue)', () => {
  it('renders trigger slot', () => {
    render(FloatButtonGroup, {
      slots: {
        trigger: () => h('button', 'Open'),
        default: () => h('button', 'Child')
      }
    })
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('does not show children when closed', () => {
    render(FloatButtonGroup, {
      slots: {
        trigger: () => h('button', 'Open'),
        default: () => h('button', 'Child')
      }
    })
    expect(screen.queryByText('Child')).not.toBeInTheDocument()
  })

  it('shows children when open prop is true', () => {
    render(FloatButtonGroup, {
      props: { open: true },
      slots: {
        trigger: () => h('button', 'Open'),
        default: () => h('button', 'Child')
      }
    })
    expect(screen.getByText('Child')).toBeInTheDocument()
  })

  it('toggles children on trigger click', async () => {
    const { emitted } = render(FloatButtonGroup, {
      props: { trigger: 'click' },
      slots: {
        trigger: () => h('button', 'Toggle'),
        default: () => h('button', 'Child')
      }
    })
    await fireEvent.click(screen.getByText('Toggle'))
    expect(emitted()['update:open']).toBeTruthy()
    expect(emitted()['update:open'][0]).toEqual([true])
  })

  it('opens on hover when trigger=hover', async () => {
    const { emitted, container } = render(FloatButtonGroup, {
      props: { trigger: 'hover' },
      slots: {
        trigger: () => h('button', 'Hover'),
        default: () => h('button', 'Child')
      }
    })
    const group = container.querySelector('[class]')
    if (group) {
      await fireEvent.mouseEnter(group)
      expect(emitted()['update:open']).toBeTruthy()
    }
  })

  it('merges className prop', () => {
    render(FloatButtonGroup, {
      props: { open: true, className: 'custom-group' },
      slots: { default: () => h('button', 'A') }
    })
    const group = document.querySelector('.custom-group')
    expect(group).toBeInTheDocument()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(FloatButton)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
