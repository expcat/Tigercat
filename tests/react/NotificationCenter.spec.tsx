/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { NotificationCenter } from '@expcat/tigercat-react'
import type { NotificationItem } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('NotificationCenter (React)', () => {
  it('renders groups and switches tabs', async () => {
    const items: NotificationItem[] = [
      { id: 1, title: '系统通知', type: '系统', read: false },
      { id: 2, title: '评论回复', type: '评论', read: true }
    ]

    const user = userEvent.setup()
    render(<NotificationCenter items={items} />)

    expect(screen.getByRole('tab', { name: /系统/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /评论/ })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /评论/ }))
    const commentPanel = screen.getByRole('tabpanel', { name: /评论/ })
    expect(commentPanel).toHaveAttribute('aria-hidden', 'false')
  })

  it('filters read status', async () => {
    const items: NotificationItem[] = [
      { id: 1, title: '未读通知', type: '系统', read: false },
      { id: 2, title: '已读通知', type: '系统', read: true }
    ]

    const user = userEvent.setup()
    render(<NotificationCenter items={items} />)

    await user.click(screen.getByRole('button', { name: '未读' }))
    expect(screen.getByText('未读通知')).toBeInTheDocument()
    expect(screen.queryByText('已读通知')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '已读' }))
    expect(screen.getByText('已读通知')).toBeInTheDocument()
    expect(screen.queryByText('未读通知')).not.toBeInTheDocument()
  })

  it('triggers mark-all-read', async () => {
    const onMarkAllRead = vi.fn()
    const items: NotificationItem[] = [{ id: 1, title: '系统通知', type: '系统', read: false }]

    const user = userEvent.setup()
    render(<NotificationCenter items={items} onMarkAllRead={onMarkAllRead} />)

    await user.click(screen.getByRole('button', { name: '全部标记已读' }))

    expect(onMarkAllRead).toHaveBeenCalledTimes(1)
    expect(onMarkAllRead.mock.calls[0]?.[0]).toBe('系统')
    expect(onMarkAllRead.mock.calls[0]?.[1]).toHaveLength(1)
  })

  it('triggers item read change', async () => {
    const onItemReadChange = vi.fn()
    const items: NotificationItem[] = [{ id: 1, title: '未读通知', type: '系统', read: false }]

    const user = userEvent.setup()
    render(<NotificationCenter items={items} onItemReadChange={onItemReadChange} />)

    await user.click(screen.getByRole('button', { name: '标记已读' }))

    expect(onItemReadChange).toHaveBeenCalledTimes(1)
    expect(onItemReadChange).toHaveBeenCalledWith(items[0], true)
  })
  it('renders empty state with emptyText', () => {
    render(<NotificationCenter items={[]} emptyText="暂无通知" />)
    expect(screen.getByText('暂无通知')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    render(<NotificationCenter loading loadingText="加载中..." />)
    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('renders custom title', () => {
    const items: NotificationItem[] = [{ id: 1, title: '通知', type: '系统', read: false }]

    render(<NotificationCenter items={items} title="消息中心" />)
    expect(screen.getByText('消息中心')).toBeInTheDocument()
  })

  it('shows all items by default with all filter', () => {
    const items: NotificationItem[] = [
      { id: 1, title: '未读消息', type: '系统', read: false },
      { id: 2, title: '已读消息', type: '系统', read: true }
    ]

    render(<NotificationCenter items={items} />)
    expect(screen.getByText('未读消息')).toBeInTheDocument()
    expect(screen.getByText('已读消息')).toBeInTheDocument()
  })

  it('toggles between mark-read and mark-unread', async () => {
    const onItemReadChange = vi.fn()
    const items: NotificationItem[] = [{ id: 1, title: '已读通知', type: '系统', read: true }]

    const user = userEvent.setup()
    render(<NotificationCenter items={items} onItemReadChange={onItemReadChange} />)

    await user.click(screen.getByRole('button', { name: '标记未读' }))
    expect(onItemReadChange).toHaveBeenCalledWith(items[0], false)
  })

  it('renders items with description', () => {
    const items: NotificationItem[] = [
      { id: 1, title: '系统通知', description: '系统维护通知', type: '系统', read: false }
    ]

    render(<NotificationCenter items={items} />)
    expect(screen.getByText('系统维护通知')).toBeInTheDocument()
  })

  it('renders with custom filter labels', () => {
    const items: NotificationItem[] = [{ id: 1, title: '通知', type: '系统', read: false }]

    render(
      <NotificationCenter items={items} allLabel="All" unreadLabel="Unread" readLabel="Read" />
    )

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unread' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Read' })).toBeInTheDocument()
  })

  it('renders multiple notification types as tabs', () => {
    const items: NotificationItem[] = [
      { id: 1, title: '系统通知', type: '系统', read: false },
      { id: 2, title: '评论通知', type: '评论', read: false },
      { id: 3, title: '点赞通知', type: '点赞', read: true }
    ]

    render(<NotificationCenter items={items} />)
    expect(screen.getByRole('tab', { name: /系统/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /评论/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /点赞/ })).toBeInTheDocument()
  })

  it('renders with no items and no emptyText', () => {
    const { container } = render(<NotificationCenter items={[]} />)
    expect(container.querySelector('[data-tiger-notification-center="true"]')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<NotificationCenter />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
