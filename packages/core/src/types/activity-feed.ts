/**
 * ActivityFeed composite component types
 */

import type { TagVariant } from './tag'

/**
 * Activity user info
 */
export interface ActivityUser {
  /**
   * User id
   */
  id?: string | number
  /**
   * Display name
   */
  name?: string
  /**
   * Avatar image url
   */
  avatar?: string
}

/**
 * Activity status tag
 */
export interface ActivityStatusTag {
  /**
   * Status label
   */
  label: string
  /**
   * Tag variant
   * @default 'default'
   */
  variant?: TagVariant
}

/**
 * Activity action definition
 */
export interface ActivityAction {
  /**
   * Action key
   */
  key?: string | number
  /**
   * Action label
   */
  label: string
  /**
   * Action link
   */
  href?: string
  /**
   * Link target
   */
  target?: '_blank' | '_self' | '_parent' | '_top'
  /**
   * Whether the action is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Click handler
   */
  onClick?: (item: ActivityItem, action: ActivityAction) => void
}

/**
 * Activity item definition
 */
export interface ActivityItem {
  /**
   * Unique activity id
   */
  id: string | number
  /**
   * Activity title
   */
  title?: string
  /**
   * Activity description
   */
  description?: string
  /**
   * Activity time
   */
  time?: string | number | Date
  /**
   * Activity user
   */
  user?: ActivityUser
  /**
   * Status tag
   */
  status?: ActivityStatusTag
  /**
   * Actions
   */
  actions?: ActivityAction[]
  /**
   * Custom content
   */
  content?: unknown
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
 * Activity group definition
 */
export interface ActivityGroup {
  /**
   * Unique group key
   */
  key?: string | number
  /**
   * Group title (e.g. date)
   */
  title?: string
  /**
   * Group items
   */
  items: ActivityItem[]
}

/**
 * Activity feed props interface
 */
export interface ActivityFeedProps {
  /**
   * Activity items (flat list)
   */
  items?: ActivityItem[]
  /**
   * Activity groups
   */
  groups?: ActivityGroup[]
  /**
   * Group by function (used when `groups` not provided)
   */
  groupBy?: (item: ActivityItem) => string
  /**
   * Optional group order
   */
  groupOrder?: string[]
  /**
   * Whether to show loading state
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
   * Show avatar
   * @default true
   */
  showAvatar?: boolean
  /**
   * Show time label
   * @default true
   */
  showTime?: boolean
  /**
   * Show group title
   * @default true
   */
  showGroupTitle?: boolean
  /**
   * Custom render for activity item
   */
  renderItem?: (item: ActivityItem, index: number, group?: ActivityGroup) => unknown
  /**
   * Custom render for group header
   */
  renderGroupHeader?: (group: ActivityGroup) => unknown
}
