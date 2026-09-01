import React, { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
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
export type { NotificationContainerProps } from './NotificationContainer'

const NOTIFICATION_POSITIONS: NotificationPosition[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right'
]

const notificationQueue = createToastQueue<NotificationInstance>()
const host = createImperativeHost<Root>({
  mount(element) {
    const root = createRoot(element)
    flushSync(() => {
      root.render(<NotificationHost />)
    })
    return root
  },
  unmount(root) {
    root.unmount()
  }
})

notificationQueue.subscribe(() => {
  if (notificationQueue.getSnapshot().length > 0) return
  queueMicrotask(() => {
    if (notificationQueue.getSnapshot().length === 0) host.teardown()
  })
})

function NotificationHost() {
  const notifications = useSyncExternalStore(
    notificationQueue.subscribe,
    notificationQueue.getSnapshot,
    notificationQueue.getServerSnapshot
  )

  return (
    <>
      {NOTIFICATION_POSITIONS.map((position) => {
        const positioned = notifications.filter((item) => item.position === position)
        if (positioned.length === 0) return null
        return (
          <NotificationContainer
            key={position}
            position={position}
            notifications={[...positioned]}
            onClose={(id) => notificationQueue.remove(id)}
            portal={false}
          />
        )
      })}
    </>
  )
}

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
