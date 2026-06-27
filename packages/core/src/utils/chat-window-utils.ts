/**
 * ChatWindow component utilities
 */

import type { ChatMessageStatus } from '../types/composite'
import type { BadgeVariant } from '../types/badge'

export interface ChatMessageStatusInfo {
  text: string
  className: string
}

export const defaultChatMessageStatusInfo: Record<ChatMessageStatus, ChatMessageStatusInfo> = {
  sending: { text: '发送中', className: 'text-[var(--tiger-text-muted,#6b7280)]' },
  sent: { text: '已送达', className: 'text-[var(--tiger-text-muted,#6b7280)]' },
  failed: { text: '发送失败', className: 'text-[var(--tiger-danger,#ef4444)]' }
}

export function getChatMessageStatusInfo(
  status: ChatMessageStatus,
  statusMap: Record<ChatMessageStatus, ChatMessageStatusInfo> = defaultChatMessageStatusInfo
): ChatMessageStatusInfo {
  return statusMap[status] || defaultChatMessageStatusInfo[status]
}

/** Base structural classes for the ChatWindow status bar (always applied) */
export const chatStatusBarBaseClasses =
  'px-5 py-2 border-t border-[var(--tiger-border,#e5e7eb)] text-xs italic bg-[var(--tiger-surface-muted,#f9fafb)]'

/** Per-variant text color for the ChatWindow status bar */
const chatStatusBarVariantText: Record<BadgeVariant, string> = {
  default: 'text-[var(--tiger-text-muted,#6b7280)]',
  primary: 'text-[var(--tiger-primary,#2563eb)]',
  success: 'text-[var(--tiger-success,#22c55e)]',
  warning: 'text-[var(--tiger-warning,#f59e0b)]',
  danger: 'text-[var(--tiger-danger,#ef4444)]',
  info: 'text-[var(--tiger-info,#3b82f6)]'
}

/**
 * Get the ChatWindow status bar classes for a given status variant.
 *
 * The status bar keeps its structural classes and applies a semantic text
 * color driven by `statusVariant` (defaults to `info`).
 */
export function getChatStatusBarClasses(variant: BadgeVariant = 'info'): string {
  return `${chatStatusBarBaseClasses} ${chatStatusBarVariantText[variant] ?? chatStatusBarVariantText.info}`
}
