import {
  isBrowser,
  type NotificationOptions,
  type NotificationPosition,
  type NotificationType
} from '@expcat/tigercat-core'

export type { NotificationOptions }

type NotificationClose = () => void

let notificationModulePromise: Promise<typeof import('./Notification')> | null = null
let resolvedNotification: (typeof import('./Notification'))['notification'] | null = null

function loadNotificationModule(): Promise<typeof import('./Notification')> {
  notificationModulePromise ??= import('./Notification').then((module) => {
    resolvedNotification = module.notification
    return module
  })
  return notificationModulePromise
}

function forwardNotification(
  method: NotificationType,
  options: NotificationOptions
): NotificationClose {
  if (!isBrowser()) return () => undefined
  if (resolvedNotification) {
    return resolvedNotification[method](options)
  }
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
    if (!isBrowser()) return
    if (resolvedNotification) {
      resolvedNotification.clear(position)
      return
    }
    void loadNotificationModule().then(({ notification }) => {
      notification.clear(position)
    })
  }
}
