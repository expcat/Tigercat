import React, { useEffect, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  createInstanceCounter,
  createNotificationStackUpdateScheduler,
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

const NOTIFICATION_CONTAINER_ID_PREFIX = 'tiger-notification-container'

const notificationInstancesByPosition: Record<NotificationPosition, NotificationInstance[]> = {
  'top-left': [],
  'top-right': [],
  'bottom-left': [],
  'bottom-right': []
}

const containerRoots: Record<NotificationPosition, Root | null> = {
  'top-left': null,
  'top-right': null,
  'bottom-left': null,
  'bottom-right': null
}
const updateCallbacks: Record<NotificationPosition, (() => void) | null> = {
  'top-left': null,
  'top-right': null,
  'bottom-left': null,
  'bottom-right': null
}
let stackUpdateScheduler: ReturnType<typeof createNotificationStackUpdateScheduler> | null = null
let getNextInstanceId: ReturnType<typeof createInstanceCounter> | null = null

export type NotificationProps = NotificationOptions

function getNotificationStackUpdateScheduler(): ReturnType<
  typeof createNotificationStackUpdateScheduler
> {
  stackUpdateScheduler ??= createNotificationStackUpdateScheduler()
  return stackUpdateScheduler
}

function getNotificationInstanceId(): string | number {
  getNextInstanceId ??= createInstanceCounter()
  return getNextInstanceId()
}

function scheduleNotificationStackUpdate(position: NotificationPosition): void {
  const callback = updateCallbacks[position]
  if (!callback) return

  getNotificationStackUpdateScheduler().schedule(position, callback)
}

interface NotificationHostProps {
  position: NotificationPosition
}

const NotificationHost: React.FC<NotificationHostProps> = ({ position }) => {
  const [notifications, setNotifications] = useState<NotificationInstance[]>([])

  useEffect(() => {
    updateCallbacks[position] = () => {
      setNotifications([...notificationInstancesByPosition[position]])
    }

    updateCallbacks[position]?.()

    return () => {
      getNotificationStackUpdateScheduler().cancel(position)
      updateCallbacks[position] = null
    }
  }, [position])

  return (
    <NotificationContainer
      position={position}
      notifications={notifications}
      onClose={(id) => removeNotification(id, position)}
    />
  )
}

function ensureContainer(position: NotificationPosition) {
  if (!isBrowser()) {
    return
  }

  const rootId = `${NOTIFICATION_CONTAINER_ID_PREFIX}-${position}-root`
  const existingRootEl = document.getElementById(rootId)

  if (containerRoots[position] && !existingRootEl) {
    containerRoots[position] = null
    updateCallbacks[position] = null
    getNotificationStackUpdateScheduler().cancel(position)
  }

  if (containerRoots[position]) {
    return
  }

  let rootEl = existingRootEl
  if (!rootEl) {
    rootEl = document.createElement('div')
    rootEl.id = rootId
    document.body.appendChild(rootEl)
  }

  containerRoots[position] = createRoot(rootEl)
  containerRoots[position]!.render(<NotificationHost position={position} />)
}

function destroyContainer(position: NotificationPosition) {
  const rootId = `${NOTIFICATION_CONTAINER_ID_PREFIX}-${position}-root`

  if (containerRoots[position]) {
    containerRoots[position]!.unmount()
    containerRoots[position] = null
  }

  updateCallbacks[position] = null
  getNotificationStackUpdateScheduler().cancel(position)

  if (isBrowser()) {
    document.getElementById(rootId)?.remove()
  }
}

function addNotification(config: NotificationConfig): () => void {
  const position = config.position || 'top-right'
  ensureContainer(position)

  const id = getNotificationInstanceId()

  const instance: NotificationInstance = {
    id,
    type: config.type || 'info',
    title: config.title,
    description: config.description,
    duration: config.duration !== undefined ? config.duration : 4500,
    closable: config.closable !== undefined ? config.closable : true,
    onClose: config.onClose,
    onClick: config.onClick,
    icon: config.icon,
    className: config.className,
    position
  }

  notificationInstancesByPosition[position].push(instance)
  scheduleNotificationStackUpdate(position)

  if (instance.duration > 0) {
    setTimeout(() => {
      removeNotification(id, position)
    }, instance.duration)
  }

  return () => removeNotification(id, position)
}

function removeNotification(id: string | number, position: NotificationPosition) {
  const instances = notificationInstancesByPosition[position]
  const index = instances.findIndex((notif) => notif.id === id)
  if (index !== -1) {
    const instance = instances[index]
    instances.splice(index, 1)
    instance.onClose?.()

    if (notificationInstancesByPosition[position].length > 0) {
      scheduleNotificationStackUpdate(position)
    }
  }

  if (notificationInstancesByPosition[position].length === 0) {
    destroyContainer(position)
  }
}

function clearAll(position?: NotificationPosition) {
  if (position) {
    notificationInstancesByPosition[position].forEach((instance) => {
      instance.onClose?.()
    })
    notificationInstancesByPosition[position] = []
    destroyContainer(position)
  } else {
    Object.keys(notificationInstancesByPosition).forEach((pos) => {
      const p = pos as NotificationPosition
      notificationInstancesByPosition[p].forEach((instance) => {
        instance.onClose?.()
      })
      notificationInstancesByPosition[p] = []
      destroyContainer(p)
    })
  }
}

function normalizeOptions(options: NotificationOptions): NotificationConfig {
  return normalizeStringOption<NotificationConfig>(options, 'title')
}

export const notification = {
  info(options: NotificationOptions): () => void {
    const config = normalizeOptions(options)
    return addNotification({ ...config, type: 'info' })
  },
  success(options: NotificationOptions): () => void {
    const config = normalizeOptions(options)
    return addNotification({ ...config, type: 'success' })
  },
  warning(options: NotificationOptions): () => void {
    const config = normalizeOptions(options)
    return addNotification({ ...config, type: 'warning' })
  },
  error(options: NotificationOptions): () => void {
    const config = normalizeOptions(options)
    return addNotification({ ...config, type: 'error' })
  },
  clear(position?: NotificationPosition) {
    clearAll(position)
  }
}

export default notification
