/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { NotificationCenter } from '@expcat/tigercat-vue'
import type { NotificationItem } from '@expcat/tigercat-core'

describe('NotificationCenter (Vue)', () => {
  it('renders groups and switches tabs', async () => {
    const items: NotificationItem[] = [
      { id: 1, title: '系统通知', type: '系统', read: false },
      { id: 2, title: '评论回复', type: '评论', read: true }
    ]

    render(NotificationCenter, { props: { items } })

    expect(screen.getByRole('tab', { name: /系统/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /评论/ })).toBeInTheDocument()

    await fireEvent.click(screen.getByRole('tab', { name: /评论/ }))
    const commentPanel = screen.getByRole('tabpanel', { name: /评论/ })
    expect(commentPanel).toHaveAttribute('aria-hidden', 'false')
  })

  it('filters read status', async () => {
    const items: NotificationItem[] = [
      { id: 1, title: '未读通知', type: '系统', read: false },
      { id: 2, title: '已读通知', type: '系统', read: true }
    ]

    render(NotificationCenter, { props: { items } })

    await fireEvent.click(screen.getByRole('button', { name: '未读' }))
    expect(screen.getByText('未读通知')).toBeInTheDocument()
    expect(screen.queryByText('已读通知')).not.toBeInTheDocument()

    await fireEvent.click(screen.getByRole('button', { name: '已读' }))
    expect(screen.getByText('已读通知')).toBeInTheDocument()
    expect(screen.queryByText('未读通知')).not.toBeInTheDocument()
  })

  it('triggers mark-all-read', async () => {
    const onMarkAllRead = vi.fn()
    const items: NotificationItem[] = [{ id: 1, title: '系统通知', type: '系统', read: false }]

    render(NotificationCenter, {
      props: { items },
      attrs: { onMarkAllRead }
    })

    await fireEvent.click(screen.getByRole('button', { name: '全部标记已读' }))

    expect(onMarkAllRead).toHaveBeenCalledTimes(1)
    expect(onMarkAllRead.mock.calls[0]?.[0]).toBe('系统')
    expect(onMarkAllRead.mock.calls[0]?.[1]).toHaveLength(1)
  })

  it('triggers item read change', async () => {
    const onItemReadChange = vi.fn()
    const items: NotificationItem[] = [{ id: 1, title: '未读通知', type: '系统', read: false }]

    render(NotificationCenter, {
      props: { items },
      attrs: { onItemReadChange }
    })

    await fireEvent.click(screen.getByRole('button', { name: '标记已读' }))

    expect(onItemReadChange).toHaveBeenCalledTimes(1)
    expect(onItemReadChange).toHaveBeenCalledWith(items[0], true)
  })
})
