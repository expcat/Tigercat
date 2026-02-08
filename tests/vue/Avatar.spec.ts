/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Avatar } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

describe('Avatar', () => {
  it('renders text initials with accessible label', () => {
    const { container } = render(Avatar, {
      props: {
        text: 'John Doe'
      }
    })

    expect(screen.getByText('JD')).toBeInTheDocument()
    const avatar = container.querySelector('[role="img"]')
    expect(avatar).toHaveAttribute('aria-label', 'John Doe')
  })

  it('renders image with src and alt', () => {
    const { container } = render(Avatar, {
      props: {
        src: '/test-avatar.jpg',
        alt: 'Test User'
      },
      attrs: {
        'data-testid': 'avatar'
      }
    })

    const wrapper = container.querySelector('[data-testid="avatar"]')
    const img = container.querySelector('img')
    expect(wrapper).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test-avatar.jpg')
    expect(img).toHaveAttribute('alt', 'Test User')
  })

  it('treats unlabeled image avatar as decorative', () => {
    const { container } = render(Avatar, {
      props: {
        src: '/test-avatar.jpg'
      },
      attrs: {
        'data-testid': 'avatar'
      }
    })

    const wrapper = container.querySelector('[data-testid="avatar"]')
    const img = container.querySelector('img')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(img).toHaveAttribute('alt', '')
  })

  it('falls back to text when image fails', async () => {
    const { container } = render(Avatar, {
      props: {
        src: '/broken.jpg',
        text: 'Fallback User',
        alt: 'Fallback User'
      }
    })

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    await fireEvent.error(img as Element)

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByText('FU')).toBeInTheDocument()
  })

  it('renders icon slot and is decorative by default', () => {
    const { container } = render(Avatar, {
      slots: {
        default: '<svg data-testid="icon"><path /></svg>'
      }
    })

    expect(container.querySelector('[data-testid="icon"]')).toBeInTheDocument()
    const wrapper = container.querySelector('span')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
  })

  it('merges class/style and passes through attrs', () => {
    const { container } = render(Avatar, {
      props: {
        text: 'AB',
        className: 'custom-avatar'
      },
      attrs: {
        'data-foo': 'bar'
      }
    })

    const avatar = container.querySelector('[role="img"]')
    expect(avatar?.className).toContain('custom-avatar')
    expect(avatar).toHaveAttribute('data-foo', 'bar')
    expect(avatar?.className).toContain('bg-[var(--tiger-avatar-bg,#e5e7eb)]')
  })

  it('applies size classes', () => {
    const sizes = [
      { size: 'sm', expected: 'w-8 h-8 text-xs' },
      { size: 'md', expected: 'w-10 h-10 text-sm' },
      { size: 'lg', expected: 'w-12 h-12 text-base' },
      { size: 'xl', expected: 'w-16 h-16 text-lg' }
    ] as const

    sizes.forEach(({ size, expected }) => {
      const { container } = render(Avatar, {
        props: { text: size.toUpperCase(), size }
      })
      const avatar = container.querySelector('[role="img"]')
      expected.split(' ').forEach((cls) => {
        expect(avatar?.className).toContain(cls)
      })
    })
  })

  it('applies shape classes', () => {
    const { container: circleContainer } = render(Avatar, {
      props: { text: 'C', shape: 'circle' }
    })
    expect(circleContainer.querySelector('[role="img"]')?.className).toContain('rounded-full')

    const { container: squareContainer } = render(Avatar, {
      props: { text: 'S', shape: 'square' }
    })
    expect(squareContainer.querySelector('[role="img"]')?.className).toContain('rounded-md')
  })

  it('applies custom bgColor and textColor', () => {
    const { container } = render(Avatar, {
      props: {
        text: 'T',
        bgColor: 'bg-blue-500',
        textColor: 'text-white'
      }
    })

    const avatar = container.querySelector('[role="img"]')
    expect(avatar?.className).toContain('bg-blue-500')
    expect(avatar?.className).toContain('text-white')
    expect(avatar?.className).not.toContain('bg-[var(--tiger-avatar-bg')
  })

  it('passes accessibility checks', async () => {
    const { container } = render(Avatar, {
      props: {
        text: 'John Doe'
      }
    })

    await expectNoA11yViolations(container)
  })
})
