/**
 * Message component utilities
 */

import type { MessageType, MessagePosition } from '../types/message'

/**
 * Base message container classes
 */
export const messageContainerBaseClasses = 'fixed z-[9999] flex flex-col gap-2 pointer-events-none'

/**
 * Get position classes for message container
 */
export const messagePositionClasses: Record<MessagePosition, string> = {
  'top': 'top-6 left-1/2 -translate-x-1/2',
  'top-left': 'top-6 left-6',
  'top-right': 'top-6 right-6',
  'bottom': 'bottom-6 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-6 left-6',
  'bottom-right': 'bottom-6 right-6',
}

/**
 * Base message item classes
 */
export const messageBaseClasses = 'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border pointer-events-auto transition-all duration-300 ease-in-out'

/**
 * Message animation classes
 */
export const messageEnterClasses = 'opacity-0 -translate-y-2'
export const messageEnterActiveClasses = 'opacity-100 translate-y-0'
export const messageLeaveClasses = 'opacity-100 translate-y-0'
export const messageLeaveActiveClasses = 'opacity-0 -translate-y-2'

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
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: 'text-green-500',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-500',
  },
  loading: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-800',
    icon: 'text-gray-500',
  },
}

/**
 * Get color scheme for message type
 */
export function getMessageTypeClasses(
  type: MessageType,
  themeColors: Record<MessageType, MessageColorScheme> = defaultMessageThemeColors
): MessageColorScheme {
  return themeColors[type] || themeColors.info
}

/**
 * Message icon paths for different types
 */
export const messageIconPaths: Record<MessageType, string> = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  loading: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
}

/**
 * Get icon path for message type
 */
export function getMessageIconPath(type: MessageType): string {
  return messageIconPaths[type] || messageIconPaths.info
}

/**
 * Close icon path for message close button
 */
export const messageCloseIconPath = 'M6 18L18 6M6 6l12 12'

/**
 * Message close button classes
 */
export const messageCloseButtonClasses = 'ml-auto p-1 rounded hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'

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
