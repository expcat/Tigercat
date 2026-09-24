import {
  clearNotifications,
  enqueueNotification,
  getActiveFeedbackScope,
  type NotificationOptions,
  type NotificationPosition
} from '@expcat/tigercat-core'

export { NotificationContainer } from './NotificationContainer'
export type { NotificationContainerProps } from './NotificationContainer'

function open(
  type: 'info' | 'success' | 'warning' | 'error',
  options: NotificationOptions
): () => void {
  return enqueueNotification(getActiveFeedbackScope(), options, type)
}

export const notification = {
  info(options: NotificationOptions): () => void {
    return open('info', options)
  },
  success(options: NotificationOptions): () => void {
    return open('success', options)
  },
  warning(options: NotificationOptions): () => void {
    return open('warning', options)
  },
  error(options: NotificationOptions): () => void {
    return open('error', options)
  },
  clear(position?: NotificationPosition) {
    const scope = getActiveFeedbackScope()
    if (!scope) return
    if (!position) {
      clearNotifications(scope)
      return
    }
    scope.notifications
      .getSnapshot()
      .filter((item) => item.position === position)
      .forEach((item) => scope.notifications.remove(item.id))
  }
}

export default notification
