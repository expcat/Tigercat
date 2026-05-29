/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { CommentThread } from '@expcat/tigercat-vue'
import type { CommentNode } from '@expcat/tigercat-core'
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

    await fireEvent.click(screen.getByRole('button', { name: '回复' }))

    const input = screen.getByPlaceholderText('写下回复') as HTMLTextAreaElement
    await fireEvent.update(input, 'Hello')

    await fireEvent.click(screen.getByRole('button', { name: '发送回复' }))

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

    await fireEvent.click(screen.getByRole('button', { name: '加载更多' }))

    expect(onLoadMore).toHaveBeenCalledTimes(1)
    expect(onLoadMore).toHaveBeenCalledWith(expect.objectContaining({ id: 1, content: 'Root' }))
  })
  it('renders empty state when no nodes provided', () => {
    render(CommentThread, { props: { nodes: [] } })
    expect(screen.getByRole('feed', { name: '评论线程' })).toBeInTheDocument()
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

    await fireEvent.click(screen.getByRole('button', { name: '回复' }))
    expect(screen.getByPlaceholderText('写下回复')).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: '取消回复' }))
    expect(screen.queryByPlaceholderText('写下回复')).not.toBeInTheDocument()
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
    expect(screen.getByRole('button', { name: /点赞\s+5/ })).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(CommentThread)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
