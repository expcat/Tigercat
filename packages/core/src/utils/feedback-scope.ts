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
import type { DismissActionEvent } from './confirm-action'
import { resolveMessageDuration } from './message-utils'
import { resolveNotificationDuration } from './notification-utils'

export const FEEDBACK_SCOPE_STACK = Symbol.for('tigercat.feedbackScopes')

export interface MessageQueueItem extends MessageInstance {
  position: MessagePosition
}

export type ConfirmModalKind = 'confirm' | 'info' | 'success' | 'warning' | 'error'

export interface ImperativeModalRecord {
  id: number
  kind: ConfirmModalKind
  title: string
  content: string
  showCancel: boolean
  okText?: string
  cancelText?: string
  onOk?: (event: DismissActionEvent) => unknown
  /** Value returned by the OK handler. The caller promise adopts it. */
  okResult?: unknown
  cancelled: boolean
  settled: boolean
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}

export interface ModalQueue {
  add: (item: ImperativeModalRecord) => void
  remove: (id: number) => void
  clear: () => void
  getSnapshot: () => readonly ImperativeModalRecord[]
  getServerSnapshot: () => readonly ImperativeModalRecord[]
  subscribe: (listener: () => void) => () => void
}

const EMPTY_MODALS: ImperativeModalRecord[] = []

export function createModalQueue(): ModalQueue {
  let items: ImperativeModalRecord[] = []
  const listeners = new Set<() => void>()
  const emit = () => {
    listeners.forEach((listener) => listener())
  }
  return {
    add(item) {
      items = [...items, item]
      emit()
    },
    remove(id) {
      const next = items.filter((item) => item.id !== id)
      if (next.length === items.length) return
      items = next
      emit()
    },
    clear() {
      if (items.length === 0) return
      items = []
      emit()
    },
    getSnapshot: () => items,
    getServerSnapshot: () => EMPTY_MODALS,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    }
  }
}

export interface FeedbackScope {
  /** Nesting depth. The deepest mounted provider owns imperative calls. */
  depth: number
  messages: ToastQueue<MessageQueueItem>
  notifications: ToastQueue<NotificationInstance>
  modals: ModalQueue
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
    ),
    modals: createModalQueue()
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
    description: typeof normalized.description === 'string' ? normalized.description : undefined,
    descriptionNode: normalized.descriptionNode,
    actionNode: normalized.actionNode,
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

export interface MessagePromisePhases {
  loading: string
  success: string
  error: string
}

let modalSerial = 1

export interface ConfirmModalInput {
  kind?: ConfirmModalKind
  title?: string
  content?: string
  okText?: string
  cancelText?: string
  onOk?: (event: DismissActionEvent) => unknown
}

function rejectModal(item: ImperativeModalRecord): void {
  if (item.settled) return
  item.settled = true
  item.reject(new Error('cancel'))
}

/**
 * OK adopts `onOk`'s return value, including an existing Promise.
 * Cancel and destroyAll reject.
 */
export function enqueueConfirmModal(
  scope: FeedbackScope | null,
  input: ConfirmModalInput
): Promise<unknown> {
  if (!isBrowser() || !scope) {
    if (isBrowser()) {
      devWarn(
        'feedback.modal.host',
        '[Tigercat] confirmModal renders on the ConfigProvider modal host. Mount one before calling it.'
      )
    }
    return Promise.reject(new Error('host'))
  }
  const kind = input.kind ?? 'confirm'
  return new Promise((resolve, reject) => {
    const record: ImperativeModalRecord = {
      id: modalSerial++,
      kind,
      title: input.title ?? '',
      content: input.content ?? '',
      showCancel: kind === 'confirm',
      okText: input.okText,
      cancelText: input.cancelText,
      onOk: input.onOk,
      cancelled: false,
      settled: false,
      resolve: (value) => {
        if (record.settled) return
        record.settled = true
        resolve(value)
      },
      reject: (reason) => {
        if (record.settled) return
        record.settled = true
        reject(reason instanceof Error ? reason : new Error('cancel'))
      }
    }
    scope.modals.add(record)
  })
}

export function settleConfirmModalOk(record: ImperativeModalRecord, value: unknown): void {
  record.okResult = value
  record.resolve(value)
}

export function dismissConfirmModal(record: ImperativeModalRecord): void {
  record.cancelled = true
  rejectModal(record)
}

export function destroyAllConfirmModals(scope: FeedbackScope | null): void {
  if (!scope) return
  const open = scope.modals.getSnapshot()
  open.forEach((item) => dismissConfirmModal(item))
  scope.modals.clear()
}

/**
 * One key walks loading → success or error. Loading does not auto-dismiss.
 */
export async function settleMessage<T>(
  scope: FeedbackScope | null,
  key: string | number,
  phases: MessagePromisePhases,
  task: Promise<T>
): Promise<T> {
  enqueueMessage(scope, { key, content: phases.loading, duration: 0, closable: false }, 'loading')
  try {
    const value = await task
    enqueueMessage(scope, { key, content: phases.success }, 'success')
    return value
  } catch (error) {
    enqueueMessage(scope, { key, content: phases.error }, 'error')
    throw error
  }
}
