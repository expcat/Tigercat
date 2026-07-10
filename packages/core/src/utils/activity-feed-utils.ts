import type { ActivityGroup, ActivityItem } from '../types/composite'
import type { TimelineItem } from '../types/timeline'

// ── Typed bridge ─────────────────────────────────────────────────
/**
 * A TimelineItem that carries the source ActivityItem,
 * eliminating the need for unsafe casts in Vue/React renderers.
 */
export interface ActivityTimelineItem extends TimelineItem {
  activity: ActivityItem
}

// ── Activity item layout class tokens (shared by Vue & React) ───
export const activityItemClasses = 'tiger-activity-item'
export const activityItemLayoutClasses = 'flex gap-3 items-start'
export const activityItemBodyClasses = 'flex-1 min-w-0'
export const activityItemHeaderClasses = 'flex items-center justify-between gap-2 mb-1'
export const activityItemTitleGroupClasses = 'flex items-center gap-2 min-w-0'
export const activityItemDescriptionClasses = 'mb-2 break-words'
export const activityItemActionsClasses = 'flex flex-wrap gap-2'

export const formatActivityTime = (
  value?: string | number | Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (value == null || value === '') return ''
  if (value instanceof Date) return value.toLocaleString(locale, options)
  if (typeof value === 'number') return new Date(value).toLocaleString(locale, options)
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

export const toActivityTimelineItems = (items: ActivityItem[]): ActivityTimelineItem[] => {
  return items.map((item, index) => ({
    key: item.id ?? index,
    activity: item
  }))
}
