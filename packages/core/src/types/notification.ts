/**
 * Notification component types and interfaces
 */

/**
 * Notification type (determines the icon and color scheme)
 */
export type NotificationType = 'success' | 'warning' | 'error' | 'info'

/**
 * Notification position on screen
 */
export type NotificationPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/**
 * Notification instance interface
 */
export interface NotificationInstance {
  /**
   * Unique identifier for the notification
   */
  id: string | number

  /**
   * Notification type
   */
  type: NotificationType

  /**
   * Notification title
   */
  title: string

  /**
   * Notification description/content
   */
  description?: string

  /**
   * Duration in milliseconds before auto-close (0 means no auto-close)
   */
  duration: number

  /**
   * Whether the notification can be closed manually
   */
  closable: boolean

  /**
   * Callback when notification is closed
   */
  onClose?: () => void

  /**
   * Callback when notification is clicked
   */
  onClick?: () => void

  /**
   * Custom icon (overrides default type icon)
   */
  icon?: string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Notification position
   */
  position: NotificationPosition
}

/**
 * Base notification props interface
 */
export interface NotificationProps {
  /**
   * Notification type
   * @default 'info'
   */
  type?: NotificationType

  /**
   * Notification title
   */
  title?: string

  /**
   * Notification description/content
   */
  description?: string

  /**
   * Duration in milliseconds before auto-close (0 means no auto-close)
   * @default 4500
   */
  duration?: number

  /**
   * Whether the notification can be closed manually
   * @default true
   */
  closable?: boolean

  /**
   * Callback when notification is closed
   */
  onClose?: () => void

  /**
   * Callback when notification is clicked
   */
  onClick?: () => void

  /**
   * Custom icon (overrides default type icon)
   */
  icon?: string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Notification position on screen
   * @default 'top-right'
   */
  position?: NotificationPosition
}

/**
 * Notification config for imperative API
 */
export interface NotificationConfig extends Omit<NotificationProps, 'title'> {
  title: string
}

/**
 * Notification options for imperative API
 */
export type NotificationOptions = string | NotificationConfig
