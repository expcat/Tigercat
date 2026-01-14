/**
 * Message component types and interfaces
 */

/**
 * Message type (determines the icon and color scheme)
 */
export type MessageType = 'success' | 'warning' | 'error' | 'info' | 'loading'

/**
 * Message position on screen
 */
export type MessagePosition =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'

/**
 * Message instance interface
 */
export interface MessageInstance {
  /**
   * Unique identifier for the message
   */
  id: string | number

  /**
   * Message type
   */
  type: MessageType

  /**
   * Message content
   */
  content: string

  /**
   * Duration in milliseconds before auto-close (0 means no auto-close)
   */
  duration: number

  /**
   * Whether the message can be closed manually
   */
  closable: boolean

  /**
   * Callback when message is closed
   */
  onClose?: () => void

  /**
   * Custom icon (overrides default type icon)
   */
  icon?: string

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Base message props interface
 */
export interface MessageProps {
  /**
   * Message type
   * @default 'info'
   */
  type?: MessageType

  /**
   * Message content
   */
  content?: string

  /**
   * Duration in milliseconds before auto-close (0 means no auto-close)
   * @default 3000
   */
  duration?: number

  /**
   * Whether the message can be closed manually
   * @default false
   */
  closable?: boolean

  /**
   * Callback when message is closed
   */
  onClose?: () => void

  /**
   * Custom icon (overrides default type icon)
   */
  icon?: string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Message position on screen
   * @default 'top'
   */
  position?: MessagePosition
}

/**
 * Message config for imperative API
 */
export interface MessageConfig extends Omit<MessageProps, 'content'> {
  content: string
}

/**
 * Message options for imperative API
 */
export type MessageOptions = string | MessageConfig
