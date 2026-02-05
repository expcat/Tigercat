/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { NotificationCenter } from '@expcat/tigercat-react'
import type { NotificationItem } from '@expcat/tigercat-core'

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
})
