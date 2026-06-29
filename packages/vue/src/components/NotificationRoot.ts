import type {
  NotificationOptions,
  NotificationPosition,
  NotificationType
} from '@expcat/tigercat-core'

export type VueNotificationProps = NotificationOptions

type NotificationClose = () => void

let notificationModulePromise: Promise<typeof import('./Notification')> | null = null

function loadNotificationModule(): Promise<typeof import('./Notification')> {
  notificationModulePromise ??= import('./Notification')
  return notificationModulePromise
}

function forwardNotification(
  method: NotificationType,
  options: NotificationOptions
): NotificationClose {
  let closeNotification: NotificationClose | null = null
  let requestedClose = false
  void loadNotificationModule().then(({ notification }) => {
    const close = notification[method](options)
    if (requestedClose) {
      close()
    } else {
      closeNotification = close
    }
  })

  return () => {
    if (closeNotification) {
      closeNotification()
      closeNotification = null
    } else {
      requestedClose = true
    }
  }
}

export const notification: Record<
  NotificationType,
  (options: NotificationOptions) => NotificationClose
> & { clear: (position?: NotificationPosition) => void } = {
  success(options) {
    return forwardNotification('success', options)
  },
  warning(options) {
    return forwardNotification('warning', options)
  },
  error(options) {
    return forwardNotification('error', options)
  },
  info(options) {
    return forwardNotification('info', options)
  },
  clear(position) {
    void loadNotificationModule().then(({ notification }) => {
      notification.clear(position)
    })
  }
}
