/**
 * NotificationCenter component utilities
 */

import type {
  NotificationGroup,
  NotificationItem,
  NotificationReadFilter
} from '../types/notification-center'

export const EMPTY_NOTIFICATION_ITEMS: NotificationItem[] = []
export const EMPTY_NOTIFICATION_GROUPS: NotificationGroup[] = []

const DEFAULT_GROUP_TITLE = 'Default'

export const sortNotificationGroups = (
  groups: NotificationGroup[],
  groupOrder?: string[]
): NotificationGroup[] => {
  if (!groupOrder || groupOrder.length === 0) {
    return groups
  }

  const orderMap = new Map<string, number>()
  groupOrder.forEach((key, index) => {
    orderMap.set(String(key), index)
  })

  return [...groups].sort((a, b) => {
    const aKey = String(a.key ?? a.title)
    const bKey = String(b.key ?? b.title)
    const aIndex = orderMap.get(aKey)
    const bIndex = orderMap.get(bKey)

    if (aIndex === undefined && bIndex === undefined) return 0
    if (aIndex === undefined) return 1
    if (bIndex === undefined) return -1

    return aIndex - bIndex
  })
}

function normalizeNotificationGroups(groups: NotificationGroup[]): NotificationGroup[] {
  return groups.map((group) => ({ ...group, items: group.items ?? [] }))
}

/**
 * Whether the inbox should render Tabs.
 *
 * Only an explicit `groups` prop or a `groupBy` function opens Tabs.
 * Passing `items` alone is a flat List.
 */
/** Read-state map key. `1` and `"1"` are one entry. */
export function notificationItemKey(id: string | number): string {
  return String(id)
}

const NOTIFICATION_READ_FILTER_ORDER = ['all', 'unread', 'read'] as const

/**
 * Move the read-state radio. Returns null when the key is not a radio key.
 * Home / End jump to the ends. Arrows move one step and stop at the ends.
 */
export function moveNotificationReadFilter(
  current: NotificationReadFilter,
  key: string
): NotificationReadFilter | null {
  const index = NOTIFICATION_READ_FILTER_ORDER.indexOf(current)
  if (index < 0) return null
  if (key === 'Home') return NOTIFICATION_READ_FILTER_ORDER[0]
  if (key === 'End') return NOTIFICATION_READ_FILTER_ORDER[NOTIFICATION_READ_FILTER_ORDER.length - 1]
  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return NOTIFICATION_READ_FILTER_ORDER[
      Math.min(NOTIFICATION_READ_FILTER_ORDER.length - 1, index + 1)
    ]
  }
  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return NOTIFICATION_READ_FILTER_ORDER[Math.max(0, index - 1)]
  }
  return null
}

/** Items this "mark all read" pass will change. Already-read rows stay out. */
export function notificationItemsPendingRead(
  items: readonly NotificationItem[]
): NotificationItem[] {
  return items.filter((item) => !item.read)
}

export function shouldUseNotificationTabs(
  groups?: NotificationGroup[] | null,
  groupBy?: (item: NotificationItem) => string
): boolean {
  return groups != null || typeof groupBy === 'function'
}

/**
 * Resolve grouped notifications.
 *
 * `groups` once passed (including `[]`) is the only source — empty groups do
 * not fall back to `items`. Without `groups` or `groupBy`, returns `[]` so
 * the renderer can keep a flat List. Empty `groupBy` keys use
 * `defaultGroupTitle` (locale "Default"), never a source `'default'` / CJK
 * literal.
 */
export const buildNotificationGroups = (
  items?: NotificationItem[],
  groups?: NotificationGroup[] | null,
  groupBy?: (item: NotificationItem) => string,
  groupOrder?: string[],
  defaultGroupTitle = DEFAULT_GROUP_TITLE
): NotificationGroup[] => {
  if (groups != null) {
    return sortNotificationGroups(normalizeNotificationGroups(groups), groupOrder)
  }

  if (typeof groupBy !== 'function') {
    return EMPTY_NOTIFICATION_GROUPS
  }

  const list = items ?? EMPTY_NOTIFICATION_ITEMS
  if (list.length === 0) {
    return EMPTY_NOTIFICATION_GROUPS
  }

  const groupMap = new Map<string, NotificationItem[]>()

  list.forEach((item) => {
    const key = groupBy(item) || defaultGroupTitle
    const bucket = groupMap.get(key)
    if (bucket) {
      bucket.push(item)
      return
    }
    groupMap.set(key, [item])
  })

  const mappedGroups = Array.from(groupMap.entries()).map(([key, groupItems]) => ({
    key,
    title: key,
    items: groupItems
  }))

  return sortNotificationGroups(mappedGroups, groupOrder)
}
