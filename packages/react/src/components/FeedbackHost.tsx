import React, { useEffect, useRef, useSyncExternalStore } from 'react'
import {
  activateFeedbackScope,
  createFeedbackScope,
  dismissConfirmModal,
  isBrowser,
  settleConfirmModalOk,
  type DismissActionEvent,
  type FeedbackScope,
  type ImperativeModalRecord,
  type MessagePosition,
  type NotificationPosition
} from '@expcat/tigercat-core'
import { MessageContainer } from './MessageContainer'
import { Modal } from './Modal'
import { NotificationContainer } from './NotificationContainer'

const MESSAGE_POSITIONS: MessagePosition[] = [
  'top',
  'top-left',
  'top-right',
  'bottom',
  'bottom-left',
  'bottom-right'
]

const NOTIFICATION_POSITIONS: NotificationPosition[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right'
]

export const FeedbackDepthContext = React.createContext(0)

/** Renders the active ConfigProvider's message and notification queues. */
export function FeedbackHost() {
  const depth = React.useContext(FeedbackDepthContext)
  const scopeRef = useRef<FeedbackScope | null>(null)
  if (scopeRef.current === null) scopeRef.current = createFeedbackScope(depth)
  const scope = scopeRef.current
  scope.depth = depth

  if (isBrowser()) activateFeedbackScope(document, scope)
  useEffect(() => activateFeedbackScope(document, scope), [scope])

  const messages = useSyncExternalStore(
    scope.messages.subscribe,
    scope.messages.getSnapshot,
    scope.messages.getServerSnapshot
  )
  const notifications = useSyncExternalStore(
    scope.notifications.subscribe,
    scope.notifications.getSnapshot,
    scope.notifications.getServerSnapshot
  )
  const modals = useSyncExternalStore(
    scope.modals.subscribe,
    scope.modals.getSnapshot,
    scope.modals.getServerSnapshot
  )

  return (
    <div className="contents" data-tiger-toast="" data-tiger-feedback-host="">
      {MESSAGE_POSITIONS.map((position) => {
        const positioned = messages.filter((message) => message.position === position)
        if (positioned.length === 0) return null
        return (
          <MessageContainer
            key={position}
            position={position}
            messages={[...positioned]}
            portal={false}
            onClose={(id) => scope.messages.remove(id)}
            onPause={(id) => scope.messages.pause(id)}
            onResume={(id) => scope.messages.resume(id)}
          />
        )
      })}
      {NOTIFICATION_POSITIONS.map((position) => {
        const positioned = notifications.filter((item) => item.position === position)
        if (positioned.length === 0) return null
        return (
          <NotificationContainer
            key={position}
            position={position}
            notifications={[...positioned]}
            portal={false}
            onClose={(id) => scope.notifications.remove(id)}
            onPause={(id) => scope.notifications.pause(id)}
            onResume={(id) => scope.notifications.resume(id)}
          />
        )
      })}
      {modals.map((modal) => (
        <ImperativeModal key={modal.id} modal={modal} scope={scope} />
      ))}
    </div>
  )
}

function ImperativeModal({ modal, scope }: { modal: ImperativeModalRecord; scope: FeedbackScope }) {
  return (
    <Modal
      open
      title={modal.title}
      showDefaultFooter
      showCancel={modal.showCancel}
      okText={modal.okText}
      cancelText={modal.cancelText}
      data-tiger-confirm-kind={modal.kind}
      onOk={(event): void | Promise<void> => {
        let defaultPrevented = false
        const dismissEvent: DismissActionEvent = {
          preventDefault() {
            defaultPrevented = true
            event.preventDefault()
          },
          get defaultPrevented() {
            return defaultPrevented
          }
        }
        modal.okResult = modal.onOk?.(dismissEvent)
      }}
      onCancel={() => {
        modal.cancelled = true
      }}
      onClose={() => {
        if (modal.cancelled) dismissConfirmModal(modal)
        else settleConfirmModalOk(modal, modal.okResult)
        scope.modals.remove(modal.id)
      }}>
      {modal.content}
    </Modal>
  )
}
