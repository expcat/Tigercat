/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { defineComponent, h, ref } from 'vue'
import { CommentThread } from '@expcat/tigercat-vue/CommentThread'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import type { CommentNode } from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('CommentThread (Vue)', () => {
  it('renders nested replies when expanded', () => {
    const nodes: CommentNode[] = [
      {
        id: 1,
        content: 'Root comment',
        user: { name: 'A' },
        children: [
          {
            id: 2,
            parentId: 1,
            content: 'Child reply',
            user: { name: 'B' }
          }
        ]
      }
    ]

    render(CommentThread, { props: { nodes, defaultExpandedKeys: [1] } })

    expect(screen.getByText('Root comment')).toBeInTheDocument()
    expect(screen.getByText('Child reply')).toBeInTheDocument()
  })

  it('emits update:expandedKeys when toggling replies', async () => {
    const onUpdateExpandedKeys = vi.fn()
    const nodes: CommentNode[] = [
      {
        id: 1,
        content: 'Root comment',
        user: { name: 'A' },
        children: [{ id: 2, parentId: 1, content: 'Child reply', user: { name: 'B' } }]
      }
    ]

    render(CommentThread, {
      props: {
        nodes,
        'onUpdate:expandedKeys': onUpdateExpandedKeys
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: /Expand/ }))

    expect(onUpdateExpandedKeys).toHaveBeenCalledWith([1])
  })

  it('submits reply content', async () => {
    const onReply = vi.fn()
    const nodes: CommentNode[] = [
      {
        id: 1,
        content: 'Root comment',
        user: { name: 'A' }
      }
    ]

    render(CommentThread, {
      props: {
        nodes,
        replyButtonText: '发送回复',
        replyPlaceholder: '写下回复',
        onReply
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Reply' }))

    const input = screen.getAllByPlaceholderText('写下回复').at(-1) as HTMLTextAreaElement
    await fireEvent.update(input, 'Hello')

    await fireEvent.click(screen.getAllByRole('button', { name: '发送回复' }).at(-1)!)

    expect(onReply).toHaveBeenCalledTimes(1)
    expect(onReply).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, content: 'Root comment' }),
      'Hello'
    )
  })

  it('clips replies beyond maxDepth', () => {
    const nodes: CommentNode[] = [
      {
        id: 1,
        content: 'Root',
        user: { name: 'A' },
        children: [
          {
            id: 2,
            parentId: 1,
            content: 'Child',
            user: { name: 'B' }
          }
        ]
      }
    ]

    render(CommentThread, { props: { nodes, defaultExpandedKeys: [1], maxDepth: 1 } })

    expect(screen.getByText('Root')).toBeInTheDocument()
    expect(screen.queryByText('Child')).not.toBeInTheDocument()
  })

  it('triggers load more when replies exceed maxReplies', async () => {
    const onLoadMore = vi.fn()
    const nodes: CommentNode[] = [
      {
        id: 1,
        content: 'Root',
        user: { name: 'A' },
        children: [
          { id: 2, parentId: 1, content: 'Child A', user: { name: 'B' } },
          { id: 3, parentId: 1, content: 'Child B', user: { name: 'C' } }
        ]
      }
    ]

    render(CommentThread, {
      props: { nodes, defaultExpandedKeys: [1], maxReplies: 1 },
      attrs: { onLoadMore }
    })

    expect(screen.queryByText('Child B')).not.toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: /Show remaining 1/ }))
    expect(screen.getByText('Child B')).toBeInTheDocument()
    expect(onLoadMore).not.toHaveBeenCalled()

    await fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    expect(onLoadMore).toHaveBeenCalledWith(expect.objectContaining({ id: 1, content: 'Root' }))
  })
  it('renders empty state when no nodes provided', () => {
    render(CommentThread, { props: { nodes: [] } })
    expect(screen.getByRole('feed', { name: 'Comment thread' })).toBeInTheDocument()
  })

  it('renders emptyText when nodes is empty', () => {
    render(CommentThread, { props: { nodes: [], emptyText: '暂无评论' } })
    expect(screen.getByText('暂无评论')).toBeInTheDocument()
  })

  it('renders comment with user name', () => {
    const nodes: CommentNode[] = [{ id: 1, content: 'Hello', user: { name: '张三' } }]

    render(CommentThread, { props: { nodes } })
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getAllByText('张三')).toHaveLength(2)
  })

  it('renders comment with time', () => {
    const nodes: CommentNode[] = [{ id: 1, content: 'Hello', user: { name: 'A' }, time: '10:30' }]

    render(CommentThread, { props: { nodes } })
    expect(screen.getByText('10:30')).toBeInTheDocument()
  })

  it('renders status tags with Tailwind v4 opacity classes', () => {
    const nodes: CommentNode[] = [
      {
        id: 1,
        content: 'Tagged',
        user: { name: 'A' },
        tag: { label: 'Owner', variant: 'primary' },
        tags: [{ label: 'Pinned', variant: 'success' }]
      }
    ]

    render(CommentThread, { props: { nodes } })

    for (const label of ['Owner', 'Pinned']) {
      const tag = screen.getByText(label).parentElement
      expect(tag?.className).toContain('bg-current/10')
      expect(tag?.className).not.toContain('bg-opacity-')
    }
  })

  it('hides avatar when showAvatar is false', () => {
    const nodes: CommentNode[] = [
      { id: 1, content: 'Hello', user: { name: 'A', avatar: '/avatar.png' } }
    ]

    const { container } = render(CommentThread, { props: { nodes, showAvatar: false } })
    expect(container.querySelector('img[src="/avatar.png"]')).not.toBeInTheDocument()
  })

  it('renders multiple root comments', () => {
    const nodes: CommentNode[] = [
      { id: 1, content: 'First', user: { name: 'A' } },
      { id: 2, content: 'Second', user: { name: 'B' } },
      { id: 3, content: 'Third', user: { name: 'C' } }
    ]

    render(CommentThread, { props: { nodes } })
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
    expect(screen.getByText('Third')).toBeInTheDocument()
  })

  it('cancels reply input', async () => {
    const nodes: CommentNode[] = [{ id: 1, content: 'Root', user: { name: 'A' } }]

    render(CommentThread, {
      props: { nodes, cancelReplyText: '取消回复', replyPlaceholder: '写下回复' }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Reply' }))
    expect(screen.getAllByPlaceholderText('写下回复').length).toBeGreaterThan(1)

    await fireEvent.click(screen.getByRole('button', { name: '取消回复' }))
    expect(screen.queryByRole('button', { name: '取消回复' })).not.toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('写下回复')).toHaveLength(1)
  })

  it('renders deeply nested replies within maxDepth', () => {
    const nodes: CommentNode[] = [
      {
        id: 1,
        content: 'Level 0',
        user: { name: 'A' },
        children: [
          {
            id: 2,
            parentId: 1,
            content: 'Level 1',
            user: { name: 'B' },
            children: [
              {
                id: 3,
                parentId: 2,
                content: 'Level 2',
                user: { name: 'C' }
              }
            ]
          }
        ]
      }
    ]

    render(CommentThread, { props: { nodes, defaultExpandedKeys: [1, 2], maxDepth: 3 } })
    expect(screen.getByText('Level 0')).toBeInTheDocument()
    expect(screen.getByText('Level 1')).toBeInTheDocument()
    expect(screen.getByText('Level 2')).toBeInTheDocument()
  })

  it('shows like button with count', () => {
    const nodes: CommentNode[] = [
      { id: 1, content: 'Likeable', user: { name: 'A' }, likes: 5, liked: false }
    ]

    render(CommentThread, { props: { nodes, showLike: true } })
    expect(screen.getByRole('button', { name: /Like\s+5/ })).toBeInTheDocument()
  })

  describe('like overlay', () => {
    const likeNodes: CommentNode[] = [{ id: 1, content: 'Root', user: { name: 'A' }, likes: 3 }]

    it('updates Like 3 to Liked 4 without a parent write-back', async () => {
      render(CommentThread, { props: { nodes: likeNodes } })

      await fireEvent.click(screen.getByRole('button', { name: /Like\s+3/ }))
      expect(screen.getByRole('button', { name: /Liked\s+4/ })).toBeInTheDocument()

      await fireEvent.click(screen.getByRole('button', { name: /Liked\s+4/ }))
      expect(screen.getByRole('button', { name: /Like\s+3/ })).toBeInTheDocument()
    })

    it('emits like and still shows Liked 4 from the overlay', async () => {
      const onLike = vi.fn()
      render(CommentThread, { props: { nodes: likeNodes, onLike } })

      await fireEvent.click(screen.getByRole('button', { name: /Like\s+3/ }))

      expect(onLike).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), true)
      expect(screen.getByRole('button', { name: /Liked\s+4/ })).toBeInTheDocument()
    })

    it('does not double-count when the parent writes liked/likes back', async () => {
      const Wrapper = defineComponent({
        setup() {
          const comments = ref<CommentNode[]>([{ ...likeNodes[0] }])
          const onLike = (node: CommentNode, liked: boolean) => {
            comments.value = comments.value.map((item) =>
              item.id === node.id
                ? {
                    ...item,
                    liked,
                    likes: Math.max(0, (item.likes ?? 0) + (liked ? 1 : -1))
                  }
                : item
            )
          }
          return () => h(CommentThread, { nodes: comments.value, onLike })
        }
      })

      render(Wrapper)
      await fireEvent.click(screen.getByRole('button', { name: /Like\s+3/ }))
      expect(screen.getByRole('button', { name: /Liked\s+4/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Liked\s+5/ })).not.toBeInTheDocument()
    })

    it('lets a parent write-back reject the overlay', async () => {
      const Wrapper = defineComponent({
        setup() {
          const comments = ref<CommentNode[]>([{ ...likeNodes[0] }])
          const onLike = () => {
            comments.value = comments.value.map((item) => ({
              ...item,
              liked: false,
              likes: 3
            }))
          }
          return () => h(CommentThread, { nodes: comments.value, onLike })
        }
      })

      render(Wrapper)
      await fireEvent.click(screen.getByRole('button', { name: /Like\s+3/ }))
      expect(screen.getByRole('button', { name: /Like\s+3/ })).toBeInTheDocument()
    })

    it('uses ConfigProvider zh-CN overlay copy 点赞 3 → 已赞 4', async () => {
      const Wrapper = defineComponent({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhCN }, () => h(CommentThread, { nodes: likeNodes }))
        }
      })
      render(Wrapper)
      await fireEvent.click(screen.getByRole('button', { name: /点赞\s+3/ }))
      expect(screen.getByRole('button', { name: /已赞\s+4/ })).toBeInTheDocument()
    })
  })

  describe('locale', () => {
    it('uses ConfigProvider zh-CN for like and expand replies', () => {
      const nodes: CommentNode[] = [
        {
          id: 1,
          content: 'Root comment',
          user: { name: 'A' },
          likes: 2,
          children: [{ id: 2, parentId: 1, content: 'Child reply', user: { name: 'B' } }]
        }
      ]
      const Wrapper = defineComponent({
        setup() {
          return () => h(ConfigProvider, { locale: zhCN }, () => h(CommentThread, { nodes }))
        }
      })
      render(Wrapper)
      expect(screen.getByRole('button', { name: /点赞/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /展开 1 条回复/ })).toBeInTheDocument()
    })

    it('uses ConfigProvider en-US for like and expand replies', () => {
      const nodes: CommentNode[] = [
        {
          id: 1,
          content: 'Root comment',
          user: { name: 'A' },
          likes: 2,
          children: [{ id: 2, parentId: 1, content: 'Child reply', user: { name: 'B' } }]
        }
      ]
      const Wrapper = defineComponent({
        setup() {
          return () => h(ConfigProvider, { locale: enUS }, () => h(CommentThread, { nodes }))
        }
      })
      render(Wrapper)
      expect(screen.getByRole('button', { name: /Like/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Expand 1 replies/ })).toBeInTheDocument()
    })

    it('uses ConfigProvider zh-CN collapse copy when expanded', () => {
      const nodes: CommentNode[] = [
        {
          id: 1,
          content: 'Root comment',
          user: { name: 'A' },
          children: [{ id: 2, parentId: 1, content: 'Child reply', user: { name: 'B' } }]
        }
      ]
      const Wrapper = defineComponent({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhCN }, () =>
              h(CommentThread, { nodes, defaultExpandedKeys: [1] })
            )
        }
      })
      render(Wrapper)
      expect(screen.getByRole('button', { name: /收起回复/ })).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(CommentThread)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
