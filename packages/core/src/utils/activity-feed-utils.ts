import type { ActivityGroup, ActivityItem } from '../types/composite'
import type { TimelineItem } from '../types/timeline'

export const formatActivityTime = (value?: string | number | Date): string => {
  if (value == null || value === '') return ''
  if (value instanceof Date) return value.toLocaleString()
  if (typeof value === 'number') return new Date(value).toLocaleString()
  return value
}

export const sortActivityGroups = (groups: ActivityGroup[], groupOrder?: string[]) => {
  if (!groupOrder || groupOrder.length === 0) return groups
  const orderMap = new Map(groupOrder.map((key, index) => [key, index]))
  return [...groups].sort((a, b) => {
    const aKey = String(a.key ?? a.title ?? '')
    const bKey = String(b.key ?? b.title ?? '')
    const aIndex = orderMap.has(aKey) ? (orderMap.get(aKey) as number) : Number.POSITIVE_INFINITY
    const bIndex = orderMap.has(bKey) ? (orderMap.get(bKey) as number) : Number.POSITIVE_INFINITY
    if (aIndex === bIndex) return 0
    return aIndex - bIndex
  })
}

export const buildActivityGroups = (
  items?: ActivityItem[],
  groups?: ActivityGroup[],
  groupBy?: (item: ActivityItem) => string,
  groupOrder?: string[]
): ActivityGroup[] => {
  if (groups && groups.length > 0) {
    return sortActivityGroups(groups, groupOrder)
  }

  if (!items || items.length === 0) return []

  if (groupBy) {
    const groupMap = new Map<string, ActivityItem[]>()
    items.forEach((item) => {
      const key = groupBy(item) || '其他'
      const bucket = groupMap.get(key) ?? []
      bucket.push(item)
      groupMap.set(key, bucket)
    })

    const mappedGroups = Array.from(groupMap.entries()).map(([title, groupItems]) => ({
      key: title,
      title,
      items: groupItems
    }))

    return sortActivityGroups(mappedGroups, groupOrder)
  }

  return [{ key: 'default', title: '', items }]
}

export const toActivityTimelineItems = (
  items: ActivityItem[],
  showTime: boolean
): TimelineItem[] => {
  return items.map((item, index) => ({
    key: item.id ?? index,
    label: showTime ? formatActivityTime(item.time) : undefined,
    content: undefined,
    activity: item
  }))
}
