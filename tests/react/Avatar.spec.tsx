/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Avatar } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('Avatar', () => {
  it('renders text initials with accessible label', () => {
    const { container } = render(<Avatar text="John Doe" />)

    expect(screen.getByText('JD')).toBeInTheDocument()
    const avatar = container.querySelector('[role="img"]')
    expect(avatar).toHaveAttribute('aria-label', 'John Doe')
  })

  it('renders image with src and alt', () => {
    const { container } = render(
      <Avatar src="/test-avatar.jpg" alt="Test User" data-testid="avatar" />
    )

    const wrapper = container.querySelector('[data-testid="avatar"]')
    const img = container.querySelector('img')
    expect(wrapper).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test-avatar.jpg')
    expect(img).toHaveAttribute('alt', 'Test User')
  })

  it('treats unlabeled image avatar as decorative', () => {
    const { container } = render(<Avatar src="/test-avatar.jpg" data-testid="avatar" />)

    const wrapper = container.querySelector('[data-testid="avatar"]')
    const img = container.querySelector('img')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(img).toHaveAttribute('alt', '')
  })

  it('falls back to text when image fails', () => {
    const { container } = render(
      <Avatar src="/broken.jpg" text="Fallback User" alt="Fallback User" />
    )

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    fireEvent.error(img as Element)

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByText('FU')).toBeInTheDocument()
  })

  it('renders icon children and is decorative by default', () => {
    const { container } = render(
      <Avatar>
        <svg data-testid="icon">
          <path />
        </svg>
      </Avatar>
    )

    expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument()
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
  })

  it('merges className and passes through attributes', () => {
    const { container } = render(<Avatar text="AB" className="custom-avatar" data-foo="bar" />)

    const avatar = container.querySelector('[role="img"]')
    expect(avatar?.className).toContain('custom-avatar')
    expect(avatar).toHaveAttribute('data-foo', 'bar')
    expect(avatar?.className).toContain('bg-[var(--tiger-avatar-bg,#e5e7eb)]')
  })

  it('applies size classes', () => {
    const sizes = [
      { size: 'sm' as const, expected: 'w-8 h-8 text-xs' },
      { size: 'md' as const, expected: 'w-10 h-10 text-sm' },
      { size: 'lg' as const, expected: 'w-12 h-12 text-base' },
      { size: 'xl' as const, expected: 'w-16 h-16 text-lg' }
    ]

    sizes.forEach(({ size, expected }) => {
      const { container } = render(<Avatar text={size.toUpperCase()} size={size} />)
      const avatar = container.querySelector('[role="img"]')
      expected.split(' ').forEach((cls) => {
        expect(avatar?.className).toContain(cls)
      })
    })
  })

  it('applies shape classes', () => {
    const { container: circleContainer } = render(<Avatar text="C" shape="circle" />)
    expect(circleContainer.querySelector('[role="img"]')?.className).toContain('rounded-full')

    const { container: squareContainer } = render(<Avatar text="S" shape="square" />)
    expect(squareContainer.querySelector('[role="img"]')?.className).toContain('rounded-md')
  })

  it('applies custom bgColor and textColor', () => {
    const { container } = render(<Avatar text="T" bgColor="bg-blue-500" textColor="text-white" />)

    const avatar = container.querySelector('[role="img"]')
    expect(avatar?.className).toContain('bg-blue-500')
    expect(avatar?.className).toContain('text-white')
    expect(avatar?.className).not.toContain('bg-[var(--tiger-avatar-bg')
  })

  it('passes accessibility checks', async () => {
    const { container } = render(<Avatar text="John Doe" />)
    await expectNoA11yViolations(container)
  })
})
