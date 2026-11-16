/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { ActivityFeed } from '@expcat/tigercat-react/ActivityFeed'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import type { ActivityGroup } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('ActivityFeed (React)', () => {
  it('keeps the automatic virtual window and final action on the keyboard path', async () => {
    const user = userEvent.setup()
    const groups: ActivityGroup[] = [
      {
        key: 'today',
        title: 'Today',
        items: Array.from({ length: 45 }, (_, index) => ({
          id: index + 1,
          title: `Row ${index + 1}`,
          actions: [{ label: `Act ${index + 1}` }]
        }))
      }
    ]

    render(<ActivityFeed groups={groups} />)

    const scroller = screen.getByRole('list', { name: 'Activity' })
    expect(scroller).toHaveAttribute('tabindex', '0')
    expect(screen.queryByText('Row 45')).not.toBeInTheDocument()
    await user.tab()
    expect(scroller).toHaveFocus()

    for (let index = 0; index < 45; index++) {
      fireEvent.keyDown(scroller, { key: 'ArrowDown' })
    }

    expect(scroller.scrollTop).toBeGreaterThan(0)
    expect(screen.getByText('Row 45').closest('[role="listitem"]')).toHaveAttribute(
      'aria-posinset',
      '46'
    )
    const finalAction = screen.getByRole('button', { name: 'Act 45' })
    for (const button of within(scroller).getAllByRole('button')) {
      await user.tab()
      expect(button).toHaveFocus()
    }
    expect(finalAction).toHaveFocus()
  })

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

    const { container } = render(<ActivityFeed groups={groups} />)

    expect(screen.getByText('今天')).toBeInTheDocument()
    const rail = container.querySelector('.tiger-timeline') as HTMLElement | null
    expect(rail?.style.getPropertyValue('--tiger-timeline-anchor-center')).toContain(
      '--tiger-component-avatar-size-sm'
    )
    expect(rail?.querySelector('.tiger-timeline-node')).toBeTruthy()
    expect(screen.getByText('更新访问策略')).toBeInTheDocument()
    expect(screen.getByText('查看详情')).toBeInTheDocument()
    const statusChip = screen.getByText('已完成').parentElement
    expect(statusChip?.className).toContain('bg-current/10')
    expect(statusChip?.className).not.toContain('bg-opacity-')
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

  it('renders loading state', () => {
    render(<ActivityFeed loading loadingText="加载中..." />)

    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('hides group title when showGroupTitle is false', () => {
    const groups: ActivityGroup[] = [
      {
        key: 'today',
        title: '今天',
        items: [{ id: 1, title: 'A' }]
      }
    ]

    render(<ActivityFeed groups={groups} showGroupTitle={false} />)

    expect(screen.queryByText('今天')).not.toBeInTheDocument()
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('keeps a custom group header before and after the window opens', () => {
    const header = () => 'CUSTOM-HEADER'
    const short = render(
      <ActivityFeed
        groups={[
          {
            key: 'g',
            title: 'RealTitle',
            items: [
              { id: 1, title: 'A' },
              { id: 2, title: 'B' }
            ]
          }
        ]}
        renderGroupHeader={header}
      />
    )
    expect(short.getByText('CUSTOM-HEADER')).toBeInTheDocument()
    short.unmount()

    render(
      <ActivityFeed
        groups={[
          {
            key: 'g',
            title: 'RealTitle',
            items: Array.from({ length: 45 }, (_, index) => ({
              id: index + 1,
              title: `Row ${index + 1}`
            }))
          }
        ]}
        renderGroupHeader={header}
      />
    )
    expect(screen.getByText('CUSTOM-HEADER')).toBeInTheDocument()
  })

  it('puts a UTC evening item in the 2024-05-02 section', () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <ActivityFeed
          groupByDate
          timeZone="UTC"
          items={[{ id: 1, title: 'Evening', time: '2024-05-02T20:00:00.000Z' }]}
        />
      </ConfigProvider>
    )
    const section = container.querySelector('section')
    expect(section?.querySelector('[data-activity-date]')?.getAttribute('data-activity-date')).toBe(
      '2024-05-02'
    )
    expect(section?.textContent).toContain('Evening')
    expect(screen.getByRole('button', { name: '下一页' })).toBeInTheDocument()
  })

  it('retries a localized load error once', () => {
    const onLoadMore = vi.fn()
    render(
      <ConfigProvider locale={zhCN}>
        <ActivityFeed hasMore loadError items={[{ id: 1, title: 'One' }]} onLoadMore={onLoadMore} />
      </ConfigProvider>
    )
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toContain('无法加载更多动态')
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '重试' }))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  describe('locale', () => {
    it('uses ConfigProvider zh-CN empty copy when emptyText is omitted', () => {
      render(
        <ConfigProvider locale={zhCN}>
          <ActivityFeed items={[]} />
        </ConfigProvider>
      )
      expect(screen.getByText('暂无动态')).toBeInTheDocument()
    })

    it('uses ConfigProvider zh-CN loading text when loading', () => {
      render(
        <ConfigProvider locale={zhCN}>
          <ActivityFeed loading />
        </ConfigProvider>
      )
      expect(screen.getByText('加载中...')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<ActivityFeed />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
