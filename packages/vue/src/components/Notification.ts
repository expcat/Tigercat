import { createApp, defineComponent, h, onBeforeUnmount, shallowRef, type App } from 'vue'
import {
  createImperativeHost,
  createToastQueue,
  isBrowser,
  normalizeStringOption,
  type NotificationConfig,
  type NotificationInstance,
  type NotificationOptions,
  type NotificationPosition
} from '@expcat/tigercat-core'
import { NotificationContainer } from './NotificationContainer'

export { NotificationContainer } from './NotificationContainer'
export type { VueNotificationContainerProps } from './NotificationContainer'

const NOTIFICATION_POSITIONS: NotificationPosition[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right'
]

const notificationQueue = createToastQueue<NotificationInstance>()
const host = createImperativeHost<App<Element>>({
  mount(element) {
    const app = createApp(NotificationHost)
    app.mount(element)
    return app
  },
  unmount(app) {
    app.unmount()
  }
})

notificationQueue.subscribe(() => {
  if (notificationQueue.getSnapshot().length > 0) return
  queueMicrotask(() => {
    if (notificationQueue.getSnapshot().length === 0) host.teardown()
  })
})

const NotificationHost = /* @__PURE__ */ defineComponent({
  name: 'TigerNotificationHost',
  setup() {
    const notifications = shallowRef<readonly NotificationInstance[]>(
      notificationQueue.getSnapshot()
    )
    const stop = notificationQueue.subscribe(() => {
      notifications.value = notificationQueue.getSnapshot()
    })
    onBeforeUnmount(stop)

    return () =>
      NOTIFICATION_POSITIONS.map((position) => {
        const positioned = notifications.value.filter((item) => item.position === position)
        if (positioned.length === 0) return null
        return h(NotificationContainer, {
          key: position,
          position,
          notifications: [...positioned],
          portal: false,
          onClose: (id: string | number) => notificationQueue.remove(id)
        })
      })
  }
})

function addNotification(config: NotificationConfig): () => void {
  if (!isBrowser()) return () => undefined

  const instance = notificationQueue.add({
    type: config.type || 'info',
    title: config.title,
    description: config.description,
    duration: config.duration !== undefined ? config.duration : 4500,
    closable: config.closable !== undefined ? config.closable : true,
    onClose: config.onClose,
    onClick: config.onClick,
    actions: config.actions,
    icon: config.icon,
    className: config.className,
    closeAriaLabel: config.closeAriaLabel,
    position: config.position || 'top-right'
  })

  if (!instance) return () => undefined
  host.ensure()
  return () => {
    notificationQueue.remove(instance.id)
  }
}

function normalizeOptions(options: NotificationOptions): NotificationConfig {
  return normalizeStringOption<NotificationConfig>(options, 'title')
}

export const notification = {
  info(options: NotificationOptions): () => void {
    return addNotification({ ...normalizeOptions(options), type: 'info' })
  },
  success(options: NotificationOptions): () => void {
    return addNotification({ ...normalizeOptions(options), type: 'success' })
  },
  warning(options: NotificationOptions): () => void {
    return addNotification({ ...normalizeOptions(options), type: 'warning' })
  },
  error(options: NotificationOptions): () => void {
    return addNotification({ ...normalizeOptions(options), type: 'error' })
  },
  clear(position?: NotificationPosition) {
    if (position) {
      notificationQueue
        .getSnapshot()
        .filter((item) => item.position === position)
        .forEach((item) => notificationQueue.remove(item.id))
      return
    }
    notificationQueue.clear()
    host.teardown()
  }
}

export default notification
