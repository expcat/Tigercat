/**
 * ChatWindow shared helpers. Vue/React only bind the DOM.
 */

import type { ChatMessage, ChatMessageStatus } from '../types/composite'
import type { BadgeVariant } from '../types/badge'
import type { TigerLocaleChatWindow } from '../types/locale'
import { enUS } from './i18n/locales/en-US'
import { classNames } from './class-names'

export const EMPTY_CHAT_MESSAGES: ChatMessage[] = []

export const CHAT_STICK_TO_BOTTOM_PX = 32
export const CHAT_VIRTUAL_ESTIMATED_ITEM_HEIGHT = 88

export interface ChatScrollerMetrics {
  scrollHeight: number
  scrollTop: number
  clientHeight: number
}

export interface ChatMessageStatusInfo {
  text: string
  className: string
}

export const defaultChatMessageStatusInfo: Record<ChatMessageStatus, ChatMessageStatusInfo> = {
  sending: {
    text: enUS.chatWindow!.sendingText!,
    className: 'text-[var(--tiger-text-muted,#6b7280)]'
  },
  sent: {
    text: enUS.chatWindow!.sentText!,
    className: 'text-[var(--tiger-text-muted,#6b7280)]'
  },
  failed: {
    text: enUS.chatWindow!.failedText!,
    className: 'text-[var(--tiger-danger,#ef4444)]'
  }
}

export function buildChatMessageStatusInfo(
  labels: Pick<TigerLocaleChatWindow, 'sendingText' | 'sentText' | 'failedText'>
): Record<ChatMessageStatus, ChatMessageStatusInfo> {
  return {
    sending: {
      text: labels.sendingText ?? defaultChatMessageStatusInfo.sending.text,
      className: defaultChatMessageStatusInfo.sending.className
    },
    sent: {
      text: labels.sentText ?? defaultChatMessageStatusInfo.sent.text,
      className: defaultChatMessageStatusInfo.sent.className
    },
    failed: {
      text: labels.failedText ?? defaultChatMessageStatusInfo.failed.text,
      className: defaultChatMessageStatusInfo.failed.className
    }
  }
}

export function getChatMessageStatusInfo(
  status: ChatMessageStatus,
  statusMap: Record<ChatMessageStatus, ChatMessageStatusInfo> = defaultChatMessageStatusInfo
): ChatMessageStatusInfo {
  return statusMap[status] || defaultChatMessageStatusInfo[status]
}

export const chatStatusBarBaseClasses =
  'px-5 py-2 border-t border-[var(--tiger-border,#e5e7eb)] text-xs italic bg-[var(--tiger-surface-muted,#f9fafb)]'

const chatStatusBarVariantText: Record<BadgeVariant, string> = {
  default: 'text-[var(--tiger-text-muted,#6b7280)]',
  primary: 'text-[var(--tiger-primary,#2563eb)]',
  success: 'text-[var(--tiger-success,#22c55e)]',
  warning: 'text-[var(--tiger-warning,#f59e0b)]',
  danger: 'text-[var(--tiger-danger,#ef4444)]',
  info: 'text-[var(--tiger-info,#3b82f6)]'
}

export function getChatStatusBarClasses(variant: BadgeVariant = 'info'): string {
  return `${chatStatusBarBaseClasses} ${chatStatusBarVariantText[variant] ?? chatStatusBarVariantText.info}`
}

export const chatWindowRootClasses =
  'tiger-chat-window flex flex-col w-full h-full min-h-0 rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-sm overflow-hidden tiger-motion-aware motion-reduce:transition-none'

export const chatMessageListClasses =
  'flex-1 min-h-0 overflow-auto p-5 space-y-4 bg-[var(--tiger-surface-muted,#f9fafb)]'

export const chatComposerClasses =
  'flex items-end gap-3 px-5 py-4 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] rounded-b-lg'

export function getChatMessageRowClasses(isSelf: boolean): string {
  return classNames(
    'flex gap-3 items-start mb-4 last:mb-0',
    isSelf ? 'flex-row-reverse' : 'justify-start'
  )
}

export function getChatBubbleClasses(isSelf: boolean): string {
  return classNames(
    'rounded-[var(--tiger-radius-lg,0.75rem)] px-4 py-2.5 text-sm break-words shadow-sm tiger-motion-aware motion-reduce:transition-none',
    isSelf
      ? 'bg-[var(--tiger-primary,#2563eb)] text-white rounded-tr-[var(--tiger-radius-sm,0.375rem)]'
      : 'bg-[var(--tiger-surface,#ffffff)] border border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)] rounded-tl-[var(--tiger-radius-sm,0.375rem)]'
  )
}

export function isChatScrollerNearBottom(
  scroller: ChatScrollerMetrics,
  threshold = CHAT_STICK_TO_BOTTOM_PX
): boolean {
  return scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= threshold
}

export function canSendChatMessage(options: {
  disabled?: boolean
  allowEmpty?: boolean
  value?: string | null
  sending?: boolean
  hasSendHandler?: boolean
  lastSent?: string | null
}): boolean {
  if (options.disabled || options.sending || options.hasSendHandler === false) return false
  const raw = String(options.value ?? '')
  if (options.lastSent != null && options.lastSent === raw) return false
  if (options.allowEmpty) return true
  return raw.trim().length > 0
}

export function isChatEnterComposing(event: {
  isComposing?: boolean
  keyCode?: number
  which?: number
}): boolean {
  return Boolean(event.isComposing) || event.keyCode === 229 || event.which === 229
}

export function shouldSendChatOnEnter(
  event: {
    key?: string
    shiftKey?: boolean
    isComposing?: boolean
    keyCode?: number
    which?: number
  },
  options: {
    sendOnEnter?: boolean
    inputType?: 'input' | 'textarea'
    allowShiftEnter?: boolean
  }
): boolean {
  if (!options.sendOnEnter) return false
  if (event.key !== 'Enter') return false
  if (isChatEnterComposing(event)) return false
  if (options.inputType === 'textarea' && options.allowShiftEnter !== false && event.shiftKey) {
    return false
  }
  return true
}

export function getChatItemKey(messages: ChatMessage[], index: number): string | number {
  return messages[index]?.id ?? index
}

export interface ChatScrollPlan {
  stickToBottom: boolean
  autoScrollToBottom: boolean
  prepended: boolean
  previousScrollHeight: number
  nextScrollHeight: number
}

/**
 * Decide how to keep the viewport stable when the message list changes.
 *
 * Pinned (or not yet scrolled) follows the latest. After the user leaves the
 * bottom, prepends compensate `scrollTop` by the height delta so the current
 * messages stay in view.
 */
export function planChatScroll(plan: ChatScrollPlan): { scrollTop?: number; compensate?: number } {
  if (!plan.autoScrollToBottom) return {}
  if (plan.stickToBottom) return { scrollTop: plan.nextScrollHeight }
  if (plan.prepended) {
    return { compensate: Math.max(0, plan.nextScrollHeight - plan.previousScrollHeight) }
  }
  return {}
}

export function didChatPrepend(
  previousFirstId: string | number | undefined,
  nextFirstId: string | number | undefined,
  previousLength: number,
  nextLength: number
): boolean {
  if (nextLength <= previousLength) return false
  if (previousFirstId == null) return false
  return nextFirstId !== previousFirstId
}
