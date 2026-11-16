/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React, { createRef } from 'react'
import { Avatar } from '@expcat/tigercat-react/Avatar'
import { AvatarGroup } from '@expcat/tigercat-react/AvatarGroup'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Avatar', () => {
  it('renders text initials with accessible label', () => {
    render(<Avatar text="John Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'John Doe' })).toBeInTheDocument()
  })

  it('omits size and shape classes for inherited keys', () => {
    const unknown = render(<Avatar text="A" size={'nope' as 'md'} shape={'nope' as 'circle'} />)
    const inherited = render(
      <Avatar text="B" size={'toString' as 'md'} shape={'constructor' as 'circle'} />
    )
    const unknownClass = (unknown.container.querySelector('span') as HTMLElement).className
    const inheritedClass = (inherited.container.querySelector('span') as HTMLElement).className
    expect(unknownClass).not.toContain('--tiger-component-avatar-size-')
    expect(inheritedClass).not.toContain('--tiger-component-avatar-size-')
    expect(inheritedClass).not.toContain('function')
    expect(inheritedClass).not.toContain('[object Object]')
    expect(inheritedClass).not.toContain('rounded-[var(--tiger-component-avatar-border-radius)]')
  })

  it('renders a no-space two-letter token as-is', () => {
    render(<Avatar text="TC" />)
    expect(screen.getByText('TC')).toBeInTheDocument()
  })

  it('puts the computed name on the image', () => {
    const { rerender } = render(<Avatar src="/photo.jpg" text="Jane Doe" />)
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute('src', '/photo.jpg')

    rerender(<Avatar src="/photo.jpg" aria-label="Jane" />)
    expect(screen.getByRole('img', { name: 'Jane' })).toBeInTheDocument()

    rerender(<Avatar src="/photo.jpg" alt="Jane" />)
    expect(screen.getByRole('img', { name: 'Jane' })).toBeInTheDocument()
  })

  it.each([undefined, 'Old name'])('keeps image and fallback naming consistent (alt=%s)', (alt) => {
    render(
      <>
        <p id="person-name">Ada Lovelace</p>
        <Avatar src="/photo.jpg" alt={alt} aria-labelledby="person-name" />
      </>
    )
    const name = alt ?? 'Ada Lovelace'
    const image = screen.getByRole('img', { name })
    expect(image).toHaveAttribute('src', '/photo.jpg')

    fireEvent.error(image)
    expect(screen.getByRole('img', { name })).not.toHaveAttribute('src')
  })

  it('treats unlabeled image avatar as decorative', () => {
    const { container } = render(<Avatar src="/test-avatar.jpg" data-testid="avatar" />)
    const wrapper = container.querySelector('[data-testid="avatar"]')
    const img = container.querySelector('img')
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(img).toHaveAttribute('alt', '')
  })

  it('retries after src changes following an error', () => {
    const { container, rerender } = render(<Avatar src="/broken.jpg" text="Fallback User" />)
    fireEvent.error(container.querySelector('img') as Element)
    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByText('FU')).toBeInTheDocument()

    rerender(<Avatar src="/ok.jpg" text="Fallback User" />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/ok.jpg')
  })

  it('forwards ref and binds img native attributes', () => {
    const ref = createRef<HTMLSpanElement>()
    const onError = vi.fn()
    const { container } = render(
      <Avatar ref={ref} src="/a.jpg" srcSet="a-2x.jpg 2x" alt="Ada" onError={onError} />
    )
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('srcset', 'a-2x.jpg 2x')
    fireEvent.error(img as Element)
    expect(onError).toHaveBeenCalled()
  })

  it('applies a hex bgColor as a style', () => {
    const { container } = render(<Avatar text="T" bgColor="#3b82f6" />)
    const avatar = screen.getByRole('img', { name: 'T' }) as HTMLElement
    expect(avatar.style.backgroundColor).toBe('#3b82f6')
    expect(container.firstElementChild?.className).not.toContain('#3b82f6')
  })

  it('passes accessibility checks for named and decorative states', async () => {
    const { container } = render(
      <>
        <Avatar text="John Doe" />
        <Avatar src="/a.jpg" text="Jane" />
        <Avatar src="/a.jpg" aria-label="Jane" />
        <Avatar src="/a.jpg" alt="Jane" />
        <Avatar src="/a.jpg" />
      </>
    )
    expect(screen.getAllByRole('img', { name: 'Jane' })).toHaveLength(3)
    await expectNoA11yViolationsIsolated(container)
  })
})

describe('AvatarGroup', () => {
  it('shows overflow for extra avatars and names it', () => {
    render(
      <AvatarGroup max={3} size="md">
        <Avatar text="A" />
        <Avatar text="B" />
        <Avatar text="陈晨" />
        <Avatar text="赵六" />
      </AvatarGroup>
    )
    const overflow = screen.getByRole('button', { name: '1 more' })
    expect(overflow).toHaveTextContent('+1')
    expect(overflow).toHaveClass('-ms-1')
    expect(screen.getByRole('img', { name: '陈晨' })).toHaveClass('-ms-2')
  })

  it('ignores non-avatar children when counting max', () => {
    render(
      <AvatarGroup max={1}>
        <Avatar text="A" />
        {false && <Avatar text="Hidden" />}
        <span>not-avatar</span>
        <Avatar text="B" />
      </AvatarGroup>
    )
    expect(screen.getByRole('button', { name: '1 more' })).toBeInTheDocument()
    expect(screen.getByText('not-avatar')).toBeInTheDocument()
  })

  it('applies group shape to overflow', () => {
    render(
      <AvatarGroup max={0} shape="square">
        <Avatar text="A" />
        <Avatar text="B" />
      </AvatarGroup>
    )
    const overflow = screen.getByRole('button', { name: '2 more' })
    expect(overflow.className).toContain('--tiger-radius-md')
    expect(overflow.className).not.toContain('-ms-2')
  })

  it('uses official locale objects for the group name', () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <AvatarGroup>
          <Avatar text="A" />
        </AvatarGroup>
      </ConfigProvider>
    )
    expect(screen.getByRole('group', { name: '头像组' })).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={zhTW}>
        <AvatarGroup>
          <Avatar text="A" />
        </AvatarGroup>
      </ConfigProvider>
    )
    expect(screen.getByRole('group', { name: '頭像組' })).toBeInTheDocument()
  })

  it('lets an explicit avatar size override the group size', () => {
    render(
      <AvatarGroup size="sm">
        <Avatar text="AB" size="lg" />
      </AvatarGroup>
    )
    expect(screen.getByRole('img', { name: 'AB' }).className).toContain(
      '--tiger-component-avatar-size-lg'
    )
  })

  it('passes accessibility checks with overflow', async () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <AvatarGroup max={1}>
          <Avatar text="A" />
          <Avatar text="B" />
        </AvatarGroup>
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '还有 1 位' })).toBeInTheDocument()
    await expectNoA11yViolationsIsolated(container)
  })
})
