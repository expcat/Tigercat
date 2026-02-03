/**
 * Composite component types and interfaces
 */

import type { BadgeVariant } from './badge'

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
