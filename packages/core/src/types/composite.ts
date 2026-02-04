/**
 * Composite component types and interfaces
 */

import type { BadgeVariant } from './badge'
import type { TagVariant } from './tag'

/**
 * Chat message direction
 */
export type ChatMessageDirection = 'self' | 'other'

/**
 * Chat message delivery status
 */
export type ChatMessageStatus = 'sending' | 'sent' | 'failed'

/**
 * Chat user info
 */
export interface ChatUser {
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
 * Chat message definition
 */
export interface ChatMessage {
  /**
   * Unique message id
   */
  id: string | number
  /**
   * Message content
   */
  content: string | number
  /**
   * Message direction
   * @default 'other'
   */
  direction?: ChatMessageDirection
  /**
   * Sender user
   */
  user?: ChatUser
  /**
   * Message time
   */
  time?: string | number | Date
  /**
   * Message delivery status
   */
  status?: ChatMessageStatus
  /**
   * Custom status text (overrides default label)
   */
  statusText?: string
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
 * Chat window props interface
 */
export interface ChatWindowProps {
  /**
   * Message list
   */
  messages?: ChatMessage[]
  /**
   * Input value (controlled)
   */
  value?: string
  /**
   * Default input value (uncontrolled)
   */
  defaultValue?: string
  /**
   * Input placeholder
   */
  placeholder?: string
  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Maximum length of input
   */
  maxLength?: number
  /**
   * Empty state text
   */
  emptyText?: string
  /**
   * Send button text
   */
  sendText?: string
  /**
   * Aria label for message list container
   */
  messageListAriaLabel?: string
  /**
   * Aria label for input
   */
  inputAriaLabel?: string
  /**
   * Aria label for send button
   */
  sendAriaLabel?: string
  /**
   * Status bar text (e.g. typing, delivered)
   */
  statusText?: string
  /**
   * Status bar variant
   * @default 'info'
   */
  statusVariant?: BadgeVariant
  /**
   * Show avatar in message item
   * @default true
   */
  showAvatar?: boolean
  /**
   * Show user name in message item
   * @default true
   */
  showName?: boolean
  /**
   * Show time in message item
   * @default false
   */
  showTime?: boolean
  /**
   * Input type
   * @default 'textarea'
   */
  inputType?: 'input' | 'textarea'
  /**
   * Textarea rows
   * @default 3
   */
  inputRows?: number
  /**
   * Send on Enter
   * @default true
   */
  sendOnEnter?: boolean
  /**
   * Allow Shift+Enter to create new line
   * @default true
   */
  allowShiftEnter?: boolean
  /**
   * Allow sending empty content
   * @default false
   */
  allowEmpty?: boolean
  /**
   * Clear input after send
   * @default true
   */
  clearOnSend?: boolean
  /**
   * Input change callback
   */
  onChange?: (value: string) => void
  /**
   * Send callback
   */
  onSend?: (value: string) => void
}

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
