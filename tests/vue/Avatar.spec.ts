/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { defineComponent, h } from 'vue'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Avatar, AvatarGroup, ConfigProvider } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

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

    await expectNoA11yViolationsIsolated(container)
  })
})

describe('AvatarGroup', () => {
  it('should render all children when max is not set', () => {
    const { container } = render(AvatarGroup, {
      slots: {
        default: ['<span>A</span>', '<span>B</span>', '<span>C</span>'].join('')
      }
    })
    expect(container.querySelectorAll('span').length).toBe(3)
  })

  it('should show overflow indicator when max is set', () => {
    const { container } = render(AvatarGroup, {
      props: { max: 2 },
      slots: {
        default: ['<span>A</span>', '<span>B</span>', '<span>C</span>', '<span>D</span>'].join('')
      }
    })
    const overflow = container.querySelector('[aria-label="2 more"]')
    expect(overflow).toBeInTheDocument()
    expect(overflow?.textContent).toBe('+2')
  })

  it('should have role="group"', () => {
    const { container } = render(AvatarGroup, {
      slots: { default: '<span>A</span>' }
    })
    expect(container.querySelector('[role="group"]')).toBeInTheDocument()
  })

  it('allows overriding the default group aria-label via attrs', () => {
    const { container } = render(AvatarGroup, {
      attrs: { 'aria-label': '项目团队成员' },
      slots: { default: '<span>A</span>' }
    })
    expect(container.querySelector('[role="group"]')).toHaveAttribute('aria-label', '项目团队成员')
  })

  it('localizes group and overflow labels via the locale prop', () => {
    const { container } = render(AvatarGroup, {
      props: { max: 2, locale: { locale: 'zh-CN' } },
      slots: {
        default: ['<span>A</span>', '<span>B</span>', '<span>C</span>', '<span>D</span>'].join('')
      }
    })
    expect(container.querySelector('[role="group"]')).toHaveAttribute('aria-label', '头像组')
    const overflow = container.querySelector('[aria-label="还有 2 位"]')
    expect(overflow).toBeInTheDocument()
    expect(overflow?.textContent).toBe('+2')
  })

  it('localizes labels via ConfigProvider locale', () => {
    const Wrapper = defineComponent({
      render() {
        return h(ConfigProvider, { locale: { locale: 'zh-CN' } }, () =>
          h(AvatarGroup, { max: 1 }, () => [h(Avatar, { text: 'A' }), h(Avatar, { text: 'B' })])
        )
      }
    })
    const { container } = render(Wrapper)
    expect(container.querySelector('[role="group"]')).toHaveAttribute('aria-label', '头像组')
    expect(container.querySelector('[aria-label="还有 1 位"]')).toBeInTheDocument()
  })

  it('applies labels overrides over locale defaults', () => {
    const { container } = render(AvatarGroup, {
      props: {
        max: 1,
        locale: { locale: 'zh-CN' },
        labels: { ariaLabel: '成员组', overflowAriaLabel: '另有 {count} 人' }
      },
      slots: { default: '<span>A</span><span>B</span>' }
    })
    expect(container.querySelector('[role="group"]')).toHaveAttribute('aria-label', '成员组')
    expect(container.querySelector('[aria-label="另有 1 人"]')).toBeInTheDocument()
  })
  it('prioritizes image over text when both provided', () => {
    const { container } = render(Avatar, {
      props: {
        src: '/avatar.jpg',
        text: 'John Doe',
        alt: 'John Doe'
      }
    })

    expect(container.querySelector('img')).toBeInTheDocument()
    expect(screen.queryByText('JD')).not.toBeInTheDocument()
  })
  it('updates child avatar sizes when the group size prop changes', async () => {
    const { container, rerender } = render(AvatarGroup, {
      props: { size: 'sm' },
      slots: {
        default: () => [h(Avatar, { text: 'AB' }), h(Avatar, { text: 'CD' })]
      }
    })

    container.querySelectorAll('[role="img"]').forEach((avatar) => {
      expect(avatar.className).toContain('w-8 h-8 text-xs')
    })

    await rerender({ size: 'lg' })

    const avatars = container.querySelectorAll('[role="img"]')
    expect(avatars.length).toBe(2)
    avatars.forEach((avatar) => {
      expect(avatar.className).toContain('w-12 h-12 text-base')
      expect(avatar.className).not.toContain('w-8 h-8 text-xs')
    })
  })

  it('lets an explicit avatar size override the group size', () => {
    const { container } = render(AvatarGroup, {
      props: { size: 'sm' },
      slots: {
        default: () => [h(Avatar, { text: 'AB', size: 'lg' })]
      }
    })

    const avatar = container.querySelector('[role="img"]')
    expect(avatar?.className).toContain('w-12 h-12 text-base')
  })
})
