/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, Comment } from 'vue'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Avatar } from '@expcat/tigercat-vue/Avatar'
import { AvatarGroup } from '@expcat/tigercat-vue/AvatarGroup'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Avatar', () => {
  it('renders text initials with accessible label', () => {
    render(Avatar, { props: { text: 'John Doe' } })
    expect(screen.getByText('JD')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'John Doe' })).toBeInTheDocument()
  })

  it('renders a no-space two-letter token as-is', () => {
    render(Avatar, { props: { text: 'TC' } })
    expect(screen.getByText('TC')).toBeInTheDocument()
  })

  it('puts the computed name on the image', () => {
    const { rerender } = render(Avatar, { props: { src: '/photo.jpg', text: 'Jane Doe' } })
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute('src', '/photo.jpg')

    rerender({ src: '/photo.jpg', text: undefined })
    render(Avatar, {
      props: { src: '/photo.jpg' },
      attrs: { 'aria-label': 'Jane' }
    })
    expect(screen.getByRole('img', { name: 'Jane' })).toBeInTheDocument()
  })

  it('treats unlabeled image avatar as decorative', () => {
    const { container } = render(Avatar, {
      props: { src: '/test-avatar.jpg' },
      attrs: { 'data-testid': 'avatar' }
    })
    expect(container.querySelector('[data-testid="avatar"]')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('retries after src changes following an error', async () => {
    const { container, rerender } = render(Avatar, {
      props: { src: '/broken.jpg', text: 'Fallback User' }
    })
    await fireEvent.error(container.querySelector('img') as Element)
    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByText('FU')).toBeInTheDocument()

    await rerender({ src: '/ok.jpg', text: 'Fallback User' })
    expect(container.querySelector('img')).toHaveAttribute('src', '/ok.jpg')
  })

  it('binds srcSet on the image and emits error', async () => {
    const onError = vi.fn()
    const { container } = render(Avatar, {
      props: { src: '/a.jpg', srcSet: 'a-2x.jpg 2x', alt: 'Ada' },
      attrs: { onError }
    })
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('srcset', 'a-2x.jpg 2x')
    await fireEvent.error(img as Element)
    expect(onError).toHaveBeenCalled()
  })

  it('applies a hex bgColor as a style', () => {
    render(Avatar, { props: { text: 'T', bgColor: '#3b82f6' } })
    const avatar = screen.getByRole('img', { name: 'T' }) as HTMLElement
    expect(avatar.style.backgroundColor).toBe('#3b82f6')
  })

  it('passes accessibility checks for named and decorative states', async () => {
    const { container } = render({
      components: { Avatar },
      template: `
        <div>
          <Avatar text="John Doe" />
          <Avatar src="/a.jpg" text="Jane" />
          <Avatar src="/a.jpg" alt="Jane" />
          <Avatar src="/a.jpg" />
        </div>
      `
    })
    expect(screen.getAllByRole('img', { name: 'Jane' })).toHaveLength(2)
    await expectNoA11yViolationsIsolated(container)
  })
})

describe('AvatarGroup', () => {
  it('shows overflow for extra avatars and names it', () => {
    render({
      components: { AvatarGroup, Avatar },
      template: `
        <AvatarGroup :max="2">
          <Avatar text="A" />
          <Avatar text="B" />
          <Avatar text="C" />
          <Avatar text="D" />
        </AvatarGroup>
      `
    })
    expect(screen.getByRole('img', { name: '2 more' })).toHaveTextContent('+2')
  })

  it('ignores v-if false placeholders when counting max', () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(AvatarGroup, { max: 1 }, () => [
            h(Avatar, { text: 'A' }),
            h(Comment),
            h(Avatar, { text: 'B' })
          ])
      }
    })
    render(Host)
    expect(screen.getByRole('img', { name: '1 more' })).toBeInTheDocument()
  })

  it('applies group shape to overflow', () => {
    render({
      components: { AvatarGroup, Avatar },
      template: `
        <AvatarGroup :max="0" shape="square">
          <Avatar text="A" />
          <Avatar text="B" />
        </AvatarGroup>
      `
    })
    const overflow = screen.getByRole('img', { name: '2 more' })
    expect(overflow.className).toContain('--tiger-radius-md')
    expect(overflow.className).not.toContain('-ms-2')
  })

  it('uses official locale objects for the group name', () => {
    render({
      components: { ConfigProvider, AvatarGroup, Avatar },
      setup: () => ({ zhCN }),
      template:
        '<ConfigProvider :locale="zhCN"><AvatarGroup><Avatar text="A" /></AvatarGroup></ConfigProvider>'
    })
    expect(screen.getByRole('group', { name: '头像组' })).toBeInTheDocument()
  })

  it('uses zhTW overflow copy, not English', () => {
    render({
      components: { ConfigProvider, AvatarGroup, Avatar },
      setup: () => ({ zhTW }),
      template: `
        <ConfigProvider :locale="zhTW">
          <AvatarGroup :max="1">
            <Avatar text="A" />
            <Avatar text="B" />
          </AvatarGroup>
        </ConfigProvider>
      `
    })
    expect(screen.getByRole('group', { name: '頭像組' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '還有 1 位' })).toBeInTheDocument()
  })

  it('lets an explicit avatar size override the group size', () => {
    render({
      components: { AvatarGroup, Avatar },
      template: `
        <AvatarGroup size="sm">
          <Avatar text="AB" size="lg" />
        </AvatarGroup>
      `
    })
    expect(screen.getByRole('img', { name: 'AB' }).className).toContain(
      '--tiger-component-avatar-size-lg'
    )
  })

  it('passes accessibility checks with overflow', async () => {
    const { container } = render({
      components: { ConfigProvider, AvatarGroup, Avatar },
      setup: () => ({ zhCN }),
      template: `
        <ConfigProvider :locale="zhCN">
          <AvatarGroup :max="1">
            <Avatar text="A" />
            <Avatar text="B" />
          </AvatarGroup>
        </ConfigProvider>
      `
    })
    expect(screen.getByRole('img', { name: '还有 1 位' })).toBeInTheDocument()
    await expectNoA11yViolationsIsolated(container)
  })
})
