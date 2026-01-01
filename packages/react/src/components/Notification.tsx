import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { createRoot, Root } from 'react-dom/client'
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
const containerRoots: Record<NotificationPosition, Root | null> = {
  'top-left': null,
  'top-right': null,
  'bottom-left': null,
  'bottom-right': null,
}
const updateCallbacks: Record<NotificationPosition, (() => void) | null> = {
  'top-left': null,
  'top-right': null,
  'bottom-left': null,
  'bottom-right': null,
}

/**
 * Get next instance id
 */
function getNextInstanceId(): number {
  return ++instanceIdCounter
}

/**
 * Icon component
 */
const Icon: React.FC<{ path: string; className: string }> = ({ path, className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={path}
      />
    </svg>
  )
}

/**
 * Single notification item component
 */
interface NotificationItemProps {
  notification: NotificationInstance
  onClose: (id: string | number) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])
  
  const colorScheme = useMemo(
    () => getNotificationTypeClasses(notification.type, defaultNotificationThemeColors),
    [notification.type]
  )
  
  const notificationClasses = useMemo(
    () => classNames(
      notificationBaseClasses,
      colorScheme.border,
      notification.className,
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    ),
    [colorScheme, notification.className, isVisible]
  )
  
  const iconPath = notification.icon || getNotificationIconPath(notification.type)
  const iconClass = classNames(notificationIconClasses, colorScheme.icon)
  
  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => onClose(notification.id), 300)
  }, [notification.id, onClose])
  
  const handleClick = useCallback(() => {
    if (notification.onClick) {
      notification.onClick()
    }
  }, [notification.onClick])
  
  return (
    <div 
      className={notificationClasses} 
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onClick={handleClick}
      style={notification.onClick ? { cursor: 'pointer' } : undefined}
    >
      <Icon path={iconPath} className={iconClass} />
      <div className={notificationContentClasses}>
        <div className={classNames(notificationTitleClasses, colorScheme.titleText)}>
          {notification.title}
        </div>
        {notification.description && (
          <div className={classNames(notificationDescriptionClasses, colorScheme.descriptionText)}>
            {notification.description}
          </div>
        )}
      </div>
      {notification.closable && (
        <button
          className={notificationCloseButtonClasses}
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          aria-label="Close notification"
          type="button"
        >
          <Icon path={notificationCloseIconPath} className="w-5 h-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  )
}

/**
 * Notification container props
 */
export interface NotificationContainerProps {
  position?: NotificationPosition
}

/**
 * Notification container component
 */
export const NotificationContainer: React.FC<NotificationContainerProps> = ({ 
  position = 'top-right' 
}) => {
  const [notifications, setNotifications] = useState<NotificationInstance[]>([])
  
  useEffect(() => {
    // Register update callback
    updateCallbacks[position] = () => {
      setNotifications([...notificationInstancesByPosition[position]])
    }
    
    // Initial sync
    updateCallbacks[position]!()
    
    return () => {
      updateCallbacks[position] = null
    }
  }, [position])
  
  const containerClasses = useMemo(
    () => classNames(
      notificationContainerBaseClasses,
      notificationPositionClasses[position]
    ),
    [position]
  )
  
  const handleRemove = useCallback((id: string | number) => {
    const instances = notificationInstancesByPosition[position]
    const index = instances.findIndex(notif => notif.id === id)
    if (index !== -1) {
      const instance = instances[index]
      instances.splice(index, 1)
      if (instance.onClose) {
        instance.onClose()
      }
      if (updateCallbacks[position]) {
        updateCallbacks[position]!()
      }
    }
  }, [position])
  
  return (
    <div className={containerClasses} id={`${NOTIFICATION_CONTAINER_ID_PREFIX}-${position}`}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={handleRemove}
        />
      ))}
    </div>
  )
}

/**
 * Ensure notification container exists for a position
 */
function ensureContainer(position: NotificationPosition) {
  const containerId = `${NOTIFICATION_CONTAINER_ID_PREFIX}-${position}`
  let container = document.getElementById(containerId)
  
  if (!container) {
    container = document.createElement('div')
    container.id = `${containerId}-root`
    document.body.appendChild(container)
    
    containerRoots[position] = createRoot(container)
    containerRoots[position]!.render(<NotificationContainer position={position} />)
  }
}

/**
 * Add a notification to the queue
 */
function addNotification(config: NotificationConfig): () => void {
  const position = config.position || 'top-right'
  ensureContainer(position)
  
  const id = getNextInstanceId()
  
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
  
  // Trigger update
  if (updateCallbacks[position]) {
    updateCallbacks[position]!()
  }
  
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
    if (updateCallbacks[position]) {
      updateCallbacks[position]!()
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
    if (updateCallbacks[position]) {
      updateCallbacks[position]!()
    }
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
      if (updateCallbacks[p]) {
        updateCallbacks[p]!()
      }
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
