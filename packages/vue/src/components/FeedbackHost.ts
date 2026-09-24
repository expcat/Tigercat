import { defineComponent, h, inject, onBeforeUnmount, shallowRef, type InjectionKey } from 'vue'
import {
  activateFeedbackScope,
  createFeedbackScope,
  isBrowser,
  type MessagePosition,
  type NotificationPosition
} from '@expcat/tigercat-core'
import { MessageContainer } from './MessageContainer'
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

/** Renders the active ConfigProvider's message and notification queues. */
export const FeedbackHost = defineComponent({
  name: 'TigerFeedbackHost',
  setup() {
    const depth = inject(FeedbackDepthKey, 0)
    const scope = createFeedbackScope(depth)
    const deactivate = isBrowser() ? activateFeedbackScope(document, scope) : undefined
    const messages = shallowRef(scope.messages.getSnapshot())
    const notifications = shallowRef(scope.notifications.getSnapshot())
    const stopMessages = scope.messages.subscribe(() => {
      messages.value = scope.messages.getSnapshot()
    })
    const stopNotifications = scope.notifications.subscribe(() => {
      notifications.value = scope.notifications.getSnapshot()
    })
    onBeforeUnmount(() => {
      deactivate?.()
      stopMessages()
      stopNotifications()
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
      return h(
        'div',
        { class: 'contents', 'data-tiger-toast': '', 'data-tiger-feedback-host': '' },
        nodes
      )
    }
  }
})
