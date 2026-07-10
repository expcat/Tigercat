/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Avatar, AvatarGroup, ConfigProvider } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
  it('applies custom bgColor and textColor', () => {
    const { container } = render(<Avatar text="T" bgColor="bg-blue-500" textColor="text-white" />)

    const avatar = container.querySelector('[role="img"]')
    expect(avatar?.className).toContain('bg-blue-500')
    expect(avatar?.className).toContain('text-white')
    expect(avatar?.className).not.toContain('bg-[var(--tiger-avatar-bg')
  })

  it('passes accessibility checks', async () => {
    const { container } = render(<Avatar text="John Doe" />)
    await expectNoA11yViolationsIsolated(container)
  })
})

describe('AvatarGroup', () => {
  it('should render all children when max is not set', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar text="A" />
        <Avatar text="B" />
        <Avatar text="C" />
      </AvatarGroup>
    )
    const group = container.querySelector('[role="group"]')!
    expect(group.children.length).toBe(3)
  })

  it('should show overflow indicator when max is set', () => {
    const { container } = render(
      <AvatarGroup max={2}>
        <Avatar text="A" />
        <Avatar text="B" />
        <Avatar text="C" />
        <Avatar text="D" />
      </AvatarGroup>
    )
    const overflow = screen.getByLabelText('2 more')
    expect(overflow).toBeInTheDocument()
    expect(overflow.textContent).toBe('+2')
  })

  it('should have role="group"', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar text="A" />
      </AvatarGroup>
    )
    expect(container.querySelector('[role="group"]')).toBeInTheDocument()
  })

  it('allows overriding the default group aria-label', () => {
    const { container } = render(
      <AvatarGroup aria-label="项目团队成员">
        <Avatar text="A" />
      </AvatarGroup>
    )
    expect(container.querySelector('[role="group"]')).toHaveAttribute('aria-label', '项目团队成员')
  })

  it('localizes group and overflow labels via the locale prop', () => {
    const { container } = render(
      <AvatarGroup max={2} locale={{ locale: 'zh-CN' }}>
        <Avatar text="A" />
        <Avatar text="B" />
        <Avatar text="C" />
        <Avatar text="D" />
      </AvatarGroup>
    )
    expect(container.querySelector('[role="group"]')).toHaveAttribute('aria-label', '头像组')
    const overflow = screen.getByLabelText('还有 2 位')
    expect(overflow.textContent).toBe('+2')
  })

  it('localizes labels via ConfigProvider locale', () => {
    const { container } = render(
      <ConfigProvider locale={{ locale: 'zh-CN' }}>
        <AvatarGroup max={1}>
          <Avatar text="A" />
          <Avatar text="B" />
        </AvatarGroup>
      </ConfigProvider>
    )
    expect(container.querySelector('[role="group"]')).toHaveAttribute('aria-label', '头像组')
    expect(screen.getByLabelText('还有 1 位')).toBeInTheDocument()
  })

  it('applies labels overrides over locale defaults', () => {
    const { container } = render(
      <AvatarGroup
        max={1}
        locale={{ locale: 'zh-CN' }}
        labels={{ ariaLabel: '成员组', overflowAriaLabel: '另有 {count} 人' }}>
        <Avatar text="A" />
        <Avatar text="B" />
      </AvatarGroup>
    )
    expect(container.querySelector('[role="group"]')).toHaveAttribute('aria-label', '成员组')
    expect(screen.getByLabelText('另有 1 人')).toBeInTheDocument()
  })
  it('prioritizes image over text when both provided', () => {
    const { container } = render(<Avatar src="/avatar.jpg" text="John Doe" alt="John Doe" />)

    expect(container.querySelector('img')).toBeInTheDocument()
    expect(screen.queryByText('JD')).not.toBeInTheDocument()
  })
  it('lets an explicit avatar size override the group size', () => {
    const { container } = render(
      <AvatarGroup size="sm">
        <Avatar text="AB" size="lg" />
      </AvatarGroup>
    )

    const avatar = container.querySelector('[role="img"]')
    expect(avatar?.className).toContain('w-12 h-12 text-base')
  })
})
