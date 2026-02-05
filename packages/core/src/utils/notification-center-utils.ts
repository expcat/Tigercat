/**
 * NotificationCenter component utilities
 */

import type { NotificationGroup, NotificationItem } from '../types/composite'

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

export const buildNotificationGroups = (
  items: NotificationItem[] = [],
  groups?: NotificationGroup[],
  groupBy?: (item: NotificationItem) => string,
  groupOrder?: string[]
): NotificationGroup[] => {
  if (groups && groups.length > 0) {
    return sortNotificationGroups(groups, groupOrder)
  }

  if (!items || items.length === 0) {
    return []
  }

  const groupFn = groupBy ?? ((item: NotificationItem) => String(item.type ?? 'default'))
  const groupMap = new Map<string, NotificationItem[]>()

  items.forEach((item) => {
    const key = groupFn(item)
    if (!groupMap.has(key)) {
      groupMap.set(key, [])
    }
    groupMap.get(key)?.push(item)
  })

  const mappedGroups = Array.from(groupMap.entries()).map(([key, groupItems]) => ({
    key,
    title: key,
    items: groupItems
  }))

  return sortNotificationGroups(mappedGroups, groupOrder)
}
