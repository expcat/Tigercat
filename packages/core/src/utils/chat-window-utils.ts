/**
 * ChatWindow shared helpers. Vue/React only bind the DOM.
 */

import type { ChatMessage, ChatMessageStatus } from '../types/chat'
import type { BadgeVariant } from '../types/badge'
import type { TigerLocaleChatWindow } from '../types/locale'

import { classNames } from './class-names'
import { getChatWindowLabels } from './locale-utils'

const chatStatusLabels = getChatWindowLabels()

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
    text: chatStatusLabels.sendingText,
    className: 'text-[var(--tiger-text-secondary)]'
  },
  sent: {
    text: chatStatusLabels.sentText,
    className: 'text-[var(--tiger-text-secondary)]'
  },
  failed: {
    text: chatStatusLabels.failedText,
    className: 'text-[var(--tiger-error)]'
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
  'px-5 py-2 border-t border-[var(--tiger-border)] text-xs italic bg-[var(--tiger-surface-muted)]'

const chatStatusBarVariantText: Record<BadgeVariant, string> = {
  default: 'text-[var(--tiger-text-secondary)]',
  primary: 'text-[var(--tiger-primary)]',
  success: 'text-[var(--tiger-success)]',
  warning: 'text-[var(--tiger-warning)]',
  danger: 'text-[var(--tiger-danger)]',
  info: 'text-[var(--tiger-info)]'
}

export function getChatStatusBarClasses(variant: BadgeVariant = 'info'): string {
  return `${chatStatusBarBaseClasses} ${chatStatusBarVariantText[variant] ?? chatStatusBarVariantText.info}`
}

export const chatWindowRootClasses =
  'tiger-chat-window flex flex-col w-full h-full min-h-0 rounded-[var(--tiger-radius-md)] border border-[var(--tiger-border)] bg-[var(--tiger-surface)] shadow-sm overflow-hidden tiger-motion-aware motion-reduce:transition-none'

export const chatMessageListClasses =
  'flex-1 min-h-0 overflow-auto p-5 space-y-4 bg-[var(--tiger-surface-muted)]'

export const chatComposerClasses =
  'flex items-end gap-3 px-5 py-4 border-t border-[var(--tiger-border)] bg-[var(--tiger-surface)] rounded-b-lg'

export function getChatMessageRowClasses(isSelf: boolean): string {
  return classNames(
    'flex gap-3 items-start mb-4 last:mb-0',
    isSelf ? 'flex-row-reverse' : 'justify-start'
  )
}

export function getChatBubbleClasses(isSelf: boolean): string {
  return classNames(
    'rounded-[var(--tiger-radius-lg)] px-4 py-2.5 text-sm break-words shadow-sm tiger-motion-aware motion-reduce:transition-none',
    isSelf
      ? 'bg-[var(--tiger-primary)] text-white rounded-tr-[var(--tiger-radius-sm)]'
      : 'bg-[var(--tiger-surface)] border border-[var(--tiger-border)] text-[var(--tiger-text)] rounded-tl-[var(--tiger-radius-sm)]'
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
}): boolean {
  if (options.disabled || options.sending || options.hasSendHandler === false) return false
  const raw = String(options.value ?? '')
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

/** Long threads mount a virtual window unless the caller sets `virtual={false}`. */
export const CHAT_VIRTUAL_THRESHOLD = 40

export interface ChatScrollPlan {
  messages: readonly { id?: string | number }[]
  stickToBottom: boolean
  /** The previous thread shares no message id with this one. */
  sessionChanged: boolean
  /** Message that should stay visible when the user is not stuck to the bottom. */
  anchorId: string | number | null
}

export interface ChatScrollDecision {
  anchorId: string | number | null
  align: 'auto' | 'end'
  stickToBottom: boolean
}

export function chatThreadSharesId(
  previousIds: ReadonlySet<string>,
  nextIds: readonly (string | number | undefined | null)[]
): boolean {
  if (previousIds.size === 0) return true
  for (const id of nextIds) {
    if (id != null && previousIds.has(String(id))) return true
  }
  return false
}

/**
 * Stick-to-bottom follows the last message id. A prepend keeps `anchorId`.
 * Replacing the thread resets the stick. Pixel deltas are not the anchor.
 */
export function planChatScroll(plan: ChatScrollPlan): ChatScrollDecision {
  const lastId = plan.messages[plan.messages.length - 1]?.id ?? null
  if (plan.sessionChanged) {
    return { anchorId: lastId, align: 'end', stickToBottom: true }
  }
  if (plan.stickToBottom) {
    return { anchorId: lastId, align: 'end', stickToBottom: true }
  }
  return { anchorId: plan.anchorId, align: 'auto', stickToBottom: false }
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
