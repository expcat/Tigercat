/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
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
})
