/**
 * Notification component utilities
 */

import type { NotificationType, NotificationPosition } from '../types/notification'
import { overlayZIndexClass } from './floating'
import { normalizeAutoCloseDuration } from './message-utils'

import { closeIconPathD } from './icons/common'
import {
  statusErrorIconPath,
  statusInfoIconPath,
  statusSuccessIconPath,
  statusWarningIconPath
} from './icons/status'

/**
 * Base notification container classes
 */
export const notificationContainerBaseClasses = `fixed ${overlayZIndexClass.message} flex flex-col gap-3 pointer-events-none w-[24rem] max-w-[calc(100vw-2rem)]`

/**
 * Corner placement. `start-*` / `end-*` are the Tailwind v4 utilities that
 * set logical insets. `inset-inline-start-*` is not emitted, so a fixed
 * stack stayed at its static position and covered the trigger.
 */
export const notificationPositionClasses: Record<NotificationPosition, string> = {
  'top-left': 'top-6 start-6',
  'top-right': 'top-6 end-6',
  'bottom-left': 'bottom-6 start-6',
  'bottom-right': 'bottom-6 end-6'
}

/**
 * Base notification item classes
 */
export const notificationBaseClasses =
  'flex gap-3 p-[var(--tiger-spacing-lg)] rounded-[var(--tiger-radius-lg)] shadow-[var(--tiger-shadow-lg)] border pointer-events-auto tiger-motion-aware [transition:var(--tiger-transition-base)]'

/**
 * Notification type color schemes
 */
export interface NotificationColorScheme {
  bg: string
  border: string
  icon: string
  titleText: string
  descriptionText: string
}

/**
 * Default notification theme colors
 */
export const defaultNotificationThemeColors: Record<NotificationType, NotificationColorScheme> = {
  info: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    icon: 'text-[var(--tiger-info)]',
    titleText: 'text-[var(--tiger-text)]',
    descriptionText: 'text-[var(--tiger-text-secondary)]'
  },
  success: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    icon: 'text-[var(--tiger-success)]',
    titleText: 'text-[var(--tiger-text)]',
    descriptionText: 'text-[var(--tiger-text-secondary)]'
  },
  warning: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    icon: 'text-[var(--tiger-warning)]',
    titleText: 'text-[var(--tiger-text)]',
    descriptionText: 'text-[var(--tiger-text-secondary)]'
  },
  error: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    icon: 'text-[var(--tiger-error)]',
    titleText: 'text-[var(--tiger-text)]',
    descriptionText: 'text-[var(--tiger-text-secondary)]'
  }
}

/**
 * Get color scheme for notification type
 */
export function getNotificationTypeClasses(
  type: NotificationType,
  themeColors: Record<NotificationType, NotificationColorScheme> = defaultNotificationThemeColors
): NotificationColorScheme {
  return themeColors[type] || themeColors.info
}

/**
 * Notification icon paths for different types
 */
export const notificationIconPaths: Record<NotificationType, string> = {
  success: statusSuccessIconPath,
  warning: statusWarningIconPath,
  error: statusErrorIconPath,
  info: statusInfoIconPath
}

/**
 * Get icon path for notification type
 */
export function getNotificationIconPath(type: NotificationType): string {
  return notificationIconPaths[type] || notificationIconPaths.info
}

/**
 * Close icon path for notification close button
 */
export const notificationCloseIconPath = closeIconPathD

/**
 * Notification close button classes
 */
export const notificationCloseButtonClasses =
  'ms-auto p-1 rounded-[var(--tiger-radius-md)] hover:bg-[var(--tiger-surface-muted)] tiger-motion-aware transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--tiger-primary)]/40 flex-shrink-0'

/**
 * Notification close icon classes
 */
export const notificationCloseIconClasses =
  'w-5 h-5 text-[var(--tiger-text-secondary)] hover:text-[var(--tiger-text)]'

/**
 * Notification icon classes
 */
export const notificationIconClasses = 'w-6 h-6 flex-shrink-0 mt-0.5'

/**
 * Notification title classes
 */
export const notificationTitleClasses = 'text-[length:var(--tiger-font-size-base)] font-medium'

/**
 * Notification description classes
 */
export const notificationDescriptionClasses = 'text-sm mt-1'

/**
 * Notification content wrapper classes
 */
export const notificationContentClasses = 'flex-1 min-w-0'

/**
 * Notification actions wrapper classes
 */
export const notificationActionsClasses = 'mt-3 flex flex-wrap items-center gap-2'

/**
 * Notification action button base classes
 */
export const notificationActionButtonClasses =
  'rounded-[var(--tiger-radius-md)] px-2.5 py-1 text-xs font-medium tiger-motion-aware transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--tiger-primary)]/40 disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Notification action button type classes
 */
export const notificationActionButtonTypeClasses = {
  primary:
    'bg-[var(--tiger-primary)] text-white hover:bg-[var(--tiger-primary-hover)] disabled:hover:bg-[var(--tiger-primary)]',
  default:
    'border border-[var(--tiger-border)] bg-[var(--tiger-surface)] text-[var(--tiger-text)] hover:bg-[var(--tiger-surface-muted)]'
}

export function resolveNotificationDuration(duration?: number): number {
  return normalizeAutoCloseDuration(duration, 4500, 'notification.duration')
}
