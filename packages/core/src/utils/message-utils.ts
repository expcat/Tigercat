/**
 * Message component utilities
 */

import type { MessageType, MessagePosition } from '../types/message'

import {
  closeIconPathD,
  statusErrorIconPath,
  statusInfoIconPath,
  statusSuccessIconPath,
  statusWarningIconPath
} from './common-icons'

/**
 * Base message container classes
 */
export const messageContainerBaseClasses = 'fixed z-[9999] flex flex-col gap-2 pointer-events-none'

/**
 * Get position classes for message container
 */
export const messagePositionClasses: Record<MessagePosition, string> = {
  top: 'top-6 left-1/2 -translate-x-1/2',
  'top-left': 'top-6 left-6',
  'top-right': 'top-6 right-6',
  bottom: 'bottom-6 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-6 left-6',
  'bottom-right': 'bottom-6 right-6'
}

/**
 * Base message item classes
 */
export const messageBaseClasses =
  'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border pointer-events-auto transition-all duration-300 ease-in-out'

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
 * Default message theme colors
 */
export const defaultMessageThemeColors: Record<MessageType, MessageColorScheme> = {
  info: {
    bg: 'bg-[var(--tiger-message-info-bg,#eff6ff)]',
    border: 'border-[var(--tiger-message-info-border,#bfdbfe)]',
    text: 'text-[var(--tiger-message-info-text,#1e40af)]',
    icon: 'text-[var(--tiger-message-info-icon,#3b82f6)]'
  },
  success: {
    bg: 'bg-[var(--tiger-message-success-bg,#f0fdf4)]',
    border: 'border-[var(--tiger-message-success-border,#bbf7d0)]',
    text: 'text-[var(--tiger-message-success-text,#166534)]',
    icon: 'text-[var(--tiger-message-success-icon,#22c55e)]'
  },
  warning: {
    bg: 'bg-[var(--tiger-message-warning-bg,#fffbeb)]',
    border: 'border-[var(--tiger-message-warning-border,#fde68a)]',
    text: 'text-[var(--tiger-message-warning-text,#92400e)]',
    icon: 'text-[var(--tiger-message-warning-icon,#f59e0b)]'
  },
  error: {
    bg: 'bg-[var(--tiger-message-error-bg,#fef2f2)]',
    border: 'border-[var(--tiger-message-error-border,#fecaca)]',
    text: 'text-[var(--tiger-message-error-text,#991b1b)]',
    icon: 'text-[var(--tiger-message-error-icon,#ef4444)]'
  },
  loading: {
    bg: 'bg-[var(--tiger-message-loading-bg,var(--tiger-surface-muted,#f3f4f6))]',
    border: 'border-[var(--tiger-message-loading-border,var(--tiger-border,#e5e7eb))]',
    text: 'text-[var(--tiger-message-loading-text,var(--tiger-text,#111827))]',
    icon: 'text-[var(--tiger-message-loading-icon,var(--tiger-text-muted,#6b7280))]'
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
 * Message icon paths for different types
 */
export const messageIconPaths: Record<MessageType, string> = {
  success: statusSuccessIconPath,
  warning: statusWarningIconPath,
  error: statusErrorIconPath,
  info: statusInfoIconPath,
  loading:
    'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
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
  'ml-auto p-1 rounded hover:bg-[var(--tiger-surface-muted,#e5e7eb)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--tiger-primary,#2563eb)]'

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
export const messageLoadingSpinnerClasses = 'animate-spin'
