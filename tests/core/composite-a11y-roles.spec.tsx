/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { render as renderReact, screen as reactScreen } from '@testing-library/react'
import { render as renderVue, screen as vueScreen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import type { NotificationItem, CommentNode, TableColumn } from '@expcat/tigercat-core'
import {
  NotificationCenter as ReactNotificationCenter,
  ActivityFeed as ReactActivityFeed,
  CommentThread as ReactCommentThread,
  DataTableWithToolbar as ReactDataTableWithToolbar
} from '@expcat/tigercat-react'
import {
  NotificationCenter as VueNotificationCenter,
  ActivityFeed as VueActivityFeed,
  CommentThread as VueCommentThread,
  DataTableWithToolbar as VueDataTableWithToolbar
} from '@expcat/tigercat-vue'

const notificationItems: NotificationItem[] = [
  { id: 1, title: '系统通知', type: '系统', read: false }
]

const commentNodes: CommentNode[] = [{ id: 1, content: 'Hello', user: { name: 'A' } }]

const columns: TableColumn[] = [{ key: 'name', title: 'Name' }]

// ── NotificationCenter ───────────────────────────────────────────

describe('NotificationCenter ARIA roles', () => {
  it('React: has role=region and aria-label from title prop', () => {
    renderReact(<ReactNotificationCenter items={notificationItems} />)
    const region = reactScreen.getByRole('region')
    expect(region).toHaveAttribute('aria-label', '通知中心')
  })

  it('React: respects custom aria-label', () => {
    renderReact(<ReactNotificationCenter items={notificationItems} aria-label="Notifications" />)
    const region = reactScreen.getByRole('region')
    expect(region).toHaveAttribute('aria-label', 'Notifications')
  })

  it('Vue: has role=region and aria-label from title prop', () => {
    renderVue(VueNotificationCenter, { props: { items: notificationItems } })
    const region = vueScreen.getByRole('region')
    expect(region).toHaveAttribute('aria-label', '通知中心')
  })

  it('Vue: respects custom title prop as aria-label', () => {
    renderVue(VueNotificationCenter, {
      props: { items: notificationItems, title: 'My Notifications' }
    })
    const region = vueScreen.getByRole('region')
    expect(region).toHaveAttribute('aria-label', 'My Notifications')
  })
})

// ── ActivityFeed ─────────────────────────────────────────────────

describe('ActivityFeed ARIA roles', () => {
  it('React: has role=feed and default aria-label', () => {
    renderReact(<ReactActivityFeed items={[{ id: 1, title: 'Activity', type: '更新' }]} />)
    const feed = reactScreen.getByRole('feed')
    expect(feed).toHaveAttribute('aria-label', '动态')
  })

  it('React: loading state has aria-busy', () => {
    renderReact(<ReactActivityFeed loading />)
    const feed = reactScreen.getByRole('feed')
    expect(feed).toHaveAttribute('aria-busy', 'true')
  })

  it('Vue: has role=feed and default aria-label', () => {
    renderVue(VueActivityFeed, {
      props: { items: [{ id: 1, title: 'Activity', type: '更新' }] }
    })
    const feed = vueScreen.getByRole('feed')
    expect(feed).toHaveAttribute('aria-label', '动态')
  })

  it('Vue: loading state has aria-busy', () => {
    renderVue(VueActivityFeed, { props: { loading: true } })
    const feed = vueScreen.getByRole('feed')
    expect(feed).toHaveAttribute('aria-busy', 'true')
  })
})

// ── CommentThread ────────────────────────────────────────────────

describe('CommentThread ARIA roles', () => {
  it('React: has role=feed and default aria-label', () => {
    renderReact(<ReactCommentThread nodes={commentNodes} />)
    const feed = reactScreen.getByRole('feed')
    expect(feed).toHaveAttribute('aria-label', '评论线程')
  })

  it('Vue: has role=feed and default aria-label', () => {
    renderVue(VueCommentThread, { props: { nodes: commentNodes } })
    const feed = vueScreen.getByRole('feed')
    expect(feed).toHaveAttribute('aria-label', '评论线程')
  })
})

// ── DataTableWithToolbar ─────────────────────────────────────────

describe('DataTableWithToolbar ARIA roles', () => {
  it('React: toolbar has role=toolbar and aria-label', () => {
    renderReact(
      <ReactDataTableWithToolbar
        columns={columns}
        dataSource={[]}
        toolbar={{
          filters: [
            {
              key: 'status',
              label: '状态',
              options: [{ label: '启用', value: 'active' }]
            }
          ]
        }}
        pagination={false}
      />
    )
    const toolbar = reactScreen.getByRole('toolbar')
    expect(toolbar).toHaveAttribute('aria-label', '数据表格工具栏')
  })

  it('Vue: toolbar has role=toolbar and aria-label', () => {
    renderVue(VueDataTableWithToolbar, {
      props: {
        columns,
        dataSource: [],
        toolbar: {
          filters: [
            {
              key: 'status',
              label: '状态',
              options: [{ label: '启用', value: 'active' }]
            }
          ]
        },
        pagination: false
      }
    })
    const toolbar = vueScreen.getByRole('toolbar')
    expect(toolbar).toHaveAttribute('aria-label', '数据表格工具栏')
  })
})
