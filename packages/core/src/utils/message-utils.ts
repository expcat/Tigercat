/**
 * Message component utilities
 */

import type { MessageType, MessagePosition } from '../types/message'
import { overlayZIndexClass } from './floating'

import { closeIconPathD } from './icons/common'
import {
  statusErrorIconPath,
  statusInfoIconPath,
  statusSuccessIconPath,
  statusWarningIconPath
} from './icons/status'

/**
 * Base message container classes
 */
export const messageContainerBaseClasses = `fixed ${overlayZIndexClass.message} flex flex-col gap-2 pointer-events-none`

/**
 * Get position classes for message container
 */
export const messagePositionClasses: Record<MessagePosition, string> = {
  top: 'top-6 inset-inline-0 mx-auto w-max',
  'top-left': 'top-6 inset-inline-start-6',
  'top-right': 'top-6 inset-inline-end-6',
  bottom: 'bottom-6 inset-inline-0 mx-auto w-max',
  'bottom-left': 'bottom-6 inset-inline-start-6',
  'bottom-right': 'bottom-6 inset-inline-end-6'
}

/**
 * Base message item classes
 */
export const messageBaseClasses =
  'flex items-center gap-3 px-4 py-3 rounded-[var(--tiger-radius-lg,0.75rem)] shadow-lg border pointer-events-auto tiger-motion-aware [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'

/**
 * Message type color schemes
 */
export interface MessageColorScheme {
  bg: string
  border: string
  text: string
  icon: string
}

/**
 * Default message theme colors — canonical semantic tokens, not --tiger-message-*.
 */
export const defaultMessageThemeColors: Record<MessageType, MessageColorScheme> = {
  info: {
    bg: 'bg-[var(--tiger-surface,#ffffff)]',
    border: 'border-[var(--tiger-border,#e5e7eb)]',
    text: 'text-[var(--tiger-info,#3b82f6)]',
    icon: 'text-[var(--tiger-info,#3b82f6)]'
  },
  success: {
    bg: 'bg-[var(--tiger-surface,#ffffff)]',
    border: 'border-[var(--tiger-border,#e5e7eb)]',
    text: 'text-[var(--tiger-success,#16a34a)]',
    icon: 'text-[var(--tiger-success,#16a34a)]'
  },
  warning: {
    bg: 'bg-[var(--tiger-surface,#ffffff)]',
    border: 'border-[var(--tiger-border,#e5e7eb)]',
    text: 'text-[var(--tiger-warning,#d97706)]',
    icon: 'text-[var(--tiger-warning,#d97706)]'
  },
  error: {
    bg: 'bg-[var(--tiger-surface,#ffffff)]',
    border: 'border-[var(--tiger-border,#e5e7eb)]',
    text: 'text-[var(--tiger-error,#dc2626)]',
    icon: 'text-[var(--tiger-error,#dc2626)]'
  },
  loading: {
    bg: 'bg-[var(--tiger-surface-muted,#f9fafb)]',
    border: 'border-[var(--tiger-border,#e5e7eb)]',
    text: 'text-[var(--tiger-text,#111827)]',
    icon: 'text-[var(--tiger-text-muted,#6b7280)]'
  }
}

/**
 * Get color scheme for message type
 */
export function getMessageTypeClasses(
  type: MessageType,
  themeColors: Record<MessageType, MessageColorScheme> = defaultMessageThemeColors
): MessageColorScheme {
  return themeColors[type]
}

/**
 * Stroke arc for the loading spinner (StatusIcon is fill="none" stroke).
 */
export const messageLoadingIconPath = 'M12 3a9 9 0 1 0 9 9'

/**
 * Message icon paths for different types
 */
export const messageIconPaths: Record<MessageType, string> = {
  success: statusSuccessIconPath,
  warning: statusWarningIconPath,
  error: statusErrorIconPath,
  info: statusInfoIconPath,
  loading: messageLoadingIconPath
}

/**
 * Get icon path for message type
 */
export function getMessageIconPath(type: MessageType): string {
  return messageIconPaths[type]
}

/**
 * Close icon path for message close button
 */
export const messageCloseIconPath = closeIconPathD

/**
 * Message close button classes
 */
export const messageCloseButtonClasses =
  'ms-auto p-1 rounded hover:bg-[var(--tiger-surface-muted,#e5e7eb)] tiger-motion-aware transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--tiger-primary,#2563eb)]'

/**
 * Message icon classes
 */
export const messageIconClasses = 'w-5 h-5 flex-shrink-0'

/**
 * Message content classes
 */
export const messageContentClasses = 'flex-1 text-sm font-medium'

/**
 * Loading spinner classes (for loading type)
 */
export const messageLoadingSpinnerClasses =
  'tiger-motion-aware animate-spin motion-reduce:animate-none'

export function resolveMessageDuration(type: MessageType, duration?: number): number {
  if (duration !== undefined) return duration
  return type === 'loading' ? 0 : 3000
}
