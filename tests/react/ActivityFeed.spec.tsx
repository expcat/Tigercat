/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ActivityFeed } from '@expcat/tigercat-react'
import type { ActivityGroup } from '@expcat/tigercat-core'

describe('ActivityFeed (React)', () => {
  it('renders group title and items', () => {
    const groups: ActivityGroup[] = [
      {
        key: 'today',
        title: '今天',
        items: [
          {
            id: 1,
            title: '更新访问策略',
            description: '策略已生效',
            time: '09:30',
            status: { label: '已完成', variant: 'success' },
            actions: [{ label: '查看详情', href: '#' }]
          }
        ]
      }
    ]

    render(<ActivityFeed groups={groups} />)

    expect(screen.getByText('今天')).toBeInTheDocument()
    expect(screen.getByText('更新访问策略')).toBeInTheDocument()
    expect(screen.getByText('查看详情')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(<ActivityFeed items={[]} emptyText="暂无活动" />)

    expect(screen.getByText('暂无活动')).toBeInTheDocument()
  })

  it('groups items by groupBy function and respects groupOrder', () => {
    const items = [
      { id: 1, title: '任务A', category: 'work' },
      { id: 2, title: '任务B', category: 'personal' },
      { id: 3, title: '任务C', category: 'work' },
      { id: 4, title: '任务D', category: 'personal' }
    ]

    const groupBy = (item: { category: string }) => item.category
    const groupOrder = ['personal', 'work']

    render(<ActivityFeed items={items} groupBy={groupBy} groupOrder={groupOrder} />)

    expect(screen.getByText('personal')).toBeInTheDocument()
    expect(screen.getByText('work')).toBeInTheDocument()
    expect(screen.getByText('任务A')).toBeInTheDocument()
    expect(screen.getByText('任务B')).toBeInTheDocument()
    expect(screen.getByText('任务C')).toBeInTheDocument()
    expect(screen.getByText('任务D')).toBeInTheDocument()

    const groupHeaders = screen.getAllByText(/^(personal|work)$/)
    expect(groupHeaders[0]).toHaveTextContent('personal')
    expect(groupHeaders[1]).toHaveTextContent('work')
  })
})
