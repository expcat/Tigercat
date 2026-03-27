/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { InputGroup, InputGroupAddon, Input } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('InputGroup', () => {
  it('renders with role="group"', () => {
    render(InputGroup, {
      slots: { default: 'content' }
    })
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('renders children in the group', () => {
    render(InputGroup, {
      slots: { default: '<span>child1</span><span>child2</span>' }
    })
    const group = screen.getByRole('group')
    expect(group.children.length).toBe(2)
  })

  it('applies compact mode classes', () => {
    render(InputGroup, {
      props: { compact: true },
      slots: { default: 'content' }
    })
    const group = screen.getByRole('group')
    expect(group.className).toContain('rounded-none')
  })

  it('applies spaced mode classes when not compact', () => {
    render(InputGroup, {
      props: { compact: false },
      slots: { default: 'content' }
    })
    const group = screen.getByRole('group')
    expect(group.className).toContain('gap-2')
  })

  it('merges custom className', () => {
    render(InputGroup, {
      props: { className: 'my-custom-class' },
      slots: { default: 'content' }
    })
    const group = screen.getByRole('group')
    expect(group.className).toContain('my-custom-class')
  })

  it('passes through HTML attributes', () => {
    render(InputGroup, {
      attrs: { 'data-testid': 'my-group', id: 'test-group' },
      slots: { default: 'content' }
    })
    expect(screen.getByTestId('my-group')).toBeInTheDocument()
    expect(screen.getByTestId('my-group').id).toBe('test-group')
  })

  it('applies base classes', () => {
    render(InputGroup, {
      slots: { default: 'content' }
    })
    const group = screen.getByRole('group')
    expect(group.className).toContain('inline-flex')
    expect(group.className).toContain('items-stretch')
  })

  it('uses md size by default', () => {
    render(InputGroup, {
      props: { size: 'md' },
      slots: { default: 'content' }
    })
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('accepts different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    for (const size of sizes) {
      const { unmount } = render(InputGroup, {
        props: { size },
        slots: { default: 'content' }
      })
      expect(screen.getByRole('group')).toBeInTheDocument()
      unmount()
    }
  })
})

describe('InputGroupAddon', () => {
  it('renders addon content', () => {
    render(InputGroupAddon, {
      slots: { default: '@' }
    })
    expect(screen.getByText('@')).toBeInTheDocument()
  })

  it('renders as span element', () => {
    const { container } = render(InputGroupAddon, {
      slots: { default: 'prefix' }
    })
    expect(container.querySelector('span')).toBeInTheDocument()
  })

  it('applies addon classes', () => {
    const { container } = render(InputGroupAddon, {
      slots: { default: '$' }
    })
    const span = container.querySelector('span')!
    expect(span.className).toContain('inline-flex')
    expect(span.className).toContain('items-center')
  })

  it('merges custom className', () => {
    const { container } = render(InputGroupAddon, {
      props: { className: 'addon-extra' },
      slots: { default: 'icon' }
    })
    const span = container.querySelector('span')!
    expect(span.className).toContain('addon-extra')
  })

  describe('a11y', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(InputGroup, {
        slots: { default: 'content' }
      })
      await expectNoA11yViolations(container)
    })
  })
})
