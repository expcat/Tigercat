import {
  createApp,
  type App,
  computed,
  defineComponent,
  h,
  ref,
  Teleport,
  TransitionGroup,
  type PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  icon24PathStrokeLinecap,
  icon24PathStrokeLinejoin,
  icon24StrokeWidth,
  icon24ViewBox,
  getNotificationIconPath,
  getNotificationTypeClasses,
  notificationBaseClasses,
  notificationCloseButtonClasses,
  notificationCloseIconClasses,
  notificationCloseIconPath,
  notificationContainerBaseClasses,
  notificationContentClasses,
  notificationDescriptionClasses,
  notificationIconClasses,
  notificationPositionClasses,
  notificationTitleClasses,
  type NotificationConfig,
  type NotificationInstance,
  type NotificationOptions,
  type NotificationPosition,
  isBrowser
} from '@expcat/tigercat-core'

type HArrayChildren = Extract<NonNullable<Parameters<typeof h>[2]>, unknown[]>

/**
 * Global notification container id prefix
 */
const NOTIFICATION_CONTAINER_ID_PREFIX = 'tiger-notification-container'
const NOTIFICATION_CLOSE_ARIA_LABEL = 'Close notification'

const IS_TEST_ENV = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'

/**
 * Notification instance storage per position
 */
const notificationInstancesByPosition: Record<NotificationPosition, NotificationInstance[]> = {
  'top-left': [],
  'top-right': [],
  'bottom-left': [],
  'bottom-right': []
}

let instanceIdCounter = 0

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

/**
 * Get next instance id
 */
function getNextInstanceId(): number {
  return ++instanceIdCounter
}

/**
 * Create icon element
 */
function createIcon(path: string, className: string) {
  return h(
    'svg',
    {
      class: className,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: icon24ViewBox,
      stroke: 'currentColor',
      'stroke-width': String(icon24StrokeWidth),
      'aria-hidden': 'true',
      focusable: 'false'
    },
    [
      h('path', {
        'stroke-linecap': icon24PathStrokeLinecap,
        'stroke-linejoin': icon24PathStrokeLinejoin,
        d: path
      })
    ]
  )
}

function getContainerRootId(position: NotificationPosition) {
  return `${NOTIFICATION_CONTAINER_ID_PREFIX}-${position}-root`
}

/**
 * Notification container component for a specific position
 */
export const NotificationContainer = defineComponent({
  name: 'TigerNotificationContainer',
  inheritAttrs: false,
  props: {
    position: {
      type: String as PropType<NotificationPosition>,
      default: 'top-right' as NotificationPosition
    }
  },
  setup(props, { attrs }) {
    const notifications = ref<NotificationInstance[]>([])

    const syncNotifications = () => {
      notifications.value = [...notificationInstancesByPosition[props.position]]
    }

    updateCallbacks[props.position] = syncNotifications
    syncNotifications()

    const containerClasses = computed(() =>
      classNames(
        notificationContainerBaseClasses,
        notificationPositionClasses[props.position],
        coerceClassValue(attrs.class)
      )
    )

    const renderNotificationItem = (notification: NotificationInstance) => {
      const colorScheme = getNotificationTypeClasses(notification.type)

      const notificationClasses = classNames(
        notificationBaseClasses,
        colorScheme.bg,
        colorScheme.border,
        notification.className
      )

      const iconPath = notification.icon || getNotificationIconPath(notification.type)
      const iconClass = classNames(notificationIconClasses, colorScheme.icon)

      const a11yRole = notification.type === 'error' ? 'alert' : 'status'
      const ariaLive = notification.type === 'error' ? 'assertive' : 'polite'

      const contentChildren = [
        h(
          'div',
          {
            class: classNames(notificationTitleClasses, colorScheme.titleText)
          },
          notification.title
        )
      ]

      if (notification.description) {
        contentChildren.push(
          h(
            'div',
            {
              class: classNames(notificationDescriptionClasses, colorScheme.descriptionText)
            },
            notification.description
          )
        )
      }

      const children: HArrayChildren = [
        createIcon(iconPath, iconClass),
        h('div', { class: notificationContentClasses }, contentChildren)
      ]

      if (notification.closable) {
        children.push(
          h(
            'button',
            {
              class: notificationCloseButtonClasses,
              onClick: (e: MouseEvent) => {
                e.stopPropagation()
                removeNotification(notification.id, props.position)
              },
              'aria-label': NOTIFICATION_CLOSE_ARIA_LABEL,
              type: 'button'
            },
            createIcon(notificationCloseIconPath, notificationCloseIconClasses)
          )
        )
      }

      return h(
        'div',
        {
          key: notification.id,
          class: notificationClasses,
          role: a11yRole,
          'aria-live': ariaLive,
          'aria-atomic': 'true',
          onClick: notification.onClick,
          onKeydown: (e: KeyboardEvent) => {
            if (!notification.onClick) return
            const key = e.key
            if (key === 'Enter' || key === ' ') {
              e.preventDefault()
              notification.onClick()
            }
          },
          tabindex: notification.onClick ? 0 : undefined,
          style: notification.onClick ? 'cursor: pointer;' : undefined,
          'data-tiger-notification': '',
          'data-tiger-notification-type': notification.type,
          'data-tiger-notification-id': String(notification.id)
        },
        children
      )
    }

    return () =>
      h(
        Teleport,
        { to: 'body' },
        h(
          'div',
          {
            ...attrs,
            class: containerClasses.value,
            id: `${NOTIFICATION_CONTAINER_ID_PREFIX}-${props.position}`,
            'aria-live': 'polite',
            'aria-relevant': 'additions',
            'data-tiger-notification-container': '',
            'data-tiger-notification-position': props.position
          },
          IS_TEST_ENV
            ? notifications.value.map(renderNotificationItem)
            : h(
                TransitionGroup,
                {
                  name: 'notification',
                  tag: 'div',
                  class: 'flex flex-col gap-3'
                },
                () => notifications.value.map(renderNotificationItem)
              )
        )
      )
  }
})

