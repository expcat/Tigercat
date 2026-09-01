/**
 * ChatWindow composite component types
 */

import type { BadgeVariant } from './badge'
import type { TigerLocale } from './locale'

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
   * Locale overrides for ChatWindow UI text
   */
  locale?: Partial<TigerLocale>
  /**
   * Flat custom-text overrides for single-language use (no i18n needed).
   * Takes precedence over `locale` and global ConfigProvider text.
   */
  labels?: Partial<import('./locale').TigerLocaleChatWindow>
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
   * Enable virtualized rendering for the message list. The VirtualList is the
   * only scroller (`virtualHeight` is its viewport). Rows use dynamic height
   * with `virtualItemHeight` as the estimate. The root must be given a height
   * (`h-full min-h-0` or an explicit height) or the list will grow the page.
   * @default false
   */
  virtual?: boolean
  /**
   * Estimated pixel height of each virtualized message row.
   * @default 88
   */
  virtualItemHeight?: number
  /**
   * Pixel height of the virtualized message list viewport. This is the only
   * scroller when `virtual` is on.
   * @default 400
   */
  virtualHeight?: number
  /**
   * Follow the latest message only while the list is pinned to the bottom
   * (within 32px) or has not been scrolled up. `false` turns auto-scroll off.
   * @default true
   */
  autoScrollToBottom?: boolean
  /**
   * Input change callback. Controlled parents that want `clearOnSend` must
   * write `''` here; binding only `onSend` does not clear the field.
   */
  onChange?: (value: string) => void
  /**
   * Send callback. The list is fully controlled: this does **not** push a
   * message. Omit it and the send control stays disabled.
   */
  onSend?: (value: string) => void
}

/** Imperative handle: same auto-scroll path as the pin-to-bottom controller. */
export interface ChatWindowHandle {
  scrollToBottom: () => void
}
