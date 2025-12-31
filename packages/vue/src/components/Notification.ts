import { defineComponent, h, ref, computed, onMounted, onUnmounted, Teleport, TransitionGroup, PropType } from 'vue'
import { 
  classNames,
  getNotificationTypeClasses,
  defaultNotificationThemeColors,
  notificationContainerBaseClasses,
  notificationPositionClasses,
  notificationBaseClasses,
  notificationIconClasses,
  notificationContentClasses,
  notificationTitleClasses,
  notificationDescriptionClasses,
  notificationCloseButtonClasses,
  getNotificationIconPath,
  notificationCloseIconPath,
  type NotificationPosition,
  type NotificationInstance,
  type NotificationOptions,
  type NotificationConfig,
} from '@tigercat/core'

/**
 * Global notification container id prefix
 */
const NOTIFICATION_CONTAINER_ID_PREFIX = 'tiger-notification-container'

/**
 * Notification instance storage per position
 */
const notificationInstancesByPosition: Record<NotificationPosition, NotificationInstance[]> = {
  'top-left': [],
  'top-right': [],
  'bottom-left': [],
  'bottom-right': [],
}

let instanceIdCounter = 0

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
      viewBox: '0 0 24 24',
      stroke: 'currentColor',
      'stroke-width': '2',
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: path,
      }),
    ]
  )
}

/**
 * Notification container component for a specific position
 */
export const NotificationContainer = defineComponent({
  name: 'TigerNotificationContainer',
  props: {
    position: {
      type: String as PropType<NotificationPosition>,
      default: 'top-right' as NotificationPosition,
    },
  },
  setup(props) {
    const notifications = ref<NotificationInstance[]>([])
    
    // Sync with global notification instances
    const syncNotifications = () => {
      notifications.value = [...notificationInstancesByPosition[props.position]]
    }
    
    // Update notifications periodically to check for changes
    let intervalId: number | undefined
    
    onMounted(() => {
      syncNotifications()
      intervalId = window.setInterval(syncNotifications, 50)
    })
    
    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    })
    
    const containerClasses = computed(() => {
      return classNames(
        notificationContainerBaseClasses,
        notificationPositionClasses[props.position]
      )
    })
    
    const removeNotification = (id: string | number) => {
      const instances = notificationInstancesByPosition[props.position]
      const index = instances.findIndex(notif => notif.id === id)
      if (index !== -1) {
        const instance = instances[index]
        instances.splice(index, 1)
        if (instance.onClose) {
          instance.onClose()
        }
      }
      syncNotifications()
    }
    
    return () => {
      return h(
        Teleport,
        { to: 'body' },
        h(
          'div',
          {
            class: containerClasses.value,
            id: `${NOTIFICATION_CONTAINER_ID_PREFIX}-${props.position}`,
          },
          h(
            TransitionGroup,
            {
              name: 'notification',
              tag: 'div',
              class: 'flex flex-col gap-3',
            },
            () => notifications.value.map((notification) => {
              const colorScheme = getNotificationTypeClasses(notification.type, defaultNotificationThemeColors)
              
              const notificationClasses = classNames(
                notificationBaseClasses,
                colorScheme.border,
                notification.className
              )
              
              const iconPath = notification.icon || getNotificationIconPath(notification.type)
              const iconClass = classNames(notificationIconClasses, colorScheme.icon)
              
              const children = []
              
              // Icon
              children.push(
                createIcon(iconPath, iconClass)
              )
              
              // Content
              const contentChildren = []
              
              // Title
              contentChildren.push(
                h('div', { 
                  class: classNames(notificationTitleClasses, colorScheme.titleText) 
                }, notification.title)
              )
              
              // Description (if provided)
              if (notification.description) {
                contentChildren.push(
                  h('div', { 
                    class: classNames(notificationDescriptionClasses, colorScheme.descriptionText) 
                  }, notification.description)
                )
              }
              
              children.push(
                h('div', { class: notificationContentClasses }, contentChildren)
              )
              
              // Close button (if closable)
              if (notification.closable) {
                children.push(
                  h(
                    'button',
                    {
                      class: notificationCloseButtonClasses,
                      onClick: () => removeNotification(notification.id),
                      'aria-label': 'Close notification',
                      type: 'button',
                    },
                    createIcon(notificationCloseIconPath, 'w-5 h-5 text-gray-400 hover:text-gray-600')
                  )
                )
              }
              
              return h(
                'div',
                {
                  key: notification.id,
                  class: notificationClasses,
                  role: 'alert',
                  'aria-live': 'assertive',
                  'aria-atomic': 'true',
                  onClick: notification.onClick,
                  style: notification.onClick ? 'cursor: pointer;' : undefined,
                },
                children
              )
            })
          )
        )
      )
    }
  },
})

/**
 * Add a notification to the queue
 */
function addNotification(config: NotificationConfig): () => void {
  const id = getNextInstanceId()
  const position = config.position || 'top-right'
  
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
    position,
  }
  
  notificationInstancesByPosition[position].push(instance)
  
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
  const index = instances.findIndex(notif => notif.id === id)
  if (index !== -1) {
    const instance = instances[index]
    instances.splice(index, 1)
    if (instance.onClose) {
      instance.onClose()
    }
  }
}

/**
 * Clear all notifications for a position or all positions
 */
function clearAll(position?: NotificationPosition) {
  if (position) {
    notificationInstancesByPosition[position].forEach(instance => {
      if (instance.onClose) {
        instance.onClose()
      }
    })
    notificationInstancesByPosition[position] = []
  } else {
    // Clear all positions
    Object.keys(notificationInstancesByPosition).forEach((pos) => {
      const p = pos as NotificationPosition
      notificationInstancesByPosition[p].forEach(instance => {
        if (instance.onClose) {
          instance.onClose()
        }
      })
      notificationInstancesByPosition[p] = []
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
  },
}

export default notification