function ensureContainer(position: NotificationPosition) {
  if (!isBrowser()) {
    return
  }

  const rootId = getContainerRootId(position)
  const existingRootEl = document.getElementById(rootId)

  // If we already created an app but the DOM was externally cleared (e.g. tests), reset.
  if (containerApps[position] && !existingRootEl) {
    containerApps[position] = null
    updateCallbacks[position] = null
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

  containerApps[position] = createApp(NotificationContainer, { position })
  containerApps[position]!.mount(rootEl)
}

function destroyContainer(position: NotificationPosition) {
  const rootId = getContainerRootId(position)

  if (containerApps[position]) {
    containerApps[position]!.unmount()
    containerApps[position] = null
  }

  updateCallbacks[position] = null

  if (isBrowser()) {
    document.getElementById(rootId)?.remove()
  }
}

/**
 * Add a notification to the queue
 */
function addNotification(config: NotificationConfig): () => void {
  const id = getNextInstanceId()
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
    icon: config.icon,
    className: config.className,
    position
  }

  notificationInstancesByPosition[position].push(instance)

  updateCallbacks[position]?.()

  // Auto close after duration
  if (instance.duration > 0) {
    setTimeout(() => {
      removeNotification(id, position)
    }, instance.duration)
  }

  // Return close function
  return () => removeNotification(id, position)
}

/**
 * Remove a notification from the queue
 */
function removeNotification(id: string | number, position: NotificationPosition) {
  const instances = notificationInstancesByPosition[position]
  const index = instances.findIndex((notif) => notif.id === id)
  if (index !== -1) {
    const instance = instances[index]
    instances.splice(index, 1)
    instance.onClose?.()
  }

  updateCallbacks[position]?.()

  if (notificationInstancesByPosition[position].length === 0) {
    destroyContainer(position)
  }
}

/**
 * Clear all notifications for a position or all positions
 */
function clearAll(position?: NotificationPosition) {
  if (position) {
    notificationInstancesByPosition[position].forEach((instance) => {
      instance.onClose?.()
    })
    notificationInstancesByPosition[position] = []
    destroyContainer(position)
  } else {
    // Clear all positions
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

/**
 * Normalize notification options
 */
function normalizeOptions(options: NotificationOptions): NotificationConfig {
  if (typeof options === 'string') {
    return { title: options }
  }
  return options
}

/**
 * Notification API
 */
export const notification = {
  /**
   * Show an info notification
   */
  info(options: NotificationOptions): () => void {
    const config = normalizeOptions(options)
    return addNotification({ ...config, type: 'info' })
  },

  /**
   * Show a success notification
   */
  success(options: NotificationOptions): () => void {
    const config = normalizeOptions(options)
    return addNotification({ ...config, type: 'success' })
  },

  /**
   * Show a warning notification
   */
  warning(options: NotificationOptions): () => void {
    const config = normalizeOptions(options)
    return addNotification({ ...config, type: 'warning' })
  },

  /**
   * Show an error notification
   */
  error(options: NotificationOptions): () => void {
    const config = normalizeOptions(options)
    return addNotification({ ...config, type: 'error' })
  },

  /**
   * Clear all notifications
   */
  clear(position?: NotificationPosition) {
    clearAll(position)
  }
}

export default notification
