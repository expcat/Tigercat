/**
 * ChatWindow component utilities
 */

import type { ChatMessageStatus } from '../types/composite'

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
