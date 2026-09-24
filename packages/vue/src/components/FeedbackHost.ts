import { defineComponent, h, inject, onBeforeUnmount, shallowRef, type InjectionKey } from 'vue'
import {
  activateFeedbackScope,
  createFeedbackScope,
  dismissConfirmModal,
  isBrowser,
  settleConfirmModalOk,
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

export const FeedbackDepthKey: InjectionKey<number> = Symbol('TigerFeedbackDepth')

function renderImperativeModal(
  modal: ImperativeModalRecord,
  scope: ReturnType<typeof createFeedbackScope>
) {
  return h(
    Modal,
    {
      key: modal.id,
      open: true,
      title: modal.title,
      showDefaultFooter: true,
      showCancel: modal.showCancel,
      okText: modal.okText,
      cancelText: modal.cancelText,
      'data-tiger-confirm-kind': modal.kind,
      onOk: (event: unknown) => {
        const result = modal.onOk?.(event as never)
        modal.okResult = result
        return result
      },
      onCancel: () => {
        modal.cancelled = true
      },
      onClose: () => {
        if (modal.cancelled) dismissConfirmModal(modal)
        else settleConfirmModalOk(modal, modal.okResult)
        scope.modals.remove(modal.id)
      }
    },
    {
      default: () => modal.content
    }
  )
}

/** Renders the active ConfigProvider's message and notification queues. */
export const FeedbackHost = defineComponent({
  name: 'TigerFeedbackHost',
  setup() {
    const depth = inject(FeedbackDepthKey, 0)
    const scope = createFeedbackScope(depth)
    const deactivate = isBrowser() ? activateFeedbackScope(document, scope) : undefined
    const messages = shallowRef(scope.messages.getSnapshot())
    const notifications = shallowRef(scope.notifications.getSnapshot())
    const modals = shallowRef(scope.modals.getSnapshot())
    const stopMessages = scope.messages.subscribe(() => {
      messages.value = scope.messages.getSnapshot()
    })
    const stopNotifications = scope.notifications.subscribe(() => {
      notifications.value = scope.notifications.getSnapshot()
    })
    const stopModals = scope.modals.subscribe(() => {
      modals.value = scope.modals.getSnapshot()
    })
    onBeforeUnmount(() => {
      deactivate?.()
      stopMessages()
      stopNotifications()
      stopModals()
    })

    return () => {
      const nodes = []
      for (const position of MESSAGE_POSITIONS) {
        const positioned = messages.value.filter((message) => message.position === position)
        if (positioned.length === 0) continue
        nodes.push(
          h(MessageContainer, {
            key: `message-${position}`,
            position,
            messages: [...positioned],
            portal: false,
            onClose: (id: string | number) => scope.messages.remove(id),
            onPause: (id: string | number) => scope.messages.pause(id),
            onResume: (id: string | number) => scope.messages.resume(id)
          })
        )
      }
      for (const position of NOTIFICATION_POSITIONS) {
        const positioned = notifications.value.filter((item) => item.position === position)
        if (positioned.length === 0) continue
        nodes.push(
          h(NotificationContainer, {
            key: `notification-${position}`,
            position,
            notifications: [...positioned],
            portal: false,
            onClose: (id: string | number) => scope.notifications.remove(id),
            onPause: (id: string | number) => scope.notifications.pause(id),
            onResume: (id: string | number) => scope.notifications.resume(id)
          })
        )
      }
      for (const modal of modals.value) {
        nodes.push(renderImperativeModal(modal, scope))
      }
      return h(
        'div',
        { class: 'contents', 'data-tiger-toast': '', 'data-tiger-feedback-host': '' },
        nodes
      )
    }
  }
})
