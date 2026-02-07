/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Link } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

describe('Link (Vue)', () => {
  it('renders an anchor with default styling', () => {
    const { container } = render(Link, {
      props: { href: '/test' },
      slots: { default: 'Click' }
    })

    const link = container.querySelector('a')
    expect(link).toBeInTheDocument()
    expect(link?.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveClass('inline-flex')
  })

  it('merges attrs.class onto the element', () => {
    const { container } = render(Link, {
      attrs: { class: 'from-attr' },
      slots: { default: 'Link' }
    })

    const link = container.querySelector('a')
    expect(link).toHaveClass('inline-flex')
    expect(link).toHaveClass('from-attr')
  })

  it('applies variant color classes', () => {
    const { container: c1 } = render(Link, {
      props: { variant: 'secondary' },
      slots: { default: 'Sec' }
    })
    expect(c1.querySelector('a')?.className).toContain('--tiger-secondary')

    const { container: c2 } = render(Link, {
      props: { variant: 'default' },
      slots: { default: 'Def' }
    })
    expect(c2.querySelector('a')?.className).toContain('text-gray-700')
  })

  it('applies size classes', () => {
    const { container: sm } = render(Link, {
      props: { size: 'sm' },
      slots: { default: 'S' }
    })
    expect(sm.querySelector('a')).toHaveClass('text-sm')

    const { container: lg } = render(Link, {
      props: { size: 'lg' },
      slots: { default: 'L' }
    })
    expect(lg.querySelector('a')).toHaveClass('text-lg')
  })

  it('adds hover:underline when underline=true (default)', () => {
    const { container } = render(Link, {
      slots: { default: 'U' }
    })
    expect(container.querySelector('a')).toHaveClass('hover:underline')
  })

  it('omits hover:underline when underline=false', () => {
    const { container } = render(Link, {
      props: { underline: false },
      slots: { default: 'U' }
    })
    expect(container.querySelector('a')).not.toHaveClass('hover:underline')
  })

  it('emits click event when not disabled', async () => {
    const onClick = vi.fn()
    render(Link, {
      props: { href: '#' },
      slots: { default: 'Go' },
      attrs: { onClick }
    })

    await fireEvent.click(screen.getByText('Go'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('disables navigation and click when disabled', async () => {
    const onClick = vi.fn()
    const { container } = render(Link, {
      props: { disabled: true, href: '/test' },
      slots: { default: 'Disabled' },
      attrs: { onClick }
    })

    const link = container.querySelector('a')
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).not.toHaveAttribute('href')
    expect(link).toHaveAttribute('tabindex', '-1')

    await fireEvent.click(screen.getByText('Disabled'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('adds noopener noreferrer for target=_blank by default', () => {
    const { container } = render(Link, {
      props: { href: 'https://example.com', target: '_blank' },
      slots: { default: 'External' }
    })

    expect(container.querySelector('a')).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('preserves custom rel when provided', () => {
    const { container } = render(Link, {
      props: { href: 'https://example.com', target: '_blank', rel: 'nofollow' },
      slots: { default: 'Custom' }
    })

    expect(container.querySelector('a')).toHaveAttribute('rel', 'nofollow')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Link, {
      props: { href: '/test' },
      slots: { default: 'A11y' }
    })

    await expectNoA11yViolations(container)
  })
})
