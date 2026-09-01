import { describe, it, expect } from 'vitest'
import {
  buildNotificationGroups,
  shouldUseNotificationTabs,
  sortNotificationGroups,
  type NotificationGroup,
  type NotificationItem
} from '@expcat/tigercat-core'

const groups: NotificationGroup[] = [
  { key: 'updates', title: 'Updates', items: [] },
  { key: 'alerts', title: 'Alerts', items: [] },
  { key: 'system', title: 'System', items: [] }
]

describe('notification-center-utils', () => {
  it('returns the original group array when no order is provided', () => {
    expect(sortNotificationGroups(groups)).toBe(groups)
    expect(sortNotificationGroups(groups, [])).toBe(groups)
  })

  it('sorts groups by key according to groupOrder', () => {
    expect(sortNotificationGroups(groups, ['system', 'alerts']).map((group) => group.key)).toEqual([
      'system',
      'alerts',
      'updates'
    ])
  })

  it('falls back to title when a group has no key', () => {
    const noKeyGroups: NotificationGroup[] = [
      { title: 'Default', items: [] },
      { key: 'alerts', title: 'Alerts', items: [] }
    ]

    expect(
      sortNotificationGroups(noKeyGroups, ['alerts', 'Default']).map((group) => group.title)
    ).toEqual(['Alerts', 'Default'])
  })

  it('preserves relative order for groups absent from groupOrder', () => {
    expect(sortNotificationGroups(groups, ['alerts']).map((group) => group.key)).toEqual([
      'alerts',
      'updates',
      'system'
    ])
  })

  it('returns explicit groups before deriving from items', () => {
    const result = buildNotificationGroups(
      [{ id: 'n1', title: 'Ignored', type: 'info' }],
      groups,
      undefined,
      ['alerts']
    )

    expect(result.map((group) => group.key)).toEqual(['alerts', 'updates', 'system'])
  })

  it('does not fall back to items when groups is an empty array', () => {
    expect(buildNotificationGroups([{ id: 'n1', title: 'Still here' }], [])).toEqual([])
  })

  it('treats a group with missing items as an empty list', () => {
    const result = buildNotificationGroups(undefined, [{ key: 'alerts', title: 'Alerts' } as never])
    expect(result[0]?.items).toEqual([])
  })

  it('returns an empty array for empty item input', () => {
    expect(buildNotificationGroups()).toEqual([])
    expect(buildNotificationGroups([])).toEqual([])
  })

  it('opens Tabs only when groups or groupBy is passed', () => {
    expect(shouldUseNotificationTabs(undefined, undefined)).toBe(false)
    expect(shouldUseNotificationTabs([], undefined)).toBe(true)
    expect(shouldUseNotificationTabs(undefined, (item) => String(item.type))).toBe(true)
  })

  it('does not tab-group items unless groupBy or groups is passed', () => {
    const items: NotificationItem[] = [
      { id: 'n1', title: 'Info', type: 'info' },
      { id: 'n2', title: 'Warning', type: 'warning' },
      { id: 'n3', title: 'Default' }
    ]

    expect(buildNotificationGroups(items)).toEqual([])
  })

  it('groups items with an explicit groupBy function', () => {
    const items: NotificationItem[] = [
      { id: 'n1', title: 'Info', type: 'info' },
      { id: 'n2', title: 'Warning', type: 'warning' },
      { id: 'n3', title: 'Default' }
    ]

    const result = buildNotificationGroups(
      items,
      undefined,
      (item) => String(item.type ?? 'Default'),
      ['warning', 'Default']
    )

    expect(result.map((group) => group.key)).toEqual(['warning', 'Default', 'info'])
    expect(result.find((group) => group.key === 'info')?.items).toHaveLength(1)
  })

  it('groups items with a custom grouping function', () => {
    const items: NotificationItem[] = [
      { id: 'n1', title: 'One', read: true },
      { id: 'n2', title: 'Two', read: false },
      { id: 'n3', title: 'Three', read: false }
    ]

    const result = buildNotificationGroups(
      items,
      undefined,
      (item) => (item.read ? 'read' : 'unread'),
      ['unread', 'read']
    )

    expect(result.map((group) => [group.key, group.items.length])).toEqual([
      ['unread', 2],
      ['read', 1]
    ])
  })
})
