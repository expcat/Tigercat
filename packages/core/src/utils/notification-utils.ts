/**
 * Notification component utilities
 */

import type { NotificationType, NotificationPosition } from '../types/notification'

/**
 * Base notification container classes
 */
export const notificationContainerBaseClasses = 'fixed z-[9999] flex flex-col gap-3 pointer-events-none w-96 max-w-[calc(100vw-2rem)]'

/**
 * Get position classes for notification container
 */
export const notificationPositionClasses: Record<NotificationPosition, string> = {
  'top-left': 'top-6 left-6',
  'top-right': 'top-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'bottom-right': 'bottom-6 right-6',
}

/**
 * Base notification item classes
 */
export const notificationBaseClasses = 'flex gap-3 p-4 rounded-lg shadow-lg border pointer-events-auto transition-all duration-300 ease-in-out bg-white'

/**
 * Notification type color schemes
 */
export interface NotificationColorScheme {
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
    border: 'border-blue-200',
    icon: 'text-blue-500',
    titleText: 'text-gray-900',
    descriptionText: 'text-gray-600',
  },
  success: {
    border: 'border-green-200',
    icon: 'text-green-500',
    titleText: 'text-gray-900',
    descriptionText: 'text-gray-600',
  },
  warning: {
    border: 'border-yellow-200',
    icon: 'text-yellow-500',
    titleText: 'text-gray-900',
    descriptionText: 'text-gray-600',
  },
  error: {
    border: 'border-red-200',
    icon: 'text-red-500',
    titleText: 'text-gray-900',
    descriptionText: 'text-gray-600',
  },
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
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
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
export const notificationCloseIconPath = 'M6 18L18 6M6 6l12 12'

/**
 * Notification close button classes
 */
export const notificationCloseButtonClasses = 'p-1 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-shrink-0'

/**
 * Notification icon classes
 */
export const notificationIconClasses = 'w-6 h-6 flex-shrink-0 mt-0.5'

/**
 * Notification title classes
 */
export const notificationTitleClasses = 'text-sm font-semibold'

/**
 * Notification description classes
 */
export const notificationDescriptionClasses = 'text-sm mt-1'

/**
 * Notification content wrapper classes
 */
export const notificationContentClasses = 'flex-1 min-w-0'
