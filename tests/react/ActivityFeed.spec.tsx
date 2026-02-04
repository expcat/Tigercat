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

  it('groups items with groupBy and groupOrder', () => {
    const items = [
      {
        id: 1,
        title: 'Item A',
        group: 'Group A'
      },
      {
        id: 2,
        title: 'Item B',
        group: 'Group B'
      }
    ]

    render(
      <ActivityFeed
        items={items}
        groupBy={(item) => String(item.group)}
        groupOrder={['Group B', 'Group A']}
      />
    )

    const first = screen.getByText('Group B')
    const second = screen.getByText('Group A')

    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText('Item A')).toBeInTheDocument()
    expect(screen.getByText('Item B')).toBeInTheDocument()
  })
})
