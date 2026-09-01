/**
 * Notification component utilities
 */

import type { NotificationType, NotificationPosition } from '../types/notification'
import { overlayZIndexClass } from './floating'

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
export const notificationContainerBaseClasses = `fixed ${overlayZIndexClass.message} flex flex-col gap-3 pointer-events-none w-[var(--tiger-component-notification-width,24rem)] max-w-[calc(100vw-2rem)]`

/**
 * Get position classes for notification container
 */
export const notificationPositionClasses: Record<NotificationPosition, string> = {
  'top-left': 'top-6 inset-inline-start-6',
  'top-right': 'top-6 inset-inline-end-6',
  'bottom-left': 'bottom-6 inset-inline-start-6',
  'bottom-right': 'bottom-6 inset-inline-end-6'
}

/**
 * Base notification item classes
 */
export const notificationBaseClasses =
  'flex gap-3 p-[var(--tiger-component-notification-padding,1rem)] rounded-[var(--tiger-component-notification-border-radius,var(--tiger-radius-lg,0.75rem))] shadow-[var(--tiger-component-notification-shadow,0_10px_15px_-3px_rgb(0_0_0_/_0.1))] border pointer-events-auto tiger-motion-aware [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'

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
    bg: 'bg-[var(--tiger-surface,#ffffff)]',
    border: 'border-[var(--tiger-border,#e5e7eb)]',
    icon: 'text-[var(--tiger-info,#3b82f6)]',
    titleText: 'text-[var(--tiger-text,#111827)]',
    descriptionText: 'text-[var(--tiger-text-muted,#6b7280)]'
  },
  success: {
    bg: 'bg-[var(--tiger-surface,#ffffff)]',
    border: 'border-[var(--tiger-border,#e5e7eb)]',
    icon: 'text-[var(--tiger-success,#16a34a)]',
    titleText: 'text-[var(--tiger-text,#111827)]',
    descriptionText: 'text-[var(--tiger-text-muted,#6b7280)]'
  },
  warning: {
    bg: 'bg-[var(--tiger-surface,#ffffff)]',
    border: 'border-[var(--tiger-border,#e5e7eb)]',
    icon: 'text-[var(--tiger-warning,#d97706)]',
    titleText: 'text-[var(--tiger-text,#111827)]',
    descriptionText: 'text-[var(--tiger-text-muted,#6b7280)]'
  },
  error: {
    bg: 'bg-[var(--tiger-surface,#ffffff)]',
    border: 'border-[var(--tiger-border,#e5e7eb)]',
    icon: 'text-[var(--tiger-error,#dc2626)]',
    titleText: 'text-[var(--tiger-text,#111827)]',
    descriptionText: 'text-[var(--tiger-text-muted,#6b7280)]'
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
  'ms-auto p-1 rounded-[var(--tiger-radius-md,0.5rem)] hover:bg-[var(--tiger-surface-muted,#e5e7eb)] tiger-motion-aware transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--tiger-primary,#2563eb)]/40 flex-shrink-0'

/**
 * Notification close icon classes
 */
export const notificationCloseIconClasses =
  'w-5 h-5 text-[var(--tiger-text-muted,#6b7280)] hover:text-[var(--tiger-text,#111827)]'

/**
 * Notification icon classes
 */
export const notificationIconClasses = 'w-6 h-6 flex-shrink-0 mt-0.5'

/**
 * Notification title classes
 */
export const notificationTitleClasses =
  '[font-size:var(--tiger-component-notification-title-font-size,1rem)] [font-weight:var(--tiger-component-notification-title-font-weight,500)]'

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
  'rounded-[var(--tiger-radius-md,0.5rem)] px-2.5 py-1 text-xs font-medium tiger-motion-aware transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--tiger-primary,#2563eb)]/40 disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Notification action button type classes
 */
export const notificationActionButtonTypeClasses = {
  primary:
    'bg-[var(--tiger-primary,#2563eb)] text-white hover:bg-[var(--tiger-primary-hover,#1d4ed8)] disabled:hover:bg-[var(--tiger-primary,#2563eb)]',
  default:
    'border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] text-[var(--tiger-text,#111827)] hover:bg-[var(--tiger-surface-muted,#f3f4f6)]'
}

export type NotificationStackFrameCallback = (timestamp: number) => void

export type NotificationStackFrameRequest = (callback: NotificationStackFrameCallback) => number

export type NotificationStackFrameCancel = (handle: number) => void

export type NotificationStackUpdateCallback = () => void

export interface NotificationStackUpdateSchedulerOptions {
  requestFrame?: NotificationStackFrameRequest
  cancelFrame?: NotificationStackFrameCancel
}

export interface NotificationStackUpdateScheduler {
  schedule: (position: NotificationPosition, callback: NotificationStackUpdateCallback) => void
  flush: () => void
  cancel: (position?: NotificationPosition) => void
  isPending: () => boolean
}

function requestDefaultNotificationFrame(callback: NotificationStackFrameCallback): number {
  if (globalThis.requestAnimationFrame) {
    return globalThis.requestAnimationFrame(callback)
  }

  return globalThis.setTimeout(() => callback(globalThis.performance?.now?.() ?? Date.now()), 16)
}

function cancelDefaultNotificationFrame(handle: number): void {
  if (globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame(handle)
    return
  }

  globalThis.clearTimeout(handle)
}

export function createNotificationStackUpdateScheduler(
  options: NotificationStackUpdateSchedulerOptions = {}
): NotificationStackUpdateScheduler {
  const requestFrame = options.requestFrame ?? requestDefaultNotificationFrame
  const cancelFrame = options.cancelFrame ?? cancelDefaultNotificationFrame
  const pendingCallbacks = new Map<NotificationPosition, NotificationStackUpdateCallback>()
  let frameHandle: number | undefined

  function applyPending(): void {
    frameHandle = undefined
    if (pendingCallbacks.size === 0) return

    const callbacks = [...pendingCallbacks.values()]
    pendingCallbacks.clear()
    callbacks.forEach((callback) => callback())
  }

  function schedule(
    position: NotificationPosition,
    callback: NotificationStackUpdateCallback
  ): void {
    pendingCallbacks.set(position, callback)
    if (frameHandle !== undefined) return

    frameHandle = requestFrame(applyPending)
  }

  function flush(): void {
    if (frameHandle !== undefined) {
      cancelFrame(frameHandle)
    }

    applyPending()
  }

  function cancel(position?: NotificationPosition): void {
    if (position) {
      pendingCallbacks.delete(position)
    } else {
      pendingCallbacks.clear()
    }

    if (pendingCallbacks.size > 0 || frameHandle === undefined) return

    cancelFrame(frameHandle)
    frameHandle = undefined
  }

  return {
    schedule,
    flush,
    cancel,
    isPending: () => frameHandle !== undefined
  }
}
