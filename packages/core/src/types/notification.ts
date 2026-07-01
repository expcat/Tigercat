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
 * Context passed to notification action callbacks.
 */
export interface NotificationActionContext {
  /**
   * Notification instance id.
   */
  id: string | number

  /**
   * Close this notification.
   */
  close: () => void
}

/**
 * Inline action rendered inside a notification toast.
 */
export interface NotificationAction {
  /**
   * Stable key for rendering. Falls back to the label.
   */
  key?: string

  /**
   * Visible action label.
   */
  label: string

  /**
   * Action button type.
   * @default 'default'
   */
  type?: 'primary' | 'default'

  /**
   * Whether this action is disabled.
   * @default false
   */
  disabled?: boolean

  /**
   * Whether to close the notification after clicking this action.
   * @default false
   */
  closeOnClick?: boolean

  /**
   * Action click handler.
   */
  onClick?: (context: NotificationActionContext) => void
}

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
   * Inline action buttons rendered inside the notification.
   */
  actions?: NotificationAction[]

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

  /**
   * Close button aria-label when closable.
   */
  closeAriaLabel?: string
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
   * Inline action buttons rendered inside the notification.
   */
  actions?: NotificationAction[]

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

  /**
   * Close button aria-label when `closable` is true.
   * @default 'Close notification'
   */
  closeAriaLabel?: string
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
