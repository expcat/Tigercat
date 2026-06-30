/**
 * NotificationCenter composite component types
 */

/**
 * Notification read filter
 */
export type NotificationReadFilter = 'all' | 'unread' | 'read'

/**
 * Notification item definition
 */
export interface NotificationItem {
  /**
   * Unique notification id
   */
  id: string | number
  /**
   * Notification title
   */
  title: string
  /**
   * Notification description
   */
  description?: string
  /**
   * Notification time
   */
  time?: string | number | Date
  /**
   * Notification type/group key
   */
  type?: string
  /**
   * Whether notification is read
   */
  read?: boolean
  /**
   * Custom metadata
   */
  meta?: Record<string, unknown>
  /**
   * Custom data
   */
  [key: string]: unknown
}

/**
 * Notification group definition
 */
export interface NotificationGroup {
  /**
   * Unique group key
   */
  key?: string | number
  /**
   * Group title
   */
  title: string
  /**
   * Group items
   */
  items: NotificationItem[]
}

/**
 * Notification center props interface
 */
export interface NotificationCenterProps {
  /**
   * Notification items (flat list)
   */
  items?: NotificationItem[]
  /**
   * Notification groups
   */
  groups?: NotificationGroup[]
  /**
   * Group by function (used when `groups` not provided)
   */
  groupBy?: (item: NotificationItem) => string
  /**
   * Optional group order
   */
  groupOrder?: string[]
  /**
   * Active group key (controlled)
   */
  activeGroupKey?: string | number
  /**
   * Default active group key (uncontrolled)
   */
  defaultActiveGroupKey?: string | number
  /**
   * Read filter (controlled)
   * @default 'all'
   */
  readFilter?: NotificationReadFilter
  /**
   * Default read filter (uncontrolled)
   * @default 'all'
   */
  defaultReadFilter?: NotificationReadFilter
  /**
   * Loading state
   * @default false
   */
  loading?: boolean
  /**
   * Loading text
   */
  loadingText?: string
  /**
   * Empty state text
   */
  emptyText?: string
  /**
   * Title text
   */
  title?: string
  /**
   * Label for "all" filter
   */
  allLabel?: string
  /**
   * Label for "unread" filter
   */
  unreadLabel?: string
  /**
   * Label for "read" filter
   */
  readLabel?: string
  /**
   * Mark all as read button text
   */
  markAllReadText?: string
  /**
   * Mark as read button text
   */
  markReadText?: string
  /**
   * Mark as unread button text
   */
  markUnreadText?: string
  /**
   * Group change callback
   */
  onGroupChange?: (key: string | number) => void
  /**
   * Read filter change callback
   */
  onReadFilterChange?: (filter: NotificationReadFilter) => void
  /**
   * Mark all read callback
   */
  onMarkAllRead?: (groupKey: string | number | undefined, items: NotificationItem[]) => void
  /**
   * Item click callback
   */
  onItemClick?: (item: NotificationItem, index: number) => void
  /**
   * Item read change callback
   */
  onItemReadChange?: (item: NotificationItem, read: boolean) => void
  /**
   * Whether to manage read state internally.
   * When true, the component tracks read/unread state itself,
   * so you don't need to wire up onItemReadChange / onMarkAllRead handlers.
   * Callbacks are still fired for external side-effects (e.g. API calls).
   * @default false
   */
  manageReadState?: boolean
}
