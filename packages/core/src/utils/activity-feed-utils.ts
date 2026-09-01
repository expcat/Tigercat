import type { ActivityGroup, ActivityItem } from '../types/composite'
import type { TimelineItem } from '../types/timeline'

export const EMPTY_ACTIVITY_ITEMS: ActivityItem[] = []
export const EMPTY_ACTIVITY_GROUPS: ActivityGroup[] = []

const DEFAULT_OTHER_GROUP_TITLE = 'Other'

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

function normalizeActivityGroups(groups: ActivityGroup[]): ActivityGroup[] {
  return groups.map((group) => ({ ...group, items: group.items ?? [] }))
}

/**
 * Resolve the groups to render.
 *
 * `groups` once passed (including `[]`) is the only source — empty groups do
 * not fall back to `items`. `items` are used only when `groups == null`.
 * Empty `groupBy` keys use `otherGroupTitle` (locale "Other"), never a
 * hardcoded CJK string.
 */
export const buildActivityGroups = (
  items?: ActivityItem[],
  groups?: ActivityGroup[] | null,
  groupBy?: (item: ActivityItem) => string,
  groupOrder?: string[],
  otherGroupTitle = DEFAULT_OTHER_GROUP_TITLE
): ActivityGroup[] => {
  if (groups != null) {
    return sortActivityGroups(normalizeActivityGroups(groups), groupOrder)
  }

  const list = items ?? EMPTY_ACTIVITY_ITEMS
  if (list.length === 0) return EMPTY_ACTIVITY_GROUPS

  if (groupBy) {
    const groupMap = new Map<string, ActivityItem[]>()
    list.forEach((item) => {
      const key = groupBy(item) || otherGroupTitle
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

  return [{ key: 'default', title: '', items: list }]
}

export const toActivityTimelineItems = (
  items: ActivityItem[] | undefined
): ActivityTimelineItem[] => {
  return (items ?? EMPTY_ACTIVITY_ITEMS).map((item, index) => ({
    key: item.id ?? index,
    activity: item
  }))
}
