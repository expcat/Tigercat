/**
 * Message and notification queues for one ConfigProvider.
 *
 * The active scope lives on the document element, not a process-wide stack,
 * so two documents do not share a host. Imperative calls only mutate the
 * queue; the provider renders it.
 */

import type { MessageConfig, MessageInstance, MessageOptions, MessagePosition, MessageType } from '../types/message'
import type {
  NotificationConfig,
  NotificationInstance,
  NotificationOptions,
  NotificationPosition,
  NotificationType
} from '../types/notification'
import { devWarn } from './dev-warn'
import { isBrowser } from './env'
import { normalizeStringOption } from './imperative-api'
import { createToastQueue, type ToastQueue } from './imperative-host'
import { resolveMessageDuration } from './message-utils'
import { resolveNotificationDuration } from './notification-utils'

export const FEEDBACK_SCOPE_STACK = Symbol.for('tigercat.feedbackScopes')

export interface MessageQueueItem extends MessageInstance {
  position: MessagePosition
}

export interface FeedbackScope {
  /** Nesting depth. The deepest mounted provider owns imperative calls. */
  depth: number
  messages: ToastQueue<MessageQueueItem>
  notifications: ToastQueue<NotificationInstance>
}

type ScopeHost = HTMLElement & { [FEEDBACK_SCOPE_STACK]?: FeedbackScope[] }

export function createFeedbackScope(depth = 0): FeedbackScope {
  return {
    depth,
    messages: createToastQueue<MessageQueueItem>(
      {},
      { groupOf: (item) => String(item.position) }
    ),
    notifications: createToastQueue<NotificationInstance>(
      {},
      { groupOf: (item) => String(item.position) }
    )
  }
}

function readStack(root: HTMLElement): FeedbackScope[] {
  return (root as ScopeHost)[FEEDBACK_SCOPE_STACK] ?? []
}

export function activateFeedbackScope(doc: Document, scope: FeedbackScope): () => void {
  const root = doc.documentElement
  const stack = readStack(root).filter((item) => item !== scope)
  stack.push(scope)
  ;(root as ScopeHost)[FEEDBACK_SCOPE_STACK] = stack
  return () => {
    const next = readStack(root).filter((item) => item !== scope)
    if (next.length === 0) delete (root as ScopeHost)[FEEDBACK_SCOPE_STACK]
    else (root as ScopeHost)[FEEDBACK_SCOPE_STACK] = next
  }
}

export function getActiveFeedbackScope(doc?: Document | null): FeedbackScope | null {
  const target = doc ?? (isBrowser() ? document : null)
  if (!target) return null
  const stack = readStack(target.documentElement)
  let best: FeedbackScope | null = null
  for (const item of stack) {
    if (!best || item.depth >= best.depth) best = item
  }
  return best
}

function missingHost(kind: 'message' | 'notification'): () => void {
  if (isBrowser()) {
    devWarn(
      `feedback.${kind}.host`,
      `[Tigercat] ${kind === 'message' ? 'Message' : 'notification'} updates the queue rendered by ConfigProvider. Mount one before calling it.`
    )
  }
  return () => undefined
}

export function enqueueMessage(
  scope: FeedbackScope | null,
  options: MessageOptions,
  type: MessageType
): () => void {
  if (!isBrowser() || !scope) return missingHost('message')
  const config = { ...normalizeStringOption<MessageConfig>(options, 'content'), type }
  const instance = scope.messages.add({
    id: config.key,
    type,
    content: config.content,
    duration: resolveMessageDuration(type, config.duration),
    closable: config.closable ?? true,
    onClose: config.onClose,
    icon: config.icon,
    className: config.className,
    closeAriaLabel: config.closeAriaLabel,
    position: config.position ?? 'top'
  })
  if (!instance) return () => undefined
  return () => {
    scope.messages.remove(instance.id)
  }
}

export function clearMessages(scope: FeedbackScope | null): void {
  scope?.messages.clear()
}

export function enqueueNotification(
  scope: FeedbackScope | null,
  options: NotificationOptions,
  type: NotificationType
): () => void {
  if (!isBrowser() || !scope) return missingHost('notification')
  const normalized =
    typeof options === 'string'
      ? ({ title: options } as NotificationConfig)
      : options
  const position: NotificationPosition = normalized.position ?? 'top-right'
  const instance = scope.notifications.add({
    id: normalized.key,
    type,
    title: normalized.title,
    description: normalized.description,
    duration: resolveNotificationDuration(normalized.duration),
    closable: normalized.closable ?? true,
    onClose: normalized.onClose,
    onClick: normalized.onClick,
    actionLabel: normalized.actionLabel,
    actions: normalized.actions,
    icon: normalized.icon,
    className: normalized.className,
    closeAriaLabel: normalized.closeAriaLabel,
    position
  })
  if (!instance) return () => undefined
  return () => {
    scope.notifications.remove(instance.id)
  }
}

export function clearNotifications(scope: FeedbackScope | null): void {
  scope?.notifications.clear()
}
