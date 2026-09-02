/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link } from '@expcat/tigercat-react/Link'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Link (React)', () => {
  it('renders an anchor with default styling', () => {
    render(<Link href="/test">Click</Link>)

    const link = screen.getByRole('link', { name: 'Click' })
    expect(link).toHaveAttribute('href', '/test')
    expect(link.tagName).toBe('A')
  })

  it('forwards native attributes', () => {
    render(<Link aria-label="Custom" data-testid="link" />)

    const link = screen.getByTestId('link')
    expect(link).toHaveAttribute('aria-label', 'Custom')
  })

  it('fires onClick when not disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <Link href="#" onClick={onClick}>
        Go
      </Link>
    )

    await user.click(screen.getByText('Go'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('disables navigation and interactions when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <Link href="/test" disabled onClick={onClick}>
        Disabled
      </Link>
    )

    const link = screen.getByRole('link', { name: 'Disabled' })
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveAttribute('tabindex', '-1')

    await user.click(link)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('adds noopener noreferrer for target=_blank by default', () => {
    render(
      <Link href="https://example.com" target="_blank">
        External
      </Link>
    )

    const link = screen.getByRole('link', { name: 'External' })
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('merges secure tokens into a custom _blank rel', () => {
    render(
      <Link href="https://example.com" target="_blank" rel="nofollow">
        Custom
      </Link>
    )

    const link = screen.getByRole('link', { name: 'Custom' })
    const tokens = new Set((link.getAttribute('rel') ?? '').split(/\s+/))
    expect(tokens.has('nofollow')).toBe(true)
    expect(tokens.has('noopener')).toBe(true)
    expect(tokens.has('noreferrer')).toBe(true)
  })

  it('forwards ref to the anchor', () => {
    const ref = React.createRef<HTMLAnchorElement>()
    render(
      <Link ref={ref} href="/test">
        Go
      </Link>
    )
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement)
    expect(ref.current).toHaveAttribute('href', '/test')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Link href="/test">A11y</Link>)
    await expectNoA11yViolationsIsolated(container)
  })
})
