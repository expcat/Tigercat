import { createApp, defineComponent, h, ref, type App, type PropType } from 'vue'
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
export type { VueNotificationContainerProps } from './NotificationContainer'

const NOTIFICATION_CONTAINER_ID_PREFIX = 'tiger-notification-container'

const notificationInstancesByPosition: Record<NotificationPosition, NotificationInstance[]> = {
  'top-left': [],
  'top-right': [],
  'bottom-left': [],
  'bottom-right': []
}

const containerApps: Record<NotificationPosition, App<Element> | null> = {
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

export type VueNotificationProps = NotificationOptions

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

function getContainerRootId(position: NotificationPosition) {
  return `${NOTIFICATION_CONTAINER_ID_PREFIX}-${position}-root`
}

const NotificationHost = /* @__PURE__ */ defineComponent({
  name: 'TigerNotificationHost',
  props: {
    position: {
      type: String as PropType<NotificationPosition>,
      required: true
    }
  },
  setup(props) {
    const notifications = ref<NotificationInstance[]>([])

    updateCallbacks[props.position] = () => {
      notifications.value = [...notificationInstancesByPosition[props.position]]
    }
    updateCallbacks[props.position]?.()

    return () =>
      h(NotificationContainer, {
        position: props.position,
        notifications: notifications.value,
        onClose: (id: string | number) => removeNotification(id, props.position)
      })
  }
})

function ensureContainer(position: NotificationPosition) {
  if (!isBrowser()) {
    return
  }

  const rootId = getContainerRootId(position)
  const existingRootEl = document.getElementById(rootId)

  if (containerApps[position] && !existingRootEl) {
    containerApps[position] = null
    updateCallbacks[position] = null
    getNotificationStackUpdateScheduler().cancel(position)
  }

  if (containerApps[position]) {
    return
  }

  let rootEl = existingRootEl
  if (!rootEl) {
    rootEl = document.createElement('div')
    rootEl.id = rootId
    document.body.appendChild(rootEl)
  }

  containerApps[position] = createApp(NotificationHost, { position })
  containerApps[position]!.mount(rootEl)
}

function destroyContainer(position: NotificationPosition) {
  const rootId = getContainerRootId(position)

  if (containerApps[position]) {
    containerApps[position]!.unmount()
    containerApps[position] = null
  }

  updateCallbacks[position] = null
  getNotificationStackUpdateScheduler().cancel(position)

  if (isBrowser()) {
    document.getElementById(rootId)?.remove()
  }
}

function addNotification(config: NotificationConfig): () => void {
  const id = getNotificationInstanceId()
  const position = config.position || 'top-right'

  ensureContainer(position)

  const instance: NotificationInstance = {
    id,
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
