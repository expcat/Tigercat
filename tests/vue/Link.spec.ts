/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Link } from '@expcat/tigercat-vue/Link'
import { expectNoA11yViolationsIsolated } from '../utils'

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
  })

  it('merges attrs.class onto the element', () => {
    const { container } = render(Link, {
      attrs: { class: 'from-attr' },
      slots: { default: 'Link' }
    })

    const link = container.querySelector('a')
    expect(link).toHaveClass('from-attr')
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
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('link', { name: 'Disabled' })).toBe(link)

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

  it('merges secure tokens into a custom _blank rel', () => {
    const { container } = render(Link, {
      props: { href: 'https://example.com', target: '_blank', rel: 'nofollow' },
      slots: { default: 'Custom' }
    })

    const tokens = new Set((container.querySelector('a')?.getAttribute('rel') ?? '').split(/\s+/))
    expect(tokens.has('nofollow')).toBe(true)
    expect(tokens.has('noopener')).toBe(true)
    expect(tokens.has('noreferrer')).toBe(true)
  })

  it('forwards keydown on an enabled link', async () => {
    const onKeydown = vi.fn()
    const { container } = render(Link, {
      props: { href: '/test' },
      slots: { default: 'Go' },
      attrs: { onKeydown }
    })

    await fireEvent.keyDown(container.querySelector('a') as HTMLAnchorElement, { key: 'Enter' })
    expect(onKeydown).toHaveBeenCalledOnce()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Link, {
      props: { href: '/test' },
      slots: { default: 'A11y' }
    })

    await expectNoA11yViolationsIsolated(container)
  })
})
