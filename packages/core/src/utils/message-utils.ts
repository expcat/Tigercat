/**
 * Message component utilities
 */

import type { MessageType, MessagePosition } from '../types/message'
import { devWarn } from './dev-warn'
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
/**
 * One placement: logical insets and auto margins. Centered top / bottom do
 * not add a translate. `start-*` / `end-*` / `inset-x-*` are the utilities
 * Tailwind v4 emits; `inset-inline-*` names are not.
 */
export const messagePositionClasses: Record<MessagePosition, string> = {
  top: 'top-6 inset-x-0 mx-auto w-max max-w-[min(100vw-2rem,36rem)]',
  'top-left': 'top-6 start-6',
  'top-right': 'top-6 end-6',
  bottom: 'bottom-6 inset-x-0 mx-auto w-max max-w-[min(100vw-2rem,36rem)]',
  'bottom-left': 'bottom-6 start-6',
  'bottom-right': 'bottom-6 end-6'
}

/**
 * Base message item classes
 */
export const messageBaseClasses =
  'flex items-center gap-3 px-4 py-3 rounded-[var(--tiger-radius-lg)] shadow-lg border pointer-events-auto tiger-motion-aware [transition:var(--tiger-transition-base)]'

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
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    text: 'text-[var(--tiger-info)]',
    icon: 'text-[var(--tiger-info)]'
  },
  success: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    text: 'text-[var(--tiger-success)]',
    icon: 'text-[var(--tiger-success)]'
  },
  warning: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    text: 'text-[var(--tiger-warning)]',
    icon: 'text-[var(--tiger-warning)]'
  },
  error: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    text: 'text-[var(--tiger-error)]',
    icon: 'text-[var(--tiger-error)]'
  },
  loading: {
    bg: 'bg-[var(--tiger-surface-muted)]',
    border: 'border-[var(--tiger-border)]',
    text: 'text-[var(--tiger-text)]',
    icon: 'text-[var(--tiger-text-secondary)]'
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
  'ms-auto p-1 rounded hover:bg-[var(--tiger-surface-muted)] tiger-motion-aware transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--tiger-primary)]'

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

/** Negative and non-finite durations do not auto-close. */
export function normalizeAutoCloseDuration(
  duration: number | undefined,
  fallback: number,
  warnKey: string
): number {
  const value = duration === undefined ? fallback : duration
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    devWarn(
      warnKey,
      `[Tigercat] Duration ${String(duration)} does not auto-close. Pass a finite number >= 0.`
    )
    return 0
  }
  return value
}

export function resolveMessageDuration(type: MessageType, duration?: number): number {
  return normalizeAutoCloseDuration(duration, type === 'loading' ? 0 : 3000, 'message.duration')
}
